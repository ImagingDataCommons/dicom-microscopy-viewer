const getShortAxis = (line, imageMetadata = {}) => {
  // getPixelSpacing (metadata) from scoord utils (image metadata)
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

  let startX, startY, endX, endY;

  const { start, end } = line;
  const { columnPixelSpacing = 1, rowPixelSpacing = 1 } = imageMetadata;

  if (start.x === end.x && start.y === end.y) {
    startX = start.x;
    startY = start.y;
    endX = end.x;
    endY = end.y;
  } else {
    // Mid point of long axis
    const mid = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };

    // Inclination of the short axis
    const vector = getLineVector(
      columnPixelSpacing,
      rowPixelSpacing,
      start,
      end
    );

    const shortAxisLength = vector.length / 2;
    const rowMultiplier = shortAxisLength / (2 * rowPixelSpacing);
    const columnMultiplier = shortAxisLength / (2 * columnPixelSpacing);

    startX = mid.x + columnMultiplier * vector.y;
    startY = mid.y - rowMultiplier * vector.x;
    endX = mid.x - columnMultiplier * vector.y;
    endY = mid.y + rowMultiplier * vector.x;
  }

  const shortAxis = { start: {}, end: {} };
  shortAxis.start.x = startX;
  shortAxis.start.y = startY;
  shortAxis.end.x = endX;
  shortAxis.end.y = endY;
  return shortAxis;
};

export default getShortAxis;