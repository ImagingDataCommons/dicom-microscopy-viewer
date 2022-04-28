import { decodeAsync as decodeAsyncJPEG2000 } from './decoders/decodeJPEG2000.js'
import { decodeAsync as decodeAsyncJPEGLS } from './decoders/decodeJPEGLS.js'
import { decodeAsync as decodeAsyncJPEGBaseline8Bit } from './decoders/decodeJPEGBaseline8Bit.js'
import { transformAsync as transformICCAsync } from './transformers/transformICC.js'
import imageType from 'image-type'

/**
 * Task handler function
 * 
 * @param {object} - handler data
 * @param {function} - handler done call back
 *
 */
function handler(data, doneCallback) {
  const {
    bitsAllocated,
    columns,
    rows,
    samplesPerPixel,
    pixelRepresentation,
    frame,
    iccProfiles,
    sopInstanceUID
  } = data.data

  _checkImageTypeAndDecode(
    {
      bitsAllocated,
      columns,
      rows,
      samplesPerPixel,
      pixelRepresentation,
      frame
    }
  ).then((decodedFrame) => {
    // Apply ICC color transform
    transformICCAsync(iccProfiles, sopInstanceUID, decodedFrame).then((transformedFrame) => {
      // invoke the callback with our result and pass the frameData in the transferList to move it to
      // UI thread without making a copy
      doneCallback({
        frameData: transformedFrame.buffer
      }, [transformedFrame.buffer])
    }).catch(
      (error) => {
        console.log(`Failed to transform frame: ${error}`)
      }
    )
  }).catch(
    (error) => {
      console.log(`Failed to decode frame: ${error}`)
    }
  )
}

/** Check image type of a compressed array and returns a decoded image.
 * @param {number} - bits per sample
 * @param {number} - columns
 * @param {number} - rows
 * @param {number} - samples per pixel
 * @param {number} - pixel representation
 * @param {Uint8Array} byteArray - Image array
 *
 * @returns {Uint8Array} decoded array
 * @private
 */
async function _checkImageTypeAndDecode ({
  bitsAllocated,
  columns,
  rows,
  samplesPerPixel,
  pixelRepresentation,
  frame
}) {
  let byteArray = new Uint8Array(frame)
  const imageTypeObject = imageType(byteArray)

  const toHex = function (value) {
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
    return frameBuffer
  }

  console.debug(`decode compressed frame with media type "${mediaType}"`)

  const {frameBuffer, frameInfo} = await _decode(mediaType, byteArray)
  if (frameInfo.bitsPerSample !== bitsAllocated) {
    throw new Error('_checkImageTypeAndDecode: frame does not have expected Bits Allocated.')
  }

  if (frameInfo.height !== rows) {
    throw new Error('_checkImageTypeAndDecode: frame does not have expected Rows.')
  }

  if (frameInfo.width !== columns) {
    throw new Error('_checkImageTypeAndDecode: frame does not have expected Columns.')
  }

  if (frameInfo.componentCount !== samplesPerPixel) {
    throw new Error('_checkImageTypeAndDecode: frame does not have expected Samples Per Pixel.')
  }

  const signed = pixelRepresentation === 1
  if (frameInfo.isSigned !== signed) {
    throw new Error('_checkImageTypeAndDecode: frame does not have expected Pixel Representation.')
  }

  const length = columns * rows * samplesPerPixel * (bitsAllocated / 8)
  if (length !== frameBuffer.length) {
    throw new Error(
      '_checkImageTypeAndDecode: frame value does not have expected length: ' +
      frameBuffer.length + ' instead of ' + length + '.'
    )
  }

  return frameBuffer
}

/** Decode image.
 *
 * @param {string} mediaType - Media Type
 * @param {Uint8Array} byteArray - Image array
 *
 * @returns {object} decoded array and frameInfo
 * @private
 */
async function _decode (mediaType, byteArray) {
  if (mediaType === 'image/jpeg') {
    return await decodeAsyncJPEGBaseline8Bit(byteArray)
  } else if (mediaType === 'image/jp2' || mediaType === 'image/jpx') {
    return await decodeAsyncJPEG2000(byteArray)
  } else if (mediaType === 'image/jls') {
    return await decodeAsyncJPEGLS(byteArray)
  }
}

export default {
  taskType: 'decodeAndTrasformTask',
  handler
};
