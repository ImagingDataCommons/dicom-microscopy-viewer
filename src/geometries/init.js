import { CustomGeometry } from '.';
import MarkerManager from './MarkerManager';
import LengthGeometry from './length';
import ArrowGeometry from './arrow';
import FreeTextGeometry from './freeText';

const init = ({ map }) => {
  const markerManager = new MarkerManager({
    map,
    geometries: [CustomGeometry.Length, CustomGeometry.Arrow, CustomGeometry.FreeText],
    unlinkGeometries: [CustomGeometry.FreeText],
    undraggableGeometries: [CustomGeometry.FreeText],
    formatters: {
      [CustomGeometry.Length]: LengthGeometry.format,
      [CustomGeometry.Arrow]: ArrowGeometry.format,
      [CustomGeometry.FreeText]: FreeTextGeometry.format
    }
  });

  LengthGeometry.init({ markerManager, map });
  ArrowGeometry.init({ markerManager, map });
  FreeTextGeometry.init({ markerManager, map });
};

export default init;