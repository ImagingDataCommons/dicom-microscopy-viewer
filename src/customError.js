/** Broad category of a {@link CustomError} */
const errorTypes = {
  VISUALIZATION: 'Visualization',
  ENCODINGANDDECODING: 'EncodingDecoding',
}

/**
 * Stable codes of errors about images, for applications to act on. New codes
 * may be added; existing codes keep their meaning.
 */
const errorCodes = {
  /** The images contain no VOLUME images, channels or color images */
  NO_IMAGES: 'NO_IMAGES',
  /** The combination of optical paths is not supported (e.g. both
   * monochrome channels and color images, or several color images) */
  UNSUPPORTED_OPTICAL_PATHS: 'UNSUPPORTED_OPTICAL_PATHS',
  /** Optical paths of the images have different image pyramids */
  INCONSISTENT_PYRAMIDS: 'INCONSISTENT_PYRAMIDS',
  /** The pixel data type cannot be shown by the renderer */
  UNSUPPORTED_PIXEL_DATA: 'UNSUPPORTED_PIXEL_DATA',
  /** The tile size cannot be used by the renderer */
  UNSUPPORTED_TILE_SIZE: 'UNSUPPORTED_TILE_SIZE',
}

/**
 * Error about the images, with a broad `type` (see `errorTypes`) and, where
 * available, a stable `code` (see `errorCodes`).
 */
class CustomError extends Error {
  /**
   * @param {string} type - One of `errorTypes`
   * @param {string} message - Message
   * @param {string} [code] - One of `errorCodes`
   */
  constructor(type, message, code) {
    super()
    this.message = message
    this.stack = new Error().stack
    this.type = type
    this.code = code
  }
}

export { CustomError, errorCodes, errorTypes }
