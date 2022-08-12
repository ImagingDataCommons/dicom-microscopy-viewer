const _attrs = Symbol('attrs')

/**
 * Transformation of a range of stored values into real world values in a
 * defined unit. The transformation may either be described by a lookup table
 * (LUT) or alternatively by the slope and intercept parameters if the
 * transformation can be described by a linear function.
 *
 * @class
 * @memberof mapping
 */
class Transformation {
  /**
   * @param {Object} options - Options
   * @param {string} options.label - LUT Label
   * @param {number} options.firstValueMapped - First value mapped by LUT
   * @param {number} options.lastValueMapped - Last value mapped by LUT
   * @param {lut} options.lut - LUT data
   * @param {number} options.intercept - Intercept of linear function
   * @param {number} options.slope - Slope of linear function
   */
  constructor ({
    label,
    firstValueMapped,
    lastValueMapped,
    lut,
    intercept,
    slope
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

/**
 * Parameter Mapping.
 *
 * Describes an individual parameter encoded in a DICOM Parametric Map instance.
 *
 * @class
 * @memberof mapping
 */
class ParameterMapping {
  /**
   * @param {Object} options
   * @param {string} options.uid - Unique tracking identifier
   * @param {number} options.number - Parameter Number (one-based index value)
   * @param {string} options.label - Parameter Label
   * @param {string} options.description - Parameter Description
   * @param {string} options.studyInstanceUID - Study Instance UID of DICOM
   * Parametric Map instances
   * @param {string} options.seriesInstanceUID - Series Instance UID of DICOM
   * Parametric Map instances
   * @param {string[]} options.sopInstanceUIDs - SOP Instance UIDs of DICOM
   * Parametric Map instances
   * @param {string|undefined} options.paletteColorLookupTableUID - Palette
   * Color Lookup Table UID
   */
  constructor ({
    uid,
    number,
    label,
    description,
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUIDs,
    paletteColorLookupTableUID
  }) {
    this[_attrs] = {}
    if (uid === undefined) {
      throw new Error('Unique Tracking Identifier is required.')
    } else {
      this[_attrs].uid = uid
    }

    if (number === undefined) {
      throw new Error('Parameter Number is required.')
    }
    this[_attrs].number = number

    if (label === undefined) {
      throw new Error('Parameter Label is required.')
    }
    this[_attrs].label = label

    if (description === undefined) {
      throw new Error('Parameter Description is required.')
    }
    this[_attrs].description = description

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
  get uid () {
    return this[_attrs].uid
  }

  /**
   * Parameter Number
   *
   * @type number
   */
  get number () {
    return this[_attrs].number
  }

  /**
   * Parameter Label
   *
   * @type string
   */
  get label () {
    return this[_attrs].label
  }

  /**
   * Parameter Description
   *
   * @type string
   */
  get description () {
    return this[_attrs].description
  }

  /**
   * Study Instance UID of DICOM Parametric Map instances.
   *
   * @type string
   */
  get studyInstanceUID () {
    return this[_attrs].studyInstanceUID
  }

  /**
   * Series Instance UID of DICOM Parametric Map instances.
   *
   * @type string
   */
  get seriesInstanceUID () {
    return this[_attrs].seriesInstanceUID
  }

  /**
   * SOP Instance UIDs of DICOM Parametric Map instances.
   *
   * @type string[]
   */
  get sopInstanceUIDs () {
    return this[_attrs].sopInstanceUIDs
  }

  /**
   * Palette Color Lookup Table UID.
   *
   * @type string
   */
  get paletteColorLookupTableUID () {
    return this[_attrs].paletteColorLookupTableUID
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
  ParameterMapping,
  Transformation
}
