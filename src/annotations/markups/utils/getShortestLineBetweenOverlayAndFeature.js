import LineString from 'ol/geom/LineString'
import Circle from 'ol/geom/Circle'
import { fromCircle } from 'ol/geom/Polygon'

/**
 * Builds a new LineString instance with the shortest
 * distance between a given overlay and a feature.
 *
 * @param {object} feature The feature
 * @param {object} overlay The overlay instance
 * @returns {LineString} The smallest line between the overlay and feature
 */
const getShortestLineBetweenOverlayAndFeature = (feature, overlay) => {
  let result
  let distanceSq = Infinity

  let featureGeometry = feature.getGeometry()

  if (featureGeometry instanceof Circle) {
    featureGeometry = fromCircle(featureGeometry).clone()
  }

  const geometry = featureGeometry.getLinearRing ? featureGeometry.getLinearRing(0) : featureGeometry;

  (geometry.getCoordinates() || geometry.getExtent()).forEach(coordinates => {
    const closest = overlay.getPosition()
    const distanceNew = Math.pow(closest[0] - coordinates[0], 2) + Math.pow(closest[1] - coordinates[1], 2)
    if (distanceNew < distanceSq) {
      distanceSq = distanceNew
      result = [coordinates, closest]
    }
  })

  const coordinates = overlay.getPosition()
  const closest = geometry.getClosestPoint(coordinates)
  const distanceNew = Math.pow(closest[0] - coordinates[0], 2) + Math.pow(closest[1] - coordinates[1], 2)
  if (distanceNew < distanceSq) {
    distanceSq = distanceNew
    result = [closest, coordinates]
  }

  return new LineString(result)
}

export default getShortestLineBetweenOverlayAndFeature
