const _attrs = Symbol('attrs')

/**
 * A segment.
 *
 * Describes an item of the Segment Sequence of a DICOM Segmentation instance.
 *
 * @class
 * @memberof segment
 */
class Segment {
  /**
   * @param {Object} options - Options for construction of Segment
   * @param {string} options.uid - Unique tracking identifier
   * @param {number} options.number - Segment Number (one-based index value)
   * @param {string} options.label - Segment Label
   * @param {string} options.algorithmName - Segment Algorithm Name
   * @param {Object} options.algorithmType - Segment Algorithm Type
   * @param {Object} options.propertyCategory - Segmented Property Category Code
   * @param {Object} options.propertyType - Segmented Property Type Code
   * @param {string} options.studyInstanceUID - Study Instance UID of DICOM
   * Segmentation instances
   * @param {string} options.seriesInstanceUID - Series Instance UID of DICOM
   * Segmentation instances
   * @param {string[]} options.sopInstanceUIDs - SOP Instance UIDs of DICOM
   * Segmentation instances
   * @param {string|undefined} options.paletteColorLookupTableUID - Palette
   * Color Lookup Table UID
   */
  constructor({
    uid,
    number,
    label,
    propertyCategory,
    propertyType,
    algorithmType,
    algorithmName,
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUIDs,
    paletteColorLookupTableUID,
  }) {
    this[_attrs] = {}
    if (uid === undefined) {
      throw new Error('Unique Tracking Identifier is required.')
    } else {
      this[_attrs].uid = uid
    }

    if (number === undefined) {
      throw new Error('Segment Number is required.')
    }
    this[_attrs].number = number

    if (label === undefined) {
      throw new Error('Segment Label is required.')
    }
    this[_attrs].label = label

    if (propertyCategory === undefined) {
      throw new Error('Segmented Property Category Code is required.')
    }
    this[_attrs].propertyCategory = propertyCategory

    if (propertyType === undefined) {
      throw new Error('Segmented Property Type Code is required.')
    }
    this[_attrs].propertyType = propertyType

    if (algorithmName === undefined) {
      throw new Error('Segment Algorithm Name is required.')
    }
    this[_attrs].algorithmType = algorithmType

    if (algorithmType === undefined) {
      throw new Error('Segment Algorithm Type is required.')
    }
    this[_attrs].algorithmName = algorithmName

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

    this[_attrs].paletteColorLookupTableUID = paletteColorLookupTableUID

    Object.freeze(this)
  }

  /**
   * Unique Tracking Identifier
   *
   * @type string
   */
  get uid() {
    return this[_attrs].uid
  }

  /**
   * Segment Number.
   *
   * @type number
   */
  get number() {
    return this[_attrs].number
  }

  /**
   * Segment Label
   *
   * @type string
   */
  get label() {
    return this[_attrs].label
  }

  /**
   * Segment Algorithm Name
   *
   * @type string
   */
  get algorithmName() {
    return this[_attrs].algorithmName
  }

  /**
   * Segment Algorithm Type
   *
   * @type object
   */
  get algorithmType() {
    return this[_attrs].algorithmType
  }

  /**
   * Segmented Property Category Code
   *
   * @type object
   */
  get propertyCategory() {
    return this[_attrs].propertyCategory
  }

  /**
   * Segmented Property Type Code
   *
   * @type object
   */
  get propertyType() {
    return this[_attrs].propertyType
  }

  /**
   * Study Instance UID of DICOM Segmentation instances.
   *
   * @type string
   */
  get studyInstanceUID() {
    return this[_attrs].studyInstanceUID
  }

  /**
   * Series Instance UID of DICOM Segmentation instances.
   *
   * @type string
   */
  get seriesInstanceUID() {
    return this[_attrs].seriesInstanceUID
  }

  /**
   * SOP Instance UIDs of DICOM Segmentation instances.
   *
   * @type string[]
   */
  get sopInstanceUIDs() {
    return this[_attrs].sopInstanceUIDs
  }

  /**
   * Palette Color Lookup Table UID.
   *
   * @type string
   */
  get paletteColorLookupTableUID() {
    return this[_attrs].paletteColorLookupTableUID
  }
}

export { Segment }
