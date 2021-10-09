import { distance, distanceToPoint, intersectLine } from "./mathUtils";

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

  const bidirectional = { start, end, shortAxisEnd, shortAxisStart };

  const fudgeFactor = 1;

  const fixedPoint = shortAxisEnd;
  const movedPoint = handle;

  const distanceFromFixed = distanceToPoint(bidirectional, fixedPoint);
  const distanceFromMoved = distanceToPoint(bidirectional, movedPoint);

  const distanceBetweenPoints = distance(fixedPoint, movedPoint);

  const total = distanceFromFixed + distanceFromMoved;

  if (distanceBetweenPoints <= distanceFromFixed) {
    return false;
  }

  const length = distance(start, end);

  if (length === 0) {
    return false;
  }

  const dx = (start.x - end.x) / length;
  const dy = (start.y - end.y) / length;

  const adjustedLineP1 = {
    x: start.x - fudgeFactor * dx,
    y: start.y - fudgeFactor * dy,
  };
  const adjustedLineP2 = {
    x: end.x + fudgeFactor * dx,
    y: end.y + fudgeFactor * dy,
  };

  shortAxisStart.x = movedPoint.x;
  shortAxisStart.y = movedPoint.y;
  shortAxisEnd.x = movedPoint.x - total * dy;
  shortAxisEnd.y = movedPoint.y + total * dx;

  const longAxis = { start, end };
  const shortAxis = { start: shortAxisStart, end: shortAxisEnd };

  const intersection = intersectLine(longAxis, shortAxis);

  if (!intersection) {
    if (distance(movedPoint, start) > distance(movedPoint, end)) {
      shortAxisStart.x = adjustedLineP2.x + distanceFromMoved * dy;
      shortAxisStart.y = adjustedLineP2.y - distanceFromMoved * dx;
      shortAxisEnd.x = shortAxisStart.x - total * dy;
      shortAxisEnd.y = shortAxisStart.y + total * dx;
    } else {
      shortAxisStart.x = adjustedLineP1.x + distanceFromMoved * dy;
      shortAxisStart.y = adjustedLineP1.y - distanceFromMoved * dx;
      shortAxisEnd.x = shortAxisStart.x - total * dy;
      shortAxisEnd.y = shortAxisStart.y + total * dx;
    }
  }

  shortAxisGeometry.setCoordinates([
    [shortAxisStart.x, shortAxisStart.y],
    [shortAxisEnd.x, shortAxisEnd.y],
  ]);

  return true;
}
