import { registerTaskHandler } from './webWorker.js'
import decodeAndTransformTask from './decodeAndTransformTask.js'

// register our task
registerTaskHandler(decodeAndTransformTask)
