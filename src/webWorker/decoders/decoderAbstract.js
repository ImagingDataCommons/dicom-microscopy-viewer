export default class Decoder {
  constructor() {
    this.codec = undefined
    this.decoder = undefined
  }
  
  _initialize () {
    return Promise.resolve()
  }
  
  /** Decode image.
   * 
   * @param {Uint8Array} byteArray - Image array
   *
   * @returns {object} decoded array and frameInfo
   * @private
   */
  async decodeAsync(byteArray) {
    if (!this.codec){
      await this._initialize()
    }
  
    const encodedBuffer = this.decoder.getEncodedBuffer(byteArray.length)
    encodedBuffer.set(byteArray)
    this.decoder.decode()

    return {
      frameBuffer: this.decoder.getDecodedBuffer(),
      frameInfo: this.decoder.getFrameInfo()
    }
  }
}