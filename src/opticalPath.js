const _attrs = Symbol('_attrs')

/** Information for blending a channel with other channels during display.
 *
 * Provides a set of presentation parameters for a given channel that determine
 * how the channel will be blend (composited) with other channels to create a
 * color image for display.
 *
 * @class
 * @memberof channel
 */
class BlendingInformation {
  /*
  * An interface class to set/get the visualization/presentation
  * parameters from a channel object
  *
  * @param {string} opticalPathIdentifier - Optical path identifier
  * @param {number[]} color - RGB triplet values in range [0, 255]
  * @param {number} opacity - Opacity in range [0, 1]
  * @param {number[]} thresholdValues - Lower and upper clipping threshold values in range [0, 1]
  * @param {number[]} limitValues - Lower and upper windowing limit values in range [0, 2^bits]
  * @param {boolean} visible - Whether the channel should be visible
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

    if (color == null) {
      throw new Error('Color is required.')
    }
    if (!Array.isArray(color)) {
      throw new Error('Color must be provided as an array.')
    }
    if (color.length !== 3) {
      throw new Error('An RGB color triplet must be provided.')
    }
    this.color = [...color]

    this.opacity = opacity

    if (thresholdValues == null) {
      throw new Error('Threshold values are required.')
    }
    if (!Array.isArray(thresholdValues)) {
      throw new Error('Threshold values must be provided as an array.')
    }
    if (thresholdValues.length !== 2) {
      throw new Error('Two threshold values must be provided.')
    }
    this.thresholdValues = [...thresholdValues]

    if (limitValues == null) {
      throw new Error('Limit values are required.')
    }
    if (!Array.isArray(thresholdValues)) {
      throw new Error('Limit values must be provided as an array.')
    }
    if (limitValues.length !== 2) {
      throw new Error('Two limit values must be provided.')
    }
    this.limitValues = [...limitValues]

    this.visible = visible
  }
}

/** An Optical Path.
 *
 * An optical path represents a color or a monochromatic image that was acquired
 * using specific microscopy settings. Usually, an optical path is also
 * associated with specific specimen preparation steps, in particular one or
 * more staining steps. For example, in immunofluorescence microscopy imaging,
 * an optical path is generally associated with a specific fluorescence
 * illumination wave length or color (e.g., 568nm in the red spectrum of the
 * visible light) and an antibody or a set of antibodies labeled with a
 * corresponding fluorophore that can be excited by light at the illumination
 * wave length and re-emit light (usually at a slightly higher wave length)
 * upon excitation.
 *
 * Note, however, that multiple stains may be applied to the imaging target
 * (specimen) during specimen preparation, and multiple images may be acquired
 * using different optical paths - either simultaneously or sequentially.
 * The content of an image thus depends on the physical properties of the
 * tissue stains (fluorophores) as well as the characteristics of the optical
 * path (illumination wave length, light and image path filters, etc.).
 *
 * An optical path is identified by an optical path identifier that must be
 * unique within the scope of an image acquisition (or multiple cycles of image
 * acquisition in case of iterative immunofluorescence imaging).
 * The relationship between the optical path and any corresponding staining
 * specimen preparation steps may not be explicitly specified.
 *
 * @class
 * @memberof opticalPath
 */
class OpticalPath {
  /* Create a new OpticalPath object.
   *
   * @param {Object} options - Options
   * @param {string} options.identifier - Optical Path Identifier
   * @param {string} options.studyInstanceUID - Study Instance UID of VL Whole Slide Microscopy Image instances
   * @param {string} options.seriesInstanceUID - Series Instance UID of VL Whole Slide Microscopy Image instances
   * @param {string[]} options.sopInstanceUIDs - SOP Instance UIDs of VL Whole Slide Microscopy Image instances
   */
  constructor ({
    identifier,
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUIDs
  }) {
    this[_attrs] = {}
    if (identifier === undefined) {
      throw new Error('Optical Path Identifier is required.')
    }
    this[_attrs].identifier = identifier

    if (studyInstanceUID === undefined) {
      throw new Error('Study Instance UID is required.')
    }
    this[_attrs].studyInstanceUID = studyInstanceUID

    if (seriesInstanceUID === undefined) {
      throw new Error('Series Instance UID is required.')
    }
    this[_attrs].seriesInstanceUID = seriesInstanceUID

    if (sopInstanceUIDs === undefined) {
      throw new Error('SOP Instance UIDs are required.')
    }
    this[_attrs].sopInstanceUIDs = sopInstanceUIDs
  }

  /** Get Optical Path Identifier
   *
   * @returns {string} Optical Path Identifier
   */
  get identifier () {
    return this[_attrs].identifier
  }

  /** Get Study Instance UID of images.
   *
   * @returns {string} Study Instance UID
   */
  get studyInstanceUID () {
    return this[_attrs].studyInstanceUID
  }

  /** Get Series Instance UID of images.
   *
   * @returns {string} Series Instance UID
   */
  get seriesInstanceUID () {
    return this[_attrs].seriesInstanceUID
  }

  /** Get SOP Instance UIDs of images.
   *
   * @returns {string[]} SOP Instance UIDs
   */
  get sopInstanceUIDs () {
    return this[_attrs].sopInstanceUIDs
  }
}

export { BlendingInformation, OpticalPath }
