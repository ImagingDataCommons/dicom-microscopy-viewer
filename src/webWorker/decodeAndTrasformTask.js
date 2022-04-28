import { decodeAsync as decodeAsyncJPEG2000 } from './decoders/decodeJPEG2000.js'
import { decodeAsync as decodeAsyncJPEGLS } from './decoders/decodeJPEGLS.js'
import { decodeAsync as decodeAsyncJPEGBaseline8Bit } from './decoders/decodeJPEGBaseline8Bit.js'
import { transformAsync as transformICCAsync } from './transformers/transformICC.js'
import imageType from 'image-type'

/**
 * Task handler function
 */
function handler(data, doneCallback) {
  _checkImageTypeAndDecode(
    data
  ).then(({data, decodedFrame, frameInfo}) => {
    if (frameInfo.bitsAllocated && 
      data.bitsAllocated &&
      frameInfo.bitsAllocated !== data.bitsAllocated
    ) {
      throw new Error('decodeAndTrasformTask: frame does not have expected Bits Allocated.')
    }
    if (frameInfo.rows && 
      data.rows &&
      frameInfo.rows !==  data.rows
    ) {
      throw new Error('decodeAndTrasformTask: frame does not have expected Rows.')
    }
    if (frameInfo.columns && 
      data.columns &&
      frameInfo.columns !==  data.columns
    ) {
      throw new Error('decodeAndTrasformTask: frame does not have expected Columns.')
    }
    if (frameInfo.samplesPerPixel && 
      data.samplesPerPixel &&
      frameInfo.samplesPerPixel !==  data.samplesPerPixel
    ) {
      throw new Error('decodeAndTrasformTask: frame does not have expected Samples Per Pixel.')
    }
    if (frameInfo.pixelRepresentation && 
      data.pixelRepresentation &&
      frameInfo.pixelRepresentation !==  data.pixelRepresentation
    ) {
      throw new Error('decodeAndTrasformTask: frame does not have expected Pixel Representation.')
    }
  
    const length =  data.rows *  data.columns *  data.samplesPerPixel * (data.bitsAllocated / 8)
    if (length !== decodedFrame.length) {
      throw new Error(
        'decodeAndTrasformTask: frame value does not have expected length: ' +
        decodedFrame.length + ' instead of ' + length + '.'
      )
    }

    // Apply ICC color transform
    transformICCAsync(data.iccProfiles, data.sopInstanceUID, decodedFrame).then((transformedFrame) => {
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
 * @private
 */
async function _checkImageTypeAndDecode ({
  data
}) {
  let byteArray = new Uint8Array(data.frame)
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
    return(
      {
        data: data,
        decodedFrame: byteArray,
        frameInfo: {
          bitsAllocated: data.bitsPerSample,
          rows: data.height,
          columns: data.width,
          samplesPerPixel: data.componentCount,
          pixelRepresentation: data.pixelRepresentation
        }
      }
    )
  }

  console.debug(`decode compressed frame with media type "${mediaType}"`)

  const {frameBuffer, frameInfo} = await _decode(mediaType, byteArray)
  return (
    {
      data: data,
      decodedFrame: frameBuffer,
      frameInfo: {
        bitsAllocated: frameInfo.bitsPerSample,
        rows: frameInfo.height,
        columns: frameInfo.width,
        samplesPerPixel: frameInfo.componentCount,
        pixelRepresentation: frameInfo.isSigned ? 1 : 0
      }
    }
  )
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
