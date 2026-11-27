import { DataFilterExtension } from '@deck.gl/extensions'
import { SolidPolygonLayer } from '@deck.gl/layers'

/**
 * Create a binary-attribute `SolidPolygonLayer` for bulk annotation fill
 * (closed graphic types only: POLYGON, RECTANGLE, ELLIPSE).
 *
 * Reuses the same flat position buffer and `startIndices` layout as the
 * companion `PathLayer` stroke — a polygon ring and its outline path share
 * identical vertex data, just under different accessor keys (`getPolygon`
 * vs. `getPath`). Rendered with `stroked: false` since the outline is
 * already drawn by the stroke layer; drawing it twice would double-blend
 * the edge under partial opacity.
 *
 * @param {Object} options
 * @param {string} options.id - Layer id
 * @param {Object} [options.data] - Prebuilt binary data object; pass the same reference across rebuilds to avoid re-tessellation/re-upload. Takes precedence over `positions`/`startIndices`.
 * @param {Float32Array} [options.positions] - Flat XY vertex buffer, OL map space
 * @param {Uint32Array} [options.startIndices] - Ring start offsets, length `length + 1`
 * @param {number} [options.length] - Number of polygons (annotations)
 * @param {number[]} options.fillColor - Constant RGBA fill color, e.g. `[r, g, b, a]`
 * @param {boolean} [options.visible=true] - Layer visibility
 * @param {Float32Array} [options.filterValues] - Per-vertex filter values for `DataFilterExtension` (ignored when `data` already carries `getFilterValue`)
 * @param {[number, number]} [options.filterRange] - `[min, max]` range passed to the filter extension
 * @param {number[]} [options.modelMatrix] - Column-major 4x4 model matrix (e.g. for OL view rotation)
 * @returns {SolidPolygonLayer} Configured deck.gl `SolidPolygonLayer`
 */
export function createPolygonLayer({
  id,
  data,
  positions,
  startIndices,
  length,
  fillColor,
  visible = true,
  filterValues,
  filterRange,
  modelMatrix,
}) {
  const layerData = data ?? {
    length,
    startIndices,
    attributes: {
      getPolygon: { value: positions, size: 2 },
      ...(filterValues != null
        ? { getFilterValue: { value: filterValues, size: 1 } }
        : {}),
    },
  }
  const hasFilter = layerData.attributes?.getFilterValue != null

  return new SolidPolygonLayer({
    id,
    data: layerData,
    positionFormat: 'XY',
    filled: true,
    stroked: false,
    extruded: false,
    getFillColor: fillColor,
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
