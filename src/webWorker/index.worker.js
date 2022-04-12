import { registerTaskHandler } from './webWorker.js'
import decodeAndTrasformTask from './decodeAndTrasformTask.js'

// register our task
registerTaskHandler(decodeAndTrasformTask)

const dicomMicroscopyImageLoaderWebWorker = {
  registerTaskHandler
};

export { registerTaskHandler }

export default dicomMicroscopyImageLoaderWebWorker
