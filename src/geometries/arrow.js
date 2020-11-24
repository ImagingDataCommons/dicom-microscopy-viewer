import Style from 'ol/style/Style';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';

import { CustomGeometry } from '.';
import { defaultStyle } from './styles';

const getStyleFunction = (options) => {
  return (feature, resolution) => {
    const geometry = feature.getGeometry();
    const styles = [defaultStyle];

    if (options && 'style' in options) {
      styles.push(options.style);
    }

    if (isArrow(feature)) {
      geometry.forEachSegment((start, end) => {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);

        /** Arrow */
        styles.push(
          new Style({
            geometry: new Point(start),
            image: new Icon({
              src: 'https://openlayers.org/en/latest/examples/data/arrow.png',
              anchor: [0.75, 0.5],
              rotateWithView: true,
              rotation: -rotation,
            }),
          })
        );
      });
    }

    return styles;
  };
};

export const isArrow = feature => CustomGeometry.Arrow === feature.getGeometryName();

const getDefinition = options => {
  const styleFunction = getStyleFunction(options);

  /** Arrow Geometry Definition */
  return {
    arrow: {
      type: 'LineString',
      name: 'ArrowAnnotation',
      geometryName: CustomGeometry.Arrow,
      freehand: false,
      maxPoints: 1,
      minPoints: 1,
      style: styleFunction
    }
  };
};

/**
 * Format arrow output
 * @param {LineString} arrow geometry
 * @return {string} The formatted output
 */
const formatArrow = (feature, geometry) => {
  const properties = feature.getProperties();
  return properties.label || '';
};

let api;
const ArrowGeometry = {
  init: apiInstance => api = apiInstance,
  getROIProperties: (feature, properties = {}) => {
    return isArrow(feature) ?
      { ...properties, geometryName: CustomGeometry.Arrow }
      : properties;
  },
  onAdd: (feature, properties = {}) => {
    if (isArrow(feature)) {
      console.debug('ArrowGeometry: onAdd', feature);
      api.markerManager.create({
        id: feature.ol_uid,
        feature,
        value: formatArrow(feature)
      });
      feature.setStyle(getStyleFunction(properties));
    }
  },
  onUpdate: feature => {
    if (isArrow(feature)) {
      api.markerManager.updateMarker({
        id: feature.ol_uid,
        value: formatArrow(feature)
      });
    }
  },
  onRemove: feature => {
    if (isArrow(feature)) {
      console.debug('ArrowGeometry: onRemove');
      const featureId = feature.ol_uid;
      api.markerManager.remove(featureId);
    }
  },
  onInteractionsChange: () => {

  },
  getDefinition,
  isArrow,
  format: formatArrow,
  style: getStyleFunction
};

export default ArrowGeometry;