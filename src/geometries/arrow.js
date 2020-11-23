import Style from 'ol/style/Style';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';

import MarkerManager from './MarkerManager';
import { CustomGeometry } from '.';

const getStyleFunction = options => {
  return feature => {
    const geometry = feature.getGeometry();
    const styles = [];

    if (options && 'style' in options) {
      styles.push(options.style);
    }

    console.debug(feature.getGeometryName());
    if (isArrow(feature)) {
      console.debug('Styling...');

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
      geometryName: CustomGeometry.Arrow,
      freehand: false,
      maxPoints: 1,
      minPoints: 1,
      style: styleFunction
    }
  };
};

let _map;
let _markerManager;

const ArrowGeometry = {
  init: ({ map }) => {
    console.debug('ArrowGeometry: init');
    _map = map;
    _markerManager = new MarkerManager({
      map: _map,
      geometry: CustomGeometry.Arrow,
      formatter: (feature, geometry) => feature.get('label')
    });
  },
  getProperties: (feature, properties = {}) => {
    return properties;
  },
  onAdd: (feature, properties = {}) => {
    if (isArrow(feature)) {
      console.debug('ArrowGeometry: onAdd');
      _markerManager.create({
        id: feature.ol_uid,
        feature,
        value: properties.label
      });
      feature.setStyle(getStyleFunction());
    }
  },
  onRemove: feature => {
    if (isArrow(feature)) {
      console.debug('ArrowGeometry: onRemove');
      const featureId = feature.ol_uid;
      _markerManager.remove(featureId);
    }
  },
  onInteractionsChange: () => {

  },
  getDefinition,
  isArrow
};

export default ArrowGeometry;