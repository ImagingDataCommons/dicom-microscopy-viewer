import dicomiccFactory from 'dicomicc/dist/dicomiccwasm.js'
import dicomiccWASM from 'dicomicc/dist/dicomiccwasm.wasm'
import Transformer from './transformerAbstract.js'

export default class ColorTransformer extends Transformer {
  _initialize (iccProfiles) {
    if (this.codec) {
      return Promise.resolve()
    }

    const dicomicc = dicomiccFactory({
      locateFile: (f) => {
        if (f.endsWith('.wasm')) {
          return dicomiccWASM
        }
        return f
      }
    })

    return new Promise((resolve, reject) => {
      dicomiccFactory.then((instance) => {
        this.codec = instance

        for (let iccProfileIndex = 0; iccProfileIndex < iccProfiles.length; iccProfileIndex++) {
          const image = iccProfiles[iccProfileIndex]

          this.transformers[image.SOPInstanceUID] = new dicomicc.ColorManager(
            {
              columns: image.Columns,
              rows: image.Rows,
              bitsPerSample: image.BitsAllocated,
              samplesPerPixel: image.SamplesPerPixel,
              planarConfiguration: image.PlanarConfiguration
            },
            image.iccProfile
          )
        }

        resolve(this.transformers)
      }, reject)
    })
  }

  /** Transform image. The transform is applied only is iccProfiles are available.
   * Otherwise the function return the original decoded frame.
   *
   * @param {array} - images metadata with ICC profiles
   * @param {string} - sopInstanceUID
   * @param {Buffer} - decoded Frame
   *
   * @returns {Promise<Buffer>} transformed buffer
   */
  async transform (iccProfiles, sopInstanceUID, decodedFrame) {
    if (!iccProfiles || iccProfiles.length === 0) {
      return new Promise(function (resolve) {
        resolve(decodedFrame)
      })
    }

    if (!this.codec) {
      await this._initialize(iccProfiles)
    }

    let transformedFrame
    if (sopInstanceUID in this.transformers) {
      const transformer = this.transformers[sopInstanceUID]
      if (transformer) {
        transformedFrame = transformer.transform(decodedFrame)
      } else {
        transformedFrame = new Promise(function (resolve) {
          resolve(decodedFrame)
        })
      }
    } else {
      transformedFrame = new Promise(function (resolve) {
        resolve(decodedFrame)
      })
    }

    return transformedFrame
  }
}
