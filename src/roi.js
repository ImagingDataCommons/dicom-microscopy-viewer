import { generateUID } from './utils.js';

const _uid = Symbol('uid');
const _scoord3d = Symbol('scoord3d');
const _properties = Symbol('properties');

/** A region of interest (ROI)
 *
 * @class
 * @memberof roi
 */
class ROI {

  /* Creates a new ROI object.
   *
   * @param {Object} options - Options for construction of ROI
   * @param {Scoord3D} options.scoord3d - Spatial 3D coordinates
   * @param {string} options.uid - Unique idenfifier
   * @param {Object} options.properties - Qualititative evaluations
   */
  constructor(options) {
    if (!('scoord3d' in options)) {
      throw new Error('spatial coordinates are required for ROI')
    }
    if (!(typeof(options.scoord3d) === 'object' || options.scoord3d !== null)) {
      throw new Error('scoord3d of ROI must be a Scoord3D object')
    }
    if (!('uid' in options)) {
      this[_uid] = generateUID();
    } else {
      if (!(typeof(options.uid) === 'string' || options.uid instanceof String)) {
        throw new Error('uid of ROI must be a string')
      }
      this[_uid] = options.uid;
    }
    this[_scoord3d] = options.scoord3d;
    this[_properties] = options.properties;
    // TODO: store SOPInstanceUID, SOPClassUID and FrameNumbers as reference
  }

  /** Gets unique identifier of region of interest.
   *
   * @returns {string} Unique identifier
   */
  get uid() {
    return this[_uid];
  }

  /** Gets spatial coordinates of region of interest.
   *
   * @returns {Scoord3D} Spatial coordinates
   */
  get scoord3d() {
    return this[_scoord3d];
  }

  /** Gets properties of region of interest.
   *
   * @returns {Object} Properties
   */
  get properties() {
    return this[_properties];
  }

}

export { ROI };
