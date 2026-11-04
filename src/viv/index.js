import { logger } from '../logger.js'
import { VolumeImageReader } from '../volumeImageReader.js'
import { _planDyadicLevels } from './levels.js'
import {
  _DicomPixelSource,
  _SyntheticPixelSource,
  SIGNAL_ABORTED,
} from './pixelSource.js'

/** Viv dtype of each TypedArray that a VolumeImageReader returns */
const _vivDtypes = {
  Uint8Array: 'Uint8',
  Int8Array: 'Int8',
  Uint16Array: 'Uint16',
  Int16Array: 'Int16',
  Float32Array: 'Float32',
  Float64Array: 'Float64',
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
 * them as the background image. Channel `c`
 * of a Viv selection is optical path `reader.opticalPaths[c]`. Color images
 * have one channel with interleaved RGB samples.
 *
 * Tiles are retrieved and decoded by the reader, so Viv's abort signals
 * cancel the requests, and the reader's ICC profile settings apply.
 *
 * @param {Object} options - Options
 * @param {pyramid.VolumeImageReader} options.reader - Reader
 * @param {number} [options.maxSyntheticLevels=2] - Maximum number of
 * consecutive computed levels. Each tile of a computed level needs up to
 * 4 ^ maxSyntheticLevels tiles of the DICOM level it is computed from.
 * @returns {Object[]} Viv pixel sources (`PixelSource` interface)
 * @memberof viv
 */
const createPixelSources = ({ reader, maxSyntheticLevels = 2 }) => {
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
    throw new Error(
      'Viv requires all optical paths to have the same pixel data type.',
    )
  }
  const dtype = _vivDtypes[arrayType]
  if (dtype === undefined) {
    throw new Error(
      `Viv does not support pixel data of type ${arrayType ?? 'unknown'}.`,
    )
  }
  if (samplesPerPixel !== 1 && dtype !== 'Uint8') {
    throw new Error(
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
  return sources
}

/**
 * Load a DICOMweb series of VL Whole Slide Microscopy images as a Viv
 * multiscale image.
 *
 * Works like Viv's `loadOmeTiff` and `loadOmeZarr`: pass `data` as
 * `loader` to Viv's `MultiscaleImageLayer`. Viv and deck.gl are not
 * dependencies of this library; the pixel sources implement Viv's
 * `PixelSource` interface.
 *
 * Call `metadata.reader.destroy()` when the image is no longer used, which
 * cancels pending requests and releases the decoding web workers.
 *
 * @param {Object} options - Options
 * @param {Object} options.client - DICOMweb client
 * @param {string} options.studyInstanceUID - Study Instance UID
 * @param {string} options.seriesInstanceUID - Series Instance UID
 * @param {boolean} [options.iccProfilesEnabled=false] - Whether ICC profiles
 * of color images are applied
 * @param {string} [options.iccOutputType='srgb'] - Color space of color
 * pixels when ICC profiles are applied ("srgb" or "display-p3")
 * @param {number} [options.maxSyntheticLevels=2] - See
 * {@link viv.createPixelSources}
 * @returns {Promise<Object>} `data`, the Viv pixel sources from highest to
 * lowest resolution, and `metadata` with the `reader`
 * ({@link pyramid.VolumeImageReader}) and its `opticalPaths`, whose
 * position is the channel index `c`
 * @memberof viv
 */
const loadDicomWeb = async ({
  client,
  studyInstanceUID,
  seriesInstanceUID,
  iccProfilesEnabled = false,
  iccOutputType = 'srgb',
  maxSyntheticLevels = 2,
}) => {
  const reader = await VolumeImageReader.fromSeries({
    client,
    studyInstanceUID,
    seriesInstanceUID,
    iccProfilesEnabled,
    iccOutputType,
    /** Viv needs one tile size for all levels */
    skipThumbnails: true,
  })
  try {
    const data = createPixelSources({ reader, maxSyntheticLevels })
    return {
      data,
      metadata: { reader, opticalPaths: reader.opticalPaths },
    }
  } catch (error) {
    reader.destroy()
    throw error
  }
}

export { createPixelSources, loadDicomWeb, SIGNAL_ABORTED }
