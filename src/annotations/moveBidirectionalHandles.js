import { distance, intersectLine } from "./mathUtils";
import moveLongAxisEndHandle from "./moveLongAxisEndHandle";
import moveLongAxisStartHandle from "./moveLongAxisStartHandle";
import moveShortAxisEndHandle from "./moveShortAxisEndHandle";
import moveShortAxisStartHandle from "./moveShortAxisStartHandle";

export default function (
  handle = { x: 0, y: 0 },
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
  const prevShortAxisGeometryCoordinates =
    shortAxisGeometryProperties.prevCoords || shortAxisCoordinates;

  const longAxisGeometryProperties = longAxisGeometry.getProperties();
  const prevLongAxisGeometryCoordinates =
    longAxisGeometryProperties.prevCoords || longAxisCoordinates;

  let isShortAxisStartHandleChange =
    shortAxisCoordinates[0][0] !== prevShortAxisGeometryCoordinates[0][0] ||
    shortAxisCoordinates[0][1] !== prevShortAxisGeometryCoordinates[0][1];

  let isShortAxisEndHandleChange =
    shortAxisCoordinates[1][0] !== prevShortAxisGeometryCoordinates[1][0] ||
    shortAxisCoordinates[1][1] !== prevShortAxisGeometryCoordinates[1][1];

  let isLongAxisStartHandleChange =
    longAxisCoordinates[0][0] !== prevLongAxisGeometryCoordinates[0][0] ||
    longAxisCoordinates[0][1] !== prevLongAxisGeometryCoordinates[0][1];

  let isLongAxisEndHandleChange =
    longAxisCoordinates[1][0] !== prevLongAxisGeometryCoordinates[1][0] ||
    longAxisCoordinates[1][1] !== prevLongAxisGeometryCoordinates[1][1];

  const longAxis = {};
  const shortAxis = {};

  const start = { x: longAxisCoordinates[0][0], y: longAxisCoordinates[0][1] };
  const end = { x: longAxisCoordinates[1][0], y: longAxisCoordinates[1][1] };

  const shortAxisStart = {
    x: shortAxisCoordinates[0][0],
    y: shortAxisCoordinates[0][1],
  };
  const shortAxisEnd = {
    x: shortAxisCoordinates[1][0],
    y: shortAxisCoordinates[1][1],
  };

  const pointerCoordinate = {
    x: handle.x,
    y: handle.y,
  };

  const dataHandles = { start, end, shortAxisEnd, shortAxisStart };

  if (isLongAxisStartHandleChange) {
    console.debug("long start");

    result = moveLongAxisStartHandle(
      handle,
      shortAxisGeometry,
      longAxisGeometry
    );

    // if (result) {
    //   handle.x = pointerCoordinate.x;
    //   handle.y = pointerCoordinate.y;
    // } else {
    //   pointerCoordinate.x = handle.x;
    //   pointerCoordinate.y = handle.y;
    // }
  } else if (isLongAxisEndHandleChange) {
    console.debug("long end");

    result = moveLongAxisEndHandle(handle, shortAxisGeometry, longAxisGeometry);

    // if (result) {
    //   handle.x = pointerCoordinate.x;
    //   handle.y = pointerCoordinate.y;
    // } else {
    //   pointerCoordinate.x = handle.x;
    //   pointerCoordinate.y = handle.y;
    // }
  } else if (isShortAxisStartHandleChange) {
    console.debug("short start");
    outOfBounds = false;

    longAxis.start = {
      x: dataHandles.start.x,
      y: dataHandles.start.y,
    };
    longAxis.end = {
      x: dataHandles.end.x,
      y: dataHandles.end.y,
    };

    shortAxis.start = {
      x: dataHandles.shortAxisEnd.x,
      y: dataHandles.shortAxisEnd.y,
    };
    shortAxis.end = {
      x: pointerCoordinate.x,
      y: pointerCoordinate.y,
    };

    intersection = intersectLine(longAxis, shortAxis);
    if (!intersection) {
      shortAxis.end = {
        x: dataHandles.shortAxisStart.x,
        y: dataHandles.shortAxisStart.y,
      };

      intersection = intersectLine(longAxis, shortAxis);

      d1 = distance(intersection, dataHandles.start);
      d2 = distance(intersection, dataHandles.end);

      if (!intersection || d1 < 3 || d2 < 3) {
        outOfBounds = true;
      }
    }

    movedPoint = false;

    if (!outOfBounds) {
      movedPoint = moveShortAxisStartHandle(
        handle,
        shortAxisGeometry,
        longAxisGeometry
      );

      // if (!movedPoint) {
      //   pointerCoordinate.x = dataHandles.shortAxisStart.x;
      //   pointerCoordinate.y = dataHandles.shortAxisStart.y;
      // }
    }
  } else if (isShortAxisEndHandleChange) {
    console.debug("short end");
    outOfBounds = false;

    longAxis.start = {
      x: dataHandles.start.x,
      y: dataHandles.start.y,
    };
    longAxis.end = {
      x: dataHandles.end.x,
      y: dataHandles.end.y,
    };

    shortAxis.start = {
      x: dataHandles.shortAxisStart.x,
      y: dataHandles.shortAxisStart.y,
    };
    shortAxis.end = {
      x: pointerCoordinate.x,
      y: pointerCoordinate.y,
    };

    intersection = intersectLine(longAxis, shortAxis);
    if (!intersection) {
      shortAxis.end = {
        x: dataHandles.shortAxisEnd.x,
        y: dataHandles.shortAxisEnd.y,
      };

      intersection = intersectLine(longAxis, shortAxis);

      d1 = distance(intersection, dataHandles.start);
      d2 = distance(intersection, dataHandles.end);

      if (!intersection || d1 < 3 || d2 < 3) {
        outOfBounds = true;
      }
    }

    movedPoint = false;

    if (!outOfBounds) {
      movedPoint = moveShortAxisEndHandle(
        handle,
        shortAxisGeometry,
        longAxisGeometry
      );

      // if (!movedPoint) {
      //   pointerCoordinate.x = dataHandles.shortAxisEnd.x;
      //   pointerCoordinate.y = dataHandles.shortAxisEnd.y;
      // }
    }
  }
}
