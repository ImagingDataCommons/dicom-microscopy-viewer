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
const { _retrieveTile } = require('./pyramid.js')

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
  it('exposes optical paths sorted by identifier', () => {
    const { reader } = createReader()
    const identifiers = reader.opticalPaths.map((item) => item.identifier)
    expect(identifiers.length).toBeGreaterThan(1)
    expect(identifiers).toEqual(
      identifiers
        .slice()
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    )
    expect(reader.opticalPaths[0]).toBeInstanceOf(dmv.opticalPath.OpticalPath)
    expect(reader.opticalPaths[0].isMonochromatic).toBe(true)
  })

  it('exposes pyramid levels from lowest to highest resolution', () => {
    const { reader } = createReader()
    const { levels } = reader
    expect(levels.length).toBeGreaterThan(1)
    levels.forEach((level, index) => {
      expect(level.index).toBe(index)
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

    it('returns native decoded pixels without a request option', async () => {
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
      expect(client.retrieveInstanceFrames.mock.calls[0][0].request).toBe(
        undefined,
      )
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

      const { instance } = client.retrieveInstanceFrames.mock.calls[0][0].request
      expect(instance).toBeInstanceOf(XMLHttpRequest)
      const abortSpy = jest.spyOn(instance, 'abort')
      controller.abort()
      /** dicomweb-client rejects the aborted request as a failed request */
      rejectRequest(new Error('request failed'))

      await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
      expect(abortSpy).toHaveBeenCalledTimes(1)
      expect(_decodeAndTransformFrame).not.toHaveBeenCalled()
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
