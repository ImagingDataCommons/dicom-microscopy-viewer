/**
 * Decode DICOM bulk annotation graphic data into flat, GPU-ready typed
 * arrays (OL map-space Float32 positions + Uint32 path start indices +
 * per-annotation centroids/bboxes).
 */

import { computePolygonCentroid } from './centroids.js'
import {
  bulkVertexToOlMapFastWrite,
  isFiniteVertexXY,
  readTripleFromGraphicBuffer,
} from './coords.js'

const ABORT_POLL_INTERVAL = 512
const ELLIPSE_SEGMENTS = 64

/** Graphic types whose vertex ring is closed and should use an area centroid. */
const CLOSED_GRAPHIC_TYPES = new Set(['POLYGON', 'RECTANGLE', 'ELLIPSE'])

/**
 * Throw an `AbortError` to unwind out of a decode loop.
 *
 * @returns {never}
 * @private
 */
function throwAbort() {
  const error = new Error('Bulk annotation geometry decode was aborted.')
  error.name = 'AbortError'
  throw error
}

/**
 * Poll the caller-supplied cancellation predicate every
 * `ABORT_POLL_INTERVAL` annotations.
 *
 * @param {Function|undefined} shouldContinue - Returns `false` to request abort
 * @param {number} annotationIndex - Current annotation index
 * @returns {void}
 * @private
 */
function pollAbort(shouldContinue, annotationIndex) {
  if (
    typeof shouldContinue === 'function' &&
    annotationIndex % ABORT_POLL_INTERVAL === 0 &&
    shouldContinue() === false
  ) {
    throwAbort()
  }
}

/**
 * Decode a POINT graphic-type group: one vertex per annotation.
 *
 * @param {Object} options
 * @returns {{positions: Float32Array, startIndices: Uint32Array}}
 * @private
 */
function decodePointGroup({
  graphicData,
  graphicIndex,
  coordinateDimensionality,
  commonZCoordinate,
  numberOfAnnotations,
  coeffs,
  shouldContinue,
}) {
  const positions = new Float32Array(numberOfAnnotations * 2)
  const startIndices = new Uint32Array(numberOfAnnotations + 1)

  let vertexCursor = 0
  for (let i = 0; i < numberOfAnnotations; i++) {
    pollAbort(shouldContinue, i)
    startIndices[i] = vertexCursor

    const offset = graphicIndex
      ? graphicIndex[i] - 1
      : i * coordinateDimensionality
    const [gx, gy] = readTripleFromGraphicBuffer(
      graphicData,
      offset,
      commonZCoordinate,
    )
    if (isFiniteVertexXY(gx, gy)) {
      bulkVertexToOlMapFastWrite(gx, gy, coeffs, positions, vertexCursor * 2)
      vertexCursor += 1
    }
  }
  startIndices[numberOfAnnotations] = vertexCursor

  return { positions: positions.subarray(0, vertexCursor * 2), startIndices }
}

/**
 * Decode a group whose annotations are each a sequence of raw
 * `(gx, gy)` vertices located via a `getSpan(annotationIndex)` callback
 * (used for POLYGON, POLYLINE and RECTANGLE). Non-finite vertices are
 * dropped; when `closeRing` is set, a closing vertex repeating the
 * first valid vertex is appended unless the sequence is already closed.
 *
 * Runs a first, transform-free pass to size the output buffers exactly
 * (so the fill pass can write straight into the final typed arrays with
 * no growth/copy), using only raw-coordinate comparisons so both passes
 * make identical skip/close decisions.
 *
 * @param {Object} options
 * @returns {{positions: Float32Array, startIndices: Uint32Array}}
 * @private
 */
function decodeRawVertexGroup({
  getSpan,
  graphicData,
  coordinateDimensionality,
  numberOfAnnotations,
  coeffs,
  shouldContinue,
  closeRing,
}) {
  const startIndices = new Uint32Array(numberOfAnnotations + 1)
  const spanOffsets = new Int32Array(numberOfAnnotations)
  const spanRawCounts = new Int32Array(numberOfAnnotations)

  let totalVertices = 0
  for (let i = 0; i < numberOfAnnotations; i++) {
    pollAbort(shouldContinue, i)

    const span = getSpan(i)
    spanOffsets[i] = span.offset
    spanRawCounts[i] = span.rawCount

    let validCount = 0
    let firstX = Number.NaN
    let firstY = Number.NaN
    let lastX = Number.NaN
    let lastY = Number.NaN
    for (let k = 0; k < span.rawCount; k++) {
      const j = span.offset + k * coordinateDimensionality
      const gx = graphicData[j]
      const gy = graphicData[j + 1]
      if (!isFiniteVertexXY(gx, gy)) {
        continue
      }
      if (validCount === 0) {
        firstX = gx
        firstY = gy
      }
      lastX = gx
      lastY = gy
      validCount += 1
    }

    let vertexCount = validCount
    if (closeRing && validCount > 0 && (firstX !== lastX || firstY !== lastY)) {
      vertexCount += 1
    }

    startIndices[i] = totalVertices
    totalVertices += vertexCount
  }
  startIndices[numberOfAnnotations] = totalVertices

  const positions = new Float32Array(totalVertices * 2)
  for (let i = 0; i < numberOfAnnotations; i++) {
    pollAbort(shouldContinue, i)

    const offset = spanOffsets[i]
    const rawCount = spanRawCounts[i]
    let writeIndex = startIndices[i] * 2

    let rawFirstX = Number.NaN
    let rawFirstY = Number.NaN
    let rawLastX = Number.NaN
    let rawLastY = Number.NaN
    let wroteFirst = false

    for (let k = 0; k < rawCount; k++) {
      const j = offset + k * coordinateDimensionality
      const gx = graphicData[j]
      const gy = graphicData[j + 1]
      if (!isFiniteVertexXY(gx, gy)) {
        continue
      }
      bulkVertexToOlMapFastWrite(gx, gy, coeffs, positions, writeIndex)
      if (!wroteFirst) {
        rawFirstX = gx
        rawFirstY = gy
        wroteFirst = true
      }
      rawLastX = gx
      rawLastY = gy
      writeIndex += 2
    }

    if (
      closeRing &&
      wroteFirst &&
      (rawLastX !== rawFirstX || rawLastY !== rawFirstY)
    ) {
      bulkVertexToOlMapFastWrite(
        rawFirstX,
        rawFirstY,
        coeffs,
        positions,
        writeIndex,
      )
    }
  }

  return { positions, startIndices }
}

/**
 * Decode an ELLIPSE graphic-type group by tessellating each annotation's
 * major/minor axis endpoints into a closed ~64-segment ring, following
 * `getEllipseFeature` in `bulkAnnotations/utils.js`.
 *
 * For simplicity, tessellation runs directly on the raw (pre-`coeffs`)
 * vertex space rather than reproducing the legacy two-stage
 * pixel-to-slide-then-affine-inverse pipeline; `coeffs` (a single
 * composed linear map) is applied to each tessellated point afterward.
 * This is equivalent to the legacy behavior when the composed transform
 * is similarity-like (uniform scale + rotation), and only diverges from
 * pixel-perfect legacy parity for anisotropically-scaled/rotated 2D
 * pixel-to-slide transforms, an acceptable tradeoff for this LOD tier.
 *
 * @param {Object} options
 * @returns {{positions: Float32Array, startIndices: Uint32Array}}
 * @private
 */
function decodeEllipseGroup({
  graphicData,
  coordinateDimensionality,
  numberOfAnnotations,
  coeffs,
  shouldContinue,
}) {
  const stride = coordinateDimensionality * 4
  const startIndices = new Uint32Array(numberOfAnnotations + 1)
  const validFlags = new Uint8Array(numberOfAnnotations)

  const readAxisEndpoints = (offset) => ({
    majorStartX: graphicData[offset],
    majorStartY: graphicData[offset + 1],
    majorEndX: graphicData[offset + coordinateDimensionality],
    majorEndY: graphicData[offset + coordinateDimensionality + 1],
    minorStartX: graphicData[offset + coordinateDimensionality * 2],
    minorStartY: graphicData[offset + coordinateDimensionality * 2 + 1],
    minorEndX: graphicData[offset + coordinateDimensionality * 3],
    minorEndY: graphicData[offset + coordinateDimensionality * 3 + 1],
  })

  let totalVertices = 0
  for (let i = 0; i < numberOfAnnotations; i++) {
    pollAbort(shouldContinue, i)
    const axes = readAxisEndpoints(i * stride)
    const valid =
      isFiniteVertexXY(axes.majorStartX, axes.majorStartY) &&
      isFiniteVertexXY(axes.majorEndX, axes.majorEndY) &&
      isFiniteVertexXY(axes.minorStartX, axes.minorStartY) &&
      isFiniteVertexXY(axes.minorEndX, axes.minorEndY)
    validFlags[i] = valid ? 1 : 0
    startIndices[i] = totalVertices
    if (valid) {
      totalVertices += ELLIPSE_SEGMENTS + 1
    }
  }
  startIndices[numberOfAnnotations] = totalVertices

  const positions = new Float32Array(totalVertices * 2)
  for (let i = 0; i < numberOfAnnotations; i++) {
    pollAbort(shouldContinue, i)
    if (!validFlags[i]) {
      continue
    }

    const axes = readAxisEndpoints(i * stride)
    const semiMajor =
      Math.hypot(
        axes.majorEndX - axes.majorStartX,
        axes.majorEndY - axes.majorStartY,
      ) / 2
    const semiMinor =
      Math.hypot(
        axes.minorEndX - axes.minorStartX,
        axes.minorEndY - axes.minorStartY,
      ) / 2
    const rotation = Math.atan2(
      axes.majorEndY - axes.majorStartY,
      axes.majorEndX - axes.majorStartX,
    )
    const centerX = (axes.majorStartX + axes.majorEndX) / 2
    const centerY = (axes.majorStartY + axes.majorEndY) / 2
    const cosR = Math.cos(rotation)
    const sinR = Math.sin(rotation)

    let writeIndex = startIndices[i] * 2
    let firstGx = 0
    let firstGy = 0
    for (let s = 0; s <= ELLIPSE_SEGMENTS; s++) {
      let gx
      let gy
      if (s === ELLIPSE_SEGMENTS) {
        gx = firstGx
        gy = firstGy
      } else {
        const angle = (2 * Math.PI * s) / ELLIPSE_SEGMENTS
        const localX = semiMajor * Math.cos(angle)
        const localY = semiMinor * Math.sin(angle)
        gx = centerX + localX * cosR - localY * sinR
        gy = centerY + localX * sinR + localY * cosR
        if (s === 0) {
          firstGx = gx
          firstGy = gy
        }
      }
      bulkVertexToOlMapFastWrite(gx, gy, coeffs, positions, writeIndex)
      writeIndex += 2
    }
  }

  return { positions, startIndices }
}

/**
 * Compute per-annotation centroids and bounding boxes from already
 * position-decoded (OL map-space) vertex data.
 *
 * @param {Object} options
 * @param {Float32Array} options.positions - Flat XY vertex buffer
 * @param {Uint32Array} options.startIndices - Vertex-count start offsets, length N+1
 * @param {number} options.numberOfAnnotations - Number of annotations (N)
 * @param {string} options.graphicType - DICOM graphic type
 * @returns {{centroids: Float32Array, bboxes: Float32Array}}
 * @private
 */
function computeCentroidsAndBboxes({
  positions,
  startIndices,
  numberOfAnnotations,
  graphicType,
}) {
  const centroids = new Float32Array(numberOfAnnotations * 2)
  const bboxes = new Float32Array(numberOfAnnotations * 4)
  const useAreaCentroid = CLOSED_GRAPHIC_TYPES.has(graphicType)

  for (let i = 0; i < numberOfAnnotations; i++) {
    const start = startIndices[i]
    const end = startIndices[i + 1]
    const centroidOffset = i * 2
    const bboxOffset = i * 4

    if (end <= start) {
      continue
    }

    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    let sumX = 0
    let sumY = 0
    for (let v = start; v < end; v++) {
      const x = positions[v * 2]
      const y = positions[v * 2 + 1]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      sumX += x
      sumY += y
    }
    bboxes[bboxOffset] = minX
    bboxes[bboxOffset + 1] = minY
    bboxes[bboxOffset + 2] = maxX
    bboxes[bboxOffset + 3] = maxY

    const vertexCount = end - start
    let cx
    let cy
    if (useAreaCentroid && vertexCount >= 3) {
      const centroid = computePolygonCentroid(positions, start, end)
      if (Number.isFinite(centroid[0]) && Number.isFinite(centroid[1])) {
        ;[cx, cy] = centroid
      }
    }
    if (cx === undefined) {
      cx = sumX / vertexCount
      cy = sumY / vertexCount
    }

    centroids[centroidOffset] = cx
    centroids[centroidOffset + 1] = cy
  }

  return { centroids, bboxes }
}

/**
 * Decode a full bulk annotation graphic-data group into flat, GPU-ready
 * typed arrays.
 *
 * @param {Object} options
 * @param {string} options.graphicType - One of `POINT`, `POLYGON`, `POLYLINE`, `RECTANGLE`, `ELLIPSE`
 * @param {TypedArray} options.graphicData - Flat DICOM coordinate buffer for the whole group
 * @param {TypedArray} [options.graphicIndex] - 1-based scalar offsets of each annotation's first coordinate (required for POLYGON/POLYLINE; optional for POINT)
 * @param {number} [options.coordinateDimensionality=2] - 2 for (x, y), 3 for (x, y, z) per vertex
 * @param {number} [options.commonZCoordinate=NaN] - Z coordinate shared across all annotations, or `NaN` if per-vertex
 * @param {number} options.numberOfAnnotations - Number of annotations in the group (N)
 * @param {import('./coords.js').LinearCoeffs} options.coeffs - Composed linear transform to base-level pixel space
 * @param {string} [options.annotationCoordinateType] - `'2D'` or `'3D'`; accepted for parity/context, the coordinate transform itself is fully determined by `coeffs`
 * @param {Function} [options.shouldContinue] - Polled periodically; returning `false` aborts decoding with an `AbortError`
 * @returns {{
 *   positions: Float32Array,
 *   startIndices: Uint32Array,
 *   centroids: Float32Array,
 *   bboxes: Float32Array,
 *   numberOfAnnotations: number,
 *   graphicType: string,
 *   vertexCount: number,
 * }}
 */
export function decodeGraphicGroup(options) {
  const {
    graphicType,
    graphicData,
    graphicIndex,
    coordinateDimensionality = 2,
    commonZCoordinate = Number.NaN,
    numberOfAnnotations,
    coeffs,
    shouldContinue,
  } = options

  let positions
  let startIndices

  if (graphicType === 'POINT') {
    ;({ positions, startIndices } = decodePointGroup({
      graphicData,
      graphicIndex,
      coordinateDimensionality,
      commonZCoordinate,
      numberOfAnnotations,
      coeffs,
      shouldContinue,
    }))
  } else if (graphicType === 'POLYGON' || graphicType === 'POLYLINE') {
    ;({ positions, startIndices } = decodeRawVertexGroup({
      getSpan: (i) => {
        const offset = graphicIndex[i] - 1
        const nextOffset =
          i < numberOfAnnotations - 1
            ? graphicIndex[i + 1] - 1
            : graphicData.length
        return {
          offset,
          rawCount: Math.max(
            0,
            Math.floor((nextOffset - offset) / coordinateDimensionality),
          ),
        }
      },
      graphicData,
      coordinateDimensionality,
      numberOfAnnotations,
      coeffs,
      shouldContinue,
      closeRing: graphicType === 'POLYGON',
    }))
  } else if (graphicType === 'RECTANGLE') {
    const stride = coordinateDimensionality * 4
    ;({ positions, startIndices } = decodeRawVertexGroup({
      getSpan: (i) => ({ offset: i * stride, rawCount: 4 }),
      graphicData,
      coordinateDimensionality,
      numberOfAnnotations,
      coeffs,
      shouldContinue,
      closeRing: true,
    }))
  } else if (graphicType === 'ELLIPSE') {
    ;({ positions, startIndices } = decodeEllipseGroup({
      graphicData,
      coordinateDimensionality,
      numberOfAnnotations,
      coeffs,
      shouldContinue,
    }))
  } else {
    throw new Error(`Unsupported graphic type "${graphicType}".`)
  }

  const { centroids, bboxes } = computeCentroidsAndBboxes({
    positions,
    startIndices,
    numberOfAnnotations,
    graphicType,
  })

  return {
    positions,
    startIndices,
    centroids,
    bboxes,
    numberOfAnnotations,
    graphicType,
    vertexCount: positions.length / 2,
  }
}
