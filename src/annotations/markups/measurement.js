import Enums from "../../enums";
import { getUnitSuffix } from "../../utils";
import { getFeatureArea, getFeatureLength } from "../../_utils.js";

/**
 * Format measure output
 * @param {Feature} feature feature
 * @param {string} units units
 * @return {string} The formatted measure of this feature
 */
export const format = (feature, units) => {
  let value = getFeatureLength(feature) || getFeatureArea(feature);
  let rawValue = Math.round((value / 10) * 100) / 100;
  let output = Math.round((rawValue / 10) * 100) / 100 + " " + units;
  return output;
};

/**
 * Checks if feature has measurement markup properties
 *
 * @param {object} feature
 * @returns {boolean} true if feature has measurement markup properties
 */
const _isMeasurement = (feature) =>
  Enums.Markup.Measurement === feature.get(Enums.InternalProperties.Markup);

/**
 * Measurement markup definition
 *
 * @param {object} dependencies Shared dependencies
 * @param {object} dependencies.map Viewer's map instance
 * @param {object} dependencies.markupManager MarkupManager shared instance
 */
const MeasurementMarkup = ({ map, markupManager }) => {
  return {
    onAdd: (feature) => {
      if (_isMeasurement(feature)) {
        const view = map.getView();
        const unitSuffix = getUnitSuffix(view);
        markupManager.create({
          feature,
          value: format(feature, unitSuffix),
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
  };
};

export default MeasurementMarkup;
