import { _downsampleQuadrants } from './downsample.js'

/**
 * Value Viv expects a pixel source to throw for an aborted request. Equal to
 * `SIGNAL_ABORTED` exported by `@vivjs/loaders`.
 */
const SIGNAL_ABORTED = '__vivSignalAborted'

/** Largest number of tiles that getRaster() stitches into one raster */
const MAX_RASTER_TILES = 16

/** TypedArray constructor of each Viv dtype */
const _typedArrays = {
  Uint8: Uint8Array,
  Int8: Int8Array,
  Uint16: Uint16Array,
  Int16: Int16Array,
  Float32: Float32Array,
  Float64: Float64Array,
}

const _width = Symbol('width')
const _height = Symbol('height')
const _samplesPerPixel = Symbol('samplesPerPixel')
const _channels = Symbol('channels')
const _reader = Symbol('reader')
const _readerLevel = Symbol('readerLevel')
const _readerWidth = Symbol('readerWidth')
const _readerHeight = Symbol('readerHeight')
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
 * Copy a tile into a tile of another size. Missing columns and rows repeat
 * the last column and row, surplus ones are dropped. With `onlyLastColumn`
 * or `onlyLastRow`, every column or row is a copy of the last one.
 *
 * @private
 */
const _fitTile = ({
  data,
  width,
  height,
  samplesPerPixel,
  targetWidth,
  targetHeight,
  onlyLastColumn = false,
  onlyLastRow = false,
}) => {
  const output = new data.constructor(
    targetWidth * targetHeight * samplesPerPixel,
  )
  for (let row = 0; row < targetHeight; row++) {
    const sourceRow = onlyLastRow ? height - 1 : Math.min(row, height - 1)
    for (let column = 0; column < targetWidth; column++) {
      const sourceColumn = onlyLastColumn
        ? width - 1
        : Math.min(column, width - 1)
      const source = (sourceRow * width + sourceColumn) * samplesPerPixel
      const target = (row * targetWidth + column) * samplesPerPixel
      for (let sample = 0; sample < samplesPerPixel; sample++) {
        output[target + sample] = data[source + sample]
      }
    }
  }
  return output
}

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
    if (this._getGridSize() > MAX_RASTER_TILES) {
      /**
       * Too large to load at once: without getRaster, Viv does not draw this
       * level as the background image.
       */
      this.getRaster = undefined
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
    const gridColumns = Math.ceil(this[_width] / this.tileSize)
    const gridRows = Math.ceil(this[_height] / this.tileSize)
    if (
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      x < 0 ||
      y < 0 ||
      x >= gridColumns ||
      y >= gridRows
    ) {
      throw new RangeError(
        `Tile (${x}, ${y}) is outside of the ${gridColumns} x ${gridRows} ` +
          'tile grid.',
      )
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
   * of the lowest resolution level. Levels of more than 16 tiles have no
   * `getRaster`.
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
   * Number of tiles of the level.
   *
   * @private
   */
  _getGridSize() {
    return (
      Math.ceil(this[_width] / this.tileSize) *
      Math.ceil(this[_height] / this.tileSize)
    )
  }

  /**
   * Size of a tile of the level, cropped to the image.
   *
   * @private
   */
  _getTileSize(x, y) {
    return {
      width: Math.min(this.tileSize, this[_width] - x * this.tileSize),
      height: Math.min(this.tileSize, this[_height] - y * this.tileSize),
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
 * The level may be 1 pixel larger or smaller than the size Viv expects (e.g.
 * when sizes were rounded down); tiles are fitted to the expected size.
 *
 * @private
 */
class _DicomPixelSource extends _PixelSource {
  constructor({ reader, readerLevel, readerWidth, readerHeight, ...options }) {
    super(options)
    this[_reader] = reader
    this[_readerLevel] = readerLevel
    this[_readerWidth] = readerWidth
    this[_readerHeight] = readerHeight
  }

  /**
   * @private
   */
  async _readTile({ x, y, selection, signal }) {
    const opticalPathIdentifier = this._getOpticalPathIdentifier(selection)
    const { width, height } = this._getTileSize(x, y)
    const samplesPerPixel = this[_samplesPerPixel]
    const readerColumns = Math.ceil(this[_readerWidth] / this.tileSize)
    const readerRows = Math.ceil(this[_readerHeight] / this.tileSize)
    if (x >= readerColumns || y >= readerRows) {
      /**
       * A strip of 1 pixel that the DICOM level lacks: repeat the edge of the
       * neighboring tile
       */
      const neighbor = await this._readTile({
        x: Math.min(x, readerColumns - 1),
        y: Math.min(y, readerRows - 1),
        selection,
        signal,
      })
      return {
        data: _fitTile({
          data: neighbor.data,
          width: neighbor.width,
          height: neighbor.height,
          samplesPerPixel,
          targetWidth: width,
          targetHeight: height,
          onlyLastColumn: x >= readerColumns,
          onlyLastRow: y >= readerRows,
        }),
        width,
        height,
      }
    }
    const tile = await this[_reader].getTile({
      opticalPathIdentifier,
      level: this[_readerLevel],
      column: x,
      row: y,
      signal,
      crop: true,
    })
    if (tile.columns === width && tile.rows === height) {
      return { data: tile.pixelArray, width, height }
    }
    return {
      data: _fitTile({
        data: tile.pixelArray,
        width: tile.columns,
        height: tile.rows,
        samplesPerPixel,
        targetWidth: width,
        targetHeight: height,
      }),
      width,
      height,
    }
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
    /** Cancel the other tiles when one fails or the caller aborts */
    const controller = new AbortController()
    const onAbort = () => controller.abort()
    signal?.addEventListener('abort', onAbort, { once: true })
    let quadrants
    try {
      quadrants = await Promise.all(
        [
          [2 * x, 2 * y],
          [2 * x + 1, 2 * y],
          [2 * x, 2 * y + 1],
          [2 * x + 1, 2 * y + 1],
        ].map(([column, row]) =>
          column < parentColumns && row < parentRows
            ? parent.getTile({
                x: column,
                y: row,
                selection,
                signal: controller.signal,
              })
            : undefined,
        ),
      )
    } catch (error) {
      controller.abort()
      throw error
    } finally {
      signal?.removeEventListener('abort', onAbort)
    }
    const { width, height } = this._getTileSize(x, y)
    const data = _downsampleQuadrants({
      quadrants,
      tileSize,
      samplesPerPixel: this[_samplesPerPixel],
      width,
      height,
      ArrayType: _typedArrays[this.dtype] ?? quadrants[0].data.constructor,
    })
    return { data, width, height }
  }
}

export { _DicomPixelSource, _SyntheticPixelSource, SIGNAL_ABORTED }
