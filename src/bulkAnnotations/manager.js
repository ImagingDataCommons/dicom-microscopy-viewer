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
  BULK_DEFAULT_FILL_OPACITY,
  BULK_DEFAULT_FILLED,
  BULK_FILL_BATCH_SIZE,
  BULK_FILL_INSTANT_MAX,
  BULK_LOD_DEFAULT_LEVELS_FROM_FINEST,
  BULK_LOD_MIN_ANNOTATIONS,
  BULK_LOD_MIN_VERTICES,
  BULK_PATH_STROKE_PX,
  BULK_POINT_RADIUS_MIN_PX,
  BULK_SPATIAL_TILE_SIZE,
  BULK_STYLE_DEBOUNCE_MS,
  BULK_TILE_CACHE_MAX_SIZE,
  CLOSED_GRAPHIC_TYPES,
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
import { profiler as localProfiler } from './profiler.js'
import { rotationModelMatrix } from './viewState.js'

/**
 * Use window.__bulkAnnProfiler if available (it's the singleton enabled via URL),
 * otherwise fall back to the local import. This handles module duplication
 * across webpack chunks.
 */
const getProfiler = () =>
  typeof window !== 'undefined' && window.__bulkAnnProfiler
    ? window.__bulkAnnProfiler
    : localProfiler

/**
 * Simple LRU cache with maximum size limit.
 * Uses Map's insertion order for LRU tracking.
 */
class LRUCache {
  constructor(maxSize) {
    this._maxSize = maxSize
    this._cache = new Map()
  }

  get(key) {
    if (!this._cache.has(key)) {
      return undefined
    }
    // Move to end (most recently used) by delete + re-insert
    const value = this._cache.get(key)
    this._cache.delete(key)
    this._cache.set(key, value)
    return value
  }

  set(key, value) {
    // Remove if exists (to update insertion order)
    if (this._cache.has(key)) {
      this._cache.delete(key)
    }
    this._cache.set(key, value)
    // Evict oldest entries if over limit
    while (this._cache.size > this._maxSize) {
      const oldestKey = this._cache.keys().next().value
      this._cache.delete(oldestKey)
    }
  }

  has(key) {
    return this._cache.has(key)
  }

  delete(key) {
    return this._cache.delete(key)
  }

  clear() {
    this._cache.clear()
  }

  get size() {
    return this._cache.size
  }

  keys() {
    return this._cache.keys()
  }

  values() {
    return this._cache.values()
  }

  entries() {
    return this._cache.entries()
  }

  forEach(callback, thisArg) {
    this._cache.forEach(callback, thisArg)
  }

  [Symbol.iterator]() {
    return this._cache[Symbol.iterator]()
  }
}

/**
 * Creates a debounced function that delays invoking func until after wait ms
 * have elapsed since the last time the debounced function was invoked.
 */
function debounce(func, wait) {
  let timeoutId = null
  const debounced = function (...args) {
    if (timeoutId != null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      timeoutId = null
      func.apply(this, args)
    }, wait)
  }
  debounced.cancel = () => {
    if (timeoutId != null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  debounced.flush = function () {
    if (timeoutId != null) {
      clearTimeout(timeoutId)
      timeoutId = null
      func.apply(this)
    }
  }
  return debounced
}

/**
 * Compare two color arrays for equality.
 * @param {number[]|null|undefined} a
 * @param {number[]|null|undefined} b
 * @returns {boolean}
 */
function colorsEqual(a, b) {
  if (a == null && b == null) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

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
 * @property {number} fillBuildGeneration - Bumped on every rebuild; a
 * stale progressive fill batch loop compares against this and stops
 * appending once it no longer matches.
 * @property {Array|null} lastFillLayers - Last completed fill layer(s).
 * Kept rendered as a stale placeholder underneath a new build's base
 * layers while that build's own fill is in flight, so panning/zooming
 * never blanks fill to nothing for a frame.
 * @property {Map|null} fillTileDataCache - Per-tile fill geometry
 * (`tileKey -> dataObject[]`), populated as tiles are triangulated. A tile
 * revisited on a later pan reuses its cached data instead of being
 * re-triangulated, so only genuinely new tiles pay that cost.
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

    /**
     * Debounced render to batch rapid style changes.
     * Multiple updates within BULK_STYLE_DEBOUNCE_MS are coalesced.
     */
    this._debouncedRender = debounce(() => {
      this._flushPendingStyleUpdates()
    }, BULK_STYLE_DEBOUNCE_MS)

    /** Groups with pending color-only style updates. */
    this._pendingColorUpdates = new Set()
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
      filled: BULK_DEFAULT_FILLED,
      fillOpacity: BULK_DEFAULT_FILL_OPACITY,
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
        style: {
          opacity: defaultStyle.opacity,
          color,
          filled: defaultStyle.filled,
          fillOpacity: defaultStyle.fillOpacity,
        },
        defaultStyle: {
          opacity: defaultStyle.opacity,
          color,
          filled: defaultStyle.filled,
          fillOpacity: defaultStyle.fillOpacity,
        },
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
        fillBuildGeneration: 0,
        lastFillLayers: null,
        fillTileDataCache: null,
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
    return {
      opacity: g.style.opacity,
      color: g.style.color,
      filled: g.style.filled,
      fillOpacity: g.style.fillOpacity,
    }
  }

  getAnnotationGroupDefaultStyle(uid) {
    const g = this._requireGroup(uid)
    return {
      opacity: g.defaultStyle.opacity,
      color: g.defaultStyle.color,
      filled: g.defaultStyle.filled,
      fillOpacity: g.defaultStyle.fillOpacity,
    }
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
    getProfiler().start('setAnnotationGroupStyle', uid)
    const g = this._requireGroup(uid)

    // Track which properties changed for optimization decisions
    const colorChanged =
      styleOptions.color != null &&
      !colorsEqual(styleOptions.color, g.style.color)
    const opacityChanged =
      styleOptions.opacity != null && styleOptions.opacity !== g.style.opacity
    const fillOpacityChanged =
      styleOptions.fillOpacity != null &&
      styleOptions.fillOpacity !== g.style.fillOpacity
    const filledChanged =
      styleOptions.filled != null && styleOptions.filled !== g.style.filled
    const measurementChanged =
      'measurement' in styleOptions &&
      this._measurementKey(styleOptions.measurement) !==
        this._measurementKey(g.style.measurement)
    const limitValuesChanged =
      styleOptions.limitValues != null &&
      (g.style.limitValues == null ||
        styleOptions.limitValues[0] !== g.style.limitValues[0] ||
        styleOptions.limitValues[1] !== g.style.limitValues[1])

    // Apply style updates
    if (styleOptions.opacity != null) {
      g.style.opacity = styleOptions.opacity
    }
    if (styleOptions.color != null) {
      g.style.color = styleOptions.color
    }
    if (styleOptions.filled != null) {
      g.style.filled = styleOptions.filled
    }
    if (styleOptions.fillOpacity != null) {
      g.style.fillOpacity = styleOptions.fillOpacity
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
      // Determine if we need full rebuild or can use lightweight update
      const needsFullRebuild =
        filledChanged || measurementChanged || limitValuesChanged

      if (needsFullRebuild) {
        // Structural change: full layer rebuild required
        this._rebuildLayersForGroup(g)
      } else if (colorChanged || opacityChanged || fillOpacityChanged) {
        // Color/opacity only: update existing layers in place
        this._updateLayerColors(g)
      }
      // If nothing changed, no update needed
    }
    getProfiler().end('setAnnotationGroupStyle', uid, {
      styleOptions,
      colorChanged,
      opacityChanged,
      filledChanged,
      measurementChanged,
      needsFullRebuild:
        filledChanged || measurementChanged || limitValuesChanged,
    })
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
    this.ensureOverlay()
      .then(() => {
        if (!g.hydrated) {
          this._enqueueHydrate(uid)
        } else {
          this._rebuildLayersForGroup(g)
        }
      })
      .catch((error) => {
        console.error('[bulkAnnotations] overlay initialization failed', error)
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
    g.fillBuildGeneration += 1
    g.lastFillLayers = null
    g.fillTileDataCache = null
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
    /** Stop an in-flight progressive fill batch loop (see `g.visible` check there) from wastefully continuing on a detached record. */
    g.visible = false
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
    // Cancel any pending debounced updates
    if (this._debouncedRender != null) {
      this._debouncedRender.cancel()
    }
    this._pendingColorUpdates.clear()

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
            annotationGroupUID: uid,
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

    /** Report a hydrate lifecycle step so consumers can show what's happening. */
    const publishPhase = (phase, extra = {}) => {
      if (gen !== g.hydrateGeneration || !g.visible || !container) {
        return
      }
      publish(container, EVENTS.ANNOTATION_GROUP_LOADING_PROGRESS, {
        annotationGroupUID: uid,
        phase,
        ...extra,
      })
    }

    try {
      const client = this._getClient()
      const { metadata, metadataItem, bulkdataItem, sequenceIndex } = g
      const numberOfAnnotations = Number(metadataItem.NumberOfAnnotations)
      const graphicType = metadataItem.GraphicType
      const coordinateDimensionality = getCoordinateDimensionality(
        metadataItem,
        metadata.AnnotationCoordinateType,
      )
      const commonZCoordinate = getCommonZCoordinate(metadataItem)

      publishPhase('index')
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

      /** Throttled: the stream invokes `onProgress` once per network chunk. */
      let lastProgressPublishMs = 0
      const publishProgress = (loadedBytes, totalBytes) => {
        const now = Date.now()
        const isComplete = totalBytes != null && loadedBytes >= totalBytes
        if (!isComplete && now - lastProgressPublishMs < 100) {
          return
        }
        lastProgressPublishMs = now
        publishPhase('data', { loadedBytes, totalBytes })
      }
      publishPhase('data', { loadedBytes: 0, totalBytes: null })

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
        baseUrl: client?.wadoURL || client?.baseURL,
        headers: client?.headers ?? {},
        onProgress: publishProgress,
      })

      if (gen !== g.hydrateGeneration || !g.visible) {
        return
      }

      publishPhase('decoding')
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
      g.pickIndex = buildSpatialIndex(
        decoded.bboxes,
        decoded.numberOfAnnotations,
      )
      g.hydrated = true
      this._rebuildLayersForGroup(g)
      /** Warm the measurement cache so range lookups / filters resolve quickly. */
      this._ensureMeasurements(g)
    } finally {
      /**
       * Always pair LOADING_STARTED with LOADING_ENDED — consumers (slim)
       * gate a global loading indicator on this pair, and an abort, error, or
       * stale-generation exit would otherwise leave it stuck.
       */
      if (container) {
        publish(container, EVENTS.LOADING_ENDED, { annotationGroupUID: uid })
      }
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
    const uid = g.annotationGroup.uid
    const key = this._measurementKey(g.style.measurement)
    if (key == null) {
      /** Measurement deselected: drop filter attributes from cached data. */
      if (g.filterCache != null) {
        getProfiler().record('filterCacheInvalidate', 1, {
          uid,
          reason: 'measurementDeselected',
        })
        g.filterCache = null
        g.deckData = null
        g.tileDataCache = null
        g.fillTileDataCache = null
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
      getProfiler().start('filterCacheRebuild', uid)
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
      g.fillTileDataCache = null
      getProfiler().end('filterCacheRebuild', uid, {
        vertexCount: g.decoded.vertexCount,
        annotationCount: g.decoded.numberOfAnnotations,
      })
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
   * Compute the overall bounding box of a group from its spatial tile bounds.
   * Returns [minX, minY, maxX, maxY] or null if not available.
   * @param {GroupRecord} g
   * @returns {number[] | null}
   */
  _computeGroupBbox(g) {
    if (g.spatial == null || g.spatial.tileBounds == null) {
      return null
    }
    let gMinX = Infinity
    let gMinY = Infinity
    let gMaxX = -Infinity
    let gMaxY = -Infinity
    for (const [, bounds] of g.spatial.tileBounds) {
      const [tMinX, tMinY, tMaxX, tMaxY] = bounds
      if (tMinX < gMinX) gMinX = tMinX
      if (tMinY < gMinY) gMinY = tMinY
      if (tMaxX > gMaxX) gMaxX = tMaxX
      if (tMaxY > gMaxY) gMaxY = tMaxY
    }
    if (!Number.isFinite(gMinX)) {
      return null
    }
    return [gMinX, gMinY, gMaxX, gMaxY]
  }

  /**
   * Check if a group's bounding box intersects with the given view extent.
   * @param {GroupRecord} g
   * @param {number[]} extent - [minX, minY, maxX, maxY]
   * @returns {boolean}
   */
  _groupIntersectsExtent(g, extent) {
    if (extent == null) {
      return true // If no extent, assume visible
    }
    const bbox = this._computeGroupBbox(g)
    if (bbox == null) {
      return true // If no bbox, assume visible
    }
    const [gMinX, gMinY, gMaxX, gMaxY] = bbox
    const [eMinX, eMinY, eMaxX, eMaxY] = extent
    // Check for non-intersection
    if (gMaxX < eMinX || gMinX > eMaxX || gMaxY < eMinY || gMinY > eMaxY) {
      return false
    }
    return true
  }

  /**
   * Update layer colors/opacity without full rebuild.
   * Uses debouncing to batch rapid style changes (e.g., from sliders).
   * @param {GroupRecord} g
   */
  _updateLayerColors(g) {
    // Add to pending set and schedule debounced flush
    this._pendingColorUpdates.add(g.annotationGroup.uid)
    this._debouncedRender()
  }

  /**
   * Flush all pending color updates in a single render pass.
   * Called by the debounced render function.
   */
  _flushPendingStyleUpdates() {
    if (this._pendingColorUpdates.size === 0) {
      return
    }

    getProfiler().start('flushStyleUpdates', 'batch')
    let updatedCount = 0

    for (const uid of this._pendingColorUpdates) {
      const g = this._groups.get(uid)
      if (g == null || g.deckLayers == null || g.deckLayers.length === 0) {
        continue
      }

      const { color, opacity, fillOpacity } = g.style
      const rgba = [
        ...(color ?? BULK_DEFAULT_COLOR),
        Math.round(Math.max(0, Math.min(1, opacity ?? 1)) * BULK_DEFAULT_ALPHA),
      ]
      const fillRgba = [
        ...(color ?? BULK_DEFAULT_COLOR),
        Math.round(
          Math.max(0, Math.min(1, fillOpacity ?? BULK_DEFAULT_FILL_OPACITY)) *
            255,
        ),
      ]

      // Clone each layer with updated color props
      g.deckLayers = g.deckLayers.map((layer) => {
        const layerId = layer.id || ''
        // Determine if this is a fill layer (polygon fill) or outline layer
        const isFillLayer = layerId.includes('-fill-')

        // deck.gl layers are immutable - clone with new props
        // SolidPolygonLayer uses getFillColor, PathLayer/ScatterplotLayer use getColor
        if (isFillLayer) {
          return layer.clone({
            getFillColor: fillRgba,
            updateTriggers: {
              getFillColor: [color, fillOpacity],
            },
          })
        }
        return layer.clone({
          getColor: rgba,
          updateTriggers: {
            getColor: [color, opacity],
          },
        })
      })
      updatedCount++
    }

    this._pendingColorUpdates.clear()

    // Single render call for all updates
    if (updatedCount > 0) {
      this._requestRender()
    }

    getProfiler().end('flushStyleUpdates', 'batch', {
      groupsUpdated: updatedCount,
    })
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
    getProfiler().start('refreshLayersForViewChange')
    let rebuiltCount = 0
    let culledCount = 0
    const view = this._getMap()?.getView?.()
    const extent = view?.calculateExtent?.()

    for (const g of this._groups.values()) {
      if (!g.visible || !g.hydrated || g.decoded == null) {
        continue
      }
      // Optimization: Skip groups whose bbox doesn't intersect the view extent
      if (!this._groupIntersectsExtent(g, extent)) {
        // Clear layers for off-screen groups to free GPU memory
        if (g.deckLayers.length > 0) {
          g.deckLayers = []
          g.buildSignature = null // Force rebuild when back in view
          culledCount++
        }
        continue
      }
      const signature = this._computeBuildSignature(g)
      if (signature !== g.buildSignature) {
        this._rebuildLayersForGroup(g)
        rebuiltCount++
      }
    }
    getProfiler().end('refreshLayersForViewChange', 'default', {
      rebuiltCount,
      culledCount,
    })
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
    const uid = g.annotationGroup.uid
    getProfiler().start('rebuildLayers', uid)
    if (!g.hydrated || g.decoded == null || !g.visible) {
      g.deckLayers = []
      this._requestRender()
      getProfiler().end('rebuildLayers', uid, { skipped: true })
      return
    }
    const {
      createLineStripLayer,
      createPathLayer,
      createPointLayer,
      createPolygonLayer,
    } = await loadLayerFactories()
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
      vertexCount,
    } = g.decoded
    const rgba = [
      g.style.color[0],
      g.style.color[1],
      g.style.color[2],
      Math.round(
        Math.max(0, Math.min(1, g.style.opacity ?? 1)) * BULK_DEFAULT_ALPHA,
      ),
    ]
    const isFilled =
      g.style.filled === true && CLOSED_GRAPHIC_TYPES.has(graphicType)
    const fillRgba = isFilled
      ? [
          g.style.color[0],
          g.style.color[1],
          g.style.color[2],
          Math.round(
            Math.max(
              0,
              Math.min(1, g.style.fillOpacity ?? BULK_DEFAULT_FILL_OPACITY),
            ) * 255,
          ),
        ]
      : null
    /**
     * LOD (showing centroids instead of full paths at low zoom) activates when:
     * - Graphic type supports LOD (POLYGON, POLYLINE), AND
     * - EITHER vertex count OR annotation count exceeds threshold
     *
     * Vertex count is the primary metric (direct GPU cost). Annotation count
     * is a fallback for sparse shapes where interaction/picking cost matters.
     */
    const useLod =
      PATH_LOD_GRAPHIC_TYPES.has(graphicType) &&
      (vertexCount > BULK_LOD_MIN_VERTICES ||
        numberOfAnnotations > BULK_LOD_MIN_ANNOTATIONS)
    /**
     * Show full paths (instead of just centroids) when:
     * - LOD is not in use, OR
     * - Currently at high resolution zoom
     */
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
    /**
     * Separate object from `fullPaths`: `PathLayer` neutralizes its tesselator's
     * `positions` scratch slot via an inert `positions: null` key, but
     * `SolidPolygonLayer`'s tesselator writes triangulated vertices into that
     * same-named attribute, so the two layers cannot share one data object.
     * Built lazily — only groups with fill enabled pay for it.
     */
    if (isFilled && g.deckData.fullPolygons == null) {
      g.deckData.fullPolygons = {
        length: numberOfAnnotations,
        startIndices,
        attributes: {
          getPolygon: { value: positions, size: 2 },
          ...(filter != null
            ? { getFilterValue: { value: filter.perVertex, size: 1 } }
            : {}),
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

    /** null = "fill the whole (untiled) group"; see _scheduleFillBuild. */
    let fillTiles = null
    if (graphicType !== 'POINT' && (!useLod || highRes)) {
      const map = this._getMap()
      const view = map?.getView()
      const extent = view?.calculateExtent?.()
      const tiled = this._layersForVisibleTiles(
        g,
        rgba,
        extent,
        createPathLayer,
        createLineStripLayer,
        modelMatrix,
        filter,
        isFilled,
      )
      if (tiled.layers.length > 0) {
        layers.push(...tiled.layers)
        fillTiles = tiled.fillTiles
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
        fillTiles = null
      }
    }

    /** Matches the tier that actually gets a fill build scheduled below. */
    const fillEligible =
      isFilled && graphicType !== 'POINT' && (!useLod || highRes)

    /**
     * Show the previous build's fill underneath the new base layers instead
     * of blanking to unfilled while the new fill (re)builds — panning/zooming
     * would otherwise flicker unfilled-then-filled on every view change.
     * Positions are absolute world coordinates, so a stale set still draws
     * correctly; it's just replaced once the new build's fill is ready.
     */
    const staleFillLayers = fillEligible ? (g.lastFillLayers ?? []) : []
    if (!fillEligible) {
      g.lastFillLayers = null
    }
    g.deckLayers = [...staleFillLayers, ...layers]
    g.buildSignature = signature
    g.fillBuildGeneration += 1
    this._requestRender()

    if (fillEligible) {
      this._scheduleFillBuild({
        g,
        generation: g.fillBuildGeneration,
        fillTiles,
        fillRgba,
        modelMatrix,
        filter,
        createPolygonLayer,
        baseLayers: layers,
      })
    }
    getProfiler().end('rebuildLayers', uid, {
      layerCount: layers.length,
      useLod,
      highRes,
      isFilled,
      vertexCount,
      numberOfAnnotations,
    })
  }

  /**
   * Render fill for a group. `fillTiles === null` means "the whole (untiled)
   * group" — small groups build synchronously, larger ones batch across
   * frames (`_buildWholeGroupFillProgressively`), same as before. When
   * `fillTiles` is an array (the common, spatially-tiled case), each tile's
   * fill is cached in `g.fillTileDataCache` once built: a tile already seen
   * on a prior pan is reused instantly instead of being re-triangulated, so
   * only genuinely new tiles pay the triangulation cost
   * (`_buildTileFillLayersProgressively`).
   *
   * @param {Object} options
   * @param {GroupRecord} options.g
   * @param {number} options.generation - `g.fillBuildGeneration` at schedule time; a stale batch loop stops once this no longer matches
   * @param {Array<{key: string, annotationIndices: number[]}>|null} options.fillTiles
   * @param {number[]} options.fillRgba
   * @param {number[]} [options.modelMatrix]
   * @param {Object|null} options.filter
   * @param {Function} options.createPolygonLayer
   * @param {Array} options.baseLayers - Non-fill layers to keep underneath the fill batches
   */
  _scheduleFillBuild({
    g,
    generation,
    fillTiles,
    fillRgba,
    modelMatrix,
    filter,
    createPolygonLayer,
    baseLayers,
  }) {
    if (fillTiles == null) {
      this._scheduleWholeGroupFillBuild({
        g,
        generation,
        fillRgba,
        modelMatrix,
        filter,
        createPolygonLayer,
        baseLayers,
      })
      return
    }

    if (g.fillTileDataCache == null) {
      g.fillTileDataCache = new Map()
    }
    const cachedLayers = []
    const pendingTiles = []
    for (const tile of fillTiles) {
      const chunks = g.fillTileDataCache.get(tile.key)
      if (chunks != null) {
        cachedLayers.push(
          ...this._tileFillLayersFromChunks(
            g,
            tile.key,
            chunks,
            fillRgba,
            modelMatrix,
            filter,
            createPolygonLayer,
          ),
        )
      } else {
        pendingTiles.push(tile)
      }
    }
    if (pendingTiles.length === 0) {
      g.lastFillLayers = cachedLayers
      g.deckLayers = [...cachedLayers, ...baseLayers]
      this._requestRender()
      return
    }
    this._buildTileFillLayersProgressively({
      g,
      generation,
      cachedLayers,
      pendingTiles,
      fillRgba,
      modelMatrix,
      filter,
      createPolygonLayer,
      baseLayers,
    }).catch((error) => {
      console.error('[bulkAnnotations] progressive fill build failed', error)
    })
  }

  /** Whole-(untiled)-group variant of `_scheduleFillBuild` — see there. */
  _scheduleWholeGroupFillBuild({
    g,
    generation,
    fillRgba,
    modelMatrix,
    filter,
    createPolygonLayer,
    baseLayers,
  }) {
    const total = g.decoded.numberOfAnnotations
    if (total === 0) {
      g.lastFillLayers = null
      g.deckLayers = baseLayers
      this._requestRender()
      return
    }
    if (total <= BULK_FILL_INSTANT_MAX) {
      const fillLayer = createPolygonLayer({
        id: `bulk-${g.annotationGroup.uid}-fill`,
        data: g.deckData.fullPolygons,
        fillColor: fillRgba,
        visible: true,
        modelMatrix,
        ...(filter != null ? { filterRange: filter.range } : {}),
      })
      g.lastFillLayers = [fillLayer]
      g.deckLayers = [fillLayer, ...baseLayers]
      this._requestRender()
      return
    }
    const allIndices = Array.from({ length: total }, (_unused, index) => index)
    this._buildWholeGroupFillProgressively({
      g,
      generation,
      indices: allIndices,
      fillRgba,
      modelMatrix,
      filter,
      createPolygonLayer,
      baseLayers,
    }).catch((error) => {
      console.error('[bulkAnnotations] progressive fill build failed', error)
    })
  }

  /** Build the deck.gl fill layer(s) for one tile's cached data chunks. */
  _tileFillLayersFromChunks(
    g,
    key,
    chunks,
    fillRgba,
    modelMatrix,
    filter,
    createPolygonLayer,
  ) {
    return chunks.map((data, chunkIndex) =>
      createPolygonLayer({
        id: `bulk-${g.annotationGroup.uid}-fill-tile-${key}-${chunkIndex * BULK_FILL_BATCH_SIZE}`,
        data,
        fillColor: fillRgba,
        visible: true,
        modelMatrix,
        ...(filter != null ? { filterRange: filter.range } : {}),
      }),
    )
  }

  /** Slice + filter-expand a fill data object for an explicit annotation index set. */
  _buildFillDataForIndices(g, indices, filter) {
    const sub = buildTileSubviews({
      positions: g.decoded.positions,
      startIndices: g.decoded.startIndices,
      annotationIndices: indices,
    })
    let filterValues = null
    if (filter != null) {
      filterValues = expandMeasurementToPerVertex(
        Float32Array.from(indices, (index) => filter.perAnnotation[index]),
        sub.startIndices,
        sub.positions.length / 2,
      )
    }
    return {
      length: indices.length,
      startIndices: sub.startIndices,
      attributes: {
        getPolygon: { value: sub.positions, size: 2 },
        ...(filterValues != null
          ? { getFilterValue: { value: filterValues, size: 1 } }
          : {}),
      },
    }
  }

  /**
   * Build fill for the whole untiled group's `indices` in
   * `BULK_FILL_BATCH_SIZE`-sized chunks, one chunk per animation frame, so
   * triangulating a large selection never blocks the main thread for more
   * than a batch's worth of work. Each completed batch is appended under
   * `baseLayers` and rendered immediately — fill visibly grows in rather
   * than appearing all at once. Aborts as soon as a newer rebuild
   * (`g.fillBuildGeneration` moved on), the group is hidden, or the group is
   * unhydrated.
   */
  async _buildWholeGroupFillProgressively({
    g,
    generation,
    indices,
    fillRgba,
    modelMatrix,
    filter,
    createPolygonLayer,
    baseLayers,
  }) {
    const fillLayers = []
    for (let start = 0; start < indices.length; start += BULK_FILL_BATCH_SIZE) {
      if (generation !== g.fillBuildGeneration || !g.visible || !g.hydrated) {
        return
      }
      const batchIndices = indices.slice(start, start + BULK_FILL_BATCH_SIZE)
      const data = this._buildFillDataForIndices(g, batchIndices, filter)
      fillLayers.push(
        createPolygonLayer({
          id: `bulk-${g.annotationGroup.uid}-fill-batch-${start}`,
          data,
          fillColor: fillRgba,
          visible: true,
          modelMatrix,
          ...(filter != null ? { filterRange: filter.range } : {}),
        }),
      )
      g.deckLayers = [...fillLayers, ...baseLayers]
      this._requestRender()
      await new Promise((resolve) => {
        requestAnimationFrame(resolve)
      })
    }
    g.lastFillLayers = fillLayers
  }

  /**
   * Build fill for tiles not yet in `g.fillTileDataCache`, one tile at a
   * time, sub-batching a tile's own annotations by `BULK_FILL_BATCH_SIZE`
   * across animation frames so a single dense tile can't block the main
   * thread either. `cachedLayers` (already-triangulated tiles) render
   * immediately; each pending tile's fill is appended as its batches
   * complete, and the finished tile's data chunks are cached so a later
   * rebuild that revisits it (panning back, an unrelated style change, …)
   * reuses them instead of re-triangulating. Aborts as soon as a newer
   * rebuild supersedes this one, the group is hidden, or unhydrated —
   * whatever tiles finished before the abort stay cached.
   */
  async _buildTileFillLayersProgressively({
    g,
    generation,
    cachedLayers,
    pendingTiles,
    fillRgba,
    modelMatrix,
    filter,
    createPolygonLayer,
    baseLayers,
  }) {
    const uid = g.annotationGroup.uid
    getProfiler().start('buildTileFillProgressively', uid)
    const newLayers = []
    let tilesProcessed = 0
    let batchesProcessed = 0
    g.deckLayers = [...cachedLayers, ...newLayers, ...baseLayers]
    this._requestRender()
    for (const tile of pendingTiles) {
      const chunks = []
      for (
        let start = 0;
        start < tile.annotationIndices.length;
        start += BULK_FILL_BATCH_SIZE
      ) {
        if (generation !== g.fillBuildGeneration || !g.visible || !g.hydrated) {
          getProfiler().end('buildTileFillProgressively', uid, {
            aborted: true,
            tilesProcessed,
            batchesProcessed,
          })
          return
        }
        batchesProcessed++
        const batchIndices = tile.annotationIndices.slice(
          start,
          start + BULK_FILL_BATCH_SIZE,
        )
        const data = this._buildFillDataForIndices(g, batchIndices, filter)
        chunks.push(data)
        newLayers.push(
          createPolygonLayer({
            id: `bulk-${g.annotationGroup.uid}-fill-tile-${tile.key}-${start}`,
            data,
            fillColor: fillRgba,
            visible: true,
            modelMatrix,
            ...(filter != null ? { filterRange: filter.range } : {}),
          }),
        )
        g.deckLayers = [...cachedLayers, ...newLayers, ...baseLayers]
        this._requestRender()
        await new Promise((resolve) => {
          requestAnimationFrame(resolve)
        })
      }
      if (g.fillTileDataCache != null) {
        g.fillTileDataCache.set(tile.key, chunks)
      }
      tilesProcessed++
    }
    getProfiler().end('buildTileFillProgressively', uid, {
      tilesProcessed,
      batchesProcessed,
      pendingTileCount: pendingTiles.length,
    })
    g.lastFillLayers = [...cachedLayers, ...newLayers]
  }

  _layersForVisibleTiles(
    g,
    rgba,
    extent,
    createPathLayer,
    createLineStripLayer,
    modelMatrix,
    filter,
    isFilled = false,
  ) {
    const uid = g.annotationGroup.uid
    getProfiler().start('layersForVisibleTiles', uid)
    if (g.spatial == null || extent == null) {
      getProfiler().end('layersForVisibleTiles', uid, { skipped: true })
      return { layers: [], fillTiles: [] }
    }
    if (g.tileDataCache == null) {
      g.tileDataCache = new LRUCache(BULK_TILE_CACHE_MAX_SIZE)
    }
    const out = []
    const fillTiles = []
    let tilesCached = 0
    let tilesBuilt = 0
    for (const key of this._visibleTileKeys(g, extent)) {
      const annotationIndices = g.spatial.tileAnnotationIndices.get(key)
      if (annotationIndices == null || annotationIndices.length === 0) {
        continue
      }
      let tileData = g.tileDataCache.get(key)
      let sub = null
      let tileFilterValues = null
      if (tileData == null) {
        sub = buildTileSubviews({
          positions: g.decoded.positions,
          startIndices: g.decoded.startIndices,
          annotationIndices,
        })
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
      }
      if (tileData == null) {
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
        tilesBuilt++
      } else {
        tilesCached++
      }
      /**
       * Use styled (full-detail) PathLayer when:
       * - Tile is not too dense (< 50k annotations), AND
       * - Either at high resolution OR fill is enabled (user expects
       *   consistent appearance at all zoom levels when fill is on)
       */
      const useStyled =
        annotationIndices.length < 50_000 &&
        (this._isHighResolution() || isFilled)
      /**
       * Fill only considered for tiles rendered at the styled (full-detail)
       * tier — matches the non-tiled fallback and keeps the coarse LOD tier
       * cheap. Collected here and built separately, per tile, so
       * `_scheduleFillBuild` can reuse an already-triangulated tile's fill
       * across rebuilds (see `g.fillTileDataCache`) instead of re-building
       * every visible tile's fill on every pan/zoom, and so one dense tile
       * can be batched across frames without blocking the others.
       */
      if (useStyled) {
        fillTiles.push({ key, annotationIndices })
      }
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
    getProfiler().end('layersForVisibleTiles', uid, {
      tileCount: out.length,
      tilesCached,
      tilesBuilt,
      fillTileCount: fillTiles.length,
    })
    return { layers: out, fillTiles }
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
