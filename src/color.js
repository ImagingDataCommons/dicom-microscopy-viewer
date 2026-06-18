import colormap from 'colormap'

import { _generateUID, rescale } from './utils.js'

const _attrs = Symbol('attrs')

/**
 * Normalize Palette Color Lookup Table Data to a typed array whose element
 * size matches the number of bits per entry declared in the LUT descriptor.
 *
 * The Palette Color Lookup Table Data attributes have VR OW, so 8-bit LUT
 * entries are byte-packed inside 16-bit words. Depending on how the dataset is
 * retrieved and parsed, the data may reach us as a raw ArrayBuffer (e.g. from
 * `dcmjs.data.DicomMessage.readFile`), as a typed array whose element size
 * reflects the VR rather than the descriptor (e.g. a Uint16Array produced for
 * an OW element that actually holds 8-bit entries), or as a plain array of
 * per-entry numbers (e.g. from a US element in DICOM JSON). The descriptor's
 * third value is authoritative for the element size, so reinterpret the
 * underlying bytes accordingly instead of trusting the source element size.
 *
 * @param {ArrayBuffer|Uint8Array|Uint16Array|number[]} data - LUT data
 * @param {Uint8ArrayConstructor|Uint16ArrayConstructor} DataType - Typed array
 * constructor implied by the bits per entry (Uint8Array for 8, Uint16Array for
 * 16)
 *
 * @returns {Uint8Array|Uint16Array|undefined} LUT data with the correct
 * element size
 *
 * @private
 */
function _normalizeLUTData(data, DataType) {
  if (data == null) {
    return undefined
  }
  if (data instanceof ArrayBuffer) {
    return new DataType(data)
  }
  if (ArrayBuffer.isView(data)) {
    // Reinterpret the underlying bytes so that the element size matches the
    // descriptor rather than the source typed array's element size.
    return new DataType(
      data.buffer,
      data.byteOffset,
      data.byteLength / DataType.BYTES_PER_ELEMENT,
    )
  }
  // Plain array of per-entry numbers: copy element-wise.
  return new DataType(data)
}

/**
 * Normalize Segmented Palette Color Lookup Table Data to a Uint16Array.
 *
 * Segmented LUT Data has VR OW and is composed of 16-bit segment opcodes and
 * values, so it must always be interpreted as 16-bit words regardless of how
 * it was delivered.
 *
 * @param {ArrayBuffer|Uint8Array|Uint16Array|number[]} data - Segmented LUT data
 *
 * @returns {Uint16Array|undefined} Segmented LUT data as 16-bit words
 *
 * @private
 */
function _normalizeSegmentedLUTData(data) {
  if (data == null) {
    return undefined
  }
  if (data instanceof Uint16Array) {
    return data
  }
  if (data instanceof ArrayBuffer) {
    return new Uint16Array(data)
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint16Array(data.buffer, data.byteOffset, data.byteLength / 2)
  }
  return Uint16Array.from(data)
}

/**
 * Enumerated values for color map names.
 *
 * @memberof color
 */
const ColormapNames = {
  VIRIDIS: 'VIRIDIS',
  INFERNO: 'INFERNO',
  MAGMA: 'MAGMA',
  GRAY: 'GRAY',
  BLUE_RED: 'BLUE_RED',
  PHASE: 'PHASE',
  PORTLAND: 'PORTLAND',
  HOT: 'HOT',
}
Object.freeze(ColormapNames)

/**
 * Create a color map.
 *
 * @param {Object} options
 * @param {string} options.name - Name of the color map
 * @param {string} options.bins - Number of color bins
 *
 * @returns {number[][]} RGB triplet for each color
 *
 * @memberof color
 */
function createColormap({ name, bins }) {
  const lut = {
    INFERNO: ['inferno', false],
    MAGMA: ['magma', false],
    VIRIDIS: ['viridis', false],
    GRAY: ['greys', false],
    BLUE_RED: ['RdBu', false],
    PHASE: ['phase', true],
    PORTLAND: ['portland', false],
    HOT: ['HOT', false],
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
    format: 'rgb',
  })
  if (reverse) {
    return colors.reverse()
  }
  return colors
}

/**
 * Perceptually separated base hues (in degrees) used to colorize distinct
 * overlays (fractional segments, parametric maps). The first entries are hand
 * ordered so that the most common cases (2-6 overlays) get maximally
 * distinguishable, easy-to-name colors; beyond the list we fall back to the
 * golden-angle so an arbitrary number of overlays stays well separated.
 */
const DISTINCT_BASE_HUES = [
  0, // red
  210, // azure / blue
  130, // green
  35, // orange
  280, // purple
  175, // teal
  320, // magenta / pink
  55, // yellow
  245, // indigo
  150, // spring green
]
const GOLDEN_ANGLE_DEGREES = 137.508

/**
 * Convert an HSV color to an RGB triplet (each channel 0-255).
 *
 * @param {number} h - Hue in degrees [0, 360)
 * @param {number} s - Saturation [0, 1]
 * @param {number} v - Value / brightness [0, 1]
 *
 * @returns {number[]} `[r, g, b]` with each channel in [0, 255]
 */
function hsvToRgb(h, s, v) {
  const c = v * s
  const hPrime = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hPrime % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (hPrime < 1) {
    r = c
    g = x
  } else if (hPrime < 2) {
    r = x
    g = c
  } else if (hPrime < 3) {
    g = c
    b = x
  } else if (hPrime < 4) {
    g = x
    b = c
  } else if (hPrime < 5) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  const m = v - c
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]
}

/**
 * Create a perceptually distinct, single-hue color map for one overlay.
 *
 * Unlike the multi-hue scientific color maps (viridis, magma, inferno, hot,
 * …) which all share a dark-purple → bright-yellow ramp and are therefore hard
 * to tell apart and to match against a legend, this produces a ramp within a
 * single, well-separated base hue (dark → saturated). Two overlays created
 * with different `index` values are easy to distinguish at a glance and each
 * legend bar maps unambiguously to its overlay. See
 * https://github.com/ImagingDataCommons/dicom-microscopy-viewer/issues/240.
 *
 * @param {Object} options
 * @param {number} options.index - Zero-based index of the overlay; selects the hue
 * @param {number} options.bins - Number of color bins
 *
 * @returns {number[][]} RGB triplet for each color (low value → high value)
 *
 * @memberof color
 */
function createDistinctColormap({ index, bins }) {
  if (!Number.isInteger(bins) || bins <= 0) {
    throw new Error('Argument "bins" must be a positive integer.')
  }
  const safeIndex = Number.isInteger(index) && index >= 0 ? index : 0
  const hue =
    safeIndex < DISTINCT_BASE_HUES.length
      ? DISTINCT_BASE_HUES[safeIndex]
      : (safeIndex * GOLDEN_ANGLE_DEGREES) % 360

  const colors = new Array(bins)
  for (let i = 0; i < bins; i++) {
    const t = bins === 1 ? 1 : i / (bins - 1)
    /**
     * Encode the value as brightness within the fixed hue: low values stay
     * dark (so low-probability regions recede) and high values reach the
     * fully saturated, easily named hue.
     */
    const value = 0.2 + 0.8 * t
    const saturation = 1 - 0.15 * t
    colors[i] = hsvToRgb(hue, saturation, value)
  }
  return colors
}

/**
 * Build a palette color lookup table object from a colormap.
 *
 * @param {Object} options
 * @param {number[][]} options.data - Array of RGB triplets for each color
 * @param {number} options.firstValueMapped - First value that should be mapped
 *
 * @returns {color.PaletteColorLookupTable} Mapping of grayscale pixel values to RGB color triplets
 *
 * @memberof color
 */
function buildPaletteColorLookupTable({ data, firstValueMapped }) {
  if (data == null) {
    throw new Error(
      'Argument "data" is required for building Palette Color Lookup Table.',
    )
  }
  if (firstValueMapped == null) {
    throw new Error(
      'Argument "firstValueMapped" is required for building ' +
        'Palette Color Lookup Table.',
    )
  }

  const numberOfEntries = data.length

  const Type = Uint8Array
  const redData = new Type(numberOfEntries)
  const greenData = new Type(numberOfEntries)
  const blueData = new Type(numberOfEntries)
  for (let i = 0; i < numberOfEntries; i++) {
    redData[i] = data[i][0]
    greenData[i] = data[i][1]
    blueData[i] = data[i][2]
  }

  const descriptor = [numberOfEntries, firstValueMapped, 8]

  return new PaletteColorLookupTable({
    uid: _generateUID(),
    redDescriptor: descriptor,
    greenDescriptor: descriptor,
    blueDescriptor: descriptor,
    redData,
    greenData,
    blueData,
  })
}

/**
 * A Palette Color Lookup Table
 *
 * @class
 * @memberof color
 */
class PaletteColorLookupTable {
  /**
   * @param {Object} options
   * @param {string} options.uid - UID
   * @param {number[]} options.redDescriptor - Red LUT descriptor
   * @param {number[]} options.greenDescriptor - Green LUT descriptor
   * @param {number[]} options.blueDescriptor - Blue LUT descriptor
   * @param {Uint8Array|Uint16Array} options.redData - Red LUT data
   * @param {Uint8Array|Uint16Array} options.greenData - Green LUT data
   * @param {Uint8Array|Uint16Array} options.blueData - Blue LUT data
   * @param {Uint8Array|Uint16Array} options.redSegmentedData - Red segmented LUT data
   * @param {Uint8Array|Uint16Array} options.greenSegmentedData - Green segmented LUT data
   * @param {Uint8Array|Uint16Array} options.blueSegmentedData - Blue segmented LUT data
   */
  constructor({
    uid,
    redDescriptor,
    greenDescriptor,
    blueDescriptor,
    redData,
    greenData,
    blueData,
    redSegmentedData,
    greenSegmentedData,
    blueSegmentedData,
  }) {
    this[_attrs] = { uid }

    // Number of entries in the LUT data
    const firstDescriptorValues = new Set([
      redDescriptor[0],
      greenDescriptor[0],
      blueDescriptor[0],
    ])
    if (firstDescriptorValues.size !== 1) {
      throw new Error(
        'First value of Red, Green, and Blue Palette Color Lookup Table ' +
          'Descriptor must be the same.',
      )
    }
    const n = [...firstDescriptorValues][0]
    if (n === 0) {
      this[_attrs].numberOfEntries = 2 ** 16
    } else {
      this[_attrs].numberOfEntries = n
    }

    // Pixel value mapped to the first entry in the LUT data
    const secondDescriptorValues = new Set([
      redDescriptor[1],
      greenDescriptor[1],
      blueDescriptor[1],
    ])
    if (secondDescriptorValues.size !== 1) {
      throw new Error(
        'Second value of Red, Green, and Blue Palette Color Lookup Table ' +
          'Descriptor must be the same.',
      )
    }
    this[_attrs].firstValueMapped = [...secondDescriptorValues][0]

    // Number of bits for each entry in the LUT Data
    const thirdDescriptorValues = new Set([
      redDescriptor[2],
      greenDescriptor[2],
      blueDescriptor[2],
    ])
    if (thirdDescriptorValues.size !== 1) {
      throw new Error(
        'Third value of Red, Green, and Blue Palette Color Lookup Table ' +
          'Descriptor must be the same.',
      )
    }
    this[_attrs].bitsPerEntry = [...thirdDescriptorValues][0]
    if ([8, 16].indexOf(this[_attrs].bitsPerEntry) < 0) {
      throw new Error(
        'Third value of Red, Green, and Blue Palette Color Lookup Table ' +
          'Descriptor must be either ' +
          '8 or 16.',
      )
    }

    if (this[_attrs].bitsPerEntry === 8) {
      this[_attrs].DataType = Uint8Array
    } else {
      this[_attrs].DataType = Uint16Array
    }

    // Interpret the LUT data using the element size implied by the descriptor
    // (bits per entry) rather than the source representation, which may differ
    // (e.g. 8-bit entries byte-packed inside an OW/Uint16Array).
    redData = _normalizeLUTData(redData, this[_attrs].DataType)
    greenData = _normalizeLUTData(greenData, this[_attrs].DataType)
    blueData = _normalizeLUTData(blueData, this[_attrs].DataType)
    redSegmentedData = _normalizeSegmentedLUTData(redSegmentedData)
    greenSegmentedData = _normalizeSegmentedLUTData(greenSegmentedData)
    blueSegmentedData = _normalizeSegmentedLUTData(blueSegmentedData)

    if (redSegmentedData != null && redData != null) {
      throw new Error(
        'Either Segmented Red Palette Color Lookup Data or Red Palette ' +
          'Color Lookup Data should be provided, but not both.',
      )
    } else if (redSegmentedData == null && redData == null) {
      throw new Error(
        'Either Segmented Red Palette Color Lookup Data or Red Palette ' +
          'Color Lookup Data must be provided.',
      )
    }
    if (redData) {
      if (redData.length !== this[_attrs].numberOfEntries) {
        throw new Error(
          'Red Palette Color Lookup Table Data has wrong number of entries.',
        )
      }
    }
    this[_attrs].redSegmentedData = redSegmentedData
    this[_attrs].redData = redData

    if (greenSegmentedData != null && greenData != null) {
      throw new Error(
        'Either Segmented Green Palette Color Lookup Data or Green Palette ' +
          'Color Lookup Data should be provided, but not both.',
      )
    } else if (greenSegmentedData == null && greenData == null) {
      throw new Error(
        'Either Segmented Green Palette Color Lookup Data or Green ' +
          'Palette Color Lookup Data must be provided.',
      )
    }
    if (greenData) {
      if (greenData.length !== this[_attrs].numberOfEntries) {
        throw new Error(
          'Green Palette Color Lookup Table Data has wrong number of entries.',
        )
      }
    }
    this[_attrs].greenSegmentedData = greenSegmentedData
    this[_attrs].greenData = greenData

    if (blueSegmentedData != null && blueData != null) {
      throw new Error(
        'Either Segmented Blue Palette Color Lookup Data or Blue Palette ' +
          'Color Lookup Data must be provided, but not both.',
      )
    } else if (blueSegmentedData == null && blueData == null) {
      throw new Error(
        'Either Segmented Blue Palette Color Lookup Data or Blue Palette ' +
          'Color Lookup Data must be provided.',
      )
    }
    if (blueData) {
      if (blueData.length !== this[_attrs].numberOfEntries) {
        throw new Error(
          'Blue Palette Color Lookup Table Data has wrong number of entries.',
        )
      }
    }
    this[_attrs].blueSegmentedData = blueSegmentedData
    this[_attrs].blueData = blueData

    // Will be used to cache created colormap for repeated access
    this[_attrs].data = null

    Object.freeze(this)
  }

  _expandSegmentedLUTData(segmentedData) {
    const lut = new this[_attrs].DataType(this[_attrs].numberOfEntries)
    let offset = 0
    for (let i = 0; i < segmentedData.length; i++) {
      const opcode = segmentedData[i++]
      if (opcode === 0) {
        // Discrete
        const length = segmentedData[i++]
        const value = segmentedData[i]
        for (let j = offset; j < offset + length; j++) {
          lut[j] = value
        }
        offset += length
      } else if (opcode === 1) {
        // Linear (interpolation)
        const length = segmentedData[i++]
        const endpoint = segmentedData[i]
        const startpoint = lut[offset - 1]
        const step = (endpoint - startpoint) / (length - 1)
        for (let j = 0; j < length; j++) {
          const value = startpoint + Math.round(j * step)
          lut[offset + j] = value
        }
        offset += length
      } else if (opcode === 2) {
        // TODO
        throw new Error(
          'Indirect segment type is not yet supported for ' +
            'Segmented Palette Color Lookup Table.',
        )
      } else {
        throw new Error(
          'Encountered unexpected segment type is not yet supported for ' +
            'Segmented Palette Color Lookup Table.',
        )
      }
    }
    return lut
  }

  /**
   * Palette Color Lookup Table UID
   *
   * @type string
   */
  get uid() {
    return this[_attrs].uid
  }

  /**
   * Palette Color Lookup Table Data.
   *
   * RGB color triplet for each value mapped.
   *
   * @type number[][]
   */
  get data() {
    if (this[_attrs].data == null) {
      const redLUT = this[_attrs].redData
        ? new this[_attrs].DataType(this[_attrs].redData)
        : this._expandSegmentedLUTData(this[_attrs].redSegmentedData)
      const greenLUT = this[_attrs].greenData
        ? new this[_attrs].DataType(this[_attrs].greenData)
        : this._expandSegmentedLUTData(this[_attrs].greenSegmentedData)
      const blueLUT = this[_attrs].blueData
        ? new this[_attrs].DataType(this[_attrs].blueData)
        : this._expandSegmentedLUTData(this[_attrs].blueSegmentedData)
      const uniqueNumberOfEntries = new Set([
        redLUT.length,
        greenLUT.length,
        blueLUT.length,
      ])
      if (uniqueNumberOfEntries.size > 1) {
        throw new Error(
          'Red, Green, and Blue Palette Color Lookup Tables ' +
            'must have the same size.',
        )
      }

      const maxValues = [
        Math.max(...redLUT),
        Math.max(...greenLUT),
        Math.max(...blueLUT),
      ]
      const maxInput = Math.max(...maxValues)
      const maxOutput = 255

      // Apply gamma correction to compensate for display gamma (brightens mid-tones)
      // When a linear intensity value i (0 to 1) is looked up, we actually want to look up
      // the color at position i^gamma where gamma = 1/2.2 ≈ 0.4545
      // This pre-brightens the colors for mid-tones
      const gammaInverse = 1.0 / 2.2 // ≈ 0.4545

      if (this[_attrs].bitsPerEntry === 16 && maxInput > 255) {
        /*
         * Only palettes with 256 entries and 8 bit per entry are supported for
         * display.  Therefore, data need to rescaled and resampled.
         */
        const n = 256
        this[_attrs].data = new Array(n)
        for (let i = 0; i < n; i++) {
          // Apply gamma correction: for palette position i, look up the color
          // that would be at the gamma-corrected position
          const normalizedPos = i / (n - 1)
          const gammaCorrectedPos = normalizedPos ** gammaInverse
          const lutIndex = Math.round(
            gammaCorrectedPos * (this[_attrs].numberOfEntries - 1),
          )

          this[_attrs].data[i] = [
            Math.round(rescale(redLUT[lutIndex], 0, maxInput, 0, maxOutput)),
            Math.round(rescale(greenLUT[lutIndex], 0, maxInput, 0, maxOutput)),
            Math.round(rescale(blueLUT[lutIndex], 0, maxInput, 0, maxOutput)),
          ]
        }
      } else {
        this[_attrs].data = new Array(this[_attrs].numberOfEntries)
        for (let i = 0; i < this[_attrs].numberOfEntries; i++) {
          // Apply gamma correction: for palette position i, look up the color
          // that would be at the gamma-corrected position
          const normalizedPos = i / (this[_attrs].numberOfEntries - 1)
          const gammaCorrectedPos = normalizedPos ** gammaInverse
          const lutIndex = Math.round(
            gammaCorrectedPos * (this[_attrs].numberOfEntries - 1),
          )

          this[_attrs].data[i] = [
            redLUT[lutIndex],
            greenLUT[lutIndex],
            blueLUT[lutIndex],
          ]
        }
      }
    }
    return this[_attrs].data
  }

  /**
   * First value mapped
   *
   * @type number
   */
  get firstValueMapped() {
    return this[_attrs].firstValueMapped
  }
}

export {
  ColormapNames,
  createColormap,
  createDistinctColormap,
  PaletteColorLookupTable,
  buildPaletteColorLookupTable,
}
