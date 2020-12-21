import { getLength, getArea } from 'ol/sphere';
import {fromCircle} from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';

import { Marker } from '../enums';
import { defaultStyle } from '../styles';
import { getUnitsSuffix } from '../utils';

const getStyleFunction = (options) => {
  return (feature, resolution) => {
    const styles = [];

    if (isMeasurement(feature)) {
      styles.push(defaultStyle);
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
  let geom = feature ? feature.getGeometry() : geometry;
  if (geom instanceof Circle) geom = fromCircle(geom);
  const value = getArea(geom) ? getArea(geom) : getLength(geom);
  let output = Math.round((value / 10) * 100) / 100 + ' ' + units;
  return output;
};

const isMeasurement = feature => Marker.Measurement === feature.get('marker');

const MeasurementMarker = api => {
  return {
    getROIProperties: (feature, properties = {}) => {
      return isMeasurement(feature) ? {
        ...properties,
        marker: Marker.Measurement,
      } : properties;
    },
    onRemove: feature => {
      if (isMeasurement(feature)) {
        const featureId = feature.getId();
        api.markerManager.remove(featureId);
      }
    },
    onAdd: (feature) => {
      if (isMeasurement(feature)) {
        const view = api.map.getView();
        const measurement = formatMeasurement(feature, null, getUnitsSuffix(view));
        api.markerManager.create({ feature, value: measurement });
      }
    },
    onDrawEnd: (feature) => {
      if (isMeasurement(feature)) {
        feature.setStyle(getStyleFunction());
      }
    },
    onUpdate: feature => { },
    onInteractionsChange: interactions => {
      api.markerManager.onInteractionsChange(interactions);
    },
    getDefinition: (options) => {
      const styleFunction = getStyleFunction(options);

      /** Measurement Marker Definition */
      return {
        ...options,
        maxPoints: options.type === 'LineString' ? 1 : undefined,
        minPoints: options.type === 'LineString' ? 1 : undefined,
        style: styleFunction,
        marker: Marker.Measurement,
      };
    },
    isMeasurement,
    format: formatMeasurement,
    style: getStyleFunction
  };
};

export default MeasurementMarker;