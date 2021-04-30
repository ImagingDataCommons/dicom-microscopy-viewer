import Enums from "../../enums";
import { getUnitSuffix } from "../../utils";
import {
  getFeatureScoord3dArea,
  getFeatureScoord3dLength,
} from "../../scoord3dUtils.js";

/**
 * Format measure output.
 * 
 * @param {Feature} feature feature
 * @param {string} units units
 * @return {string} The formatted measure of this feature
 */
export const format = (feature, units, pyramid) => {
  let value =
    getFeatureScoord3dLength(feature, pyramid) ||
    getFeatureScoord3dArea(feature, pyramid);
  return `${value.toFixed(2)} ${units}`;
};

/**
 * Checks if feature has measurement markup properties.
 *
 * @param {object} feature
 * @returns {boolean} true if feature has measurement markup properties
 */
const _isMeasurement = (feature) =>
  Enums.Markup.Measurement === feature.get(Enums.InternalProperties.Markup);

/**
 * Measurement markup definition.
 *
 * @param {object} dependencies Shared dependencies
 * @param {object} dependencies.map Viewer's map instance
 * @param {object} dependencies.pyramid Pyramid metadata
 * @param {object} dependencies.markupManager MarkupManager shared instance
 */
const MeasurementMarkup = ({ map, pyramid, markupManager }) => {
  return {
    onAdd: (feature) => {
      if (_isMeasurement(feature)) {
        const view = map.getView();
        const unitSuffix = getUnitSuffix(view);
        const ps = feature.get(Enums.InternalProperties.PresentationState);
        markupManager.create({
          feature,
          value: format(feature, unitSuffix, pyramid),
          position: ps && ps.markup ? ps.markup.coordinates : null,
        });
      }
    },
    onFailure: (uid) => {
      if (uid) {
        markupManager.remove(uid);
      }
    },
    onRemove: (feature) => {
      if (_isMeasurement(feature)) {
        const featureId = feature.getId();
        markupManager.remove(featureId);
      }
    },
    onDrawStart: ({ feature }) => {
      if (_isMeasurement(feature)) {
        markupManager.create({ feature });
      }
    },
    onUpdate: (feature) => {},
    onDrawEnd: ({ feature }) => {},
    onDrawAbort: ({ feature }) => {},
  };
};

export default MeasurementMarkup;
