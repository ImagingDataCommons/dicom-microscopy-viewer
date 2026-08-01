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
  fetchGraphicData,
  fetchGraphicIndex,
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
  browserSupportsBulkStreaming,
  isMonotonicGraphicIndex,
  resolveStreamableGraphicDataReference,
  streamBulkGraphicData,
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
  createLineStripLayer,
  createPathLayer,
  createPointLayer,
} from './layers/index.js'
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
 * @property {Object|null} measurementRanges
 * @property {Array|null} measurementValues
 * @property {Object|null} deckData - Stable data object refs for layers
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
  }

  /** Ensure Deck + OL wrapper layer exist (lazy; safe in jsdom). */
  ensureOverlay() {
    if (this._overlayReady) {
      return
    }
    const map = this._getMap()
    if (map == null) {
      return
    }
    const parent = map.getTargetElement?.() || this._getContainer()
    if (parent == null) {
      return
    }
    this._deck = createBulkAnnotationDeck({
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
        measurementValues: null,
        deckData: null,
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

  getAnnotationGroupMeasurementRange(uid, measurement) {
    const g = this._requireGroup(uid)
    if (g.measurementRanges == null) {
      return { min: 0, max: 1000 }
    }
    const key =
      measurement?.CodeValue ||
      measurement?.codeValue ||
      measurement?.value ||
      String(measurement)
    return g.measurementRanges[key] || { min: 0, max: 1000 }
  }

  setAnnotationGroupStyle(uid, styleOptions = {}) {
    const g = this._requireGroup(uid)
    if (styleOptions.opacity != null) {
      g.style.opacity = styleOptions.opacity
    }
    if (styleOptions.color != null) {
      g.style.color = styleOptions.color
    }
    if (styleOptions.measurement != null) {
      g.style.measurement = styleOptions.measurement
    }
    if (styleOptions.limitValues != null) {
      g.style.limitValues = styleOptions.limitValues
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
    this.ensureOverlay()
    if (!g.hydrated) {
      this._enqueueHydrate(uid)
    } else {
      this._rebuildLayersForGroup(g)
    }
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
    /** Keep raw/decoded buffers for cheap re-toggle; drop GPU layers. */
    g.deckLayers = []
    g.deckData = null
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
    map.getView().it(extent, { duration: 500 })
    return true
  }

  /**
   * Pick at an OL map coordinate for event merging.
   *
   * @returns {{ annotationGroupUID: string, annotationIndex: number, roiUid: string } | null}
   */
  pickAtMapCoordinate(coordinate, hitToleranceWorld = 2) {
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
      hitToleranceWorld,
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
    disposeBulkAnnotationOverlay({
      deck: this._deck,
      olLayer: this._olLayer,
      map,
    })
    this._deck = null
    this._olLayer = null
    this._overlayReady = false
  }

  _requireGroup(uid) {
    const g = this._groups.get(uid)
    if (g == null) {
      const error = new Error(`Could not find annotation group "${uid}".`)
      throw this._errorInterceptor(error)
    }
    return g
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

    const graphicIndex = await fetchGraphicIndex({
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

    let graphicData
    const streamRef = resolveStreamableGraphicDataReference({
      metadataItem,
      bulkdataItem,
    })
    const canStream =
      browserSupportsBulkStreaming() &&
      streamRef != null &&
      graphicIndex != null &&
      isMonotonicGraphicIndex(graphicIndex, numberOfAnnotations) &&
      ['POINT', 'POLYGON', 'POLYLINE', 'RECTANGLE', 'ELLIPSE'].includes(
        graphicType,
      )

    if (canStream) {
      try {
        graphicData = await streamBulkGraphicData({
          url: streamRef.BulkDataURI,
          vr: streamRef.vr,
          graphicIndex,
          numberOfAnnotations,
          signal,
          retrieveBulkData: client.retrieveBulkData?.bind(client),
          headers: client.headers,
          baseUrl: client.wadoURL || client.url,
        })
      } catch (error) {
        if (signal.aborted || error?.name === 'AbortError') {
          throw error
        }
        console.warn(
          '[bulkAnnotations] streaming failed; falling back to monolithic',
          error,
        )
        graphicData = await fetchGraphicData({
          metadata,
          annotationGroupIndex: sequenceIndex,
          metadataItem,
          bulkdataItem,
          client,
        })
      }
    } else {
      graphicData = await fetchGraphicData({
        metadata,
        annotationGroupIndex: sequenceIndex,
        metadataItem,
        bulkdataItem,
        client,
      })
    }

    if (gen !== g.hydrateGeneration || !g.visible) {
      return
    }

    const pyramid = this._getPyramid()
    const affineInverse = this._getAffineInverse()
    const { coeffs } = affineForReferencedPyramidLevel({
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

    if (container) {
      publish(container, EVENTS.LOADING_ENDED, { annotationGroupUID: uid })
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

  _rebuildLayersForGroup(g) {
    if (!g.hydrated || g.decoded == null || !g.visible) {
      g.deckLayers = []
      return
    }
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

    /** Stable data object — reference equality across rebuilds. */
    if (g.deckData == null) {
      g.deckData = {
        centroids: {
          length: numberOfAnnotations,
          attributes: {
            getPosition: { value: centroids, size: 2 },
          },
        },
        fullPaths: {
          length: numberOfAnnotations,
          startIndices,
          attributes: {
            getPath: { value: positions, size: 2 },
            /** Inert key — neutralize PathTesselator dead scratch. */
            positions: null,
          },
        },
      }
    }

    const layers = []
    if (graphicType === 'POINT' || (useLod && !highRes)) {
      layers.push(
        createPointLayer({
          id: `bulk-${uid}-centers`,
          positions: centroids,
          length: numberOfAnnotations,
          color: rgba,
          radiusPixels: BULK_POINT_RADIUS_MIN_PX,
          visible: true,
        }),
      )
    }

    if (graphicType !== 'POINT' && (!useLod || highRes)) {
      const map = this._getMap()
      const view = map?.getView()
      const extent = view?.calculateExtent?.()
      const tileLayers = this._layersForVisibleTiles(g, rgba, extent)
      if (tileLayers.length > 0) {
        layers.push(...tileLayers)
      } else {
        layers.push(
          createPathLayer({
            id: `bulk-${uid}-paths`,
            positions,
            startIndices,
            length: numberOfAnnotations,
            color: rgba,
            widthPixels: BULK_PATH_STROKE_PX,
            visible: true,
          }),
        )
      }
    }

    g.deckLayers = layers
  }

  _layersForVisibleTiles(g, rgba, extent) {
    if (g.spatial == null || extent == null) {
      return []
    }
    const [minX, minY, maxX, maxY] = extent
    const out = []
    let tileIndex = 0
    for (const [key, bounds] of g.spatial.tileBounds) {
      const [tMinX, tMinY, tMaxX, tMaxY] = bounds
      if (tMaxX < minX || tMinX > maxX || tMaxY < minY || tMinY > maxY) {
        continue
      }
      const annotationIndices = g.spatial.tileAnnotationIndices.get(key)
      if (annotationIndices == null || annotationIndices.length === 0) {
        continue
      }
      const sub = buildTileSubviews({
        positions: g.decoded.positions,
        startIndices: g.decoded.startIndices,
        annotationIndices,
      })
      const useStyled =
        annotationIndices.length < 50_000 && this._isHighResolution()
      out.push(
        useStyled
          ? createPathLayer({
              id: `bulk-${g.annotationGroup.uid}-tile-${tileIndex}`,
              positions: sub.positions,
              startIndices: sub.startIndices,
              length: annotationIndices.length,
              color: rgba,
              widthPixels: BULK_PATH_STROKE_PX,
              visible: true,
            })
          : createLineStripLayer({
              id: `bulk-${g.annotationGroup.uid}-tile-${tileIndex}`,
              positions: sub.positions,
              startIndices: sub.startIndices,
              length: annotationIndices.length,
              color: rgba,
              visible: true,
            }),
      )
      tileIndex += 1
    }
    return out
  }

  _collectDeckLayers() {
    /** Refresh LOD / tile visibility from current view. */
    for (const g of this._groups.values()) {
      if (g.visible && g.hydrated) {
        this._rebuildLayersForGroup(g)
      }
    }
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
