import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';

import { CustomGeometry } from '..';

export const isFreeText = feature => CustomGeometry.FreeText === feature.getGeometryName();

const getStyleFunction = options => {
  return (feature, resolution) => {
    const styles = [];

    if (isFreeText(feature)) {
      styles.push(
        new Style({
          text: new Text({
            font: '14px sans-serif',
            overflow: true,
            fill: new Fill({ color: '#9ccef9' }),
            text: feature.get('label')
          })
        })
      );

      styles.push(
        new Style({
          image: new Circle({
            fill: new Fill({ color: 'rgba(255,255,255,0.0)' }),
            stroke: new Stroke({
              color: 'rgba(255,255,255,0.0)',
              width: 0,
            }),
            radius: 15,
          })
        })
      );
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
      feature.setStyle(getStyleFunction(properties));
    }
  },
  onUpdate: feature => {
    if (isFreeText(feature)) {
      /** Get latest value of label property updated externally */
      feature.changed();
    }
  },
  onRemove: feature => {},
  onInteractionsChange: () => {},
  getDefinition,
  isFreeText,
  format: formatFreeText,
  style: getStyleFunction,
};

export default FreeTextGeometry;