import { CustomGeometry, MarkerManager } from './index';
import {
  ArrowGeometry,
  LengthGeometry,
  FreeTextGeometry
} from './definitions';

const init = ({ map, source, controls }) => {
  console.debug('Geometries: init');
  const markerManager = new MarkerManager({
    map,
    geometries: [CustomGeometry.Length, CustomGeometry.Arrow],
    unlinkGeometries: [CustomGeometry.FreeText],
    undraggableGeometries: [CustomGeometry.FreeText],
    formatters: {
      [CustomGeometry.Length]: LengthGeometry.format,
      [CustomGeometry.Arrow]: ArrowGeometry.format,
      [CustomGeometry.FreeText]: FreeTextGeometry.format
    },
  });

  LengthGeometry.init({ markerManager, map, source, controls });
  ArrowGeometry.init({ markerManager, map, source, controls });
  FreeTextGeometry.init({ markerManager, map, source, controls });
};

export default init;