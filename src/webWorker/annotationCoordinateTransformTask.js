/**
 * Web worker task for batch coordinate transformations of annotations
 * Offloads CPU-intensive matrix operations from the main thread
 *
 * @private
 */

// Import mathjs functions (web worker compatible)
// Note: mathjs needs to be bundled for web workers
// For now, we'll implement basic matrix operations inline to avoid dependencies

/**
 * Simple 3x3 matrix multiplication
 * @param {number[][]} a - 3x3 matrix
 * @param {number[][]} b - 3x3 matrix
 * @returns {number[][]} Result matrix
 */
function multiply3x3 (a, b) {
  const result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        result[i][j] += a[i][k] * b[k][j]
      }
    }
  }
  return result
}

/**
 * Apply affine transformation to a coordinate
 * @param {number[]} coordinate - [x, y] coordinate
 * @param {number[][]} affine - 3x3 affine transformation matrix
 * @returns {number[]} Transformed [x, y] coordinate
 */
function applyTransform (coordinate, affine) {
  const imageCoordinate = [[coordinate[0]], [coordinate[1]], [1]]
  const slideCoordinate = multiply3x3(affine, imageCoordinate)
  const x = Number(slideCoordinate[0][0].toFixed(4))
  const y = Number(slideCoordinate[1][0].toFixed(4))
  return [x, y]
}

/**
 * Apply inverse affine transformation to a coordinate
 * @param {number[]} coordinate - [x, y] coordinate
 * @param {number[][]} affine - 3x3 affine transformation matrix
 * @returns {number[]} Transformed [x, y] coordinate
 */
function applyInverseTransform (coordinate, affine) {
  const slideCoordinate = [[coordinate[0]], [coordinate[1]], [1]]
  const pixelCoordinate = multiply3x3(affine, slideCoordinate)
  const col = Number(pixelCoordinate[0][0].toFixed(4))
  const row = Number(pixelCoordinate[1][0].toFixed(4))
  return [col, row]
}

/**
 * Map pixel coordinates to slide coordinates
 * @param {number[]} point - [col, row] pixel coordinates
 * @param {number[][]} affine - 3x3 affine transformation matrix
 * @returns {number[]} [x, y] slide coordinates
 */
function mapPixelCoordToSlideCoord (point, affine) {
  return applyTransform(point, affine)
}

/**
 * Map SCOORD3D coordinates to geometry coordinates
 * @param {number[]} coordinate - [x, y, z] slide coordinate
 * @param {number[][]} affineInverse - 3x3 inverse affine transformation matrix
 * @returns {number[]} [x, y] geometry coordinate
 */
function scoord3dToGeometryCoordinate (coordinate, affineInverse) {
  // Convert 3D slide coordinate to 2D geometry coordinate
  const pixelCoord = applyInverseTransform([coordinate[0], coordinate[1]], affineInverse)
  // OpenLayers geometry coordinates: [x, -(y + 1)]
  return [pixelCoord[0], -(pixelCoord[1] + 1)]
}

/**
 * Task handler function
 * @param {object} data - Task data
 * @param {function} doneCallback - Completion callback
 */
function _handler (data, doneCallback) {
  try {
    const {
      coordinates,
      affine,
      affineInverse,
      annotationCoordinateType
    } = data.data || {}

    if (!coordinates || !Array.isArray(coordinates)) {
      doneCallback({ error: 'Invalid coordinates data provided' })
      return
    }

    if (!affine && !affineInverse) {
      doneCallback({ error: 'Affine transformation matrix is required' })
      return
    }

    const transformedCoordinates = []

    for (let i = 0; i < coordinates.length; i++) {
      let coordinate = coordinates[i]

      // Handle 2D annotation coordinates - map pixel to slide coordinates
      if (annotationCoordinateType === '2D' && affine) {
        if (coordinate.length >= 2) {
          coordinate = mapPixelCoordToSlideCoord([coordinate[0], coordinate[1]], affine)
        }
      }

      // Convert SCOORD3D to geometry coordinates
      if (affineInverse) {
        if (coordinate.length >= 2) {
          // Ensure we have at least [x, y]
          const coord3d = coordinate.length === 3 ? coordinate : [coordinate[0], coordinate[1], 0]
          coordinate = scoord3dToGeometryCoordinate(coord3d, affineInverse)
        }
      }

      transformedCoordinates.push(coordinate)
    }

    doneCallback({ transformedCoordinates })
  } catch (error) {
    console.error('Error in annotation coordinate transform task:', error)
    doneCallback({ error: error.message || 'Failed to transform coordinates' })
  }
}

export default { taskType: 'annotationCoordinateTransformTask', _handler }
