import Enums from "../../enums";
import { defaultStyle } from "../styles";

export const isFreeText = (feature) =>
  Enums.Markup.FreeTextEvaluation === feature.get("markup");

/**
 * Format free text output
 * @param {Feature} feature feature
 * @return {string} The formatted output
 */
const format = (feature) => feature.get("label") || "";

const FreeTextMarkup = (api) => {
  return {
    onAdd: (feature, options) => {
      if (isFreeText(feature)) {
        feature.setStyle(defaultStyle);
        api.markupManager.create({
          feature,
          value: format(feature),
          isLinkable: !!feature.get("marker"),
          isDraggable: !!feature.get("marker"),
          offset: !!feature.get("marker") ? [7, 7] : [1, 1],
        });
      }
    },
    onRemove: (feature) => {
      if (isFreeText(feature)) {
        const featureId = feature.getId();
        api.markupManager.remove(featureId);
      }
    },
    onUpdate: (feature) => {
      if (isFreeText(feature)) {
        api.markupManager.update({ feature, value: format(feature) });
      }
    },
    onDrawStart: ({ feature }) => {
      if (isFreeText(feature)) {
        feature.setStyle(defaultStyle);
        api.markupManager.create({
          feature,
          isLinkable: !!feature.get("marker"),
          isDraggable: !!feature.get("marker"),
          offset: !!feature.get("marker") ? [7, 7] : [1, 1],
        });
      }
    },
    onDrawEnd: (event) => {},
    isFreeText,
    format,
  };
};

export default FreeTextMarkup;
