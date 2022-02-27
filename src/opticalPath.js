const _attrs = Symbol('_attrs')

/**
 * An Optical Path.
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
   * @param {string} options.description - Optical Path Description
   * @param {object} options.illuminationType - Illumination Type Code
   * @param {boolean} options.isMonochromatic - Whether optical path is monochromatic
   * @param {object|undefined} options.illuminationColor - Illumination Color Code
   * @param {string|undefined} options.illuminationWaveLength - Illumination Wave Length
   * @param {string} options.studyInstanceUID - Study Instance UID of VL Whole Slide Microscopy Image instances
   * @param {string} options.seriesInstanceUID - Series Instance UID of VL Whole Slide Microscopy Image instances
   * @param {string[]} options.sopInstanceUIDs - SOP Instance UIDs of VL Whole Slide Microscopy Image instances
   * @param {string|undefined} options.paletteColorLookupTableUID - Palette Color Lookup Table UID
   */
  constructor ({
    identifier,
    description,
    illuminationType,
    isMonochromatic,
    illuminationColor,
    illuminationWaveLength,
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUIDs,
    paletteColorLookupTableUID
  }) {
    this[_attrs] = {}
    if (identifier == null) {
      throw new Error('Identifier must be provided for optical path.')
    }
    this[_attrs].identifier = identifier
    this[_attrs].description = description

    if (illuminationType == null) {
      throw new Error('Illumination type must be specified for optical path.')
    }
    this[_attrs].illuminationType = illuminationType

    this[_attrs].illuminationWaveLength = illuminationWaveLength

    if (studyInstanceUID == null) {
      throw new Error('Study Instance UID must be provided for optical path.')
    }
    this[_attrs].studyInstanceUID = studyInstanceUID

    if (seriesInstanceUID == null) {
      throw new Error('Series Instance UID must be provided for optical path.')
    }
    this[_attrs].seriesInstanceUID = seriesInstanceUID

    if (sopInstanceUIDs == null) {
      throw new Error('SOP Instance UIDs must be provided for optical path.')
    }
    this[_attrs].sopInstanceUIDs = sopInstanceUIDs

    if (isMonochromatic == null) {
      throw new Error(
        'Whether optical path is monochromatic must be specified.'
      )
    }
    this[_attrs].isMonochromatic = isMonochromatic

    this[_attrs].paletteColorLookupTableUID = paletteColorLookupTableUID

    Object.freeze(this)
  }

  /**
   * Optical Path Identifier
   *
   * @returns {string} Optical Path Identifier
   */
  get identifier () {
    return this[_attrs].identifier
  }

  /**
   * Optical Path Description
   *
   * @returns {string} Optical Path Description
   */
  get description () {
    return this[_attrs].description
  }

  /**
   * Illumination Type Code
   *
   * @returns {object} Illumination Type Code
   */
  get illuminationType () {
    return this[_attrs].illuminationType
  }

  /**
   * Illumination Color
   *
   * @returns {object} Illumination Color Code
   */
  get illuminationColor () {
    return this[_attrs].illuminationColor
  }

  /**
   * Illumination Wave Length
   *
   * @returns {string | undefined} Illumination Wave Length
   */
  get illuminationWaveLength () {
    return this[_attrs].illuminationWaveLength
  }

  /**
   * Study Instance UID of images
   *
   * @returns {string} Study Instance UID
   */
  get studyInstanceUID () {
    return this[_attrs].studyInstanceUID
  }

  /**
   * Series Instance UID of images
   *
   * @returns {string} Series Instance UID
   */
  get seriesInstanceUID () {
    return this[_attrs].seriesInstanceUID
  }

  /**
   * SOP Instance UIDs of images
   *
   * @returns {string[]} SOP Instance UIDs
   */
  get sopInstanceUIDs () {
    return this[_attrs].sopInstanceUIDs
  }

  /**
   * Palette Color Lookup Table UID
   *
   * @returns {string} Palette Color Lookup Table UID
   */
  get paletteColorLookupTableUID () {
    return this[_attrs].paletteColorLookupTableUID
  }

  /**
   * Whether optical path is monochromatic
   *
   * @returns {boolean} yes/no
   */
  get isMonochromatic () {
    return this[_attrs].isMonochromatic
  }

  /**
   * Whether images of optical path are colorable
   *
   * @returns {boolean} yes/no
   */
  get isColorable () {
    return this[_attrs].paletteColorLookupTableUID == null
  }
}

export { OpticalPath }
