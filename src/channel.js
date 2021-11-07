/** BlendingInformation for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type VOLUME.
 *
 * @class
 * @memberof channel
 */
class BlendingInformation {
  /*
  * An interface class to set/get the visualization/presentation
  * parameters from a channel object
  *
  * @param {string} opticalPathIdentifier
  * @param {number[]} color
  * @param {number} opacity
  * @param {number[]} thresholdValues
  * @param {number[]} limitValues
  * @param {boolean} visible
  */
  constructor ({
    opticalPathIdentifier,
    color,
    opacity,
    thresholdValues,
    limitValues,
    visible
  }) {
    this.opticalPathIdentifier = opticalPathIdentifier
    this.color = [...color]
    this.opacity = opacity
    this.thresholdValues = [...thresholdValues]
    this.limitValues = [...limitValues]
    this.visible = visible
  }
}

export { BlendingInformation }
