/**
 * Helpers for turning per-annotation measurement values into the shapes the
 * deck.gl bulk-annotation layers need (a `[min, max]` domain for color
 * scales, and a per-vertex expansion for `DataFilterExtension`).
 */

/**
 * Compute the `[min, max]` range of a flat numeric array/typed array of
 * measurement values. Ignores non-finite values (`NaN`, `±Infinity`) so a
 * single bad sample can't blow out a color scale or filter domain.
 *
 * @param {ArrayLike<number>} values
 * @returns {{min: number, max: number}} `{min: 0, max: 0}` when `values` has no finite entries
 */
export function computeMeasurementRange(values) {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    if (!Number.isFinite(value)) {
      continue
    }
    if (value < min) {
      min = value
    }
    if (value > max) {
      max = value
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 0 }
  }
  return { min, max }
}

/**
 * Expand a per-annotation measurement array to a per-vertex `Float32Array` so
 * it can be plugged directly into a deck.gl `DataFilterExtension` filter
 * value accessor, which needs one value per vertex rather than one per
 * annotation.
 *
 * The value for annotation `k` is repeated across vertices
 * `[startIndices[k], startIndices[k + 1])` (or through `vertexCount` for the
 * last annotation).
 *
 * @param {ArrayLike<number>} values - One measurement value per annotation
 * @param {ArrayLike<number>} startIndices - First vertex index of each annotation (same length as `values`)
 * @param {number} vertexCount - Total number of vertices to fill
 * @returns {Float32Array} Length `vertexCount`, one value per vertex
 */
export function expandMeasurementToPerVertex(
  values,
  startIndices,
  vertexCount,
) {
  const out = new Float32Array(vertexCount)
  const numberOfAnnotations = values.length
  for (let i = 0; i < numberOfAnnotations; i++) {
    const start = Math.max(0, Number(startIndices[i]))
    const end =
      i + 1 < numberOfAnnotations
        ? Math.min(vertexCount, Number(startIndices[i + 1]))
        : vertexCount
    const value = Number(values[i])
    for (let v = start; v < end; v++) {
      out[v] = value
    }
  }
  return out
}
