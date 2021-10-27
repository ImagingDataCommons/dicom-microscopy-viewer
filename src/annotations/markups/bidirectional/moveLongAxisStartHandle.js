import { distance, intersectLine } from "./mathUtils";

export default function (handle, shortAxisGeometry, longAxisGeometry, event) {
  const shortAxisCoords = shortAxisGeometry.getCoordinates();
  const longAxisCoords = longAxisGeometry.getCoordinates();

  const longAxis = {
    start: {
      x: longAxisCoords[0][0],
      y: longAxisCoords[0][1],
    },
    end: {
      x: longAxisCoords[1][0],
      y: longAxisCoords[1][1],
    },
  };
  const shortAxis = {
    start: {
      x: shortAxisCoords[0][0],
      y: shortAxisCoords[0][1],
    },
    end: {
      x: shortAxisCoords[1][0],
      y: shortAxisCoords[1][1],
    },
  };

  const invisibleLine = { start: handle, end: longAxis.end };
  let pointIntersection = intersectLine(shortAxis, invisibleLine);
  if (!pointIntersection) {
    event.stopPropagation();
    return false;
  }

  const intersection = intersectLine(longAxis, shortAxis);

  const distanceToLineP2 = distance(longAxis.end, intersection);
  const newLineLength = distance(longAxis.end, handle);

  if (newLineLength <= distanceToLineP2) {
    return false;
  }

  const distanceFromShortAxisP1 = distance(shortAxis.start, intersection);
  const distanceFromShortAxisP2 = distance(shortAxis.end, intersection);

  const dx = (longAxis.end.x - handle.x) / newLineLength;
  const dy = (longAxis.end.y - handle.y) / newLineLength;

  const k = distanceToLineP2 / newLineLength;

  const newIntersection = {
    x: longAxis.end.x + (handle.x - longAxis.end.x) * k,
    y: longAxis.end.y + (handle.y - longAxis.end.y) * k,
  };

  shortAxis.start.x = newIntersection.x - distanceFromShortAxisP1 * dy;
  shortAxis.start.y = newIntersection.y + distanceFromShortAxisP1 * dx;

  shortAxis.end.x = newIntersection.x + distanceFromShortAxisP2 * dy;
  shortAxis.end.y = newIntersection.y - distanceFromShortAxisP2 * dx;

  shortAxisGeometry.setCoordinates([
    [shortAxis.start.x, shortAxis.start.y],
    [shortAxis.end.x, shortAxis.end.y],
  ]);

  return true;
}