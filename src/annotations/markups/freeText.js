import Style from "ol/style/Style";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Text from "ol/style/Text";

import { defaultStyle } from "../markers/styles";
import Enums from "../../enums";

export const isFreeText = (feature) =>
  Enums.Markup.FreeTextEvaluation === feature.get("marker");

const state = {
  style: defaultStyle,
};

const getOpenLayersStyleFunction = (defaultStyle) => (feature, resolution) => {
  if (!isFreeText(feature)) {
    return;
  }

  const styles = [defaultStyle];

  styles.push(
    new Style({
      text: new Text({
        font: "14px sans-serif",
        overflow: true,
        fill: new Fill({ color: "#9ccef9" }),
        text: feature.get("label"),
      }),
      image: new Circle({
        fill: new Fill({ color: "rgba(255,255,255,0.0)" }),
        stroke: new Stroke({
          color: "rgba(255,255,255,0.0)",
          width: 0,
        }),
        radius: 15,
      }),
    })
  );

  return styles;
};

const getDefinition = (options) => {
  state.style = options.style ? options.style : state.style;

  return {
    ...options,
    style: getOpenLayersStyleFunction(options.style),
    marker: Enums.Markup.FreeTextEvaluation,
  };
};

/**
 * Format free text output
 * @param {Feature} feature feature
 * @return {string} The formatted output
 */
const formatFreeText = (feature, geometry) => {
  const properties = feature.getProperties();
  return properties.label || "";
};

const FreeTextMarkup = (api) => {
  return {
    onAdd: (feature) => {},
    onUpdate: (feature) => {
      if (isFreeText(feature)) {
        /** Refresh to get latest value of label property */
        feature.changed();
      }
    },
    onDrawEnd: (feature) => {
      if (isFreeText(feature)) {
        const styleFunction = getOpenLayersStyleFunction(state.style);
        feature.setStyle(styleFunction);
      }
    },
    onRemove: (feature) => {},
    onInteractionsChange: () => {},
    getDefinition,
    isFreeText,
    format: formatFreeText,
    style: getOpenLayersStyleFunction,
  };
};

export default FreeTextMarkup;
