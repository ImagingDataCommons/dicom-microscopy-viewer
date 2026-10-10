jest.mock('./decode.js', () => ({
  _decodeAndTransformFrame: jest.fn(),
}))

const { _decodeAndTransformFrame } = require('./decode.js')
const {
  _buildPerFrameImagePyramid,
  _createPerFrameImageLoadFunction,
} = require('./pyramid.js')

const segmentation = {
  StudyInstanceUID: '1.2.3',
  SeriesInstanceUID: '1.2.3.4',
  SOPInstanceUID: '1.2.3.4.5',
  SOPClassUID: '1.2.840.10008.5.1.4.1.1.66.4',
  Columns: 2,
  Rows: 2,
  BitsAllocated: 8,
  SamplesPerPixel: 1,
  PixelRepresentation: 0,
  PhotometricInterpretation: 'MONOCHROME2',
}
const placement = {
  frameNumber: 7,
  extent: [0, -2, 2, 0],
  origin: [0, 0],
  tileSize: [2, 2],
}
const framePath = `${segmentation.SOPInstanceUID}/frames/7`

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

/** Load function for one segment of a LABELMAP SEG, plus the image it paints */
const createLabelmapLoader = ({ client, frameDataCache, segmentNumber }) => {
  const { pyramid, nativeSize } = _buildPerFrameImagePyramid({
    placement,
    fitResolution: 1,
    segmentation,
    channelId: segmentNumber,
  })
  const load = _createPerFrameImageLoadFunction({
    pyramid,
    client,
    channel: segmentNumber,
    labelmapSegmentNumber: segmentNumber,
    frameDataCache,
    targetElement: document.createElement('div'),
    getPalette: () => ({
      colormap: [
        [0, 0, 0, 0],
        [255, 0, 0],
      ],
      windowCenter: 0.5,
      windowWidth: 1,
    }),
    nativeSize,
  })
  const imageElement = { src: 'unset' }
  return { load, image: { getImage: () => imageElement }, imageElement }
}

describe('_createPerFrameImageLoadFunction', () => {
  let client

  beforeEach(() => {
    client = {
      wadoURL: 'https://dicomweb.example.com',
      retrieveInstanceFrames: jest.fn(() => Promise.resolve([new Uint8Array(4)])),
    }
    _decodeAndTransformFrame.mockImplementation(() =>
      Promise.resolve(new Uint8Array([0, 1, 2, 1])),
    )
  })

  it('fetches a LABELMAP frame once for all segments of the SEG', async () => {
    const frameDataCache = new Map()
    const first = createLabelmapLoader({
      client,
      frameDataCache,
      segmentNumber: 1,
    })
    const second = createLabelmapLoader({
      client,
      frameDataCache,
      segmentNumber: 2,
    })

    first.load(first.image)
    second.load(second.image)
    await flushPromises()

    expect(client.retrieveInstanceFrames).toHaveBeenCalledTimes(1)
    expect(first.imageElement.src).toMatch(/^data:image\/png/)
    expect(second.imageElement.src).toMatch(/^data:image\/png/)
  })

  it('keeps the shared frame unmasked and compact', async () => {
    const frameDataCache = new Map()
    const { load, image } = createLabelmapLoader({
      client,
      frameDataCache,
      segmentNumber: 2,
    })

    load(image)
    const frameData = await frameDataCache.get(framePath)

    expect(frameData).toEqual(new Uint8Array([0, 1, 2, 1]))
  })

  it('hands the unmasked frame to onFrameData', async () => {
    const onFrameData = jest.fn()
    const { pyramid, nativeSize } = _buildPerFrameImagePyramid({
      placement,
      fitResolution: 1,
      segmentation,
      channelId: 2,
    })
    const load = _createPerFrameImageLoadFunction({
      pyramid,
      client,
      channel: 2,
      labelmapSegmentNumber: 2,
      frameDataCache: new Map(),
      targetElement: document.createElement('div'),
      getPalette: () => ({ colormap: [[0, 0, 0, 0]], windowCenter: 0.5, windowWidth: 1 }),
      onFrameData,
      nativeSize,
    })

    load({ getImage: () => ({ src: '' }) })
    await flushPromises()

    expect(onFrameData).toHaveBeenCalledWith(new Uint8Array([0, 1, 2, 1]))
  })

  it('reuses the frame when the source is rebuilt', async () => {
    const frameDataCache = new Map()
    const { load, image } = createLabelmapLoader({
      client,
      frameDataCache,
      segmentNumber: 1,
    })

    load(image)
    load(image)
    await flushPromises()
    load(image)
    await flushPromises()

    expect(client.retrieveInstanceFrames).toHaveBeenCalledTimes(1)
  })

  it('retries a frame whose load failed', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    client.retrieveInstanceFrames.mockImplementationOnce(() =>
      Promise.reject(new Error('network')),
    )
    const frameDataCache = new Map()
    const { load, image, imageElement } = createLabelmapLoader({
      client,
      frameDataCache,
      segmentNumber: 1,
    })

    load(image)
    await flushPromises()
    expect(imageElement.src).toBe('')
    expect(frameDataCache.has(framePath)).toBe(false)

    load(image)
    await flushPromises()
    expect(client.retrieveInstanceFrames).toHaveBeenCalledTimes(2)
    expect(imageElement.src).toMatch(/^data:image\/png/)
    console.error.mockRestore()
  })
})
