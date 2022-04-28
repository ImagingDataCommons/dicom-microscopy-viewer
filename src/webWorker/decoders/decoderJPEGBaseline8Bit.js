import libjpegTurboFactory from '@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm_decode.js'
import libjpegTurboWasm from '@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm_decode.wasm'
import Decoder from './decoderAbstract.js'

export default class JPEGDecoder extends Decoder {
  _initialize() {
    if (this.codec) {
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
        this.codec = instance
        this.decoder = new instance.JPEGDecoder()
        resolve()
      }, reject)
    });
  }  
}


