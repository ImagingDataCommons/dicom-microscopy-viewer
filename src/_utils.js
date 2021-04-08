import Enums from "./enums";

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

export {
  coordinateWithOffset,
};