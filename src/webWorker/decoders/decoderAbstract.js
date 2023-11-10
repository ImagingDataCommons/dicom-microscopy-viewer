export default class Decoder {
  constructor() {
    this.codec = undefined;
    this.decoder = undefined;
  }

  _initialize() {
    return Promise.resolve();
  }

  /** Decode image.
   *
   * @param {Uint8Array} byteArray - Image array
   *
   * @returns {Promise<object>} decoded array and frame information
   */
  async decode(byteArray) {
    if (!this.codec) {
      await this._initialize();
    }

    const encodedBuffer = this.decoder.getEncodedBuffer(byteArray.length);
    encodedBuffer.set(byteArray);
    this.decoder.decode();

    return {
      frameBuffer: this.decoder.getDecodedBuffer(),
      frameInfo: this.decoder.getFrameInfo(),
    };
  }
}
