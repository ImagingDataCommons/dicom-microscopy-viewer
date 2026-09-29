/**
 * CPU picking for bulk annotations (deck layers use pickable:false).
 *
 * Uses a Flatbush spatial index over annotation bboxes / centroids, then
 * exact point-in-polygon (or distance-to-polyline / point hit) against the
 * flat coordinate buffer — so polygon interiors are pickable like OL's
 * transparent fill.
 */

import Flatbush from 'flatbush'

/**
 * Build a Flatbush index from per-annotation bboxes.
 *
 * @param {Float32Array} bboxes - N*4 [minX, minY, maxX, maxY]
 * @param {number} numberOfAnnotations
 * @returns {Flatbush|null}
 */
export function buildSpatialIndex(bboxes, numberOfAnnotations) {
  if (numberOfAnnotations <= 0 || bboxes == null) {
    return null
  }
  const index = new Flatbush(numberOfAnnotations)
  for (let i = 0; i < numberOfAnnotations; i++) {
    const o = i * 4
    index.add(bboxes[o], bboxes[o + 1], bboxes[o + 2], bboxes[o + 3])
  }
  index.finish()
  return index
}

/**
 * Ray-casting point-in-polygon over a flat XY ring (may be open or closed).
 *
 * @param {number} x
 * @param {number} y
 * @param {Float32Array} positions
 * @param {number} startVertex - inclusive vertex index
 * @param {number} endVertex - exclusive vertex index
 * @returns {boolean}
 */
export function pointInPolygonFlat(x, y, positions, startVertex, endVertex) {
  let inside = false
  const n = endVertex - startVertex
  if (n < 3) {
    return false
  }
  let j = endVertex - 1
  for (let i = startVertex; i < endVertex; i++) {
    const xi = positions[i * 2]
    const yi = positions[i * 2 + 1]
    const xj = positions[j * 2]
    const yj = positions[j * 2 + 1]
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi
    if (intersect) {
      inside = !inside
    }
    j = i
  }
  return inside
}

/**
 * Squared distance from point to a polyline segment chain.
 *
 * @returns {number}
 */
export function distanceSqToPolyline(x, y, positions, startVertex, endVertex) {
  let min = Number.POSITIVE_INFINITY
  for (let i = startVertex; i + 1 < endVertex; i++) {
    const x1 = positions[i * 2]
    const y1 = positions[i * 2 + 1]
    const x2 = positions[(i + 1) * 2]
    const y2 = positions[(i + 1) * 2 + 1]
    const d = distSqPointToSegment(x, y, x1, y1, x2, y2)
    if (d < min) {
      min = d
    }
  }
  return min
}

function distSqPointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  let t = 0
  if (lenSq > 0) {
    t = ((px - x1) * dx + (py - y1) * dy) / lenSq
    t = Math.max(0, Math.min(1, t))
  }
  const qx = x1 + t * dx
  const qy = y1 + t * dy
  const ex = px - qx
  const ey = py - qy
  return ex * ex + ey * ey
}

/**
 * Pick the topmost annotation under an OL map coordinate.
 *
 * @param {Object} options
 * @param {number} options.x - OL map X
 * @param {number} options.y - OL map Y
 * @param {number} [options.hitToleranceWorld=2] - world-unit pad for points/polylines
 * @param {Array<{
 *   uid: string,
 *   graphicType: string,
 *   index: Flatbush|null,
 *   positions: Float32Array,
 *   startIndices: Uint32Array,
 *   numberOfAnnotations: number,
 *   visible: boolean,
 * }>} options.groups - visible groups, top-most last
 * @returns {{ annotationGroupUID: string, annotationIndex: number } | null}
 */
export function pickBulkAnnotation({ x, y, hitToleranceWorld = 2, groups }) {
  const tolSq = hitToleranceWorld * hitToleranceWorld
  for (let g = groups.length - 1; g >= 0; g--) {
    const group = groups[g]
    if (!group.visible || group.index == null) {
      continue
    }
    const pad = hitToleranceWorld
    const candidates = group.index.search(x - pad, y - pad, x + pad, y + pad)
    for (let c = candidates.length - 1; c >= 0; c--) {
      const annotationIndex = candidates[c]
      const start = group.startIndices[annotationIndex]
      const end = group.startIndices[annotationIndex + 1]
      const type = group.graphicType
      if (type === 'POINT') {
        const px = group.positions[start * 2]
        const py = group.positions[start * 2 + 1]
        const dx = x - px
        const dy = y - py
        if (dx * dx + dy * dy <= tolSq) {
          return { annotationGroupUID: group.uid, annotationIndex }
        }
      } else if (type === 'POLYLINE') {
        if (distanceSqToPolyline(x, y, group.positions, start, end) <= tolSq) {
          return { annotationGroupUID: group.uid, annotationIndex }
        }
      } else {
        /** POLYGON / RECTANGLE / ELLIPSE — interior hit. */
        if (pointInPolygonFlat(x, y, group.positions, start, end)) {
          return { annotationGroupUID: group.uid, annotationIndex }
        }
      }
    }
  }
  return null
}

/**
 * Build the stable ROI uid convention slim depends on.
 *
 * @param {string} annotationGroupUID
 * @param {number} annotationIndex
 * @returns {string}
 */
export function makeBulkAnnotationRoiUid(annotationGroupUID, annotationIndex) {
  return `${annotationGroupUID}-${annotationIndex}`
}
