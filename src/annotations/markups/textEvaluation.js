import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';

import Enums from '../../enums';

/**
 * Format free text output.
 *
 * @param {Feature} feature feature
 *
 * @return {string} The formatted output
 *
 * @private
 */
export const _format = (feature) =>
  feature.get(Enums.InternalProperties.Label) || '';

/**
 * Builds the text evaluation style.
 *
 * @param {object} feature
 *
 * @returns {object} Style instance
 *
 * @private
 */
const _applyStyle = (feature) => {
  if (_hasMarker(feature)) {
    return;
  }

  const style = new Style({
    image: new Circle({
      fill: new Fill({
        color: 'rgba(255,255,255,0.0)',
      }),
      stroke: new Stroke({
        color: 'rgba(255,255,255,0.0)',
        width: 0,
      }),
      radius: 5,
    }),
  });

  feature.setStyle(style);
};

/**
 * Check if feature has text evaluation properties.
 *
 * @param {object} feature
 *
 * @returns {boolean} yes/no answer
 *
 * @private
 */
const _hasMarkup = (feature) =>
  Enums.Markup.TextEvaluation === feature.get(Enums.InternalProperties.Markup);

/**
 * Check if feature has marker properties.
 *
 * @param {object} feature
 *
 * @returns {boolean} yes/no answer
 *
 * @private
 */
const _hasMarker = (feature) => !!feature.get(Enums.InternalProperties.Marker);

/**
 * Handler to create markups based on feature properties
 * and apply text evaluation styles.
 *
 * @param {object} feature
 * @param {object} markupManager MarkupManager instance
 *
 * @private
 */
const _onInteractionEventHandler = ({ feature, markupManager }) => {
  const featureHasMarker = _hasMarker(feature);
  markupManager.create({
    feature,
    value: _format(feature),
    isLinkable: featureHasMarker,
    isDraggable: featureHasMarker,
  });
  _applyStyle(feature);
};

/**
 * Text evaluation markup definition.
 *
 * @param {object} dependencies Shared dependencies
 * @param {object} dependencies.markupManager MarkupManager shared instance
 *
 * @private
 */
const TextEvaluationMarkup = ({ markupManager }) => {
  return {
    onAdd: (feature) => {
      if (_hasMarkup(feature)) {
        _onInteractionEventHandler({ feature, markupManager });

        /** Keep text style after external style changes */
        feature.on(
          Enums.FeatureEvents.PROPERTY_CHANGE,
          ({ key: property, target: feature }) => {
            if (property === Enums.InternalProperties.StyleOptions) {
              _applyStyle(feature);
            }
          }
        );
      }
    },
    onFailure: (uid) => {
      if (uid) {
        markupManager.remove(uid);
      }
    },
    onRemove: (feature) => {
      if (_hasMarkup(feature)) {
        const featureId = feature.getId();
        markupManager.remove(featureId);
      }
    },
    onUpdate: (feature) => {
      if (_hasMarkup(feature)) {
        markupManager.update({ feature, value: _format(feature) });
      }
    },
    onDrawStart: ({ feature }) => {
      if (_hasMarkup(feature)) {
        _onInteractionEventHandler({ feature, markupManager });
      }
    },
    onDrawEnd: ({ feature }) => {
      if (_hasMarkup(feature)) {
        _onInteractionEventHandler({ feature, markupManager });
      }
    },
    onDrawAbort: ({ feature }) => {},
  };
};

export default TextEvaluationMarkup;
