/**
 * BulkAnnotationManager — framework-free orchestrator for deck.gl bulk ANN.
 *
 * Owns per-group registry, style (pre-hydration), visibility (sync state),
 * hydrate lifecycle with abort generations, decoded geometry caches, and the
 * deck layer list consumed by the OL overlay.
 *
 * Does NOT collide with `annotations/_AnnotationManager` (ROI markups).
 */

import dcmjs from 'dcmjs'

import {
  AnnotationGroup,
  getCommonZCoordinate,
  getCoordinateDimensionality,
} from '../annotation.js'
import publish from '../eventPublisher.js'
import EVENTS from '../events.js'
import {
  BULK_DEFAULT_ALPHA,
  BULK_DEFAULT_COLOR,
  BULK_LOD_DEFAULT_LEVELS_FROM_FINEST,
  BULK_LOD_MIN_ANNOTATIONS,
  BULK_PATH_STROKE_PX,
  BULK_POINT_RADIUS_MIN_PX,
  BULK_SPATIAL_TILE_SIZE,
  PATH_LOD_GRAPHIC_TYPES,
} from './constants.js'
import {
  computeMeasurementRange,
  expandMeasurementToPerVertex,
  fetchGraphicDataForGroup,
  fetchGraphicIndexForGroup,
  fetchMeasurementsForGroup,
  validateGraphicIndex,
} from './data/index.js'
import {
  affineForReferencedPyramidLevel,
  decodeGraphicGroup,
} from './geometry/index.js'
import {
  bucketAnnotations,
  buildTileSubviews,
} from './geometry/spatialTiles.js'
import {
  createBulkAnnotationDeck,
  createDeckOlLayer,
  disposeBulkAnnotationOverlay,
} from './overlay.js'
import {
  buildSpatialIndex,
  makeBulkAnnotationRoiUid,
  pickBulkAnnotation,
} from './picking.js'
import { rotationModelMatrix } from './viewState.js'

/** Lazy — keep deck.gl out of the VolumeImageViewer import graph for jsdom. */
let layerFactoriesPromise = null
function loadLayerFactories() {
  if (layerFactoriesPromise == null) {
    layerFactoriesPromise = import('./layers/index.js')
  }
  return layerFactoriesPromise
}

/** Screen-space pick tolerance, converted to world units per pick. */
const PICK_TOLERANCE_PX = 6

/**
 * @typedef {Object} GroupRecord
 * @property {AnnotationGroup} annotationGroup
 * @property {Object} metadata
 * @property {number} sequenceIndex - Index into AnnotationGroupSequence
 * @property {Object} style
 * @property {Object} defaultStyle
 * @property {boolean} visible
 * @property {boolean} hydrated
 * @property {number} hydrateGeneration
 * @property {AbortController|null} abortController
 * @property {Object|null} decoded
 * @property {Object|null} spatial
 * @property {Object|null} pickIndex
 * @property {Object|null} measurementRanges - `{ [codeValue]: { min, max } }`
 * @property {Array|null} measurements - Raw items from `fetchMeasurementsForGroup`
 * @property {Promise|null} measurementsPromise
 * @property {Object|null} deckData - Stable data object refs for layers
 * @property {Map|null} tileDataCache - Per-tile stable data objects
 * @property {Object|null} filterCache - Expanded per-vertex/per-annotation filter values
 * @property {string|null} buildSignature - View signature of the current layer build
 * @property {Array} deckLayers
 */

export class BulkAnnotationManager {
  /**
   * @param {Object} options
   * @param {() => import('ol/Map').default|null} options.getMap
   * @param {() => Object} options.getPyramid - `{ metadata, extent }`
   * @param {() => number[][]} options.getAffineInverse
   * @param {() => Object} options.getClient - dicomweb client for ANN
   * @param {() => HTMLElement|null} options.getContainer
   * @param {Object} [options.annotationOptions]
   * @param {Function} [options.errorInterceptor]
   * @param {number[]} [options.primaryColor]
   */
  constructor(options) {
    this._getMap = options.getMap
    this._getPyramid = options.getPyramid
    this._getAffineInverse = options.getAffineInverse
    this._getClient = options.getClient
    this._getContainer = options.getContainer
    this._errorInterceptor = options.errorInterceptor || ((e) => e)
    this._primaryColor = options.primaryColor || BULK_DEFAULT_COLOR
    this._annotationOptions = {
      lodLevelsFromFinest: BULK_LOD_DEFAULT_LEVELS_FROM_FINEST,
      ...(options.annotationOptions || {}),
    }

    /** @type {Map<string, GroupRecord>} */
    this._groups = new Map()
    this._deck = null
    this._olLayer = null
    this._overlayReady = false
    this._hydrateQueue = Promise.resolve()
    this._selected = null
    this._onMoveEnd = null
  }

  /** Ensure Deck + OL wrapper layer exist (lazy; safe in jsdom). */
  async ensureOverlay() {
    if (this._overlayReady) {
      return
    }
    if (this._overlayInitPromise) {
      return this._overlayInitPromise
    }
    this._overlayInitPromise = this._initOverlay()
    return this._overlayInitPromise
  }

  async _initOverlay() {
    const map = this._getMap()
    if (map == null) {
      return
    }
    const parent = map.getTargetElement?.() || this._getContainer()
    if (parent == null) {
      return
    }
    this._deck = await createBulkAnnotationDeck({
      parent,
      onError: (err) => {
        const container = this._getContainer()
        if (container) {
          publish(container, EVENTS.LOADING_ERROR, {
            message: err?.message || String(err),
          })
        }
      },
    })
    if (this._deck == null) {
      this._overlayReady = true
      return
    }
    this._olLayer = createDeckOlLayer({
      deck: this._deck,
      getLayers: () => this._collectDeckLayers(),
    })
    map.addLayer(this._olLayer)
    /**
     * LOD tier and the visible spatial-tile set depend on the view; refresh
     * layer builds when a pan/zoom/rotate interaction settles.
     */
    this._onMoveEnd = () => {
      this._refreshLayersForViewChange()
    }
    map.on('moveend', this._onMoveEnd)
    this._overlayReady = true
  }

  /**
   * Register annotation groups from Microscopy Bulk Simple Annotations metadata.
   * Indexes by sequence position (NOT AnnotationGroupNumber).
   *
   * @param {Object} metadata
   */
  addAnnotationGroups(metadata) {
    const sequence = metadata.AnnotationGroupSequence || []
    const bulkdataReferences = metadata.bulkdataReferences || {}
    const defaultStyle = {
      opacity: 1.0,
      color: this._primaryColor.slice(0, 3),
    }

    sequence.forEach((item, sequenceIndex) => {
      const annotationGroupUID = item.AnnotationGroupUID
      if (this._groups.has(annotationGroupUID)) {
        console.info('annotation group already added', annotationGroupUID)
        return
      }

      let color = defaultStyle.color
      if (
        item.RecommendedDisplayCIELabValue &&
        Array.isArray(item.RecommendedDisplayCIELabValue) &&
        item.RecommendedDisplayCIELabValue.length >= 3
      ) {
        try {
          const rgb = dcmjs.data.Colors.dicomlab2RGB(
            item.RecommendedDisplayCIELabValue,
          )
          color = [
            Math.max(0, Math.min(255, Math.round(rgb[0] * 255))),
            Math.max(0, Math.min(255, Math.round(rgb[1] * 255))),
            Math.max(0, Math.min(255, Math.round(rgb[2] * 255))),
          ]
        } catch {
          /* keep default */
        }
      }

      const annotationGroup = new AnnotationGroup({
        uid: annotationGroupUID,
        number: item.AnnotationGroupNumber ?? sequenceIndex + 1,
        label: item.AnnotationGroupLabel ?? `Group ${sequenceIndex + 1}`,
        algorithmType: item.AnnotationGroupGenerationType,
        algorithmName: item.AnnotationGroupAlgorithmIdentificationSequence
          ? item.AnnotationGroupAlgorithmIdentificationSequence[0].AlgorithmName
          : '',
        propertyCategory: item.AnnotationPropertyCategoryCodeSequence?.[0] || {
          CodeValue: 'unknown',
          CodeMeaning: 'Unknown',
          CodingSchemeDesignator: 'DCM',
        },
        propertyType: item.AnnotationPropertyTypeCodeSequence?.[0] || {
          CodeValue: 'unknown',
          CodeMeaning: 'Unknown',
          CodingSchemeDesignator: 'DCM',
        },
        studyInstanceUID: metadata.StudyInstanceUID,
        seriesInstanceUID: metadata.SeriesInstanceUID,
        sopInstanceUIDs: [metadata.SOPInstanceUID],
        referencedSeriesInstanceUID:
          metadata.ReferencedSeriesSequence?.[0]?.SeriesInstanceUID,
        referencedSOPInstanceUID:
          metadata.ReferencedImageSequence?.[0]?.ReferencedSOPInstanceUID,
      })

      /** @type {GroupRecord} */
      const record = {
        annotationGroup,
        metadata,
        sequenceIndex,
        bulkdataItem:
          bulkdataReferences.AnnotationGroupSequence?.[sequenceIndex],
        metadataItem: item,
        style: { opacity: defaultStyle.opacity, color },
        defaultStyle: { opacity: defaultStyle.opacity, color },
        visible: false,
        hydrated: false,
        hydrateGeneration: 0,
        abortController: null,
        decoded: null,
        spatial: null,
        pickIndex: null,
        measurementRanges: null,
        measurements: null,
        measurementsPromise: null,
        deckData: null,
        tileDataCache: null,
        filterCache: null,
        buildSignature: null,
        deckLayers: [],
        rawGraphicData: null,
        rawGraphicIndex: null,
      }
      this._groups.set(annotationGroupUID, record)
    })
  }

  getAllAnnotationGroups() {
    return Array.from(this._groups.values()).map((g) => g.annotationGroup)
  }

  getAnnotationGroupStyle(uid) {
    const g = this._requireGroup(uid)
    return { opacity: g.style.opacity, color: g.style.color }
  }

  getAnnotationGroupDefaultStyle(uid) {
    const g = this._requireGroup(uid)
    return { opacity: g.defaultStyle.opacity, color: g.defaultStyle.color }
  }

  getAnnotationGroupMetadata(uid) {
    return this._requireGroup(uid).metadata
  }

  /**
   * Measurement value range for a group, or `null` when the measurement values
   * have not been fetched yet (a fetch is kicked off in that case, so a later
   * call — or the automatic layer rebuild — picks up the real range).
   *
   * @param {string} uid
   * @param {Object} [measurement] - Coded concept (`CodeValue` or dcmjs `value`)
   * @returns {{ min: number, max: number } | null}
   */
  getAnnotationGroupMeasurementRange(uid, measurement) {
    const g = this._requireGroup(uid)
    if (g.measurementRanges == null) {
      this._ensureMeasurements(g)
      return null
    }
    const key = this._measurementKey(measurement)
    return key != null && g.measurementRanges[key] != null
      ? { ...g.measurementRanges[key] }
      : null
  }

  setAnnotationGroupStyle(uid, styleOptions = {}) {
    const g = this._requireGroup(uid)
    if (styleOptions.opacity != null) {
      g.style.opacity = styleOptions.opacity
    }
    if (styleOptions.color != null) {
      g.style.color = styleOptions.color
    }
    if ('measurement' in styleOptions) {
      g.style.measurement = styleOptions.measurement ?? undefined
    }
    if (styleOptions.limitValues != null) {
      g.style.limitValues = styleOptions.limitValues
    }
    if (g.style.measurement != null) {
      this._ensureMeasurements(g)
    }
    if (g.hydrated) {
      this._rebuildLayersForGroup(g)
    }
  }

  setAnnotationOptions(options = {}) {
    if ('clusteringPixelSizeThreshold' in options) {
      console.warn(
        '[bulkAnnotations] clusteringPixelSizeThreshold is deprecated; ' +
          'use annotationOptions.lodLevelsFromFinest for LOD control.',
      )
      this._annotationOptions.clusteringPixelSizeThreshold =
        options.clusteringPixelSizeThreshold
    }
    if ('lodLevelsFromFinest' in options) {
      this._annotationOptions.lodLevelsFromFinest = options.lodLevelsFromFinest
    }
    this._refreshLayersForViewChange()
  }

  isAnnotationGroupVisible(uid) {
    return this._requireGroup(uid).visible
  }

  showAnnotationGroup(uid, styleOptions = {}) {
    const g = this._requireGroup(uid)
    if (styleOptions && Object.keys(styleOptions).length > 0) {
      this.setAnnotationGroupStyle(uid, styleOptions)
    }
    g.visible = true
    this.ensureOverlay().then(() => {
      if (!g.hydrated) {
        this._enqueueHydrate(uid)
      } else {
        this._rebuildLayersForGroup(g)
      }
    })
  }

  hideAnnotationGroup(uid) {
    const g = this._requireGroup(uid)
    g.visible = false
    g.hydrateGeneration += 1
    if (g.abortController) {
      try {
        g.abortController.abort()
      } catch {
        /* ignore */
      }
      g.abortController = null
    }
    /** Keep raw/decoded buffers for cheap re-toggle; drop GPU layers + copies. */
    g.deckLayers = []
    g.deckData = null
    g.tileDataCache = null
    g.filterCache = null
    g.buildSignature = null
    this._requestRender()
  }

  removeAnnotationGroup(uid) {
    const g = this._requireGroup(uid)
    g.hydrateGeneration += 1
    if (g.abortController) {
      try {
        g.abortController.abort()
      } catch {
        /* ignore */
      }
    }
    this._groups.delete(uid)
    this._requestRender()
  }

  removeAllAnnotationGroups() {
    for (const uid of Array.from(this._groups.keys())) {
      this.removeAnnotationGroup(uid)
    }
  }

  /**
   * Zoom to first annotation of a group (parity with prior OL behavior: 7× extent).
   *
   * @param {string} uid
   * @returns {boolean} true if zoomed
   */
  zoomToAnnotationGroup(uid) {
    const g = this._groups.get(uid)
    if (g == null || !g.hydrated || g.decoded == null) {
      console.warn(`Could not find a ROI with UID "${uid}" to zoom to.`)
      return false
    }
    const map = this._getMap()
    if (map == null) {
      return false
    }
    const { bboxes } = g.decoded
    if (bboxes == null || bboxes.length < 4) {
      return false
    }
    const minX = bboxes[0]
    const minY = bboxes[1]
    const maxX = bboxes[2]
    const maxY = bboxes[3]
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    const width = (maxX - minX) * 7
    const height = (maxY - minY) * 7
    const extent = [
      centerX - width / 2,
      centerY - height / 2,
      centerX + width / 2,
      centerY + height / 2,
    ]
    // biome-ignore lint/suspicious/noFocusedTests: OL View#fit, not a focused test — the unsafe autofix rewrites it to `.it(` and breaks zoom.
    map.getView().fit(extent, { duration: 500 })
    return true
  }

  /**
   * Pick at an OL map coordinate for event merging.
   *
   * @param {number[]} coordinate - OL map coordinate
   * @param {number} [hitToleranceWorld] - World-unit tolerance; defaults to
   * `PICK_TOLERANCE_PX` screen pixels at the current view resolution.
   * @returns {{ annotationGroupUID: string, annotationIndex: number, roiUid: string } | null}
   */
  pickAtMapCoordinate(coordinate, hitToleranceWorld) {
    let tolerance = hitToleranceWorld
    if (tolerance == null) {
      const resolution = this._getMap()?.getView?.()?.getResolution?.()
      tolerance =
        resolution != null && resolution > 0
          ? PICK_TOLERANCE_PX * resolution
          : PICK_TOLERANCE_PX
    }
    const groups = []
    for (const g of this._groups.values()) {
      if (!g.visible || !g.hydrated || g.decoded == null) {
        continue
      }
      groups.push({
        uid: g.annotationGroup.uid,
        graphicType: g.decoded.graphicType,
        index: g.pickIndex,
        positions: g.decoded.positions,
        startIndices: g.decoded.startIndices,
        numberOfAnnotations: g.decoded.numberOfAnnotations,
        visible: true,
      })
    }
    const hit = pickBulkAnnotation({
      x: coordinate[0],
      y: coordinate[1],
      hitToleranceWorld: tolerance,
      groups,
    })
    if (hit == null) {
      return null
    }
    return {
      ...hit,
      roiUid: makeBulkAnnotationRoiUid(
        hit.annotationGroupUID,
        hit.annotationIndex,
      ),
    }
  }

  getGroupRecord(uid) {
    return this._groups.get(uid) || null
  }

  cleanup() {
    for (const uid of Array.from(this._groups.keys())) {
      this.removeAnnotationGroup(uid)
    }
    const map = this._getMap()
    if (map != null && this._onMoveEnd != null) {
      map.un('moveend', this._onMoveEnd)
      this._onMoveEnd = null
    }
    disposeBulkAnnotationOverlay({
      deck: this._deck,
      olLayer: this._olLayer,
      map,
    })
    this._deck = null
    this._olLayer = null
    this._overlayReady = false
    this._overlayInitPromise = null
  }

  _requireGroup(uid) {
    const g = this._groups.get(uid)
    if (g == null) {
      const error = new Error(`Could not find annotation group "${uid}".`)
      throw this._errorInterceptor(error)
    }
    return g
  }

  /** Ask OL for a render frame so a changed deck layer list actually paints. */
  _requestRender() {
    if (this._olLayer != null) {
      this._olLayer.changed()
    }
    this._getMap()?.render?.()
  }

  _enqueueHydrate(uid) {
    this._hydrateQueue = this._hydrateQueue
      .then(() => this._hydrateGroup(uid))
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return
        }
        console.error('[bulkAnnotations] hydrate failed', uid, error)
        const container = this._getContainer()
        if (container) {
          publish(container, EVENTS.LOADING_ERROR, {
            message: error?.message || String(error),
          })
        }
      })
  }

  async _hydrateGroup(uid) {
    const g = this._groups.get(uid)
    if (g == null || !g.visible) {
      return
    }
    g.hydrateGeneration += 1
    const gen = g.hydrateGeneration
    if (g.abortController) {
      try {
        g.abortController.abort()
      } catch {
        /* ignore */
      }
    }
    g.abortController = new AbortController()
    const { signal } = g.abortController

    const container = this._getContainer()
    if (container) {
      publish(container, EVENTS.LOADING_STARTED, { annotationGroupUID: uid })
    }

    const client = this._getClient()
    const { metadata, metadataItem, bulkdataItem, sequenceIndex } = g
    const numberOfAnnotations = Number(metadataItem.NumberOfAnnotations)
    const graphicType = metadataItem.GraphicType
    const coordinateDimensionality = getCoordinateDimensionality(
      metadataItem,
      metadata.AnnotationCoordinateType,
    )
    const commonZCoordinate = getCommonZCoordinate(metadataItem)

    const graphicIndex = await fetchGraphicIndexForGroup({
      metadata,
      annotationGroupIndex: sequenceIndex,
      metadataItem,
      bulkdataItem,
      client,
    })
    if (gen !== g.hydrateGeneration || !g.visible) {
      return
    }

    if (graphicIndex) {
      const validation = validateGraphicIndex(
        graphicIndex,
        numberOfAnnotations,
        coordinateDimensionality,
      )
      if (!validation.ok) {
        console.warn(
          '[bulkAnnotations] graphicIndex validation warnings',
          validation.errors,
        )
      }
    }

    /** Streams progressively when eligible; falls back to monolithic. */
    const graphicData = await fetchGraphicDataForGroup({
      metadata,
      annotationGroupIndex: sequenceIndex,
      metadataItem,
      bulkdataItem,
      client,
      graphicIndex,
      numberOfAnnotations,
      signal,
      baseUrl: client?.wadoURL || client?.url,
      headers: client?.headers ?? {},
    })

    if (gen !== g.hydrateGeneration || !g.visible) {
      return
    }

    const pyramid = this._getPyramid()
    const affineInverse = this._getAffineInverse()
    const coeffs = affineForReferencedPyramidLevel({
      pyramid: pyramid.metadata,
      annotationGroup: metadataItem,
      metadata,
      baseAffineInverse: affineInverse,
    })

    const decoded = decodeGraphicGroup({
      graphicType,
      graphicData,
      graphicIndex,
      coordinateDimensionality,
      commonZCoordinate,
      numberOfAnnotations,
      coeffs,
      annotationCoordinateType: metadata.AnnotationCoordinateType,
      shouldContinue: () => gen === g.hydrateGeneration && g.visible,
    })

    if (gen !== g.hydrateGeneration || !g.visible) {
      return
    }

    g.rawGraphicData = graphicData
    g.rawGraphicIndex = graphicIndex
    g.decoded = decoded
    g.spatial = bucketAnnotations({
      centroids: decoded.centroids,
      numberOfAnnotations: decoded.numberOfAnnotations,
      tileSizeWorld: BULK_SPATIAL_TILE_SIZE,
    })
    g.pickIndex = buildSpatialIndex(decoded.bboxes, decoded.numberOfAnnotations)
    g.hydrated = true
    this._rebuildLayersForGroup(g)
    /** Warm the measurement cache so range lookups / filters resolve quickly. */
    this._ensureMeasurements(g)

    if (container) {
      publish(container, EVENTS.LOADING_ENDED, { annotationGroupUID: uid })
    }
  }

  /**
   * Lazily fetch measurement values for a group (once), computing ranges and
   * re-applying a pending measurement filter when it resolves.
   *
   * @param {GroupRecord} g
   * @returns {Promise|null}
   */
  _ensureMeasurements(g) {
    if (g.measurements != null || g.measurementsPromise != null) {
      return g.measurementsPromise
    }
    if (g.metadataItem?.MeasurementsSequence == null) {
      g.measurements = []
      g.measurementRanges = {}
      return null
    }
    g.measurementsPromise = fetchMeasurementsForGroup({
      metadataItem: g.metadataItem,
      bulkdataItem: g.bulkdataItem,
      metadata: g.metadata,
      annotationGroupIndex: g.sequenceIndex,
      client: this._getClient(),
    })
      .then((items) => {
        g.measurements = items ?? []
        g.measurementRanges = {}
        for (const item of g.measurements) {
          const key = item?.name?.CodeValue
          if (key != null) {
            g.measurementRanges[key] = computeMeasurementRange(
              item.values ?? [],
            )
          }
        }
        if (g.visible && g.hydrated && g.style.measurement != null) {
          this._rebuildLayersForGroup(g)
        }
        return g.measurements
      })
      .catch((error) => {
        console.warn('[bulkAnnotations] measurement fetch failed', error)
        g.measurementsPromise = null
        return null
      })
    return g.measurementsPromise
  }

  _measurementKey(measurement) {
    if (measurement == null) {
      return null
    }
    return (
      measurement.CodeValue ??
      measurement.value ??
      measurement.codeValue ??
      null
    )
  }

  /**
   * Resolve the active measurement filter for a group: per-annotation values,
   * a per-vertex expansion (cached), and the `[min, max]` filter range.
   *
   * @param {GroupRecord} g
   * @returns {{ perAnnotation: Float32Array, perVertex: Float32Array, range: [number, number], key: string } | null}
   */
  _activeFilter(g) {
    const key = this._measurementKey(g.style.measurement)
    if (key == null) {
      /** Measurement deselected: drop filter attributes from cached data. */
      if (g.filterCache != null) {
        g.filterCache = null
        g.deckData = null
        g.tileDataCache = null
      }
      return null
    }
    if (g.measurements == null || g.decoded == null) {
      return null
    }
    const item = g.measurements.find((m) => m?.name?.CodeValue === key)
    if (item == null || item.values == null) {
      return null
    }
    if (g.filterCache?.key !== key) {
      const perAnnotation = Float32Array.from(item.values, (v) => Number(v))
      const perVertex = expandMeasurementToPerVertex(
        perAnnotation,
        g.decoded.startIndices,
        g.decoded.vertexCount,
      )
      g.filterCache = { key, perAnnotation, perVertex }
      /** Filter attribute changes invalidate cached data objects. */
      g.deckData = null
      g.tileDataCache = null
    }
    const stored = g.measurementRanges?.[key]
    const range =
      g.style.limitValues != null && g.style.limitValues.length === 2
        ? [Number(g.style.limitValues[0]), Number(g.style.limitValues[1])]
        : [stored?.min ?? 0, stored?.max ?? 1]
    return {
      perAnnotation: g.filterCache.perAnnotation,
      perVertex: g.filterCache.perVertex,
      range,
      key,
    }
  }

  _isHighResolution() {
    const map = this._getMap()
    if (map == null) {
      return true
    }
    const view = map.getView()
    const pyramid = this._getPyramid()
    const levels = pyramid?.metadata?.length || 1
    const resolution = view.getResolution()
    const zoom = resolution > 0 ? -Math.log2(resolution) : 0
    const levelsFromFinest =
      this._annotationOptions.lodLevelsFromFinest ??
      BULK_LOD_DEFAULT_LEVELS_FROM_FINEST
    /** Approximate tileZ in Viv convention: 0 = finest. */
    const tileZ = Math.min(0, Math.max(-(levels - 1), Math.ceil(zoom)))
    return tileZ >= -levelsFromFinest
  }

  _viewRotation() {
    return this._getMap()?.getView?.()?.getRotation?.() ?? 0
  }

  /** Tile keys of a group's spatial buckets intersecting the given extent. */
  _visibleTileKeys(g, extent) {
    if (g.spatial == null || extent == null) {
      return []
    }
    const [minX, minY, maxX, maxY] = extent
    const keys = []
    for (const [key, bounds] of g.spatial.tileBounds) {
      const [tMinX, tMinY, tMaxX, tMaxY] = bounds
      if (tMaxX < minX || tMinX > maxX || tMaxY < minY || tMinY > maxY) {
        continue
      }
      keys.push(key)
    }
    return keys
  }

  /**
   * Signature of the view-dependent inputs of a group's layer build. When it
   * changes (pan/zoom/rotate), the group's layers must be rebuilt.
   *
   * @param {GroupRecord} g
   * @returns {string}
   */
  _computeBuildSignature(g) {
    const view = this._getMap()?.getView?.()
    const extent = view?.calculateExtent?.()
    const highRes = this._isHighResolution() ? 1 : 0
    const rotation = this._viewRotation()
    const tileKeys = this._visibleTileKeys(g, extent)
    return `${highRes}|${rotation.toFixed(6)}|${tileKeys.join(',')}`
  }

  /** Rebuild layers of visible hydrated groups whose view signature changed. */
  _refreshLayersForViewChange() {
    for (const g of this._groups.values()) {
      if (!g.visible || !g.hydrated || g.decoded == null) {
        continue
      }
      const signature = this._computeBuildSignature(g)
      if (signature !== g.buildSignature) {
        this._rebuildLayersForGroup(g)
      }
    }
  }

  _rebuildLayersForGroup(g) {
    if (!g.hydrated || g.decoded == null || !g.visible) {
      g.deckLayers = []
      this._requestRender()
      return
    }
    this._rebuildLayersForGroupAsync(g).catch((error) => {
      console.error('[bulkAnnotations] layer rebuild failed', error)
    })
  }

  async _rebuildLayersForGroupAsync(g) {
    if (!g.hydrated || g.decoded == null || !g.visible) {
      g.deckLayers = []
      this._requestRender()
      return
    }
    const { createLineStripLayer, createPathLayer, createPointLayer } =
      await loadLayerFactories()
    if (!g.visible || g.decoded == null) {
      return
    }
    const signature = this._computeBuildSignature(g)
    const {
      positions,
      startIndices,
      centroids,
      numberOfAnnotations,
      graphicType,
    } = g.decoded
    const rgba = [
      g.style.color[0],
      g.style.color[1],
      g.style.color[2],
      Math.round(
        Math.max(0, Math.min(1, g.style.opacity ?? 1)) * BULK_DEFAULT_ALPHA,
      ),
    ]
    const uid = g.annotationGroup.uid
    const useLod =
      PATH_LOD_GRAPHIC_TYPES.has(graphicType) &&
      numberOfAnnotations > BULK_LOD_MIN_ANNOTATIONS
    const highRes = !useLod || this._isHighResolution()
    const modelMatrix = rotationModelMatrix(this._viewRotation())
    const filter = this._activeFilter(g)

    /**
     * Stable data objects: deck compares `data` by reference, so reusing the
     * same objects across rebuilds (e.g. opacity/color changes) skips
     * re-tessellation and attribute re-upload.
     */
    if (g.deckData == null) {
      g.deckData = {
        centroids: {
          length: numberOfAnnotations,
          attributes: {
            getPosition: { value: centroids, size: 2 },
            ...(filter != null
              ? { getFilterValue: { value: filter.perAnnotation, size: 1 } }
              : {}),
          },
        },
        fullPaths: {
          length: numberOfAnnotations,
          startIndices,
          attributes: {
            getPath: { value: positions, size: 2 },
            positions: null,
            ...(filter != null
              ? { getFilterValue: { value: filter.perVertex, size: 1 } }
              : {}),
          },
        },
      }
    }

    const layers = []
    if (graphicType === 'POINT' || (useLod && !highRes)) {
      layers.push(
        createPointLayer({
          id: `bulk-${uid}-centers`,
          data: g.deckData.centroids,
          color: rgba,
          radiusPixels: BULK_POINT_RADIUS_MIN_PX,
          visible: true,
          modelMatrix,
          ...(filter != null ? { filterRange: filter.range } : {}),
        }),
      )
    }

    if (graphicType !== 'POINT' && (!useLod || highRes)) {
      const map = this._getMap()
      const view = map?.getView()
      const extent = view?.calculateExtent?.()
      const tileLayers = this._layersForVisibleTiles(
        g,
        rgba,
        extent,
        createPathLayer,
        createLineStripLayer,
        modelMatrix,
        filter,
      )
      if (tileLayers.length > 0) {
        layers.push(...tileLayers)
      } else {
        layers.push(
          createPathLayer({
            id: `bulk-${uid}-paths`,
            data: g.deckData.fullPaths,
            color: rgba,
            widthPixels: BULK_PATH_STROKE_PX,
            visible: true,
            modelMatrix,
            ...(filter != null ? { filterRange: filter.range } : {}),
          }),
        )
      }
    }

    g.deckLayers = layers
    g.buildSignature = signature
    this._requestRender()
  }

  _layersForVisibleTiles(
    g,
    rgba,
    extent,
    createPathLayer,
    createLineStripLayer,
    modelMatrix,
    filter,
  ) {
    if (g.spatial == null || extent == null) {
      return []
    }
    if (g.tileDataCache == null) {
      g.tileDataCache = new Map()
    }
    const out = []
    for (const key of this._visibleTileKeys(g, extent)) {
      const annotationIndices = g.spatial.tileAnnotationIndices.get(key)
      if (annotationIndices == null || annotationIndices.length === 0) {
        continue
      }
      let tileData = g.tileDataCache.get(key)
      if (tileData == null) {
        const sub = buildTileSubviews({
          positions: g.decoded.positions,
          startIndices: g.decoded.startIndices,
          annotationIndices,
        })
        let tileFilterValues = null
        if (filter != null) {
          tileFilterValues = expandMeasurementToPerVertex(
            Float32Array.from(
              annotationIndices,
              (annotationIndex) => filter.perAnnotation[annotationIndex],
            ),
            sub.startIndices,
            sub.positions.length / 2,
          )
        }
        tileData = {
          length: annotationIndices.length,
          startIndices: sub.startIndices,
          attributes: {
            getPath: { value: sub.positions, size: 2 },
            positions: null,
            ...(tileFilterValues != null
              ? { getFilterValue: { value: tileFilterValues, size: 1 } }
              : {}),
          },
        }
        g.tileDataCache.set(key, tileData)
      }
      const useStyled =
        annotationIndices.length < 50_000 && this._isHighResolution()
      out.push(
        useStyled
          ? createPathLayer({
              id: `bulk-${g.annotationGroup.uid}-tile-${key}`,
              data: tileData,
              color: rgba,
              widthPixels: BULK_PATH_STROKE_PX,
              visible: true,
              modelMatrix,
              ...(filter != null ? { filterRange: filter.range } : {}),
            })
          : createLineStripLayer({
              id: `bulk-${g.annotationGroup.uid}-tile-${key}`,
              data: tileData,
              color: rgba,
              visible: true,
              modelMatrix,
            }),
      )
    }
    return out
  }

  _collectDeckLayers() {
    const layers = []
    for (const g of this._groups.values()) {
      if (g.visible && g.deckLayers?.length) {
        layers.push(...g.deckLayers)
      }
    }
    return layers
  }
}

export default BulkAnnotationManager
