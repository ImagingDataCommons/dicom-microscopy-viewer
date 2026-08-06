import { DataFilterExtension } from '@deck.gl/extensions'
import { ScatterplotLayer } from '@deck.gl/layers'

/**
 * Create a binary-attribute `ScatterplotLayer` for annotation centroids
 * (overview LOD tier) or for POINT graphic-type groups.
 *
 * @param {Object} options
 * @param {string} options.id - Layer id
 * @param {Object} [options.data] - Prebuilt binary data object; pass the same reference across rebuilds to avoid re-upload. Takes precedence over `positions`.
 * @param {Float32Array} [options.positions] - Flat XY position buffer, OL map space
 * @param {number} [options.length] - Number of points
 * @param {number[]} options.color - Constant RGBA fill color, e.g. `[r, g, b, a]`
 * @param {number} options.radiusPixels - Constant point radius in pixels
 * @param {boolean} [options.visible=true] - Layer visibility
 * @param {Float32Array} [options.filterValues] - Per-point filter values for `DataFilterExtension` (ignored when `data` already carries `getFilterValue`)
 * @param {[number, number]} [options.filterRange] - `[min, max]` range passed to the filter extension
 * @param {number[]} [options.modelMatrix] - Column-major 4x4 model matrix (e.g. for OL view rotation)
 * @returns {ScatterplotLayer} Configured deck.gl `ScatterplotLayer`
 */
export function createPointLayer({
  id,
  data,
  positions,
  length,
  color,
  radiusPixels,
  visible = true,
  filterValues,
  filterRange,
  modelMatrix,
}) {
  const layerData = data ?? {
    length,
    attributes: {
      getPosition: { value: positions, size: 2 },
      ...(filterValues != null
        ? { getFilterValue: { value: filterValues, size: 1 } }
        : {}),
    },
  }
  const hasFilter = layerData.attributes?.getFilterValue != null

  return new ScatterplotLayer({
    id,
    data: layerData,
    positionFormat: 'XY',
    getFillColor: color,
    stroked: false,
    filled: true,
    getRadius: radiusPixels,
    radiusUnits: 'pixels',
    radiusMinPixels: radiusPixels,
    radiusMaxPixels: radiusPixels,
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
