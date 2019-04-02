import { generateUuid } from './utils.js';


/* Region of interest.
 */
class ROI {

  /* @constructor
   * @param{Scoord3D} scoord3d spatial coordinates
   * @param{Object} properties qualititative evaluations
   */
  constructor(options) {
    if (!('scoord3d' in options)) {
      console.error('spatial coordinates are required for ROI')
    }
    if (!('uid' in options)) {
      this.uid = generateUuid();
    } else {
      if (!(typeof options.uid === 'string' || options.uid instanceof String)) {
        throw new Error('uid of ROI must be a string')
      }
      this.uid = options.uid;
    }
    this.scoord3d = options.scoord3d;
    this.properties = options.properties ? options.properties : {};
  }

}

export { ROI };
