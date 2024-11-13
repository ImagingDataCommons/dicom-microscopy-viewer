import PointGeometry from 'ol/geom/Point'
import PolygonGeometry from 'ol/geom/Polygon'
import LineStringGeometry from 'ol/geom/LineString'
import CircleGeometry from 'ol/geom/Circle.js'
import Feature from 'ol/Feature'
import { getTopLeft, getBottomRight } from 'ol/extent'

import { _getCoordinates, _getPoint } from '../annotation'
import {
  _scoord3dCoordinates2geometryCoordinates,
  _geometryCoordinates2scoord3dCoordinates,
  getPixelSpacing
} from '../scoord3dUtils'
import { buildTransform, mapPixelCoordToSlideCoord } from '../utils'

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
  const minX = Math.min(topLeft[0], bottomRight[0])
  const maxX = Math.max(topLeft[0], bottomRight[0])
  const minY = Math.min(topLeft[1], bottomRight[1])
  const maxY = Math.max(topLeft[1], bottomRight[1])

  return coordinate[0] >= minX &&
          coordinate[0] <= maxX &&
          coordinate[1] >= minY &&
          coordinate[1] <= maxY
}

/**
 * Calculates the affine transformation matrix based on the pyramid level.
 *
 * @param {Object} options - The options object.
 * @param {Object} options.affine - The initial affine transformation matrix.
 * @param {Array} options.pyramid - The array of pyramid metadata.
 * @param {Object} options.annotationGroup - The annotation group metadata.
 * @returns {Array} - The affine transformation matrix.
 */
const getAffineBasedOnPyramidLevel = ({ affine, pyramid, annotationGroup }) => {
  const { ReferencedSOPInstanceUID } = annotationGroup.metadata.ReferencedImageSequence[0]
  const currentPyramidMetadata = pyramid.find(p => p.SOPInstanceUID === ReferencedSOPInstanceUID)
  if (currentPyramidMetadata && currentPyramidMetadata.ImageOrientationSlide) {
    const orientation = currentPyramidMetadata.ImageOrientationSlide
    const spacing = getPixelSpacing(currentPyramidMetadata)
    const origin = currentPyramidMetadata.TotalPixelMatrixOriginSequence[0]
    const offset = [
      Number(origin.XOffsetInSlideCoordinateSystem),
      Number(origin.YOffsetInSlideCoordinateSystem)
    ]
    return buildTransform({
      offset,
      orientation,
      spacing
    })
  }
  return affine
}

/**
 * Get circle feature from bulk data annotation data
 *
 * @param {*} param0
 * @returns
 */
export const getCircleFeature = ({
  graphicData,
  annotationIndex,
  pyramid,
  affine,
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationCoordinateType,
  annotationGroup
}) => {
  const length = coordinateDimensionality * 4
  const offset = annotationIndex * length

  const coordinates = []
  for (let j = offset; j < offset + length; j++) {
    let coordinate = _getCoordinates(graphicData, j, commonZCoordinate)

    if (annotationCoordinateType === '2D') {
      coordinate = mapPixelCoordToSlideCoord({
        point: [coordinate[0], coordinate[1]],
        affine: getAffineBasedOnPyramidLevel({
          affine,
          pyramid,
          annotationGroup
        })
      })
    }

    coordinate = _scoord3dCoordinates2geometryCoordinates(
      coordinate,
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
  graphicData,
  annotationIndex,
  pyramid,
  affine,
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationCoordinateType,
  annotationGroup
}) => {
  const length = coordinateDimensionality * 4
  const offset = annotationIndex * length

  const coordinates = []
  for (let j = offset; j < offset + length; j++) {
    let coordinate = _getCoordinates(graphicData, j, commonZCoordinate)

    if (annotationCoordinateType === '2D') {
      coordinate = mapPixelCoordToSlideCoord({
        point: [coordinate[0], coordinate[1]],
        affine: getAffineBasedOnPyramidLevel({
          affine,
          pyramid,
          annotationGroup
        })
      })
    }

    coordinate = _scoord3dCoordinates2geometryCoordinates(
      coordinate,
      affineInverse
    )

    coordinates.push(coordinate)

    j += coordinateDimensionality - 1
  }

  function calculateEllipsePoints (majorAxisStart, majorAxisEnd, minorAxisStart, minorAxisEnd) {
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
  graphicData,
  annotationIndex,
  pyramid,
  affine,
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationCoordinateType,
  annotationGroup
}) => {
  const length = coordinateDimensionality * 4
  const offset = annotationIndex * length
  const coordinates = []
  for (let j = offset; j < offset + length; j++) {
    let coordinate = _getCoordinates(graphicData, j, commonZCoordinate)

    if (annotationCoordinateType === '2D') {
      coordinate = mapPixelCoordToSlideCoord({
        point: [coordinate[0], coordinate[1]],
        affine: getAffineBasedOnPyramidLevel({
          affine,
          pyramid,
          annotationGroup
        })
      })
    }

    coordinate = _scoord3dCoordinates2geometryCoordinates(
      coordinate,
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
  graphicType,
  numberOfAnnotations,
  annotationIndex,
  pyramid,
  affine,
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationGroup,
  annotationCoordinateType
}) => {
  const offset = graphicIndex[annotationIndex] - 1

  const Geometry = graphicType === 'POLYLINE' ? LineStringGeometry : PolygonGeometry

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
      continue
    }

    if (annotationCoordinateType === '2D') {
      coordinate = mapPixelCoordToSlideCoord({
        point: [coordinate[0], coordinate[1]],
        affine: getAffineBasedOnPyramidLevel({
          affine,
          pyramid,
          annotationGroup
        })
      })
    }

    coordinate = _scoord3dCoordinates2geometryCoordinates(
      coordinate,
      affineInverse
    )

    polygonCoordinates.push(coordinate)

    /** Jump to the next point: (x, y) if 2 or (x, y, z) if 3 */
    j += coordinateDimensionality - 1
  }

  return new Feature({
    geometry: new Geometry(graphicType === 'POLYLINE' ? polygonCoordinates : [polygonCoordinates])
  })
}

/**
 * Get point feature from bulk data annotation data
 *
 * @param {*} param0
 * @returns
 */
export const getPointFeature = ({
  graphicIndex,
  graphicData,
  numberOfAnnotations,
  annotationIndex,
  pyramid,
  affine,
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationGroup,
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
    coordinate = mapPixelCoordToSlideCoord({
      point: [coordinate[0], coordinate[1]],
      affine: getAffineBasedOnPyramidLevel({
        affine,
        pyramid,
        annotationGroup
      })
    })
  }

  coordinate = _scoord3dCoordinates2geometryCoordinates(
    coordinate,
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
  annotationGroup,
  pyramid,
  affine,
  affineInverse,
  view,
  featureFunction,
  isHighResolution
}) => {
  const annotationCoordinateType = annotationGroup.metadata.AnnotationCoordinateType

  console.info('create features from bulk annotations')
  console.info('coordinate dimensionality:', coordinateDimensionality)

  const { topLeft, bottomRight } = getViewportBoundingBox({ view, pyramid, affine })

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
        continue
      }

      if (annotationCoordinateType === '2D') {
        firstCoordinate = mapPixelCoordToSlideCoord({
          point: [firstCoordinate[0], firstCoordinate[1]],
          affine: getAffineBasedOnPyramidLevel({
            affine,
            pyramid,
            annotationGroup
          })
        })
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
      annotationGroup,
      pyramid,
      affine,
      affineInverse,
      commonZCoordinate,
      coordinateDimensionality,
      annotationCoordinateType
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
