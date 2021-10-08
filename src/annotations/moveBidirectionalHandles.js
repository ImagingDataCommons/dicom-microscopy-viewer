import { distance, intersectLine } from "./mathUtils";
import moveLongAxisEndHandle from "./moveLongAxisEndHandle";
import moveLongAxisStartHandle from "./moveLongAxisStartHandle";
import moveShortAxisEndHandle from "./moveShortAxisEndHandle";
import moveShortAxisStartHandle from "./moveShortAxisStartHandle";

export default function (
  handle = { x: 0, y: 0 },
  pointerEventData,
  longAxisFeature,
  shortAxisFeature
) {
  let movedPoint;
  let outOfBounds;
  let result;
  let intersection;
  let d1;
  let d2;

  const longAxisGeometry = longAxisFeature.getGeometry();
  const shortAxisGeometry = shortAxisFeature.getGeometry();

  const longAxisCoordinates = longAxisGeometry.getCoordinates();
  const shortAxisCoordinates = shortAxisGeometry.getCoordinates();

  const shortAxisGeometryProperties = shortAxisGeometry.getProperties();
  const previousShortAxisGeometryCoordinates =
    shortAxisGeometryProperties.previousCoordinates || shortAxisCoordinates;

  const longAxisGeometryProperties = longAxisGeometry.getProperties();
  const previousLongAxisGeometryCoordinates =
    longAxisGeometryProperties.previousCoordinates || longAxisCoordinates;

  let isShortAxisStartHandleChange =
    shortAxisCoordinates[0][0] !== previousShortAxisGeometryCoordinates[0][0] ||
    shortAxisCoordinates[0][1] !== previousShortAxisGeometryCoordinates[0][1];

  let isShortAxisEndHandleChange =
    shortAxisCoordinates[1][0] !== previousShortAxisGeometryCoordinates[1][0] ||
    shortAxisCoordinates[1][1] !== previousShortAxisGeometryCoordinates[1][1];

  let isLongAxisStartHandleChange =
    longAxisCoordinates[0][0] !== previousLongAxisGeometryCoordinates[0][0] ||
    longAxisCoordinates[0][1] !== previousLongAxisGeometryCoordinates[0][1];

  let isLongAxisEndHandleChange =
    longAxisCoordinates[1][0] !== previousLongAxisGeometryCoordinates[1][0] ||
    longAxisCoordinates[1][1] !== previousLongAxisGeometryCoordinates[1][1];

  const longLine = {};
  const perpendicularLine = {};

  const start = { x: longAxisCoordinates[0][0], y: longAxisCoordinates[0][1] };
  const end = { x: longAxisCoordinates[1][0], y: longAxisCoordinates[1][1] };

  const perpendicularStart = {
    x: shortAxisCoordinates[0][0],
    y: shortAxisCoordinates[0][1],
  };
  const perpendicularEnd = {
    x: shortAxisCoordinates[1][0],
    y: shortAxisCoordinates[1][1],
  };

  const pointerCoordinate = {
    x: pointerEventData.coordinate[0],
    y: pointerEventData.coordinate[1],
  };

  const dataHandles = { start, end, perpendicularEnd, perpendicularStart };

  if (isLongAxisStartHandleChange) {
    console.debug('long start');
    // If long-axis start point is moved
    result = moveLongAxisStartHandle(
      pointerEventData,
      shortAxisGeometry,
      longAxisGeometry
    );
    if (result) {
      handle.x = pointerCoordinate.x;
      handle.y = pointerCoordinate.y;
    } else {
      pointerCoordinate.x = handle.x;
      pointerCoordinate.y = handle.y;
    }
  } else if (isLongAxisEndHandleChange) {
    console.debug('long end');
    // If long-axis end point is moved
    result = moveLongAxisEndHandle(
      pointerEventData,
      shortAxisGeometry,
      longAxisGeometry
    );
    if (result) {
      handle.x = pointerCoordinate.x;
      handle.y = pointerCoordinate.y;
    } else {
      pointerCoordinate.x = handle.x;
      pointerCoordinate.y = handle.y;
    }
  } else if (isShortAxisStartHandleChange) {
    console.debug('short start');
    outOfBounds = false;
    // If perpendicular start point is moved
    longLine.start = {
      x: dataHandles.start.x,
      y: dataHandles.start.y,
    };
    longLine.end = {
      x: dataHandles.end.x,
      y: dataHandles.end.y,
    };

    perpendicularLine.start = {
      x: dataHandles.perpendicularEnd.x,
      y: dataHandles.perpendicularEnd.y,
    };
    perpendicularLine.end = {
      x: pointerCoordinate.x,
      y: pointerCoordinate.y,
    };

    intersection = intersectLine(longLine, perpendicularLine);
    if (!intersection) {
      perpendicularLine.end = {
        x: dataHandles.perpendicularStart.x,
        y: dataHandles.perpendicularStart.y,
      };

      intersection = intersectLine(longLine, perpendicularLine);

      d1 = distance(intersection, dataHandles.start);
      d2 = distance(intersection, dataHandles.end);

      if (!intersection || d1 < 3 || d2 < 3) {
        outOfBounds = true;
      }
    }

    movedPoint = false;

    if (!outOfBounds) {
      movedPoint = moveShortAxisStartHandle(
        pointerEventData,
        shortAxisGeometry,
        longAxisGeometry
      );

      if (!movedPoint) {
        pointerCoordinate.x = dataHandles.perpendicularStart.x;
        pointerCoordinate.y = dataHandles.perpendicularStart.y;
      }
    }
  } else if (isShortAxisEndHandleChange) {
    console.debug('short end');
    outOfBounds = false;

    // If perpendicular end point is moved
    longLine.start = {
      x: dataHandles.start.x,
      y: dataHandles.start.y,
    };
    longLine.end = {
      x: dataHandles.end.x,
      y: dataHandles.end.y,
    };

    perpendicularLine.start = {
      x: dataHandles.perpendicularStart.x,
      y: dataHandles.perpendicularStart.y,
    };
    perpendicularLine.end = {
      x: pointerCoordinate.x,
      y: pointerCoordinate.y,
    };

    intersection = intersectLine(longLine, perpendicularLine);
    if (!intersection) {
      perpendicularLine.end = {
        x: dataHandles.perpendicularEnd.x,
        y: dataHandles.perpendicularEnd.y,
      };

      intersection = intersectLine(longLine, perpendicularLine);

      d1 = distance(intersection, dataHandles.start);
      d2 = distance(intersection, dataHandles.end);

      if (!intersection || d1 < 3 || d2 < 3) {
        outOfBounds = true;
      }
    }

    movedPoint = false;

    if (!outOfBounds) {
      movedPoint = moveShortAxisEndHandle(
        pointerEventData,
        shortAxisGeometry,
        longAxisGeometry
      );

      if (!movedPoint) {
        pointerCoordinate.x = dataHandles.perpendicularEnd.x;
        pointerCoordinate.y = dataHandles.perpendicularEnd.y;
      }
    }
  }
}
