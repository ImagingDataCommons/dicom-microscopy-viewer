import { CustomError, errorTypes } from './customError'
import { OpticalPath } from './opticalPath.js'
import {
  _areImagePyramidsEqual,
  _computeImagePyramid,
  _getIccProfiles,
  _groupVolumeImages,
  _retrieveTile,
} from './pyramid.js'
import webWorkerManager from './webWorker/webWorkerManager.js'

const _client = Symbol('client')
const _channels = Symbol('channels')
const _opticalPaths = Symbol('opticalPaths')
const _levels = Symbol('levels')
const _iccOptions = Symbol('iccOptions')
const _iccProfiles = Symbol('iccProfiles')
const _isDestroyed = Symbol('isDestroyed')

const _typedArrays = {
  Uint8Array,
  Int8Array,
  Uint16Array,
  Int16Array,
  Float32Array,
  Float64Array,
}

const _arrayTypes = {
  1: { 0: 'Uint8Array', 1: 'Uint8Array' },
  8: { 0: 'Uint8Array', 1: 'Int8Array' },
  16: { 0: 'Uint16Array', 1: 'Int16Array' },
  32: { 0: 'Float32Array', 1: 'Float32Array' },
  64: { 0: 'Float64Array', 1: 'Float64Array' },
}

/**
 * Compare optical path identifiers, numerically where they are numbers.
 *
 * @private
 */
const _compareIdentifiers = (a, b) =>
  a.localeCompare(b, undefined, { numeric: true })

/**
 * Reader for the tiles of VL Whole Slide Microscopy VOLUME images.
 *
 * Retrieves and decodes the frames of an image pyramid without rendering
 * anything, so that other viewers (e.g. deck.gl/Viv) can reuse the DICOMweb
 * retrieval, frame decoding and ICC color management of this library. It
 * needs neither OpenLayers nor a DOM element.
 *
 * The reader accepts the same image metadata as
 * {@link viewer.VolumeImageViewer}: VOLUME (and optionally THUMBNAIL) images
 * of a series with either a single color optical path or one or more
 * monochrome optical paths that share the same pyramid structure.
 *
 * Call {@link pyramid.VolumeImageReader#destroy} when done, which releases
 * the shared decoding web workers.
 *
 * @class
 * @memberof pyramid
 */
class VolumeImageReader {
  /**
   * @param {Object} options - Options
   * @param {Object} options.client - DICOMweb client
   * @param {metadata.VLWholeSlideMicroscopyImage[]} options.metadata - Image
   * metadata of VOLUME and THUMBNAIL images
   * @param {boolean} [options.iccProfilesEnabled=false] - Whether ICC profiles
   * of color images are applied to decoded pixels
   * @param {string} [options.iccOutputType='srgb'] - Color space of decoded
   * color pixels when ICC profiles are applied ("srgb" or "display-p3")
   * @param {boolean} [options.skipThumbnails=false] - Ignore THUMBNAIL images
   */
  constructor({
    client,
    metadata,
    iccProfilesEnabled = false,
    iccOutputType = 'srgb',
    skipThumbnails = false,
  }) {
    if (client == null) {
      throw new CustomError(
        errorTypes.VISUALIZATION,
        'A DICOMweb client is required to read image tiles.',
      )
    }
    if (!Array.isArray(metadata) || metadata.length === 0) {
      throw new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Input metadata must be a non-empty array of objects.',
      )
    }
    this[_client] = client
    this[_iccOptions] = { enabled: iccProfilesEnabled, iccOutputType }
    this[_isDestroyed] = false

    const {
      colorImageInformation,
      colorOpticalPathIdentifiers,
      monochromeImageInformation,
      monochromeOpticalPathIdentifiers,
    } = _groupVolumeImages({ metadata, skipThumbnails })
    const isMonochromatic = monochromeOpticalPathIdentifiers.length > 0
    const imageInformation = isMonochromatic
      ? monochromeImageInformation
      : colorImageInformation
    const identifiers = (
      isMonochromatic
        ? monochromeOpticalPathIdentifiers
        : colorOpticalPathIdentifiers
    )
      .slice()
      .sort(_compareIdentifiers)

    this[_channels] = {}
    let refPyramid
    for (const identifier of identifiers) {
      const info = imageInformation[identifier]
      const pyramid = _computeImagePyramid({ metadata: info.metadata })
      if (refPyramid === undefined) {
        refPyramid = pyramid
      } else if (!_areImagePyramidsEqual(pyramid, refPyramid)) {
        throw new CustomError(
          errorTypes.VISUALIZATION,
          `Pyramid of optical path "${identifier}" ` +
            'is different from reference pyramid.',
        )
      }
      const refImage = pyramid.metadata[0]
      const opticalPathItem = info.opticalPath
      this[_channels][identifier] = {
        pyramid,
        opticalPath: new OpticalPath({
          identifier,
          description: opticalPathItem.OpticalPathDescription,
          illuminationType: opticalPathItem.IlluminationTypeCodeSequence[0],
          isMonochromatic,
          illuminationWaveLength: isMonochromatic
            ? opticalPathItem.IlluminationWaveLength
            : undefined,
          illuminationColor: isMonochromatic
            ? opticalPathItem.IlluminationColorCodeSequence?.[0]
            : undefined,
          studyInstanceUID: refImage.StudyInstanceUID,
          seriesInstanceUID: refImage.SeriesInstanceUID,
          sopInstanceUIDs: pyramid.metadata.map(
            (image) => image.SOPInstanceUID,
          ),
          paletteColorLookupTableUID:
            opticalPathItem.PaletteColorLookupTableSequence?.[0]
              ?.PaletteColorLookupTableUID,
        }),
        pixelInfo: Object.freeze({
          samplesPerPixel: refImage.SamplesPerPixel,
          bitsAllocated: refImage.BitsAllocated,
          pixelRepresentation: refImage.PixelRepresentation,
          photometricInterpretation: refImage.PhotometricInterpretation,
          arrayType:
            _arrayTypes[refImage.BitsAllocated]?.[
              refImage.PixelRepresentation === 1 ? 1 : 0
            ],
        }),
      }
    }
    this[_opticalPaths] = Object.freeze(
      identifiers.map((identifier) => this[_channels][identifier].opticalPath),
    )

    this[_levels] = Object.freeze(
      refPyramid.metadata.map((image, index) =>
        Object.freeze({
          index,
          totalPixelMatrixColumns: image.TotalPixelMatrixColumns,
          totalPixelMatrixRows: image.TotalPixelMatrixRows,
          tileColumns: image.Columns,
          tileRows: image.Rows,
          gridColumns: Math.ceil(image.TotalPixelMatrixColumns / image.Columns),
          gridRows: Math.ceil(image.TotalPixelMatrixRows / image.Rows),
          pixelSpacing: Object.freeze(refPyramid.pixelSpacings[index].slice(0)),
        }),
      ),
    )

    /** Retain only after construction succeeds so a failed `new` cannot leak */
    webWorkerManager.retain()
  }

  /**
   * Optical paths, sorted by identifier. The position of an optical path in
   * this array is a stable channel index for the lifetime of the reader.
   *
   * @type {opticalPath.OpticalPath[]}
   */
  get opticalPaths() {
    return this[_opticalPaths]
  }

  /**
   * Pyramid levels, shared by all optical paths. Level 0 has the lowest
   * resolution, consistent with {@link viewer.VolumeImageViewer#numLevels}
   * and {@link viewer.VolumeImageViewer#getPixelSpacing}.
   *
   * Each level has `index`, `totalPixelMatrixColumns`,
   * `totalPixelMatrixRows`, `tileColumns`, `tileRows`, `gridColumns`,
   * `gridRows` and `pixelSpacing` (row and column spacing in millimeter).
   *
   * @type {Object[]}
   */
  get levels() {
    return this[_levels]
  }

  /**
   * Get the pixel layout of the tiles of an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @returns {Object} `samplesPerPixel`, `bitsAllocated`,
   * `pixelRepresentation`, `photometricInterpretation` and `arrayType`, the
   * name of the TypedArray constructor of `pixelArray` returned by
   * {@link pyramid.VolumeImageReader#getTile}
   */
  getPixelInfo(opticalPathIdentifier) {
    return this._getChannel(opticalPathIdentifier).pixelInfo
  }

  /**
   * Get image metadata of an optical path, one image per pyramid level.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @returns {metadata.VLWholeSlideMicroscopyImage[]} Slide microscopy image
   * metadata
   */
  getOpticalPathMetadata(opticalPathIdentifier) {
    return this._getChannel(opticalPathIdentifier).pyramid.metadata.slice(0)
  }

  /**
   * Retrieve and decode a tile.
   *
   * The returned `pixelArray` holds the stored pixel values (no conversion to
   * floating point), row by row, with the samples of a pixel interleaved.
   * Tiles at the right and bottom border of the total pixel matrix are padded;
   * only the first `validColumns` columns and `validRows` rows hold image
   * data. Tiles absent from a TILED_SPARSE image resolve without a request,
   * with `isEmpty` set and `pixelArray` filled with the background value
   * (black for MONOCHROME2, white otherwise).
   *
   * When `signal` is aborted, the HTTP request and the queued decoding task
   * are cancelled and the promise rejects with `signal.reason`, which is a
   * DOMException named "AbortError" unless a different reason was given.
   * Other failures reject with an Error whose `cause` is the underlying
   * error, e.g. the dicomweb-client request error with `status`.
   *
   * @param {Object} options - Options
   * @param {string} options.opticalPathIdentifier - Optical Path Identifier
   * @param {number} options.level - Pyramid level index (0 is the lowest resolution)
   * @param {number} options.column - Zero-based tile column
   * @param {number} options.row - Zero-based tile row
   * @param {AbortSignal} [options.signal] - Signal to cancel the request
   * @returns {Promise<Object>} `pixelArray`, `columns`, `rows`,
   * `samplesPerPixel`, `validColumns`, `validRows` and `isEmpty`
   */
  async getTile({ opticalPathIdentifier, level, column, row, signal }) {
    if (this[_isDestroyed]) {
      throw new Error('Cannot get tile: the reader has been destroyed.')
    }
    const channel = this._getChannel(opticalPathIdentifier)
    const levelInfo = this[_levels][level]
    if (levelInfo === undefined) {
      throw new RangeError(
        `Level ${level} does not exist; the pyramid has ` +
          `${this[_levels].length} levels.`,
      )
    }
    if (
      !Number.isInteger(column) ||
      !Number.isInteger(row) ||
      column < 0 ||
      row < 0 ||
      column >= levelInfo.gridColumns ||
      row >= levelInfo.gridRows
    ) {
      throw new RangeError(
        `Tile (column ${column}, row ${row}) is outside of the ` +
          `${levelInfo.gridColumns} x ${levelInfo.gridRows} tile grid ` +
          `of level ${level}.`,
      )
    }

    const iccProfiles = await this._getIccProfiles(channel)
    const tile = await _retrieveTile({
      pyramid: channel.pyramid,
      client: this[_client],
      channel: opticalPathIdentifier,
      level,
      column,
      row,
      iccProfiles,
      iccOutputType: this[_iccOptions].iccOutputType,
      signal,
    })

    return {
      /**
       * Empty tiles are cached, shared and stored as Float32Array beyond
       * 8 bits; hand out a copy with the same array type as decoded tiles.
       */
      pixelArray: tile.isEmpty
        ? new _typedArrays[channel.pixelInfo.arrayType](tile.pixelArray)
        : tile.pixelArray,
      columns: tile.columns,
      rows: tile.rows,
      samplesPerPixel: tile.samplesPerPixel,
      validColumns: Math.min(
        tile.columns,
        levelInfo.totalPixelMatrixColumns - column * levelInfo.tileColumns,
      ),
      validRows: Math.min(
        tile.rows,
        levelInfo.totalPixelMatrixRows - row * levelInfo.tileRows,
      ),
      isEmpty: tile.isEmpty,
    }
  }

  /**
   * Release the decoding web workers. Requests made afterwards are rejected;
   * decoding tasks still in flight may be rejected when no viewer or reader
   * uses the workers anymore.
   */
  destroy() {
    if (this[_isDestroyed]) {
      return
    }
    this[_isDestroyed] = true
    webWorkerManager.release()
  }

  /**
   * @private
   */
  _getChannel(opticalPathIdentifier) {
    const channel = this[_channels][opticalPathIdentifier]
    if (channel === undefined) {
      throw new CustomError(
        errorTypes.VISUALIZATION,
        `Could not find optical path "${opticalPathIdentifier}".`,
      )
    }
    return channel
  }

  /**
   * ICC profiles applied to color tiles, fetched once on first use.
   *
   * @private
   */
  _getIccProfiles(channel) {
    if (!this[_iccOptions].enabled || channel.pixelInfo.samplesPerPixel !== 3) {
      return Promise.resolve(undefined)
    }
    if (this[_iccProfiles] === undefined) {
      this[_iccProfiles] = _getIccProfiles({
        metadata: channel.pyramid.metadata,
        client: this[_client],
        onError: (error) => {
          console.error('Failed to fetch ICC profiles:', error)
        },
      }).then((profiles) => (profiles.length > 0 ? profiles : undefined))
    }
    return this[_iccProfiles]
  }
}

export { VolumeImageReader }
