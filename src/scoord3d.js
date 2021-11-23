import { generateUID } from './utils.js'

const _coordinates = Symbol('coordinates')
const _frameOfReferenceUID = Symbol('frameOfReferenceUID')
const _fiducialUID = Symbol('fiducialUID')

class Scoord3D {
  constructor (options) {
    if (!(typeof options.frameOfReferenceUID === 'string' ||
          options.frameOfReferenceUID instanceof String)) {
      throw new Error('frameOfReferenceUID of Scoord3D must be a string')
    }
    this[_frameOfReferenceUID] = options.frameOfReferenceUID
    options.fiducialUID = options.fiducialUID || generateUID()
    if (!(typeof options.fiducialUID === 'string' ||
          options.fiducialUID instanceof String)) {
      throw new Error('fiducialUID of Scoord3D must be a string')
    }
    this[_fiducialUID] = options.fiducialUID
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Scoord3D must be an array')
    }
    this[_coordinates] = options.coordinates
  }

  /** Graphic Data
   *
   * @type {number[][]}
   */
  get graphicData () {
    return this[_coordinates]
  }

  /** Graphic Type
   *
   * @type {string}
   */
  get graphicType () {
    throw new Error('Prototype property "graphicType" must be implemented')
  }

  /** Frame of Reference UID
   *
   * @type {string}
   */
  get frameOfReferenceUID () {
    return this[_frameOfReferenceUID]
  }

  /** Fiducial UID
   *
   * @type {string}
   */
  get fiducialUID () {
    return this[_fiducialUID]
  }
}

/** POINT graphic denoted by a single (X,Y,Z) triplet.
 *
 * @class
 * @extends Scoord3D
 * @memberof scoord3d
 */
class Point extends Scoord3D {
  /** Creates a new Point object.
   *
   * @param {Object} options
   * @param {string} options.frameOfReferenceUID - Unique identifier of the Frame of Reference
   * @param {number[]} options.coordinates - X, Y and Z coordinate.
   * @param {string} [options.fiducialUID] - Unique identifier of an imaging fiducial
   */
  constructor (options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Point must be an array')
    }
    if (options.coordinates.length !== 3) {
      throw new Error('coordinates of Point must be an array of length 3')
    }
    if (options.coordinates.some(c => c < 0)) {
      console.warn('coordinates of Point are negative numbers')
    }
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  /** Graphic Data
   *
   * @type {number[]}
   */
  get graphicData () {
    return this[_coordinates]
  }

  get graphicType () {
    return 'POINT'
  }
}

/** MULTIPOINT graphic denoted by multiple, coplanar (X,Y,Z) coordinates that
 * represent individual points.
 *
 * @class
 * @extends Scoord3D
 * @memberof scoord3d
 */
class Multipoint extends Scoord3D {
  /** Creates a new Multipoint object.
   *
   * @param {Object} options
   * @param {string} options.frameOfReferenceUID - Unique identifier of the Frame of Reference
   * @param {number[][]} options.coordinates - X, Y and Z coordinate of each point.
   * @param {string} [options.fiducialUID] - Unique identifier of an imaging fiducial
   */
  constructor (options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Multipoint must be an array')
    }
    if (options.coordinates.find(c => c.length !== 3) !== undefined) {
      throw new Error('coordinates of Multipoint must be an array of (X,Y,Z) triplets')
    }
    if (options.coordinates.find(c => c.some(item => item < 0))) {
      console.warn('coordinates of Multipoint contain positive numbers')
    }
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType () {
    return 'MULTIPOINT'
  }
}

/** POLYLINE graphic denoted by multiple, ordered (X,Y,Z) coordinates that
 * represent vertices of connected line segments.
 *
 * @class
 * @extends Scoord3D
 * @memberof scoord3d
 */
class Polyline extends Scoord3D {
  /** Creates a new Polyline object.
   *
   * @param {Object} options
   * @param {string} options.frameOfReferenceUID - Unique identifier of the Frame of Reference
   * @param {number[][]} options.coordinates - (X,Y,Z) coordinates of point on the line
   * @param {string} [options.fiducialUID] - Unique identifier of an imaging fiducial
   */
  constructor (options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Polyline must be an array')
    }
    if (options.coordinates.find(c => c.length !== 3) !== undefined) {
      throw new Error('coordinates of Polyline must be an array of (X,Y,Z) triplets')
    }
    if (options.coordinates.find(c => c.some(item => item < 0))) {
      console.warn('coordinates of Polyline contain negative numbers')
    }
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType () {
    return 'POLYLINE'
  }
}

/** POLYGON graphic denoted by multiple, ordered, coplaner (X,Y,Z) coordinates
 * that represent vertices of connected line segments.
 * The first and last coordinate should be identical.
 *
 * @class
 * @extends Scoord3D
 * @memberof scoord3d
 */
class Polygon extends Scoord3D {
  /** Creates a new Polygon object.
   *
   * @param {Object} options
   * @param {string} options.frameOfReferenceUID - Unique identifier of the Frame of Reference
   * @param {number[][]} options.coordinates - (X,Y,Z) coordinates of points on the perimeter of the polygon (first and last coordinate must be the same).
   * @param {string} [options.fiducialUID] - Unique identifier of an imaging fiducial
   */
  constructor (options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Polygon must be an array')
    }
    if (options.coordinates.find(c => c.length !== 3) !== undefined) {
      throw new Error('coordinates of Polygon must be an array of (X,Y,Z) triplets')
    }
    if (options.coordinates.find(c => c.some(item => item < 0))) {
      console.warn('coordinates of Polygon contain negative numbers')
    }
    const n = options.coordinates.length
    if ((options.coordinates[0][0] !== options.coordinates[n - 1][0]) ||
       (options.coordinates[0][1] !== options.coordinates[n - 1][1]) ||
       (options.coordinates[0][2] !== options.coordinates[n - 1][2])) {
      throw new Error('first and last coordinate of Polygon must be the same')
    }
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType () {
    return 'POLYGON'
  }
}

/** ELLIPSOID graphic denoted by six (X,Y,Z) coordinates that represent
 * endpoints of the three orthogonal geometric axes, where the first and second
 * coordinates represent the endpoints of the first axis, the third and forth
 * coordinates represent the endpoints of the second axis and the fifth and
 * sixth coordinates represent the endpoints of the third axis.
 *
 * @class
 * @extends Scoord3D
 * @memberof scoord3d
 */
class Ellipsoid extends Scoord3D {
  /** Creates a new Ellipsoid object.
   *
   * @param {Object} options
   * @param {string} options.frameOfReferenceUID - Unique identifier of the Frame of Reference
   * @param {number[][]} options.coordinates - (X,Y,Z) coordinates of the three axes endpoints
   * @param {string} [options.fiducialUID] - Unique identifier of an imaging fiducial
   */
  constructor (options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Ellipsoid must be an array')
    }
    if (options.coordinates.length !== 6) {
      throw new Error('coordinates of Ellipsoid must be an array of length 6')
    }
    if (options.coordinates.find(c => c.length !== 3) !== undefined) {
      throw new Error('coordinates of Ellipsoid must be an array of (X,Y,Z) triplets')
    }
    if (options.coordinates.find(c => c.some(item => item < 0))) {
      console.warn('coordinates of Ellipsoid contain negative numbers')
    }
    super({
      coordinates: options.coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType () {
    return 'ELLIPSOID'
  }
}

/** ELLIPSE graphic denoted by four, coplaner (X,Y,Z) coordinates that represent
 * the endpoints of the major and minor axes, where the first and second
 * coordinates represent the endpoints of the major axis and the third and
 * forth coordinates represent the endpoints of the minor axis.
 *
 * @class
 * @extends Scoord3D
 * @memberof scoord3d
 */
class Ellipse extends Scoord3D {
  /** Creates a new Ellipse object.
   *
   * @param {Object} options
   * @param {string} options.frameOfReferenceUID - Unique identifier of the Frame of Reference
   * @param {number[][]} options.coordinates - (X,Y,Z) coordinates of the major and minor axes endpoints
   * @param {string} [options.fiducialUID] - Unique identifier of an imaging fiducial
   */
  constructor (options) {
    if (!Array.isArray(options.coordinates)) {
      throw new Error('coordinates of Ellipse must be an array')
    }
    if (options.coordinates.length !== 4) {
      throw new Error('coordinates of Ellipse must be an array of length 4')
    }
    if (options.coordinates.find(c => c.length !== 3) !== undefined) {
      throw new Error('coordinates of Ellipse must be an array of (X,Y,Z) triplets')
    }
    if (options.coordinates.find(c => c.some(item => item < 0))) {
      console.warn('coordinates of Ellipse contain negative numbers')
    }
    const firstAxis = [
      options.coordinates[0][0] - options.coordinates[1][0],
      options.coordinates[0][1] - options.coordinates[1][1]
    ]
    const secondAxis = [
      options.coordinates[2][0] - options.coordinates[3][0],
      options.coordinates[2][1] - options.coordinates[3][1]
    ]
    const firstAxisNorm = Math.sqrt(
      Math.pow(firstAxis[0], 2) + Math.pow(firstAxis[1], 2)
    )
    const secondAxisNorm = Math.sqrt(
      Math.pow(secondAxis[0], 2) + Math.pow(secondAxis[1], 2)
    )
    const dotProduct = firstAxis[0] * secondAxis[0] + firstAxis[1] * secondAxis[1]
    const angle = Math.acos(dotProduct / (firstAxisNorm * secondAxisNorm))
    const degrees = angle * 180 / Math.PI
    if (degrees !== 90) {
      throw new Error('Two axis of Ellipse must have right angle')
    }
    let coordinates = options.coordinates
    if (firstAxisNorm < secondAxisNorm) {
      coordinates = [
        coordinates[2],
        coordinates[3],
        coordinates[0],
        coordinates[1]
      ]
    }
    super({
      coordinates: coordinates,
      frameOfReferenceUID: options.frameOfReferenceUID,
      fiducialUID: options.fiducialUID
    })
  }

  get graphicType () {
    return 'ELLIPSE'
  }
}

export { Point, Multipoint, Polyline, Polygon, Ellipse, Ellipsoid }
