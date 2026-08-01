/**
 * OpenLayers view → deck.gl OrthographicView mapping (no deck import).
 */

/**
 * OL renders `pixel = T(size/2) · S(1/res, -1/res) · R(-rotation) · T(-center)`.
 * Deck's OrthographicView has no rotation input, so rotation is reproduced by
 * rotating the world through a per-layer `modelMatrix` `M = R(-rotation)`
 * (see {@link rotationModelMatrix}) and pointing the camera at the rotated
 * center `target = R(-rotation) · center`.
 *
 * @param {Object} viewState - OL render viewState
 * @param {number[]} size - [width, height] CSS pixels
 * @returns {Object}
 */
export function olViewStateToDeck(viewState, size) {
  const [width, height] = size
  const center = viewState.center
  const resolution = viewState.resolution
  const rotation = viewState.rotation ?? 0
  const zoom = resolution > 0 ? -Math.log2(resolution) : 0
  let targetX = center[0]
  let targetY = center[1]
  if (rotation !== 0) {
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)
    targetX = center[0] * cos + center[1] * sin
    targetY = -center[0] * sin + center[1] * cos
  }
  return {
    target: [targetX, targetY, 0],
    zoom,
    minZoom: -20,
    maxZoom: 20,
    width,
    height,
  }
}

/**
 * Column-major 4x4 `modelMatrix` rotating the world by `-rotation` around Z,
 * pairing with the rotated `target` from {@link olViewStateToDeck}. Returns
 * `null` for zero rotation so layers keep the identity default.
 *
 * @param {number} rotation - OL view rotation in radians
 * @returns {number[]|null}
 */
export function rotationModelMatrix(rotation) {
  if (rotation == null || rotation === 0) {
    return null
  }
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  return [cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
}
