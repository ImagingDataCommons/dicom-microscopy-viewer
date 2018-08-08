/*
 * Spatial coordinates of a geometric region of interest within the
 * total pixel matrix.
 */
class Scoord {

  constructor() {}

  get graphicData() {
    throw new Error('Propotype property "graphicData" must be implemented.');
  }

  get graphicType() {
    throw new Error('Propotype property "graphicType" must be implemented.');
  }

  get pixelOriginInterpretation() {
    // FRAME or VOLUME
    /* TODO: Consider relative to frame instead of total pixel matrix.
     * This would complicate scenarios where graphics span multiple frames.
     */
    return 'VOLUME';
  }

  // get fiducialUID() {
  // }

}


class Point extends Scoord {

  constructor(coordinates) {
    super()
    this.coordinates = coordinates
  }

  get graphicData() {
    return this.coordinates;
  }

  get graphicType() {
    return 'POINT';
  }

}


class Multipoint extends Scoord {

  constructor(coordinates) {
    super()
    this.coordinates = coordinates
  }

  get graphicData() {
    return this.coordinates;
  }

  get graphicType() {
    return 'MULTIPOINT';
  }

}


class Polyline extends Scoord {

  constructor(coordinates) {
    super()
    this.coordinates = coordinates
  }

  get graphicData() {
    /*
     * A polyline is defined as a series of connected line segments
     * with ordered vertices denoted by (column,row) pairs.
     * If the first and last vertices are the same it is a closed polygon.
     */
    // TODO: sort coordinates, considering Polygons, where first entry must
    // equal last entry
    return this.coordinates;
  }

  get graphicType() {
    return 'POLYLINE';
  }

}


class Circle extends Scoord {

  constructor(centerCoordinates, radius) {
    super()
    this.centerCoordinates = centerCoordinates
    this.radius = radius
  }

  get graphicData() {
    /*
     * A circle defined by two (column,row) pairs.
     * The first point is the central pixel.
     * The second point is a pixel on the perimeter of the circle.
     */
    return [
      this.centerCoordinates,
      [this.centerCoordinates[0], this.centerCoordinates[1] + this.radius]];
  }

  get graphicType() {
    return 'CIRCLE';
  }

}


class Ellipse extends Scoord {

  constructor(majorAxisEndpointCoordinates, minorAxisEndpointCoordinates) {
    super()
    this.majorAxisEndpointCoordinates = majorAxisEndpointCoordinates
    this.minorAxisEndpointCoordinates = minorAxisEndpointCoordinates
  }

  get graphicData() {
    /*
     * An ellipse defined by four pixel (column,row) pairs.
     * The first two points specify the endpoints of the major axis.
     * The second two points specify the endpoints of the minor axis.
     */
    return [
      ...this.majorAxisEndpointCoordinates,
      ...this.minorAxisEndpointCoordinates
    ];
  }


  get graphicType() {
    return 'ELLIPSE';
  }

}


export { Point, Multipoint, Polyline, Circle, Ellipse };

