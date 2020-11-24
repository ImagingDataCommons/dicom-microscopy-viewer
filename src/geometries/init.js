import { CustomGeometry } from '.';
import MarkerManager from './MarkerManager';
import LengthGeometry from './length';
import ArrowGeometry from './arrow';

const init = ({ map }) => {
  const markerManager = new MarkerManager({
    map,
    geometries: [CustomGeometry.Length, CustomGeometry.Arrow],
    formatters: {
      [CustomGeometry.Length]: LengthGeometry.format,
      [CustomGeometry.Arrow]: ArrowGeometry.format
    }
  });

  LengthGeometry.init({ markerManager, map });
  ArrowGeometry.init({ markerManager, map });
};

export default init;