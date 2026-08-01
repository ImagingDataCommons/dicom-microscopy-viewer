/**
 * OpenLayers view → deck.gl OrthographicView mapping (no deck import).
 */

/**
 * @param {Object} viewState - OL render viewState
 * @param {number[]} size - [width, height] CSS pixels
 * @returns {Object}
 */
export function olViewStateToDeck(viewState, size) {
  const [width, height] = size
  const center = viewState.center
  const resolution = viewState.resolution
  const zoom = resolution > 0 ? -Math.log2(resolution) : 0
  return {
    target: [center[0], center[1], 0],
    zoom,
    minZoom: -20,
    maxZoom: 20,
    width,
    height,
  }
}
