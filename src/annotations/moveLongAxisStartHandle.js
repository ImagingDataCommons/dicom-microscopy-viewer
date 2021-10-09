import { distance, intersectLine } from "./mathUtils";

export default function (handle, shortAxisGeometry, longAxisGeometry) {
  const shortAxisCoords = shortAxisGeometry.getCoordinates();
  const longAxisCoords = longAxisGeometry.getCoordinates();

  const start = { x: longAxisCoords[0][0], y: longAxisCoords[0][1] };
  const end = { x: longAxisCoords[1][0], y: longAxisCoords[1][1] };

  const perpendicularStart = {
    x: shortAxisCoords[0][0],
    y: shortAxisCoords[0][1],
  };
  const perpendicularEnd = {
    x: shortAxisCoords[1][0],
    y: shortAxisCoords[1][1],
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

  const distanceToLineP2 = distance(end, intersection);
  const newLineLength = distance(end, handle);

  if (newLineLength <= distanceToLineP2) {
    return false;
  }

  const dx = (end.x - handle.x) / newLineLength;
  const dy = (end.y - handle.y) / newLineLength;

  const k = distanceToLineP2 / newLineLength;

  const newIntersection = {
    x: end.x + (handle.x - end.x) * k,
    y: end.y + (handle.y - end.y) * k,
  };

  perpendicularStart.x = newIntersection.x - distanceFromPerpendicularP1 * dy;
  perpendicularStart.y = newIntersection.y + distanceFromPerpendicularP1 * dx;

  perpendicularEnd.x = newIntersection.x + distanceFromPerpendicularP2 * dy;
  perpendicularEnd.y = newIntersection.y - distanceFromPerpendicularP2 * dx;

  shortAxisGeometry.setCoordinates([
    [perpendicularStart.x, perpendicularStart.y],
    [perpendicularEnd.x, perpendicularEnd.y],
  ]);

  return true;
}
