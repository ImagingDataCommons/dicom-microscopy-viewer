import charlsFactory from '@cornerstonejs/codec-charls/dist/charlswasm_decode.js'
import charlsWasm from '@cornerstonejs/codec-charls/dist/charlswasm_decode.wasm'
import Decoder from './decoderAbstract.js'

export default class JPEGLSDecoder extends Decoder {
  _initialize () {
    if (this.codec) {
      return Promise.resolve()
    }

    const charlsModule = charlsFactory({
      locateFile: (f) => {
        if (f.endsWith('.wasm')) {
          return charlsWasm
        }
        return f
      }
    })

    return new Promise((resolve, reject) => {
      charlsModule.then((instance) => {
        this.codec = instance
        this.decoder = new instance.JpegLSDecoder()
        resolve()
      }, reject)
    })
  }
}
