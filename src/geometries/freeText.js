import { CustomGeometry } from '.';

export const isFreeText = feature => CustomGeometry.FreeText === feature.getGeometryName();


const getStyleFunction = options => {
  return feature => {
    const geometry = feature.getGeometry();
    const styles = [];

    if (options && 'style' in options) {
      styles.push(options.style);
    }

    if (isFreeText(feature)) {
      styles.push({ display: 'none'});
    }

    return styles;
  };
};

const getDefinition = options => {
  const styleFunction = getStyleFunction(options);

  /** FreeText Geometry Definition */
  return {
    freetext: {
      type: 'Point',
      geometryName: CustomGeometry.FreeText,
      style: styleFunction
    }
  };
};

/**
 * Format free text output
 * @param {LineString} freetext geometry
 * @return {string} The formatted output
 */
const formatFreeText = (feature, geometry) => {
  const properties = feature.getProperties();
  return properties.label || '';
};

let api;
const FreeTextGeometry = {
  init: apiInstance => api = apiInstance,
  getROIProperties: (feature, properties = {}) => {
    return isFreeText(feature) ?
      { ...properties, geometryName: CustomGeometry.FreeText }
      : properties;
  },
  onAdd: (feature, properties = {}) => {
    if (isFreeText(feature)) {
      console.debug('FreeTextGeometry: onAdd');
      api.markerManager.create({
        id: feature.ol_uid,
        feature,
        value: formatFreeText(feature)
      });
      feature.setStyle(getStyleFunction());
    }
  },
  onUpdate: feature => {
    if (isFreeText(feature)) {
      api.markerManager.updateMarker({
        id: feature.ol_uid,
        value: formatFreeText(feature)
      });
    }
  },
  onRemove: feature => {
    if (isFreeText(feature)) {
      console.debug('FreeTextGeometry: onRemove');
      const featureId = feature.ol_uid;
      api.markerManager.remove(featureId);
    }
  },
  onInteractionsChange: () => {

  },
  getDefinition,
  isFreeText,
  format: formatFreeText
};

export default FreeTextGeometry;