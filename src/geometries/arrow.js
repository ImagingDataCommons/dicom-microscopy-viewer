import Style from 'ol/style/Style';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';

import { CustomGeometry } from '.';

const getStyleFunction = options => {
  return feature => {
    const geometry = feature.getGeometry();
    const styles = [];

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

const isArrow = feature => CustomGeometry.Arrow === feature.getGeometryName();

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

const ArrowGeometry = {
  init: ({ map }) => {
    console.debug('ArrowGeometry: init');
    _map = map;
  },
  onAdd: feature => {
    if (isArrow(feature)) {
      console.debug('ArrowGeometry: onAdd');
      feature.setStyle(getStyleFunction());
    }
  },
  onRemove: feature => {
    if (isArrow(feature)) {
      console.debug('ArrowGeometry: onRemove');
    }
  },
  onInteractionsChange: () => {
    
  },
  getDefinition
};

export default ArrowGeometry;