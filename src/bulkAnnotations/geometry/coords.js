/**
 * Coordinate transforms for bulk annotation vertices.
 *
 * OpenLayers renders the Total Pixel Matrix with the origin at the
 * top-left and rows growing downward while the map's Y axis grows
 * upward, so a (column, row) pixel coordinate is mapped to OL map space
 * as `[column, -(row + 1)]`. This is NOT the same convention Viv uses
 * (`[column, row]`, no vertical flip) - do not port Viv's horizontal
 * flip / `worldWidth - x` logic here.
 *
 * All functions in this module are written to be worker-safe (no OL,
 * no mathjs) and allocation-light so they can run in a hot per-vertex
 * decode loop.
 */

/**
 * @typedef {readonly [number, number, number, number, number, number]} LinearCoeffs
 * Flattened 2x3 affine matrix `[m00, m01, m02, m10, m11, m12]` such that
 * `pcol = m00 * gx + m01 * gy + m02` and `prow = m10 * gx + m11 * gy + m12`.
 */

/**
 * Check whether a vertex has finite (non-NaN, non-Infinite) coordinates.
 *
 * Zero is a legal coordinate value in DICOM graphic data; only NaN /
 * Infinity indicate a genuinely missing or corrupt vertex.
 *
 * @param {number} gx - X coordinate (column or slide X)
 * @param {number} gy - Y coordinate (row or slide Y)
 * @returns {boolean} Whether both coordinates are finite
 */
export function isFiniteVertexXY(gx, gy) {
  return Number.isFinite(gx) && Number.isFinite(gy)
}

/**
 * Map a bulk annotation vertex to OpenLayers map-space XY.
 *
 * @param {number} gx - Raw vertex X (pixel column or slide X, per coeffs)
 * @param {number} gy - Raw vertex Y (pixel row or slide Y, per coeffs)
 * @param {LinearCoeffs} coeffs - Composed linear transform to base-level pixel space
 * @returns {[number, number]} `[pcol, -(prow + 1)]` OL map coordinate
 */
export function bulkVertexToOlMapFast(gx, gy, coeffs) {
  const pcol = coeffs[0] * gx + coeffs[1] * gy + coeffs[2]
  const prow = coeffs[3] * gx + coeffs[4] * gy + coeffs[5]
  return [pcol, -(prow + 1)]
}

/**
 * Map a bulk annotation vertex to OpenLayers map-space XY and write the
 * result directly into a typed-array buffer, avoiding a per-vertex
 * array allocation.
 *
 * @param {number} gx - Raw vertex X (pixel column or slide X, per coeffs)
 * @param {number} gy - Raw vertex Y (pixel row or slide Y, per coeffs)
 * @param {LinearCoeffs} coeffs - Composed linear transform to base-level pixel space
 * @param {Float32Array} target - Destination buffer
 * @param {number} writeIndex - Index of the X component; Y is written at `writeIndex + 1`
 * @returns {void}
 */
export function bulkVertexToOlMapFastWrite(gx, gy, coeffs, target, writeIndex) {
  const pcol = coeffs[0] * gx + coeffs[1] * gy + coeffs[2]
  const prow = coeffs[3] * gx + coeffs[4] * gy + coeffs[5]
  target[writeIndex] = pcol
  target[writeIndex + 1] = -(prow + 1)
}

/**
 * Read a single (x, y, z) coordinate triple out of a flat DICOM graphic
 * data buffer, substituting the shared Z coordinate when the group does
 * not carry a per-vertex Z value.
 *
 * @param {TypedArray|number[]} graphicData - Flat coordinate buffer
 * @param {number} j - Scalar offset of the X component
 * @param {number} commonZCoordinate - Z coordinate shared across all annotations in the group, or `NaN` if per-vertex Z is present
 * @returns {[number, number, number]} `[x, y, z]`
 */
export function readTripleFromGraphicBuffer(graphicData, j, commonZCoordinate) {
  const x = graphicData[j]
  const y = graphicData[j + 1]
  const z = Number.isNaN(commonZCoordinate)
    ? graphicData[j + 2]
    : commonZCoordinate
  return [x, y, z]
}

/**
 * Multiply two row-major 3x3 matrices, `a * b`, returning only the top
 * two rows since the bottom row of an affine matrix is always
 * `[0, 0, 1]`.
 *
 * @param {number[][]} a - 3x3 matrix (nested rows)
 * @param {number[][]} b - 3x3 matrix (nested rows)
 * @returns {LinearCoeffs} `[m00, m01, m02, m10, m11, m12]` of `a * b`
 * @private
 */
function multiplyAffine3x3(a, b) {
  const a00 = a[0][0]
  const a01 = a[0][1]
  const a02 = a[0][2]
  const a10 = a[1][0]
  const a11 = a[1][1]
  const a12 = a[1][2]

  const b00 = b[0][0]
  const b01 = b[0][1]
  const b02 = b[0][2]
  const b10 = b[1][0]
  const b11 = b[1][1]
  const b12 = b[1][2]
  const b20 = b[2] != null ? b[2][0] : 0
  const b21 = b[2] != null ? b[2][1] : 0
  const b22 = b[2] != null ? b[2][2] : 1

  return [
    a00 * b00 + a01 * b10 + a02 * b20,
    a00 * b01 + a01 * b11 + a02 * b21,
    a00 * b02 + a01 * b12 + a02 * b22,
    a10 * b00 + a11 * b10 + a12 * b20,
    a10 * b01 + a11 * b11 + a12 * b21,
    a10 * b02 + a11 * b12 + a12 * b22,
  ]
}

/**
 * Build 6 linear coefficients from a 3x3 affine matrix, accepting either
 * a row-major nested `number[][]` or a row-major flat 9-element array.
 *
 * @param {number[][]|number[]} affine - 3x3 affine transformation matrix
 * @returns {LinearCoeffs} `[m00, m01, m02, m10, m11, m12]`
 */
export function coeffsFromAffine3x3(affine) {
  if (Array.isArray(affine[0])) {
    return [
      affine[0][0],
      affine[0][1],
      affine[0][2],
      affine[1][0],
      affine[1][1],
      affine[1][2],
    ]
  }
  return [affine[0], affine[1], affine[2], affine[3], affine[4], affine[5]]
}

/**
 * Multiply two 3x3 affines, `a * b` (i.e. `b` is applied first, then
 * `a`), and return the result as flattened `LinearCoeffs`.
 *
 * @param {number[][]} a - 3x3 affine matrix (nested rows), applied second
 * @param {number[][]} b - 3x3 affine matrix (nested rows), applied first
 * @returns {LinearCoeffs} Composed `[m00, m01, m02, m10, m11, m12]`
 */
export function composeAffinesToCoeffs(a, b) {
  return multiplyAffine3x3(a, b)
}

/**
 * Build the pixel-to-slide affine transformation matrix for a pyramid
 * level from its `ImageOrientationSlide`, pixel spacing and origin.
 *
 * Ported from `buildTransform` in `src/utils.js`, without the mathjs
 * dependency, so it can run in a worker decode loop.
 *
 * @param {Object} options
 * @param {number[]} options.orientation - `ImageOrientationSlide` direction cosines (6 values)
 * @param {number[]} options.spacing - `[rowSpacing, columnSpacing]` in mm
 * @param {number[]} options.offset - `[xOffset, yOffset]` slide-coordinate origin of the level, in mm
 * @returns {number[][]} 3x3 pixel-to-slide affine matrix (nested rows)
 */
export function buildPixelToSlideAffine({ orientation, spacing, offset }) {
  const affine = [
    [orientation[0] * spacing[1], orientation[3] * spacing[0], offset[0]],
    [orientation[1] * spacing[1], orientation[4] * spacing[0], offset[1]],
    [0, 0, 1],
  ]
  const correction = [
    [1, 0, -0.5],
    [0, 1, -0.5],
    [0, 0, 1],
  ]
  return [
    [
      affine[0][0] * correction[0][0] +
        affine[0][1] * correction[1][0] +
        affine[0][2] * correction[2][0],
      affine[0][0] * correction[0][1] +
        affine[0][1] * correction[1][1] +
        affine[0][2] * correction[2][1],
      affine[0][0] * correction[0][2] +
        affine[0][1] * correction[1][2] +
        affine[0][2] * correction[2][2],
    ],
    [
      affine[1][0] * correction[0][0] +
        affine[1][1] * correction[1][0] +
        affine[1][2] * correction[2][0],
      affine[1][0] * correction[0][1] +
        affine[1][1] * correction[1][1] +
        affine[1][2] * correction[2][1],
      affine[1][0] * correction[0][2] +
        affine[1][1] * correction[1][2] +
        affine[1][2] * correction[2][2],
    ],
    [0, 0, 1],
  ]
}

/**
 * Extract the pixel spacing of a pyramid level from its
 * `SharedFunctionalGroupsSequence`, mirroring `getPixelSpacing` in
 * `src/scoord3dUtils.js` without pulling in OL-dependent modules.
 *
 * @param {Object} levelMetadata - Pyramid level metadata
 * @returns {[number, number]} `[rowSpacing, columnSpacing]` in mm
 * @private
 */
function getPixelSpacingFromMetadata(levelMetadata) {
  const functionalGroup = levelMetadata.SharedFunctionalGroupsSequence[0]
  const pixelMeasures = functionalGroup.PixelMeasuresSequence[0]
  return [
    Number(pixelMeasures.PixelSpacing[0]),
    Number(pixelMeasures.PixelSpacing[1]),
  ]
}

/**
 * Resolve the `LinearCoeffs` to use for a given annotation group,
 * composing the referenced pyramid level's pixel-to-slide affine with
 * the base-level slide-to-pixel inverse affine, as needed for the
 * group's `AnnotationCoordinateType`.
 *
 * Ported from `getAffineBasedOnPyramidLevel` in
 * `src/bulkAnnotations/utils.js`. Unlike that function, this warns
 * (rather than silently falling back) when the referenced SOP Instance
 * is not present in the pyramid, since falling back to the base level's
 * affine scales every coordinate by the downsample factor.
 *
 * @param {Object} options
 * @param {Object[]} options.pyramid - Array of pyramid level metadata
 * @param {Object} options.annotationGroup - Annotation group descriptor with a `metadata` property (`ReferencedImageSequence`, `AnnotationCoordinateType`)
 * @param {Object} [options.metadata] - Top-level bulk annotations metadata, used as a fallback source for `AnnotationCoordinateType`
 * @param {number[][]} options.baseAffineInverse - 3x3 slide-to-pixel affine for the base (full-resolution) pyramid level
 * @returns {LinearCoeffs} Coefficients mapping raw vertex coordinates to base-level pixel space
 */
export function affineForReferencedPyramidLevel({
  pyramid,
  annotationGroup,
  metadata,
  baseAffineInverse,
}) {
  const annotationCoordinateType =
    annotationGroup?.metadata?.AnnotationCoordinateType ??
    metadata?.AnnotationCoordinateType

  if (annotationCoordinateType !== '2D') {
    // gx, gy are already slide coordinates; only the base-level inverse applies.
    return coeffsFromAffine3x3(baseAffineInverse)
  }

  const referencedImage =
    annotationGroup?.metadata?.ReferencedImageSequence?.[0]
  const referencedSOPInstanceUID = referencedImage?.ReferencedSOPInstanceUID

  const referencedLevelMetadata = pyramid?.find(
    (level) => level.SOPInstanceUID === referencedSOPInstanceUID,
  )

  if (referencedLevelMetadata?.ImageOrientationSlide == null) {
    console.warn(
      `Bulk annotation group references pyramid level "${referencedSOPInstanceUID}", ` +
        'which was not found. Falling back to the base-level affine; ' +
        'coordinates may be scaled incorrectly.',
    )
    return coeffsFromAffine3x3(baseAffineInverse)
  }

  const orientation = referencedLevelMetadata.ImageOrientationSlide
  const spacing = getPixelSpacingFromMetadata(referencedLevelMetadata)
  const origin = referencedLevelMetadata.TotalPixelMatrixOriginSequence[0]
  const offset = [
    Number(origin.XOffsetInSlideCoordinateSystem),
    Number(origin.YOffsetInSlideCoordinateSystem),
  ]

  const pixelToSlide = buildPixelToSlideAffine({ orientation, spacing, offset })
  return composeAffinesToCoeffs(baseAffineInverse, pixelToSlide)
}
