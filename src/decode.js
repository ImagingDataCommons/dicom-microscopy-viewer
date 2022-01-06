// Allocate decoders
import imageType from 'image-type'
import dcmjs from 'dcmjs'
// import libjpegturbowasm from '@cornerstone/codec-libjpeg-turbo/dist/libjpegturbowasm.js'
// import OpenJPEGWASM from '@cornerstone/codec-openjpeg/dist/openjpegwasm.js'
// import CharLSWASM from '@cornerstone/codec-charls/dist/charlswasm.js'

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
if (typeof CharLSWASM === 'function') {
  CharLSWASM().then(function (charlswasm) {// eslint-disable-line
    jlsDecoder = new charlswasm.JpegLSDecoder()
    console.info('jlsDecoder initialized.')
  })
}

function decodeFrame ({
  frame,
  bitsAllocated,
  pixelRepresentation,
  columns,
  rows,
  samplesPerPixel
}) {
  const { decodedFrame, metadata } = _checkImageTypeAndDecode({
    frame,
    bitsAllocated,
    pixelRepresentation,
    columns,
    rows,
    samplesPerPixel
  })

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
function _checkImageTypeAndDecode ({
  frame,
  bitsAllocated,
  pixelRepresentation,
  columns,
  rows,
  samplesPerPixel
}) {
  const byteArray = new Uint8Array(frame)
  const imageTypeObject = imageType(byteArray)

  if (imageTypeObject === null) {
    return {
      decodedFrame: byteArray,
      metadata: {
        bitsAllocated: bitsAllocated,
        rows: rows,
        columns: columns,
        samplesPerPixel: samplesPerPixel,
        pixelRepresentation: pixelRepresentation
      }
    }
  }

  function toHex (value) {
    return value.toString(16).padStart(2, '0').toUpperCase()
  }

  /**
   * This hack is required to distinguish JPEG-LS from baseline JPEG, which
   * both contain the JPEG Start of Image (SOI) marker and share the first
   * three bytes.
   */
  let mediaType = imageTypeObject.mime
  if ((toHex(byteArray[3]) === 'F7') || (toHex(byteArray[3]) === 'E8')) {
    mediaType = 'image/jls'
  }

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

  const { frameBuffer, frameInfo } = _decodeImage(decoder, byteArray)

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

/** Decode image.
 *
 * @param {object} decoder - Decoder
 * @param {Uint8Array} byteArray - Image array
 *
 * @returns {object} decoded array and frameInfo
 * @private
 */
function _decodeImage (decoder, byteArray) {
  const encodedBuffer = decoder.getEncodedBuffer(byteArray.length)
  encodedBuffer.set(byteArray)
  decoder.decode()
  return {
    frameBuffer: decoder.getDecodedBuffer(),
    frameInfo: decoder.getFrameInfo()
  }
}

export {
  decodeFrame
}
