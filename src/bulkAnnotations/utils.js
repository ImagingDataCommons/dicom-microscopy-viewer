import PointGeometry from 'ol/geom/Point'
import PolygonGeometry, { fromCircle } from 'ol/geom/Polygon'
import CircleGeometry from 'ol/geom/Circle.js'
import Feature from 'ol/Feature'
import { getTopLeft, getBottomRight } from 'ol/extent'

import { _getCoordinates, _getPoint } from '../annotation'
import {
  _scoord3dCoordinates2geometryCoordinates,
  _geometryCoordinates2scoord3dCoordinates
} from '../scoord3dUtils'
import { mapPixelCoordToSlideCoord } from '../utils'

/**
 * Get viewport bounding box
 *
 * @param {*} view
 * @returns
 */
export const getViewportBoundingBox = ({ view, pyramid, affine }) => {
  const visibleExtent = view.calculateExtent()
  const topLeft = getTopLeft(visibleExtent)
  const bottomRight = getBottomRight(visibleExtent)
  const scoord3DCoords = _geometryCoordinates2scoord3dCoordinates(
    [topLeft, bottomRight],
    pyramid,
    affine
  )
  return {
    topLeft: scoord3DCoords[0],
    bottomRight: scoord3DCoords[1]
  }
}

const swapIfGreater = (array1, array2, index) => {
  if (array1[index] > array2[index]) {
    const temp = array1[index]
    array1[index] = array2[index]
    array2[index] = temp
  }
}

/**
 * Check if coordinate is inside bounding box
 *
 * @param {*} coordinate
 * @param {*} topLeft
 * @param {*} bottomRight
 * @returns
 */
export const isCoordinateInsideBoundingBox = (
  coordinate,
  topLeft,
  bottomRight
) => {
  const result = !(
    Math.abs(topLeft[0]) > Math.abs(coordinate[0]) ||
    Math.abs(coordinate[0]) > Math.abs(bottomRight[0]) ||
    Math.abs(topLeft[1]) > Math.abs(coordinate[1]) ||
    Math.abs(coordinate[1]) > Math.abs(bottomRight[1])
  ) || !(
    Math.abs(bottomRight[0]) > Math.abs(coordinate[0]) ||
    Math.abs(coordinate[0]) > Math.abs(topLeft[0]) ||
    Math.abs(bottomRight[1]) > Math.abs(coordinate[1]) ||
    Math.abs(coordinate[1]) > Math.abs(topLeft[1])
  ) 
  if (result === true) {
    return result;
  } else {
    swapIfGreater(topLeft, bottomRight, 0)
    swapIfGreater(topLeft, bottomRight, 1)
    return !(
      Math.abs(topLeft[0]) > Math.abs(coordinate[0]) ||
      Math.abs(coordinate[0]) > Math.abs(bottomRight[0]) ||
      Math.abs(topLeft[1]) > Math.abs(coordinate[1]) ||
      Math.abs(coordinate[1]) > Math.abs(bottomRight[1])
    )
  }
}

/**
 * Get circle feature from bulk data annotation data
 *
 * @param {*} param0
 * @returns
 */
export const getCircleFeature = ({
  graphicIndex,
  graphicData,
  numberOfAnnotations,
  annotationIndex,
  pyramid,
  affine,
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationGroupUID,
  annotationCoordinateType,
  map
}) => {
  const length = coordinateDimensionality * 4
  const offset = annotationIndex * length
  
  const coordinates = []
  for (let j = offset; j < offset + length; j++) {
    let coordinate = _getCoordinates(graphicData, j, commonZCoordinate)

    if (annotationCoordinateType === '2D') {
      coordinate = mapPixelCoordToSlideCoord(
        { point: [coordinate[0], coordinate[1]], affine }
      )
    }

    coordinate = _scoord3dCoordinates2geometryCoordinates(
      coordinate,
      pyramid,
      affineInverse
    )

    coordinates.push(coordinate)

    j += coordinateDimensionality - 1
  }

  const majorAxisCoordinates = coordinates.slice(0, 2)
  const point1 = majorAxisCoordinates[0]
  const point2 = majorAxisCoordinates[1]
  let coords = [
    [
      (point1[0] + point2[0]) / parseFloat(2),
      (point1[1] + point2[1]) / parseFloat(2),
      0
    ],
    point2
  ]

  /** To flat coordinates */
  coords = [
    ...coords[0].slice(0, 2),
    ...coords[1].slice(0, 2)
  ]

  /** 
   * flat coordinates in combination with opt_layout and no 
   * opt_radius are also accepted and internally it calculates the Radius 
   */
  return new Feature({
    geometry: new CircleGeometry(coords, null, 'XY')
  })
}

/**
 * Get ellipse feature from bulk data annotation data
 *
 * @param {*} param0
 * @returns
 */
export const getEllipseFeature = ({
  graphicIndex,
  graphicData,
  numberOfAnnotations,
  annotationIndex,
  pyramid,
  affine,
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationGroupUID,
  annotationCoordinateType,
  map
}) => {
  const length = coordinateDimensionality * 4
  const offset = annotationIndex * length

  const coordinates = []
  for (let j = offset; j < offset + length; j++) {
    let coordinate = _getCoordinates(graphicData, j, commonZCoordinate)

    if (annotationCoordinateType === "2D") {
      coordinate = mapPixelCoordToSlideCoord({
        point: [coordinate[0], coordinate[1]],
        affine,
      })
    }

    coordinate = _scoord3dCoordinates2geometryCoordinates(
      coordinate,
      pyramid,
      affineInverse
    )

    coordinates.push(coordinate)

    j += coordinateDimensionality - 1
  }

  function calculateEllipsePoints(majorAxisStart, majorAxisEnd, minorAxisStart, minorAxisEnd) {
    // Calculate semi-major and semi-minor axis lengths
    const semiMajorAxis = Math.sqrt(Math.pow(majorAxisEnd[0] - majorAxisStart[0], 2) + Math.pow(majorAxisEnd[1] - majorAxisStart[1], 2)) / 2
    const semiMinorAxis = Math.sqrt(Math.pow(minorAxisEnd[0] - minorAxisStart[0], 2) + Math.pow(minorAxisEnd[1] - minorAxisStart[1], 2)) / 2

    // Calculate rotation angle in radians
    const rotationAngle = Math.atan2(majorAxisEnd[1] - majorAxisStart[1], majorAxisEnd[0] - majorAxisStart[0])

    // Generate points on the ellipse
    const ellipsePoints = []
    for (let i = 0; i <= 360; i++) {
        // Calculate the parameter 't' representing the angle
        const angle = (2 * Math.PI * i) / 360

        // Calculate coordinates based on parametric equations for an ellipse
        const x = semiMajorAxis * Math.cos(angle)
        const y = semiMinorAxis * Math.sin(angle)

        // Rotate the points to match the orientation of the ellipse
        const rotatedX = x * Math.cos(rotationAngle) - y * Math.sin(rotationAngle)
        const rotatedY = x * Math.sin(rotationAngle) + y * Math.cos(rotationAngle)

        // Translate the points to the center of the ellipse
        const centerX = (majorAxisStart[0] + majorAxisEnd[0]) / 2
        const centerY = (majorAxisStart[1] + majorAxisEnd[1]) / 2

        // Add the rotated and translated points to the result array
        ellipsePoints.push([centerX + rotatedX, centerY + rotatedY])
    }

    return ellipsePoints
  }

  const majorAxisFirstEndpoint = coordinates[0]
  const majorAxisSecondEndpoint = coordinates[1]
  const minorAxisFirstEndpoint = coordinates[2]
  const minorAxisSecondEndpoint = coordinates[3]

  const points = calculateEllipsePoints(majorAxisFirstEndpoint, majorAxisSecondEndpoint, minorAxisFirstEndpoint, minorAxisSecondEndpoint)
 
  return new Feature({ 
    geometry: new PolygonGeometry([points]) 
  })
}

/**
 * Get rectangle feature from bulk data annotation data
 *
 * @param {*} param0
 * @returns
 */
export const getRectangleFeature = ({
  graphicIndex,
  graphicData,
  numberOfAnnotations,
  annotationIndex,
  pyramid,
  affine,
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationGroupUID,
  annotationCoordinateType
}) => {
  const length = coordinateDimensionality * 4
  const offset = annotationIndex * length
  const coordinates = []
  for (let j = offset; j < offset + length; j++) {
    let coordinate = _getCoordinates(graphicData, j, commonZCoordinate)

    if (annotationCoordinateType === '2D') {
      coordinate = mapPixelCoordToSlideCoord(
        { point: [coordinate[0], coordinate[1]], affine }
      )
    }

    coordinate = _scoord3dCoordinates2geometryCoordinates(
      coordinate,
      pyramid,
      affineInverse
    )

    coordinates.push(coordinate)

    j += coordinateDimensionality - 1
  }

  return new Feature({
    geometry: new PolygonGeometry([coordinates])
  })
}

/**
 * Get polygon feature from bulk data annotation data
 *
 * @param {*} param0
 * @returns
 */
export const getPolygonFeature = ({
  graphicIndex,
  graphicData,
  numberOfAnnotations,
  annotationIndex,
  pyramid,
  affine,
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationGroupUID,
  annotationCoordinateType
}) => {
  const offset = graphicIndex[annotationIndex] - 1

  let annotationLength
  if (annotationIndex < numberOfAnnotations - 1) {
    annotationLength = graphicIndex[annotationIndex + 1] - offset
  } else {
    annotationLength = graphicData.length
  }

  const polygonCoordinates = []
  const roof = offset + annotationLength
  for (let j = offset; j < roof; j++) {
    let coordinate = _getCoordinates(graphicData, j === (offset + annotationLength - 1) ? offset : j, commonZCoordinate)

    if (!coordinate || !coordinate[0] || !coordinate[1]) {
      continue;
    }

    if (annotationCoordinateType === '2D') {
      coordinate = mapPixelCoordToSlideCoord(
        { point: [coordinate[0], coordinate[1]], affine }
      )
    }

    coordinate = _scoord3dCoordinates2geometryCoordinates(
      coordinate,
      pyramid,
      affineInverse
    )

    polygonCoordinates.push(coordinate)

    /** Jump to the next point: (x, y) if 2 or (x, y, z) if 3 */
    j += coordinateDimensionality - 1
  }

  return new Feature({
    geometry: new PolygonGeometry([polygonCoordinates])
  })
}

/**
 * Get point feature from bulk data annotation data
 *
 * @param {*} param0
 * @returns
 */
export const getPointFeature = ({
  graphicType,
  graphicIndex,
  graphicData,
  numberOfAnnotations,
  annotationIndex,
  pyramid,
  affine,
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationGroupUID,
  annotationCoordinateType
}) => {
  let coordinate
  if (graphicIndex) {
    const offset = graphicIndex[annotationIndex] - 1
    coordinate = _getCoordinates(graphicData, offset, commonZCoordinate)
  } else {
    coordinate = _getPoint(  
      graphicData,
      graphicIndex,
      coordinateDimensionality,
      commonZCoordinate,
      annotationIndex,
      numberOfAnnotations
    )
  }
  
  if (annotationCoordinateType === '2D') {
    coordinate = mapPixelCoordToSlideCoord(
      { point: [coordinate[0], coordinate[1]], affine }
    )
  }

  coordinate = _scoord3dCoordinates2geometryCoordinates(
    coordinate,
    pyramid,
    affineInverse
  )

  return new Feature({
    geometry: new PointGeometry(coordinate)
  })
}

const HIGH_RES_GRAPHIC_TYPES = ['POLYLINE', 'POLYGON', 'ELLIPSE', 'RECTANGLE']

export const getFeaturesFromBulkAnnotations = ({
  graphicType,
  graphicData,
  graphicIndex,
  measurements,
  commonZCoordinate,
  coordinateDimensionality,
  numberOfAnnotations,
  annotationGroupUID,
  pyramid,
  affine,
  affineInverse,
  view,
  featureFunction,
  isHighResolution,
  annotationCoordinateType,
  map
}) => {
  console.info('create features from bulk annotations')
  console.info('coordinate dimensionality:', coordinateDimensionality)

  let { topLeft, bottomRight } = getViewportBoundingBox({ view, pyramid, affine })

  const features = []

  for (
    let annotationIndex = 0;
    annotationIndex < numberOfAnnotations;
    annotationIndex++
  ) {
    if (isHighResolution && HIGH_RES_GRAPHIC_TYPES.includes(graphicType)) {
      const length = coordinateDimensionality * 4 
      const offset = ['POLYGON', 'POLYLINE'].includes(graphicType) ? graphicIndex[annotationIndex] - 1 : annotationIndex * length

      let firstCoordinate = _getCoordinates(
        graphicData,
        offset,
        commonZCoordinate
      )

      if (!firstCoordinate || !firstCoordinate[0] || !firstCoordinate[1]) {
        continue;
      }

      if (annotationCoordinateType === '2D') {
        firstCoordinate = mapPixelCoordToSlideCoord(
          { point: [firstCoordinate[0], firstCoordinate[1]], affine }
        )
      }
      
      if (!isCoordinateInsideBoundingBox(
        firstCoordinate,
        topLeft,
        bottomRight
      )) {
        continue
      }
    } 

    const feature = featureFunction({
      graphicType,
      graphicIndex,
      graphicData,
      numberOfAnnotations,
      annotationIndex,
      pyramid,
      affine,
      affineInverse,
      commonZCoordinate,
      coordinateDimensionality,
      annotationGroupUID,
      annotationCoordinateType,
      map
    })

    feature.setId(annotationGroupUID + '-' + annotationIndex)
    feature.set('annotationGroupUID', annotationGroupUID, true)

    measurements.forEach((measurement, measurementIndex) => {
      const key = 'measurementValue' + measurementIndex
      const value = measurement.values[annotationIndex]
      /**
       * Needed for the WebGL renderer. This is required for the point layer which uses webgl
       * so it might not be required for other layers e.g. vector layer.
       */
      feature.set(key, value, true)
    })

    features.push(feature)
  }

  console.debug('num of features:', features.length)

  return features
}

export default {
  getFeaturesFromBulkAnnotations,
  getPointFeature,
  getCircleFeature,
  getEllipseFeature,
  getRectangleFeature,
  getPolygonFeature,
  isCoordinateInsideBoundingBox,
  getViewportBoundingBox
}
