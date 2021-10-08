import intersectLine from "./intersectLine";
import distance from "./distance";

const getLineVector = (
  columnPixelSpacing,
  rowPixelSpacing,
  startPoint,
  endPoint
) => {
  const dx = (startPoint.x - endPoint.x) * columnPixelSpacing;
  const dy = (startPoint.y - endPoint.y) * rowPixelSpacing;
  const length = Math.sqrt(dx * dx + dy * dy);
  const vectorX = dx / length;
  const vectorY = dy / length;

  return {
    x: vectorX,
    y: vectorY,
    length,
  };
};

const createLine = (startPoint, endPoint) => {
  return {
    start: startPoint,
    end: endPoint,
  };
};

const getDistanceWithPixelSpacing = (
  columnPixelSpacing,
  rowPixelSpacing,
  startPoint,
  endPoint
) => {
  const calcX = (startPoint.x - endPoint.x) / rowPixelSpacing;
  const calcY = (startPoint.y - endPoint.y) / columnPixelSpacing;
  return Math.sqrt(calcX * calcX + calcY * calcY);
};

const getBaseData = (shortAxisFeature, longAxisFeature, fixedPoint) => {
  const [startCoordinates, endCoordinates] = longAxisFeature
    .getGeometry()
    .getCoordinates();
  const start = { x: startCoordinates[0], y: startCoordinates[1] };
  const end = { x: endCoordinates[0], y: endCoordinates[1] };

  const [perpendicularStartCoords, perpendicularEndCoords] = shortAxisFeature
    .getGeometry()
    .getCoordinates();
  const perpendicularStart = {
    x: perpendicularStartCoords[0],
    y: perpendicularStartCoords[1],
  };
  const perpendicularEnd = {
    x: perpendicularEndCoords[0],
    y: perpendicularEndCoords[1],
  };

  const columnPixelSpacing = 1;
  const rowPixelSpacing = 1;

  const longLine = createLine(start, end);
  const perpendicularLine = createLine(perpendicularStart, perpendicularEnd);

  const intersection = intersectLine(longLine, perpendicularLine);

  const distanceToFixed = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    intersection
  );

  return {
    columnPixelSpacing, // Width that a pixel represents in mm
    rowPixelSpacing, // Height that a pixel represents in mm
    start, // Start point of the long line
    end, // End point of the long line
    perpendicularStart, // Start point of the perpendicular line
    perpendicularEnd, // End point of the perpendicular line
    longLine, // Long line object containing the start and end points
    intersection, // Intersection point between long and perpendicular lines
    distanceToFixed, // Distance from intersection to the fixed point
    fixedPoint, // Opposite point from the handle that is being moved
  };
};

const isPerpendicularEndFixed = (fixedPoint, perpendicularEnd) => {
  return fixedPoint === perpendicularEnd;
};

const getDirectionMultiplier = (fixedPoint, perpendicularEnd) => {
  return isPerpendicularEndFixed(fixedPoint, perpendicularEnd) ? -1 : 1;
};

const getHelperLine = (baseData, proposedPoint, vector) => {
  const { columnPixelSpacing, rowPixelSpacing, perpendicularEnd, fixedPoint } =
    baseData;

  // Create a helper line to find the intesection point in the long line
  const highNumber = Number.MAX_SAFE_INTEGER;

  // Get the multiplier
  const multiplier =
    getDirectionMultiplier(fixedPoint, perpendicularEnd) * highNumber;

  return {
    start: proposedPoint,
    end: {
      x: proposedPoint.x + vector.y * rowPixelSpacing * multiplier,
      y: proposedPoint.y + vector.x * columnPixelSpacing * multiplier * -1,
    },
  };
};

const lineHasLength = (columnPixelSpacing, rowPixelSpacing, line) => {
  const lineLength = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    line.start,
    line.end
  );

  return lineLength !== 0;
};

const getMovingPoint = (fixedPoint, perpendicularStart, perpendicularEnd) => {
  if (isPerpendicularEndFixed(fixedPoint, perpendicularEnd)) {
    return perpendicularStart;
  }

  return perpendicularEnd;
};

const updateShortAxis = (baseData, mid) => {
  const {
    columnPixelSpacing,
    rowPixelSpacing,
    start,
    perpendicularStart,
    perpendicularEnd,
    intersection,
    fixedPoint,
  } = baseData;

  // Get the original distance from perpendicular start handle to intersection
  const distancePS = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    perpendicularStart,
    intersection
  );

  // Get the original distance from perpendicular end handle to intersection
  const distancePE = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    perpendicularEnd,
    intersection
  );

  // Inclination of the perpendicular line
  const vector = getLineVector(
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    mid
  );

  // Define the multiplier
  const multiplier = fixedPoint === start ? 1 : -1;
  const rowMultiplier = multiplier * rowPixelSpacing;
  const columnMultiplier = multiplier * columnPixelSpacing;

  // Calculate and return the new position of the perpendicular handles
  return {
    start: {
      x: mid.x + vector.y * distancePS * rowMultiplier,
      y: mid.y + vector.x * distancePS * columnMultiplier * -1,
    },
    end: {
      x: mid.x + vector.y * distancePE * rowMultiplier * -1,
      y: mid.y + vector.x * distancePE * columnMultiplier,
    },
  };
};

const updateShortAxisForShortMove = (baseData, mid, helperLine, vector) => {
  const {
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    perpendicularStart,
    perpendicularEnd,
    distanceToFixed,
  } = baseData;

  // Get the multiplier
  const multiplier =
    getDirectionMultiplier(fixedPoint, perpendicularEnd) * distanceToFixed;

  // Define the moving point
  const movingPoint = getMovingPoint(
    fixedPoint,
    perpendicularStart,
    perpendicularEnd
  );

  // Get the object keys for moving and fixed points
  const isMovingStart = movingPoint === perpendicularStart;
  const movingKey = isMovingStart ? "start" : "end";
  const fixedKey = isMovingStart ? "end" : "start";

  // Calculate and return the new position of the perpendicular handles
  return {
    [movingKey]: {
      x: helperLine.start.x,
      y: helperLine.start.y,
    },
    [fixedKey]: {
      x: mid.x + vector.y * rowPixelSpacing * multiplier,
      y: mid.y + vector.x * columnPixelSpacing * multiplier * -1,
    },
  };
};

const moveShortAxis = (
  proposedPoint,
  shortAxisFeature,
  longAxisFeature,
  fixedPoint
) => {
  const baseData = getBaseData(shortAxisFeature, longAxisFeature, fixedPoint);
  const { columnPixelSpacing, rowPixelSpacing, start, longLine, intersection } =
    baseData;

  // Stop here if the long line has no length
  if (!lineHasLength(columnPixelSpacing, rowPixelSpacing, longLine)) {
    return false;
  }

  // Inclination of the perpendicular line
  const vector = getLineVector(
    columnPixelSpacing,
    rowPixelSpacing,
    start,
    intersection
  );

  // Get a helper line to calculate the intersection
  const helperLine = getHelperLine(baseData, proposedPoint, vector);

  // Find the new intersection in the long line
  const newIntersection = intersectLine(longLine, helperLine);

  // Stop the flow here if there's no intersection point between lines
  if (!newIntersection) {
    return false;
  }

  // Calculate and the new position of the perpendicular handles
  const newLine = updateShortAxisForShortMove(
    baseData,
    newIntersection,
    helperLine,
    vector
  );

  // Change the position of the perpendicular line handles
  const newShortAxis = { start: {}, end: {} };
  newShortAxis.start.x = newLine.start.x;
  newShortAxis.start.y = newLine.start.y;
  newShortAxis.end.x = newLine.end.x;
  newShortAxis.end.y = newLine.end.y;
  shortAxisFeature.getGeometry().setCoordinates([
    [newLine.start.x, newLine.start.y],
    [newLine.end.x, newLine.end.y],
  ]);

  return true;
};

const moveLongAxis = (
  proposedPoint,
  shortAxisFeature,
  longAxisFeature,
  fixedPoint
) => {
  const baseData = getBaseData(shortAxisFeature, longAxisFeature, fixedPoint);
  const { columnPixelSpacing, rowPixelSpacing, distanceToFixed } = baseData;

  // Calculate the length of the new line, considering the proposed point
  const newLineLength = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    proposedPoint
  );

  // Stop here if the handle tries to move before the intersection point
  if (newLineLength <= distanceToFixed) {
    return false;
  }

  // Calculate the new intersection point
  const distanceRatio = distanceToFixed / newLineLength;
  const newIntersection = {
    x: fixedPoint.x + (proposedPoint.x - fixedPoint.x) * distanceRatio,
    y: fixedPoint.y + (proposedPoint.y - fixedPoint.y) * distanceRatio,
  };

  // Calculate and the new position of the perpendicular handles
  const newLine = updateShortAxis(baseData, newIntersection);

  // Update the perpendicular line handles
  const newShortAxis = { start: {}, end: {} };
  newShortAxis.start.x = newLine.start.x;
  newShortAxis.start.y = newLine.start.y;
  newShortAxis.end.x = newLine.end.x;
  newShortAxis.end.y = newLine.end.y;
  shortAxisFeature.getGeometry().setCoordinates([
    [newLine.start.x, newLine.start.y],
    [newLine.end.x, newLine.end.y],
  ]);

  return true;
};

// Sets position of handles(start, end, perpendicularStart, perpendicularEnd)
const setHandlesPosition = (
  handle = { x: 0, y: 0 },
  pointerEventData,
  longAxisFeature,
  shortAxisFeature
) => {
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

  const longLine = {};
  const perpendicularLine = {};

  const proposedPoint = {
    x: pointerEventData.coordinate[0],
    y: pointerEventData.coordinate[1],
  };

  ///
  /// NEW
  ///

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

  if (isLongAxisStartHandleChange === true) {
    console.debug("long start");
  } else if (isLongAxisEndHandleChange === true) {
    console.debug("long end");
  } else if (isShortAxisStartHandleChange === true) {
    console.debug("short start");
  } else if (isShortAxisEndHandleChange === true) {
    console.debug("short end");
  }

  ///
  /// NEW
  ///

  if (isLongAxisStartHandleChange) {
    const fixedPoint = {
      x: longAxisCoordinates[1][0],
      y: longAxisCoordinates[1][1],
    };

    // If long-axis start point is moved
    result = moveLongAxis(
      proposedPoint,
      shortAxisFeature,
      longAxisFeature,
      fixedPoint
    );
    if (result) {
      handle.x = proposedPoint.x;
      handle.y = proposedPoint.y;
    } else {
      pointerEventData.coordinate[0] = handle.x;
      pointerEventData.coordinate[1] = handle.y;
    }
  } else if (isLongAxisEndHandleChange) {
    const fixedPoint = {
      x: longAxisCoordinates[0][0],
      y: longAxisCoordinates[0][1],
    };

    // If long-axis end point is moved
    result = moveLongAxis(
      proposedPoint,
      shortAxisFeature,
      longAxisFeature,
      fixedPoint
    );
    if (result) {
      handle.x = proposedPoint.x;
      handle.y = proposedPoint.y;
    } else {
      pointerEventData.coordinate[0] = handle.x;
      pointerEventData.coordinate[1] = handle.y;
    }
  } else if (isShortAxisStartHandleChange) {
    outOfBounds = false;
    // If perpendicular start point is moved
    longLine.start = {
      x: longAxisCoordinates[0][0],
      y: longAxisCoordinates[0][1],
    };
    longLine.end = {
      x: longAxisCoordinates[1][0],
      y: longAxisCoordinates[1][1],
    };

    perpendicularLine.start = {
      x: shortAxisCoordinates[1][0],
      y: shortAxisCoordinates[1][1],
    };
    perpendicularLine.end = {
      x: proposedPoint.x,
      y: proposedPoint.y,
    };

    intersection = intersectLine(longLine, perpendicularLine);
    if (!intersection) {
      perpendicularLine.end = {
        x: shortAxisCoordinates[0][0],
        y: shortAxisCoordinates[0][1],
      };

      intersection = intersectLine(longLine, perpendicularLine);

      d1 = distance(intersection, longAxisCoordinates[0]);
      d2 = distance(intersection, longAxisCoordinates[1]);

      if (!intersection || d1 < 3 || d2 < 3) {
        outOfBounds = true;
      }
    }

    movedPoint = false;

    if (!outOfBounds) {
      const fixedPoint = {
        x: shortAxisCoordinates[1][0],
        y: shortAxisCoordinates[1][1],
      };

      movedPoint = moveShortAxis(
        proposedPoint,
        shortAxisFeature,
        longAxisFeature,
        fixedPoint
      );

      if (!movedPoint) {
        pointerEventData.coordinate[0] = shortAxisCoordinates[0][0];
        pointerEventData.coordinate[1] = shortAxisCoordinates[0][1];
      }
    }
  } else if (isShortAxisEndHandleChange) {
    outOfBounds = false;

    // If perpendicular end point is moved
    longLine.start = {
      x: longAxisCoordinates[0][0],
      y: longAxisCoordinates[0][1],
    };
    longLine.end = {
      x: longAxisCoordinates[1][0],
      y: longAxisCoordinates[1][1],
    };

    perpendicularLine.start = {
      x: shortAxisCoordinates[0][0],
      y: shortAxisCoordinates[0][1],
    };
    perpendicularLine.end = {
      x: proposedPoint.x,
      y: proposedPoint.y,
    };

    intersection = intersectLine(longLine, perpendicularLine);
    if (!intersection) {
      perpendicularLine.end = {
        x: shortAxisCoordinates[1][0],
        y: shortAxisCoordinates[1][1],
      };

      intersection = intersectLine(longLine, perpendicularLine);

      d1 = distance(intersection, longAxisCoordinates[0]);
      d2 = distance(intersection, longAxisCoordinates[1]);

      if (!intersection || d1 < 3 || d2 < 3) {
        outOfBounds = true;
      }
    }

    movedPoint = false;

    if (!outOfBounds) {
      const fixedPoint = {
        x: shortAxisCoordinates[0][0],
        y: shortAxisCoordinates[0][1],
      };

      movedPoint = moveShortAxis(
        proposedPoint,
        shortAxisFeature,
        longAxisFeature,
        fixedPoint
      );

      if (!movedPoint) {
        pointerEventData.coordinate[0] = shortAxisCoordinates[1][0];
        pointerEventData.coordinate[1] = shortAxisCoordinates[1][1];
      }
    }
  }
};

export default setHandlesPosition;
