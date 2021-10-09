import { distance, distanceToPoint, intersectLine } from "./mathUtils";

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

  const bidirectional = { start, end, perpendicularEnd, perpendicularStart };

  const fudgeFactor = 1;

  const fixedPoint = perpendicularEnd;
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

  perpendicularStart.x = movedPoint.x;
  perpendicularStart.y = movedPoint.y;
  perpendicularEnd.x = movedPoint.x - total * dy;
  perpendicularEnd.y = movedPoint.y + total * dx;

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

  if (!intersection) {
    if (distance(movedPoint, start) > distance(movedPoint, end)) {
      perpendicularStart.x = adjustedLineP2.x + distanceFromMoved * dy;
      perpendicularStart.y = adjustedLineP2.y - distanceFromMoved * dx;
      perpendicularEnd.x = perpendicularStart.x - total * dy;
      perpendicularEnd.y = perpendicularStart.y + total * dx;
    } else {
      perpendicularStart.x = adjustedLineP1.x + distanceFromMoved * dy;
      perpendicularStart.y = adjustedLineP1.y - distanceFromMoved * dx;
      perpendicularEnd.x = perpendicularStart.x - total * dy;
      perpendicularEnd.y = perpendicularStart.y + total * dx;
    }
  }

  shortAxisGeometry.setCoordinates([
    [perpendicularStart.x, perpendicularStart.y],
    [perpendicularEnd.x, perpendicularEnd.y],
  ]);

  return true;
}
