import { distance, intersectLine } from "./mathUtils";

// Move long-axis end point
export default function (pointerEventData, shortAxisGeometry, longAxisGeometry) {
  const [shortAxisStartCoords, shortAxisEndCoords] =
    shortAxisGeometry.getCoordinates();
  const [longAxisStartCoords, longAxisEndCoords] =
    longAxisGeometry.getCoordinates();

  const start = { x: longAxisStartCoords[0], y: longAxisStartCoords[1] };
  const end = { x: longAxisEndCoords[0], y: longAxisEndCoords[1] };

  const perpendicularStart = {
    x: shortAxisStartCoords[0],
    y: shortAxisStartCoords[1],
  };
  const perpendicularEnd = {
    x: shortAxisEndCoords[0],
    y: shortAxisEndCoords[1],
  };

  const pointerCoordinate = {
    x: pointerEventData.coordinate[0],
    y: pointerEventData.coordinate[1],
  };

  const longLine = {
    start: {
      x: start.x,
      y: start.y,
    },
    end: {
      x: end.x,
      y: end.y,
    },
  };

  const perpendicularLine = {
    start: {
      x: perpendicularStart.x,
      y: perpendicularStart.y,
    },
    end: {
      x: perpendicularEnd.x,
      y: perpendicularEnd.y,
    },
  };

  const intersection = intersectLine(longLine, perpendicularLine);

  const distanceFromPerpendicularP1 = distance(
    perpendicularStart,
    intersection
  );
  const distanceFromPerpendicularP2 = distance(perpendicularEnd, intersection);

  const distanceToLineP2 = distance(start, intersection);
  const newLineLength = distance(start, pointerCoordinate);

  if (newLineLength <= distanceToLineP2) {
    return false;
  }

  const dx = (start.x - pointerCoordinate.x) / newLineLength;
  const dy = (start.y - pointerCoordinate.y) / newLineLength;

  const k = distanceToLineP2 / newLineLength;

  const newIntersection = {
    x: start.x + (pointerCoordinate.x - start.x) * k,
    y: start.y + (pointerCoordinate.y - start.y) * k,
  };

  perpendicularStart.x = newIntersection.x + distanceFromPerpendicularP1 * dy;
  perpendicularStart.y = newIntersection.y - distanceFromPerpendicularP1 * dx;

  perpendicularEnd.x = newIntersection.x - distanceFromPerpendicularP2 * dy;
  perpendicularEnd.y = newIntersection.y + distanceFromPerpendicularP2 * dx;

  shortAxisGeometry.setProperties({ previousCoordinates: shortAxisGeometry.getCoordinates() }, true);
  shortAxisGeometry.setCoordinates([
    [perpendicularStart.x, perpendicularStart.y],
    [perpendicularEnd.x, perpendicularEnd.y]
  ]);

  return true;
}
