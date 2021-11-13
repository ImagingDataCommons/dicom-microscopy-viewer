// Allocate decoders
import imageType from 'image-type'
import dcmjs from 'dcmjs'

let jpegDecoder
if (typeof libjpegturbowasm === 'function') {
  libjpegturbowasm().then(function (libjpegturbo) {// eslint-disable-line
    jpegDecoder = new libjpegturbo.JPEGDecoder()
    console.info('jpegDecoder initialized.')
  })
}

let jp2jpxDecoder
if (typeof OpenJPEGWASM === 'function') {
  OpenJPEGWASM().then(function (openjpegwasm) {// eslint-disable-line
    jp2jpxDecoder = new openjpegwasm.J2KDecoder()
    console.info('jp2jpxDecoder initialized.')
  })
}

let jlsDecoder
if (typeof Module === 'object') {
  Module.onRuntimeInitialized = async _ => {// eslint-disable-line
    jlsDecoder = new Module.JpegLSDecoder()// eslint-disable-line
    console.info('jlsDecoder initialized.')
  }
}

/** Engine for offscreen rendering of images
 *
 * @class
 * @memberof renderingEngine
 */

class RenderingEngine {
  decodeFrame ({
    frame,
    bitsAllocated,
    pixelRepresentation,
    columns,
    rows
  }) {
    const decodedFrame = this._checkImageTypeAndDecode(frame)

    // The OpenLayers WebGL API is able to handle uin8 or float32
    const signed = pixelRepresentation === 1
    let pixelArray
    let bitsPerSample
    switch (bitsAllocated) {
      case 1:
        pixelArray = dcmjs.data.BitArray.unpack(decodedFrame) // Uint8Array
        bitsPerSample = 8 // unpacked to 8-bit
        break
      case 8:
        if (signed) {
          pixelArray = new Float32Array(decodedFrame)
        } else {
          pixelArray = new Uint8Array(decodedFrame)
        }
        bitsPerSample = 8
        break
      case 16:
        if (signed) {
          pixelArray = new Float32Array(decodedFrame)
        } else {
          pixelArray = new Float32Array(decodedFrame)
        }
        bitsPerSample = 16
        break
      default:
        throw new Error(
          'The pixel bit depth ' + bitsAllocated +
          ' is not supported by the offscreen rendering.'
        )
    }

    return {
      pixelArray,
      bitsPerSample
    }
  }

  /** Check image type of a compressed array and returns a decoded image
   * NOTE: for png at the moment we don't have a library for decoding,
   *       undefined is returned.
   * @param {number[]} frames - buffer of the image array
   * @returns {obejct} image array, frameInfo and mediaType.
   * @private
   */
  _checkImageTypeAndDecode (frame) {
    const byteArray = new Uint8Array(frame)
    const imageTypeObject = imageType(byteArray)

    if (imageTypeObject === null) {
      return byteArray
    }
    const mediaType = imageTypeObject.mime

    let decodedFrame
    if (mediaType === 'image/jpeg') {
      if (!jpegDecoder) {
        throw new Error('JPEG decoder was not initialized.')
      }
      const { decodedPixelData } = this._decodeInternal(
        jpegDecoder,
        byteArray
      )
      decodedFrame = decodedPixelData.slice(0)
    } else if (mediaType === 'image/jp2' || mediaType === 'image/jpx') {
      if (!jp2jpxDecoder) {
        throw new Error('JPEG 2000 Decoder was not initialized.')
      }
      const { decodedPixelData } = this._decodeInternal(
        jp2jpxDecoder,
        byteArray
      )
      decodedFrame = decodedPixelData.slice(0)
    } else if (mediaType === 'image/jls') {
      if (!jlsDecoder) {
        throw new Error('JPEG-LS decoder was not initialized.')
      }
      const { decodedPixelData } = this._decodeInternal(
        jlsDecoder,
        byteArray
      )
      decodedFrame = decodedPixelData.slice(0)
    } else {
      throw new Error(
        'The media type ' + mediaType +
        ' is not supported by the offscreen rendering engine.'
      )
    }

    return decodedFrame
  }

  /** Returns decoded array
   *
   * @param {object} decoder - decoder to use
   * @param {number[]} fullEncodedBitStream - image array
   * @returns {object} decoded array and frameInfo
   * @private
   */
  _decodeInternal (decoder, fullEncodedBitStream) {
    const encodedBuffer = decoder.getEncodedBuffer(fullEncodedBitStream.length)
    encodedBuffer.set(fullEncodedBitStream)
    decoder.decode()
    return {
      decodedPixelData: decoder.getDecodedBuffer(),
      frameInfo: decoder.getFrameInfo()
    }
  }

  /** Returns the image type
   *
   * @param {number[]} pixelData - image array
   * @returns {string} image type
   * @private
   */
  _getImageDataType (pixelData) {
    if (pixelData instanceof Int16Array) {
      return 'int16'
    } else if (pixelData instanceof Uint16Array) {
      return 'uint16'
    } else if (pixelData instanceof Int8Array) {
      return 'int8'
    }
    return 'uint8'
  }
}

export {
  RenderingEngine
}
