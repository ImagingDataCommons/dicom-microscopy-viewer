import { CustomGeometry } from '.';
import MarkerManager from './MarkerManager';
import LengthGeometry from './length';
import ArrowGeometry from './arrow';
import FreeTextGeometry from './freeText';

const init = ({ map, source }) => {
  const markerManager = new MarkerManager({
    map,
    geometries: [CustomGeometry.Length, CustomGeometry.Arrow],
    unlinkGeometries: [CustomGeometry.FreeText],
    undraggableGeometries: [CustomGeometry.FreeText],
    formatters: {
      [CustomGeometry.Length]: LengthGeometry.format,
      [CustomGeometry.Arrow]: ArrowGeometry.format,
      [CustomGeometry.FreeText]: FreeTextGeometry.format
    }
  });

  LengthGeometry.init({ markerManager, map, source });
  ArrowGeometry.init({ markerManager, map, source });
  FreeTextGeometry.init({ markerManager, map, source });
};

export default init;