export default class Transformer {
  constructor() {
    this.codec = undefined
    this.transformers = []
  }
  
  _initialize() {
    return Promise.resolve()
  }
  
  async transformAsync() {
    if (!this.codec){
      await this._initialize()
    }
  }
}