import openjphWasm from '@cornerstonejs/codec-openjph/wasm'
import openjphFactory from '@cornerstonejs/codec-openjph/wasmjs'
import Decoder from './decoderAbstract.js'

export default class HTJ2KDecoder extends Decoder {
  _initialize() {
    if (this.codec) {
      return Promise.resolve()
    }

    const openjphModule = openjphFactory({
      locateFile: (f) => {
        if (f.endsWith('.wasm')) {
          return openjphWasm
        }
        return f
      },
    })

    return new Promise((resolve, reject) => {
      openjphModule.then((instance) => {
        this.codec = instance
        this.decoder = new instance.HTJ2KDecoder()
        resolve()
      }, reject)
    })
  }
}
