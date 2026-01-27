import { inv, multiply } from 'mathjs'
import { getPointResolution } from 'ol/proj'
import { v4 as createUUIDv4, v5 as createUUIDv5 } from 'uuid'

const _UUID_NAMESPACE = 'c4f09b11-bac0-4f3a-8dc1-9f0046637383'

/**
 * Generates a UUID-derived DICOM UID with root `2.25`.
 *
 * @returns {string} Unique identifier
 *
 * @private
 */
function _generateUID({ value } = {}) {
  /**
   * A UUID can be represented as a single integer value.
   * http://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_B.2.html
   * https://www.itu.int/rec/T-REC-X.667-201210-I/en
   * To obtain the single integer value of the UUID, the 16 octets of the
   * binary representation shall be treated as an unsigned integer encoding
   * with the most significant bit of the integer encoding as the most
   * significant bit (bit 7) of the first of the sixteen octets (octet 15) and
   * the least significant bit as the least significant bit (bit 0) of the last
   * of the sixteen octets (octet 0).
   */
  let uuid
  if (value != null) {
    uuid = createUUIDv5(value, _UUID_NAMESPACE)
  } else {
    uuid = createUUIDv4()
  }
  const hex = '0x' + uuid.replace(/-/g, '')
  const decimal = BigInt(hex)
  return '2.25.' + decimal.toString()
}

/**
 * Create a rotation matrix.
 *
 * @param {Object} options - Options
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 *
 * @returns {number[][]} 2x2 rotation matrix
 *
 * @memberof utils
 */
function createRotationMatrix(options) {
  if (!('orientation' in options)) {
    throw new Error('Option "orientation" is required.')
  }
  const orientation = options.orientation
  const rowDirection = orientation.slice(0, 3)
  const columnDirection = orientation.slice(3, 6)
  return [
    [rowDirection[0], columnDirection[0]],
    [rowDirection[1], columnDirection[1]],
    [rowDirection[2], columnDirection[3]],
  ]
}

/**
 * Rescale intensity from [minInput, maxInput] to [minOutput, maxOutput].
 *
 * @param {number} value - Input value that should be rescaled
 * @param {number} minInput - Lower bound of the full input value range
 * @param {number} maxInput - Upper bound of the full input value range
 * @param {number} minOutput - Lower bound of the full output value range
 * @param {number} maxOutput - Upper bound of the full output value range
 *
 * @returns {number} Rescaled value
 *
 * @memberof utils
 */
function rescale(value, minInput, maxInput, minOutput, maxOutput) {
  return (
    ((value - minInput) * (maxOutput - minOutput)) / (maxInput - minInput) +
    minOutput
  )
}

/**
 * Create window.
 *
 * @param {number} lowerBound - Lower bound of the window
 * @param {number} upperBound - Upper bound of the window
 *
 * @returns {number[]} Window center and width
 *
 * @memberof utils
 */
function createWindow(lowerBound, upperBound) {
  const windowCenter = (lowerBound + upperBound) / 2
  const windowWidth = upperBound - lowerBound
  return [windowCenter, windowWidth]
}

/**
 * Compute the rotation of the image with respect to the frame of reference.
 *
 * @param {Object} options - Options
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {boolean} options.inDegrees - Whether angle should be returned in degrees instead of radians
 *
 * @returns {number} Angle
 *
 * @memberof utils
 */
function computeRotation(options) {
  const rot = createRotationMatrix({ orientation: options.orientation })
  const angle = Math.atan2(-rot[0][1], rot[0][0])
  let inDegrees = false
  if ('inDegrees' in options) {
    inDegrees = true
  }
  if (inDegrees) {
    return angle / (Math.PI / 180)
  } else {
    return angle
  }
}

/**
 * Build an affine transformation matrix to map coordinates in the Total
 * Pixel Matrix into the slide coordinate system.
 *
 * @param {Object} options - Options
 * @param {number[]} options.offset - X and Y offset of the image in the slide coordinate system
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {number[]} options.spacing - Spacing between pixel rows and columns of the Total Pixel Matrix
 *
 * @returns {number[][]} 3x3 affine transformation matrix
 *
 * @memberof utils
 */
function buildTransform({ offset, orientation, spacing }) {
  // X and Y Offset in Slide Coordinate System
  if (offset == null) {
    throw new Error('Option "offset" is required.')
  }
  if (!Array.isArray(offset)) {
    throw new Error('Option "offset" must be an array.')
  }
  if (offset.length !== 2) {
    throw new Error('Option "offset" must be an array with 2 elements.')
  }

  // Image Orientation Slide with direction cosines for Row and Column direction
  if (orientation == null) {
    throw new Error('Option "orientation" is required.')
  }
  if (!Array.isArray(orientation)) {
    throw new Error('Option "orientation" must be an array.')
  }
  if (orientation.length !== 6) {
    throw new Error('Option "orientation" must be an array with 6 elements.')
  }

  // Pixel Spacing along the Row and Column direction
  if (spacing == null) {
    throw new Error('Option "spacing" is required.')
  }
  if (!Array.isArray(spacing)) {
    throw new Error('Option "spacing" must be an array.')
  }
  if (spacing.length !== 2) {
    throw new Error('Option "spacing" must be an array with 2 elements.')
  }

  const affine = [
    [orientation[0] * spacing[1], orientation[3] * spacing[0], offset[0]],
    [orientation[1] * spacing[1], orientation[4] * spacing[0], offset[1]],
    [0, 0, 1],
  ]
  const correction = [
    [1.0, 0.0, -0.5],
    [0.0, 1.0, -0.5],
    [0.0, 0.0, 1.0],
  ]
  return multiply(affine, correction)
}

/**
 * Apply an affine transformation to an image coordinate in the total pixel
 * matrix to map it into the slide coordinate system.
 *
 * @param {Object} options - Options
 * @param {number[]} options.coordinate - (column, row) image coordinate
 * @param {number[][]} options.affine - 3x3 affine transformation matrix
 *
 * @returns {number[]} (x, y) reference coordinate
 *
 * @memberof utils
 */
function applyTransform({ coordinate, affine }) {
  if (coordinate == null) {
    throw new Error('Option "coordinate" is required.')
  }
  if (!Array.isArray(coordinate)) {
    throw new Error('Option "coordinate" must be an array.')
  }
  if (coordinate.length !== 2) {
    throw new Error('Option "coordinate" must be an array with 2 elements.')
  }

  if (affine == null) {
    throw new Error('Option "affine" is required.')
  }
  if (!Array.isArray(affine)) {
    throw new Error('Option "affine" must be an array.')
  }
  if (affine.length !== 3) {
    throw new Error('Option "affine" must be a 3x3 array.')
  }
  if (!Array.isArray(affine[0])) {
    throw new Error('Option "affine" must be a 3x3 array.')
  }
  if (affine[0].length !== 3 || affine[1].length !== 3) {
    throw new Error('Option "affine" must be a 3x3 array.')
  }

  const imageCoordinate = [[coordinate[0]], [coordinate[1]], [1]]

  const slideCoordinate = multiply(affine, imageCoordinate)

  const x = Number(slideCoordinate[0][0].toFixed(4))
  const y = Number(slideCoordinate[1][0].toFixed(4))
  return [x, y]
}

/**
 * Build an affine transformation matrix to map coordinates in the slide
 * coordinate system into the Total Pixel Matrix.
 *
 * @param {number[]} options.offset - X and Y offset of the image in the slide coordinate system
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {number[]} options.spacing - Spacing between pixel rows and columns of the Total Pixel Matrix
 *
 * @returns {number[][]} 3x3 affine transformation matrix
 *
 * @memberof utils
 */
function buildInverseTransform({ offset, orientation, spacing }) {
  // X and Y Offset in Slide Coordinate System
  if (offset == null) {
    throw new Error('Option "offset" is required.')
  }
  if (!Array.isArray(offset)) {
    throw new Error('Option "offset" must be an array.')
  }
  if (offset.length !== 2) {
    throw new Error('Option "offset" must be an array with 2 elements.')
  }

  // Image Orientation Slide with direction cosines for Row and Column direction
  if (orientation == null) {
    throw new Error('Option "orientation" is required.')
  }
  if (!Array.isArray(orientation)) {
    throw new Error('Option "orientation" must be an array.')
  }
  if (orientation.length !== 6) {
    throw new Error('Option "orientation" must be an array with 6 elements.')
  }

  // Pixel Spacing along the Row and Column direction
  if (spacing == null) {
    throw new Error('Option "spacing" is required.')
  }
  if (!Array.isArray(spacing)) {
    throw new Error('Option "spacing" must be an array.')
  }
  if (spacing.length !== 2) {
    throw new Error('Option "spacing" must be an array with 2 elements.')
  }

  const affine = inv([
    [orientation[0] * spacing[1], orientation[3] * spacing[0], offset[0]],
    [orientation[1] * spacing[1], orientation[4] * spacing[0], offset[1]],
    [0, 0, 1],
  ])
  const correction = [
    [1.0, 0.0, 0.5],
    [0.0, 1.0, 0.5],
    [0.0, 0.0, 1.0],
  ]
  return multiply(correction, affine)
}

/**
 * Apply an affine transformation to a reference coordinate in the slide
 * coordinate system to map it into the total pixel matrix.
 *
 * @param {Object} options - Options
 * @param {number[]} options.coordinate - (x, y) reference coordinate
 * @param {number[][]} options.affine - 3x3 affine transformation matrix
 *
 * @returns {number[]} (column, row) image coordinate
 *
 * @memberof utils
 */
function applyInverseTransform({ coordinate, affine }) {
  if (coordinate == null) {
    throw new Error('Option "coordinate" is required.')
  }
  if (!Array.isArray(coordinate)) {
    throw new Error('Option "coordinate" must be an array.')
  }
  if (coordinate.length !== 2) {
    throw new Error('Option "coordinate" must be an array with 2 elements.')
  }

  if (affine == null) {
    throw new Error('Option "affine" is required.')
  }
  if (!Array.isArray(affine)) {
    throw new Error('Option "affine" must be an array.')
  }
  if (affine.length !== 3) {
    throw new Error('Option "affine" must be a 3x3 array.')
  }
  if (!Array.isArray(affine[0])) {
    throw new Error('Option "affine" must be a 3x3 array.')
  }
  if (affine[0].length !== 3 || affine[1].length !== 3) {
    throw new Error('Option "affine" must be a 3x3 array.')
  }

  const slideCoordinate = [[coordinate[0]], [coordinate[1]], [1]]

  const pixelCoordinate = multiply(affine, slideCoordinate)

  const col = Number(pixelCoordinate[0][0].toFixed(4))
  const row = Number(pixelCoordinate[1][0].toFixed(4))
  return [col, row]
}

/**
 * Map 2D (column, row) image coordinates in the Total Pixel Matrix
 * to 3D (x, y, z) slide coordinates in the Frame of Reference.
 *
 * @param {Object} options - Options
 * @param {number[]} options.offset - X and Y offset in the slide coordinate system
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {number[]} options.spacing - Spacing between pixels along the Column and Row direction of the Total Pixel Matrix
 * @param {number[]} options.point - (colum, row) image coordinates
 * @param {number[][]} options.affine - 3x3 affine transformation matrix
 *
 * @returns {number[]} (x, y, z) slide coordinates
 *
 * @memberof utils
 */
function mapPixelCoordToSlideCoord({
  point,
  offset,
  orientation,
  spacing,
  affine: defaultAffine,
}) {
  if (point == null) {
    throw new Error('Option "point" is required.')
  }
  if (!Array.isArray(point)) {
    throw new Error('Option "point" must be an array.')
  }
  if (point.length !== 2) {
    throw new Error('Option "point" must be an array with 2 elements.')
  }

  const affine =
    defaultAffine ||
    buildTransform({
      orientation,
      offset,
      spacing,
    })
  return applyTransform({ coordinate: point, affine })
}

/**
 * Map 3D (x, y, z) slide coordinates in the Frame of Reference to
 * 2D (column, row) image coordinates in the Total Pixel Matrix.
 *
 * @param {Object} options - Options
 * @param {number[]} options.offset - X and Y offset in the slide coordinate system
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {number[]} options.spacing - Spacing between pixels along the Column and Row direction of the Total Pixel Matrix
 * @param {number[]} options.point - (x, y, z) slide coordinates
 *
 * @returns {number[]} (row, column) image coordinates
 *
 * @memberof utils
 */
function mapSlideCoordToPixelCoord({ point, offset, orientation, spacing }) {
  if (point == null) {
    throw new Error('Option "point" is required.')
  }
  if (!Array.isArray(point)) {
    throw new Error('Option "point" must be an array.')
  }
  if (point.length !== 2) {
    throw new Error('Option "point" must be an array with 2 elements.')
  }

  const affine = buildInverseTransform({
    orientation,
    offset,
    spacing,
  })

  return applyInverseTransform({ coordinate: point, affine })
}

/**
 * Check if 2D arrays are equal.
 *
 * @param {number[]} array a
 * @param {number[]} array b
 * @param {number} eps
 *
 * @returns {boolean} yes/no answer
 *
 * @memberof utils
 */
function are2DArraysAlmostEqual(a, b, eps = 1e-5) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; ++i) {
    if (a[i].length !== b[i].length) return false
    for (let j = 0; j < a[i].length; ++j) {
      if (!areNumbersAlmostEqual(a[i][j], b[i][j], eps)) {
        return false
      }
    }
  }
  return true
}

/**
 * Check if 1D arrays are equal.
 *
 * @param {number[]} array a
 * @param {number[]} array b
 * @param {number} eps
 *
 * @returns {boolean} yes/no answer
 *
 * @memberof utils
 */
function are1DArraysAlmostEqual(a, b, eps = 1e-5) {
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; ++i) {
    if (!areNumbersAlmostEqual(a[i], b[i], eps)) {
      return false
    }
  }
  return true
}

/**
 * Check if two numbers are equal.
 *
 * @param {number} a
 * @param {number} b
 * @param {number} eps
 *
 * @returns {boolean} yes/no answer
 *
 * @memberof utils
 */
function areNumbersAlmostEqual(a, b, eps = 1e-6) {
  return Math.abs(a - b) < eps
}

/**
 * Get view unit suffix.
 *
 * @param {object} view Map view
 *
 * @returns {string} unit suffix
 *
 * @private
 */
function _getUnitSuffix(view) {
  const UnitsEnum = { METERS: 'm' }
  const DEFAULT_DPI = 25.4 / 0.28

  const center = view.getCenter()
  const projection = view.getProjection()
  const resolution = view.getResolution()

  const pointResolutionUnits = UnitsEnum.METERS

  let pointResolution = getPointResolution(
    projection,
    resolution,
    center,
    pointResolutionUnits,
  )

  const DEFAULT_MIN_WIDTH = 65
  const minWidth = (DEFAULT_MIN_WIDTH * DEFAULT_DPI) / DEFAULT_DPI

  const nominalCount = minWidth * pointResolution
  let suffix = ''

  if (nominalCount < 0.001) {
    suffix = 'μm'
    pointResolution *= 1000000
  } else if (nominalCount < 1) {
    suffix = 'mm'
    pointResolution *= 1000
  } else if (nominalCount < 1000) {
    suffix = 'm'
  } else {
    suffix = 'km'
    pointResolution /= 1000
  }

  return suffix
}

/**
 * Get name coded concept from content item.
 *
 * @param {object} contentItem
 *
 * @returns {object} The concept name coded concept
 *
 * @memberof utils
 */
const getContentItemNameCodedConcept = (contentItem) =>
  contentItem.ConceptNameCodeSequence[0]

/**
 * Check whether coded concepts are equal.
 *
 * @param {object} codedConcept1
 * @param {object} codedConcept2
 *
 * @returns {boolean} yes/no answer
 *
 * @memberof utils
 */
const areCodedConceptsEqual = (codedConcept1, codedConcept2) => {
  if (
    codedConcept2.CodeValue === codedConcept1.CodeValue &&
    codedConcept2.CodingSchemeDesignator ===
      codedConcept1.CodingSchemeDesignator
  ) {
    if (
      codedConcept2.CodingSchemeVersion &&
      codedConcept1.CodingSchemeVersion
    ) {
      return (
        codedConcept2.CodingSchemeVersion === codedConcept1.CodingSchemeVersion
      )
    }
    return true
  }
  return false
}

/**
 * Check wether two content items match.
 *
 * @param {object} contentItem1
 * @param {object} contentItem2
 *
 * @returns {boolean} yes/no answer
 *
 * @memberof utils
 */
const doContentItemsMatch = (contentItem1, contentItem2) => {
  const contentItem1NameCodedConcept =
    getContentItemNameCodedConcept(contentItem1)
  const contentItem2NameCodedConcept =
    getContentItemNameCodedConcept(contentItem2)
  return contentItem1NameCodedConcept.equals
    ? contentItem1NameCodedConcept.equals(contentItem2NameCodedConcept)
    : areCodedConceptsEqual(
        contentItem1NameCodedConcept,
        contentItem2NameCodedConcept,
      )
}

/**
 * Fetch bulkdata.
 *
 * @param {object} options
 * @param {object} options.client - DICOMweb client @param {object}
 * options.reference - Data Element in DICOM JSON format containing "vr" and
 * "BulkDataURI" fields
 *
 * @returns {Promise<TypedArray>} bulkdata
 *
 * @private
 */
async function _fetchBulkdata({ client, reference, options }) {
  const retrieveOptions = { BulkDataURI: reference.BulkDataURI, ...options }
  return await client.retrieveBulkData(retrieveOptions).then((data) => {
    const byteArray = new Uint8Array(data[0])
    if (reference.vr === 'OB') {
      return byteArray
    } else if (reference.vr === 'OW') {
      return new Uint16Array(
        byteArray.buffer,
        byteArray.byteOffset,
        byteArray.byteLength / 2,
      )
    } else if (reference.vr === 'OL') {
      return new Int32Array(
        byteArray.buffer,
        byteArray.byteOffset,
        byteArray.byteLength / 4,
      )
    } else if (reference.vr === 'OV') {
      // There is no Int64Array, so we represent data as Float64Array instead
      return new Float64Array(
        byteArray.buffer,
        byteArray.byteOffset,
        byteArray.byteLength / 8,
      )
    } else if (reference.vr === 'OF') {
      return new Float32Array(
        byteArray.buffer,
        byteArray.byteOffset,
        byteArray.byteLength / 4,
      )
    } else if (reference.vr === 'OD') {
      return new Float64Array(
        byteArray.buffer,
        byteArray.byteOffset,
        byteArray.byteLength / 8,
      )
    } else {
      throw new Error(
        `Unexpected Value Representation "${reference.vr}" for ` +
          `bulkdata element with URI "${reference.BulkDataURI}".`,
      )
    }
  })
}

/**
 * Convert RGB color triplet into hex code.
 *
 * @param {Number[]} values - RGB triplet
 * @returns {String} Hex code
 *
 * @private
 */
function rgb2hex(values) {
  const r = values[0]
  const g = values[1]
  const b = values[2]
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function throttle(mainFunction, delay) {
  let timerFlag = null // Variable to keep track of the timer

  // Returning a throttled version
  return (...args) => {
    if (timerFlag === null) {
      // If there is no timer currently running
      mainFunction(...args) // Execute the main function
      timerFlag = setTimeout(() => {
        // Set a timer to clear the timerFlag after the specified delay
        timerFlag = null // Clear the timerFlag to allow the main function to be executed again
      }, delay)
    }
  }
}

export {
  _getUnitSuffix,
  applyInverseTransform,
  applyTransform,
  buildInverseTransform,
  buildTransform,
  computeRotation,
  createWindow,
  _fetchBulkdata,
  _generateUID,
  mapPixelCoordToSlideCoord,
  mapSlideCoordToPixelCoord,
  areNumbersAlmostEqual,
  are1DArraysAlmostEqual,
  are2DArraysAlmostEqual,
  doContentItemsMatch,
  areCodedConceptsEqual,
  getContentItemNameCodedConcept,
  rgb2hex,
  rescale,
  throttle,
}
