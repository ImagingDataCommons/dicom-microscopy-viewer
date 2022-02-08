const _attrs = Symbol('attrs')

/** A transformation.
 *
 * Describes the transformation of a range of stored values into real world
 * values in a defined unit. The transformation may either be described by a
 * lookup table (LUT) or alternatively by the slope and intercept parameters if
 * the transformation can be described by a linear function.
 */
class Transformation {
  /** Creates a new Transformation object.
   *
   */
  constructor ({
    label,
    firstValueMapped,
    lastValueMapped,
    intercept,
    slope,
    lut
  }) {
    if (label === undefined) {
      throw new Error('LUT Label is required.')
    }
    this[_attrs].label = label

    if (firstValueMapped === undefined) {
      throw new Error('Real World Value First Value Mapped is required.')
    }
    this[_attrs].firstValueMapped = firstValueMapped
    if (lastValueMapped === undefined) {
      throw new Error('Real World Value Last Value Mapped is required.')
    }
    this[_attrs].lastValueMapped = lastValueMapped

    if ((intercept === undefined || slope === undefined) && lut === undefined) {
      throw new Error(
        'Either LUT Data or Real World Value Slope and ' +
        'Real World Value Intercept must be provided.'
      )
    }
    if (slope === undefined) {
      throw new Error('Real World Value Slope is required.')
    }
    this[_attrs].slope = slope
    if (intercept === undefined) {
      throw new Error('Real World Value Intercept is required.')
    }
    this[_attrs].intercept = intercept

    if (lut === undefined) {
      throw new Error('LUT Data is required.')
    }
    this[_attrs].lut = lut
  }
}

/** A mapping.
 *
 * @class
 * @memberof mapping
 */
class Mapping {
  /* Creates a new Mapping object.
   *
   * @param {Object} options
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
    mappings[key] = {
      frameNumbers: [...Array(numFrames).keys()].map(index => index + 1),
      realWorldValueMappings: sharedItem.RealWorldValueMappingSequence
    }
  } else {
    // Dimension Organization TILED_FULL is not defined for Parametric Map
    if (metadata.PerFrameFunctionalGroupsSequence !== undefined) {
      metadata.PerFrameFunctionalGroupsSequence.forEach((frameItem, i) => {
        if (frameItem.RealWorldValueMappingSequence !== undefined) {
          const labels = frameItem.RealWorldValueMappingSequence.map(
            item => item.LUTLabel
          )
          const key = labels.join('-')
          if (key in mappings) {
            mappings[key].frameNumbers.push(i + 1)
          } else {
            mappings[key] = {
              frameNumbers: [i + 1],
              realWorldValueMappings: frameItem.RealWorldValueMappingSequence
            }
          }
        }
      })
    }
  }

  const frameNumberToMappingNumber = {}
  const mappingNumberToFrameNumbers = {}
  const mappingNumberToDescriptions = {}
  Object.values(mappings).forEach((mapping, mappingIndex) => {
    const mappingNumber = mappingIndex + 1
    mapping.frameNumbers.forEach(frameNumber => {
      frameNumberToMappingNumber[frameNumber] = mappingNumber
      if (mappingNumber in mappingNumberToFrameNumbers) {
        mappingNumberToFrameNumbers[mappingNumber].push(frameNumber)
      } else {
        mappingNumberToFrameNumbers[mappingNumber] = [frameNumber]
      }
    })
    mappingNumberToDescriptions[mappingNumber] = mapping.realWorldValueMappings
  })

  return {
    frameNumberToMappingNumber,
    mappingNumberToFrameNumbers,
    mappingNumberToDescriptions
  }
}

export {
  _groupFramesPerMapping,
  Mapping,
  Transformation
}
