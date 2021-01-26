import Style from "ol/style/Style";
import Point from "ol/geom/Point";
import Circle from "ol/style/Circle";
import LineString from "ol/geom/LineString";
import Icon from "ol/style/Icon";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

import Enums from "../../enums";
import { defaultStyle } from "./styles";

const arrow = `
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    width="106px" height="106px" viewBox="0 0 306 306" xml:space="preserve">
    <g><polygon style="fill:%233399CC;" points="207.093,30.187 176.907,0 48.907,128 176.907,256 207.093,225.813 109.28,128"/></g>
  </svg>
`;

const longArrow = `
  <svg version="1.1" width="208px" height="208px" viewBox="0 -7.101 760.428 415.101" style="enable-background:new 0 0 408 408;" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path style="fill:%233399CC;" d="M 736.978 175.952 L 96.9 178.5 L 239.7 35.7 L 204 0 L 0 204 L 204 408 L 239.7 372.3 L 96.9 229.5 L 737.197 224.191 L 736.978 175.952 Z"/>
    </g>
  </svg>
`;

const getOpenLayersStyleFunction = (defaultStyle, drawStyle, roiStyle) => (
  feature,
  resolution
) => {
  if (!isArrow(feature)) {
    return;
  }

  const styles = [defaultStyle];

  if (drawStyle) {
    styles.push(drawStyle);
  }

  if (roiStyle) {
    styles.push(roiStyle);
  }

  const addArrowStyle = (point, rotation, anchor, icon) => {
    styles.push(
      new Style({
        geometry: new Point(point),
        image: new Icon({
          opacity: 1,
          src: `data:image/svg+xml;utf8,${icon}`,
          scale: 0.2,
          anchor,
          rotateWithView: true,
          rotation: -rotation,
        }),
      })
    );
  };

  const geometry = feature.getGeometry();
  if (geometry instanceof Point) {
    /** Remove dot */
    styles.push(
      new Style({
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
    const anchor = [0, 0.5];
    const point = geometry.getCoordinates();
    addArrowStyle(point, 120, anchor, longArrow);
  }

  if (geometry instanceof LineString) {
    geometry.forEachSegment((start, end) => {
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const rotation = Math.atan2(dy, dx);
      const anchor = [0.4, 0.4];
      addArrowStyle(start, rotation, anchor, arrow);
    });
  }

  return styles;
};

export const isArrow = (feature) =>
  Enums.Marker.Arrow === feature.get("marker");

/**
 * Format arrow output
 * @param {LineString} arrow geometry
 * @return {string} The formatted output
 */
const formatArrow = (feature, geometry) => {
  const properties = feature.getProperties();
  return properties.label || "";
};

const ArrowMarker = (api) => {
  return {
    getDefinition: (options) => {
      return {
        ...options,
        maxPoints: options.type === "LineString" ? 1 : undefined,
        minPoints: options.type === "LineString" ? 1 : undefined,
        style: getOpenLayersStyleFunction(defaultStyle, options.style),
        marker: Enums.Marker.Arrow,
      };
    },
    onAdd: (feature, options) => {
      if (isArrow(feature)) {
        const styleFunction = getOpenLayersStyleFunction(
          defaultStyle,
          null,
          options.style
        );
        feature.setStyle(styleFunction);
        api.markupManager.create({ feature, value: formatArrow(feature) });
        /** Refresh to get latest value of label property */
        feature.changed();
      }
    },
    onUpdate: (feature) => {
      if (isArrow(feature)) {
        api.markupManager.updateMarker({
          feature,
          value: formatArrow(feature),
        });
      }
    },
    onRemove: (feature) => {
      if (isArrow(feature)) {
        const featureId = feature.getId();
        api.markupManager.remove(featureId);
      }
    },
    onDrawEnd: (feature) => {
      if (isArrow(feature)) {
        const styleFunction = getOpenLayersStyleFunction(defaultStyle);
        feature.setStyle(styleFunction);
      }
    },
    onInteractionsChange: (interactions) => {},
    isArrow,
    format: formatArrow,
    style: getOpenLayersStyleFunction,
  };
};

export default ArrowMarker;
