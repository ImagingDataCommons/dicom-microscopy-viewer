import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";
import Point from "ol/geom/Point";

const styles = {
  image: {
    radius: 7,
  },
  stroke: {
    color: "black",
    width: 3,
  },
};

export function ellipseHandlesStyleFunction(feature) {
  const styles = [];
  const featureGeometry = feature.getGeometry();

  const type = featureGeometry.getType();
  if (type !== "LineString") {
    return styles;
  }

  const [start, end] = featureGeometry.getCoordinates();

  styles.push(getHandleStyle(start));
  styles.push(getHandleStyle(end));

  return styles;
}

export const getHandleStyle = (coords) =>
  new Style({
    geometry: new Point(coords),
    image: new CircleStyle({
      radius: styles.image.radius,
      stroke: new Stroke({
        color: styles.stroke.color,
        width: styles.stroke.width,
      }),
    }),
  });

export const getEllipseStyle = () =>
  new Style({
    stroke: new Stroke({
      color: styles.stroke.color,
      width: styles.stroke.width,
    }),
  });

export default styles;
