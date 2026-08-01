/**
 * Deck.gl overlay as a custom OpenLayers Layer.
 *
 * Official deck.gl + OpenLayers pattern: the OL layer's `render` callback
 * pushes per-frame view state into Deck so sync is exact during animated
 * pan/zoom. Deck participates in OL's layer stack (z-order / visibility).
 *
 * @see https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/openlayers
 */

import { Deck, OrthographicView } from '@deck.gl/core'
import Layer from 'ol/layer/Layer'

import { olViewStateToDeck } from './viewState.js'

export { olViewStateToDeck }

/**
 * Create a Deck instance configured for bulk-annotation overlay use.
 *
 * @param {Object} options
 * @param {HTMLElement} options.parent - Parent element for the deck canvas
 * @param {Function} [options.onError]
 * @returns {Deck|null} null when WebGL is unavailable (jsdom / headless)
 */
export function createBulkAnnotationDeck({ parent, onError }) {
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
    const view = new OrthographicView({
      id: 'bulk-ann-ortho',
      /** Match OpenLayers Y-down slide space (see geometry/coords.js). */
      flipY: false,
      controller: false,
    })

    return new Deck({
      parent,
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
       * @see plan adversarial review — ~1.4 GB dead positions scratch otherwise.
       */
      _typedArrayManagerProps: { overAlloc: 1, poolSize: 0 },
      deviceProps: { type: 'webgl' },
      layers: [],
      onError:
        onError ||
        ((err) => {
          console.error('[bulkAnnotations] Deck error', err)
        }),
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
 * @param {Deck} options.deck
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
          'bulk-ann-ortho': deckViewState,
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
 * @param {Deck|null} options.deck
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
      deck.finalize()
    } catch (error) {
      console.warn('[bulkAnnotations] Deck finalize failed', error)
    }
  }
}
