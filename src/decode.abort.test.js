jest.mock('./webWorker/webWorkerManager.js', () => ({
  __esModule: true,
  default: { addTask: jest.fn(), cancelTask: jest.fn() },
}))

const webWorkerManager = require('./webWorker/webWorkerManager.js').default
const { _decodeAndTransformFrame } = require('./decode.js')

const frameOptions = {
  frame: new ArrayBuffer(4),
  bitsAllocated: 8,
  pixelRepresentation: 0,
  columns: 2,
  rows: 2,
  samplesPerPixel: 1,
  sopInstanceUID: '1.2.3',
  metadata: [],
}

describe('_decodeAndTransformFrame with an AbortSignal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not queue a task when already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(
      _decodeAndTransformFrame({ ...frameOptions, signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(webWorkerManager.addTask).not.toHaveBeenCalled()
  })

  it('cancels the queued task on abort', async () => {
    let rejectTask
    webWorkerManager.addTask.mockReturnValue({
      taskId: 42,
      promise: new Promise((_resolve, reject) => {
        rejectTask = reject
      }),
    })
    webWorkerManager.cancelTask.mockImplementation((_taskId, reason) => {
      rejectTask(reason)
      return true
    })
    const controller = new AbortController()
    const promise = _decodeAndTransformFrame({
      ...frameOptions,
      signal: controller.signal,
    })
    controller.abort()
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    expect(webWorkerManager.cancelTask).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ name: 'AbortError' }),
    )
  })

  it('rejects when aborted while the task was running', async () => {
    let resolveTask
    webWorkerManager.addTask.mockReturnValue({
      taskId: 7,
      promise: new Promise((resolve) => {
        resolveTask = resolve
      }),
    })
    const controller = new AbortController()
    const promise = _decodeAndTransformFrame({
      ...frameOptions,
      signal: controller.signal,
    })
    controller.abort()
    resolveTask({ frameData: new ArrayBuffer(4) })
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('decodes normally without a signal', async () => {
    webWorkerManager.addTask.mockReturnValue({
      taskId: 1,
      promise: Promise.resolve({ frameData: new Uint8Array([1, 2, 3, 4]).buffer }),
    })
    const pixelArray = await _decodeAndTransformFrame(frameOptions)
    expect(Array.from(pixelArray)).toEqual([1, 2, 3, 4])
  })
})
