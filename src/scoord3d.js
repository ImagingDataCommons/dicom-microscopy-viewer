/*
 * Spatial coordinates of a geometric region of interest (ROI) in the DICOM
 * image coordinate system.
 */
const _coordinates = Symbol('coordinates')
const _majorAxisEndpointCoordinates = Symbol('majorAxisEndpointCoordinates')
const _minorAxisEndpointCoordinates = Symbol('minorAxisEndpointCoordinates')
const _centerCoordinates = Symbol('centerCoordinates')
const _radius = Symbol('radius')

class Scoord3D {

  constructor() {}

  get graphicData() {
    throw new Error('Propotype property "graphicData" must be implemented.')
  }

  get graphicType() {
    throw new Error('Propotype property "graphicType" must be implemented.')
  }

  get referencedFrameOfReferenceUID() {
    throw new Error('Propotype property "referencedFrameOfReferenceUID" must be implemented.')
  }

  get fiducialUID() {
    throw new Error('Propotype property "fiducialUID" must be implemented.')
  }

}

class Point extends Scoord3D {
  
  
  constructor(coordinates) {
    super()
    if (!Array.isArray(coordinates)) {
      throw new Error('coordinates of Point must be an array')
    }
    if (coordinates.length !== 3) {
      throw new Error('coordinates of Point must be an array of length 3')
    }
    this[_coordinates] = coordinates
  }

  get graphicData() {
    return this[_coordinates]
  }

  get graphicType() {
    return 'POINT'
  }

}

class Multipoint extends Scoord3D {

  constructor(coordinates) {
    super()
    if (!Array.isArray(coordinates)) {
      throw new Error('coordinates of Multipoint must be an array')
    }
    if(coordinates.find(c => c.length !== 3)!== undefined){
      throw new Error('coordinates of Multipoint must be an array of length 3')
    }
    this[_coordinates] = coordinates
  }

  get graphicData() {
    return this[_coordinates]
  }

  get graphicType() {
    return 'MULTIPOINT'
  }

}

class Polyline extends Scoord3D {

  constructor(coordinates) {
    super()
    if (!Array.isArray(coordinates)) {
      throw new Error('coordinates of Polyline must be an array')
    }
    if(coordinates.find(c => c.length !== 3)!== undefined){
      throw new Error('coordinates of Polyline must be a list of points of length 3')
    }
    this[_coordinates] = coordinates
  }

  get graphicData() {
    /*
     * A polyline is defined as a series of connected line segments
     * with ordered vertices denoted by (column,row) pairs.
     * If the first and last vertices are the same it is a closed polygon.
     */
    return this[_coordinates]
  }

  get graphicType() {
    return 'POLYLINE'
  }

}

class Polygon extends Scoord3D {

  constructor(coordinates) {
    super()
    if (!Array.isArray(coordinates)) {
      throw new Error('coordinates of Polygon must be an array')
    }
    if(coordinates.find(c => c.length !== 3)!== undefined){
      throw new Error('coordinates of Polygon must be a list of points of length 3')
    }
    this[_coordinates] = coordinates
  }

  get graphicData() {
    /*
     * A polygon is defined a series of connected line segments with ordered vertices 
     * denoted by (x,y,z) triplets, where the first and last vertices shall be the same 
     * forming a polygon the points shall be coplanar
     */
    return this[_coordinates]
  }

  get graphicType() {
    return 'POLYGON'
  }

}

class Circle extends Scoord3D {

  constructor(centerCoordinates, radius) {
    super()
    if (!Array.isArray(centerCoordinates)) {
      throw new Error('coordinates of Circle must be an array')
    }
    if (centerCoordinates.length !== 3) {
      throw new Error('center coordinates of Circle must be an array of length 3')
    }
    if (radius === undefined) {
      throw new Error('radius has to be defined')
    }
    this[_centerCoordinates] = centerCoordinates
    this[_radius] = radius
  }

  get graphicData() {
    /*
     * A circle defined by two (column,row) pairs.
     * The first point is the central pixel.
     * The second point is a pixel on the perimeter of the circle.
     */
    return [
      this[_centerCoordinates],
      [this[_centerCoordinates][0], this[_centerCoordinates][1] + this[_radius], 1]]
  }

  get graphicType() {
    return 'CIRCLE'
  }

}

class Ellipse extends Scoord3D {

  constructor(majorAxisEndpointCoordinates, minorAxisEndpointCoordinates) {
    super()
    if (!Array.isArray(majorAxisEndpointCoordinates)) {
      throw new Error('majorAxisEndpointCoordinates of Ellipse must be an array')
    }
    if (!Array.isArray(minorAxisEndpointCoordinates)) {
      throw new Error('minorAxisEndpointCoordinates of Ellipse must be an array')
    }
    if (majorAxisEndpointCoordinates.length !== 2) {
      throw new Error('majorAxisEndpointCoordinates coordinates of Ellipse must be an array of length 2')
    }
    if (minorAxisEndpointCoordinates.length !== 2) {
      throw new Error('minorAxisEndpointCoordinates coordinates of Ellipse must be an array of length 2')
    }
    this[_majorAxisEndpointCoordinates] = majorAxisEndpointCoordinates
    this[_minorAxisEndpointCoordinates] = minorAxisEndpointCoordinates
  }

  get graphicData() {
    /*
     * An ellipse defined by four pixel (column,row) pairs.
     * The first two points specify the endpoints of the major axis.
     * The second two points specify the endpoints of the minor axis.
     */
    return [
      ...this[_majorAxisEndpointCoordinates],
      ...this[_minorAxisEndpointCoordinates]
    ]
  }

  get graphicType() {
    return 'ELLIPSE'
  }

}

export { Point, Multipoint, Polyline, Polygon, Circle, Ellipse }

