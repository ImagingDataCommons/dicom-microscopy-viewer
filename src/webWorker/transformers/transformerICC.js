import dicomiccFactory from '@imagingdatacommons/dicomicc/dist/dicomiccwasm.js'
import dicomiccWASM from '@imagingdatacommons/dicomicc/dist/dicomiccwasm.wasm'
import Transformer from './transformerAbstract.js'

export default class ColorTransformer extends Transformer {
  /**
   * Construct transformer object.
   *
   * @param {Array<metadata.VLWholeSlideMicroscopyImage>} - Metadata of each
   * image
   * @param {Array<TypedArray>} - ICC profiles of each image
   * @param {string} [iccOutputType="srgb"] - ICC output type
   *     ("srgb": sRGB (default), "display-p3": Display-P3, "adobe-rgb": Adobe RGB (1998), "romm-rgb": ROMM RGB).
   */
  constructor(metadata, iccProfiles, iccOutputType = 'srgb') {
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
    this.iccOutputTypeString = iccOutputType
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
          const profile = this.iccProfiles[index]

          // Determine ICC output type using the exposed enum
          let iccOutputType

          // Verify that the DcmIccOutputType enum is available
          if (!this.codec.DcmIccOutputType) {
            throw new Error(
              'DcmIccOutputType enum is not available in the codec. Please ensure that the version of dicomicc being used supports this feature.',
            )
          }

          // Ensure that the default DcmIccOutputType.SRGB is available
          if (this.codec.DcmIccOutputType.SRGB === undefined) {
            throw new Error(
              'DcmIccOutputType.SRGB is not defined in the codec. Please ensure that the version of dicomicc being used supports this feature.',
            )
          }

          switch (this.iccOutputTypeString) {
            case 'display-p3':
              iccOutputType =
                this.codec.DcmIccOutputType.DISPLAY_P3 ??
                this.codec.DcmIccOutputType.SRGB
              break
            case 'adobe-rgb':
              iccOutputType =
                this.codec.DcmIccOutputType.ADOBE_RGB ??
                this.codec.DcmIccOutputType.SRGB
              break
            case 'romm-rgb':
              iccOutputType =
                this.codec.DcmIccOutputType.ROMM_RGB ??
                this.codec.DcmIccOutputType.SRGB
              break
            default:
              iccOutputType = this.codec.DcmIccOutputType.SRGB
              break
          }

          console.debug(
            `Initializing ColorTransformer for SOP Instance UID ${sopInstanceUID} with ICC output type ${this.iccOutputTypeString} (codec enum value: ${iccOutputType})`,
          )

          this.transformers[sopInstanceUID] = new this.codec.ColorManager(
            {
              columns,
              rows,
              bitsPerSample,
              samplesPerPixel,
              planarConfiguration,
            },
            profile,
            iccOutputType,
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
        transformedFrame = new Promise((resolve) => {
          resolve(decodedFrame)
        })
      }
    } else {
      transformedFrame = new Promise((resolve) => {
        resolve(decodedFrame)
      })
    }

    return transformedFrame
  }
}
