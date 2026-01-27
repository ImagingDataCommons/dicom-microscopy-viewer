import decodeAndTransformTask from './decodeAndTransformTask.js'
import { registerTaskHandler } from './webWorker.js'

// register our task
registerTaskHandler(decodeAndTransformTask)
