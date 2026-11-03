const colorCase = require('../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json')
const multiplexCase = require('../test/data/HTA9_1_BA_L.json')

jest.mock('./decode.js', () => ({
  _decodeAndTransformFrame: jest.fn(),
}))
jest.mock('./webWorker/webWorkerManager.js', () => ({
  __esModule: true,
  default: { retain: jest.fn(), release: jest.fn() },
}))

const { _decodeAndTransformFrame } = require('./decode.js')
const webWorkerManager = require('./webWorker/webWorkerManager.js').default
const dmv = require('./dicom-microscopy-viewer.js')
const { _groupVolumeImages, _retrieveTile } = require('./pyramid.js')

const buildMetadata = (testCase) =>
  testCase.images.map(
    (metadata) => new dmv.metadata.VLWholeSlideMicroscopyImage({ metadata }),
  )

const createClient = () => ({
  wadoURL: 'https://dicomweb.example',
  retrieveInstanceFrames: jest.fn(() =>
    Promise.resolve([new ArrayBuffer(8)]),
  ),
})

const createReader = (testCase = multiplexCase, options = {}) => {
  const client = options.client ?? createClient()
  const reader = new dmv.pyramid.VolumeImageReader({
    client,
    metadata: buildMetadata(testCase),
    ...options,
  })
  return { client, reader }
}

beforeEach(() => {
  jest.clearAllMocks()
  _decodeAndTransformFrame.mockImplementation(
    async ({ columns, rows, samplesPerPixel }) =>
      new Uint8Array(columns * rows * samplesPerPixel).fill(7),
  )
})

describe('VolumeImageReader', () => {
  it('exposes optical paths in the order of the image metadata', () => {
    const { reader } = createReader()
    const identifiers = reader.opticalPaths.map((item) => item.identifier)
    const { monochromeOpticalPathIdentifiers } = _groupVolumeImages({
      metadata: buildMetadata(multiplexCase),
    })
    expect(identifiers.length).toBeGreaterThan(1)
    expect(identifiers).toEqual(monochromeOpticalPathIdentifiers)
    expect(reader.opticalPaths[0]).toBeInstanceOf(dmv.opticalPath.OpticalPath)
    expect(reader.opticalPaths[0].isMonochromatic).toBe(true)
  })

  it('maps pixel to slide coordinates like the viewer utilities', () => {
    const { reader } = createReader()
    const base = reader.getOpticalPathMetadata(
      reader.opticalPaths[0].identifier,
    )[reader.levels.length - 1]
    const origin = base.TotalPixelMatrixOriginSequence[0]
    const expected = dmv.utils.buildTransform({
      offset: [
        Number(origin.XOffsetInSlideCoordinateSystem),
        Number(origin.YOffsetInSlideCoordinateSystem),
      ],
      orientation: base.ImageOrientationSlide,
      spacing: reader.levels[reader.levels.length - 1].pixelSpacing.slice(0),
    })
    expect(reader.affine).toEqual(expected)
    expect(Object.isFrozen(reader.affine[0])).toBe(true)

    const slide = dmv.utils.applyTransform({
      coordinate: [100, 200],
      affine: reader.affine,
    })
    const pixel = dmv.utils.applyInverseTransform({
      coordinate: slide,
      affine: reader.affineInverse,
    })
    /** applyTransform rounds slide coordinates to 0.1 micrometer */
    expect(Math.abs(pixel[0] - 100)).toBeLessThan(0.5)
    expect(Math.abs(pixel[1] - 200)).toBeLessThan(0.5)
    expect(reader.frameOfReferenceUID).toBe(base.FrameOfReferenceUID)
  })

  it('marks THUMBNAIL levels and drops them with skipThumbnails', () => {
    const { reader } = createReader(colorCase)
    expect(reader.levels.map((level) => level.imageFlavor)).toContain(
      'THUMBNAIL',
    )
    const skipped = createReader(colorCase, { skipThumbnails: true }).reader
    const flavors = skipped.levels.map((level) => level.imageFlavor)
    expect(flavors).not.toContain('THUMBNAIL')
    expect(
      new Set(skipped.levels.map((level) => level.tileColumns)).size,
    ).toBe(1)
  })

  it('exposes pyramid levels from lowest to highest resolution', () => {
    const { reader } = createReader()
    const { levels } = reader
    expect(levels.length).toBeGreaterThan(1)
    expect(levels[levels.length - 1].downsampleFactor).toBe(1)
    levels.forEach((level, index) => {
      expect(level.index).toBe(index)
      expect(level.downsampleFactor).toBeCloseTo(
        levels[levels.length - 1].totalPixelMatrixColumns /
          level.totalPixelMatrixColumns,
        10,
      )
      expect(level.gridColumns).toBe(
        Math.ceil(level.totalPixelMatrixColumns / level.tileColumns),
      )
      expect(level.gridRows).toBe(
        Math.ceil(level.totalPixelMatrixRows / level.tileRows),
      )
      expect(level.pixelSpacing).toHaveLength(2)
      if (index > 0) {
        expect(level.totalPixelMatrixColumns).toBeGreaterThan(
          levels[index - 1].totalPixelMatrixColumns,
        )
      }
    })
    expect(Object.isFrozen(levels)).toBe(true)
  })

  it('describes the pixel layout of an optical path', () => {
    const { reader } = createReader()
    const identifier = reader.opticalPaths[0].identifier
    expect(reader.getPixelInfo(identifier)).toEqual({
      samplesPerPixel: 1,
      bitsAllocated: 8,
      pixelRepresentation: 0,
      photometricInterpretation: 'MONOCHROME2',
      arrayType: 'Uint8Array',
    })
    expect(reader.getOpticalPathMetadata(identifier)).toHaveLength(
      reader.levels.length,
    )
  })

  it('reads a single color optical path', () => {
    const { reader } = createReader(colorCase)
    expect(reader.opticalPaths).toHaveLength(1)
    const identifier = reader.opticalPaths[0].identifier
    expect(reader.getPixelInfo(identifier).samplesPerPixel).toBe(3)
  })

  it('throws for an unknown optical path', () => {
    const { reader } = createReader()
    expect(() => reader.getPixelInfo('does-not-exist')).toThrow(
      'Could not find optical path "does-not-exist".',
    )
  })

  it('retains web workers on construction and releases them once', () => {
    const { reader } = createReader()
    expect(webWorkerManager.retain).toHaveBeenCalledTimes(1)
    reader.destroy()
    reader.destroy()
    expect(webWorkerManager.release).toHaveBeenCalledTimes(1)
  })

  describe('getTile', () => {
    const lastTile = (reader) => {
      const level = reader.levels[reader.levels.length - 1]
      return {
        level: level.index,
        column: level.gridColumns - 1,
        row: level.gridRows - 1,
        levelInfo: level,
      }
    }

    it('returns native decoded pixels', async () => {
      const { client, reader } = createReader()
      const identifier = reader.opticalPaths[0].identifier
      const tile = await reader.getTile({
        opticalPathIdentifier: identifier,
        level: 0,
        column: 0,
        row: 0,
      })
      expect(tile.pixelArray).toBeInstanceOf(Uint8Array)
      expect(tile.isEmpty).toBe(false)
      expect(tile.columns).toBe(reader.levels[0].tileColumns)
      expect(tile.rows).toBe(reader.levels[0].tileRows)
      expect(tile.samplesPerPixel).toBe(1)
      expect(client.retrieveInstanceFrames).toHaveBeenCalledTimes(1)
      /** Every request is cancellable, so that destroy() can abort it */
      const { request } = client.retrieveInstanceFrames.mock.calls[0][0]
      expect(request.instance).toBeInstanceOf(XMLHttpRequest)
      expect(request.signal.aborted).toBe(false)
    })

    it('reports the valid region of edge tiles', async () => {
      const { reader } = createReader()
      const { level, column, row, levelInfo } = lastTile(reader)
      const tile = await reader.getTile({
        opticalPathIdentifier: reader.opticalPaths[0].identifier,
        level,
        column,
        row,
      })
      expect(tile.validColumns).toBe(
        levelInfo.totalPixelMatrixColumns - column * levelInfo.tileColumns,
      )
      expect(tile.validRows).toBe(
        levelInfo.totalPixelMatrixRows - row * levelInfo.tileRows,
      )
    })

    it('rejects tiles outside of the grid', async () => {
      const { client, reader } = createReader()
      const { level, levelInfo } = lastTile(reader)
      await expect(
        reader.getTile({
          opticalPathIdentifier: reader.opticalPaths[0].identifier,
          level,
          column: levelInfo.gridColumns,
          row: 0,
        }),
      ).rejects.toThrow(RangeError)
      await expect(
        reader.getTile({
          opticalPathIdentifier: reader.opticalPaths[0].identifier,
          level: reader.levels.length,
          column: 0,
          row: 0,
        }),
      ).rejects.toThrow(RangeError)
      expect(client.retrieveInstanceFrames).not.toHaveBeenCalled()
    })

    it('rejects with an AbortError without requesting when already aborted', async () => {
      const { client, reader } = createReader()
      const controller = new AbortController()
      controller.abort()
      await expect(
        reader.getTile({
          opticalPathIdentifier: reader.opticalPaths[0].identifier,
          level: 0,
          column: 0,
          row: 0,
          signal: controller.signal,
        }),
      ).rejects.toMatchObject({ name: 'AbortError' })
      expect(client.retrieveInstanceFrames).not.toHaveBeenCalled()
    })

    it('aborts the HTTP request when the signal is aborted', async () => {
      const client = createClient()
      let rejectRequest
      client.retrieveInstanceFrames.mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            rejectRequest = reject
          }),
      )
      const { reader } = createReader(multiplexCase, { client })
      const controller = new AbortController()
      const promise = reader.getTile({
        opticalPathIdentifier: reader.opticalPaths[0].identifier,
        level: 0,
        column: 0,
        row: 0,
        signal: controller.signal,
      })
      await new Promise((resolve) => setTimeout(resolve, 0))

      const { instance, signal } =
        client.retrieveInstanceFrames.mock.calls[0][0].request
      expect(instance).toBeInstanceOf(XMLHttpRequest)
      expect(signal.aborted).toBe(false)
      /** Stands in for dicomweb-client's response handler */
      const clientHandler = jest.fn()
      instance.onreadystatechange = clientHandler
      const abortSpy = jest.spyOn(instance, 'abort')
      controller.abort()
      expect(signal.aborted).toBe(true)
      expect(instance.onreadystatechange).toBe(null)
      expect(clientHandler).not.toHaveBeenCalled()
      /** dicomweb-client rejects the aborted request as a failed request */
      rejectRequest(new Error('request failed'))

      await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
      expect(abortSpy).toHaveBeenCalledTimes(1)
      expect(_decodeAndTransformFrame).not.toHaveBeenCalled()
    })

    it('rejects on abort while ICC profiles are being fetched', async () => {
      const { client, reader } = createReader(colorCase, {
        iccProfilesEnabled: true,
      })
      jest
        .spyOn(reader, '_getIccProfiles')
        .mockReturnValue(new Promise(() => {}))
      const controller = new AbortController()
      const promise = reader.getTile({
        opticalPathIdentifier: reader.opticalPaths[0].identifier,
        level: 0,
        column: 0,
        row: 0,
        signal: controller.signal,
      })
      controller.abort()
      await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
      expect(client.retrieveInstanceFrames).not.toHaveBeenCalled()
    })

    it('rejects with a custom abort reason', async () => {
      const { reader } = createReader()
      const controller = new AbortController()
      const reason = new Error('tile no longer visible')
      controller.abort(reason)
      await expect(
        reader.getTile({
          opticalPathIdentifier: reader.opticalPaths[0].identifier,
          level: 0,
          column: 0,
          row: 0,
          signal: controller.signal,
        }),
      ).rejects.toBe(reason)
    })

    it('keeps the request error as cause of a failure', async () => {
      const client = createClient()
      const requestError = new Error('request failed')
      requestError.status = 503
      client.retrieveInstanceFrames.mockRejectedValue(requestError)
      const { reader } = createReader(multiplexCase, { client })
      const error = await reader
        .getTile({
          opticalPathIdentifier: reader.opticalPaths[0].identifier,
          level: 0,
          column: 0,
          row: 0,
        })
        .catch((e) => e)
      expect(error.message).toMatch(/^Failed to load frames/)
      expect(error.cause).toBe(requestError)
      expect(error.cause.status).toBe(503)
    })

    it('cancels tiles in flight when the reader is destroyed', async () => {
      const client = createClient()
      client.retrieveInstanceFrames.mockImplementation(
        () => new Promise(() => {}),
      )
      const { reader } = createReader(multiplexCase, { client })
      const promise = reader.getTile({
        opticalPathIdentifier: reader.opticalPaths[0].identifier,
        level: 0,
        column: 0,
        row: 0,
      })
      await new Promise((resolve) => setTimeout(resolve, 0))
      const { instance } = client.retrieveInstanceFrames.mock.calls[0][0].request
      const abortSpy = jest.spyOn(instance, 'abort')

      reader.destroy()

      await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
      expect(abortSpy).toHaveBeenCalledTimes(1)
      /** No decode task may be queued after the workers were released */
      expect(_decodeAndTransformFrame).not.toHaveBeenCalled()
    })

    it('cleans up when the client throws synchronously', async () => {
      const client = createClient()
      const syncError = new Error('frame numbers are required')
      client.retrieveInstanceFrames.mockImplementation(() => {
        throw syncError
      })
      const { reader } = createReader(multiplexCase, { client })
      const controller = new AbortController()
      const error = await reader
        .getTile({
          opticalPathIdentifier: reader.opticalPaths[0].identifier,
          level: 0,
          column: 0,
          row: 0,
          signal: controller.signal,
        })
        .catch((e) => e)
      expect(error.cause).toBe(syncError)
      /** A later abort must not produce an unhandled rejection */
      controller.abort()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    it('rejects after the reader has been destroyed', async () => {
      const { reader } = createReader()
      reader.destroy()
      await expect(
        reader.getTile({
          opticalPathIdentifier: reader.opticalPaths[0].identifier,
          level: 0,
          column: 0,
          row: 0,
        }),
      ).rejects.toThrow('destroyed')
    })
  })
})

describe('_retrieveTile', () => {
  it('resolves missing TILED_SPARSE frames without a request', async () => {
    const client = createClient()
    const tile = await _retrieveTile({
      pyramid: {
        metadata: [
          {
            Columns: 2,
            Rows: 2,
            BitsAllocated: 16,
            SamplesPerPixel: 1,
            PhotometricInterpretation: 'MONOCHROME2',
          },
        ],
        frameMappings: [{}],
        dimensionOrganizationTypes: ['TILED_SPARSE'],
      },
      client,
      channel: '1',
      level: 0,
      column: 0,
      row: 0,
    })
    expect(tile.isEmpty).toBe(true)
    expect(Array.from(tile.pixelArray)).toEqual([0, 0, 0, 0])
    expect(client.retrieveInstanceFrames).not.toHaveBeenCalled()
  })
})
