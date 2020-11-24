import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

import { CustomGeometry } from '.';
import { defaultStyle } from './styles';

export const isFreeText = feature => CustomGeometry.FreeText === feature.getGeometryName();

const getStyleFunction = options => {
  return (feature, resolution) => {
    const styles = [];

    if (options && 'style' in options) {
      styles.push(options.style);
    }

    if (isFreeText(feature)) {
      const emptyFill = new Fill({ color: 'rgba(255,255,255,0.0)' });
      const defaultStroke = new Stroke({
        color: 'rgba(255,255,255,0.0)',
        width: 0,
      });

      styles.push(
        new Style({
          image: new Circle({
            fill: emptyFill,
            stroke: defaultStroke,
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
      console.debug('FreeTextGeometry: onAdd');
      api.markerManager.create({
        id: feature.ol_uid,
        feature,
        value: formatFreeText(feature)
      });
      feature.setStyle(getStyleFunction(properties));
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
  format: formatFreeText,
  style: getStyleFunction,
  hitTolerance: 15
};

export default FreeTextGeometry;