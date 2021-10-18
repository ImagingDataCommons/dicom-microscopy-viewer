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

  const invisibleLine = { start: shortAxis.start, end: handle };
  let pointIntersection = intersectLine(longAxis, invisibleLine);
  if (!pointIntersection) {
    event.stopPropagation();
    return false;
  }

  const fudgeFactor = 1;

  const fixedPoint = shortAxis.start;
  const movedPoint = handle;

  const distanceFromFixed = distanceToPoint(longAxis, fixedPoint);
  const distanceFromMoved = distanceToPoint(longAxis, movedPoint);

  const distanceBetweenPoints = distance(fixedPoint, movedPoint);

  const total = distanceFromFixed + distanceFromMoved;

  if (distanceBetweenPoints <= distanceFromFixed) {
    return false;
  }

  const length = distance(longAxis.start, longAxis.end);

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

  shortAxis.start.x = movedPoint.x + total * dy;
  shortAxis.start.y = movedPoint.y - total * dx;
  shortAxis.end.x = movedPoint.x;
  shortAxis.end.y = movedPoint.y;

  const intersection = intersectLine(longAxis, shortAxis);

  if (!intersection) {
    if (
      distance(movedPoint, longAxis.start) > distance(movedPoint, longAxis.end)
    ) {
      shortAxis.end.x = adjustedLineP2.x - distanceFromMoved * dy;
      shortAxis.end.y = adjustedLineP2.y + distanceFromMoved * dx;
      shortAxis.start.x = shortAxis.end.x + total * dy;
      shortAxis.start.y = shortAxis.end.y - total * dx;
    } else {
      shortAxis.end.x = adjustedLineP1.x - distanceFromMoved * dy;
      shortAxis.end.y = adjustedLineP1.y + distanceFromMoved * dx;
      shortAxis.start.x = shortAxis.end.x + total * dy;
      shortAxis.start.y = shortAxis.end.y - total * dx;
    }
  }

  shortAxisGeometry.setCoordinates([
    [shortAxis.start.x, shortAxis.start.y],
    [shortAxis.end.x, shortAxis.end.y],
  ]);

  return true;
}
