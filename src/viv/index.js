import { CustomError, errorTypes } from '../customError'
import { logger } from '../logger.js'
import { _typedArrays, VolumeImageReader } from '../volumeImageReader.js'
import { _planDyadicLevels } from './levels.js'
import {
  _DicomPixelSource,
  _SyntheticPixelSource,
  SIGNAL_ABORTED,
} from './pixelSource.js'
import { _TileCache } from './tileCache.js'

/** Default size of the tile cache shared by the levels of an image */
const DEFAULT_CACHE_SIZE = 64 * 1024 * 1024

/**
 * Create the pixel sources and the tile cache they share.
 *
 * @private
 */
const _createPixelSources = ({
  reader,
  maxSyntheticLevels = 2,
  cacheSize = DEFAULT_CACHE_SIZE,
} = {}) => {
  if (
    reader == null ||
    typeof reader.getTile !== 'function' ||
    !Array.isArray(reader.levels)
  ) {
    throw new TypeError('A pyramid.VolumeImageReader is required.')
  }
  if (!Number.isInteger(maxSyntheticLevels) || maxSyntheticLevels < 0) {
    throw new RangeError(
      `"maxSyntheticLevels" must be a non-negative integer, not ${maxSyntheticLevels}.`,
    )
  }
  if (typeof cacheSize !== 'number' || !(cacheSize >= 0)) {
    throw new RangeError(
      `"cacheSize" must be a non-negative number of bytes, not ${cacheSize}.`,
    )
  }
  const opticalPaths = reader.opticalPaths
  const channels = opticalPaths.map((opticalPath) => opticalPath.identifier)
  const pixelInfos = channels.map((identifier) =>
    reader.getPixelInfo(identifier),
  )
  const { arrayType, samplesPerPixel } = pixelInfos[0]
  const mismatch = pixelInfos.find(
    (pixelInfo) =>
      pixelInfo.arrayType !== arrayType ||
      pixelInfo.samplesPerPixel !== samplesPerPixel,
  )
  if (mismatch !== undefined) {
    throw new CustomError(
      errorTypes.VISUALIZATION,
      'Viv requires all optical paths to have the same pixel data type.',
    )
  }
  /** Viv names data types like TypedArrays without "Array" */
  if (_typedArrays[arrayType] === undefined) {
    throw new CustomError(
      errorTypes.VISUALIZATION,
      `Viv does not support pixel data of type ${arrayType ?? 'unknown'}.`,
    )
  }
  const dtype = arrayType.replace(/Array$/, '')
  if (samplesPerPixel !== 1 && dtype !== 'Uint8') {
    throw new CustomError(
      errorTypes.VISUALIZATION,
      'Viv only supports color images with 8 bits per sample, but the ' +
        `image has ${arrayType} samples.`,
    )
  }

  const { tileSize, isTruncated, levels } = _planDyadicLevels(
    reader.levels,
    maxSyntheticLevels,
  )
  if (isTruncated) {
    const lowest = levels[levels.length - 1]
    logger.warn(
      'The DICOM pyramid lacks lower resolution levels with ' +
        `${tileSize}-pixel tiles, so Viv cannot zoom out beyond ` +
        `${lowest.width} x ${lowest.height} pixels. Increase ` +
        '"maxSyntheticLevels" to compute more levels.',
    )
  }
  const cache = cacheSize > 0 ? new _TileCache(cacheSize) : undefined
  const sources = []
  for (const level of levels) {
    const options = {
      width: level.width,
      height: level.height,
      pixelSpacing: level.pixelSpacing,
      tileSize,
      dtype,
      channels,
      samplesPerPixel,
      cache,
      cacheKey: sources.length,
    }
    sources.push(
      level.isSynthetic
        ? new _SyntheticPixelSource({
            ...options,
            parent: sources[sources.length - 1],
          })
        : new _DicomPixelSource({
            ...options,
            reader,
            readerLevel: level.readerLevel,
            readerWidth: level.readerWidth,
            readerHeight: level.readerHeight,
          }),
    )
  }
  return { sources, cache }
}

/**
 * Create Viv pixel sources for the pyramid of a VolumeImageReader.
 *
 * The returned array can be passed as `loader` to Viv's
 * `MultiscaleImageLayer`. It is ordered from highest to lowest resolution
 * and each level is half the size of the previous one (rounded up), as Viv
 * expects. Levels that the DICOM pyramid lacks (e.g. when its levels are 4
 * times apart) are computed from the next higher resolution level. Lower
 * levels with more than 16 tiles have no `getRaster`, so Viv does not draw
 * them as the background image. Channel `c` of a Viv selection is optical
 * path `reader.opticalPaths[c]`. Color images have one channel with
 * interleaved RGB samples.
 *
 * Tiles are retrieved and decoded by the reader, so Viv's abort signals
 * cancel the requests, and the reader's ICC profile settings apply. Decoded
 * tiles of all levels are kept in one cache, so that computed levels and
 * zooming back do not retrieve the same tiles again.
 *
 * The caller keeps owning the reader: destroy it when the pixel sources are
 * no longer used. Tiles requested afterwards fail with the reader's error.
 *
 * @param {Object} options - Options
 * @param {pyramid.VolumeImageReader} options.reader - Reader
 * @param {number} [options.maxSyntheticLevels=2] - Maximum number of
 * consecutive computed levels. Each tile of a computed level needs up to
 * 4 ^ maxSyntheticLevels tiles of the DICOM level it is computed from.
 * @param {number} [options.cacheSize=67108864] - Largest size in bytes of
 * the decoded tiles kept in memory (64 MiB by default); 0 disables the cache
 * @returns {Object[]} Viv pixel sources (`PixelSource` interface)
 * @throws {TypeError|RangeError} When an option is invalid
 * @throws {errors.CustomError} When Viv cannot show the image (e.g. tiles that are
 * not square with a power-of-2 size, or 16-bit color)
 * @memberof viv
 */
const createPixelSources = (options) => _createPixelSources(options).sources

/**
 * Load a DICOMweb series of VL Whole Slide Microscopy images as a Viv
 * multiscale image.
 *
 * Works like Viv's `loadOmeTiff` and `loadOmeZarr`: pass `data` as
 * `loader` to Viv's `MultiscaleImageLayer`. Viv and deck.gl are not
 * dependencies of this library; the pixel sources implement Viv's
 * `PixelSource` interface.
 *
 * Call `destroy()` of the result when the image is no longer used, which
 * cancels pending requests, empties the tile cache and releases the decoding
 * web workers.
 *
 * @param {Object} options - Options
 * @param {Object} options.client - DICOMweb client
 * @param {string} options.studyInstanceUID - Study Instance UID
 * @param {string} options.seriesInstanceUID - Series Instance UID
 * @param {AbortSignal} [options.signal] - Signal to cancel loading; the
 * promise then rejects with `signal.reason` (a DOMException named
 * "AbortError" by default)
 * @param {boolean} [options.iccProfilesEnabled=true] - Whether ICC profiles
 * of color images are applied
 * @param {string} [options.iccOutputType='srgb'] - Color space of color
 * pixels when ICC profiles are applied ("srgb" or "display-p3")
 * @param {number} [options.maxSyntheticLevels=2] - See
 * {@link viv.createPixelSources}
 * @param {number} [options.cacheSize=67108864] - See
 * {@link viv.createPixelSources}
 * @returns {Promise<Object>} `data`, the Viv pixel sources from highest to
 * lowest resolution; `metadata` with the `reader`
 * ({@link pyramid.VolumeImageReader}) and its `opticalPaths`, whose
 * position is the channel index `c`; and `destroy`, a function that
 * releases the resources of the image
 * @memberof viv
 */
const loadDicomWeb = async ({
  client,
  studyInstanceUID,
  seriesInstanceUID,
  signal,
  iccProfilesEnabled = true,
  iccOutputType = 'srgb',
  maxSyntheticLevels = 2,
  cacheSize = DEFAULT_CACHE_SIZE,
}) => {
  const reader = await VolumeImageReader.fromSeries({
    client,
    studyInstanceUID,
    seriesInstanceUID,
    signal,
    iccProfilesEnabled,
    iccOutputType,
    /** Viv needs one tile size for all levels */
    skipThumbnails: true,
  })
  try {
    const { sources, cache } = _createPixelSources({
      reader,
      maxSyntheticLevels,
      cacheSize,
    })
    return {
      data: sources,
      metadata: { reader, opticalPaths: reader.opticalPaths },
      destroy: () => {
        cache?.clear()
        reader.destroy()
      },
    }
  } catch (error) {
    reader.destroy()
    throw error
  }
}

export { createPixelSources, loadDicomWeb, SIGNAL_ABORTED }
