import Enums from "../../enums";
import { getUnitSuffix } from "../../utils";
import {
  getFeatureScoord3dArea,
  getFeatureScoord3dLength,
} from "../../scoord3dUtils.js";
import bidirectional from "./bidirectional/bidirectional";

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
 * @param {object} dependencies Shared dependencies
 * @param {object} dependencies.map Viewer's map instance
 * @param {array} dependencies.features Viewer's features
 * @param {object} dependencies.drawingSource Viewer's drawing source
 * @param {object} dependencies.pyramid Pyramid metadata
 * @param {object} dependencies.markupManager MarkupManager shared instance
 */
const MeasurementMarkup = ({
  map,
  features,
  drawingSource,
  pyramid,
  markupManager,
}) => {
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
        bidirectional.onRemove(feature, {
          features,
          pyramid,
          drawingSource,
          markupManager,
          map,
        });
      }
    },
    onDrawStart: (event, drawingOptions, setFeatureStyle) => {
      const { feature } = event;
      if (_isMeasurement(feature)) {
        markupManager.create({ feature });
        bidirectional.onDrawStart(event, {
          features,
          pyramid,
          drawingOptions,
          setFeatureStyle,
          drawingSource,
          markupManager,
          map,
        });
      }
    },
    onUpdate: (feature) => {},
    onDrawEnd: (event, drawingOptions, setFeatureStyle) => {
      bidirectional.onDrawEnd(event, {
        features,
        pyramid,
        drawingOptions,
        setFeatureStyle,
        drawingSource,
        markupManager,
        map,
      });
    },
    onDrawAbort: ({ feature }) => {},
  };
};

export default MeasurementMarkup;
