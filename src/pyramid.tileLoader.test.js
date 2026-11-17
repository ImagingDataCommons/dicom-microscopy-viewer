jest.mock('./decode.js', () => ({
  _decodeAndTransformFrame: jest.fn(),
}))

const { _decodeAndTransformFrame } = require('./decode.js')
const EVENT = require('./events.js').default
const { _createTileLoadFunction } = require('./pyramid.js')

const image = {
  StudyInstanceUID: '1.2.3',
  SeriesInstanceUID: '1.2.3.4',
  SOPInstanceUID: '1.2.3.4.5',
  SOPClassUID: '1.2.840.10008.5.1.4.1.1.77.1.6',
  Columns: 2,
  Rows: 2,
  BitsAllocated: 16,
  SamplesPerPixel: 1,
  PixelRepresentation: 0,
  PhotometricInterpretation: 'MONOCHROME2',
}

/** One-level pyramid with a frame at (row 1, column 2) of channel "1" */
const createPyramid = (overrides = {}) => ({
  metadata: [{ ...image, ...overrides }],
  frameMappings: [{ '1-2-1': `${image.SOPInstanceUID}/frames/3` }],
  dimensionOrganizationTypes: ['TILED_SPARSE'],
})

const createClient = () => ({
  wadoURL: 'https://dicomweb.example',
  retrieveInstanceFrames: jest.fn(() => Promise.resolve([new ArrayBuffer(8)])),
})

const recordEvents = (element) => {
  const events = []
  for (const type of [
    EVENT.FRAME_LOADING_STARTED,
    EVENT.FRAME_LOADING_ENDED,
    EVENT.FRAME_LOADING_ERROR,
  ]) {
    element.addEventListener(type, (event) => {
      events.push({ type, payload: event.detail.payload })
    })
  }
  return events
}

describe('_createTileLoadFunction', () => {
  let targetElement
  let events

  beforeEach(() => {
    jest.clearAllMocks()
    targetElement = document.createElement('div')
    events = recordEvents(targetElement)
  })

  it('loads a grayscale tile as Float32Array and publishes frame events', async () => {
    _decodeAndTransformFrame.mockResolvedValue(new Uint16Array([1, 2, 3, 4]))
    const client = createClient()
    const loader = _createTileLoadFunction({
      pyramid: createPyramid(),
      client,
      channel: '1',
      targetElement,
    })

    /** OpenLayers calls the loader as (z, column, row) */
    const pixels = await loader(0, 1, 0)

    expect(pixels).toBeInstanceOf(Float32Array)
    expect(Array.from(pixels)).toEqual([1, 2, 3, 4])
    expect(client.retrieveInstanceFrames).toHaveBeenCalledWith(
      expect.objectContaining({
        sopInstanceUID: image.SOPInstanceUID,
        frameNumbers: ['3'],
      }),
    )
    expect(client.retrieveInstanceFrames.mock.calls[0][0].request).toBe(
      undefined,
    )
    expect(events.map((event) => event.type)).toEqual([
      EVENT.FRAME_LOADING_STARTED,
      EVENT.FRAME_LOADING_ENDED,
    ])
    expect(events[0].payload).toMatchObject({
      sopInstanceUID: image.SOPInstanceUID,
      frameNumber: '3',
      channelIdentifier: '1',
    })
    expect(events[1].payload.pixelArray).toBeInstanceOf(Uint16Array)
  })

  it('returns 8-bit color tiles as Uint8Array', async () => {
    const rgb = new Uint8Array(12).fill(200)
    _decodeAndTransformFrame.mockResolvedValue(rgb)
    const loader = _createTileLoadFunction({
      pyramid: createPyramid({
        BitsAllocated: 8,
        SamplesPerPixel: 3,
        PhotometricInterpretation: 'RGB',
      }),
      client: createClient(),
      channel: '1',
      targetElement,
    })
    expect(await loader(0, 1, 0)).toBe(rgb)
  })

  it('masks LABELMAP pixels to the segment number', async () => {
    _decodeAndTransformFrame.mockResolvedValue(new Uint8Array([0, 2, 1, 2]))
    const loader = _createTileLoadFunction({
      pyramid: createPyramid({ BitsAllocated: 8 }),
      client: createClient(),
      channel: '1',
      targetElement,
      labelmapSegmentNumber: 2,
    })
    const pixels = await loader(0, 1, 0)
    expect(Array.from(pixels)).toEqual([0, 1, 0, 1])
    expect(Array.from(events[1].payload.pixelArray)).toEqual([0, 1, 0, 1])
  })

  it('returns an empty tile for a missing sparse frame without events', async () => {
    const client = createClient()
    const loader = _createTileLoadFunction({
      pyramid: createPyramid(),
      client,
      channel: '1',
      targetElement,
    })
    const pixels = await loader(0, 0, 0)
    expect(Array.from(pixels)).toEqual([0, 0, 0, 0])
    expect(client.retrieveInstanceFrames).not.toHaveBeenCalled()
    expect(events).toEqual([])
  })

  it('publishes ended and error events and keeps the cause on failure', async () => {
    const requestError = new Error('request failed')
    requestError.status = 500
    const client = createClient()
    client.retrieveInstanceFrames.mockRejectedValue(requestError)
    const loader = _createTileLoadFunction({
      pyramid: createPyramid(),
      client,
      channel: '1',
      targetElement,
    })
    const error = await loader(0, 1, 0).catch((e) => e)
    /** Same text as before the reader refactor; applications may match it */
    expect(error.message).toBe(
      'Failed to load frames 3 of SOP instance "1.2.3.4.5" for channel "1" ' +
        'at tile position (1, 2) at zoom level 0: ',
    )
    expect(error.cause).toBe(requestError)
    expect(events.map((event) => event.type)).toEqual([
      EVENT.FRAME_LOADING_STARTED,
      EVENT.FRAME_LOADING_ENDED,
      EVENT.FRAME_LOADING_ERROR,
    ])
  })

  it('wraps unsupported 64-bit float pixel data like other load errors', async () => {
    _decodeAndTransformFrame.mockResolvedValue(new Float64Array(4))
    const loader = _createTileLoadFunction({
      pyramid: createPyramid({ BitsAllocated: 64 }),
      client: createClient(),
      channel: '1',
      targetElement,
    })
    const error = await loader(0, 1, 0).catch((e) => e)
    expect(error.message).toMatch(/^Failed to load frames 3 of SOP instance/)
    expect(error.cause.message).toBe(
      'Double Float Pixel Data is not (yet) supported.',
    )
    expect(events.map((event) => event.type)).toEqual([
      EVENT.FRAME_LOADING_STARTED,
      EVENT.FRAME_LOADING_ENDED,
      EVENT.FRAME_LOADING_ERROR,
    ])
  })

  it('rejects for a level that does not exist without events', async () => {
    const loader = _createTileLoadFunction({
      pyramid: createPyramid(),
      client: createClient(),
      channel: '1',
      targetElement,
    })
    await expect(loader(3, 0, 0)).rejects.toThrow('level 3 does not exist')
    expect(events).toEqual([])
  })
})
