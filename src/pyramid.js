import * as dwc from 'dicomweb-client'

import { _decodeAndTransformFrame } from './decode.js'
import publish from './eventPublisher'
import EVENT from './events'
import { logger } from './logger.js'
import { getFrameMapping, VLWholeSlideMicroscopyImage } from './metadata.js'
import { getPixelSpacing } from './scoord3dUtils'
import {
  _fetchBulkdata,
  are1DArraysAlmostEqual,
  are2DArraysAlmostEqual,
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

    const { frameMapping, numberOfChannels, dimensionOrganizationType } =
      getFrameMapping(metadata[i])
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

function _createTileLoadFunction({
  pyramid,
  client,
  channel,
  iccProfiles,
  iccOutputType,
  targetElement,
}) {
  /**
   * Pre-cache values that don't change per tile request.
   * This avoids repeated lookups in the hot path.
   */
  const channelSuffix = `-${channel}`

  return async (z, y, x) => {
    /**
     * Build frame mapping key from tile coordinates.
     * Note: The function signature uses (z, y, x) where the mapping is:
     * - x corresponds to row index in the frame mapping
     * - y corresponds to column index in the frame mapping
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
            // TODO: handle Float64Array using LUT
            throw new Error('Double Float Pixel Data is not (yet) supported.')
          }
          publish(targetElement, EVENT.FRAME_LOADING_ENDED, {
            pixelArray,
            ...frameInfo,
          })
          if (samplesPerPixel === 3 && bitsAllocated === 8) {
            // Rendering of color images requires unsigned 8-bit integers
            return pixelArray
          }
          // Rendering of grayscale images requires floating point values
          return new Float32Array(
            pixelArray,
            pixelArray.byteOffset,
            pixelArray.byteLength / pixelArray.BYTES_PER_ELEMENT,
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
       * Calculate resolution based on ratio of pixel spacings.
       * For TILED_SPARSE, we MUST use the exact resolution (not rounded)
       * to ensure tiles are rendered at the correct scale and position.
       * Rounding causes misalignment because the tiles would be scaled incorrectly.
       */
      const resolution = segPixelSpacing[0] / refBasePixelSpacing[0]
      const finalResolution = parseFloat(resolution.toFixed(4))

      /**
       * For TILED_SPARSE overlays at non-matching resolutions:
       * Calculate where the SEG's origin is in base image pixel coordinates,
       * then create an extent that positions the SEG correctly.
       */
      const refOriginSeq = refBaseLevel.TotalPixelMatrixOriginSequence?.[0]
      const segOriginSeq = segmentation.TotalPixelMatrixOriginSequence?.[0]

      /** Default to using scaled SEG extent if origins match or are unavailable */
      let offsetX = 0
      let offsetY = 0

      if (refOriginSeq && segOriginSeq) {
        const refOriginX = Number(
          refOriginSeq.XOffsetInSlideCoordinateSystem || 0,
        )
        const refOriginY = Number(
          refOriginSeq.YOffsetInSlideCoordinateSystem || 0,
        )
        const segOriginX = Number(
          segOriginSeq.XOffsetInSlideCoordinateSystem || 0,
        )
        const segOriginY = Number(
          segOriginSeq.YOffsetInSlideCoordinateSystem || 0,
        )

        /**
         * Calculate the physical offset between origins.
         * Then convert to base image pixel coordinates.
         */
        const physicalOffsetX = segOriginX - refOriginX
        const physicalOffsetY = segOriginY - refOriginY

        /**
         * Convert physical offset to base image pixels.
         * Need to account for ImageOrientationSlide.
         */
        const orientation = refBaseLevel.ImageOrientationSlide
        if (orientation) {
          const rowCosines = orientation.slice(0, 3)
          const colCosines = orientation.slice(3, 6)

          /**
           * For standard orientations, the offset in pixels is:
           * pixelCol = physicalX / (colCosines[0] * spacing[1]) approximately
           * But this is complex - for now, use simpler approximation
           */
          offsetX = physicalOffsetX / refBasePixelSpacing[1]
          offsetY = physicalOffsetY / refBasePixelSpacing[0]

          /**
           * Adjust for orientation - common case is [0,-1,0,-1,0,0]
           * which means col direction is -X and row direction is -Y
           */
          if (Math.abs(colCosines[0]) > 0.5) {
            offsetX = physicalOffsetX / (colCosines[0] * refBasePixelSpacing[1])
          }
          if (Math.abs(rowCosines[1]) > 0.5) {
            offsetY = physicalOffsetY / (rowCosines[1] * refBasePixelSpacing[0])
          }
        }
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

      if (perframeFuncGroups && perframeFuncGroups.length > 0) {
        /** Check all frames to see if they have consistent sub-tile offsets */
        const subTileOffsets = []

        for (
          let frameIdx = 0;
          frameIdx < Math.min(perframeFuncGroups.length, 10);
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
              const subTileRowOffset = rowPosition - tileBoundaryRow
              const subTileColOffset = colPosition - tileBoundaryCol

              subTileOffsets.push({
                frameIdx,
                rowPosition,
                colPosition,
                subTileRowOffset,
                subTileColOffset,
              })
            }
          }
        }

        /** Use the first frame's offset to calculate the adjustment */
        if (subTileOffsets.length > 0) {
          const firstOffset = subTileOffsets[0]
          const baseRowOffset = firstOffset.subTileRowOffset * resolution
          const baseColOffset = firstOffset.subTileColOffset * resolution

          /**
           * The tile grid origin needs to be adjusted so that when OpenLayers
           * places a tile at grid position (row, col), the content aligns
           * with the actual frame position.
           *
           * For OpenLayers with Y-down coordinate system:
           * - Positive x offset shifts tiles to the right
           * - Negative y offset shifts tiles down (more negative Y)
           */
          tileOriginOffset = [baseColOffset, -baseRowOffset]

          /** Check if all frames have consistent offsets */
          const allConsistent = subTileOffsets.every(
            (o) =>
              o.subTileRowOffset === firstOffset.subTileRowOffset &&
              o.subTileColOffset === firstOffset.subTileColOffset,
          )
          if (!allConsistent) {
            console.warn(
              '[SPARSE] WARNING: Not all frames have the same sub-tile offset! Single origin adjustment may not work for all frames.',
            )
          }
        }
      }

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
      fittedPyramid.resolutions.push(finalResolution)
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

  let minZoom = 0
  for (let i = 0; i < refPyramid.resolutions.length; i++) {
    for (let j = 0; j < fittedPyramid.resolutions.length; j++) {
      if (refPyramid.resolutions[i] === fittedPyramid.resolutions[j]) {
        minZoom = i
        break
      }
    }
  }
  let maxZoom = refPyramid.resolutions.length - 1
  for (let i = refPyramid.resolutions.length - 1; i >= minZoom; i--) {
    for (let j = fittedPyramid.resolutions.length - 1; j >= 0; j--) {
      if (refPyramid.resolutions[i] === fittedPyramid.resolutions[j]) {
        maxZoom = i
        break
      }
    }
  }

  const hasMatchingLevels = matchingLevelIndices.length > 0

  return [fittedPyramid, minZoom, maxZoom, hasMatchingLevels]
}

export {
  _areImagePyramidsEqual,
  _computeImagePyramid,
  _createTileLoadFunction,
  _fitImagePyramid,
  _getIccProfiles,
}
