import { LineString } from 'ol/geom';
import { getLength } from 'ol/sphere';

import { CustomGeometry } from '.';
import { defaultStyle } from './styles';

const getStyleFunction = (options) => {
  return (feature, resolution) => {
    const styles = [];

    if (isLength(feature)) {
      styles.push(defaultStyle);
    }
    
    return styles;
  };
};

/**
 * Format length output
 * @param {LineString} line geometry
 * @return {string} The formatted output
 */
const formatLength = (feature, geometry) => {
  const line = feature ? feature.getGeometry() : geometry;
  const length = getLength(line);
  let output = Math.round((length / 10) * 100) / 100 + ' ' + 'mm';
  return output;
};

const isLength = feature => CustomGeometry.Length === feature.getGeometryName();

let api;
const LengthGeometry = {
  init: apiInstance => api = apiInstance,
  getROIProperties: (feature, properties = {}) => {
    return isLength(feature) ?
      { ...properties, geometryName: CustomGeometry.Length }
      : properties;
  },
  onInteractionsChange: interactions => {
    api.markerManager.onInteractionsChange(interactions);
  },
  onRemove: feature => {
    if (isLength(feature)) {
      console.debug('LengthGeometry: onRemove');
      const featureId = feature.ol_uid;
      api.markerManager.remove(featureId);
    }
  },
  onAdd: (feature, properties = {}) => {
    if (isLength(feature)) {
      console.debug('LengthGeometry: onAdd');
      api.markerManager.create({
        id: feature.ol_uid,
        feature,
        value: formatLength(feature)
      });
      feature.setStyle(getStyleFunction(properties));
    }
  },
  onUpdate: feature => { },
  getDefinition: (options) => {
    const styleFunction = getStyleFunction(options);

    /** Length Geometry Definition */
    return {
      length: {
        type: 'LineString',
        geometryName: CustomGeometry.Length,
        freehand: false,
        maxPoints: 1,
        minPoints: 1,
        style: styleFunction
      },
    };
  },
  isLength,
  format: formatLength,
  style: getStyleFunction
};

export default LengthGeometry;