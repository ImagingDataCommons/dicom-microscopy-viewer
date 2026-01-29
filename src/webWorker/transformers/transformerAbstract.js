export default class Transformer {
  constructor() {
    this.codec = undefined
    this.transformers = []
  }

  _initialize() {
    return Promise.resolve()
  }
}
