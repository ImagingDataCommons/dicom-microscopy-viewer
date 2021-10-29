import * as dwc from 'dicomweb-client'

import { SOPClassUIDs } from './enums'
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
 * Create custom tile URL function to retrive frames via DICOMweb WADO-RS.
 */
function _createTileUrlFunction ({
  pyramid,
  client,
  retrieveRendered,
  channel
}) {
  const tileUrlFunction = (tileCoord, pixelRatio, projection) => {
    /*
     * Variables x and y correspond to the X and Y axes of the slide
     * coordinate system. Since we want to view the slide horizontally
     * with the label on the right side, the x axis of the slide
     * coordinate system is the vertical axis of the viewport and the
     * y axis of the slide coordinate system the horizontal axis of the
     * viewport. Note that this is in contrast to the nomenclature used
     * by Openlayers.
     */
    const z = tileCoord[0]
    const y = tileCoord[1] + 1
    const x = tileCoord[2] + 1

    let index = x + '-' + y
    if (channel === undefined) {
      index += '-1'
    }

    if (pyramid.metadata[z] === undefined) {
      return (null)
    }

    if (pyramid.frameMappings[z] === undefined) {
      return (null)
    }

    const path = pyramid.frameMappings[z][index]
    if (path === undefined || path === null) {
      return (null)
    }
    let url = ''
    if (client.wadoURL !== undefined) {
      url += client.wadoURL
    }
    url += (
      '/studies/' + pyramid.metadata[z].StudyInstanceUID +
      '/series/' + pyramid.metadata[z].SeriesInstanceUID +
      '/instances/' + path
    )
    if (retrieveRendered) {
      url += '/rendered'
    }
    return (url)
  }

  return tileUrlFunction
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
  blendingInformation
}) {
  const tileLoadFunction = async (tile, src) => {
    const img = tile.getImage()
    const z = tile.tileCoord[0]
    const y = tile.tileCoord[1] + 1
    const x = tile.tileCoord[2] + 1
    const index = x + '-' + y

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

    if (samplesPerPixel === 1 && blendingInformation === undefined) {
      throw new Error(
        'Blending information is required for loading monochrome image tiles.'
      )
    }

    if (src !== null) {
      const studyInstanceUID = dwc.utils.getStudyInstanceUIDFromUri(src)
      const seriesInstanceUID = dwc.utils.getSeriesInstanceUIDFromUri(src)
      const sopInstanceUID = dwc.utils.getSOPInstanceUIDFromUri(src)
      const frameNumbers = dwc.utils.getFrameNumbersFromUri(src)

      if (samplesPerPixel === 1) {
        console.info(`retrieve frame ${frameNumbers} of monochrome image`)
      } else {
        console.info(`retrieve frame ${frameNumbers} of color image`)
      }

      tile.needToRerender = false
      tile.isLoading = true

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

        client.retrieveInstanceFramesRendered(retrieveOptions).then(
          (renderedFrame) => {
            if (samplesPerPixel === 1) {
              const {
                thresholdValues,
                limitValues,
                color
              } = blendingInformation
              const isRendered = renderingEngine.colorMonochromeImageFrame({
                img,
                frames: renderedFrame,
                bitsAllocated,
                pixelRepresentation,
                thresholdValues,
                limitValues,
                color,
                opacity: 1, // handled by OpenLayers
                columns,
                rows
              })
              tile.needToRerender = !isRendered
              tile.isLoading = false
            } else {
              img.src = renderingEngine.createURLFromRGBImage({
                frames: renderedFrame
              })
              tile.needToRerender = false
              tile.isLoading = false
            }
          }
        )
      } else {
        // Compressed Bulkdata Media Types
        const jlsMediaType = 'image/jls' // decoded with CharLS
        const jlsTransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.80'
        const jlsTransferSyntaxUID = '1.2.840.10008.1.2.4.81'
        const jp2MediaType = 'image/jp2' // decoded with OpenJPEG
        const jp2TransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.90'
        const jp2TransferSyntaxUID = '1.2.840.10008.1.2.4.91'
        const jpxMediaType = 'image/jpx' // decoded with OpenJPEG
        const jpxTransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.92'
        const jpxTransferSyntaxUID = '1.2.840.10008.1.2.4.93'
        const jpegMediaType = 'image/jpeg' // decoded with libjpeg-turbo
        const jpegTransferSyntaxUID = '1.2.840.10008.1.2.4.50'

        // Uncompressed Bulkdata Media Types
        const octetStreamMediaType = 'application/octet-stream'
        const octetStreamTransferSyntaxUID = '1.2.840.10008.1.2.1'

        let useImageMediaType = false
        if (refImage.SOPClassUID === SOPClassUIDs.PARAMETRIC_MAP) {
          // float or double float pixel data
          useImageMediaType = false
        } else if (refImage.SOPClassUID === SOPClassUIDs.SEGMENTATION) {
          if (refImage.SegmentationType === 'BINARY') {
            // 1-bit pixel data
            useImageMediaType = false
          }
        }

        const retrieveOptions = {
          studyInstanceUID,
          seriesInstanceUID,
          sopInstanceUID,
          frameNumbers,
          mediaTypes: []
        }
        if (useImageMediaType) {
          retrieveOptions.mediaTypes = [
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
              mediaType: jpegMediaType,
              transferSyntaxUID: jpegTransferSyntaxUID
            }
          ]
        } else {
          retrieveOptions.mediaTypes = [
            {
              mediaType: octetStreamMediaType,
              transferSyntaxUID: octetStreamTransferSyntaxUID
            }
          ]
        }

        client.retrieveInstanceFrames(retrieveOptions).then(
          (rawFrames) => {
            if (samplesPerPixel === 1) {
              // coloring image
              const {
                thresholdValues,
                limitValues,
                color
              } = blendingInformation
              const isRendered = renderingEngine.colorMonochromeImageFrame({
                img,
                frames: rawFrames[0],
                bitsAllocated,
                pixelRepresentation,
                thresholdValues,
                limitValues,
                color,
                opacity: 1, // handled by OpenLayers
                columns,
                rows
              })
              tile.needToRerender = !isRendered
              tile.isLoading = false
            } else {
              img.src = renderingEngine.createURLFromRGBImage({
                frames: rawFrames[0],
                bitsAllocated,
                pixelRepresentation,
                columns,
                rows
              })
              tile.needToRerender = false
              tile.isLoading = false
            }
          }
        ).catch(
          () => {}
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
  _createTileLoadFunction,
  _createTileUrlFunction
}
