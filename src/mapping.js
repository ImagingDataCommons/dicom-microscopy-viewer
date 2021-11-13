const _attrs = Symbol('attrs')

/** A Mapping.
 *
 * @class
 * @memberof mapping
 */
class Mapping {
  /* Creates a new Mapping object.
   *
   * @param {Object} options - Options for construction of Segment
   * @param {string} options.uid - Unique tracking identifier
   * @param {number} options.number - Mapping Number (one-based index value)
   * @param {string} options.label - Mapping Label
   * @param {string} options.studyInstanceUID - Study Instance UID of Parametric Map images
   * @param {string} options.seriesInstanceUID - Series Instance UID of Parametric Map images
   * @param {string[]} options.sopInstanceUIDs - SOP Instance UIDs of Parametric Map images
   */
  constructor ({
    uid,
    number,
    label,
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUIDs
  }) {
    this[_attrs] = {}
    if (uid === undefined) {
      throw new Error('Unique Tracking Identifier is required.')
    } else {
      this[_attrs].uid = uid
    }

    if (number === undefined) {
      throw new Error('Mapping Number is required.')
    }
    this[_attrs].number = number

    if (label === undefined) {
      throw new Error('Mapping Label is required.')
    }
    this[_attrs].label = label

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

  /** Get Unique Tracking Identifier
   *
   * @returns {string} Unique Tracking Identifier
   */
  get uid () {
    return this[_attrs].uid
  }

  /** Get Mapping Number.
   *
   * @returns {number} Segment Number
   */
  get number () {
    return this[_attrs].number
  }

  /** Get Mapping Label
   *
   * @returns {string} Segment Label
   */
  get label () {
    return this[_attrs].label
  }

  /** Get Study Instance UID of Parametric Map images.
   *
   * @returns {string} Study Instance UID
   */
  get studyInstanceUID () {
    return this[_attrs].studyInstanceUID
  }

  /** Get Series Instance UID of Parametric Map images.
   *
   * @returns {string} Series Instance UID
   */
  get seriesInstanceUID () {
    return this[_attrs].seriesInstanceUID
  }

  /** Get SOP Instance UIDs of Parametric Map images.
   *
   * @returns {string[]} SOP Instance UIDs
   */
  get sopInstanceUIDs () {
    return this[_attrs].sopInstanceUIDs
  }
}

function _groupFramesPerMapping (metadata) {
  const mappings = {}
  const sharedItem = metadata.SharedFunctionalGroupsSequence[0]
  if (sharedItem.RealWorldValueMappingSequence !== undefined) {
    const labels = sharedItem.RealWorldValueMappingSequence.map(
      item => item.LUTLabel
    )
    const key = labels.join('-')
    const numFrames = Number(metadata.NumberOfFrames)
    mappings[key] = [...Array(numFrames).keys()]
  } else {
    // TODO: TILED_FULL?
    if (metadata.PerFrameFunctionalGroupsSequence !== undefined) {
      metadata.PerFrameFunctionalGroupsSequence.forEach((frameItem, i) => {
        if (frameItem.RealWorldValueMappingSequence !== undefined) {
          const labels = frameItem.RealWorldValueMappingSequence.map(
            item => item.LUTLabel
          )
          const key = labels.join('-')
          if (key in mappings) {
            mappings[key].push(i)
          } else {
            mappings[key] = [i]
          }
        }
      })
    }
  }

  const mappingNumberToFrameNumbers = {}
  const frameNumberToMappingNumbers = {}
  Object.values(mappings).forEach((frameIndices, mappingIndex) => {
    const mappingNumber = mappingIndex + 1
    frameIndices.forEach(frameIndex => {
      const frameNumber = frameIndex + 1
      frameNumberToMappingNumbers[frameNumber] = mappingNumber
      mappingNumberToFrameNumbers[mappingNumber].push(frameNumber)
    })
  })

  return {
    frameNumberToMappingNumbers,
    mappingNumberToFrameNumbers
  }
}

export {
  _groupFramesPerMapping,
  Mapping
}
