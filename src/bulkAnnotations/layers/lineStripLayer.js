import { PathLayer } from '@deck.gl/layers'

/**
 * Create the mid-zoom "line strip" LOD layer for bulk annotation
 * outlines.
 *
 * A true custom `Layer` with a WebGL2 `line-strip` topology and
 * primitive restart would be cheaper per vertex than `PathLayer`'s
 * 6-geometry-vertex-per-path-vertex instancing, but ANGLE (the WebGL
 * backend used by most browsers) clamps line width to 1px regardless of
 * the requested width. Since this LOD tier is only ever rendered at
 * 1px, a plain `PathLayer` pinned to `getWidth: 1` is visually
 * indistinguishable from a dedicated primitive-restart layer while
 * being far simpler to implement and maintain. Replace this factory
 * with a custom `Layer` subclass if profiling shows the extra
 * per-vertex instancing cost matters at this tier.
 *
 * @param {Object} options
 * @param {string} options.id - Layer id
 * @param {Object} [options.data] - Prebuilt binary data object; pass the same reference across rebuilds to avoid re-tessellation/re-upload. Takes precedence over `positions`/`startIndices`.
 * @param {Float32Array} [options.positions] - Flat XY vertex buffer, OL map space
 * @param {Uint32Array} [options.startIndices] - Path start offsets, length `length + 1`
 * @param {number} [options.length] - Number of paths (annotations)
 * @param {number[]} options.color - Constant RGBA color, e.g. `[r, g, b, a]`
 * @param {boolean} [options.visible=true] - Layer visibility
 * @param {number[]} [options.modelMatrix] - Column-major 4x4 model matrix (e.g. for OL view rotation)
 * @returns {PathLayer} Configured deck.gl `PathLayer` pinned to a 1px width
 */
export function createLineStripLayer({
  id,
  data,
  positions,
  startIndices,
  length,
  color,
  visible = true,
  modelMatrix,
}) {
  return new PathLayer({
    id,
    data: data ?? {
      length,
      startIndices,
      attributes: {
        getPath: { value: positions, size: 2 },
        // Inert key: neutralizes PathTesselator's dead `positions` scratch buffer.
        positions: null,
      },
    },
    _pathType: 'open',
    positionFormat: 'XY',
    capRounded: false,
    jointRounded: false,
    getColor: color,
    // ANGLE caps line width at 1px; requesting more than that is a no-op on most browsers.
    getWidth: 1,
    widthUnits: 'pixels',
    widthMinPixels: 1,
    widthMaxPixels: 1,
    pickable: false,
    visible,
    ...(modelMatrix != null ? { modelMatrix } : {}),
  })
}
