/* Region of interest.
 */
class ROI {

  /* @constructor
   * @param{Scoord} scoord spatial coordinates
   * @param{Object} properties qualititative evaluations
   */
  constructor(options) {
    if (!('scoord' in options)) {
      console.error('spatial coordinates are required for ROI')
    }
    this.scoord = options.scoord;
    this.properties = options.properties ? options.properties : {};
    this.coordinateSystem = options.coordinateSystem;
  }

}

export { ROI };
