import { registerTaskHandler } from './webWorker.js';
import decodeAndTransformTask from './decodeAndTransformTask.js';

// register our task
registerTaskHandler(decodeAndTransformTask);

const DataLoader = {
  registerTaskHandler,
};

export { registerTaskHandler };

export default DataLoader;
