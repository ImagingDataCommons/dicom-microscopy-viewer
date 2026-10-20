/**
 * @jest-environment jsdom
 */

jest.mock('../logger.js', () => ({
  getLoggerOptions: () => ({}),
  onLoggerConfigChange: () => {},
}))

describe('webWorkerManager.terminateAllWebWorkers', () => {
  it('rejects queued task promises so callers are not left hanging', async () => {
    const webWorkerManager = require('./webWorkerManager.js').default

    class FakeWorker {
      constructor() {
        this.onmessage = null
      }

      postMessage() {}

      terminate() {}

      addEventListener() {}

      removeEventListener() {}
    }

    global.Worker = FakeWorker
    global.URL = { createObjectURL: () => 'blob:fake', revokeObjectURL: () => {} }

    webWorkerManager.initialize({
      maxWebWorkers: 1,
      webWorkerTaskPaths: [],
    })

    const { promise } = webWorkerManager.addTask('decodeAndTransformTask', {
      frame: new ArrayBuffer(8),
    })

    webWorkerManager.terminateAllWebWorkers()

    await expect(promise).rejects.toThrow(/terminated/i)
  })
})
