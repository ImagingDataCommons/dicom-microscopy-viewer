import { distance, distanceToPoint, intersectLine } from "./mathUtils";

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

  const invisibleLine = { start: handle, end: shortAxis.end };
  let pointIntersection = intersectLine(longAxis, invisibleLine);
  if (!pointIntersection) {
    event.stopPropagation();
    return false;
  }

  const fudgeFactor = 1;

  const fixedPoint = shortAxis.end;
  const movedPoint = handle;

  const distanceFromFixed = distanceToPoint(longAxis, fixedPoint);
  const distanceFromMoved = distanceToPoint(longAxis, movedPoint);

  const distanceBetweenPoints = distance(fixedPoint, movedPoint);

  const total = distanceFromFixed + distanceFromMoved;

  if (distanceBetweenPoints <= distanceFromFixed) {
    return false;
  }

  const length = distance(longAxis.start, longAxis.end);

  if (length === 0) {
    return false;
  }

  const dx = (longAxis.start.x - longAxis.end.x) / length;
  const dy = (longAxis.start.y - longAxis.end.y) / length;

  const adjustedLineP1 = {
    x: longAxis.start.x - fudgeFactor * dx,
    y: longAxis.start.y - fudgeFactor * dy,
  };
  const adjustedLineP2 = {
    x: longAxis.end.x + fudgeFactor * dx,
    y: longAxis.end.y + fudgeFactor * dy,
  };

  shortAxis.start.x = movedPoint.x;
  shortAxis.start.y = movedPoint.y;
  shortAxis.end.x = movedPoint.x - total * dy;
  shortAxis.end.y = movedPoint.y + total * dx;

  const intersection = intersectLine(longAxis, shortAxis);

  if (!intersection) {
    if (
      distance(movedPoint, longAxis.start) > distance(movedPoint, longAxis.end)
    ) {
      shortAxis.start.x = adjustedLineP2.x + distanceFromMoved * dy;
      shortAxis.start.y = adjustedLineP2.y - distanceFromMoved * dx;
      shortAxis.end.x = shortAxis.start.x - total * dy;
      shortAxis.end.y = shortAxis.start.y + total * dx;
    } else {
      shortAxis.start.x = adjustedLineP1.x + distanceFromMoved * dy;
      shortAxis.start.y = adjustedLineP1.y - distanceFromMoved * dx;
      shortAxis.end.x = shortAxis.start.x - total * dy;
      shortAxis.end.y = shortAxis.start.y + total * dx;
    }
  }

  shortAxisGeometry.setCoordinates([
    [shortAxis.start.x, shortAxis.start.y],
    [shortAxis.end.x, shortAxis.end.y],
  ]);

  return true;
}
