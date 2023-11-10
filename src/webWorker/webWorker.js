/*eslint-disable*/
// an object of task handlers
const taskHandlers = {};

// Flag to ensure web worker is only initialized once
let isInitialized = false;

// the configuration object passed in when the web worker manager is initialized
let config;

/**
 * Initialization function that loads additional web workers and initializes them
 * @param {Object} data -
 * @param {Object} data.config - configuration
 * @param {number} data.config.maxWebWorkers - maximum number of web workers
 * @param {Array}  data.config.webWorkerTaskPaths - additional task file paths
 * @param {string} data.taskType - type of the task
 * @param {number} data.workerIndex - index of the worker
 *
 * @private
 */
function initialize(data) {
  // prevent initialization from happening more than once
  if (isInitialized) {
    return;
  }

  // save the config data
  config = data.config;

  // Additional web worker tasks can self-register by calling self.registerTaskHandler
  self.registerTaskHandler = registerTaskHandler;

  // load any additional web worker tasks
  if (data.config.webWorkerTaskPaths) {
    for (let i = 0; i < data.config.webWorkerTaskPaths.length; i++) {
      self.importScripts(data.config.webWorkerTaskPaths[i]);
    }
  }

  // tell main ui thread that we have completed initialization
  self.postMessage({
    taskType: 'initialize',
    status: 'success',
    result: {},
    workerIndex: data.workerIndex,
  });

  isInitialized = true;
}

/**
 * Function exposed to web worker tasks to register themselves
 * @param taskHandler
 *
 * @private
 */
export function registerTaskHandler(taskHandler) {
  if (taskHandlers[taskHandler.taskType]) {
    console.info(
      'attempt to register duplicate task handler "',
      taskHandler.taskType,
      '"'
    );

    return false;
  }
  taskHandlers[taskHandler.taskType] = taskHandler;
  if (isInitialized) {
    taskHandler.initialize(config.taskConfiguration);
  }
}

/**
 * Function to load a new web worker task with updated configuration
 * @param data
 *
 * @private
 */
function loadWebWorkerTask(data) {
  config = data.config;
  self.importScripts(data.sourcePath);
}

/**
 * Web worker message handler - dispatches messages to the registered task handlers
 * @param msg
 *
 * @private
 */
self.onmessage = function (msg) {
  if (!msg.data.taskType) {
    console.info(msg.data);
    return;
  }

  console.info(
    `run task "${msg.data.taskType}" on web worker #${msg.data.workerIndex}`
  );

  // handle initialize message
  if (msg.data.taskType === 'initialize') {
    initialize(msg.data);
    return;
  }

  // handle loadWebWorkerTask message
  if (msg.data.taskType === 'loadWebWorkerTask') {
    loadWebWorkerTask(msg.data);
    return;
  }

  // dispatch the message if there is a handler registered for it
  if (taskHandlers[msg.data.taskType]) {
    try {
      taskHandlers[msg.data.taskType]._handler(
        msg.data,
        function (result, transferList) {
          self.postMessage(
            {
              taskType: msg.data.taskType,
              status: 'success',
              result,
              workerIndex: msg.data.workerIndex,
            },
            transferList
          );
        }
      );
    } catch (error) {
      console.error(`task "${msg.data.taskType}" failed: ${error.message}`);
      self.postMessage({
        taskType: msg.data.taskType,
        status: 'failed',
        result: error.message,
        workerIndex: msg.data.workerIndex,
      });
    }

    return;
  }

  // not task handler registered - send a failure message back to ui thread
  console.warn('no task handler for ', msg.data.taskType, taskHandler);

  self.postMessage({
    taskType: msg.data.taskType,
    status: 'failed - no task handler registered',
    workerIndex: msg.data.workerIndex,
  });
};
/* eslint-enable */
