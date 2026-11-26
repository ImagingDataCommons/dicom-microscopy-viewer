/**
 * One deck.gl overlay per viewer, shared by everything DMV draws with
 * deck.gl over the OpenLayers slide image: bulk annotations and derived data
 * (segmentations, parametric maps). A single Deck means a single WebGL2
 * context and canvas per viewer, whatever number of overlays is shown.
 *
 * The overlay is a custom `ol/layer/Layer` above every OpenLayers layer
 * (`DECK_OVERLAY_Z_INDEX`). OpenLayers puts WebGL layers next to each other
 * on one canvas and context; a DOM layer between them makes it start another
 * canvas and context for the layers after it, which cost 8 ms per empty
 * frame and 25-40 ms per frame with whole-slide layers.
 *
 * Each user of the overlay registers a layer source; a frame draws the
 * layers of all sources in ascending `order` (later ones on top).
 */

import Layer from 'ol/layer/Layer'

import {
  createBulkAnnotationDeck,
  DECK_VIEW_ID,
  olViewStateToDeck,
} from './bulkAnnotations/overlay.js'

/** Above every OpenLayers layer DMV adds */
export const DECK_OVERLAY_Z_INDEX = 1000

/** Layer source order: derived data under annotations */
export const DECK_SOURCE_ORDER = {
  segmentations: 100,
  parametricMaps: 200,
  annotations: 300,
}

export class SharedDeckOverlay {
  /**
   * @param {Object} options
   * @param {function(): import('ol/Map').default|null} options.getMap
   * @param {function(): HTMLElement|null} [options.getContainer]
   * @param {function(Error): void} [options.onError]
   */
  constructor({ getMap, getContainer, onError }) {
    this._getMap = getMap
    this._getContainer = getContainer ?? (() => null)
    this._onError = onError
    /** @type {Map<string, {order: number, getLayers: Function}>} */
    this._sources = new Map()
    this._deviceCallbacks = []
    this._ready = null
    this.deck = null
    this.device = null
    this.olLayer = null
  }

  /**
   * Create the Deck and add its layer to the map, once.
   *
   * @returns {Promise<boolean>} Whether deck.gl is available
   */
  ensureReady() {
    if (this._ready == null) {
      this._ready = this._init()
    }
    return this._ready
  }

  async _init() {
    const map = this._getMap()
    if (map == null) {
      this._ready = null
      return false
    }
    const parent = map.getTargetElement?.() || this._getContainer()
    if (parent == null) {
      this._ready = null
      return false
    }
    this.deck = await createBulkAnnotationDeck({
      parent,
      onError: this._onError,
      onDeviceInitialized: (device) => {
        this.device = device
        const callbacks = this._deviceCallbacks
        this._deviceCallbacks = []
        for (const callback of callbacks) {
          callback(device)
        }
        this._getMap()?.render()
      },
    })
    if (this.deck == null) {
      return false
    }
    this.olLayer = new Layer({
      className: 'dmv-deck-overlay-layer',
      zIndex: DECK_OVERLAY_Z_INDEX,
      render: (frameState) => this._render(frameState),
    })
    map.addLayer(this.olLayer)
    return true
  }

  /**
   * Call `callback` with the luma.gl device once it exists.
   *
   * @param {function(Object): void} callback
   */
  onDeviceInitialized(callback) {
    if (this.device != null) {
      callback(this.device)
    } else {
      this._deviceCallbacks.push(callback)
    }
  }

  /**
   * @param {string} id
   * @param {Object} source
   * @param {number} source.order - Lower draws first (below)
   * @param {function(Object): Array} source.getLayers - Called with the
   *   OpenLayers frame state on every frame
   */
  addLayerSource(id, { order, getLayers }) {
    this._sources.set(id, { order, getLayers })
    this.changed()
  }

  removeLayerSource(id) {
    this._sources.delete(id)
    this.changed()
  }

  /** Redraw on the next OpenLayers frame */
  changed() {
    this.olLayer?.changed()
  }

  /**
   * Layers of all sources, lowest order first.
   *
   * @param {Object} frameState
   * @returns {Array}
   */
  collectLayers(frameState) {
    const sources = [...this._sources.values()].sort(
      (a, b) => a.order - b.order,
    )
    const layers = []
    for (const source of sources) {
      try {
        layers.push(...(source.getLayers(frameState) ?? []))
      } catch (error) {
        console.error('[deckOverlay] layer source failed', error)
      }
    }
    return layers
  }

  _render(frameState) {
    const deck = this.deck
    if (deck == null) {
      return null
    }
    const { size, viewState } = frameState
    deck.setProps({
      width: size[0],
      height: size[1],
      viewState: { [DECK_VIEW_ID]: olViewStateToDeck(viewState, size) },
      layers: this.collectLayers(frameState),
    })
    deck.redraw()
    return deck.getCanvas?.() ?? null
  }

  dispose() {
    const map = this._getMap()
    if (this.olLayer != null && map != null) {
      try {
        map.removeLayer(this.olLayer)
      } catch {
        /** already removed */
      }
    }
    try {
      /** createBulkAnnotationDeck gives the Deck a parent of its own */
      const deckParent = this.deck?.props?.parent
      this.deck?.finalize()
      deckParent?.remove?.()
    } catch (error) {
      console.warn('[deckOverlay] Deck finalize failed', error)
    }
    this._sources.clear()
    this.deck = null
    this.device = null
    this.olLayer = null
    this._ready = null
  }
}
