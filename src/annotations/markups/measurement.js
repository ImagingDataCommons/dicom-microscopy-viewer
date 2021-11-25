import Enums from "../../enums";
import { getUnitSuffix } from "../../utils";
import {
  getFeatureScoord3dArea,
  getFeatureScoord3dLength,
} from "../../scoord3dUtils.js";
import annotationInterface from "../annotationInterface";

/**
 * Format measure output.
 *
 * @param {Feature} feature feature
 * @param {string} units units
 * @return {string} The formatted measure of this feature
 */
export const format = (feature, units, pyramid) => {
  const area = getFeatureScoord3dArea(feature, pyramid);
  const length = getFeatureScoord3dLength(feature, pyramid);
  const value = length || area || 0;
  return length
    ? `${value.toFixed(2)} ${units}`
    : `${value.toFixed(2)} ${units}²`;
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
 * @param {object} viewerProperties Shared viewerProperties
 * @param {object} viewerProperties.map Viewer's map instance
 * @param {object} viewerProperties.drawingSource Viewer's drawing source
 * @param {object} viewerProperties.pyramid Pyramid metadata
 * @param {object} viewerProperties.markupManager MarkupManager shared instance
 */
const MeasurementMarkup = (viewerProperties) => {
  const { map, pyramid, markupManager } = viewerProperties;

  return Object.assign({}, annotationInterface, {
    onAdd: (feature) => {
      if (_isMeasurement(feature)) {
        const isSilentFeature = feature.get(Enums.InternalProperties.IsSilentFeature)
        if (isSilentFeature == true) {
          return;
        }

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
    onDrawStart: (event, drawingOptions) => {
      const { feature } = event;
      if (_isMeasurement(feature)) {
        markupManager.create({ feature });
      }
    },
  });
};

export default MeasurementMarkup;
