import { generateUID } from './utils.js';

const _coordinates = Symbol('coordinates')
const _majorAxisEndpointCoordinates = Symbol('majorAxisEndpointCoordinates')
const _minorAxisEndpointCoordinates = Symbol('minorAxisEndpointCoordinates')
const _centerCoordinates = Symbol('centerCoordinates')
const _radius = Symbol('radius')
const _frameOfReferenceUID = Symbol('frameOfReferenceUID')
const _fiducialUID = Symbol('fiducialUID')


/*
 * Spatial coordinates of geometric region(s) of interest (ROI) in the DICOM
 * slide coordinate system in millimeter unit.
 */
class Scoord3D {

  constructor(options) {
    if (!(typeof options.frameOfReferenceUID === 'string' ||
          options.frameOfReferenceUID instanceof String)) {
      throw new Error('frameOfReferenceUID of Scoord3D must be a string')
    }
    this[_frameOfReferenceUID] = options.frameOfReferenceUID;
    options.fiducialUID = options.fiducialUID || generateUID();
    if (!(typeof options.fiducialUID === 'string' ||
          options.fiducialUID instanceof String)) {
      throw new Error('fiducialUID of Scoord3D must be a string')
    }
    this[_fiducialUID] = options.fiducialUID;
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Scoord3D must be an array')
    }
    this[_coordinates] = options.coordinates;
  }

  get graphicData() {
    return this[_coordinates]
  }

  get graphicType() {
    throw new Error('Prototype property "graphicType" must be implemented')
  }

  get frameOfReferenceUID() {
    return this[_frameOfReferenceUID]
  }

  get fiducialUID() {
    return this[_fiducialUID]
  }

}

class Point extends Scoord3D {

  /*
   * Single location denoted by a single (x,y,z) triplet.
   */
  constructor(options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Point must be an array')
    }
    if (options.coordinates.length !== 3) {
      throw new Error('coordinates of Point must be an array of length 3')
    }
    if (options.coordinates.some((c => c < 0))) {
      throw new Error('coordinates of Point must be positive numbers')
    }
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType() {
    return 'POINT'
  }

}

class Multipoint extends Scoord3D {

  /*
   * Multiple points each denoted by an (x,y,z) triplet.
   * Points need not be coplanar.
   */
  constructor(options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Multipoint must be an array')
    }
    if(options.coordinates.find(c => c.length !== 3)!== undefined) {
      throw new Error('coordinates of Multipoint must be an array of (x,y,z) triplets')
    }
    if(options.coordinates.find(c => c.some((item => item < 0)))) {
      throw new Error('coordinates of Multipoint must be positive numbers')
    }
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType() {
    return 'MULTIPOINT'
  }

}

class Polyline extends Scoord3D {

  /*
   * Multiple points denoted by (x,y,z) triplets that represent
   * connected line segments with ordered vertices
   * Points need not be coplanar.
   */
  constructor(options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Polyline must be an array')
    }
    if(options.coordinates.find(c => c.length !== 3)!== undefined) {
      throw new Error('coordinates of Polyline must be an array of (x,y,z) triplets')
    }
    if(options.coordinates.find(c => c.some((item => item < 0)))) {
      throw new Error('coordinates of Polyline must be positive numbers')
    }
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType() {
    return 'POLYLINE'
  }
}


class Polygon extends Scoord3D {

  /*
   * Multiple points denoted by (x,y,z) triplets that represent
   * connected line segments with ordered vertices.
   * First and last point shall be the same.
   * Points shall be coplanar.
   */
  constructor(options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Polygon must be an array')
    }
    if(options.coordinates.find(c => c.length !== 3)!== undefined) {
      throw new Error('coordinates of Polygon must be an array of (x,y,z) triplets')
    }
    if(options.coordinates.find(c => c.some((item => item < 0)))) {
      throw new Error('coordinates of Polygon must be positive numbers')
    }
    const n = options.coordinates.length;
    if((options.coordinates[0][0] !== options.coordinates[n-1][0]) ||
       (options.coordinates[0][1] !== options.coordinates[n-1][1]) ||
       (options.coordinates[0][2] !== options.coordinates[n-1][2])) {
      throw new Error('first and last coordinate of Polygon must be the same')
    }
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType() {
    return 'POLYGON'
  }

}

class Ellipsoid extends Scoord3D {

  /*
   * Six points denoted by (x,y,z) triplets, where the first two points represent
   * the endpoints of the first axis and the second two points represent the
   * endpoints of the second axis and the third two points represent the
   * endpoints of the third axis. respectively.
   */
  constructor(options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Ellipsoid must be an array')
    }
    if (options.coordinates.length !== 6) {
      throw new Error('coordinates of Ellipsoid must be an array of length 6')
    }
    if(options.coordinates.find(c => c.length !== 3)!== undefined) {
      throw new Error('coordinates of Ellipsoid must be an array of (x,y,z) triplets')
    }
    if(options.coordinates.find(c => c.some((item => item < 0)))) {
      throw new Error('coordinates of Ellipsoid must be positive numbers')
    }
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType() {
    return 'ELLIPSOID'
  }

}

class Ellipse extends Scoord3D {

  /*
   * Four points denoted by (x,y,z) triplets, where the first two points represent
   * the endpoints of the major axis and the second two points represent the
   * endpoints of the minor axis.
   */
  constructor(options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Ellipse must be an array')
    }
    if (options.coordinates.length !== 4) {
      throw new Error('coordinates of Ellipse must be an array of length 4')
    }
    if(options.coordinates.find(c => c.length !== 3)!== undefined) {
      throw new Error('coordinates of Ellipse must be an array of (x,y,z) triplets')
    }
    if(options.coordinates.find(c => c.some((item => item < 0)))) {
      throw new Error('coordinates of Ellipse must be positive numbers')
    }
    // TODO: assert major and minor axes are in right angle
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType() {
    return 'ELLIPSE'
  }

}

export { Point, Multipoint, Polyline, Polygon, Ellipse, Ellipsoid }

