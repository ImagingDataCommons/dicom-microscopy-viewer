import * as dwc from 'dicomweb-client'

import { _decodeAndTransformFrame } from './decode.js'
import publish from './eventPublisher'
import EVENT from './events'
import { logger } from './logger.js'
import { getFrameMapping, VLWholeSlideMicroscopyImage } from './metadata.js'
import { getPixelSpacing } from './scoord3dUtils'
import {
  _fetchBulkdata,
  applyInverseTransform,
  are1DArraysAlmostEqual,
  are2DArraysAlmostEqual,
  buildInverseTransform,
} from './utils.js'

/**
 * Get Image ICC profiles.
 *
 * @param {Array<metadata.VLWholeSlideMicroscopyImage>} pyramid - Metadata of
 * VL Whole Slide Microscopy Image instances
 * @param {object} options - options object
 * @param {object} options.metadata - metadata of VL Whole Slide Microscopy Image instances
 * @param {object} options.client - dicom web client
 * @param {function} options.onError - function to call when an error occurs
 *
 * @returns {Promise<Array<TypedArray>>} image array with ICC profiles (only for images with SamplesPerPixel === 3 and ICCProfile present)
 *
 * @private
 */
async function _getIccProfiles({ metadata, client, onError }) {
  const fetchPromises = metadata.map((image) => {
    if (image.SamplesPerPixel === 3) {
      let iccProfile = false
      const metadataItem = image.OpticalPathSequence[0]
      if (metadataItem.ICCProfile == null) {
        if ('OpticalPathSequence' in image.bulkdataReferences) {
          const bulkdataItem = image.bulkdataReferences.OpticalPathSequence[0]
          if ('ICCProfile' in bulkdataItem) {
            iccProfile = bulkdataItem.ICCProfile
          }
        }
      } else {
        iccProfile = metadataItem.ICCProfile
      }
      if (!iccProfile) {
        console.warn(
          `ICC Profile was not found for image "${image.SOPInstanceUID}"`,
        )
        return null
      } else if ('BulkDataURI' in iccProfile) {
        logger.debug(
          `fetching ICC Profile for image "${image.SOPInstanceUID}"`,
          iccProfile,
        )
        return _fetchBulkdata({
          client,
          reference: iccProfile,
        }).catch(onError)
      } else {
        return iccProfile
      }
    }
    return null
  })
  const validPromises = fetchPromises.filter(Boolean)
  const results = await Promise.allSettled(validPromises)
  return results
    .filter((result) => result.status === 'fulfilled' && result.value != null)
    .map((result) => result.value)
}

/**
 * Compute image pyramid.
 *
 * @param {object[]} metadata - Metadata of VL Whole Slide Microscopy Image instances
 * @returns {object} Information about the image pyramid
 *
 * @private
 */
function _computeImagePyramid({ metadata }) {
  if (metadata.length === 0) {
    throw new Error(
      'No image metadata was provided to computate image pyramid structure.',
    )
  }

  // Sort instances and optionally concatenation parts if present.
  metadata.sort((a, b) => {
    const sizeDiff = a.TotalPixelMatrixColumns - b.TotalPixelMatrixColumns
    if (sizeDiff === 0) {
      if (a.ConcatenationFrameOffsetNumber !== undefined) {
        return (
          a.ConcatenationFrameOffsetNumber - b.ConcatenationFrameOffsetNumber
        )
      }
      return sizeDiff
    }
    return sizeDiff
  })

  const pyramidMetadata = []
  const pyramidFrameMappings = []
  const pyramidDimensionOrganizationTypes = []
  let pyramidNumberOfChannels
  let pyramidIsLabelmap = false
  for (let i = 0; i < metadata.length; i++) {
    if (metadata[0].FrameOfReferenceUID !== metadata[i].FrameOfReferenceUID) {
      throw new Error(
        'Images of pyramid must all have the same Frame of Reference UID.',
      )
    }
    if (metadata[0].ContainerIdentifier !== metadata[i].ContainerIdentifier) {
      throw new Error(
        'Images of pyramid must all have the same Container Identifier.',
      )
    }

    const numberOfFrames = Number(metadata[i].NumberOfFrames || 1)
    const cols = metadata[i].TotalPixelMatrixColumns || metadata[i].Columns
    const rows = metadata[i].TotalPixelMatrixRows || metadata[i].Rows

    const {
      frameMapping,
      numberOfChannels,
      dimensionOrganizationType,
      isLabelmap,
    } = getFrameMapping(metadata[i])
    if (i > 0) {
      if (pyramidNumberOfChannels !== numberOfChannels) {
        throw new Error(
          'Images of pyramid must all have the same number of channels ' +
            '(optical paths, segments, mappings, etc.)',
        )
      }
    } else {
      pyramidNumberOfChannels = numberOfChannels
    }
    /** Store LABELMAP flag (only meaningful for segmentation metadata) */
    pyramidIsLabelmap = isLabelmap

    /*
     * Instances may be broken down into multiple concatentation parts.
     * Therefore, we have to re-assemble instance metadata.
     */
    let alreadyExists = false
    let index = null
    for (let j = 0; j < pyramidMetadata.length; j++) {
      const c =
        pyramidMetadata[j].TotalPixelMatrixColumns || pyramidMetadata[j].Columns
      const r =
        pyramidMetadata[j].TotalPixelMatrixRows || pyramidMetadata[j].Rows
      if (r === rows && c === cols) {
        alreadyExists = true
        index = j
      }
    }
    if (alreadyExists) {
      Object.assign(pyramidFrameMappings[index], frameMapping)
      /*
       * Create a new SOP Instance with metadata updated from current
       * concatentation part.
       */
      const rawMetadata = pyramidMetadata[index].json
      rawMetadata['00280008'].Value[0] += numberOfFrames
      if ('PerFrameFunctionalGroupsSequence' in metadata[index]) {
        rawMetadata['52009230'].Value.push(
          ...metadata[index].PerFrameFunctionalGroupsSequence,
        )
      }
      if (!('SOPInstanceUIDOfConcatenationSource' in metadata[i])) {
        throw new Error(
          'Multiple image instances for the same channel and ' +
            'focal plane have identical dimensions, but the instances ' +
            'are not part of a concatenation either. ' +
            'The image metadata is probably incorrect.',
        )
      }
      const sopInstanceUID = metadata[i].SOPInstanceUIDOfConcatenationSource
      rawMetadata['00080018'].Value[0] = sopInstanceUID
      delete rawMetadata['00200242'] // SOPInstanceUIDOfConcatenationSource
      delete rawMetadata['00209161'] // ConcatentationUID
      delete rawMetadata['00209162'] // InConcatenationNumber
      delete rawMetadata['00209228'] // ConcatenationFrameOffsetNumber
      pyramidMetadata[index] = new VLWholeSlideMicroscopyImage({
        metadata: rawMetadata,
      })
    } else {
      pyramidMetadata.push(metadata[i])
      pyramidFrameMappings.push(frameMapping)
      pyramidDimensionOrganizationTypes.push(dimensionOrganizationType)
    }
  }

  const nLevels = pyramidMetadata.length
  if (nLevels === 0) {
    console.error('empty pyramid - no levels found')
  }
  const pyramidBaseMetadata = pyramidMetadata[nLevels - 1]

  /*
   * Collect relevant information from DICOM metadata for each pyramid
   * level to construct the Openlayers map.
   */
  const pyramidTileSizes = []
  const pyramidGridSizes = []
  const pyramidResolutions = []
  const pyramidOrigins = []
  const pyramidPixelSpacings = []
  const offset = [0, -1]
  const baseTotalPixelMatrixColumns =
    pyramidBaseMetadata.TotalPixelMatrixColumns
  const baseTotalPixelMatrixRows = pyramidBaseMetadata.TotalPixelMatrixRows
  for (let j = nLevels - 1; j >= 0; j--) {
    const columns = pyramidMetadata[j].Columns
    const rows = pyramidMetadata[j].Rows
    const totalPixelMatrixColumns = pyramidMetadata[j].TotalPixelMatrixColumns
    const totalPixelMatrixRows = pyramidMetadata[j].TotalPixelMatrixRows
    const pixelSpacing = getPixelSpacing(pyramidMetadata[j])
    const nColumns = Math.ceil(totalPixelMatrixColumns / columns)
    const nRows = Math.ceil(totalPixelMatrixRows / rows)
    pyramidTileSizes.push([columns, rows])
    pyramidGridSizes.push([nColumns, nRows])
    pyramidPixelSpacings.push(pixelSpacing)

    /*
     * Compute the resolution (zoom factor) of this pyramid level relative to
     * the base level from the ratio of the total pixel matrix columns.
     *
     * We intentionally do NOT round the zoom factor to the nearest integer.
     * Most VOLUME levels are clean (power-of-two style) downsamples of the base
     * level, so their ratio is already (very close to) an integer and rounding
     * is harmless. However, THUMBNAIL images (and some vendor-generated levels)
     * are not exact fractions of the base level - e.g. a thumbnail with a ratio
     * of 57.70 would be rounded to 58, a ~0.5% scale error that stretches the
     * level so its (upsampled) image content drifts relative to vector
     * annotations while zooming, making annotations appear misplaced. See:
     *   - https://github.com/ImagingDataCommons/slim/issues/318
     *   - https://github.com/openlayers/openlayers/issues/12768
     * Using the exact ratio keeps every level aligned to the base coordinate
     * system, so annotations stay in the correct place.
     *
     * OpenLayers requires resolutions to be unique and sorted in strictly
     * descending order. Levels are processed here from the base (finest, ratio
     * 1) to the top (coarsest, largest ratio), so each computed zoom factor
     * must be strictly greater than the previously pushed one. Distinct levels
     * have distinct pixel matrix sizes and therefore distinct ratios, but we
     * guard against floating point ties to avoid an OpenLayers error.
     */
    let zoomFactor = baseTotalPixelMatrixColumns / totalPixelMatrixColumns
    const previousZoomFactor = pyramidResolutions[pyramidResolutions.length - 1]
    if (previousZoomFactor != null && zoomFactor <= previousZoomFactor) {
      console.warn(
        'zoom factor of pyramid level is not strictly greater than that of ' +
          'the previous (finer) level; nudging it to keep OpenLayers ' +
          'resolutions unique and strictly descending: ',
        zoomFactor,
      )
      zoomFactor = previousZoomFactor * (1 + Number.EPSILON * 4)
    }
    pyramidResolutions.push(zoomFactor)
    pyramidOrigins.push(offset)
  }
  pyramidResolutions.reverse()
  pyramidTileSizes.reverse()
  pyramidGridSizes.reverse()
  pyramidOrigins.reverse()
  pyramidPixelSpacings.reverse()

  /**
   * Frames may extend beyond the size of the total pixel matrix.
   * The excess pixels may contain garbage and should not be displayed.
   * We set the extent to the size of the actual image without taken
   * excess pixels into account.
   * Note that the vertical axis is flipped in the used tile source,
   * i.e., values on the axis lie in the range [-n, -1], where n is the
   * number of rows in the total pixel matrix.
   */
  const extent = [
    0, // min X
    -(baseTotalPixelMatrixRows + 1), // min Y
    baseTotalPixelMatrixColumns, // max X
    -1, // max Y
  ]

  return {
    extent,
    origins: pyramidOrigins,
    resolutions: pyramidResolutions,
    gridSizes: pyramidGridSizes,
    tileSizes: pyramidTileSizes,
    pixelSpacings: pyramidPixelSpacings,
    metadata: pyramidMetadata,
    frameMappings: pyramidFrameMappings,
    numberOfChannels: pyramidNumberOfChannels,
    dimensionOrganizationTypes: pyramidDimensionOrganizationTypes,
    isLabelmap: pyramidIsLabelmap,
  }
}

function _areImagePyramidsEqual(pyramid, refPyramid) {
  // Check that all the channels have the same pyramid parameters
  if (!are1DArraysAlmostEqual(pyramid.extent, refPyramid.extent)) {
    console.warn(
      'pyramid has different extent as reference pyramid: ',
      pyramid.extent,
      refPyramid.extent,
    )
    return false
  }
  if (!are2DArraysAlmostEqual(pyramid.origins, refPyramid.origins)) {
    console.warn(
      'pyramid has different origins as reference pyramid: ',
      pyramid.origins,
      refPyramid.origins,
    )
    return false
  }
  if (!are1DArraysAlmostEqual(pyramid.resolutions, refPyramid.resolutions)) {
    console.warn(
      'pyramid has different resolutions as reference pyramid: ',
      pyramid.resolutions,
      refPyramid.resolutions,
    )
    return false
  }
  if (!are2DArraysAlmostEqual(pyramid.gridSizes, refPyramid.gridSizes)) {
    console.warn(
      'pyramid has different grid sizes as reference pyramid: ',
      pyramid.gridSizes,
      refPyramid.gridSizes,
    )
    return false
  }
  if (!are2DArraysAlmostEqual(pyramid.tileSizes, refPyramid.tileSizes)) {
    console.warn(
      'pyramid has different tile sizes as reference pyramid: ',
      pyramid.tileSizes,
      refPyramid.tileSizes,
    )
    return false
  }
  if (
    !are2DArraysAlmostEqual(pyramid.pixelSpacings, refPyramid.pixelSpacings)
  ) {
    console.warn(
      'pyramid has different pixel spacings as reference pyramid: ',
      pyramid.pixelSpacings,
      refPyramid.pixelSpacings,
    )
    return false
  }
  return true
}

/**
 * Cache for empty tiles to avoid repeated allocation for TILED_SPARSE images.
 * Key format: "columns-rows-samplesPerPixel-bitsAllocated-photometricInterpretation"
 */
const emptyTileCache = new Map()

function _createEmptyTile({
  columns,
  rows,
  samplesPerPixel,
  bitsAllocated,
  photometricInterpretation,
}) {
  const cacheKey = `${columns}-${rows}-${samplesPerPixel}-${bitsAllocated}-${photometricInterpretation}`

  if (emptyTileCache.has(cacheKey)) {
    return emptyTileCache.get(cacheKey)
  }

  let pixelArray
  if (bitsAllocated <= 8) {
    pixelArray = new Uint8Array(columns * rows * samplesPerPixel)
  } else {
    pixelArray = new Float32Array(columns * rows * samplesPerPixel)
  }

  /** Fill white for color images, black for monochrome */
  let fillValue = 2 ** bitsAllocated - 1
  if (photometricInterpretation === 'MONOCHROME2') {
    if (bitsAllocated <= 16) {
      fillValue = 0
    } else {
      fillValue = -(2 ** bitsAllocated - 1) / 2
    }
  }
  for (let i = 0; i < pixelArray.length; i++) {
    pixelArray[i] = fillValue
  }

  emptyTileCache.set(cacheKey, pixelArray)
  return pixelArray
}

/**
 * Whether a TILED_SPARSE level has no frame at an OpenLayers tile coordinate.
 * Uses the same frame mapping key as `_createTileLoadFunction`
 * (`row-column-channel`, 1-based; OL x is the column, y the row).
 *
 * @param {Object} pyramid - Fitted pyramid with frameMappings
 * @param {string|number} channel - Segment number / channel identifier
 * @param {number} z - Tile zoom level
 * @param {number} x - Tile column (OpenLayers)
 * @param {number} y - Tile row (OpenLayers)
 * @returns {boolean}
 * @private
 */
function _isSparseTileMissing(pyramid, channel, z, x, y) {
  if (pyramid.dimensionOrganizationTypes?.[z] !== 'TILED_SPARSE') {
    return false
  }
  const mapping = pyramid.frameMappings?.[z]
  if (mapping == null) {
    return false
  }
  return mapping[`${y + 1}-${x + 1}-${channel}`] == null
}

function _createTileLoadFunction({
  pyramid,
  client,
  channel,
  iccProfiles,
  iccOutputType,
  targetElement,
  labelmapSegmentNumber,
}) {
  /**
   * Pre-cache values that don't change per tile request.
   * This avoids repeated lookups in the hot path.
   */
  const channelSuffix = `-${channel}`

  return async (z, y, x) => {
    /**
     * OpenLayers calls the loader as (z, column, row), so `y` here is the
     * column and `x` the row. Frame mapping keys are `row-column-channel`.
     */
    const index = `${x + 1}-${y + 1}${channelSuffix}`

    if (pyramid.metadata[z] === undefined) {
      throw new Error(
        `Could not load tile for channel "${channel}" ` +
          `at position (${x + 1}, ${y + 1}) at zoom level ${z} ` +
          ` because level ${z} does not exist.`,
      )
    }

    const path = pyramid.frameMappings[z][index]
    const refImage = pyramid.metadata[z]
    const columns = refImage.Columns
    const rows = refImage.Rows
    const bitsAllocated = refImage.BitsAllocated
    const samplesPerPixel = refImage.SamplesPerPixel
    const photometricInterpretation = refImage.PhotometricInterpretation

    /**
     * Fast path for missing tiles (common in TILED_SPARSE).
     * Return cached empty tile immediately without further processing.
     */
    if (path == null) {
      const dimensionOrganizationType = pyramid.dimensionOrganizationTypes?.[z]
      if (dimensionOrganizationType === 'TILED_FULL') {
        console.warn(
          `could not load tile "${index}" at level ${z}, ` +
            'this tile does not exist',
        )
      }
      return _createEmptyTile({
        columns,
        rows,
        samplesPerPixel,
        bitsAllocated,
        photometricInterpretation,
      })
    }

    /** Tile exists - do the full processing */
    const studyInstanceUID = refImage.StudyInstanceUID
    const seriesInstanceUID = refImage.SeriesInstanceUID
    const pixelRepresentation = refImage.PixelRepresentation
    const sopClassUID = refImage.SOPClassUID

    let src = ''
    if (client.wadoURL !== undefined) {
      src += client.wadoURL
    }
    src +=
      '/studies/' +
      studyInstanceUID +
      '/series/' +
      seriesInstanceUID +
      '/instances/' +
      path

    const sopInstanceUID = dwc.utils.getSOPInstanceUIDFromUri(src)
    const frameNumbers = dwc.utils.getFrameNumbersFromUri(src)

    if (samplesPerPixel === 1) {
      logger.debug(
        `retrieve frame ${frameNumbers} of monochrome image ` +
          `for channel "${channel}" at tile position (${x + 1}, ${y + 1}) ` +
          `at zoom level ${z}`,
      )
    } else {
      logger.debug(
        `retrieve frame ${frameNumbers} of color image ` +
          `at tile position (${x + 1}, ${y + 1}) at zoom level ${z}`,
      )
    }

    const octetStreamMediaType = 'application/octet-stream'
    /*
     * Use of the "*" transfer syntax is a hack to work around standard
     * compliance issues of the Google Cloud Healthcare API.
     * It will return bulkdata encoded with the transfer syntax of the
     * stored data set (uncompressed or compressed). The decoder can then not
     * rely on the media type specified by the "Content-Type" header in the
     * response message, but will need to determine it from the payload.
     * Only application/octet-stream with "*" is requested here; decoders
     * determine the actual compression format (e.g. JPEG, JPEG-LS, JPEG 2000)
     * from the payload when processing the frames.
     */
    const octetStreamTransferSyntaxUID = '*'

    const mediaTypes = []
    mediaTypes.push(
      ...[
        {
          mediaType: octetStreamMediaType,
          transferSyntaxUID: octetStreamTransferSyntaxUID,
        },
      ],
    )

    const frameInfo = {
      studyInstanceUID,
      seriesInstanceUID,
      sopInstanceUID,
      sopClassUID,
      frameNumber: frameNumbers[0],
      channelIdentifier: String(channel),
    }
    publish(targetElement, EVENT.FRAME_LOADING_STARTED, frameInfo)

    const retrieveOptions = {
      studyInstanceUID,
      seriesInstanceUID,
      sopInstanceUID,
      frameNumbers,
      mediaTypes,
    }
    return client
      .retrieveInstanceFrames(retrieveOptions)
      .then((rawFrames) => {
        return _decodeAndTransformFrame({
          frame: rawFrames[0],
          frameNumber: frameNumbers[0],
          bitsAllocated,
          pixelRepresentation,
          columns,
          rows,
          samplesPerPixel,
          sopInstanceUID,
          metadata: pyramid.metadata,
          iccProfiles,
          iccOutputType,
        }).then((pixelArray) => {
          if (pixelArray.constructor === Float64Array) {
            throw new Error('Double Float Pixel Data is not (yet) supported.')
          }

          /**
           * For LABELMAP segmentation, pixel values represent segment numbers.
           * Apply masking to create a binary layer for this specific segment:
           * pixels matching the segment number → 1, others → 0.
           */
          let processedArray = pixelArray
          if (labelmapSegmentNumber != null) {
            const maskedArray = new pixelArray.constructor(pixelArray.length)
            for (let i = 0; i < pixelArray.length; i++) {
              maskedArray[i] = pixelArray[i] === labelmapSegmentNumber ? 1 : 0
            }
            processedArray = maskedArray
          }

          publish(targetElement, EVENT.FRAME_LOADING_ENDED, {
            pixelArray: processedArray,
            ...frameInfo,
          })
          if (samplesPerPixel === 3 && bitsAllocated === 8) {
            /** Rendering of color images requires unsigned 8-bit integers */
            return processedArray
          }
          /** Rendering of grayscale images requires floating point values */
          return new Float32Array(
            processedArray,
            processedArray.byteOffset,
            processedArray.byteLength / processedArray.BYTES_PER_ELEMENT,
          )
        })
      })
      .catch((error) => {
        publish(targetElement, EVENT.FRAME_LOADING_ENDED, frameInfo)
        publish(targetElement, EVENT.FRAME_LOADING_ERROR, frameInfo)
        return Promise.reject(
          new Error(
            `Failed to load frames ${frameNumbers} ` +
              `of SOP instance "${sopInstanceUID}" ` +
              `for channel "${channel}" ` +
              `at tile position (${x + 1}, ${y + 1}) ` +
              `at zoom level ${z}: `,
            error,
          ),
        )
      })
  }
}

function _fitImagePyramid(pyramid, refPyramid) {
  /** Get the matching levels between the two pyramids */
  const matchingLevelIndices = []
  for (let i = 0; i < refPyramid.metadata.length; i++) {
    for (let j = 0; j < pyramid.metadata.length; j++) {
      const doOriginsMatch = are1DArraysAlmostEqual(
        refPyramid.origins[i],
        pyramid.origins[j],
      )
      const doPixelSpacingsMatch = are1DArraysAlmostEqual(
        refPyramid.pixelSpacings[i],
        pyramid.pixelSpacings[j],
      )
      if (doOriginsMatch && doPixelSpacingsMatch) {
        matchingLevelIndices.push([i, j])
      }
    }
  }

  /** Create a new pyramid that fits the reference pyramid */
  const fittedPyramid = {
    extent: [...refPyramid.extent],
    origins: [],
    resolutions: [],
    gridSizes: [],
    tileSizes: [],
    pixelSpacings: [],
    metadata: [],
    frameMappings: [],
    dimensionOrganizationTypes: [],
    usePerFramePlacement: false,
    fitResolution: null,
    pixelOriginOffset: [0, 0],
  }

  if (matchingLevelIndices.length === 0) {
    console.warn(
      'No matching pyramid levels found, handling fixed pixel spacing case...',
    )

    const refBaseLevel = refPyramid.metadata[refPyramid.metadata.length - 1]

    for (let j = 0; j < pyramid.metadata.length; j++) {
      const segmentation = pyramid.metadata[j]
      const refBasePixelSpacing = getPixelSpacing(refBaseLevel)
      const segPixelSpacing = getPixelSpacing(segmentation)

      /**
       * Exact ratio of pixel spacings. Rounding would scale sparse tiles and
       * frames differently from the extent and misalign them.
       */
      const resolution = segPixelSpacing[0] / refBasePixelSpacing[0]

      /**
       * Offset of the SEG origin from the base origin, in base image pixels
       * (column, row). Zero when either origin or the orientation is missing.
       */
      const refOriginSeq = refBaseLevel.TotalPixelMatrixOriginSequence?.[0]
      const segOriginSeq = segmentation.TotalPixelMatrixOriginSequence?.[0]
      const orientation = refBaseLevel.ImageOrientationSlide
      let offsetX = 0
      let offsetY = 0
      if (refOriginSeq && segOriginSeq && orientation?.length === 6) {
        const toSlideCoordinate = (originSeq) => [
          Number(originSeq.XOffsetInSlideCoordinateSystem || 0),
          Number(originSeq.YOffsetInSlideCoordinateSystem || 0),
        ]
        const refOrigin = toSlideCoordinate(refOriginSeq)
        const affine = buildInverseTransform({
          offset: refOrigin,
          orientation: orientation.map(Number),
          spacing: refBasePixelSpacing,
        })
        const [refCol, refRow] = applyInverseTransform({
          coordinate: refOrigin,
          affine,
        })
        const [segCol, segRow] = applyInverseTransform({
          coordinate: toSlideCoordinate(segOriginSeq),
          affine,
        })
        offsetX = segCol - refCol
        offsetY = segRow - refRow
      }

      /**
       * Create extent for the SEG overlay in base image coordinate system.
       * The SEG covers its own pixel dimensions, scaled by resolution ratio.
       */
      const segCols = segmentation.TotalPixelMatrixColumns
      const segRows = segmentation.TotalPixelMatrixRows
      const scaledWidth = segCols * resolution
      const scaledHeight = segRows * resolution

      const extent = [
        offsetX,
        -(offsetY + scaledHeight + 1),
        offsetX + scaledWidth,
        -(offsetY + 1),
      ]
      fittedPyramid.extent = extent

      /**
       * For TILED_SPARSE, frames may be positioned at arbitrary pixel locations
       * within the TotalPixelMatrix, not necessarily at tile boundaries.
       * We need to calculate the sub-tile offset and adjust the tile grid origin.
       */
      let tileOriginOffset = [0, 0]
      const perframeFuncGroups = segmentation.PerFrameFunctionalGroupsSequence
      const tileHeight = segmentation.Rows
      const tileWidth = segmentation.Columns

      if (
        pyramid.dimensionOrganizationTypes?.[j] === 'TILED_SPARSE' &&
        perframeFuncGroups?.length > 0
      ) {
        /** Check frames to see if they have consistent sub-tile offsets */
        let inconsistentCount = 0
        let firstOffset = null

        for (
          let frameIdx = 0;
          frameIdx < perframeFuncGroups.length;
          frameIdx++
        ) {
          const framePosition =
            perframeFuncGroups[frameIdx].PlanePositionSlideSequence?.[0]
          if (framePosition) {
            const rowPosition = Number(
              framePosition.RowPositionInTotalImagePixelMatrix,
            )
            const colPosition = Number(
              framePosition.ColumnPositionInTotalImagePixelMatrix,
            )

            if (!Number.isNaN(rowPosition) && !Number.isNaN(colPosition)) {
              const tileRowIndex = Math.ceil(rowPosition / tileHeight)
              const tileColIndex = Math.ceil(colPosition / tileWidth)
              const tileBoundaryRow = (tileRowIndex - 1) * tileHeight + 1
              const tileBoundaryCol = (tileColIndex - 1) * tileWidth + 1
              const entry = {
                subTileRowOffset: rowPosition - tileBoundaryRow,
                subTileColOffset: colPosition - tileBoundaryCol,
              }
              if (firstOffset == null) {
                firstOffset = entry
              } else if (
                entry.subTileRowOffset !== firstOffset.subTileRowOffset ||
                entry.subTileColOffset !== firstOffset.subTileColOffset
              ) {
                inconsistentCount += 1
              }
            }
          }
        }

        /** Use the first frame's offset only when every frame shares it */
        if (firstOffset != null) {
          if (inconsistentCount > 0) {
            /**
             * Patches sit at arbitrary positions inside their ceil() grid
             * cells. A single TileGrid origin cannot place them — render
             * each frame at its PlanePosition instead (see addSegments).
             */
            fittedPyramid.usePerFramePlacement = true
            tileOriginOffset = [0, 0]
            console.warn(
              `[SPARSE] ${inconsistentCount}/${perframeFuncGroups.length} frames have different sub-tile offsets; using per-frame placement.`,
            )
          } else {
            const baseRowOffset = firstOffset.subTileRowOffset * resolution
            const baseColOffset = firstOffset.subTileColOffset * resolution
            tileOriginOffset = [baseColOffset, -baseRowOffset]
          }
        }
      }

      fittedPyramid.fitResolution = resolution
      fittedPyramid.pixelOriginOffset = [offsetX, offsetY]

      /**
       * Adjust the origin to be consistent with the extent.
       * The extent top-left is at [offsetX, -(offsetY + 1)], so the origin
       * should start there, plus the sub-tile offset for frame alignment.
       *
       * Note: The origin is where tile (0, 0) would be positioned.
       * For TILED_SPARSE with frames at arbitrary positions, we need
       * the origin to align with the extent's coordinate system.
       */
      const adjustedOrigin = [
        offsetX + tileOriginOffset[0],
        -(offsetY + 1) + tileOriginOffset[1],
      ]

      fittedPyramid.origins.push(adjustedOrigin)
      fittedPyramid.gridSizes.push([...pyramid.gridSizes[j]])
      fittedPyramid.tileSizes.push([...pyramid.tileSizes[j]])
      fittedPyramid.resolutions.push(resolution)
      fittedPyramid.pixelSpacings.push([...pyramid.pixelSpacings[j]])
      fittedPyramid.metadata.push(pyramid.metadata[j])
      fittedPyramid.frameMappings.push(pyramid.frameMappings[j])
      if (pyramid.dimensionOrganizationTypes) {
        fittedPyramid.dimensionOrganizationTypes.push(
          pyramid.dimensionOrganizationTypes[j],
        )
      }
    }
  } else {
    /**
     * Fit the pyramid levels to the reference image pyramid.
     * Use the matching levels found in the matchingLevelIndices array.
     */
    for (let i = 0; i < refPyramid.metadata.length; i++) {
      const index = matchingLevelIndices.find((element) => element[0] === i)
      if (index) {
        const j = index[1]
        fittedPyramid.origins.push([...pyramid.origins[j]])
        fittedPyramid.gridSizes.push([...pyramid.gridSizes[j]])
        fittedPyramid.tileSizes.push([...pyramid.tileSizes[j]])
        fittedPyramid.resolutions.push(refPyramid.resolutions[i])
        fittedPyramid.pixelSpacings.push([...pyramid.pixelSpacings[j]])
        fittedPyramid.metadata.push(pyramid.metadata[j])
        fittedPyramid.frameMappings.push(pyramid.frameMappings[j])
        if (pyramid.dimensionOrganizationTypes) {
          fittedPyramid.dimensionOrganizationTypes.push(
            pyramid.dimensionOrganizationTypes[j],
          )
        }
      }
    }
  }

  const hasMatchingLevels = matchingLevelIndices.length > 0
  let minZoom = 0
  let maxZoom = Math.max(refPyramid.resolutions.length - 1, 0)

  if (hasMatchingLevels) {
    /**
     * Shared pyramid levels: clamp zoom to the matching base indices so the
     * overlay is only preferred within its available resolution range.
     */
    for (let i = 0; i < refPyramid.resolutions.length; i++) {
      for (let j = 0; j < fittedPyramid.resolutions.length; j++) {
        if (refPyramid.resolutions[i] === fittedPyramid.resolutions[j]) {
          minZoom = i
          break
        }
      }
    }
    maxZoom = refPyramid.resolutions.length - 1
    for (let i = refPyramid.resolutions.length - 1; i >= minZoom; i--) {
      for (let j = fittedPyramid.resolutions.length - 1; j >= 0; j--) {
        if (refPyramid.resolutions[i] === fittedPyramid.resolutions[j]) {
          maxZoom = i
          break
        }
      }
    }
  } else if (fittedPyramid.resolutions.length > 0) {
    /**
     * No shared levels (e.g. TILED_SPARSE at a non-matching spacing). The
     * fitted pyramid has its own resolution(s) that are not in the base
     * pyramid. Map each fitted resolution to the closest base zoom index so
     * click-to-zoom / fit targets the fitted overlay instead of the full
     * base range (0..n-1), which zooms incorrectly for single-level SEGs.
     * See https://github.com/ImagingDataCommons/slim/issues/371
     */
    const closestZooms = fittedPyramid.resolutions.map((resolution) =>
      _findClosestResolutionIndex(refPyramid.resolutions, resolution),
    )
    minZoom = Math.min(...closestZooms)
    maxZoom = Math.max(...closestZooms)
  }

  return [fittedPyramid, minZoom, maxZoom, hasMatchingLevels]
}

/**
 * Build map extents for TILED_SPARSE frames that are not on a shared sub-tile
 * origin. Each frame is placed from its PlanePositionSlide coordinates.
 *
 * @param {Object} segmentation - SEG metadata instance
 * @param {number} fitResolution - SEG→base spacing ratio
 * @param {number[]} pixelOriginOffset - [offsetX, offsetY] of SEG TPM in base px
 * @param {string|number} channelId - Segment number to include
 * @returns {Array<{frameNumber: number, extent: number[], origin: number[], tileSize: number[]}>}
 * @private
 */
function _buildSparseFramePlacements(
  segmentation,
  fitResolution,
  pixelOriginOffset,
  channelId,
) {
  const channel = String(channelId)
  const offsetX = pixelOriginOffset?.[0] || 0
  const offsetY = pixelOriginOffset?.[1] || 0
  const tileWidth = segmentation.Columns
  const tileHeight = segmentation.Rows
  const sharedFuncGroups = segmentation.SharedFunctionalGroupsSequence
  const perframeFuncGroups = segmentation.PerFrameFunctionalGroupsSequence || []
  const placements = []

  for (let j = 0; j < perframeFuncGroups.length; j++) {
    let frameChannel
    try {
      frameChannel = String(
        perframeFuncGroups[j].SegmentIdentificationSequence[0]
          .ReferencedSegmentNumber,
      )
    } catch {
      try {
        frameChannel = String(
          sharedFuncGroups[0].SegmentIdentificationSequence[0]
            .ReferencedSegmentNumber,
        )
      } catch {
        frameChannel = channel
      }
    }
    if (frameChannel !== channel) {
      continue
    }

    const framePosition = perframeFuncGroups[j].PlanePositionSlideSequence?.[0]
    if (!framePosition) {
      continue
    }
    const rowPosition = Number(framePosition.RowPositionInTotalImagePixelMatrix)
    const colPosition = Number(
      framePosition.ColumnPositionInTotalImagePixelMatrix,
    )
    if (Number.isNaN(rowPosition) || Number.isNaN(colPosition)) {
      continue
    }

    /**
     * SEG TPM (col,row) 1-based → map coords. Top-left of pixel (1,1) is
     * [offsetX, -(offsetY + 1)] (same convention as fitted extent).
     */
    const minX = offsetX + (colPosition - 1) * fitResolution
    const maxX = minX + tileWidth * fitResolution
    const maxY = -(offsetY + 1) - (rowPosition - 1) * fitResolution
    const minY = maxY - tileHeight * fitResolution

    placements.push({
      frameNumber: j + 1,
      extent: [minX, minY, maxX, maxY],
      origin: [minX, maxY],
      tileSize: [tileWidth, tileHeight],
    })
  }

  return placements
}

/**
 * Single-level pyramid for one sparse frame (used by ImageStatic loaders).
 * One WebGL tile layer per frame exceeds browser WebGL context limits when
 * all frames are in view at overview; ImageStatic avoids that.
 *
 * @param {Object} options
 * @param {{extent: number[], origin: number[], tileSize: number[], frameNumber: number}} options.placement
 * @param {number} options.fitResolution
 * @param {Object} options.segmentation
 * @param {string|number} options.channelId
 * @returns {{pyramid: Object, nativeSize: number[], framePath: string}}
 * @private
 */
function _buildPerFrameImagePyramid({
  placement,
  fitResolution,
  segmentation,
  channelId,
}) {
  const nativeW = placement.tileSize[0]
  const nativeH = placement.tileSize[1]
  const channel = String(channelId)
  const framePath = `${segmentation.SOPInstanceUID}/frames/${placement.frameNumber}`

  return {
    pyramid: {
      extent: [...placement.extent],
      origins: [[...placement.origin]],
      resolutions: [fitResolution],
      gridSizes: [[1, 1]],
      tileSizes: [[nativeW, nativeH]],
      pixelSpacings: [[fitResolution, fitResolution]],
      metadata: [segmentation],
      frameMappings: [{ [`1-1-${channel}`]: framePath }],
      dimensionOrganizationTypes: ['TILED_SPARSE'],
    },
    nativeSize: [nativeW, nativeH],
    framePath,
  }
}

/**
 * Minimum on-screen stamp size (CSS px). Below this, a frame is expanded so
 * the overlay cannot vanish at full-slide zoom.
 */
const PER_FRAME_OVERVIEW_MIN_PX = 12

/**
 * Fallback handoff size (CSS px) when native frame size is unknown.
 * Kept high so sparse nearest-neighbor masks are not left without stamps
 * in the mid-zoom gap (see native-aware handoff below).
 */
const PER_FRAME_OVERVIEW_HANDOFF_PX = 256

/**
 * Hide overview stamps once the frame's on-screen size reaches this fraction
 * of its native pixel size. Sparse PanopTILs-style masks (tiny nuclei in a
 * ~280px patch, nearest-neighbor) stay empty well below ~1:1, so handing
 * off at a fixed ~128 CSS px left a dead zone while zooming out.
 */
const PER_FRAME_OVERVIEW_HANDOFF_RATIO = 0.9

/**
 * Frame rasters become visible at this multiple of the stamp handoff
 * resolution, so they are decoded before the stamps disappear.
 */
const PER_FRAME_RASTER_PRELOAD_FACTOR = 2

/**
 * Coarsest view resolution (exclusive) at which per-frame rasters are drawn.
 * Above it the overview stamps cover every frame, and loading the rasters
 * would fetch and decode each frame in view for nothing.
 *
 * @param {number} fitResolution - Base pixels per SEG pixel
 * @returns {number}
 */
function _perFrameRasterMaxResolution(fitResolution) {
  return (
    (fitResolution / PER_FRAME_OVERVIEW_HANDOFF_RATIO) *
    PER_FRAME_RASTER_PRELOAD_FACTOR
  )
}

/**
 * Map extent of one overview stamp at a view resolution. Returns null when
 * the frame is large enough on screen for the raster mask to take over;
 * otherwise the frame extent, grown around its center to at least
 * `PER_FRAME_OVERVIEW_MIN_PX` CSS px.
 *
 * @param {number[]} frameExtent - `[minX, minY, maxX, maxY]` in map units
 * @param {number} resolution - Map units per CSS pixel
 * @param {number[]} [nativeSize] - `[width, height]` of the decoded frame
 * @returns {number[]|null}
 */
function _overviewStampExtent(frameExtent, resolution, nativeSize) {
  if (!(resolution > 0) || !frameExtent) {
    return null
  }
  const [minX, minY, maxX, maxY] = frameExtent
  const cssW = (maxX - minX) / resolution
  const cssH = (maxY - minY) / resolution
  const nativeW = nativeSize?.[0]
  const nativeH = nativeSize?.[1]
  const handoffW =
    Number.isFinite(nativeW) && nativeW > 0
      ? nativeW * PER_FRAME_OVERVIEW_HANDOFF_RATIO
      : PER_FRAME_OVERVIEW_HANDOFF_PX
  const handoffH =
    Number.isFinite(nativeH) && nativeH > 0
      ? nativeH * PER_FRAME_OVERVIEW_HANDOFF_RATIO
      : PER_FRAME_OVERVIEW_HANDOFF_PX
  if (cssW >= handoffW && cssH >= handoffH) {
    return null
  }
  if (cssW >= PER_FRAME_OVERVIEW_MIN_PX && cssH >= PER_FRAME_OVERVIEW_MIN_PX) {
    return [minX, minY, maxX, maxY]
  }
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const halfW = (Math.max(cssW, PER_FRAME_OVERVIEW_MIN_PX) * resolution) / 2
  const halfH = (Math.max(cssH, PER_FRAME_OVERVIEW_MIN_PX) * resolution) / 2
  return [cx - halfW, cy - halfH, cx + halfW, cy + halfH]
}

/**
 * Palette index for one stored label. Window width <= 1 cannot use the VOI
 * scale (it divides by zero and then rounds both 0 and 1 onto the foreground
 * entry). Discrete labels map by identity in that case.
 *
 * @param {number} stored
 * @param {number} windowCenter
 * @param {number} windowWidth
 * @param {number} maxIndex
 * @returns {number}
 * @private
 */
function _paletteIndex(stored, windowCenter, windowWidth, maxIndex) {
  if (!(maxIndex >= 0)) {
    return 0
  }
  let raw
  if (!(windowWidth > 1)) {
    raw = stored
  } else {
    raw = ((stored - (windowCenter - 0.5)) / (windowWidth - 1) + 0.5) * maxIndex
  }
  return Math.max(0, Math.min(maxIndex, Math.round(raw)))
}

/**
 * Map single-band label samples through a palette into an RGBA PNG data URL.
 * Colors are RGB 0–255; optional 4th component is alpha 0–1 (OpenLayers palette).
 *
 * @param {TypedArray|ArrayLike<number>} data
 * @param {number} width
 * @param {number} height
 * @param {number[][]} colormap
 * @param {number} windowCenter
 * @param {number} windowWidth
 * @returns {string} PNG data URL
 * @private
 */
function _paletteBandToDataUrl(
  data,
  width,
  height,
  colormap,
  windowCenter,
  windowWidth,
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(width, height)
  const rgba = imageData.data
  const maxIndex = colormap.length - 1

  for (let i = 0; i < width * height; i++) {
    const index = _paletteIndex(data[i], windowCenter, windowWidth, maxIndex)
    const color = colormap[index] || [0, 0, 0, 0]
    const o = i * 4
    rgba[o] = color[0]
    rgba[o + 1] = color[1]
    rgba[o + 2] = color[2]
    rgba[o + 3] =
      color.length > 3
        ? Math.round(Math.max(0, Math.min(1, color[3])) * 255)
        : 255
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

/**
 * Build an ImageStatic load function that decodes one sparse frame and paints
 * it with the current segment palette (scales with the view at every zoom).
 *
 * @param {Object} options
 * @param {Object} options.pyramid
 * @param {Object} options.client
 * @param {string|number} options.channel
 * @param {number} [options.labelmapSegmentNumber] - LABELMAP segment to mask
 * @param {Map<string, Promise<Uint8Array|Uint16Array>>} options.frameDataCache -
 *   Decoded frames of the SEG instance, shared by all of its segments so a
 *   LABELMAP frame is fetched once rather than once per segment
 * @param {HTMLElement} options.targetElement
 * @param {function(): {colormap: number[][], windowCenter: number, windowWidth: number}} options.getPalette
 * @param {function(Uint8Array|Uint16Array): void} [options.onFrameData] -
 *   Receives the unmasked frame samples each time the frame is painted
 * @param {number[]} options.nativeSize
 * @returns {function}
 * @private
 */
function _createPerFrameImageLoadFunction(options) {
  const {
    pyramid,
    client,
    channel,
    labelmapSegmentNumber,
    frameDataCache,
    targetElement,
    getPalette,
    onFrameData,
    nativeSize,
  } = options
  const baseLoader = _createTileLoadFunction({
    pyramid,
    client,
    channel,
    iccProfiles: [],
    targetElement,
  })
  const [nativeW, nativeH] = nativeSize
  const [framePath] = Object.values(pyramid.frameMappings[0])
  const bitsAllocated = pyramid.metadata[0].BitsAllocated

  /** Caches the promise, so a source rebuilt mid-load does not refetch */
  const loadFrameData = () => {
    let frameData = frameDataCache.get(framePath)
    if (frameData == null) {
      /** SEG samples are integers of at most 16 bits; Float32 is only for WebGL */
      frameData = baseLoader(0, 0, 0).then((data) =>
        bitsAllocated > 8 ? Uint16Array.from(data) : Uint8Array.from(data),
      )
      frameDataCache.set(framePath, frameData)
      frameData.catch(() => {
        frameDataCache.delete(framePath)
      })
    }
    return frameData
  }

  return (image, _src) => {
    loadFrameData()
      .then((data) => {
        onFrameData?.(data)
        const values =
          labelmapSegmentNumber == null
            ? data
            : data.map((value) => (value === labelmapSegmentNumber ? 1 : 0))
        const { colormap, windowCenter, windowWidth } = getPalette()
        image.getImage().src = _paletteBandToDataUrl(
          values,
          nativeW,
          nativeH,
          colormap,
          windowCenter,
          windowWidth,
        )
      })
      .catch((error) => {
        console.error('error loading per-frame SEG image', error)
        image.getImage().src = ''
      })
  }
}

/**
 * Find the index of the resolution closest to a target value.
 *
 * @param {number[]} resolutions - Sorted resolution array (coarsest → finest)
 * @param {number} targetResolution - Resolution to match
 * @returns {number} Index of the closest resolution
 * @private
 */
function _findClosestResolutionIndex(resolutions, targetResolution) {
  if (!resolutions || resolutions.length === 0) {
    return 0
  }
  let bestIndex = 0
  let bestDiff = Math.abs(resolutions[0] - targetResolution)
  for (let i = 1; i < resolutions.length; i++) {
    const diff = Math.abs(resolutions[i] - targetResolution)
    if (diff < bestDiff) {
      bestDiff = diff
      bestIndex = i
    }
  }
  return bestIndex
}

/**
 * Compute segment bounding boxes from frame mappings.
 *
 * Scans every frame mapping key once for all segments; LABELMAP maps each
 * frame under every segment number, so a per-segment scan is quadratic.
 *
 * @param {Object} pyramid - Image pyramid with frame mappings (coarsest level first)
 * @param {number} [scaleFactor=1] - Scale factor from the finest segment level to base image pixels
 * @param {number[]} [pixelOffset=[0, 0]] - Origin offset `[offsetX, offsetY]` in base image pixels (from the fitted pyramid)
 * @returns {Map<string, number[]>} Extent [minX, minY, maxX, maxY] in map
 * coordinates keyed by segment number; segments without frames are absent
 * @private
 */
function _computeSegmentBoundingBoxes(
  pyramid,
  scaleFactor = 1,
  pixelOffset = [0, 0],
) {
  const boxes = new Map()
  const offsetX = pixelOffset[0] || 0
  const offsetY = pixelOffset[1] || 0

  /**
   * Use the finest level that has frames for each segment. Coarser levels
   * are scaled by their downsampling relative to the finest level.
   */
  const finestLevel = pyramid.metadata[pyramid.metadata.length - 1]
  for (let z = pyramid.frameMappings.length - 1; z >= 0; z--) {
    const frameMapping = pyramid.frameMappings[z]
    const metadata = pyramid.metadata[z]

    if (!frameMapping || !metadata) continue

    const levelBounds = new Map()
    for (const key of Object.keys(frameMapping)) {
      /** Key format is "rowIndex-colIndex-channelIdentifier" */
      const parts = key.split('-')
      if (parts.length < 3) continue
      const channelId = parts[parts.length - 1]
      if (boxes.has(channelId)) continue

      const rowIndex = parseInt(parts[0], 10)
      const colIndex = parseInt(parts[1], 10)
      const bounds = levelBounds.get(channelId)
      if (bounds == null) {
        levelBounds.set(channelId, [rowIndex, rowIndex, colIndex, colIndex])
      } else {
        bounds[0] = Math.min(bounds[0], rowIndex)
        bounds[1] = Math.max(bounds[1], rowIndex)
        bounds[2] = Math.min(bounds[2], colIndex)
        bounds[3] = Math.max(bounds[3], colIndex)
      }
    }

    const levelScaleFactor =
      scaleFactor *
      ((finestLevel.TotalPixelMatrixColumns || finestLevel.Columns) /
        (metadata.TotalPixelMatrixColumns || metadata.Columns))
    const tileWidth = metadata.Columns * levelScaleFactor
    const tileHeight = metadata.Rows * levelScaleFactor
    for (const [channelId, [minRow, maxRow, minCol, maxCol]] of levelBounds) {
      /**
       * Tile indices are 1-based. Apply the fitted-pyramid origin offset,
       * then convert to map coordinates: map Y = -(pixel Y + 1).
       */
      boxes.set(channelId, [
        offsetX + (minCol - 1) * tileWidth,
        -(offsetY + maxRow * tileHeight + 1),
        offsetX + maxCol * tileWidth,
        -(offsetY + (minRow - 1) * tileHeight + 1),
      ])
    }
  }

  return boxes
}

export {
  _areImagePyramidsEqual,
  _buildPerFrameImagePyramid,
  _buildSparseFramePlacements,
  _computeImagePyramid,
  _computeSegmentBoundingBoxes,
  _createPerFrameImageLoadFunction,
  _createTileLoadFunction,
  _findClosestResolutionIndex,
  _fitImagePyramid,
  _getIccProfiles,
  _isSparseTileMissing,
  _overviewStampExtent,
  _paletteBandToDataUrl,
  _paletteIndex,
  _perFrameRasterMaxResolution,
  PER_FRAME_OVERVIEW_HANDOFF_PX,
  PER_FRAME_OVERVIEW_HANDOFF_RATIO,
  PER_FRAME_OVERVIEW_MIN_PX,
}
