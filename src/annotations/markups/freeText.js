import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Circle from "ol/style/Circle";

import Enums from "../../enums";

export const isFreeText = (feature) =>
  Enums.Markup.FreeTextEvaluation === feature.get("markup");

/**
 * Format free text output
 * @param {Feature} feature feature
 * @return {string} The formatted output
 */
const format = (feature) => feature.get("label") || "";

const applyStyle = (feature) => {
  if (hasMarker(feature)) return;
  const hiddenPoint = new Style({
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
  feature.setStyle(hiddenPoint);
};

const hasMarker = (feature) => !!feature.get("marker");

const FreeTextMarkup = (api) => {
  return {
    onAdd: (feature) => {
      if (isFreeText(feature)) {
        const featureHasMarker = hasMarker(feature);
        api.markupManager.create({
          feature,
          value: format(feature),
          isLinkable: featureHasMarker,
          isDraggable: featureHasMarker,
          offset: featureHasMarker ? [7, 7] : [1, 1],
        });
        applyStyle(feature);
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
    onDrawStart: () => {},
    onDrawEnd: ({ feature }) => {
      if (isFreeText(feature)) {
        const featureHasMarker = hasMarker(feature);
        api.markupManager.create({
          feature,
          isLinkable: featureHasMarker,
          isDraggable: featureHasMarker,
          offset: featureHasMarker ? [7, 7] : [1, 1],
        });
        applyStyle(feature);
      }
    },
    isFreeText,
    format,
  };
};

export default FreeTextMarkup;
