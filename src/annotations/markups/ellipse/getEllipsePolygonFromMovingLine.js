import { fromCircle } from "ol/geom/Polygon";
import CircleGeometry from "ol/geom/Circle";
import { midpoint } from "../bidirectional/mathUtils";

const getEllipsePolygonFromMovingLine = (
  fixedPoint,
  movingPoint,
  currentPoint
) => {
  const mid = midpoint(
    fixedPoint[0],
    movingPoint[0],
    fixedPoint[1],
    movingPoint[1]
  );

  const center = mid;
  const last = currentPoint;
  const dx = center[0] - last[0];
  const dy = center[1] - last[1];
  let radius = Math.sqrt(dx * dx + dy * dy);
  radius = radius > 0 ? radius : Number.MIN_SAFE_INTEGER;
  const circle = new CircleGeometry(center, radius);
  const polygon = fromCircle(circle);
  polygon.scale(dx / radius, dy / radius);

  return polygon;
};

export default getEllipsePolygonFromMovingLine;
