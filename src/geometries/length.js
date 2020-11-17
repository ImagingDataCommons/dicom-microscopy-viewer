import { LineString } from 'ol/geom';
import { getLength } from 'ol/sphere';

import { CustomGeometry } from '.';
import MarkerManager from './MarkerManager';

let _map;
let _markerManager;

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
export const formatLength = line => {
  const length = getLength(line);
  let output = Math.round((length / 10) * 100) / 100 + ' ' + 'mm';
  return output;
};

const isLength = feature => CustomGeometry.Length === feature.getGeometryName();

const LengthGeometry = {
  init: ({ map }) => {
    console.debug('LengthGeometry: init');
    _map = map;
    _markerManager = new MarkerManager({
      map: _map,
      geometry: CustomGeometry.Length,
      formatter: formatLength
    });
  },
  onInteractionsChange: interactions => {
    _markerManager.onInteractionsChange(interactions);
  },
  onRemove: feature => {
    if (isLength(feature)) {
      console.debug('LengthGeometry: onRemove');
      const featureId = feature.ol_uid;
      _markerManager.remove(featureId);
    }
  },
  onAdd: feature => {
    if (isLength(feature)) {
      console.debug('LengthGeometry: onAdd');
    }
  },
  getDefinition: (options) => {
    /** Length Geometry Definition */
    return {
      length: {
        type: 'LineString',
        geometryName: CustomGeometry.Length,
        freehand: false,
        maxPoints: 1,
        minPoints: 1,
      },
    };
  }
};

export default LengthGeometry;