import * as dwc from 'dicomweb-client'

import { decodeFrame } from './decode.js'
import { getFrameMapping } from './metadata.js'
import { getPixelSpacing } from './scoord3dUtils'
import { are1DArraysAlmostEqual, are2DArraysAlmostEqual } from './utils.js'

/** Compute image pyramid.
 *
 * @param {object[]} metadata - Metadata of VL Whole Slide Microscopy Image instances
 * @returns {object} Information about the image pyramid
 * @static
 */
function _computeImagePyramid ({ metadata }) {
  if (metadata.length === 0) {
    throw new Error(
      'No image metadata was provided to computate image pyramid structure.'
    )
  }

  // Sort instances and optionally concatenation parts if present.
  metadata.sort((a, b) => {
    const sizeDiff = a.TotalPixelMatrixColumns - b.TotalPixelMatrixColumns
    if (sizeDiff === 0) {
      if (a.ConcatenationFrameOffsetNumber !== undefined) {
        return a.ConcatenationFrameOffsetNumber - b.ConcatenationFrameOffsetNumber
      }
      return sizeDiff
    }
    return sizeDiff
  })

  const pyramidMetadata = []
  const pyramidFrameMappings = []
  let pyramidNumberOfChannels
  for (let i = 0; i < metadata.length; i++) {
    if (metadata[0].FrameOfReferenceUID !== metadata[i].FrameOfReferenceUID) {
      throw new Error(
        'Images of pyramid must all have the same Frame of Reference UID.'
      )
    }
    if (metadata[0].ContainerIdentifier !== metadata[i].ContainerIdentifier) {
      throw new Error(
        'Images of pyramid must all have the same Container Identifier.'
      )
    }
    if (
      metadata[i].TotalPixelMatrixRows === undefined ||
      metadata[i].TotalPixelMatrixColumns === undefined
    ) {
      const numberOfFrames = Number(metadata[i].NumberOfFrames)
      if (numberOfFrames === 1) {
        /*
         * If the image contains only one frame it is not tiled, and therefore
         * the size of the total pixel matrix equals the size of the frame.
         */
        metadata[i].TotalPixelMatrixRows = metadata[i].Rows
        metadata[i].TotalPixelMatrixColumns = metadata[i].Columns
      } else {
        throw new Error(
          'Images of pyramid must all have attributes ' +
          '"Total Pixel Matrix Rows" and "Total Pixel Matrix Columns".'
        )
      }
    }

    const { frameMapping, numberOfChannels } = getFrameMapping(metadata[i])
    if (i > 0) {
      if (pyramidNumberOfChannels !== numberOfChannels) {
        throw new Error(
          'Images of pyramid must all have the same number of channels ' +
          '(optical paths, segments, mappings, etc.)'
        )
      }
    } else {
      pyramidNumberOfChannels = numberOfChannels
    }

    const cols = metadata[i].TotalPixelMatrixColumns
    const rows = metadata[i].TotalPixelMatrixRows
    let numberOfFrames = metadata[i].NumberOfFrames
    if (numberOfFrames === undefined) {
      numberOfFrames = 1
    }

    /*
     * Instances may be broken down into multiple concatentation parts.
     * Therefore, we have to re-assemble instance metadata.
    */
    let alreadyExists = false
    let index = null
    for (let j = 0; j < pyramidMetadata.length; j++) {
      if (
        (pyramidMetadata[j].TotalPixelMatrixColumns === cols) &&
        (pyramidMetadata[j].TotalPixelMatrixRows === rows)
      ) {
        alreadyExists = true
        index = j
      }
    }
    if (alreadyExists) {
      Object.assign(pyramidFrameMappings[index], frameMapping)
      // Update with information obtained from current concatentation part.
      pyramidMetadata[index].NumberOfFrames += numberOfFrames
      if ('PerFrameFunctionalGroupsSequence' in metadata[index]) {
        pyramidMetadata[index].PerFrameFunctionalGroupsSequence.push(
          ...metadata[i].PerFrameFunctionalGroupsSequence
        )
      }
      if (!('SOPInstanceUIDOfConcatenationSource' in metadata[i])) {
        throw new Error(
          'Attribute "SOPInstanceUIDOfConcatenationSource" is required ' +
          'for concatenation parts.'
        )
      }
      const sopInstanceUID = metadata[i].SOPInstanceUIDOfConcatenationSource
      pyramidMetadata[index].SOPInstanceUID = sopInstanceUID
      delete pyramidMetadata[index].SOPInstanceUIDOfConcatenationSource
      delete pyramidMetadata[index].ConcatenationUID
      delete pyramidMetadata[index].InConcatenationNumber
      delete pyramidMetadata[index].ConcatenationFrameOffsetNumber
    } else {
      pyramidMetadata.push(metadata[i])
      pyramidFrameMappings.push(frameMapping)
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
  const pyramidImageSizes = []
  const pyramidPhysicalSizes = []
  const offset = [0, -1]
  const baseTotalPixelMatrixColumns = pyramidBaseMetadata.TotalPixelMatrixColumns
  const baseTotalPixelMatrixRows = pyramidBaseMetadata.TotalPixelMatrixRows
  for (let j = (nLevels - 1); j >= 0; j--) {
    const columns = pyramidMetadata[j].Columns
    const rows = pyramidMetadata[j].Rows
    const totalPixelMatrixColumns = pyramidMetadata[j].TotalPixelMatrixColumns
    const totalPixelMatrixRows = pyramidMetadata[j].TotalPixelMatrixRows
    const pixelSpacing = getPixelSpacing(pyramidMetadata[j])
    const nColumns = Math.ceil(totalPixelMatrixColumns / columns)
    const nRows = Math.ceil(totalPixelMatrixRows / rows)
    pyramidTileSizes.push([
      columns,
      rows
    ])
    pyramidGridSizes.push([
      nColumns,
      nRows
    ])
    pyramidPixelSpacings.push(pixelSpacing)

    pyramidImageSizes.push([
      totalPixelMatrixColumns,
      totalPixelMatrixRows
    ])
    pyramidPhysicalSizes.push([
      (totalPixelMatrixColumns * pixelSpacing[1]).toFixed(4),
      (totalPixelMatrixRows * pixelSpacing[0]).toFixed(4)
    ])
    /*
    * Compute the resolution at each pyramid level, since the zoom
    * factor may not be the same between adjacent pyramid levels.
    */
    const zoomFactor = Math.round(
      baseTotalPixelMatrixColumns / totalPixelMatrixColumns
    )
    pyramidResolutions.push(zoomFactor)

    pyramidOrigins.push(offset)
  }
  pyramidResolutions.reverse()
  pyramidTileSizes.reverse()
  pyramidGridSizes.reverse()
  pyramidOrigins.reverse()
  pyramidPixelSpacings.reverse()
  pyramidImageSizes.reverse()
  pyramidPhysicalSizes.reverse()

  const uniquePhysicalSizes = [
    ...new Set(pyramidPhysicalSizes.map(v => v.toString()))
  ].map(v => v.split(','))
  if (uniquePhysicalSizes.length > 1) {
    console.warn(
      'images of the image pyramid have different sizes: ',
      '\nsize [mm]: ', pyramidPhysicalSizes,
      '\npixel spacing [mm]: ', pyramidPixelSpacings,
      '\nsize [pixels]: ', pyramidImageSizes,
      '\ntile size [pixels]: ', pyramidTileSizes,
      '\ntile grid size [tiles]: ', pyramidGridSizes,
      '\nresolution [factors]: ', pyramidResolutions
    )
  }

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
    -1 // max Y
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
    numberOfChannels: pyramidNumberOfChannels
  }
}

function _areImagePyramidsEqual (pyramid, refPyramid) {
  // Check that all the channels have the same pyramid parameters
  if (!are2DArraysAlmostEqual(pyramid.extent, refPyramid.extent)) {
    console.warn('Pyramid has different extent as reference pyramid.')
    return false
  }
  if (!are2DArraysAlmostEqual(pyramid.origins, refPyramid.origins)) {
    console.warn('Pyramid has different origins as reference pyramid.')
    return false
  }
  if (!are2DArraysAlmostEqual(pyramid.resolutions, refPyramid.resolutions)) {
    console.warn('Pyramid has different resolutions as reference pyramid.')
    return false
  }
  if (!are2DArraysAlmostEqual(pyramid.gridSizes, refPyramid.gridSizes)) {
    console.warn('Pyramid has different grid sizes as reference pyramid.')
    return false
  }
  if (!are2DArraysAlmostEqual(pyramid.tileSizes, refPyramid.tileSizes)) {
    console.warn('Pyramid has different tile sizes as reference pyramid.')
    return false
  }
  if (!are2DArraysAlmostEqual(pyramid.pixelSpacings, refPyramid.pixelSpacings)) {
    console.warn('Pyramid has different pixel spacings as reference pyramid.')
    return false
  }
  return true
}

function _createEmptyTile ({
  columns,
  rows,
  samplesPerPixel,
  bitsAllocated,
  photometricInterpretation
}) {
  let pixelArray
  if (bitsAllocated <= 8) {
    pixelArray = new Uint8Array(columns * rows * samplesPerPixel)
  } else {
    pixelArray = new Float32Array(columns * rows * samplesPerPixel)
  }
  // Fill white in case of color and black in case of monochrome.
  let fillValue = Math.pow(2, bitsAllocated) - 1
  if (photometricInterpretation === 'MONOCHROME2') {
    fillValue = 0
  }
  for (let i = 0; i < pixelArray.length; i++) {
    pixelArray[i] = fillValue
  }
  return pixelArray
}

function _createTileLoadFunction ({ pyramid, client, channel }) {
  return async (z, y, x) => {
    let index = (x + 1) + '-' + (y + 1)
    index += `-${channel}`

    if (pyramid.metadata[z] === undefined) {
      throw new Error(
        'Could not load tile ' + index +
        ' because level ' + z + ' does not exist.'
      )
    }

    const path = pyramid.frameMappings[z][index]
    let src
    if (path != null) {
      src = ''
      if (client.wadoURL !== undefined) {
        src += client.wadoURL
      }
      src += (
        '/studies/' + pyramid.metadata[z].StudyInstanceUID +
        '/series/' + pyramid.metadata[z].SeriesInstanceUID +
        '/instances/' + path
      )
    }

    const refImage = pyramid.metadata[z]
    const columns = refImage.Columns
    const rows = refImage.Rows
    const bitsAllocated = refImage.BitsAllocated
    const pixelRepresentation = refImage.PixelRepresentation
    const samplesPerPixel = refImage.SamplesPerPixel
    const photometricInterpretation = refImage.PhotometricInterpretation

    if (src != null) {
      const studyInstanceUID = dwc.utils.getStudyInstanceUIDFromUri(src)
      const seriesInstanceUID = dwc.utils.getSeriesInstanceUIDFromUri(src)
      const sopInstanceUID = dwc.utils.getSOPInstanceUIDFromUri(src)
      const frameNumbers = dwc.utils.getFrameNumbersFromUri(src)

      if (samplesPerPixel === 1) {
        console.info(`retrieve frame ${frameNumbers} of monochrome image`)
      } else {
        console.info(`retrieve frame ${frameNumbers} of color image`)
      }

      const jpegMediaType = 'image/jpeg'
      const jpegTransferSyntaxUID = '1.2.840.10008.1.2.4.50'
      const jlsMediaType = 'image/jls'
      const jlsTransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.80'
      const jlsTransferSyntaxUID = '1.2.840.10008.1.2.4.81'
      const jp2MediaType = 'image/jp2'
      const jp2TransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.90'
      const jp2TransferSyntaxUID = '1.2.840.10008.1.2.4.91'
      const jpxMediaType = 'image/jpx'
      const jpxTransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.92'
      const jpxTransferSyntaxUID = '1.2.840.10008.1.2.4.93'
      const octetStreamMediaType = 'application/octet-stream'
      /*
       * Use of the "*" transfer syntax is a hack to work around standard
       * compliance issues of the Google Cloud Healthcare API.
       * It will return bulkdata encoded with the transfer syntax of the
       * stored data set (uncompressed or compressed). The decoder can then not
       * rely on the media type specified by the "Content-Type" header in the
       * response message, but will need to determine it from the payload.
       */
      const octetStreamTransferSyntaxUID = '*'

      const mediaTypes = []
      if (bitsAllocated <= 8) {
        mediaTypes.push({
          mediaType: jpegMediaType,
          transferSyntaxUID: jpegTransferSyntaxUID
        })
      }
      mediaTypes.push(...[
        {
          mediaType: jlsMediaType,
          transferSyntaxUID: jlsTransferSyntaxUIDlossless
        },
        {
          mediaType: jlsMediaType,
          transferSyntaxUID: jlsTransferSyntaxUID
        },
        {
          mediaType: jp2MediaType,
          transferSyntaxUID: jp2TransferSyntaxUIDlossless
        },
        {
          mediaType: jp2MediaType,
          transferSyntaxUID: jp2TransferSyntaxUID
        },
        {
          mediaType: jpxMediaType,
          transferSyntaxUID: jpxTransferSyntaxUIDlossless
        },
        {
          mediaType: jpxMediaType,
          transferSyntaxUID: jpxTransferSyntaxUID
        },
        {
          mediaType: octetStreamMediaType,
          transferSyntaxUID: octetStreamTransferSyntaxUID
        }
      ])

      const retrieveOptions = {
        studyInstanceUID,
        seriesInstanceUID,
        sopInstanceUID,
        frameNumbers,
        mediaTypes
      }
      return client.retrieveInstanceFrames(retrieveOptions).then(
        (rawFrames) => {
          try {
            const { pixelArray } = decodeFrame({
              frame: rawFrames[0],
              bitsAllocated,
              pixelRepresentation,
              columns,
              rows,
              samplesPerPixel
            })
            if (pixelArray.constructor === Float64Array) {
              // TODO: handle Float64Array using LUT
              throw new Error('Double Float Pixel Data is not (yet) supported.')
            }
            if (samplesPerPixel === 3 && bitsAllocated === 8) {
              // Rendering of color images requires unsigned 8-bit integers
              return pixelArray
            }
            // Rendering of grayscale images requires floating point values
            return new Float32Array(
              pixelArray,
              pixelArray.byteOffset,
              pixelArray.byteLength / pixelArray.BYTES_PER_ELEMENT
            )
          } catch (error) {
            console.error('failed to decode frame: ', error)
          }
        }
      ).catch(
        (error) => {
          return Promise.reject(
            new Error(`Failed to load tile "${index}" at level ${z}: ${error}`)
          )
        }
      )
    } else {
      console.warn(
        `could not load tile "${index}" at level ${z}, ` +
        'this tile does not exist'
      )
      return _createEmptyTile({
        columns,
        rows,
        samplesPerPixel,
        bitsAllocated,
        photometricInterpretation
      })
    }
  }
}

function _fitImagePyramid (pyramid, refPyramid) {
  const matchingLevelIndices = []
  for (let i = 0; i < refPyramid.metadata.length; i++) {
    for (let j = 0; j < pyramid.metadata.length; j++) {
      const doOriginsMatch = are1DArraysAlmostEqual(
        refPyramid.origins[i],
        pyramid.origins[j]
      )
      const doPixelSpacingsMatch = are1DArraysAlmostEqual(
        refPyramid.pixelSpacings[i],
        pyramid.pixelSpacings[j]
      )
      if (doOriginsMatch && doPixelSpacingsMatch) {
        matchingLevelIndices.push([i, j])
      }
    }
  }

  if (matchingLevelIndices.length === 0) {
    console.error(pyramid, refPyramid)
    throw new Error(
      'Image pyramid cannot be fit to reference image pyramid.'
    )
  }

  // Fit the pyramid levels to the reference image pyramid
  const fittedPyramid = {
    extent: refPyramid.extent,
    origins: refPyramid.origins,
    resolutions: refPyramid.resolutions,
    gridSizes: refPyramid.gridSizes,
    tileSizes: refPyramid.tileSizes,
    pixelSpacings: [],
    metadata: [],
    frameMappings: []
  }
  for (let i = 0; i < refPyramid.metadata.length; i++) {
    const index = matchingLevelIndices.find(element => element[0] === i)
    if (index) {
      const j = index[1]
      fittedPyramid.gridSizes[i] = pyramid.gridSizes[j]
      fittedPyramid.tileSizes[i] = pyramid.tileSizes[j]
      fittedPyramid.pixelSpacings.push(pyramid.pixelSpacings[j])
      fittedPyramid.metadata.push(pyramid.metadata[j])
      fittedPyramid.frameMappings.push(pyramid.frameMappings[j])
    } else {
      fittedPyramid.pixelSpacings.push(undefined)
      fittedPyramid.metadata.push(undefined)
      fittedPyramid.frameMappings.push(undefined)
    }
  }

  return fittedPyramid
}

export {
  _areImagePyramidsEqual,
  _computeImagePyramid,
  _createTileLoadFunction,
  _fitImagePyramid
}
