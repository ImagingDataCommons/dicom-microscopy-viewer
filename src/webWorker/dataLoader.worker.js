import { registerTaskHandler } from './webWorker.js'
import decodeAndTransformTask from './decodeAndTransformTask.js'
import annotationStatisticsTask from './annotationStatisticsTask.js'
import annotationCoordinateTransformTask from './annotationCoordinateTransformTask.js'

// register our tasks
registerTaskHandler(decodeAndTransformTask)
registerTaskHandler(annotationStatisticsTask)
registerTaskHandler(annotationCoordinateTransformTask)
