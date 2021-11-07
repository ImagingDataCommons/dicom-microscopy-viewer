import * as dwc from 'dicomweb-client'

import { getFrameMapping } from './metadata.js'
import { getPixelSpacing } from './scoord3dUtils'

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
  const frameMappings = metadata.map(m => getFrameMapping(m))
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
      throw new Error(
        'Images of pyramid must all have attributes ' +
        '"Total Pixel Matrix Rows" and "Total Pixel Matrix Columns".'
      )
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
      // Update with information obtained from current concatentation part.
      Object.assign(pyramidFrameMappings[index], frameMappings[i])
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
      pyramidFrameMappings.push(frameMappings[i])
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
  const physicalSizes = []
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

    physicalSizes.push([
      (totalPixelMatrixColumns * pixelSpacing[1]).toFixed(4),
      (totalPixelMatrixRows * pixelSpacing[0]).toFixed(4)
    ])
    /*
    * Compute the resolution at each pyramid level, since the zoom
    * factor may not be the same between adjacent pyramid levels.
    */
    const zoomFactor = baseTotalPixelMatrixColumns / totalPixelMatrixColumns
    pyramidResolutions.push(zoomFactor)

    /*
    * TODO: One may has to adjust the offset slightly due to the
    * difference between extent of the image at a given resolution level
    * and the actual number of tiles (frames).
    */
    pyramidOrigins.push(offset)
  }
  pyramidResolutions.reverse()
  pyramidTileSizes.reverse()
  pyramidGridSizes.reverse()
  pyramidOrigins.reverse()
  pyramidPixelSpacings.reverse()

  const uniquePhysicalSizes = [
    ...new Set(physicalSizes.map(v => v.toString()))
  ].map(v => v.split(','))
  if (uniquePhysicalSizes.length > 1) {
    console.warn(
      'images of the image pyramid have different sizes (in millimeter): ',
      physicalSizes
    )
  }

  /**
   * Frames may extend beyond the size of the total pixel matrix.
   * The excess pixels are empty, i.e. have only a padding value.
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
    frameMappings: pyramidFrameMappings
  }
}

/*
 * Create custom tile loader function to retrieve frames via WADO-RS.
*/
function _createTileLoadFunction ({
  pyramid,
  client,
  retrieveRendered,
  includeIccProfile,
  renderingEngine,
  channel
}) {
  const tileLoadFunction = async (z, y, x) => {
    let index = (x + 1) + '-' + (y + 1)
    if (channel === undefined) {
      index += '-1'
    } else {
      index += `-${channel}`
    }

    // TODO: refactor frameMappings
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

    if (pyramid.metadata[z] === undefined) {
      console.warn(
        'could not load tile ' + index +
        ' because level ' + z + ' does not exist'
      )
      return
    }
    const refImage = pyramid.metadata[z]
    const columns = refImage.Columns
    const rows = refImage.Rows
    const bitsAllocated = refImage.BitsAllocated
    const pixelRepresentation = refImage.PixelRepresentation
    const samplesPerPixel = refImage.SamplesPerPixel

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

      if (retrieveRendered) {
        /*
         * We could use PNG, but at the moment we don't have a PNG decoder
         * library and thus would have to draw to a canvas, retrieve the
         * image data and then recompat the array from a RGBA to a 1 component
         * array for the offscreen rendering engine, which would result in
         * poor perfomance.
         */
        const jp2MediaType = 'image/jp2' // decoded with OpenJPEG
        const jpegMediaType = 'image/jpeg' // decoded with libjpeg-turbo
        const transferSyntaxUID = ''
        const retrieveOptions = {
          studyInstanceUID,
          seriesInstanceUID,
          sopInstanceUID,
          frameNumbers,
          mediaTypes: [
            { mediaType: jp2MediaType, transferSyntaxUID },
            { mediaType: jpegMediaType, transferSyntaxUID }
          ]
        }
        if (includeIccProfile) {
          /* Unclear whether the included ICC profile will be correclty
           * rendered by the browser.
           */
          retrieveOptions.queryParams = {
            iccprofile: 'yes'
          }
        }

        return client.retrieveInstanceFramesRendered(retrieveOptions).then(
          (renderedFrame) => {
            const { pixelArray } = renderingEngine.decodeFrame({
              frame: renderedFrame,
              bitsAllocated,
              pixelRepresentation,
              columns,
              rows
            })
            return pixelArray
          }
        ).catch(
          () => {
            return Promise.reject(
              new Error(`Failed to load tile "${index}" at level ${z}.`)
            )
          }
        )
      } else {
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
        const octetStreamTransferSyntaxUID = '1.2.840.10008.1.2.1'

        const retrieveOptions = {
          studyInstanceUID,
          seriesInstanceUID,
          sopInstanceUID,
          frameNumbers,
          mediaTypes: [
            {
              mediaType: jpegMediaType,
              transferSyntaxUID: jpegTransferSyntaxUID
            },
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
          ]
        }
        return client.retrieveInstanceFrames(retrieveOptions).then(
          (rawFrames) => {
            const { pixelArray } = renderingEngine.decodeFrame({
              frame: rawFrames[0],
              bitsAllocated,
              pixelRepresentation,
              columns,
              rows
            })
            return pixelArray
          }
        ).catch(
          () => {
            return Promise.reject(
              new Error(`Failed to load tile "${index}" at level ${z}.`)
            )
          }
        )
      }
    } else {
      console.warn(
        `could not load tile "${index}" at level ${z}, ` +
        'this tile does not exist'
      )
    }
  }
  return tileLoadFunction
}

export {
  _computeImagePyramid,
  _createTileLoadFunction
}
