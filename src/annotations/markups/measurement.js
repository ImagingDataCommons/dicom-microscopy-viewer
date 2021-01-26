import { getLength, getArea } from "ol/sphere";
import { fromCircle } from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";

import Enums from "../../enums";
import { getUnitsSuffix } from "./utils";

/**
 * Format measure output
 * @param {Feature} feature feature
 * @param {Geometry} geometry geometry
 * @param {string} units units
 * @return {string} The formatted measure of this feature
 */
const format = (feature, geometry, units) => {
  let output =
    Math.round((rawMeasurement(feature, geometry) / 10) * 100) / 100 +
    " " +
    units;
  return output;
};

/**
 * Get measurement from feature
 * @param {Feature} feature feature
 * @param {Geometry} geometry geometry
 * @return {string} The formatted measure of this feature
 */
const rawMeasurement = (feature, geometry) => {
  let geom = feature ? feature.getGeometry() : geometry;
  if (geom instanceof Circle) geom = fromCircle(geom);
  const value = getLength(geom) ? getLength(geom) : getArea(geom);
  let output = Math.round((value / 10) * 100) / 100;
  return output;
};

const isMeasurement = (feature) =>
  Enums.Markup.Measurement === feature.get("markup");

const MeasurementMarkup = (api) => {
  return {
    onAdd: (feature, options) => {
      if (isMeasurement(feature)) {
        const view = api.map.getView();
        api.markupManager.create({
          feature,
          value: format(feature, null, getUnitsSuffix(view)),
          style: options.style,
        });
      }
    },
    onRemove: (feature) => {
      if (isMeasurement(feature)) {
        const featureId = feature.getId();
        api.markupManager.remove(featureId);
      }
    },
    onUpdate: (feature) => {},
    onDrawStart: ({ feature }) => {
      if (isMeasurement(feature)) {
        api.markupManager.create({ feature });
      }
    },
    onDrawEnd: (event) => {},
    isMeasurement,
    format,
  };
};

export default MeasurementMarkup;
