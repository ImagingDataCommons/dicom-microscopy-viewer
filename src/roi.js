import { generateUID } from './utils.js';

const _uid = Symbol('uid');
const _scoord3d = Symbol('scoord3d');

/* Region of interest.
 */
class ROI {

  /* @constructor
   * @param{Scoord3D} scoord3d spatial coordinates
   * @param{Object} properties qualititative evaluations
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
    // TODO: store SOPInstanceUID, SOPClassUID and FrameNumbers as reference
  }

  get uid() {
    return this[_uid];
  }

  get scoord3d() {
    return this[_scoord3d];
  }

}

export { ROI };
