import { _downsampleQuadrants } from './downsample.js'

/**
 * Value Viv expects a pixel source to throw for an aborted request. Equal to
 * `SIGNAL_ABORTED` exported by `@vivjs/loaders`.
 */
const SIGNAL_ABORTED = '__vivSignalAborted'

/** Largest number of tiles that getRaster() stitches into one raster */
const MAX_RASTER_TILES = 16

const _width = Symbol('width')
const _height = Symbol('height')
const _samplesPerPixel = Symbol('samplesPerPixel')
const _channels = Symbol('channels')
const _reader = Symbol('reader')
const _readerLevel = Symbol('readerLevel')
const _parent = Symbol('parent')

/**
 * Whether an error means that the request was aborted rather than failed.
 *
 * @private
 */
const _isAbort = (error, signal) =>
  error === SIGNAL_ABORTED ||
  signal?.aborted === true ||
  error?.name === 'AbortError'

/**
 * Viv pixel source of one pyramid level (Viv's `PixelSource` interface).
 *
 * @private
 */
class _PixelSource {
  constructor({
    width,
    height,
    tileSize,
    dtype,
    channels,
    samplesPerPixel,
    pixelSpacing,
  }) {
    this[_width] = width
    this[_height] = height
    this[_samplesPerPixel] = samplesPerPixel
    this[_channels] = channels
    this.tileSize = tileSize
    this.dtype = dtype
    const physicalSizes = {
      x: { size: pixelSpacing[1] * 1000, unit: 'µm' },
      y: { size: pixelSpacing[0] * 1000, unit: 'µm' },
    }
    if (samplesPerPixel === 1) {
      this.shape = [channels.length, height, width]
      this.labels = ['c', 'y', 'x']
      this.meta = { physicalSizes }
    } else {
      this.shape = [channels.length, height, width, samplesPerPixel]
      this.labels = ['c', 'y', 'x', '_c']
      /** Color images are decoded to RGB */
      this.meta = { physicalSizes, photometricInterpretation: 2 }
    }
  }

  /**
   * Get a tile. Tiles at the right and bottom border are cropped to the
   * image, like those of Viv's own pixel sources.
   *
   * @param {Object} options - Options
   * @param {number} options.x - Tile column
   * @param {number} options.y - Tile row
   * @param {Object} options.selection - Selection, e.g. `{ c: 0 }`
   * @param {AbortSignal} [options.signal] - Signal to cancel the request
   * @returns {Promise<Object>} `data`, `width` and `height`
   */
  async getTile({ x, y, selection, signal }) {
    if (signal?.aborted) {
      throw SIGNAL_ABORTED
    }
    let tile
    try {
      tile = await this._readTile({ x, y, selection, signal })
    } catch (error) {
      if (_isAbort(error, signal)) {
        throw SIGNAL_ABORTED
      }
      throw error
    }
    if (signal?.aborted) {
      throw SIGNAL_ABORTED
    }
    return tile
  }

  /**
   * Get the whole level as one raster. Viv uses it for the background image
   * of the lowest resolution level.
   *
   * @param {Object} options - Options
   * @param {Object} options.selection - Selection, e.g. `{ c: 0 }`
   * @param {AbortSignal} [options.signal] - Signal to cancel the request
   * @returns {Promise<Object>} `data`, `width` and `height`
   */
  async getRaster({ selection, signal }) {
    const width = this[_width]
    const height = this[_height]
    const gridColumns = Math.ceil(width / this.tileSize)
    const gridRows = Math.ceil(height / this.tileSize)
    if (gridColumns === 1 && gridRows === 1) {
      return this.getTile({ x: 0, y: 0, selection, signal })
    }
    if (gridColumns * gridRows > MAX_RASTER_TILES) {
      throw new Error(
        `Cannot get a raster of ${width} x ${height} pixels made of ` +
          `${gridColumns * gridRows} tiles. Set "excludeBackground: true" ` +
          'on the MultiscaleImageLayer.',
      )
    }
    const positions = []
    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridColumns; x++) {
        positions.push({ x, y })
      }
    }
    const tiles = await Promise.all(
      positions.map(({ x, y }) => this.getTile({ x, y, selection, signal })),
    )
    const samplesPerPixel = this[_samplesPerPixel]
    const data = new tiles[0].data.constructor(width * height * samplesPerPixel)
    tiles.forEach((tile, index) => {
      const { x, y } = positions[index]
      const rowLength = tile.width * samplesPerPixel
      for (let row = 0; row < tile.height; row++) {
        const target =
          ((y * this.tileSize + row) * width + x * this.tileSize) *
          samplesPerPixel
        data.set(
          tile.data.subarray(row * rowLength, (row + 1) * rowLength),
          target,
        )
      }
    })
    return { data, width, height }
  }

  /**
   * Report a tile that failed to load. Aborted tiles are not reported.
   *
   * @param {Error} error - Error
   */
  onTileError(error) {
    if (error !== SIGNAL_ABORTED) {
      console.error('Failed to load tile:', error)
    }
  }

  /**
   * Optical Path Identifier of the selected channel.
   *
   * @private
   */
  _getOpticalPathIdentifier(selection) {
    const channel = selection?.c ?? 0
    const identifier = this[_channels][channel]
    if (identifier === undefined) {
      throw new RangeError(
        `Channel ${channel} does not exist; the image has ` +
          `${this[_channels].length} channels.`,
      )
    }
    return identifier
  }
}

/**
 * Pixel source of a DICOM pyramid level.
 *
 * @private
 */
class _DicomPixelSource extends _PixelSource {
  constructor({ reader, readerLevel, ...options }) {
    super(options)
    this[_reader] = reader
    this[_readerLevel] = readerLevel
  }

  /**
   * @private
   */
  async _readTile({ x, y, selection, signal }) {
    const tile = await this[_reader].getTile({
      opticalPathIdentifier: this._getOpticalPathIdentifier(selection),
      level: this[_readerLevel],
      column: x,
      row: y,
      signal,
      crop: true,
    })
    return { data: tile.pixelArray, width: tile.columns, height: tile.rows }
  }
}

/**
 * Pixel source of a level that the DICOM pyramid lacks, computed by
 * downsampling the next higher resolution level by a factor of 2.
 *
 * @private
 */
class _SyntheticPixelSource extends _PixelSource {
  constructor({ parent, ...options }) {
    super(options)
    this[_parent] = parent
  }

  /**
   * @private
   */
  async _readTile({ x, y, selection, signal }) {
    const parent = this[_parent]
    const tileSize = this.tileSize
    const parentColumns = Math.ceil(parent[_width] / tileSize)
    const parentRows = Math.ceil(parent[_height] / tileSize)
    const quadrants = await Promise.all(
      [
        [2 * x, 2 * y],
        [2 * x + 1, 2 * y],
        [2 * x, 2 * y + 1],
        [2 * x + 1, 2 * y + 1],
      ].map(([column, row]) =>
        column < parentColumns && row < parentRows
          ? parent.getTile({ x: column, y: row, selection, signal })
          : undefined,
      ),
    )
    const width = Math.min(tileSize, this[_width] - x * tileSize)
    const height = Math.min(tileSize, this[_height] - y * tileSize)
    const data = _downsampleQuadrants({
      quadrants,
      tileSize,
      samplesPerPixel: this[_samplesPerPixel],
      width,
      height,
      ArrayType: quadrants[0].data.constructor,
    })
    return { data, width, height }
  }
}

export { _DicomPixelSource, _SyntheticPixelSource, SIGNAL_ABORTED }
