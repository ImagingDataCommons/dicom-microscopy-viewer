import imageType from 'image-type'
import dcmjs from 'dcmjs'

const decodeFrame = ({
  decoders,
  transformers,
  frame,
  bitsAllocated,
  pixelRepresentation,
  columns,
  rows,
  samplesPerPixel,
  sopInstanceUID
}) => {
  const { decodedFrame, frameInfo } = _checkImageTypeAndDecode({
    decoders,
    frame,
    bitsAllocated,
    pixelRepresentation,
    columns,
    rows,
    samplesPerPixel
  })

  if (frameInfo.bitsAllocated !== bitsAllocated) {
    throw new Error('Frame does not have expected Bits Allocated.')
  }
  if (frameInfo.rows !== rows) {
    throw new Error('Frame does not have expected Rows.')
  }
  if (frameInfo.columns !== columns) {
    throw new Error('Frame does not have expected Columns.')
  }
  if (frameInfo.samplesPerPixel !== samplesPerPixel) {
    throw new Error('Frame does not have expected Samples Per Pixel.')
  }
  if (frameInfo.pixelRepresentation !== pixelRepresentation) {
    throw new Error('Frame does not have expected Pixel Representation.')
  }

  const length = rows * columns * samplesPerPixel * (bitsAllocated / 8)
  if (length !== decodedFrame.length) {
    throw new Error(
      'frame value does not have expected length: ' +
      decodedFrame.length + ' instead of ' + length
    )
  }

  let transformedFrame
  if (sopInstanceUID in transformers) {
    transformedFrame = transformers[sopInstanceUID].transform(decodedFrame)
  } else {
    transformedFrame = decodedFrame
  }

  const signed = pixelRepresentation === 1
  let pixelArray
  let bitsPerSample
  switch (bitsAllocated) {
    case 1:
      pixelArray = dcmjs.data.BitArray.unpack(transformedFrame) // Uint8Array
      bitsPerSample = 8 // unpacked to 8-bit
      break
    case 8:
      if (signed) {
        pixelArray = new Int8Array(transformedFrame)
      } else {
        pixelArray = new Uint8Array(transformedFrame)
      }
      bitsPerSample = 8
      break
    case 16:
      if (pixelRepresentation === 1) {
        pixelArray = new Int16Array(
          transformedFrame.buffer,
          transformedFrame.byteOffset,
          transformedFrame.byteLength / 2
        )
      } else {
        pixelArray = new Uint16Array(
          transformedFrame.buffer,
          transformedFrame.byteOffset,
          transformedFrame.byteLength / 2
        )
      }
      bitsPerSample = 16
      break
    case 32:
      pixelArray = new Float32Array(
        transformedFrame.buffer,
        transformedFrame.byteOffset,
        transformedFrame.byteLength / 4
      )
      bitsPerSample = 32
      break
    case 64:
      pixelArray = new Float64Array(
        transformedFrame.buffer,
        transformedFrame.byteOffset,
        transformedFrame.byteLength / 8
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

/** Check image type of a compressed array and returns a decoded image.
 * @private
 */
const _checkImageTypeAndDecode = ({
  decoders,
  frame,
  bitsAllocated,
  pixelRepresentation,
  columns,
  rows,
  samplesPerPixel
}) => {
  let byteArray = new Uint8Array(frame)
  const imageTypeObject = imageType(byteArray)

  const toHex = (value) => {
    return value.toString(16).padStart(2, '0').toUpperCase()
  }

  let mediaType
  if (imageTypeObject == null) {
    /**
     * This hack is required to recognize JPEG 2000 bit streams that are zero
     * padded, i.e., that have a "00" byte after the JPEG 2000 End of Image
     * (EOI) marker "FFD9".
     */
    if (
      toHex(byteArray[byteArray.length - 3]) === 'FF' &&
      toHex(byteArray[byteArray.length - 2]) === 'D9' &&
      toHex(byteArray[byteArray.length - 1]) === '00'
    ) {
      mediaType = 'image/jp2'
      byteArray = new Uint8Array(byteArray.buffer, 0, byteArray.length - 1)
    } else {
      if (
        toHex(byteArray[byteArray.length - 2]) === 'FF' &&
        toHex(byteArray[byteArray.length - 1]) === 'D9'
      ) {
        mediaType = 'image/jp2'
      } else {
        mediaType = 'application/octet-stream'
      }
    }
  } else {
    /**
     * This hack is required to distinguish JPEG-LS from baseline JPEG, which
     * both contain the JPEG Start of Image (SOI) marker and share the first
     * three bytes.
     */
    if ((toHex(byteArray[3]) === 'F7') || (toHex(byteArray[3]) === 'E8')) {
      mediaType = 'image/jls'
    } else {
      mediaType = imageTypeObject.mime
    }
  }

  if (mediaType === 'application/octet-stream') {
    console.debug(`decode uncompressed frame with media type "${mediaType}"`)
    return {
      decodedFrame: byteArray,
      frameInfo: {
        bitsAllocated: bitsAllocated,
        rows: rows,
        columns: columns,
        samplesPerPixel: samplesPerPixel,
        pixelRepresentation: pixelRepresentation
      }
    }
  }

  console.debug(`decode compressed frame with media type "${mediaType}"`)
  const { frameBuffer, frameInfo } = _decode(decoders[mediaType], byteArray)

  return {
    decodedFrame: frameBuffer,
    frameInfo: {
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
const _decode = (decoder, byteArray) => {
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
