import dicomiccFactory from 'dicomicc/dist/dicomiccwasm.js'
import dicomiccWASM from 'dicomicc/dist/dicomiccwasm.wasm'
import Transformer from './transformerAbstract.js'

export default class ColorTransformer extends Transformer {
  /**
   * Construct transformer object.
   *
   * @param {Array<metadata.VLWholeSlideMicroscopyImage>} - Metadata of all images
   * @param {Array<TypedArray>} - ICC profiles of all images
   */
  constructor (metadata, iccProfiles) {
    super()
    if (metadata.length !== iccProfiles.length) {
      throw new Error(
        'Argument "metadata" and "iccProfiles" must have same length.'
      )
    }
    this.metadata = metadata
    this.iccProfiles = iccProfiles
    this.codec = null
    this.transformers = {}
  }

  _initialize () {
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

        for (let index = 0; index < this.metadata.length; index++) {
          const image = this.metadata[index]
          const profile = this.iccProfiles[index]
          this.transformers[image.SOPInstanceUID] = new dicomicc.ColorManager(
            {
              columns: image.Columns,
              rows: image.Rows,
              bitsPerSample: image.BitsAllocated,
              samplesPerPixel: image.SamplesPerPixel,
              planarConfiguration: image.PlanarConfiguration
            },
            profile
          )
        }
        resolve(this.transformers)
      }, reject)
    })
  }

  /**
   * Transform image.
   *
   * The transform is applied only is iccProfiles are available.
   * Otherwise the function return the original decoded frame.
   *
   * @param {string} - SOP Instance UID of current image that should be transformed
   * @param {Buffer} - decoded Frame
   *
   * @returns {Promise<Buffer>} transformed buffer
   */
  async transform (sopInstanceUID, decodedFrame) {
    if (this.codec == null) {
      await this._initialize()
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
