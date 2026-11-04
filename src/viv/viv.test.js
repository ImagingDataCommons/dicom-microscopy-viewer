const colorCase = require('../../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json')
const multiplexCase = require('../../test/data/HTA9_1_BA_L.json')

jest.mock('../decode.js', () => ({
  _decodeAndTransformFrame: jest.fn(),
}))
jest.mock('../webWorker/webWorkerManager.js', () => ({
  __esModule: true,
  default: { retain: jest.fn(), release: jest.fn() },
}))

const dmv = require('../dicom-microscopy-viewer.js')
const { SIGNAL_ABORTED } = require('./index.js')
const { _downsampleQuadrants } = require('./downsample.js')

const seriesOptions = {
  studyInstanceUID: '1.2.3',
  seriesInstanceUID: '1.2.3.4',
}

const createSeriesClient = (testCase) => ({
  wadoURL: 'https://dicomweb.example',
  retrieveSeriesMetadata: jest.fn(() => Promise.resolve(testCase.images)),
  retrieveInstanceFrames: jest.fn(() => Promise.resolve([new ArrayBuffer(8)])),
})

/**
 * Minimal stand-in for a VolumeImageReader whose tiles hold, for every
 * pixel, `level * 1000000 + row * 1000 + column` of the total pixel matrix
 * (single sample) and that crops edge tiles like getTile({ crop: true }).
 */
const createFakeReader = ({
  levels,
  arrayType = 'Float32Array',
  samplesPerPixel = 1,
  opticalPaths = ['0', '1'],
  valueAt = (level, row, column) => level * 1000000 + row * 1000 + column,
}) => {
  const ArrayType = globalThis[arrayType]
  const reader = {
    opticalPaths: opticalPaths.map((identifier) => ({ identifier })),
    levels: levels.map(([columns, rows, tileSize, spacing], index) => ({
      index,
      totalPixelMatrixColumns: columns,
      totalPixelMatrixRows: rows,
      tileColumns: tileSize,
      tileRows: tileSize,
      pixelSpacing: [spacing, spacing],
    })),
    getPixelInfo: jest.fn(() => ({ arrayType, samplesPerPixel })),
    getTile: jest.fn(async ({ level, column, row, crop }) => {
      const info = reader.levels[level]
      const tileSize = info.tileColumns
      if (
        column >= Math.ceil(info.totalPixelMatrixColumns / tileSize) ||
        row >= Math.ceil(info.totalPixelMatrixRows / tileSize)
      ) {
        throw new RangeError('Tile is outside of the tile grid.')
      }
      const width = crop
        ? Math.min(tileSize, info.totalPixelMatrixColumns - column * tileSize)
        : tileSize
      const height = crop
        ? Math.min(tileSize, info.totalPixelMatrixRows - row * tileSize)
        : tileSize
      const pixelArray = new ArrayType(width * height * samplesPerPixel)
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          const value = valueAt(level, row * tileSize + r, column * tileSize + c)
          for (let s = 0; s < samplesPerPixel; s++) {
            pixelArray[(r * width + c) * samplesPerPixel + s] = value
          }
        }
      }
      return { pixelArray, columns: width, rows: height }
    }),
  }
  return reader
}

const imageSize = (source) => {
  const interleaved = source.labels[source.labels.length - 1] === '_c'
  const [height, width] = source.shape.slice(interleaved ? -3 : -2)
  return [width, height]
}

describe('viv.loadDicomWeb', () => {
  it('loads a monochrome series whose levels are 2 times apart', async () => {
    const client = createSeriesClient(multiplexCase)
    const { data, metadata } = await dmv.viv.loadDicomWeb({
      client,
      ...seriesOptions,
    })
    const { reader } = metadata
    expect(reader).toBeInstanceOf(dmv.pyramid.VolumeImageReader)
    expect(metadata.opticalPaths).toBe(reader.opticalPaths)
    /**
     * Highest resolution first, one source per DICOM level, with the sizes
     * Viv expects (the DICOM sizes were rounded down: 3875 -> 1937 -> 968)
     */
    const dicomSizes = reader.levels
      .map((level) => [
        level.totalPixelMatrixColumns,
        level.totalPixelMatrixRows,
      ])
      .reverse()
    expect(data).toHaveLength(dicomSizes.length)
    data.map(imageSize).forEach(([width, height], k) => {
      expect(width).toBe(Math.ceil(dicomSizes[0][0] / 2 ** k))
      expect(height).toBe(Math.ceil(dicomSizes[0][1] / 2 ** k))
      expect(Math.abs(width - dicomSizes[k][0])).toBeLessThanOrEqual(1)
      expect(Math.abs(height - dicomSizes[k][1])).toBeLessThanOrEqual(1)
    })
    const base = reader.levels[reader.levels.length - 1]
    for (const source of data) {
      expect(source.shape[0]).toBe(reader.opticalPaths.length)
      expect(source.labels).toEqual(['c', 'y', 'x'])
      expect(source.dtype).toBe('Uint8')
      expect(source.tileSize).toBe(base.tileColumns)
    }
    expect(data[0].meta.physicalSizes.x).toEqual({
      size: base.pixelSpacing[1] * 1000,
      unit: 'µm',
    })
  })

  it('adds computed levels to a color series whose levels are 4 times apart', async () => {
    const client = createSeriesClient(colorCase)
    const { data, metadata } = await dmv.viv.loadDicomWeb({
      client,
      ...seriesOptions,
    })
    const sizes = data.map(imageSize)
    /** Every level is half of the previous one, rounded up */
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toEqual([
        Math.ceil(sizes[i - 1][0] / 2),
        Math.ceil(sizes[i - 1][1] / 2),
      ])
    }
    const dicomSizes = metadata.reader.levels
      .filter((level) => level.imageFlavor === 'VOLUME')
      .map((level) => [
        level.totalPixelMatrixColumns,
        level.totalPixelMatrixRows,
      ])
    for (const size of dicomSizes) {
      expect(sizes).toContainEqual(size)
    }
    expect(sizes.length).toBeGreaterThan(dicomSizes.length)
    for (const source of data) {
      expect(source.shape[0]).toBe(1)
      expect(source.shape[3]).toBe(3)
      expect(source.labels).toEqual(['c', 'y', 'x', '_c'])
      expect(source.dtype).toBe('Uint8')
      expect(source.meta.photometricInterpretation).toBe(2)
    }
  })

  it('destroys the reader when the image is not supported', async () => {
    const client = createSeriesClient(multiplexCase)
    const webWorkerManager = require('../webWorker/webWorkerManager.js').default
    webWorkerManager.release.mockClear()
    const spy = jest
      .spyOn(dmv.pyramid.VolumeImageReader.prototype, 'getPixelInfo')
      .mockReturnValue({ arrayType: 'Uint32Array', samplesPerPixel: 1 })
    try {
      await expect(
        dmv.viv.loadDicomWeb({ client, ...seriesOptions }),
      ).rejects.toThrow('Uint32Array')
      expect(webWorkerManager.release).toHaveBeenCalledTimes(1)
    } finally {
      spy.mockRestore()
    }
  })
})

describe('viv.createPixelSources', () => {
  /** 4x steps: 2048 -> 512 -> 128, tile size 128 */
  const fourTimesLevels = [
    [128, 96, 128, 0.016],
    [512, 384, 128, 0.004],
    [2048, 1536, 128, 0.001],
  ]

  it('plans exact half levels and reuses DICOM levels', () => {
    const reader = createFakeReader({ levels: fourTimesLevels })
    const sources = dmv.viv.createPixelSources({ reader })
    expect(sources.map(imageSize)).toEqual([
      [2048, 1536],
      [1024, 768],
      [512, 384],
      [256, 192],
      [128, 96],
    ])
    /** Synthetic levels interpolate the pixel spacing */
    expect(sources[1].meta.physicalSizes.x.size).toBeCloseTo(2)
  })

  it('stops after maxSyntheticLevels consecutive computed levels', () => {
    const reader = createFakeReader({ levels: [[2048, 2048, 128, 0.001]] })
    expect(
      dmv.viv.createPixelSources({ reader, maxSyntheticLevels: 1 }).length,
    ).toBe(2)
    expect(dmv.viv.createPixelSources({ reader }).length).toBe(3)
  })

  it('reads cropped tiles of DICOM levels', async () => {
    const reader = createFakeReader({ levels: fourTimesLevels })
    const [base] = dmv.viv.createPixelSources({ reader })
    const tile = await base.getTile({ x: 15, y: 11, selection: { c: 1 } })
    expect(reader.getTile).toHaveBeenCalledWith(
      expect.objectContaining({
        opticalPathIdentifier: '1',
        level: 2,
        column: 15,
        row: 11,
        crop: true,
      }),
    )
    expect(tile.width).toBe(128)
    expect(tile.data[0]).toBe(2000000 + 11 * 128 * 1000 + 15 * 128)
  })

  it('computes tiles of synthetic levels from 4 tiles of the previous level', async () => {
    const reader = createFakeReader({ levels: fourTimesLevels })
    const sources = dmv.viv.createPixelSources({ reader })
    const tile = await sources[1].getTile({ x: 1, y: 2, selection: { c: 0 } })
    const requested = reader.getTile.mock.calls.map(([options]) => [
      options.level,
      options.column,
      options.row,
    ])
    expect(requested).toEqual([
      [2, 2, 4],
      [2, 3, 4],
      [2, 2, 5],
      [2, 3, 5],
    ])
    expect(tile.width).toBe(128)
    expect(tile.height).toBe(128)
    /** Mean of the 2 x 2 base pixels at row 512, column 256 */
    const base = 2000000 + 512 * 1000 + 256
    expect(tile.data[0]).toBe(base + 500.5)
  })

  it('computes synthetic levels from synthetic levels', async () => {
    const reader = createFakeReader({ levels: [[1000, 600, 128, 0.001]] })
    const sources = dmv.viv.createPixelSources({ reader })
    expect(sources.map(imageSize)).toEqual([
      [1000, 600],
      [500, 300],
      [250, 150],
    ])
    /** Edge tile of the second synthetic level: 16 base tiles, cropped */
    const tile = await sources[2].getTile({ x: 1, y: 1, selection: { c: 0 } })
    expect(tile.width).toBe(250 - 128)
    expect(tile.height).toBe(150 - 128)
    /** Only tiles inside the image are read */
    expect(reader.getTile).toHaveBeenCalledTimes(4)
  })

  it('maps aborts to SIGNAL_ABORTED and rethrows other errors', async () => {
    const reader = createFakeReader({ levels: fourTimesLevels })
    const [base, synthetic] = dmv.viv.createPixelSources({ reader })
    const selection = { c: 0 }

    const aborted = new AbortController()
    aborted.abort()
    await expect(
      base.getTile({ x: 0, y: 0, selection, signal: aborted.signal }),
    ).rejects.toBe(SIGNAL_ABORTED)
    expect(reader.getTile).not.toHaveBeenCalled()

    reader.getTile.mockRejectedValueOnce(
      new DOMException('The reader has been destroyed.', 'AbortError'),
    )
    await expect(base.getTile({ x: 0, y: 0, selection })).rejects.toBe(
      SIGNAL_ABORTED,
    )

    const failure = new Error('Failed to load frames')
    reader.getTile.mockRejectedValueOnce(failure)
    await expect(synthetic.getTile({ x: 0, y: 0, selection })).rejects.toBe(
      failure,
    )

    /** Aborted while the tile was being read */
    const controller = new AbortController()
    reader.getTile.mockImplementationOnce(async () => {
      controller.abort()
      return { pixelArray: new Float32Array(1), columns: 1, rows: 1 }
    })
    await expect(
      base.getTile({ x: 0, y: 0, selection, signal: controller.signal }),
    ).rejects.toBe(SIGNAL_ABORTED)
  })

  it('returns rasters of single-tile and small multi-tile levels', async () => {
    const reader = createFakeReader({ levels: fourTimesLevels })
    const sources = dmv.viv.createPixelSources({ reader })
    const lowest = sources[sources.length - 1]
    const raster = await lowest.getRaster({ selection: { c: 0 } })
    expect([raster.width, raster.height]).toEqual([128, 96])

    /** 4 x 3 tiles, stitched */
    const stitched = await sources[2].getRaster({ selection: { c: 0 } })
    expect([stitched.width, stitched.height]).toEqual([512, 384])
    expect(stitched.data[383 * 512 + 511]).toBe(1000000 + 383 * 1000 + 511)
    expect(stitched.data[200 * 512 + 300]).toBe(1000000 + 200 * 1000 + 300)

    /** 16 x 12 tiles are too many for a raster */
    expect(sources[0].getRaster).toBeUndefined()
  })

  it('rejects channels that do not exist', async () => {
    const reader = createFakeReader({ levels: fourTimesLevels })
    const [base] = dmv.viv.createPixelSources({ reader })
    await expect(
      base.getTile({ x: 0, y: 0, selection: { c: 2 } }),
    ).rejects.toThrow(RangeError)
  })

  it('rejects images that Viv cannot display', () => {
    expect(() =>
      dmv.viv.createPixelSources({
        reader: createFakeReader({ levels: [[1000, 1000, 240, 0.001]] }),
      }),
    ).toThrow('power-of-2')
    expect(() =>
      dmv.viv.createPixelSources({
        reader: createFakeReader({
          levels: fourTimesLevels,
          arrayType: 'Uint32Array',
        }),
      }),
    ).toThrow('Uint32Array')
    expect(() =>
      dmv.viv.createPixelSources({
        reader: createFakeReader({
          levels: fourTimesLevels,
          arrayType: 'Uint16Array',
          samplesPerPixel: 3,
          opticalPaths: ['0'],
        }),
      }),
    ).toThrow('8 bits per sample')
  })

  it('does not report aborted tiles as errors', () => {
    const reader = createFakeReader({ levels: fourTimesLevels })
    const [base] = dmv.viv.createPixelSources({ reader })
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    try {
      base.onTileError(SIGNAL_ABORTED)
      expect(spy).not.toHaveBeenCalled()
      base.onTileError(new Error('failed'))
      expect(spy).toHaveBeenCalledTimes(1)
    } finally {
      spy.mockRestore()
    }
  })
})

describe('_downsampleQuadrants', () => {
  it('averages only pixels inside the image', () => {
    /** Tile size 2: a 3 x 3 image, so the right and bottom tiles are cropped */
    const quadrants = [
      { data: Uint8Array.from([0, 2, 4, 6]), width: 2, height: 2 },
      { data: Uint8Array.from([100, 102]), width: 1, height: 2 },
      { data: Uint8Array.from([10, 30]), width: 2, height: 1 },
      { data: Uint8Array.from([255]), width: 1, height: 1 },
    ]
    const output = _downsampleQuadrants({
      quadrants,
      tileSize: 2,
      samplesPerPixel: 1,
      width: 2,
      height: 2,
      ArrayType: Uint8Array,
    })
    expect(Array.from(output)).toEqual([3, 101, 20, 255])
  })

  it('keeps interleaved samples apart and does not round floats', () => {
    const output = _downsampleQuadrants({
      quadrants: [
        {
          data: Float32Array.from([1, 10, 2, 20, 3, 30, 5, 50]),
          width: 2,
          height: 2,
        },
        undefined,
        undefined,
        undefined,
      ],
      tileSize: 2,
      samplesPerPixel: 2,
      width: 1,
      height: 1,
      ArrayType: Float32Array,
    })
    expect(Array.from(output)).toEqual([2.75, 27.5])
  })
})

describe('Viv contract', () => {
  it('throws the SIGNAL_ABORTED value of @vivjs/loaders', () => {
    /**
     * @vivjs/loaders is an ES module with ES module dependencies that Jest
     * cannot load here, so the constant is read from its source.
     */
    const fs = require('node:fs')
    const path = require('node:path')
    const source = fs.readFileSync(
      path.join(
        __dirname,
        '../../node_modules/@vivjs/loaders/dist/index.mjs',
      ),
      'utf8',
    )
    const match = source.match(/const SIGNAL_ABORTED = "([^"]+)"/)
    expect(match).not.toBeNull()
    expect(SIGNAL_ABORTED).toBe(match[1])
  })
})

describe('viv pixel sources and the Viv tile grid', () => {
  /** Every tile Viv requests, from the size of the highest resolution level */
  const readAllTiles = async (sources) => {
    const [, height, width] = sources[0].shape
    const tileSize = sources[0].tileSize
    const tiles = []
    for (let k = 0; k < sources.length; k++) {
      const levelWidth = Math.ceil(width / 2 ** k)
      const levelHeight = Math.ceil(height / 2 ** k)
      for (let y = 0; y < Math.ceil(levelHeight / tileSize); y++) {
        for (let x = 0; x < Math.ceil(levelWidth / tileSize); x++) {
          const tile = await sources[k].getTile({ x, y, selection: { c: 0 } })
          expect(tile.width).toBe(Math.min(tileSize, levelWidth - x * tileSize))
          expect(tile.height).toBe(
            Math.min(tileSize, levelHeight - y * tileSize),
          )
          expect(tile.data).toHaveLength(tile.width * tile.height)
          tiles.push({ k, x, y, tile })
        }
      }
    }
    return tiles
  }

  it('serves every tile of DICOM levels whose size was rounded down', async () => {
    /** 1025 / 4 is 256.25: the DICOM level has 256 columns, Viv expects 257 */
    const reader = createFakeReader({
      levels: [
        [256, 256, 128, 0.004],
        [1025, 1025, 128, 0.001],
      ],
    })
    const sources = dmv.viv.createPixelSources({ reader })
    expect(sources.map(imageSize)).toEqual([
      [1025, 1025],
      [513, 513],
      [257, 257],
      [129, 129],
      [65, 65],
    ])
    const tiles = await readAllTiles(sources)
    /** The missing column repeats the last column of the DICOM level */
    const strip = tiles.find((t) => t.k === 2 && t.x === 2 && t.y === 0)
    expect(strip.tile.width).toBe(1)
    /** The 256 pixel DICOM level is level 0 of the fake reader */
    expect(strip.tile.data[0]).toBe(255)
    expect(strip.tile.data[127]).toBe(127 * 1000 + 255)
  })

  it('serves every tile of DICOM levels that are 1 pixel larger', async () => {
    const reader = createFakeReader({
      levels: [
        [258, 257, 128, 0.004],
        [1025, 1025, 128, 0.001],
      ],
    })
    const sources = dmv.viv.createPixelSources({ reader })
    await readAllTiles(sources)
  })

  it('rejects tiles outside of the tile grid', async () => {
    const reader = createFakeReader({ levels: [[1000, 600, 128, 0.001]] })
    const sources = dmv.viv.createPixelSources({ reader })
    await expect(
      sources[1].getTile({ x: 4, y: 0, selection: { c: 0 } }),
    ).rejects.toThrow(RangeError)
    await expect(
      sources[0].getTile({ x: -1, y: 0, selection: { c: 0 } }),
    ).rejects.toThrow(RangeError)
  })

  it('cancels the other tiles of a computed tile when one fails', async () => {
    const reader = createFakeReader({ levels: [[1024, 1024, 128, 0.001]] })
    const sources = dmv.viv.createPixelSources({ reader })
    const failure = new Error('Failed to load frames')
    const signals = []
    reader.getTile.mockImplementation(({ signal }) => {
      signals.push(signal)
      if (signals.length === 1) {
        return Promise.reject(failure)
      }
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason))
      })
    })
    await expect(
      sources[1].getTile({ x: 0, y: 0, selection: { c: 0 } }),
    ).rejects.toBe(failure)
    expect(signals).toHaveLength(4)
    expect(signals.slice(1).every((signal) => signal.aborted)).toBe(true)
  })

  it('omits getRaster for large lowest levels and warns when levels are missing', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const reader = createFakeReader({ levels: [[4096, 4096, 128, 0.001]] })
      const sources = dmv.viv.createPixelSources({
        reader,
        maxSyntheticLevels: 1,
      })
      expect(sources.map(imageSize)).toEqual([
        [4096, 4096],
        [2048, 2048],
      ])
      expect(sources[1].getRaster).toBeUndefined()
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('cannot zoom out beyond 2048 x 2048'),
      )
    } finally {
      warn.mockRestore()
    }
  })

  it('computes interleaved color tiles', async () => {
    const reader = createFakeReader({
      levels: [[512, 512, 256, 0.001]],
      arrayType: 'Uint8Array',
      samplesPerPixel: 3,
      opticalPaths: ['0'],
      valueAt: (_level, row, column) => (row + column) % 200,
    })
    const sources = dmv.viv.createPixelSources({ reader })
    const tile = await sources[1].getTile({ x: 0, y: 0, selection: { c: 0 } })
    expect(tile.data).toBeInstanceOf(Uint8Array)
    expect(tile.data).toHaveLength(256 * 256 * 3)
    /** Means of (0, 1, 1, 2) and (2, 3, 3, 4) */
    expect(Array.from(tile.data.subarray(0, 6))).toEqual([1, 1, 1, 3, 3, 3])
  })

  it('crops edge tiles of DICOM levels', async () => {
    const reader = createFakeReader({ levels: [[1000, 600, 128, 0.001]] })
    const [base] = dmv.viv.createPixelSources({ reader })
    const tile = await base.getTile({ x: 7, y: 4, selection: { c: 0 } })
    expect([tile.width, tile.height]).toEqual([1000 - 7 * 128, 600 - 4 * 128])
    expect(tile.data[0]).toBe(4 * 128 * 1000 + 7 * 128)
  })
})
