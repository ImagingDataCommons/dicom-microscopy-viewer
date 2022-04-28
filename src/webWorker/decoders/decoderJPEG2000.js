import openJpegFactory from '@cornerstonejs/codec-openjpeg/dist/openjpegwasm_decode.js'
import openjpegWasm from '@cornerstonejs/codec-openjpeg/dist/openjpegwasm_decode.wasm'
import Decoder from './decoderAbstract.js'

export default class JPEG2000Decoder extends Decoder {
  _initialize () {
    if (this.codec) {
      return Promise.resolve()
    }

    const openJpegModule = openJpegFactory({
      locateFile: (f) => {
        if (f.endsWith('.wasm')) {
          return openjpegWasm
        }
        return f
      }
    })

    return new Promise((resolve, reject) => {
      openJpegModule.then((instance) => {
        this.codec = instance
        this.decoder = new instance.J2KDecoder()
        resolve()
      }, reject)
    })
  }
}
