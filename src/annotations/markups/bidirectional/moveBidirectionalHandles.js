import { getLongAxisId, getShortAxisId } from "./id";
import { distance, intersectLine } from "./mathUtils";
import moveLongAxisEndHandle from "./moveLongAxisEndHandle";
import moveLongAxisStartHandle from "./moveLongAxisStartHandle";
import moveShortAxisEndHandle from "./moveShortAxisEndHandle";
import moveShortAxisStartHandle from "./moveShortAxisStartHandle";

export default function (
  handle = { x: 0, y: 0 },
  currentFeature,
  viewerProperties
) {
  const { drawingSource } = viewerProperties;

  let outOfBounds;
  let intersection;
  let d1;
  let d2;

  const { isShortAxis, isLongAxis, axisHandle } =
    currentFeature.getProperties();

  let longAxisFeature;
  let shortAxisFeature;

  if (isShortAxis) {
    shortAxisFeature = currentFeature;
    const longAxisFeatureId = getLongAxisId(currentFeature);
    longAxisFeature = drawingSource.getFeatureById(longAxisFeatureId);
  } else if (isLongAxis) {
    longAxisFeature = currentFeature;
    const shortAxisFeatureId = getShortAxisId(currentFeature);
    shortAxisFeature = drawingSource.getFeatureById(shortAxisFeatureId);
  }

  const longAxisGeometry = longAxisFeature.getGeometry();
  const shortAxisGeometry = shortAxisFeature.getGeometry();

  const longAxisCoords = longAxisGeometry.getCoordinates();
  const shortAxisCoords = shortAxisGeometry.getCoordinates();

  let isShortAxisStartHandleChange =
    isShortAxis === true && axisHandle === "start";

  let isShortAxisEndHandleChange = isShortAxis === true && axisHandle === "end";

  let isLongAxisStartHandleChange =
    isLongAxis === true && axisHandle === "start";

  let isLongAxisEndHandleChange = isLongAxis === true && axisHandle === "end";

  const longAxis = {};
  const shortAxis = {};

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

  if (isLongAxisStartHandleChange) {
    console.debug("long start");
    moveLongAxisStartHandle(handle, shortAxisGeometry, longAxisGeometry);
  } else if (isLongAxisEndHandleChange) {
    console.debug("long end");
    moveLongAxisEndHandle(handle, shortAxisGeometry, longAxisGeometry);
  } else if (isShortAxisStartHandleChange) {
    console.debug("short start");
    outOfBounds = false;

    longAxis.start = {
      x: bidirectional.start.x,
      y: bidirectional.start.y,
    };
    longAxis.end = {
      x: bidirectional.end.x,
      y: bidirectional.end.y,
    };

    shortAxis.start = {
      x: bidirectional.shortAxisEnd.x,
      y: bidirectional.shortAxisEnd.y,
    };
    shortAxis.end = {
      x: handle.x,
      y: handle.y,
    };

    intersection = intersectLine(longAxis, shortAxis);
    if (!intersection) {
      shortAxis.end = {
        x: bidirectional.shortAxisStart.x,
        y: bidirectional.shortAxisStart.y,
      };

      intersection = intersectLine(longAxis, shortAxis);

      d1 = distance(intersection, bidirectional.start);
      d2 = distance(intersection, bidirectional.end);

      if (!intersection || d1 < 3 || d2 < 3) {
        outOfBounds = true;
      }
    }

    if (!outOfBounds) {
      moveShortAxisStartHandle(handle, shortAxisGeometry, longAxisGeometry);
    }
  } else if (isShortAxisEndHandleChange) {
    console.debug("short end");
    outOfBounds = false;

    longAxis.start = {
      x: bidirectional.start.x,
      y: bidirectional.start.y,
    };
    longAxis.end = {
      x: bidirectional.end.x,
      y: bidirectional.end.y,
    };

    shortAxis.start = {
      x: bidirectional.shortAxisStart.x,
      y: bidirectional.shortAxisStart.y,
    };
    shortAxis.end = {
      x: handle.x,
      y: handle.y,
    };

    intersection = intersectLine(longAxis, shortAxis);
    if (!intersection) {
      shortAxis.end = {
        x: bidirectional.shortAxisEnd.x,
        y: bidirectional.shortAxisEnd.y,
      };

      intersection = intersectLine(longAxis, shortAxis);

      d1 = distance(intersection, bidirectional.start);
      d2 = distance(intersection, bidirectional.end);

      if (!intersection || d1 < 3 || d2 < 3) {
        outOfBounds = true;
      }
    }

    if (!outOfBounds) {
      moveShortAxisEndHandle(handle, shortAxisGeometry, longAxisGeometry);
    }
  }
}
