import charlsFactory from '@cornerstonejs/codec-charls/dist/charlswasm_decode.js'
import charlsWasm from '@cornerstonejs/codec-charls/dist/charlswasm_decode.wasm'

const local = {
  codec: undefined,
  decoder: undefined,
};

function initialize() {
  if (local.codec) {
    return Promise.resolve();
  }

  const charlsModule = charlsFactory({
    locateFile: (f) => {
      if (f.endsWith('.wasm')) {
        return charlsWasm;
      }
      return f
    },
  });

  return new Promise((resolve, reject) => {
    charlsModule.then((instance) => {
      local.codec = instance
      local.decoder = new instance.JpegLSDecoder()
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