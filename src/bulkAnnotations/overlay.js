/**
 * Deck.gl overlay as a custom OpenLayers Layer.
 *
 * Deck is loaded lazily so jsdom/unit tests that import VolumeImageViewer do
 * not pull in apache-arrow (TextDecoder) at module evaluation time.
 *
 * @see https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/openlayers
 */

import Layer from 'ol/layer/Layer'

import { importLazyChunk } from './lazyImport.js'
import { olViewStateToDeck } from './viewState.js'

export { olViewStateToDeck }

/** Id of the OrthographicView every DMV deck.gl layer is drawn in */
export const DECK_VIEW_ID = 'bulk-ann-ortho'

let deckModulePromise = null

function loadDeckModule() {
  if (deckModulePromise == null) {
    deckModulePromise = importLazyChunk(() => import('@deck.gl/core')).catch(
      (error) => {
        /** Let a later overlay try again */
        deckModulePromise = null
        throw error
      },
    )
  }
  return deckModulePromise
}

/**
 * Create a Deck instance configured for bulk-annotation overlay use.
 *
 * @param {Object} options
 * @param {HTMLElement} options.parent - Parent element for the deck canvas
 * @param {Function} [options.onError]
 * @returns {Promise<import('@deck.gl/core').Deck|null>}
 */
export async function createBulkAnnotationDeck({
  parent,
  onError,
  onDeviceInitialized,
}) {
  if (
    typeof WebGLRenderingContext === 'undefined' &&
    typeof WebGL2RenderingContext === 'undefined'
  ) {
    console.warn(
      '[bulkAnnotations] WebGL unavailable; deck.gl overlay disabled (headless/jsdom).',
    )
    return null
  }

  try {
    const { Deck, OrthographicView } = await loadDeckModule()
    const view = new OrthographicView({
      id: DECK_VIEW_ID,
      /** Match OpenLayers Y-down slide space (see geometry/coords.js). */
      flipY: false,
      controller: false,
    })

    /**
     * deck.gl writes its cursor on its parent's style on every update. The
     * application's viewport element (the map target) styles its own
     * cursor, e.g. Slim's busy cursor, so the Deck gets a parent of its own
     */
    const deckParent = document.createElement('div')
    deckParent.className = 'dmv-deck-parent'
    deckParent.style.position = 'absolute'
    deckParent.style.inset = '0'
    deckParent.style.pointerEvents = 'none'
    parent.appendChild(deckParent)

    return new Deck({
      parent: deckParent,
      views: [view],
      controller: false,
      style: {
        pointerEvents: 'none',
        position: 'absolute',
        inset: '0',
        zIndex: '1',
      },
      /**
       * Neutralize PathTesselator over-allocation and prevent free-on-hide from
       * retaining GB-sized scratch arrays in the TypedArrayManager pool.
       */
      _typedArrayManagerProps: { overAlloc: 1, poolSize: 0 },
      deviceProps: { type: 'webgl' },
      layers: [],
      onError:
        onError ||
        ((err) => {
          console.error('[bulkAnnotations] Deck error', err)
        }),
      onDeviceInitialized: (device) => {
        onDeviceInitialized?.(device)
      },
      onWebGLInitialized: (gl) => {
        const canvas = gl?.canvas
        if (canvas) {
          canvas.addEventListener(
            'webglcontextlost',
            (event) => {
              event.preventDefault()
              console.warn('[bulkAnnotations] WebGL context lost')
            },
            false,
          )
        }
      },
    })
  } catch (error) {
    console.warn('[bulkAnnotations] Failed to create Deck instance', error)
    return null
  }
}

/**
 * Build a custom `ol/layer/Layer` that drives a Deck instance each frame.
 *
 * @param {Object} options
 * @param {import('@deck.gl/core').Deck} options.deck
 * @param {() => import('@deck.gl/core').Layer[]} options.getLayers
 * @returns {Layer}
 */
export function createDeckOlLayer({ deck, getLayers }) {
  return new Layer({
    className: 'dmv-bulk-ann-deck-layer',
    render({ size, viewState }) {
      if (deck == null) {
        return null
      }
      const deckViewState = olViewStateToDeck(viewState, size)
      const [width, height] = size
      let layers = []
      try {
        layers = getLayers() || []
      } catch (error) {
        console.error('[bulkAnnotations] getLayers failed', error)
      }
      deck.setProps({
        width,
        height,
        viewState: {
          [DECK_VIEW_ID]: deckViewState,
        },
        layers,
      })
      deck.redraw()
      return deck.getCanvas?.() ?? null
    },
  })
}

/**
 * Tear down a Deck instance and its OL wrapper layer.
 *
 * @param {Object} options
 * @param {import('@deck.gl/core').Deck|null} options.deck
 * @param {Layer|null} options.olLayer
 * @param {import('ol/Map').default|null} options.map
 */
export function disposeBulkAnnotationOverlay({ deck, olLayer, map }) {
  if (olLayer != null && map != null) {
    try {
      map.removeLayer(olLayer)
    } catch {
      /* already removed */
    }
  }
  if (deck != null) {
    try {
      const deckParent = deck.props?.parent
      deck.finalize()
      deckParent?.remove?.()
    } catch (error) {
      console.warn('[bulkAnnotations] Deck finalize failed', error)
    }
  }
}
