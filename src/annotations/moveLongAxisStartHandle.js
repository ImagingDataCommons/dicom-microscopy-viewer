import { distance, intersectLine } from "./mathUtils";

export default function (handle, shortAxisGeometry, longAxisGeometry) {
  const shortAxisCoords = shortAxisGeometry.getCoordinates();
  const longAxisCoords = longAxisGeometry.getCoordinates();

  const start = { x: longAxisCoords[0][0], y: longAxisCoords[0][1] };
  const end = { x: longAxisCoords[1][0], y: longAxisCoords[1][1] };

  const shortAxisStart = {
    x: shortAxisCoords[0][0],
    y: shortAxisCoords[0][1],
  };
  const shortAxisEnd = {
    x: shortAxisCoords[1][0],
    y: shortAxisCoords[1][1],
  };

  const longAxis = { start, end };
  const shortAxis = { start: shortAxisStart, end: shortAxisEnd };

  const intersection = intersectLine(longAxis, shortAxis);

  const distanceFromShortAxisP1 = distance(shortAxisStart, intersection);
  const distanceFromShortAxisP2 = distance(shortAxisEnd, intersection);

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

  shortAxisStart.x = newIntersection.x - distanceFromShortAxisP1 * dy;
  shortAxisStart.y = newIntersection.y + distanceFromShortAxisP1 * dx;

  shortAxisEnd.x = newIntersection.x + distanceFromShortAxisP2 * dy;
  shortAxisEnd.y = newIntersection.y - distanceFromShortAxisP2 * dx;

  shortAxisGeometry.setCoordinates([
    [shortAxisStart.x, shortAxisStart.y],
    [shortAxisEnd.x, shortAxisEnd.y],
  ]);

  return true;
}
