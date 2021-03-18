import Style from "ol/style/Style";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Icon from "ol/style/Icon";

import Enums from "../../enums";
import defaultStyles from "../styles";

const getArrowStyle = (point, rotation, anchor, color) => {
  const icon = `
    <svg version="1.1" width="208px" height="208px" viewBox="0 -7.101 760.428 415.101" style="enable-background:new 0 0 408 408;" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path style="fill:${encodeURIComponent(
          color
        )};" d="M 736.978 175.952 L 96.9 178.5 L 239.7 35.7 L 204 0 L 0 204 L 204 408 L 239.7 372.3 L 96.9 229.5 L 737.197 224.191 L 736.978 175.952 Z"/>
      </g>
    </svg>
  `;

  return new Style({
    geometry: new Point(point),
    image: new Icon({
      opacity: 1,
      src: `data:image/svg+xml;utf8,${icon}`,
      scale: 0.2,
      anchor,
      rotateWithView: true,
      rotation: -rotation,
    }),
  });
};

const applyStyle = (feature) => {
  const geometry = feature.getGeometry();
  if (geometry instanceof Point) {
    const anchor = [0, 0.5];
    const rotation = 120;
    const point = geometry.getCoordinates();
    const styleOptions = feature.get(Enums.InternalProperties.StyleOptions);
    const color =
      styleOptions && styleOptions.stroke && styleOptions.stroke.color
        ? styleOptions.stroke.color
        : defaultStyles.stroke.color;
    const arrowStyle = getArrowStyle(point, rotation, anchor, color);
    feature.setStyle(arrowStyle);
  }
};

export const isArrow = (feature) =>
  Enums.Marker.Arrow === feature.get(Enums.InternalProperties.Marker);

/**
 * Format arrow output
 * @param {LineString} arrow geometry
 * @return {string} The formatted output
 */
export const format = (feature) => feature.get(Enums.InternalProperties.Label) || "";

/**
 * Arrow marker definition
 * 
 * @param {object} dependencies Shared dependencies
 * @param {object} dependencies.markupManager MarkupManager shared instance 
 */
const ArrowMarker = ({ markupManager }) => {
  return {
    onAdd: (feature) => {
      if (isArrow(feature)) {
        applyStyle(feature);

        /** Keep arrow style after external style changes */
        feature.on(
          Enums.FeatureEvents.PROPERTY_CHANGE,
          ({ key: property, target: feature }) => {
            if (property === Enums.InternalProperties.StyleOptions) {
              applyStyle(feature);
            }
          }
        );

        /** Update marker position on feature geometry change */
        feature.getGeometry().on(Enums.FeatureGeometryEvents.CHANGE, () => {
          applyStyle(feature);
        });
      }
    },
    onUpdate: (feature) => {},
    onRemove: (feature) => {},
    onDrawStart: ({ feature }) => {},
    onDrawEnd: ({ feature }) => {
      if (isArrow(feature)) {
        applyStyle(feature);
      }
    },
  };
};

export default ArrowMarker;
