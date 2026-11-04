import { _typedArrays } from '../volumeImageReader.js'
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
const _gridColumns = Symbol('gridColumns')
const _gridRows = Symbol('gridRows')
const _samplesPerPixel = Symbol('samplesPerPixel')
const _ArrayType = Symbol('ArrayType')
const _channels = Symbol('channels')
const _cache = Symbol('cache')
const _cacheKey = Symbol('cacheKey')
const _pending = Symbol('pending')
const _reader = Symbol('reader')
const _readerLevel = Symbol('readerLevel')
const _readerGridColumns = Symbol('readerGridColumns')
const _readerGridRows = Symbol('readerGridRows')
const _parent = Symbol('parent')

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
 * Wait for a promise, or reject with `SIGNAL_ABORTED` as soon as `signal` is
 * aborted.
 *
 * @private
 */
const _waitFor = (promise, signal) => {
  if (signal == null) {
    return promise
  }
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(SIGNAL_ABORTED)
      return
    }
    const onAbort = () => reject(SIGNAL_ABORTED)
    signal.addEventListener('abort', onAbort, { once: true })
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener('abort', onAbort))
  })
}

/**
 * Get several tiles of a pixel source at once. When one fails, or `signal`
 * is aborted, the others are cancelled.
 *
 * @param {_PixelSource} source - Pixel source
 * @param {Array<Object|undefined>} positions - Tile positions (`x`, `y`);
 * `undefined` resolves to `undefined`
 * @param {string} opticalPathIdentifier - Optical Path Identifier
 * @param {AbortSignal} [signal] - Signal of the caller
 * @returns {Promise<Array<Object|undefined>>} Tiles
 * @private
 */
const _getTiles = async (source, positions, opticalPathIdentifier, signal) => {
  const controller = new AbortController()
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })
  try {
    return await Promise.all(
      positions.map((position) =>
        position === undefined
          ? undefined
          : source._getTile(
              position.x,
              position.y,
              opticalPathIdentifier,
              controller.signal,
            ),
      ),
    )
  } catch (error) {
    controller.abort()
    throw signal?.aborted ? SIGNAL_ABORTED : error
  } finally {
    signal?.removeEventListener('abort', onAbort)
  }
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
    cache,
    cacheKey,
  }) {
    this[_width] = width
    this[_height] = height
    this[_gridColumns] = Math.ceil(width / tileSize)
    this[_gridRows] = Math.ceil(height / tileSize)
    this[_samplesPerPixel] = samplesPerPixel
    this[_ArrayType] = _typedArrays[`${dtype}Array`]
    this[_channels] = channels
    this[_cache] = cache
    this[_cacheKey] = cacheKey
    /** Tiles being read, shared by concurrent requests for the same tile */
    this[_pending] = new Map()
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
    if (this[_gridColumns] * this[_gridRows] > MAX_RASTER_TILES) {
      /**
       * Too large to load at once: without getRaster, Viv does not draw this
       * level as the background image.
       */
      this.getRaster = undefined
    }
  }

  /**
   * Get a tile. Tiles at the right and bottom border are cropped to the
   * image, like those of Viv's own pixel sources. The returned `data` may be
   * shared with the tile cache; treat it as read-only.
   *
   * Rejects with `SIGNAL_ABORTED` when `signal` is aborted, and with the
   * error otherwise, e.g. when the reader has been destroyed.
   *
   * @param {Object} options - Options
   * @param {number} options.x - Tile column
   * @param {number} options.y - Tile row
   * @param {Object} options.selection - Selection, e.g. `{ c: 0 }`
   * @param {AbortSignal} [options.signal] - Signal to cancel the request
   * @returns {Promise<Object>} `data`, `width` and `height`
   */
  async getTile({ x, y, selection, signal }) {
    return this._getTile(
      x,
      y,
      this._getOpticalPathIdentifier(selection),
      signal,
    )
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
    const opticalPathIdentifier = this._getOpticalPathIdentifier(selection)
    const width = this[_width]
    const height = this[_height]
    if (this[_gridColumns] === 1 && this[_gridRows] === 1) {
      return this._getTile(0, 0, opticalPathIdentifier, signal)
    }
    if (signal?.aborted) {
      throw SIGNAL_ABORTED
    }
    const positions = []
    for (let y = 0; y < this[_gridRows]; y++) {
      for (let x = 0; x < this[_gridColumns]; x++) {
        positions.push({ x, y })
      }
    }
    const tiles = await _getTiles(
      this,
      positions,
      opticalPathIdentifier,
      signal,
    )
    const samplesPerPixel = this[_samplesPerPixel]
    const data = new this[_ArrayType](width * height * samplesPerPixel)
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
   * Get a tile of an optical path, from the cache when possible.
   *
   * Concurrent requests for the same tile (e.g. by Viv and by a computed
   * level) share one read, which is cancelled only when all of them are.
   * Only the caller's own `signal` turns a failure into `SIGNAL_ABORTED`, so
   * that other errors (including "AbortError" from a destroyed reader) reach
   * Viv's `onTileError`.
   *
   * @private
   */
  async _getTile(x, y, opticalPathIdentifier, signal) {
    if (signal?.aborted) {
      throw SIGNAL_ABORTED
    }
    if (
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      x < 0 ||
      y < 0 ||
      x >= this[_gridColumns] ||
      y >= this[_gridRows]
    ) {
      throw new RangeError(
        `Tile (${x}, ${y}) is outside of the ${this[_gridColumns]} x ` +
          `${this[_gridRows]} tile grid.`,
      )
    }
    const key = `${this[_cacheKey]}/${opticalPathIdentifier}/${x}/${y}`
    const cached = this[_cache]?.get(key)
    if (cached !== undefined) {
      return cached
    }
    const pending = this[_pending]
    let read = pending.get(key)
    if (read === undefined) {
      const controller = new AbortController()
      read = { controller, users: 0, isSettled: false }
      const settle = () => {
        read.isSettled = true
        if (pending.get(key) === read) {
          pending.delete(key)
        }
      }
      read.promise = this._readTile(
        x,
        y,
        opticalPathIdentifier,
        controller.signal,
      ).then(
        (tile) => {
          settle()
          this[_cache]?.set(key, tile)
          return tile
        },
        (error) => {
          settle()
          throw error
        },
      )
      /** Rejections reach the callers; none is left when all have aborted */
      read.promise.catch(() => {})
      pending.set(key, read)
    }
    read.users += 1
    const currentRead = read
    try {
      const tile = await _waitFor(currentRead.promise, signal)
      if (signal?.aborted) {
        throw SIGNAL_ABORTED
      }
      return tile
    } catch (error) {
      throw signal?.aborted ? SIGNAL_ABORTED : error
    } finally {
      currentRead.users -= 1
      if (currentRead.users === 0 && !currentRead.isSettled) {
        /** Nobody waits for the tile any more */
        currentRead.controller.abort()
        if (pending.get(key) === currentRead) {
          pending.delete(key)
        }
      }
    }
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
    const identifier = Number.isInteger(channel)
      ? this[_channels][channel]
      : undefined
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
    this[_readerGridColumns] = Math.ceil(readerWidth / this.tileSize)
    this[_readerGridRows] = Math.ceil(readerHeight / this.tileSize)
  }

  /**
   * @private
   */
  async _readTile(x, y, opticalPathIdentifier, signal) {
    const { width, height } = this._getTileSize(x, y)
    const samplesPerPixel = this[_samplesPerPixel]
    const readerGridColumns = this[_readerGridColumns]
    const readerGridRows = this[_readerGridRows]
    if (x >= readerGridColumns || y >= readerGridRows) {
      /**
       * A strip of 1 pixel that the DICOM level lacks: repeat the edge of the
       * neighboring tile
       */
      const neighbor = await this._getTile(
        Math.min(x, readerGridColumns - 1),
        Math.min(y, readerGridRows - 1),
        opticalPathIdentifier,
        signal,
      )
      return {
        data: _fitTile({
          data: neighbor.data,
          width: neighbor.width,
          height: neighbor.height,
          samplesPerPixel,
          targetWidth: width,
          targetHeight: height,
          onlyLastColumn: x >= readerGridColumns,
          onlyLastRow: y >= readerGridRows,
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
  async _readTile(x, y, opticalPathIdentifier, signal) {
    const parent = this[_parent]
    const positions = [
      [2 * x, 2 * y],
      [2 * x + 1, 2 * y],
      [2 * x, 2 * y + 1],
      [2 * x + 1, 2 * y + 1],
    ].map(([column, row]) =>
      column < parent[_gridColumns] && row < parent[_gridRows]
        ? { x: column, y: row }
        : undefined,
    )
    const quadrants = await _getTiles(
      parent,
      positions,
      opticalPathIdentifier,
      signal,
    )
    const { width, height } = this._getTileSize(x, y)
    const data = _downsampleQuadrants({
      quadrants,
      tileSize: this.tileSize,
      samplesPerPixel: this[_samplesPerPixel],
      width,
      height,
      ArrayType: this[_ArrayType],
    })
    return { data, width, height }
  }
}

export { _DicomPixelSource, _SyntheticPixelSource, SIGNAL_ABORTED }
