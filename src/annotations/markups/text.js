import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Circle from "ol/style/Circle";

import Enums from "../../enums";

export const isTextEvaluation = (feature) =>
  Enums.Markup.TextEvaluation === feature.get(Enums.InternalProperties.Markup);

/**
 * Format free text output
 * @param {Feature} feature feature
 * @return {string} The formatted output
 */
export const format = (feature) =>
  feature.get(Enums.InternalProperties.Label) || "";

const applyStyle = (feature) => {
  if (hasMarker(feature)) return;
  const style = new Style({
    image: new Circle({
      fill: new Fill({
        color: "rgba(255,255,255,0.0)",
      }),
      stroke: new Stroke({
        color: "rgba(255,255,255,0.0)",
        width: 0,
      }),
      radius: 5,
    }),
  });

  feature.setStyle(style);
};

export const hasMarker = (feature) =>
  !!feature.get(Enums.InternalProperties.Marker);

const onInteractionEventHandler = ({ feature, markupManager }) => {
  if (isTextEvaluation(feature)) {
    const featureHasMarker = hasMarker(feature);
    markupManager.create({
      feature,
      value: format(feature),
      isLinkable: featureHasMarker,
      isDraggable: featureHasMarker,
      offset: featureHasMarker ? [7, 7] : [1, 1],
    });
    applyStyle(feature);
  }
};

/**
 * Text evaluation markup definition
 *
 * @param {object} dependencies Shared dependencies
 * @param {object} dependencies.markupManager MarkupManager shared instance
 */
const TextEvaluationMarkup = ({ markupManager }) => {
  return {
    onAdd: (feature) => {
      if (isTextEvaluation(feature)) {
        onInteractionEventHandler({ feature, markupManager });

        /** Keep text style after external style changes */
        feature.on(
          Enums.FeatureEvents.PROPERTY_CHANGE,
          ({ key: property, target: feature }) => {
            if (property === Enums.InternalProperties.StyleOptions) {
              applyStyle(feature);
            }
          }
        );
      }
    },
    onRemove: (feature) => {
      if (isTextEvaluation(feature)) {
        const featureId = feature.getId();
        markupManager.remove(featureId);
      }
    },
    onUpdate: (feature) => {
      if (isTextEvaluation(feature)) {
        markupManager.update({ feature, value: format(feature) });
      }
    },
    onDrawStart: ({ feature }) => {
      onInteractionEventHandler({ feature, markupManager });
    },
    onDrawEnd: ({ feature }) => {
      onInteractionEventHandler({ feature, markupManager });
    },
  };
};

export default TextEvaluationMarkup;
