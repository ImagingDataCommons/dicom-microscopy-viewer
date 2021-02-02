import { getLength, getArea } from "ol/sphere";
import Polygon, { fromCircle } from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";
import LineString from "ol/geom/LineString";

import Enums from "../../enums";
import { getUnitsSuffix } from "./utils";

/**
 * Format measure output
 * @param {Feature} feature feature
 * @param {string} units units
 * @return {string} The formatted measure of this feature
 */
const format = (feature, units) => {
  let output =
    Math.round((rawMeasurement(feature) / 10) * 100) / 100 + " " + units;
  return output;
};

/**
 * Get measurement from feature
 * @param {Feature} feature feature
 * @return {string} The formatted measure of this feature
 */
const rawMeasurement = (feature) => {
  let value;
  let geom = feature.getGeometry();
  if (geom instanceof LineString) {
    value = getLength(geom);
    feature.set("length", value);
  } else if (geom instanceof Circle) {
    geom = fromCircle(geom);
    value = getArea(geom);
    feature.set("area", value);
  } else if (geom instanceof Polygon) {
    value = getArea(geom);
    feature.set("area", value);
  }
  let output = Math.round((value / 10) * 100) / 100;
  return output;
};

const isMeasurement = (feature) =>
  Enums.Markup.Measurement === feature.get("markup");

const MeasurementMarkup = (api) => {
  return {
    onAdd: (feature) => {
      if (isMeasurement(feature)) {
        const view = api.map.getView();
        const unitsSuffix = getUnitsSuffix(view);
        api.markupManager.create({
          feature,
          value: format(feature, unitsSuffix),
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
    onDrawEnd: ({ feature }) => {},
    isMeasurement,
    format,
  };
};

export default MeasurementMarkup;
