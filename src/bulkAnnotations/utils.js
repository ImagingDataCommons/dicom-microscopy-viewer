import PointGeometry from 'ol/geom/Point'
import PolygonGeometry from 'ol/geom/Polygon'
import Feature from 'ol/Feature'
import { getTopLeft, getBottomRight } from 'ol/extent'

import { _getCoordinates } from '../annotation'
import {
  _scoord3dCoordinates2geometryCoordinates,
  _geometryCoordinates2scoord3dCoordinates
} from '../scoord3dUtils'

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
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationGroupUID
}) => {
  const offset = graphicIndex[annotationIndex] - 1

  let annotationLength
  if (annotationIndex < numberOfAnnotations - 1) {
    annotationLength = graphicIndex[annotationIndex + 1] - offset
  } else {
    annotationLength = graphicData.length
  }

  const polygonCoordinates = []
  const roof = annotationLength
  for (let j = offset; j < roof; j++) {
    const coordinate = _getCoordinates(graphicData, j === (offset + annotationLength - 1) ? offset : j, commonZCoordinate)
    const renderableCoordinate = _scoord3dCoordinates2geometryCoordinates(
      coordinate,
      pyramid,
      affineInverse
    )
    polygonCoordinates.push(renderableCoordinate)
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
  affineInverse,
  commonZCoordinate,
  coordinateDimensionality,
  annotationGroupUID
}) => {
  const offset = graphicIndex[annotationIndex] - 1
  const coordinate = _getCoordinates(graphicData, offset, commonZCoordinate)
  const renderableCoordinate = _scoord3dCoordinates2geometryCoordinates(
    coordinate,
    pyramid,
    affineInverse
  )
  return new Feature({
    geometry: new PointGeometry(renderableCoordinate)
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
  isHighResolution
}) => {
  console.info('create features from bulk annotations')

  const { topLeft, bottomRight } = getViewportBoundingBox({ view, pyramid, affine })

  const features = []

  for (
    let annotationIndex = 0;
    annotationIndex < numberOfAnnotations;
    annotationIndex++
  ) {
    if (isHighResolution) {
      const offset = graphicIndex[annotationIndex] - 1
      const firstCoordinate = _getCoordinates(
        graphicData,
        offset,
        commonZCoordinate
      )
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
      affineInverse,
      commonZCoordinate,
      coordinateDimensionality,
      annotationGroupUID
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

  return features
}

export default {
  getFeaturesFromBulkAnnotations,
  getPointFeature,
  getPolygonFeature,
  isCoordinateInsideBoundingBox,
  getViewportBoundingBox
}
