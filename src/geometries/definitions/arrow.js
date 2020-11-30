import Style from 'ol/style/Style';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';

import { CustomGeometry } from '..';
import { defaultStyle } from '../styles';

const svg = `
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    width="106px" height="106px" viewBox="0 0 306 306" xml:space="preserve">
    <g><polygon style="fill:%233399CC;" points="207.093,30.187 176.907,0 48.907,128 176.907,256 207.093,225.813 109.28,128"/></g>
  </svg>
`;

const getStyleFunction = (options) => {
  return (feature, resolution) => {
    const geometry = feature.getGeometry();
    const styles = [];

    if (options && 'style' in options) {
      styles.push(options.style);
    }

    if (isArrow(feature)) {
      styles.push(defaultStyle);

      geometry.forEachSegment((start, end) => {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);

        /** Arrow */
        styles.push(
          new Style({
            geometry: new Point(start),
            image: new Icon({
              opacity: 1,
              src: `data:image/svg+xml;utf8,${svg}`,
              scale: 0.2,
              anchor: [0.4, 0.4],
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
      api.markerManager.create({ feature, value: formatArrow(feature) });
      feature.setStyle(getStyleFunction(properties));
      /** Get latest value of label property updated externally */
      feature.changed();
    }
  },
  onUpdate: feature => {
    if (isArrow(feature)) {
      api.markerManager.updateMarker({ feature, value: formatArrow(feature) });
    }
  },
  onRemove: feature => {
    if (isArrow(feature)) {
      const featureId = feature.getId();
      api.markerManager.remove(featureId);
    }
  },
  onInteractionsChange: interactions => { },
  getDefinition,
  isArrow,
  format: formatArrow,
  style: getStyleFunction
};

export default ArrowGeometry;