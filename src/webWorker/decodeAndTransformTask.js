import JPEG2000Decoder from './decoders/decoderJPEG2000.js';
import JPEGLSDecoder from './decoders/decoderJPEGLS.js';
import JPEGDecoder from './decoders/decoderJPEGBaseline8Bit.js';
import ColorTransformer from './transformers/transformerICC.js';
import imageType from 'image-type';

const decoderJPEG2000 = new JPEG2000Decoder();
const decoderJPEGLS = new JPEGLSDecoder();
const decoderJPEG = new JPEGDecoder();
let transformerColor;

/**
 * Task handler function
 *
 * @param {object} - handler data
 * @param {function} - handler done call back
 *
 * @private
 */
function _handler(data, doneCallback) {
  const {
    bitsAllocated,
    columns,
    rows,
    samplesPerPixel,
    pixelRepresentation,
    frame,
    sopInstanceUID,
    metadata,
    iccProfiles,
  } = data.data;

  _checkImageTypeAndDecode({
    bitsAllocated,
    columns,
    rows,
    samplesPerPixel,
    pixelRepresentation,
    frame,
  })
    .then((decodedFrame) => {
      if (iccProfiles != null && iccProfiles.length > 0) {
        // Only instantiate the transformer once and cache it for reuse.
        if (transformerColor === undefined) {
          transformerColor = new ColorTransformer(metadata, iccProfiles);
        }
        // Apply ICC color transform
        transformerColor
          .transform(sopInstanceUID, decodedFrame)
          .then((transformedFrame) => {
            /*
             * Invoke the callback with our result and pass the frameData in the
             * transferList to move it to UI thread without making a copy.
             */
            doneCallback({ frameData: transformedFrame.buffer }, [
              transformedFrame.buffer,
            ]);
          })
          .catch((error) => {
            throw new Error(`Failed to transform frame: ${error}`);
          });
      } else {
        doneCallback({ frameData: decodedFrame.buffer }, [decodedFrame.buffer]);
      }
    })
    .catch((error) => {
      throw new Error(`Failed to decode frame: ${error}`);
    });
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
async function _checkImageTypeAndDecode({
  bitsAllocated,
  columns,
  rows,
  samplesPerPixel,
  pixelRepresentation,
  frame,
}) {
  let byteArray = new Uint8Array(frame);
  const imageTypeObject = imageType(byteArray);

  const toHex = function (value) {
    return value.toString(16).padStart(2, '0').toUpperCase();
  };

  let mediaType;
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
      mediaType = 'image/jp2';
      byteArray = new Uint8Array(byteArray.buffer, 0, byteArray.length - 1);
    } else {
      if (
        toHex(byteArray[byteArray.length - 2]) === 'FF' &&
        toHex(byteArray[byteArray.length - 1]) === 'D9'
      ) {
        mediaType = 'image/jp2';
      } else {
        mediaType = 'application/octet-stream';
      }
    }
  } else {
    /**
     * This hack is required to distinguish JPEG-LS from baseline JPEG, which
     * both contain the JPEG Start of Image (SOI) marker and share the first
     * three bytes.
     */
    if (toHex(byteArray[3]) === 'F7' || toHex(byteArray[3]) === 'E8') {
      mediaType = 'image/jls';
    } else {
      const supportedImageMediaTypes = new Set([
        'image/jpeg',
        'image/jls',
        'image/jp2',
        'image/jpx',
      ]);
      if (supportedImageMediaTypes.has(imageTypeObject.mime)) {
        mediaType = imageTypeObject.mime;
      } else {
        mediaType = 'application/octet-stream';
      }
    }
  }

  if (mediaType === 'application/octet-stream') {
    console.debug(`decode uncompressed frame with media type "${mediaType}"`);
    return byteArray;
  }

  console.debug(`decode compressed frame with media type "${mediaType}"`);

  const { frameBuffer, frameInfo } = await _decode(mediaType, byteArray);
  if (frameInfo.bitsPerSample !== bitsAllocated) {
    throw new Error(
      'Frame does not have expected Bits Allocated: ' +
        `${frameInfo.bitsPerSample} instead of ${bitsAllocated}.`
    );
  }

  if (frameInfo.height !== rows) {
    throw new Error(
      'Frame does not have expected Rows: ' +
        `${frameInfo.height} instead of ${rows}.`
    );
  }

  if (frameInfo.width !== columns) {
    throw new Error(
      'Frame does not have expected Columns: ' +
        `${frameInfo.width} instead of ${columns}.`
    );
  }

  if (frameInfo.componentCount !== samplesPerPixel) {
    throw new Error(
      'Frame does not have expected Samples Per Pixel: ' +
        `${frameInfo.componentCount} instead of ${samplesPerPixel}.`
    );
  }

  if (frameInfo.isSigned != null) {
    const isSigned = pixelRepresentation === 1;
    if (frameInfo.isSigned !== isSigned) {
      throw new Error(
        'Frame does not have expected Pixel Representation: ' +
          `"${frameInfo.isSigned}" instead of "${isSigned}".`
      );
    }
  }

  const length = columns * rows * samplesPerPixel * (bitsAllocated / 8);
  if (length !== frameBuffer.length) {
    throw new Error(
      'Frame value does not have expected length: ' +
        `${frameBuffer.length} instead of ${length}.`
    );
  }

  return frameBuffer;
}

/** Decode image.
 *
 * @param {string} mediaType - Media Type
 * @param {Uint8Array} byteArray - Image array
 *
 * @returns {object} decoded array and frameInfo
 * @private
 */
async function _decode(mediaType, byteArray) {
  if (mediaType === 'image/jpeg') {
    return await decoderJPEG.decode(byteArray);
  } else if (mediaType === 'image/jp2' || mediaType === 'image/jpx') {
    return await decoderJPEG2000.decode(byteArray);
  } else if (mediaType === 'image/jls') {
    return await decoderJPEGLS.decode(byteArray);
  }
}

export default {
  taskType: 'decodeAndTransformTask',
  _handler,
};
