import libjxlWasm from '@cornerstonejs/codec-libjxl/decodewasm'
import libjxlFactory from '@cornerstonejs/codec-libjxl/decodewasmjs'
import Decoder from './decoderAbstract.js'

/**
 * Whether the browser can decode JPEG XL. Unknown until the first native
 * decode; set to false only when the native decode fails and the WASM decode
 * of the same frame succeeds, so a corrupt frame does not disable it.
 */
let isNativeDecodeSupported =
  typeof createImageBitmap === 'function' &&
  typeof OffscreenCanvas === 'function'

export default class JPEGXLDecoder extends Decoder {
  _initialize() {
    if (this.codec) {
      return Promise.resolve()
    }

    const libjxlModule = libjxlFactory({
      locateFile: (f) => {
        if (f.endsWith('.wasm')) {
          return libjxlWasm
        }
        return f
      },
    })

    return new Promise((resolve, reject) => {
      libjxlModule.then((instance) => {
        this.codec = instance
        this.decoder = new instance.JpegXLDecoder()
        resolve()
      }, reject)
    })
  }

  /** Decode image.
   *
   * Uses the browser's native JPEG XL decoder (Chrome 155 and later) for
   * 8-bit frames, and the libjxl WASM decoder otherwise. The native decoder
   * returns RGBA without the channel count of the code stream, so the native
   * path reports the expected Samples per Pixel and keeps the first channel
   * of monochrome frames.
   *
   * @param {Uint8Array} byteArray - Image array
   * @param {object} [expected] - Expected frame attributes
   * @param {number} [expected.bitsAllocated] - Bits Allocated
   * @param {number} [expected.samplesPerPixel] - Samples per Pixel
   *
   * @returns {Promise<object>} decoded array and frame information
   */
  async decode(byteArray, expected = {}) {
    const { bitsAllocated, samplesPerPixel } = expected
    const canDecodeNatively =
      isNativeDecodeSupported &&
      bitsAllocated === 8 &&
      (samplesPerPixel === 1 || samplesPerPixel === 3)
    if (!canDecodeNatively) {
      return super.decode(byteArray)
    }

    try {
      return await _decodeNatively(byteArray, samplesPerPixel)
    } catch (nativeError) {
      const result = await super.decode(byteArray)
      isNativeDecodeSupported = false
      console.warn(
        'Native JPEG XL decode failed, using the WASM decoder',
        nativeError,
      )
      return result
    }
  }
}

/**
 * Decode a JPEG XL frame with createImageBitmap() and read back the samples.
 *
 * @param {Uint8Array} byteArray - JPEG XL code stream or container
 * @param {number} samplesPerPixel - 1 or 3
 * @returns {Promise<object>} decoded array and frame information
 * @private
 */
async function _decodeNatively(byteArray, samplesPerPixel) {
  const bitmap = await createImageBitmap(
    new Blob([byteArray], { type: 'image/jxl' }),
    /** The ICC transform of the DICOM data set applies later */
    { colorSpaceConversion: 'none', premultiplyAlpha: 'none' },
  )
  const { width, height } = bitmap
  const canvas = new OffscreenCanvas(width, height)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(bitmap, 0, 0)
  bitmap.close()
  const rgba = context.getImageData(0, 0, width, height).data

  const pixelCount = width * height
  const frameBuffer = new Uint8Array(pixelCount * samplesPerPixel)
  for (let i = 0, j = 0; i < pixelCount; i++, j += 4) {
    const offset = i * samplesPerPixel
    frameBuffer[offset] = rgba[j]
    if (samplesPerPixel === 3) {
      frameBuffer[offset + 1] = rgba[j + 1]
      frameBuffer[offset + 2] = rgba[j + 2]
    }
  }

  return {
    frameBuffer,
    frameInfo: {
      width,
      height,
      bitsPerSample: 8,
      componentCount: samplesPerPixel,
      isSigned: false,
    },
  }
}
