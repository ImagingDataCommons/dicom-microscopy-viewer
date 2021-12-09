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

function _castToFloat32Array ({
  frame,
  bitsAllocated,
  pixelRepresentation,
  rows,
  columns,
  samplesPerPixel
}) {
  if (bitsAllocated === 8) {
    const buf = new Uint8Array(
      frame.buffer,
      frame.byteOffset,
      frame.byteLength
    )
    return new Float32Array(
      buf,
      buf.byteOffset,
      buf.byteLength
    )
  } else if (bitsAllocated === 16) {
    let buf
    if (pixelRepresentation === 1) {
      buf = new Int16Array(
        frame.buffer,
        frame.byteOffset,
        frame.byteLength / 2
      )
    } else {
      buf = new Uint16Array(
        frame.buffer,
        frame.byteOffset,
        frame.byteLength / 2
      )
    }
    return new Float32Array(
      buf,
      buf.byteOffset,
      buf.byteLength / 2
    )
  } else if (bitsAllocated === 32) {
    return new Float32Array(
      frame.buffer,
      frame.byteOffset,
      frame.byteLength / 4
    )
  } else {
    // TODO: check whether data would fit into Float32Array
    throw new Error('Double Float Pixel Data are not (yet) supported.')
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
    rows,
    samplesPerPixel
  }) {
    const { decodedFrame, metadata } = this._checkImageTypeAndDecode(frame)

    if (metadata.bitsAllocated !== bitsAllocated) {
      throw new Error('Frame does not have expected Bits Allocated.')
    }
    if (metadata.rows !== rows) {
      throw new Error('Frame does not have expected Rows.')
    }
    if (metadata.columns !== columns) {
      throw new Error('Frame does not have expected Columns.')
    }
    if (metadata.samplesPerPixel !== samplesPerPixel) {
      throw new Error('Frame does not have expected Samples Per Pixel.')
    }
    if (metadata.pixelRepresentation !== pixelRepresentation) {
      throw new Error('Frame does not have expected Pixel Representation.')
    }

    const length = rows * columns * samplesPerPixel * (bitsAllocated / 8)
    if (length !== decodedFrame.length) {
      throw new Error('Frame value does not have expected length.')
    }

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
          pixelArray = new Int8Array(decodedFrame)
        } else {
          pixelArray = new Uint8Array(decodedFrame)
        }
        bitsPerSample = 8
        break
      case 16:
        if (pixelRepresentation === 1) {
          pixelArray = new Int16Array(
            decodedFrame.buffer,
            decodedFrame.byteOffset,
            decodedFrame.byteLength / 2
          )
        } else {
          pixelArray = new Uint16Array(
            decodedFrame.buffer,
            decodedFrame.byteOffset,
            decodedFrame.byteLength / 2
          )
        }
        bitsPerSample = 16
        break
      case 32:
        pixelArray = new Float32Array(
          decodedFrame.buffer,
          decodedFrame.byteOffset,
          decodedFrame.byteLength / 4
        )
        bitsPerSample = 32
        break
      case 64:
        pixelArray = new Float64Array(
          decodedFrame.buffer,
          decodedFrame.byteOffset,
          decodedFrame.byteLength / 8
        )
        bitsPerSample = 64
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

    let decoder
    if (mediaType === 'image/jpeg') {
      if (!jpegDecoder) {
        throw new Error('JPEG decoder was not initialized.')
      }
      decoder = jpegDecoder
    } else if (mediaType === 'image/jp2' || mediaType === 'image/jpx') {
      if (!jp2jpxDecoder) {
        throw new Error('JPEG 2000 Decoder was not initialized.')
      }
      decoder = jp2jpxDecoder
    } else if (mediaType === 'image/jls') {
      if (!jlsDecoder) {
        throw new Error('JPEG-LS decoder was not initialized.')
      }
      decoder = jlsDecoder
    } else {
      throw new Error(
        'The media type ' + mediaType +
        ' is not supported by the offscreen rendering engine.'
      )
    }

    const { frameBuffer, frameInfo } = this._decodeInternal(decoder, byteArray)

    return {
      decodedFrame: frameBuffer,
      metadata: {
        bitsAllocated: frameInfo.bitsPerSample,
        rows: frameInfo.height,
        columns: frameInfo.width,
        samplesPerPixel: frameInfo.componentCount,
        pixelRepresentation: frameInfo.isSigned ? 1 : 0
      }
    }
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
      frameBuffer: decoder.getDecodedBuffer(),
      frameInfo: decoder.getFrameInfo()
    }
  }
}

export {
  RenderingEngine
}
