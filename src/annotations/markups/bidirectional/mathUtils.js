// Based on  http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
export const sqr = (x) => {
  return x * x;
};

export const dist2 = (v, w) => {
  return sqr(v.x - w.x) + sqr(v.y - w.y);
};

export const distanceToPointSquared = (lineSegment, point) => {
  const l2 = dist2(lineSegment.start, lineSegment.end);

  if (l2 === 0) {
    return dist2(point, lineSegment.start);
  }
  const t =
    ((point.x - lineSegment.start.x) *
      (lineSegment.end.x - lineSegment.start.x) +
      (point.y - lineSegment.start.y) *
        (lineSegment.end.y - lineSegment.start.y)) /
    l2;

  if (t < 0) {
    return dist2(point, lineSegment.start);
  }
  if (t > 1) {
    return dist2(point, lineSegment.end);
  }

  const pt = {
    x: lineSegment.start.x + t * (lineSegment.end.x - lineSegment.start.x),
    y: lineSegment.start.y + t * (lineSegment.end.y - lineSegment.start.y),
  };

  return dist2(point, pt);
};

export const distanceToPoint = (lineSegment, point) => {
  return Math.sqrt(distanceToPointSquared(lineSegment, point));
};

export const midpoint = (x1, x2, y1, y2) => {
  return [(x1 + x2) / 2, (y1 + y2) / 2];
};

// Returns intersection points of two lines
export const intersectLine = (lineSegment1, lineSegment2) => {
  const intersectionPoint = {};

  let x1 = lineSegment1.start.x,
    y1 = lineSegment1.start.y,
    x2 = lineSegment1.end.x,
    y2 = lineSegment1.end.y,
    x3 = lineSegment2.start.x,
    y3 = lineSegment2.start.y,
    x4 = lineSegment2.end.x,
    y4 = lineSegment2.end.y;

  // Coefficients of line equations
  let a1, a2, b1, b2, c1, c2;
  // Sign values
  let r1, r2, r3, r4;

  // Intermediate values
  let denom, num;

  // Compute a1, b1, c1, where line joining points 1 and 2 is "a1 x  +  b1 y  +  c1  =  0"
  a1 = y2 - y1;
  b1 = x1 - x2;
  c1 = x2 * y1 - x1 * y2;

  // Compute r3 and r4
  r3 = a1 * x3 + b1 * y3 + c1;
  r4 = a1 * x4 + b1 * y4 + c1;

  /* Check signs of r3 and r4.  If both point 3 and point 4 lie on
   * same side of line 1, the line segments do not intersect.
   */

  if (r3 !== 0 && r4 !== 0 && sign(r3) === sign(r4)) {
    return;
  }

  // Compute a2, b2, c2
  a2 = y4 - y3;
  b2 = x3 - x4;
  c2 = x4 * y3 - x3 * y4;

  // Compute r1 and r2
  r1 = a2 * x1 + b2 * y1 + c2;
  r2 = a2 * x2 + b2 * y2 + c2;

  /* Check signs of r1 and r2.  If both point 1 and point 2 lie
   * on same side of second line segment, the line segments do
   * not intersect.
   */

  if (r1 !== 0 && r2 !== 0 && sign(r1) === sign(r2)) {
    return;
  }

  /* Line segments intersect: compute intersection point.
   */

  denom = a1 * b2 - a2 * b1;

  /* The denom/2 is to get rounding instead of truncating.  It
   * is added or subtracted to the numerator, depending upon the
   * sign of the numerator.
   */

  num = b1 * c2 - b2 * c1;
  const x = parseFloat(num / denom);

  num = a2 * c1 - a1 * c2;
  const y = parseFloat(num / denom);

  intersectionPoint.x = x;
  intersectionPoint.y = y;

  return intersectionPoint;
};

// Returns sign of number
export const sign = (x) => {
  return typeof x === "number"
    ? x
      ? x < 0
        ? -1
        : 1
      : x === x
      ? 0
      : NaN
    : NaN;
};

export const subtract = (lhs, rhs) => {
  return {
    x: lhs.x - rhs.x,
    y: lhs.y - rhs.y,
  };
};

export const distance = (from, to) => {
  return Math.sqrt(distanceSquared(from, to));
};

export const distanceSquared = (from, to) => {
  const delta = subtract(from, to);
  return delta.x * delta.x + delta.y * delta.y;
};

export const getLineVector = (
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

export const createLine = (startPoint, endPoint) => {
  return {
    start: startPoint,
    end: endPoint,
  };
};

export const getDistanceWithPixelSpacing = (
  columnPixelSpacing,
  rowPixelSpacing,
  startPoint,
  endPoint
) => {
  const calcX = (startPoint.x - endPoint.x) / rowPixelSpacing;
  const calcY = (startPoint.y - endPoint.y) / columnPixelSpacing;
  return Math.sqrt(calcX * calcX + calcY * calcY);
};
