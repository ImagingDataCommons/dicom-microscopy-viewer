import Enums from "./enums";
import { default as Circle } from "ol/geom/Circle";
import { fromCircle } from "ol/geom/Polygon";

/**
 * Get coordinate with offset
 *
 * @param {object} feature feature
 * @param {number} offset offset
 * @returns {array} coordinates with offset
 */
 function coordinateWithOffset(feature, offset = 70) {
  const geometry = feature.getGeometry();
  const coordinates = geometry.getLastCoordinate();
  const [x, y] = coordinates;
  return !feature.get(Enums.InternalProperties.Marker) &&
    feature.get(Enums.InternalProperties.Markup) === Enums.Markup.TextEvaluation
    ? coordinates
    : [x - offset, y - offset];
}

/**
 * Gets feature's geometry area
 * @param {Feature} feature 
 * @returns {number} geometry area
 */
const getFeatureArea = feature => {
  const geometry = feature.getGeometry();
  if (geometry instanceof Circle) {
    return fromCircle(geometry).getArea();
  }
  return geometry.getArea && geometry.getArea();
};

/**
 * Gets feature's geometry length
 * @param {Feature} feature 
 * @returns {number} geometry length
 */
const getFeatureLength = feature => {
  const geometry = feature.getGeometry();
  return geometry.getLength && geometry.getLength();
};

export {
  coordinateWithOffset,
  getFeatureArea,
  getFeatureLength
};