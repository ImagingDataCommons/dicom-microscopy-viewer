import { getLength, getArea } from "ol/sphere";
import { fromCircle } from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";

import Enums from "../../enums";
import { defaultStyle } from "../markers/styles";
import { getUnitsSuffix } from "../markers/utils";

const getOpenLayersStyleFunction = (defaultStyle, style) => {
  return (feature, resolution) => {
    if (!isMeasurement(feature)) {
      return;
    }

    const styles = [defaultStyle];

    if (style) {
      styles.push(style);
    }

    return styles;
  };
};

/**
 * Format measure output
 * @param {Feature} feature feature
 * @param {Geometry} geometry geometry
 * @return {string} The formatted measure of this feature
 */
const formatMeasurement = (feature, geometry, units) => {
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
  Enums.Markup.Measurement === feature.get("marker");

const MeasurementMarkup = (api) => {
  return {
    getDefinition: (options) => {
      return {
        ...options,
        maxPoints: options.type === "LineString" ? 1 : undefined,
        minPoints: options.type === "LineString" ? 1 : undefined,
        style: getOpenLayersStyleFunction(defaultStyle, options.style),
        marker: Enums.Markup.Measurement,
      };
    },
    onAdd: (feature) => {
      if (isMeasurement(feature)) {
        const view = api.map.getView();
        const measurement = formatMeasurement(
          feature,
          null,
          getUnitsSuffix(view)
        );
        api.markupManager.create({ feature, value: measurement });
      }
    },
    onRemove: (feature) => {
      if (isMeasurement(feature)) {
        const featureId = feature.getId();
        api.markupManager.remove(featureId);
      }
    },
    onUpdate: (feature) => {},
    onDrawEnd: (feature) => {
      if (isMeasurement(feature)) {
        const styleFunction = getOpenLayersStyleFunction(defaultStyle);
        feature.setStyle(styleFunction);
      }
    },
    onInteractionsChange: (interactions) => {
      api.markupManager.onInteractionsChange(interactions);
    },
    isMeasurement,
    format: formatMeasurement,
    style: getOpenLayersStyleFunction,
  };
};

export default MeasurementMarkup;
