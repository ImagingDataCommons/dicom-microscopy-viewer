/**
 * True (area-weighted) polygon centroid computation over a flat XY
 * vertex buffer.
 */

/**
 * Compute the area-weighted centroid of a closed polygon ring, using the
 * shoelace-derived centroid formula.
 *
 * The polygon does not need to be explicitly closed (last vertex
 * repeating the first) - the wraparound edge from the last vertex back
 * to the first is included automatically. Because this is a true
 * affine-equivariant centroid, it can be computed either before or
 * after an affine coordinate transform with the same result (up to that
 * transform), so callers may run it directly on already-transformed OL
 * map-space positions.
 *
 * @param {Float32Array|number[]} positions - Flat XY vertex buffer
 * @param {number} start - Index (in vertices, not scalars) of the first vertex of the ring
 * @param {number} end - Index (in vertices, not scalars) one past the last vertex of the ring
 * @returns {[number, number]} `[x, y]` centroid, or `[NaN, NaN]` for a degenerate (zero-area) ring
 */
export function computePolygonCentroid(positions, start, end) {
  const n = end - start
  if (n < 3) {
    return [Number.NaN, Number.NaN]
  }

  let area = 0
  let cx = 0
  let cy = 0

  for (let i = 0; i < n; i++) {
    const i0 = start + i
    const i1 = start + ((i + 1) % n)
    const x0 = positions[i0 * 2]
    const y0 = positions[i0 * 2 + 1]
    const x1 = positions[i1 * 2]
    const y1 = positions[i1 * 2 + 1]
    const cross = x0 * y1 - x1 * y0
    area += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }

  area *= 0.5
  if (area === 0) {
    return [Number.NaN, Number.NaN]
  }

  return [cx / (6 * area), cy / (6 * area)]
}
