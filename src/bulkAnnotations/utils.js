import PointGeometry from 'ol/geom/Point'
import PolygonGeometry from 'ol/geom/Polygon'
import CircleGeometry from 'ol/geom/Circle.js'
import LineString from 'ol/geom/LineString'
import { getLength } from 'ol/sphere'
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
  return !(
    Math.abs(topLeft[0]) > Math.abs(coordinate[0]) ||
    Math.abs(coordinate[0]) > Math.abs(bottomRight[0]) ||
    Math.abs(topLeft[1]) > Math.abs(coordinate[1]) ||
    Math.abs(coordinate[1]) > Math.abs(bottomRight[1])
  )
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
  function getEllipseFeature(center, semiMajor, semiMinor, rotateDegrees = 0) {
    let coordinates = []
    const rotate = rotateDegrees * (Math.PI / 180)
    const radinas = Math.PI / 180

    for (let angle = 1; angle <= 360; angle++) {
      const px = semiMajor * Math.cos(radinas * angle)
      const py = semiMinor * Math.sin(radinas * angle)
      const [pxi, pyi] = rotatePoint(px, py, rotate)
      const pxii = center[0] + pxi
      const pyii = center[1] + pyi
      coordinates.push([pxii, pyii])
    }

    return new Feature({
      geometry: new PolygonGeometry([coordinates]),
    })
  }

  function rotatePoint(px, py, rotate) {
    const pxi = px * Math.cos(rotate) - py * Math.sin(rotate)
    const pyi = px * Math.sin(rotate) + py * Math.cos(rotate)
    return [pxi, pyi]
  }

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

  const majorAxisFirstEndpoint = coordinates[0]
  const majorAxisSecondEndpoint = coordinates[1]
  const minorAxisFirstEndpoint = coordinates[2]
  const minorAxisSecondEndpoint = coordinates[3]

  const centroid = [
    (majorAxisFirstEndpoint[0] + majorAxisSecondEndpoint[0]) / parseFloat(2),
    (majorAxisFirstEndpoint[1] + majorAxisSecondEndpoint[1]) / parseFloat(2),
    0
  ]

  const majorAxis = new LineString([
    majorAxisFirstEndpoint,
    majorAxisSecondEndpoint,
  ])
  const minorAxis = new LineString([
    minorAxisFirstEndpoint,
    minorAxisSecondEndpoint,
  ])

  const majorAxisLength = getLength(majorAxis)
  const minorAxisLength = getLength(minorAxis)

  const semiMajor = majorAxisLength / 2
  const semiMinor = minorAxisLength / 2

  function calculateRotation(semiMajor, semiMinor) {
    const covariance = (semiMajor ** 2 - semiMinor ** 2) / (semiMajor ** 2 + semiMinor ** 2)
    const rotationAngle = (1 / 2) * Math.atan2(2 * covariance, semiMajor ** 2 - semiMinor ** 2)
    const rotationDegrees = rotationAngle * (180 / Math.PI)
    return rotationDegrees
  }

  const rotatedDegrees = calculateRotation(semiMajor, semiMinor)
  console.debug('rotatedDegrees', rotatedDegrees)

  return getEllipseFeature(centroid, semiMajor, semiMinor, rotatedDegrees)
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
  let coordinate;
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
  console.info('coordinateDimensionality', coordinateDimensionality)

  let { topLeft, bottomRight } = getViewportBoundingBox({ view, pyramid, affine })

  const features = []

  for (
    let annotationIndex = 0;
    annotationIndex < numberOfAnnotations;
    annotationIndex++
  ) {
    if (isHighResolution && (graphicType === 'POLYGON' || graphicType === 'ELLIPSE' || graphicType === 'RECTANGLE')) {
      const length = coordinateDimensionality * 4
      const offset = (graphicType === 'ELLIPSE' || graphicType === 'RECTANGLE') ? annotationIndex * length : graphicType === 'ELLIPSE'
      let firstCoordinate = _getCoordinates(
        graphicData,
        offset,
        commonZCoordinate
      )

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
