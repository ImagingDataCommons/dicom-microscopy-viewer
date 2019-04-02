/*
 * Spatial coordinates of a geometric region of interest (ROI) in the DICOM
 * image coordinate system.
 */
const _coordinates = Symbol('coordinates')
const _majorAxisEndpointCoordinates = Symbol('majorAxisEndpointCoordinates')
const _minorAxisEndpointCoordinates = Symbol('minorAxisEndpointCoordinates')
const _centerCoordinates = Symbol('centerCoordinates')
const _radius = Symbol('radius')
const _referencedFrameOfReferenceUID = Symbol('referencedFrameOfReferenceUID')

class Scoord3D {

  constructor(options) {
    if (!(typeof options.referencedFrameOfReferenceUID === 'string' ||
          options.referencedFrameOfReferenceUID instanceof String)) {
      throw new Error('referencedFrameOfReferenceUID of Scoord3D must be a string')
    }
    this[_referencedFrameOfReferenceUID] = options.referencedFrameOfReferenceUID
  }

  get graphicData() {
    throw new Error('Prototype property "graphicData" must be implemented.')
  }

  get graphicType() {
    throw new Error('Prototype property "graphicType" must be implemented.')
  }

  get referencedFrameOfReferenceUID() {
    return this[_referencedFrameOfReferenceUID]
  }

}

class Point extends Scoord3D {

  constructor(options) {
    super({referencedFrameOfReferenceUID: options.referencedFrameOfReferenceUID})
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Point must be an array')
    }
    if (options.coordinates.length !== 3) {
      throw new Error('coordinates of Point must be an array of length 3')
    }
    this[_coordinates] = options.coordinates
  }

  get graphicData() {
    return this[_coordinates]
  }

  get graphicType() {
    return 'POINT'
  }

}

class Multipoint extends Scoord3D {

  constructor(options) {
    super({referencedFrameOfReferenceUID: options.referencedFrameOfReferenceUID})
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Multipoint must be an array')
    }
    if(options.coordinates.find(c => c.length !== 3)!== undefined){
      throw new Error('coordinates of Multipoint must be an array of length 3')
    }
    this[_coordinates] = options.coordinates
  }

  get graphicData() {
    return this[_coordinates]
  }

  get graphicType() {
    return 'MULTIPOINT'
  }

}

class Polyline extends Scoord3D {

  constructor(options) {
    super({referencedFrameOfReferenceUID: options.referencedFrameOfReferenceUID})
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Polyline must be an array')
    }
    if(options.coordinates.find(c => c.length !== 3)!== undefined){
      throw new Error('coordinates of Polyline must be a list of points of length 3')
    }
    this[_coordinates] = options.coordinates
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

  constructor(options) {
    super({referencedFrameOfReferenceUID: options.referencedFrameOfReferenceUID})
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Polygon must be an array')
    }
    if(options.coordinates.find(c => c.length !== 3)!== undefined){
      throw new Error('coordinates of Polygon must be a list of points of length 3')
    }
    this[_coordinates] = options.coordinates
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

  constructor(options) {
    super({referencedFrameOfReferenceUID: options.referencedFrameOfReferenceUID})
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Circle must be an array')
    }
    if (options.coordinates.length < 2) {
      throw new Error('coordinates of Circle must be an array of length 2')
    }
    if(options.coordinates.find(c => c.length !== 3)!== undefined){
      throw new Error('coordinates of Circle must be a list or size two with points of length 3')
    }
    this[_coordinates] = options.coordinates
  }

  get graphicData() {
    /*
     * A circle is defined by an array of flat coordinates
     * distributed into two arrays or xyz coordinates where the 
     * last coordinate is always 1
     */
    return this[_coordinates]
  }

  get graphicType() {
    return 'CIRCLE'
  }

}

class Ellipse extends Scoord3D {

  constructor(options) {
    super({referencedFrameOfReferenceUID: options.referencedFrameOfReferenceUID})
    if (!Array.isArray(options.majorAxisEndpointCoordinates)) {
      throw new Error('majorAxisEndpointCoordinates of Ellipse must be an array')
    }
    if (!Array.isArray(options.minorAxisEndpointCoordinates)) {
      throw new Error('minorAxisEndpointCoordinates of Ellipse must be an array')
    }
    if (options.majorAxisEndpointCoordinates.length !== 2) {
      throw new Error('majorAxisEndpointCoordinates coordinates of Ellipse must be an array of length 2')
    }
    if (options.minorAxisEndpointCoordinates.length !== 2) {
      throw new Error('minorAxisEndpointCoordinates coordinates of Ellipse must be an array of length 2')
    }
    this[_majorAxisEndpointCoordinates] = options.majorAxisEndpointCoordinates
    this[_minorAxisEndpointCoordinates] = options.minorAxisEndpointCoordinates
  }

  get graphicData() {
    /*
     * An ellipse defined by four pixel (column,row) pairs distributed into two arrays.
     * The first array contains two points that represents the major axis.
     * The second array contains two points that represents the minor axis.
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

