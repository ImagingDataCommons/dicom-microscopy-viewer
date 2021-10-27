import { generateUID } from './utils.js'

const _number = Symbol('number')
const _label = Symbol('label')
const _uid = Symbol('uid')
const _property = Symbol('property')
const _algorithm = Symbol('algorithm')
const _instanceUIDs = Symbol('instanceUIDs')

/** A segment.
 *
 * @class
 * @memberof segment
 */
class Segment {
  /* Creates a new Segment object.
   *
   * @param {Object} options - Options for construction of Segment
   * @param {string} options.uid - Unique tracking identifier
   * @param {number} options.number - Segment Number (one-based index value)
   * @param {string} options.label - Segment Label
   * @param {string} options.algorithmName - Segment Algorithm Name
   * @param {string} options.algorithmType - Segment Algorithm Type
   * @param {string} options.propertyCategory - Segmented Property Category
   * @param {string} options.propertyType - Segmented Property Type
   * @param {string} options.studyInstanceUID - Study Instance UID of Segmentation images
   * @param {string} options.seriesInstanceUID - Series Instance UID of Segmentation images
   * @param {string[]} options.sopInstanceUIDs - SOP Instance UIDs of Segmentation images
   */
  constructor ({
    uid,
    number,
    label,
    propertyCategory,
    propertyType,
    algorithmType,
    algorithmName,
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUIDs
  }) {
    if (uid === undefined) {
      throw new Error('Unique Tracking Identifier is required.')
    } else {
      this[_uid] = uid
    }

    if (number === undefined) {
      throw new Error('Segment Number is required.')
    }
    this[_number] = number

    if (label === undefined) {
      throw new Error('Segment Label is required.')
    }
    this[_label] = label

    if (propertyCategory === undefined) {
      throw new Error('Segmented Property Category is required.')
    }
    if (propertyType === undefined) {
      throw new Error('Segmented Property Type is required.')
    }
    this[_property] = {
      category: propertyCategory,
      type: propertyType
    }

    if (algorithmName === undefined) {
      throw new Error('Segment Algorithm Name is required.')
    }
    if (algorithmType === undefined) {
      throw new Error('Segment Algorithm Type is required.')
    }
    this[_algorithm] = {
      type: algorithmType,
      name: algorithmName
    }

    if (studyInstanceUID === undefined) {
      throw new Error('Study Instance UID is required.')
    }
    if (seriesInstanceUID === undefined) {
      throw new Error('Series Instance UID is required.')
    }
    if (sopInstanceUIDs === undefined) {
      throw new Error('SOP Instance UIDs are required.')
    }
    this[_instanceUIDs] = {
      studyInstanceUID,
      seriesInstanceUID,
      sopInstanceUIDs
    }
  }

  /** Get Unique Tracking Identifier
   *
   * @returns {string} Unique Tracking Identifier
   */
  get uid () {
    return this[_uid]
  }

  /** Get Segment Number.
   *
   * @returns {number} Segment Number
   */
  get number () {
    return this[_number]
  }

  /** Get Segment Label
   *
   * @returns {string} Segment Label
   */
  get label () {
    return this[_label]
  }

  /** Get Segment Algorithm Name
   *
   * @returns {string} Segment Algorithm Name
   */
  get algorithmName () {
    return this[_algorithm].name
  }

  /** Get Segment Algorithm Type
   *
   * @returns {string} Segment Algorithm Type
   */
  get algorithmType () {
    return this[_algorithm].type
  }

  /** Get Segmented Property Category
   *
   * @returns {object} Segmented Property Category
   */
  get propertyCategory () {
    return this[_property].category
  }

  /** Get Segmented Property Type
   *
   * @returns {object} Segmented Property Type
   */
  get propertyType () {
    return this[_property].type
  }

  /** Get Study Instance UID of Segmentation images.
   *
   * @returns {string} Study Instance UID
   */
  get studyInstanceUID () {
    return this[_instanceUIDs].studyInstanceUIDs
  }

  /** Get Series Instance UID of Segmentation images.
   *
   * @returns {string} Series Instance UID
   */
  get seriesInstanceUID () {
    return this[_instanceUIDs].seriesInstanceUIDs
  }

  /** Get SOP Instance UIDs of Segmentation images.
   *
   * @returns {string[]} SOP Instance UIDs
   */
  get sopInstanceUIDs () {
    return this[_instanceUIDs].sopInstanceUIDs
  }
}

export { Segment }
