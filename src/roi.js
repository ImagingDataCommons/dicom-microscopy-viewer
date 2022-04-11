import { _generateUID } from './utils.js'
import Enums from './enums'

const _uid = Symbol('uid')
const _scoord3d = Symbol('scoord3d')
const _properties = Symbol('properties')

/** A region of interest (ROI)
 *
 * @class
 * @memberof roi
 */
class ROI {
  /**
   * @param {Object} options - Options for construction of ROI
   * @param {scoord3d.Scoord3D} options.scoord3d - Spatial 3D coordinates
   * @param {string} options.uid - Unique idenfifier
   * @param {Object} options.properties - Properties (name-value pairs)
   */
  constructor (options) {
    if (!('scoord3d' in options)) {
      throw new Error('spatial coordinates are required for ROI')
    }
    if (!(typeof options.scoord3d === 'object' || options.scoord3d !== null)) {
      throw new Error('scoord3d of ROI must be a Scoord3D object')
    }
    if (!('uid' in options)) {
      this[_uid] = _generateUID()
    } else {
      if (!(typeof options.uid === 'string' || options.uid instanceof String)) {
        throw new Error('uid of ROI must be a string')
      }
      this[_uid] = options.uid
    }
    this[_scoord3d] = options.scoord3d
    if ('properties' in options) {
      if (!(typeof options.properties === 'object')) {
        throw new Error('properties of ROI must be an object')
      }
      this[_properties] = options.properties
      if (this[_properties].evaluations === undefined) {
        this[_properties][Enums.InternalProperties.Evaluations] = []
      }
      if (this[_properties].measurements === undefined) {
        this[_properties][Enums.InternalProperties.Measurements] = []
      }
    } else {
      this[_properties] = {}
      this[_properties][Enums.InternalProperties.Evaluations] = []
      this[_properties][Enums.InternalProperties.Measurements] = []
    }
    Object.freeze(this)
  }

  /**
   * Unique identifier of region of interest.
   *
   * @type string
   */
  get uid () {
    return this[_uid]
  }

  /**
   * Spatial coordinates of region of interest.
   *
   * @type scoord3d.Scoord3D
   */
  get scoord3d () {
    return this[_scoord3d]
  }

  /**
   * Properties of region of interest.
   *
   * @type Object
   */
  get properties () {
    return this[_properties]
  }

  /**
   * Measurements of region of interest.
   *
   * @type Object[]
   */
  get measurements () {
    return this[_properties].measurements
  }

  /**
   * Qualitative evaluations of region of interest.
   *
   * @type Object[]
   */
  get evaluations () {
    return this[_properties].evaluations
  }

  /**
   * Add a measurement.
   *
   * @param {Object} item - NUM content item representing a measurement
   */
  addMeasurement (item) {
    this[_properties][Enums.InternalProperties.Measurements].push(item)
  }

  /**
   * Add a qualitative evaluation.
   *
   * @param {Object} item - CODE content item representing a qualitative evaluation
   */
  addEvaluation (item) {
    this[_properties][Enums.InternalProperties.Evaluations].push(item)
  }
}

export { ROI }
