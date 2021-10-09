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

  const fixedPoint = shortAxisStart;
  const movedPoint = handle;

  const distanceFromFixed = distanceToPoint(bidirectional, fixedPoint);
  const distanceFromMoved = distanceToPoint(bidirectional, movedPoint);

  const distanceBetweenPoints = distance(fixedPoint, movedPoint);

  const total = distanceFromFixed + distanceFromMoved;

  if (distanceBetweenPoints <= distanceFromFixed) {
    return false;
  }

  const length = distance(start, end);
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

  shortAxisStart.x = movedPoint.x + total * dy;
  shortAxisStart.y = movedPoint.y - total * dx;
  shortAxisEnd.x = movedPoint.x;
  shortAxisEnd.y = movedPoint.y;

  const longAxis = { start, end };
  const shortAxis = { start: shortAxisStart, end: shortAxisEnd };

  const intersection = intersectLine(longAxis, shortAxis);

  if (!intersection) {
    if (distance(movedPoint, start) > distance(movedPoint, end)) {
      shortAxisEnd.x = adjustedLineP2.x - distanceFromMoved * dy;
      shortAxisEnd.y = adjustedLineP2.y + distanceFromMoved * dx;
      shortAxisStart.x = shortAxisEnd.x + total * dy;
      shortAxisStart.y = shortAxisEnd.y - total * dx;
    } else {
      shortAxisEnd.x = adjustedLineP1.x - distanceFromMoved * dy;
      shortAxisEnd.y = adjustedLineP1.y + distanceFromMoved * dx;
      shortAxisStart.x = shortAxisEnd.x + total * dy;
      shortAxisStart.y = shortAxisEnd.y - total * dx;
    }
  }

  shortAxisGeometry.setCoordinates([
    [shortAxisStart.x, shortAxisStart.y],
    [shortAxisEnd.x, shortAxisEnd.y],
  ]);

  return true;
}
