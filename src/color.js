import colormap from 'colormap'

import { generateUID } from './utils.js'

const _attrs = Symbol('attrs')

const ColorMaps = {
  VIRIDIS: 'VIRIDIS',
  INFERNO: 'INFERNO',
  MAGMA: 'MAGMA',
  GRAY: 'GRAY',
  BLUE_RED: 'BLUE_RED',
  PHASE: 'PHASE',
  PORTLAND: 'PORTLAND',
  HOT: 'HOT'
}
Object.freeze(ColorMaps)

/** Create a color map.
 *
 * @param {object} options
 * @param {string} options.name - Name of the color map
 * @param {string} options.bins - Number of color bins
 *
 * @returns {number[][]} RGB triplet for each color
 */
function createColorMap ({ name, bins }) {
  const lut = {
    INFERNO: ['inferno', false],
    MAGMA: ['magma', false],
    VIRIDIS: ['viridis', false],
    GRAY: ['greys', false],
    BLUE_RED: ['RdBu', false],
    PHASE: ['phase', true],
    PORTLAND: ['portland', false],
    HOT: ['HOT', false]
  }
  const params = lut[name]
  if (params === undefined) {
    throw new Error(`Unknown colormap "${name}".`)
  }

  const internalName = params[0]
  const reverse = params[1]
  const colors = colormap({
    colormap: internalName,
    nshades: bins,
    format: 'rgb'
  })
  if (reverse) {
    return colors.reverse()
  }
  return colors
}

/**
 * Build a color ramp.
 *
 * @param {object} options
 * @param {number[][]} options.colormap - RGB triplet for each color
 * @param {number} options.min - Mininum value of the input data range
 * @param {number} options.max - Maximum value of the input data range
 *
 * @returns {number[][]} Interleaved values of the input data and RGB color triplets
 */
function _buildColorRamp ({ colormap, min, max }) {
  const steps = colormap.length
  const delta = (max - min) / (steps - 1)
  const table = new Array(steps * 2)
  for (let i = 0; i < steps; i++) {
    table[i * 2] = min + i * delta
    table[i * 2 + 1] = colormap[i]
  }
  return table
}

/**
 * Build a palette color lookup table.
 *
 * @param {object} options
 * @param {number[][]} options.colormap - RGB triplet for each color
 * @param {number} options.min - Mininum value of the input data range
 * @param {number} options.max - Maximum value of the input data range
 *
 * @returns {PaletteColorLookupTable} Mapping of grayscale pixel values to RGB color triplets
 */
function _buildPaletteColorLookupTable ({
  colormap,
  firstValueMapped,
  bitsPerEntry
}) {
  const numberOfEntries = colormap.length

  let Type = Uint16Array
  if (bitsPerEntry === 8) {
    Type = Uint8Array
  }
  const redData = new Type(numberOfEntries)
  const greenData = new Type(numberOfEntries)
  const blueData = new Type(numberOfEntries)
  for (let i = 0; i < numberOfEntries; i++) {
    redData[i] = colormap[i][0]
    greenData[i] = colormap[i][1]
    blueData[i] = colormap[i][2]
  }

  const descriptor = [numberOfEntries, firstValueMapped, bitsPerEntry]

  return new PaletteColorLookupTable({
    uid: generateUID(),
    redDescriptor: descriptor,
    greenDescriptor: descriptor,
    blueDescriptor: descriptor,
    redData,
    greenData,
    blueData
  })
}

function _expandSegmentedLUTData (segmentedData, numberOfEntries) {
  const lut = new Uint8Array(numberOfEntries)
  let offset = 0
  for (let i = 0; i < segmentedData.length; i++) {
    const opcode = segmentedData[i++]
    if (opcode === 0) {
      // Discrete
      const length = segmentedData[i++]
      const value = segmentedData[i]
      for (let j = offset; j < (offset + length); j++) {
        lut[j] = value
      }
    } else if (opcode === 1) {
      // Linear (interpolation)
      const length = segmentedData[i++]
      const endpoint = segmentedData[i]
      const startpoint = lut[offset]
      const step = (endpoint - startpoint) / length
      for (let j = offset; j < (offset + length); j++) {
        lut[j] = lut[j - 1] + step
      }
      offset += length
    } else if (opcode === 2) {
      throw new Error(
        'Indirect segment type is not yet supported for ' +
        'Segmented Palette Color Lookup Table.'
      )
    } else {
      throw new Error(
        'Encountered unexpected segment type is not yet supported for ' +
        'Segmented Palette Color Lookup Table.'
      )
    }
  }
  return lut
}

/**
 * A Palette Color Lookup Table
 */
class PaletteColorLookupTable {
  /**
   * Create a new PaletteColorLookupTable object.
   */
  constructor ({
    uid,
    redDescriptor,
    greenDescriptor,
    blueDescriptor,
    redData,
    greenData,
    blueData,
    redSegmentedData,
    greenSegmentedData,
    blueSegmentedData
  }) {
    this[_attrs] = { uid }

    // Number of entries in the LUT data
    const firstDescriptorValues = new Set([
      redDescriptor[0],
      greenDescriptor[0],
      blueDescriptor[0]
    ])
    if (firstDescriptorValues.size !== 1) {
      throw new Error(
        'First value of red, green, and blue LUT descriptors must be the same.'
      )
    }
    const n = [...firstDescriptorValues][0]
    if (n === 0) {
      this[_attrs].numberOfEntries = Math.pow(2, 16)
    } else {
      this[_attrs].numberOfEntries = n
    }

    // Pixel value mapped to the first entry in the LUT data
    const secondDescriptorValues = new Set([
      redDescriptor[1],
      greenDescriptor[1],
      blueDescriptor[1]
    ])
    if (secondDescriptorValues.size !== 1) {
      throw new Error(
        'Second value of red, green, and blue LUT descriptors must be the same.'
      )
    }
    this[_attrs].firstValueMapped = [...secondDescriptorValues][0]

    // Number of bits for each entry in the LUT Data
    const thirdDescriptorValues = new Set([
      redDescriptor[2],
      greenDescriptor[2],
      blueDescriptor[2]
    ])
    if (thirdDescriptorValues.size !== 1) {
      throw new Error(
        'Third value of red, green, and blue LUT descriptors must be the same.'
      )
    }
    this[_attrs].bitsPerEntry = [...thirdDescriptorValues][0]
    if (this[_attrs].bitsPerEntry !== 8) {
      throw new Error(
        'Third value of red, green, and blue LUT descriptors must be 8. ' +
        '16-bit color values are not supported.'
      )
    }
    const DataType = Uint8Array

    if (redSegmentedData) {
      this[_attrs].redLUT = _expandSegmentedLUTData(
        redSegmentedData,
        this[_attrs].numberOfEntries
      )
    } else {
      if (redData.length !== this[_attrs].numberOfEntries) {
        throw new Error('Red LUT data has wrong number of entries.')
      }
      if (redData == null) {
        throw new Error('Red LUT data has not been provided.')
      }
      this[_attrs].redLUT = new DataType(redData)
    }

    if (greenSegmentedData) {
      this[_attrs].greenLUT = _expandSegmentedLUTData(
        greenSegmentedData,
        this[_attrs].numberOfEntries
      )
    } else {
      if (greenData.length !== this[_attrs].numberOfEntries) {
        throw new Error('Green LUT data has wrong number of entries.')
      }
      if (greenData == null) {
        throw new Error('Green LUT data has not been provided.')
      }
      this[_attrs].greenLUT = new DataType(greenData)
    }

    if (blueSegmentedData) {
      this[_attrs].blueLUT = _expandSegmentedLUTData(
        blueSegmentedData,
        this[_attrs].numberOfEntries
      )
    } else {
      if (blueData.length !== this[_attrs].numberOfEntries) {
        throw new Error('Green LUT data has wrong number of entries.')
      }
      if (blueData == null) {
        throw new Error('Blue LUT data has not been provided.')
      }
      this[_attrs].blueLUT = new DataType(blueData)
    }

    this[_attrs].entries = new Array(this[_attrs].numberOfEntries)
    for (let i = 0; i < this[_attrs].numberOfEntries; i++) {
      this[_attrs].entries[i] = [
        this[_attrs].redLUT[i],
        this[_attrs].greenLUT[i],
        this[_attrs].blueLUT[i]
      ]
    }
  }

  /**
   * Get Palette Color Lookup Table UID
   *
   * @returns {string} Palette Color Lookup Table UID
   */
  get uid () {
    return this[_attrs].uid
  }

  get entries () {
    return this[_attrs].entries
  }

  get bitsPerEntry () {
    return this[_attrs].bitsPerEntry
  }

  get numberOfEntries () {
    return this[_attrs].numberOfEntries
  }

  get firstValueMapped () {
    return this[_attrs].firstValueMapped
  }
}

export {
  ColorMaps,
  createColorMap,
  PaletteColorLookupTable,
  _buildColorRamp,
  _buildPaletteColorLookupTable
}
