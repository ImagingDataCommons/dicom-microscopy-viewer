import { CustomError, errorTypes } from './customError'
import { SOPClassUIDs } from './enums'
import { VLWholeSlideMicroscopyImage } from './metadata.js'
import {
  _areImagePyramidsEqual,
  _computeImagePyramid,
  _computePyramidTransforms,
  _createOpticalPath,
  _getIccProfiles,
  _groupVolumeImages,
  _retrieveTile,
  _retrieveWithSignal,
} from './pyramid.js'
import { _anyAbortSignal, _raceAbort, _throwIfAborted } from './utils.js'
import webWorkerManager from './webWorker/webWorkerManager.js'

const _client = Symbol('client')
const _channels = Symbol('channels')
const _opticalPaths = Symbol('opticalPaths')
const _levels = Symbol('levels')
const _affine = Symbol('affine')
const _affineInverse = Symbol('affineInverse')
const _frameOfReferenceUID = Symbol('frameOfReferenceUID')
const _iccOptions = Symbol('iccOptions')
const _iccProfiles = Symbol('iccProfiles')
const _isDestroyed = Symbol('isDestroyed')
const _lifetime = Symbol('lifetime')

/** TypedArray constructor of each `arrayType` returned by getPixelInfo() */
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
 * Tile for a frame that is absent from a TILED_SPARSE image: filled with 0
 * for MONOCHROME2 and with the maximum value otherwise, as the viewer does.
 *
 * @private
 */
const _createBackgroundTile = (pixelInfo, columns, rows) => {
  const { arrayType, bitsAllocated, pixelRepresentation } = pixelInfo
  const length = columns * rows * pixelInfo.samplesPerPixel
  const pixelArray = new _typedArrays[arrayType](length)
  if (pixelInfo.photometricInterpretation === 'MONOCHROME2') {
    return pixelArray
  }
  let white = 1
  if (arrayType !== 'Float32Array' && arrayType !== 'Float64Array') {
    white =
      pixelRepresentation === 1
        ? 2 ** (bitsAllocated - 1) - 1
        : 2 ** bitsAllocated - 1
  }
  return pixelArray.fill(white)
}

/**
 * Copy of the first `validColumns` x `validRows` pixels of a tile, without
 * the padding of tiles at the right and bottom border.
 *
 * @private
 */
const _cropTile = ({
  pixelArray,
  columns,
  samplesPerPixel,
  validColumns,
  validRows,
}) => {
  const rowLength = columns * samplesPerPixel
  const validRowLength = validColumns * samplesPerPixel
  if (validColumns === columns) {
    /** Only rows are cut off, which are at the end of the array */
    return pixelArray.slice(0, validRowLength * validRows)
  }
  const cropped = new pixelArray.constructor(validRowLength * validRows)
  for (let row = 0; row < validRows; row++) {
    const start = row * rowLength
    cropped.set(
      pixelArray.subarray(start, start + validRowLength),
      row * validRowLength,
    )
  }
  return cropped
}

/**
 * Deep-frozen copy of a matrix.
 *
 * @private
 */
const _freezeMatrix = (matrix) =>
  Object.freeze(matrix.map((row) => Object.freeze(row.slice(0))))

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
 * Errors: invalid arguments throw a TypeError or RangeError; images that
 * cannot be read (e.g. optical paths with different pyramids) throw a
 * {@link errors.CustomError}; cancelled operations reject with a DOMException named
 * "AbortError" (or the reason given to the AbortController).
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
   * @param {boolean} [options.iccProfilesEnabled=true] - Whether ICC profiles
   * of color images are applied to decoded pixels, as by default in
   * {@link viewer.VolumeImageViewer}. If the profiles cannot be retrieved,
   * the error is logged and tiles are decoded without them.
   * @param {string} [options.iccOutputType='srgb'] - Color space of decoded
   * color pixels when ICC profiles are applied ("srgb" or "display-p3")
   * @param {boolean} [options.skipThumbnails=false] - Ignore THUMBNAIL
   * images. A kept THUMBNAIL is a pyramid level whose single frame covers the
   * whole image, so its tile size differs from the VOLUME levels; renderers
   * that need one tile size for all levels (e.g. Viv) should skip thumbnails.
   * All VOLUME levels are kept either way.
   */
  constructor({
    client,
    metadata,
    iccProfilesEnabled = true,
    iccOutputType = 'srgb',
    skipThumbnails = false,
  }) {
    if (client == null) {
      throw new TypeError('A DICOMweb client is required to read image tiles.')
    }
    if (iccOutputType !== 'srgb' && iccOutputType !== 'display-p3') {
      throw new RangeError(
        `Unknown ICC output type "${iccOutputType}"; use "srgb" or "display-p3".`,
      )
    }
    if (!Array.isArray(metadata) || metadata.length === 0) {
      throw new TypeError(
        'Input metadata must be a non-empty array of objects.',
      )
    }
    this[_client] = client
    this[_iccOptions] = { enabled: iccProfilesEnabled, iccOutputType }
    this[_isDestroyed] = false
    /** Aborted by destroy() to cancel tiles that are still in flight */
    this[_lifetime] = new AbortController()

    const {
      colorImageInformation,
      colorOpticalPathIdentifiers,
      monochromeImageInformation,
      monochromeOpticalPathIdentifiers,
    } = _groupVolumeImages({
      metadata,
      skipThumbnails,
      keepCoarseVolumeImages: true,
    })
    const isMonochromatic = monochromeOpticalPathIdentifiers.length > 0
    const imageInformation = isMonochromatic
      ? monochromeImageInformation
      : colorImageInformation
    /** Same order as {@link viewer.VolumeImageViewer#getAllOpticalPaths} */
    const identifiers = isMonochromatic
      ? monochromeOpticalPathIdentifiers
      : colorOpticalPathIdentifiers

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
      this[_channels][identifier] = {
        pyramid,
        opticalPath: _createOpticalPath({
          identifier,
          opticalPathItem: info.opticalPath,
          pyramid,
          isMonochromatic,
        }),
        pixelInfo: Object.freeze({
          samplesPerPixel: refImage.SamplesPerPixel,
          bitsAllocated: refImage.BitsAllocated,
          pixelRepresentation: refImage.PixelRepresentation,
          /** Color images are decoded to RGB, e.g. from JPEG YBR_FULL_422 */
          photometricInterpretation:
            refImage.SamplesPerPixel === 3
              ? 'RGB'
              : refImage.PhotometricInterpretation,
          storedPhotometricInterpretation: refImage.PhotometricInterpretation,
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

    /** Highest resolution first, like OpenSlide, OME-Zarr and Viv */
    const pyramidImages = refPyramid.metadata
    const numLevels = pyramidImages.length
    const baseColumns = pyramidImages[numLevels - 1].TotalPixelMatrixColumns
    this[_levels] = Object.freeze(
      pyramidImages
        .map((image, pyramidIndex) =>
          Object.freeze({
            index: numLevels - 1 - pyramidIndex,
            totalPixelMatrixColumns: image.TotalPixelMatrixColumns,
            totalPixelMatrixRows: image.TotalPixelMatrixRows,
            tileColumns: image.Columns,
            tileRows: image.Rows,
            gridColumns: Math.ceil(
              image.TotalPixelMatrixColumns / image.Columns,
            ),
            gridRows: Math.ceil(image.TotalPixelMatrixRows / image.Rows),
            pixelSpacing: Object.freeze(
              refPyramid.pixelSpacings[pyramidIndex].slice(0),
            ),
            downsampleFactor: baseColumns / image.TotalPixelMatrixColumns,
            imageFlavor: image.ImageType[2],
          }),
        )
        .reverse(),
    )

    const { affine, affineInverse } = _computePyramidTransforms(refPyramid)
    this[_affine] = _freezeMatrix(affine)
    this[_affineInverse] = _freezeMatrix(affineInverse)
    this[_frameOfReferenceUID] = refPyramid.metadata[0].FrameOfReferenceUID

    /** Retain only after construction succeeds so a failed `new` cannot leak */
    webWorkerManager.retain()
  }

  /**
   * Create a reader for the VOLUME and THUMBNAIL images of a series.
   *
   * Retrieves the series metadata with `client` and keeps the VL Whole Slide
   * Microscopy Image instances of image flavor VOLUME or THUMBNAIL, ignoring
   * other instances (e.g. LABEL and OVERVIEW images, annotations).
   *
   * @param {Object} options - Options
   * @param {Object} options.client - DICOMweb client
   * @param {string} options.studyInstanceUID - Study Instance UID
   * @param {string} options.seriesInstanceUID - Series Instance UID
   * @param {AbortSignal} [options.signal] - Signal to cancel the metadata
   * request; the promise then rejects with `signal.reason` (a DOMException
   * named "AbortError" by default)
   * @param {boolean} [options.iccProfilesEnabled=true] - See the constructor
   * @param {string} [options.iccOutputType='srgb'] - See the constructor
   * @param {boolean} [options.skipThumbnails=false] - See the constructor
   * @returns {Promise<pyramid.VolumeImageReader>} Reader
   */
  static async fromSeries({
    client,
    studyInstanceUID,
    seriesInstanceUID,
    signal,
    ...options
  }) {
    if (client == null) {
      throw new TypeError('A DICOMweb client is required to read image tiles.')
    }
    if (typeof studyInstanceUID !== 'string' || studyInstanceUID === '') {
      throw new TypeError('"studyInstanceUID" is required.')
    }
    if (typeof seriesInstanceUID !== 'string' || seriesInstanceUID === '') {
      throw new TypeError('"seriesInstanceUID" is required.')
    }
    const metadata = await _retrieveWithSignal(
      client,
      'retrieveSeriesMetadata',
      { studyInstanceUID, seriesInstanceUID },
      signal,
    )
    _throwIfAborted(signal)
    const volumeImages = []
    for (const item of metadata) {
      const sopClassUID = item['00080016']?.Value?.[0]
      if (sopClassUID !== SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE) {
        continue
      }
      const image = new VLWholeSlideMicroscopyImage({ metadata: item })
      const imageFlavor = image.ImageType[2]
      if (imageFlavor === 'VOLUME' || imageFlavor === 'THUMBNAIL') {
        volumeImages.push(image)
      }
    }
    if (volumeImages.length === 0) {
      throw new CustomError(
        errorTypes.VISUALIZATION,
        `Series "${seriesInstanceUID}" of study "${studyInstanceUID}" ` +
          'contains no VOLUME or THUMBNAIL images.',
      )
    }
    return new VolumeImageReader({ client, metadata: volumeImages, ...options })
  }

  /**
   * Optical paths, in the same order as
   * {@link viewer.VolumeImageViewer#getAllOpticalPaths}. The position of an
   * optical path in this array is a stable channel index for the lifetime of
   * the reader.
   *
   * @type {opticalPath.OpticalPath[]}
   */
  get opticalPaths() {
    return this[_opticalPaths]
  }

  /**
   * Pyramid levels, shared by all optical paths, from highest to lowest
   * resolution: level 0 is the full resolution image, like in OpenSlide,
   * OME-Zarr and Viv. (The `level` of
   * {@link viewer.VolumeImageViewer#navigate} counts the other way, from the
   * lowest resolution.)
   *
   * Each level has `index` (its position in this array), `totalPixelMatrixColumns`,
   * `totalPixelMatrixRows`, `tileColumns`, `tileRows`, `gridColumns`,
   * `gridRows`, `pixelSpacing` (row and column spacing in millimeter),
   * `downsampleFactor` (relative to level 0, which has 1; not necessarily a
   * power of 2) and `imageFlavor` ("VOLUME" or "THUMBNAIL").
   *
   * @type {Object[]}
   */
  get levels() {
    return this[_levels]
  }

  /**
   * Affine transformation from the total pixel matrix of level 0 (column,
   * row) to the slide coordinate system (x, y in
   * millimeter), as a 3x3 matrix for use with {@link utils.applyTransform}.
   *
   * @type {number[][]}
   */
  get affine() {
    return this[_affine]
  }

  /**
   * Inverse of {@link pyramid.VolumeImageReader#affine}: slide coordinates to
   * the total pixel matrix of level 0, for use with
   * {@link utils.applyInverseTransform}.
   *
   * @type {number[][]}
   */
  get affineInverse() {
    return this[_affineInverse]
  }

  /**
   * Frame of Reference UID of the images.
   *
   * @type {string}
   */
  get frameOfReferenceUID() {
    return this[_frameOfReferenceUID]
  }

  /**
   * Get the pixel layout of the tiles of an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @returns {Object} `samplesPerPixel`, `bitsAllocated`,
   * `pixelRepresentation`; `photometricInterpretation` of the decoded pixels
   * ("RGB" for color images, which are decoded to RGB even when stored as
   * e.g. JPEG YBR_FULL_422; "MONOCHROME2" or "MONOCHROME1" otherwise);
   * `storedPhotometricInterpretation` of the stored images; and `arrayType`,
   * the name of the TypedArray constructor of `pixelArray` returned by
   * {@link pyramid.VolumeImageReader#getTile}
   */
  getPixelInfo(opticalPathIdentifier) {
    return this._getChannel(opticalPathIdentifier).pixelInfo
  }

  /**
   * Get image metadata of an optical path, one image per pyramid level, in
   * the order of {@link pyramid.VolumeImageReader#levels}.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @returns {metadata.VLWholeSlideMicroscopyImage[]} Slide microscopy image
   * metadata
   */
  getOpticalPathMetadata(opticalPathIdentifier) {
    return this._getChannel(opticalPathIdentifier)
      .pyramid.metadata.slice(0)
      .reverse()
  }

  /**
   * Retrieve and decode a tile.
   *
   * The returned `pixelArray` holds the stored pixel values (no conversion to
   * floating point), row by row, with the samples of a pixel interleaved.
   * Tiles at the right and bottom border of the total pixel matrix are padded;
   * only the first `validColumns` columns and `validRows` rows hold image
   * data. With `crop`, the padding is removed instead, so that `columns` and
   * `rows` equal `validColumns` and `validRows`. Tiles absent from a TILED_SPARSE image resolve without a request,
   * with `isEmpty` set and `pixelArray` filled with 0 for MONOCHROME2 and
   * with the maximum value otherwise.
   *
   * When `signal` is aborted, the promise rejects with `signal.reason`, which
   * is a DOMException named "AbortError" unless a different reason was given,
   * and the queued decoding task is cancelled. The HTTP request is cancelled
   * with dicomweb-client 0.11 or later (see the README for details).
   * Other failures reject with an Error whose `cause` is the underlying
   * error, e.g. the dicomweb-client request error with `status`. Invalid
   * arguments reject with a TypeError or RangeError without a request.
   *
   * The returned `pixelArray` may be shared with caches of the caller (e.g.
   * the Viv pixel sources); treat it as read-only.
   *
   * @param {Object} options - Options
   * @param {string} options.opticalPathIdentifier - Optical Path Identifier
   * @param {number} options.level - Index into
   * {@link pyramid.VolumeImageReader#levels} (0 is the highest resolution)
   * @param {number} options.column - Zero-based tile column
   * @param {number} options.row - Zero-based tile row
   * @param {AbortSignal} [options.signal] - Signal to cancel the request
   * @param {boolean} [options.crop=false] - Remove the padding of tiles at the
   * right and bottom border of the total pixel matrix
   * @returns {Promise<Object>} `pixelArray`, `columns`, `rows`,
   * `samplesPerPixel`, `validColumns`, `validRows` and `isEmpty`
   */
  async getTile({
    opticalPathIdentifier,
    level,
    column,
    row,
    signal,
    crop = false,
  }) {
    if (this[_isDestroyed]) {
      /** Same error as for tiles that were pending when destroyed */
      throw new DOMException('The reader has been destroyed.', 'AbortError')
    }
    const channel = this._getChannel(opticalPathIdentifier)
    const levelInfo = Number.isInteger(level) ? this[_levels][level] : undefined
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

    /** Follow both the caller's signal and the reader's lifetime */
    const tileSignal = _anyAbortSignal([signal, this[_lifetime].signal])
    let tile
    try {
      const iccProfiles = await _raceAbort(
        this._getIccProfiles(channel),
        tileSignal.signal,
      )
      tile = await _retrieveTile({
        pyramid: channel.pyramid,
        client: this[_client],
        channel: opticalPathIdentifier,
        /** Index into the pyramid, which is ordered from lowest resolution */
        level: this[_levels].length - 1 - level,
        column,
        row,
        iccProfiles,
        iccOutputType: this[_iccOptions].iccOutputType,
        signal: tileSignal.signal,
      })
    } catch (error) {
      if (tileSignal.signal.aborted) {
        throw error
      }
      /** Describe the tile as the caller asked for it */
      const tileError = new Error(
        `Failed to load tile (column ${column}, row ${row}) of level ` +
          `${level} of optical path "${opticalPathIdentifier}".`,
        { cause: error.cause ?? error },
      )
      if (tileError.cause === undefined) {
        tileError.cause = error.cause ?? error
      }
      throw tileError
    } finally {
      tileSignal.dispose()
    }

    const pixelArray = tile.isEmpty
      ? _createBackgroundTile(channel.pixelInfo, tile.columns, tile.rows)
      : tile.pixelArray
    const validColumns = Math.min(
      tile.columns,
      levelInfo.totalPixelMatrixColumns - column * levelInfo.tileColumns,
    )
    const validRows = Math.min(
      tile.rows,
      levelInfo.totalPixelMatrixRows - row * levelInfo.tileRows,
    )
    if (crop && (validColumns < tile.columns || validRows < tile.rows)) {
      return {
        pixelArray: _cropTile({
          pixelArray,
          columns: tile.columns,
          samplesPerPixel: tile.samplesPerPixel,
          validColumns,
          validRows,
        }),
        columns: validColumns,
        rows: validRows,
        samplesPerPixel: tile.samplesPerPixel,
        validColumns,
        validRows,
        isEmpty: tile.isEmpty,
      }
    }
    return {
      pixelArray,
      columns: tile.columns,
      rows: tile.rows,
      samplesPerPixel: tile.samplesPerPixel,
      validColumns,
      validRows,
      isEmpty: tile.isEmpty,
    }
  }

  /**
   * Cancel tiles that are still in flight and release the decoding web
   * workers. Pending `getTile` calls, and calls made afterwards, reject with
   * a DOMException named "AbortError".
   */
  destroy() {
    if (this[_isDestroyed]) {
      return
    }
    this[_isDestroyed] = true
    this[_lifetime].abort(
      new DOMException('The reader has been destroyed.', 'AbortError'),
    )
    webWorkerManager.release()
  }

  /**
   * @private
   */
  _getChannel(opticalPathIdentifier) {
    /** Own properties only, so that e.g. "constructor" is not found */
    const channel = Object.hasOwn(this[_channels], opticalPathIdentifier)
      ? this[_channels][opticalPathIdentifier]
      : undefined
    if (channel === undefined) {
      throw new RangeError(
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
      })
        .then((profiles) => (profiles.length > 0 ? profiles : undefined))
        .catch((error) => {
          /** Decode without ICC profiles rather than failing every tile */
          console.error('Failed to fetch ICC profiles:', error)
          return undefined
        })
    }
    return this[_iccProfiles]
  }
}

export { _typedArrays, VolumeImageReader }
