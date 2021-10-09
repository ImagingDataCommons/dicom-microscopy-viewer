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

  const fixedPoint = perpendicularStart;
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

  perpendicularStart.x = movedPoint.x + total * dy;
  perpendicularStart.y = movedPoint.y - total * dx;
  perpendicularEnd.x = movedPoint.x;
  perpendicularEnd.y = movedPoint.y;
  perpendicularEnd.locked = false;
  perpendicularStart.locked = false;

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
      perpendicularEnd.x = adjustedLineP2.x - distanceFromMoved * dy;
      perpendicularEnd.y = adjustedLineP2.y + distanceFromMoved * dx;
      perpendicularStart.x = perpendicularEnd.x + total * dy;
      perpendicularStart.y = perpendicularEnd.y - total * dx;
    } else {
      perpendicularEnd.x = adjustedLineP1.x - distanceFromMoved * dy;
      perpendicularEnd.y = adjustedLineP1.y + distanceFromMoved * dx;
      perpendicularStart.x = perpendicularEnd.x + total * dy;
      perpendicularStart.y = perpendicularEnd.y - total * dx;
    }
  }

  shortAxisGeometry.setCoordinates([
    [perpendicularStart.x, perpendicularStart.y],
    [perpendicularEnd.x, perpendicularEnd.y],
  ]);

  return true;
}
