import Enums from "../../enums";
import { getUnitsSuffix } from "../../utils";

/**
 * Format measure output
 * @param {Feature} feature feature
 * @param {string} units units
 * @return {string} The formatted measure of this feature
 */
export const format = (feature, units) => {
  let value =
    feature.get(Enums.FeatureMeasurement.Length) ||
    feature.get(Enums.FeatureMeasurement.Area);
  let rawValue = Math.round((value / 10) * 100) / 100;
  let output = Math.round((rawValue / 10) * 100) / 100 + " " + units;
  return output;
};

export const isMeasurement = (feature) =>
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
      if (isMeasurement(feature)) {
        const view = map.getView();
        const unitsSuffix = getUnitsSuffix(view);
        markupManager.create({
          feature,
          value: format(feature, unitsSuffix),
        });
      }
    },
    onRemove: (feature) => {
      if (isMeasurement(feature)) {
        const featureId = feature.getId();
        markupManager.remove(featureId);
      }
    },
    onUpdate: (feature) => {},
    onDrawStart: ({ feature }) => {
      if (isMeasurement(feature)) {
        markupManager.create({ feature });
      }
    },
    onDrawEnd: ({ feature }) => {},
  };
};

export default MeasurementMarkup;
