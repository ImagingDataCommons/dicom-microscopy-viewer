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
    global.URL = {
      createObjectURL: () => 'blob:fake',
      revokeObjectURL: () => {},
    }

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

  it('release only terminates the pool when the last viewer exits', async () => {
    const webWorkerManager = require('./webWorkerManager.js').default

    class FakeWorker {
      postMessage() {}
      terminate() {}
      addEventListener() {}
      removeEventListener() {}
    }
    global.Worker = FakeWorker
    global.URL = {
      createObjectURL: () => 'blob:fake',
      revokeObjectURL: () => {},
    }

    /** Reset retain count from prior tests via forced drain */
    while (webWorkerManager.getRetainCount() > 0) {
      webWorkerManager.release()
    }

    webWorkerManager.retain()
    webWorkerManager.retain()
    webWorkerManager.initialize({
      maxWebWorkers: 1,
      webWorkerTaskPaths: [],
    })
    const { promise } = webWorkerManager.addTask('decodeAndTransformTask', {
      frame: new ArrayBuffer(4),
    })
    /** Avoid unhandled rejection when the last release terminates the pool */
    const settled = promise.then(
      () => 'fulfilled',
      () => 'rejected',
    )

    webWorkerManager.release()
    expect(webWorkerManager.getRetainCount()).toBe(1)
    expect(webWorkerManager.webWorkers.length).toBeGreaterThan(0)

    webWorkerManager.release()
    expect(webWorkerManager.getRetainCount()).toBe(0)
    expect(webWorkerManager.webWorkers.length).toBe(0)
    expect(await settled).toBe('rejected')
  })
})
