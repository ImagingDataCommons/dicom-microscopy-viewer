import libjpegTurboFactory from '@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm_decode.js'
import libjpegTurboWasm from '@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm_decode.wasm'

const local = {
  codec: undefined,
  decoder: undefined,
};

function initialize() {
  if (local.codec) {
    return Promise.resolve()
  }

  const libjpegTurboModule = libjpegTurboFactory({
    locateFile: (f) => {
      if (f.endsWith('.wasm')) {
        return libjpegTurboWasm;
      }

      return f
    },
  });

  return new Promise((resolve, reject) => {
    libjpegTurboModule.then((instance) => {
      local.codec = instance
      local.decoder = new instance.JPEGDecoder()
      resolve()
    }, reject)
  });
}

/** Decode image.
 * 
 * @param {Uint8Array} byteArray - Image array
 *
 * @returns {object} decoded array and frameInfo
 * @private
 */
async function decodeAsync(byteArray) {
  if (!local.codec){
    await initialize()
  }

  const encodedBuffer = local.decoder.getEncodedBuffer(byteArray.length)
  encodedBuffer.set(byteArray)
  local.decoder.decode()
  return {
    frameBuffer: local.decoder.getDecodedBuffer(),
    frameInfo: local.decoder.getFrameInfo()
  }
}

export {
  decodeAsync,
};