const _attrs = Symbol('attrs')

/** An annotation group.
 *
 * @class
 * @memberof annotation
 */
class AnnotationGroup {
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
    this[_attrs] = {}
    if (uid === undefined) {
      throw new Error('Annotation Group UID is required.')
    } else {
      this[_attrs].uid = uid
    }

    if (number === undefined) {
      throw new Error('Annotation Group Number is required.')
    }
    this[_attrs].number = number

    if (label === undefined) {
      throw new Error('Annotation Group Label is required.')
    }
    this[_attrs].label = label

    if (propertyCategory === undefined) {
      throw new Error('Annotation Property Category is required.')
    }
    this[_attrs].propertyCategory = propertyCategory

    if (propertyType === undefined) {
      throw new Error('Annotation Property Type is required.')
    }
    this[_attrs].propertyType = propertyType

    if (algorithmName === undefined) {
      throw new Error('Annotation Group Algorithm Name is required.')
    }
    this[_attrs].algorithmType = algorithmType

    if (algorithmType === undefined) {
      throw new Error('Annotation Group Generation Type is required.')
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
  }

  /** Get Annotation Group UID
   *
   * @returns {string} Annotation Group UID
   */
  get uid () {
    return this[_attrs].uid
  }

  /** Get Annotation Group Number.
   *
   * @returns {number} Annotation Group Number
   */
  get number () {
    return this[_attrs].number
  }

  /** Get Annotation Group Label
   *
   * @returns {string} Annotation Group Label
   */
  get label () {
    return this[_attrs].label
  }

  /** Get Segment Algorithm Name
   *
   * @returns {string} Segment Algorithm Name
   */
  get algorithmName () {
    return this[_attrs].algorithmName
  }

  /** Get Annotation Group Generation Type
   *
   * @returns {string} Annotation Group Generation Type
   */
  get algorithmType () {
    return this[_attrs].algorithmType
  }

  /** Get Annotation Property Category
   *
   * @returns {object} Annotation Property Category
   */
  get propertyCategory () {
    return this[_attrs].propertyCategory
  }

  /** Get Annotation Property Type
   *
   * @returns {object} Annotation Property Type
   */
  get propertyType () {
    return this[_attrs].propertyType
  }

  /** Get Study Instance UID of Microscopy Bulk Simple Annotations objects.
   *
   * @returns {string} Study Instance UID
   */
  get studyInstanceUID () {
    return this[_attrs].studyInstanceUID
  }

  /** Get Series Instance UID of Microscopy Bulk Simple Annotations objects.
   *
   * @returns {string} Series Instance UID
   */
  get seriesInstanceUID () {
    return this[_attrs].seriesInstanceUID
  }

  /** Get SOP Instance UIDs of Microscopy Bulk Simple Annotations objects.
   *
   * @returns {string[]} SOP Instance UIDs
   */
  get sopInstanceUIDs () {
    return this[_attrs].sopInstanceUIDs
  }
}

export { AnnotationGroup }
