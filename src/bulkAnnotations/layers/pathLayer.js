import { DataFilterExtension } from '@deck.gl/extensions'
import { PathLayer } from '@deck.gl/layers'

/**
 * Create a binary-attribute `PathLayer` for bulk annotation polygon /
 * polyline outlines.
 *
 * Feeds `data.attributes.getPath` directly (zero-copy over the decoded
 * Float32 position buffer) and neutralizes `PathTesselator`'s internal
 * `positions` scratch buffer: the tesselator's `_allocate` step always
 * allocates a slot keyed by `data.attributes.positions` regardless of
 * whether `getPath` itself is binary, which otherwise wastes an unused
 * Float64Array sized to the full vertex count (~1.4 GB at 30M
 * vertices). Passing `positions: null` in `data.attributes` makes the
 * tesselator skip that allocation.
 *
 * @param {Object} options
 * @param {string} options.id - Layer id
 * @param {Object} [options.data] - Prebuilt binary data object; pass the same reference across rebuilds to avoid re-tessellation/re-upload. Takes precedence over `positions`/`startIndices`.
 * @param {Float32Array} [options.positions] - Flat XY vertex buffer, OL map space
 * @param {Uint32Array} [options.startIndices] - Path start offsets, length `length + 1`
 * @param {number} [options.length] - Number of paths (annotations)
 * @param {number[]} options.color - Constant RGBA color, e.g. `[r, g, b, a]`
 * @param {number} options.widthPixels - Constant stroke width in pixels
 * @param {boolean} [options.visible=true] - Layer visibility
 * @param {Float32Array} [options.filterValues] - Per-vertex filter values for `DataFilterExtension` (ignored when `data` already carries `getFilterValue`)
 * @param {[number, number]} [options.filterRange] - `[min, max]` range passed to the filter extension
 * @param {number[]} [options.modelMatrix] - Column-major 4x4 model matrix (e.g. for OL view rotation)
 * @returns {PathLayer} Configured deck.gl `PathLayer`
 */
export function createPathLayer({
  id,
  data,
  positions,
  startIndices,
  length,
  color,
  widthPixels,
  visible = true,
  filterValues,
  filterRange,
  modelMatrix,
}) {
  const layerData = data ?? {
    length,
    startIndices,
    attributes: {
      getPath: { value: positions, size: 2 },
      // Inert key: neutralizes PathTesselator's dead `positions` scratch buffer.
      positions: null,
      ...(filterValues != null
        ? { getFilterValue: { value: filterValues, size: 1 } }
        : {}),
    },
  }
  const hasFilter = layerData.attributes?.getFilterValue != null

  return new PathLayer({
    id,
    data: layerData,
    _pathType: 'open',
    positionFormat: 'XY',
    capRounded: true,
    jointRounded: true,
    getColor: color,
    getWidth: widthPixels,
    widthUnits: 'pixels',
    widthMinPixels: widthPixels,
    widthMaxPixels: widthPixels,
    pickable: false,
    visible,
    ...(modelMatrix != null ? { modelMatrix } : {}),
    ...(hasFilter
      ? {
          extensions: [new DataFilterExtension({ filterSize: 1 })],
          filterRange: filterRange ?? [0, 1],
        }
      : {}),
  })
}
