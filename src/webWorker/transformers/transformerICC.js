import dicomiccFactory from 'dicomicc/dist/dicomiccwasm.js'
import dicomiccWASM from 'dicomicc/dist/dicomiccwasm.wasm'
import Transformer from './transformerAbstract.js'
import { inlineBinaryToUint8Array } from './inlineBinaryToUint8Array.js'

export default class ColorTransformer extends Transformer {
  /**
   * Construct transformer object.
   *
   * @param {Array<metadata.VLWholeSlideMicroscopyImage>} - Metadata of each
   * image
   * @param {Array<TypedArray>} - ICC profiles of each image
   */
  constructor(metadata, iccProfiles) {
    super()
    if (metadata.length !== iccProfiles.length) {
      throw new Error(
        'Argument "metadata" and "iccProfiles" must have same length: ' +
          `${metadata.length} versus ${iccProfiles.length}`,
      )
    }
    this.metadata = metadata
    this.iccProfiles = iccProfiles
    this.codec = null
    this.transformers = {}
  }

  _initialize() {
    if (this.codec) {
      return Promise.resolve()
    }

    const dicomicc = dicomiccFactory({
      locateFile: (f) => {
        if (f.endsWith('.wasm')) {
          return dicomiccWASM
        }
        return f
      },
    })

    return new Promise((resolve, reject) => {
      dicomicc.then((instance) => {
        this.codec = instance

        for (let index = 0; index < this.metadata.length; index++) {
          const columns = this.metadata[index].Columns
          const rows = this.metadata[index].Rows
          const bitsPerSample = this.metadata[index].BitsAllocated
          const samplesPerPixel = this.metadata[index].SamplesPerPixel
          const planarConfiguration = this.metadata[index].PlanarConfiguration
          const sopInstanceUID = this.metadata[index].SOPInstanceUID
          const profile = inlineBinaryToUint8Array(this.iccProfiles[index])
          if (!profile) {
            console.warn(
              'Unable to convert icc profile: ',
              this.iccProfiles[index],
            )
            return
          }
          this.transformers[sopInstanceUID] = new this.codec.ColorManager(
            {
              columns,
              rows,
              bitsPerSample,
              samplesPerPixel,
              planarConfiguration,
            },
            profile,
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
  async transform(sopInstanceUID, decodedFrame) {
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
