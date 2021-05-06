import { VLWholeSlideMicroscopyImage, getFrameMapping } from './metadata.js'
import * as DICOMwebClient from 'dicomweb-client'
import {
  arraysEqual
} from './utils.js'
import {
  getPixelSpacing
} from './scoord3dUtils'
import TileImage from 'ol/source/TileImage'
import TileLayer from 'ol/layer/Tile'

/** BlendingInformation for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type VOLUME.
 *
 * @class
 * @memberof channel
 */

class BlendingInformation {
  /*
  * An interface class to set/get the visualization/presentation
  * parameters from a channel object
  *
  * @param {string} opticalPathIdentifier
  * @param {number[]} color
  * @param {number} opacity
  * @param {number[]} thresholdValues
  * @param {boolean} visible
  */
  constructor (
    opticalPathIdentifier,
    color,
    opacity,
    thresholdValues,
    visible) {
    this.opticalPathIdentifier = opticalPathIdentifier
    this.color = [...color]
    this.opacity = opacity
    this.thresholdValues = [...thresholdValues]
    this.visible = visible
  }
}

/** Channel for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type VOLUME.
 *
 * @class
 * @memberof channel
 */

class _Channel {
/**
 * Create a channel instances which contains all the visualization/presentation
 * parameters and OpenLayer objects for a Whole Slide Microscopy Image.
 * Channel coloring is allowed only for monochorme channels (i.e SamplesPerPixel === 1).
 *
 * @param {object} BlendingInformation
 * @param {string} BlendingInformation.opticalPathIdentifier - channel ID
 * @param {number[]} BlendingInformation.color - channel rgb color
 * @param {number} BlendingInformation.opacity - channel opacity
 * @param {number[]} BlendingInformation.thresholdValues - channel clipping values
 * @param {boolean} BlendingInformation.visible - channel visibility
 */
  constructor (blendingInformation) {
    this.blendingInformation = blendingInformation
    this.metadata = []
    this.rasterSource = null
    this.tileLayer = null
  }

  /** Initializes the channel building the OpenLayer objects.
   * All the channel have to share the same geometry properties.
   *
   * In this method we set observations to the OpenLayer events 'prerender' and 'postrender',
   * for setting the globalCompositeOperation value to 'lighter' during the tiles blending.
   *
   * @param {string} referenceOpticalPathIdentifier - reference optical path identifier
   * @param {number[]} referenceExtent - reference extent array
   * @param {number[]} referenceOrigins - reference origins array
   * @param {number[]} referenceResolutions - reference resolutions array
   * @param {number[]} referenceGridSizes - reference grid sizes array
   * @param {number[]} referenceTileSizes - reference tile sizes array
   * @param {number[]} referencePixelSpacings - reference pixel spacings array
   * @param {object} projection - OpenLayer projection
   * @param {object} tileGrid - OpenLayer tileGrid
   * @param {object} options - VolumeImageViewer options
   * @param {object} renderingEngine - VolumeImageViewer offscreen rendering engine
   *
   */
  initChannel (referenceOpticalPathIdentifier,
    referenceExtent,
    referenceOrigins,
    referenceResolutions,
    referenceGridSizes,
    referenceTileSizes,
    referencePixelSpacings,
    projection,
    tileGrid,
    options,
    renderingEngine) {
    // cache viewer object and info in channel
    this.renderingEngine = renderingEngine

    /*
    * To visualize images accross multiple scales, we first need to
    * determine the image pyramid structure, i.e. the size and resolution
    * images at the different pyramid levels.
    */

    const geometryArrays = _Channel.deriveImageGeometry(this)

    // Check that all the channels have the same pyramid parameters
    if (arraysEqual(geometryArrays[0], referenceExtent) === false) {
      throw new Error(
        'Optical path ' + this.blendingInformation.opticalPathIdentifier +
        ' image has incompatible extent respect to the reference optical path ' +
        referenceOpticalPathIdentifier
      )
    }
    if (arraysEqual(geometryArrays[1], referenceOrigins) === false) {
      throw new Error(
        'Optical path ' + this.blendingInformation.opticalPathIdentifier +
        ' image has incompatible origins respect to the reference optical path ' +
        referenceOpticalPathIdentifier
      )
    }
    if (arraysEqual(geometryArrays[2], referenceResolutions) === false) {
      throw new Error(
        'Optical path ' + this.blendingInformation.opticalPathIdentifier +
        ' image has incompatible resolutions respect to the reference optical path ' +
        referenceOpticalPathIdentifier
      )
    }
    if (arraysEqual(geometryArrays[3], referenceGridSizes) === false) {
      throw new Error(
        'Optical path ' + this.blendingInformation.opticalPathIdentifier +
        ' image has incompatible grid sizes respect to the reference optical path ' +
        referenceOpticalPathIdentifier
      )
    }
    if (arraysEqual(geometryArrays[4], referenceTileSizes) === false) {
      throw new Error(
        'Optical path ' + this.blendingInformation.opticalPathIdentifier +
        ' image has incompatible tile sizes respect to the reference optical path ' +
        referenceOpticalPathIdentifier
      )
    }
    if (arraysEqual(geometryArrays[5], referencePixelSpacings) === false) {
      throw new Error(
        'Optical path ' + this.blendingInformation.opticalPathIdentifier +
        ' image has incompatible pixel spacings respect to the reference optical path ' +
        referenceOpticalPathIdentifier
      )
    }

    /*
     * Define custom tile URL function to retrive frames via DICOMweb WADO-RS.
     */
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
      const index = x + '-' + y

      const path = this.pyramidFrameMappings[z][index]
      if (path === undefined) {
        console.warn('tile ' + index + ' not found at level ' + z)
        return (null)
      }
      let url = options.client.wadoURL +
        '/studies/' + this.pyramidMetadata[z].StudyInstanceUID +
        '/series/' + this.pyramidMetadata[z].SeriesInstanceUID +
        '/instances/' + path
      if (options.retrieveRendered) {
        url = url + '/rendered'
      }
      return (url)
    }
    /*
     * Define custom tile loader function, which is required because the
     * WADO-RS response message has content type "multipart/related".
    */
    const tileLoadFunction = async (tile, src) => {
      const img = tile.getImage()
      tile.needToRerender = true
      const z = tile.tileCoord[0]
      const columns = this.pyramidMetadata[z].Columns
      const rows = this.pyramidMetadata[z].Rows
      const samplesPerPixel = this.pyramidMetadata[z].SamplesPerPixel // number of colors for pixel
      const bitsAllocated = this.pyramidMetadata[z].BitsAllocated // memory for pixel
      const pixelRepresentation = this.pyramidMetadata[z].PixelRepresentation // 0 unsigned, 1 signed

      if (src !== null && samplesPerPixel === 1) {
        const studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(src)
        const seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(src)
        const sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(src)
        const frameNumbers = DICOMwebClient.utils.getFrameNumbersFromUri(src)

        if (options.retrieveRendered) {
          // allowed mediaTypes: http://dicom.nema.org/medical/dicom/current/output/chtml/part18/sect_8.7.4.html
          // we use in order: jp2, jpeg.
          // we could add png, but at the moment we don't have a png decoder library and we would have to draw
          // to a canvas, retieve the imageData and then recompat the array from a RGBA to a 1 component array
          // for the offscreen rendering engine, which provides poor perfomances.

          const jp2MediaType = 'image/jp2' // decoded with OpenJPEG
          const jpegMediaType = 'image/jpeg' // decoded with libJPEG-turbo
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
          if (options.includeIccProfile) {
            retrieveOptions.queryParams = {
              iccprofile: 'yes'
            }
          }

          options.client.retrieveInstanceFramesRendered(retrieveOptions).then(
            (renderedFrame) => {
              // coloring image
              const {
                thresholdValues,
                color,
                opacity
              } = this.blendingInformation

              const frameData = {
                img,
                frames: renderedFrame,
                bitsAllocated,
                pixelRepresentation,
                thresholdValues,
                color,
                opacity,
                columns,
                rows
              }

              const rendered = renderingEngine.colorMonochomeImageFrame(frameData)
              tile.needToRerender = !rendered
            }
          )
        } else {
          console.info(`retrieve frames ${frameNumbers}`)
          // allowed mediaTypes: http://dicom.nema.org/medical/dicom/current/output/chtml/part18/sect_8.7.3.3.2.html
          // we use in order: jls, jp2, jpx, jpeg. Finally octet-stream if the first retrieve will fail.

          const jlsMediaType = 'image/jls' // decoded with CharLS
          const jlsTransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.80'
          const jlsTransferSyntaxUID = '1.2.840.10008.1.2.4.81'
          const jp2MediaType = 'image/jp2' // decoded with OpenJPEG
          const jp2TransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.90'
          const jp2TransferSyntaxUID = '1.2.840.10008.1.2.4.91'
          const jpxMediaType = 'image/jpx' // decoded with OpenJPEG
          const jpxTransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.92'
          const jpxTransferSyntaxUID = '1.2.840.10008.1.2.4.93'
          const jpegMediaType = 'image/jpeg' // decoded with libJPEG-turbo
          const jpegTransferSyntaxUID = '1.2.840.10008.1.2.4.50'

          const octetStreamMediaType = 'application/octet-stream'
          const octetStreamTransferSyntaxUID = '1.2.840.10008.1.2.1'

          const retrieveOptions = {
            studyInstanceUID,
            seriesInstanceUID,
            sopInstanceUID,
            frameNumbers,
            mediaTypes: [
              { mediaType: jlsMediaType, transferSyntaxUID: jlsTransferSyntaxUIDlossless },
              { mediaType: jlsMediaType, transferSyntaxUID: jlsTransferSyntaxUID },
              { mediaType: jp2MediaType, transferSyntaxUID: jp2TransferSyntaxUIDlossless },
              { mediaType: jp2MediaType, transferSyntaxUID: jp2TransferSyntaxUID },
              { mediaType: jpxMediaType, transferSyntaxUID: jpxTransferSyntaxUIDlossless },
              { mediaType: jpxMediaType, transferSyntaxUID: jpxTransferSyntaxUID },
              { mediaType: jpegMediaType, transferSyntaxUID: jpegTransferSyntaxUID }
            ]
          }

          options.client.retrieveInstanceFrames(retrieveOptions).then(
            (rawFrames) => {
              // coloring image
              const {
                thresholdValues,
                color,
                opacity
              } = this.blendingInformation

              const frameData = {
                img,
                frames: rawFrames[0],
                bitsAllocated,
                pixelRepresentation,
                thresholdValues,
                color,
                opacity,
                columns,
                rows
              }

              const rendered = renderingEngine.colorMonochomeImageFrame(frameData)
              tile.needToRerender = !rendered
            }
          ).catch(
            () => {
              // since we can't ask to retrieve both jpeg formats and octet-stream
              // we use a catch in the case all jpeg formats will fail
              const retrieveOptions = {
                studyInstanceUID,
                seriesInstanceUID,
                sopInstanceUID,
                frameNumbers,
                mediaTypes: [
                  { mediaType: octetStreamMediaType, transferSyntaxUID: octetStreamTransferSyntaxUID }
                ]
              }
              options.client.retrieveInstanceFrames(retrieveOptions).then(
                (rawFrames) => {
                  // coloring image
                  const {
                    thresholdValues,
                    color,
                    opacity
                  } = this.blendingInformation

                  const frameData = {
                    img,
                    frames: rawFrames[0],
                    bitsAllocated,
                    pixelRepresentation,
                    thresholdValues,
                    color,
                    opacity,
                    columns,
                    rows
                  }

                  const rendered = renderingEngine.colorMonochomeImageFrame(frameData)
                  tile.needToRerender = !rendered
                }
              )
            }
          )
        }
      } else {
        console.warn('could not load tile')
      }
    }

    /*
     * We use the existing TileImage source but customize it to retrieve
     * frames (load tiles) via DICOMweb WADO-RS.
     * NOTE: transition = 0 disable OpenLayer transition alpha opacity
    */
    this.rasterSource = new TileImage({
      crossOrigin: 'Anonymous',
      tileGrid: tileGrid,
      projection: projection,
      wrapX: false,
      transition: 0
    })

    this.rasterSource.setTileUrlFunction(tileUrlFunction)
    this.rasterSource.setTileLoadFunction(tileLoadFunction)

    // Create OpenLayer renderer object
    this.tileLayer = new TileLayer({
      extent: tileGrid.getExtent(),
      source: this.rasterSource,
      preload: Infinity,
      projection: projection
    })

    this.tileLayer.setVisible(this.blendingInformation.visible)

    // Set the composition type for the OpenLayer renderer object
    this.tileLayer.on('prerender', function (event) {
      event.context.globalCompositeOperation = 'lighter'
    })

    this.tileLayer.on('postrender', function (event) {
      event.context.globalCompositeOperation = 'source-over'
    })
  }

  /** Calculates the image geometry
   *
   * @param {object} image - _Channel object
   * @returns {number[][]} image geometry - Extents, Origins, Resolutions, GridSizes, TileSizes, PixelSpacings array
   * @static
   */
  static deriveImageGeometry (image) {
    image.microscopyImages = []
    image.metadata.forEach(m => {
      const microscopyImage = new VLWholeSlideMicroscopyImage({ metadata: m })
      if (microscopyImage.ImageType[2] === 'VOLUME') {
        image.microscopyImages.push(microscopyImage)
      }
    })
    if (image.microscopyImages.length === 0) {
      throw new Error('No VOLUME image provided.')
    }
    // Sort instances and optionally concatenation parts if present.
    image.microscopyImages.sort((a, b) => {
      const sizeDiff = a.TotalPixelMatrixColumns - b.TotalPixelMatrixColumns
      if (sizeDiff === 0) {
        if (a.ConcatenationFrameOffsetNumber !== undefined) {
          return a.ConcatenationFrameOffsetNumber - b.ConcatenationFrameOffsetNumber
        }
        return sizeDiff
      }
      return sizeDiff
    })

    image.pyramidMetadata = []
    image.pyramidFrameMappings = []
    const frameMappings = image.microscopyImages.map(m => getFrameMapping(m))
    for (let i = 0; i < image.microscopyImages.length; i++) {
      const cols = image.microscopyImages[i].TotalPixelMatrixColumns
      const rows = image.microscopyImages[i].TotalPixelMatrixRows
      const numberOfFrames = image.microscopyImages[i].NumberOfFrames
      /*
       * Instances may be broken down into multiple concatentation parts.
       * Therefore, we have to re-assemble instance metadata.
      */
      let alreadyExists = false
      let index = null
      for (let j = 0; j < image.pyramidMetadata.length; j++) {
        if (
          (image.pyramidMetadata[j].TotalPixelMatrixColumns === cols) &&
          (image.pyramidMetadata[j].TotalPixelMatrixRows === rows)
        ) {
          alreadyExists = true
          index = j
        }
      }
      if (alreadyExists) {
        // Update with information obtained from current concatentation part.
        Object.assign(image.pyramidFrameMappings[index], frameMappings[i])
        image.pyramidMetadata[index].NumberOfFrames += numberOfFrames
        if ('PerFrameFunctionalGroupsSequence' in image.microscopyImages[index]) {
          image.pyramidMetadata[index].PerFrameFunctionalGroupsSequence.push(
            ...image.microscopyImages[i].PerFrameFunctionalGroupsSequence
          )
        }
        if (!('SOPInstanceUIDOfConcatenationSource' in image.microscopyImages[i])) {
          throw new Error(
            'Attribute "SOPInstanceUIDOfConcatenationSource" is required ' +
            'for concatenation parts.'
          )
        }
        const sopInstanceUID = image.microscopyImages[i].SOPInstanceUIDOfConcatenationSource
        image.pyramidMetadata[index].SOPInstanceUID = sopInstanceUID
        delete image.pyramidMetadata[index].SOPInstanceUIDOfConcatenationSource
        delete image.pyramidMetadata[index].ConcatenationUID
        delete image.pyramidMetadata[index].InConcatenationNumber
        delete image.pyramidMetadata[index].ConcatenationFrameOffsetNumber
      } else {
        image.pyramidMetadata.push(image.microscopyImages[i])
        image.pyramidFrameMappings.push(frameMappings[i])
      }
    }
    const nLevels = image.pyramidMetadata.length
    if (nLevels === 0) {
      console.error('empty pyramid - no levels found')
    }
    image.pyramidBaseMetadata = image.pyramidMetadata[nLevels - 1]

    /*
     * Collect relevant information from DICOM metadata for each pyramid
     * level to construct the Openlayers map.
    */
    const imageTileSizes = []
    const imageGridSizes = []
    const imageResolutions = []
    const imageOrigins = []
    const imagePixelSpacings = []
    const offset = [0, -1]
    const baseTotalPixelMatrixColumns = image.pyramidBaseMetadata.TotalPixelMatrixColumns
    const baseTotalPixelMatrixRows = image.pyramidBaseMetadata.TotalPixelMatrixRows
    for (let j = (nLevels - 1); j >= 0; j--) {
      const columns = image.pyramidMetadata[j].Columns
      const rows = image.pyramidMetadata[j].Rows
      const totalPixelMatrixColumns = image.pyramidMetadata[j].TotalPixelMatrixColumns
      const totalPixelMatrixRows = image.pyramidMetadata[j].TotalPixelMatrixRows
      const pixelSpacing = getPixelSpacing(image.pyramidMetadata[j])
      const nColumns = Math.ceil(totalPixelMatrixColumns / columns)
      const nRows = Math.ceil(totalPixelMatrixRows / rows)
      imageTileSizes.push([
        columns,
        rows
      ])
      imageGridSizes.push([
        nColumns,
        nRows
      ])
      imagePixelSpacings.push(pixelSpacing)
      /*
      * Compute the resolution at each pyramid level, since the zoom
      * factor may not be the same between adjacent pyramid levels.
      */
      const zoomFactor = baseTotalPixelMatrixColumns / totalPixelMatrixColumns
      imageResolutions.push(zoomFactor)
      /*
      * TODO: One may have to adjust the offset slightly due to the
      * difference between extent of the image at a given resolution level
      * and the actual number of tiles (frames).
      */
      imageOrigins.push(offset)
    }
    imageResolutions.reverse()
    imageTileSizes.reverse()
    imageGridSizes.reverse()
    imageOrigins.reverse()
    imagePixelSpacings.reverse()

    /** Frames may extend beyond the size of the total pixel matrix.
     * The excess pixels are empty, i.e. have only a padding value.
     * We set the extent to the size of the actual image without taken
     * excess pixels into account.
     * Note that the vertical axis is flipped in the used tile source,
     * i.e. values on the axis lie in the range [-n, -1], where n is the
     * number of rows in the total pixel matrix.
     */

    const imageExtents = [
      0, // min X
      -(baseTotalPixelMatrixRows + 1), // min Y
      baseTotalPixelMatrixColumns, // max X
      -1 // max Y
    ]

    return [
      imageExtents,
      imageOrigins,
      imageResolutions,
      imageGridSizes,
      imageTileSizes,
      imagePixelSpacings
    ]
  }

  /** Adds the metadata to the metadata array of the channel
   * @param {object} metadata
   */
  addMetadata (metadata) {
    this.metadata.push(metadata)
  }

  /** Gets the channel visualization/presentation parameters
   * @returns {object} BlendingInformation
   */
  getBlendingInformation () {
    return this.blendingInformation
  }

  /** Sets the channel visualization/presentation parameters
   * @param {object} BlendingInformation
   * @param {string} BlendingInformation.opticalPathIdentifier - channel ID
   * @param {number[]} BlendingInformation.color - channel rgb color
   * @param {number} BlendingInformation.opacity - channel opacity
   * @param {number[]} BlendingInformation.thresholdValues - channel clipping values
   * @param {boolean} BlendingInformation.visible - channel visibility
   * @param {number[]} tilesCoordRanges - array with tiles X and Y coordinates ranges and zoom level
   *
   * @returns {boolean} rerender - force OpenLayer to rerender the view
   */
  setBlendingInformation (blendingInformation, tilesCoordRanges) {
    const {
      color,
      opacity,
      thresholdValues,
      visible
    } = blendingInformation

    let rerender = false
    if (color) {
      if (this.blendingInformation.color[0] !== color[0] ||
        this.blendingInformation.color[1] !== color[1] ||
        this.blendingInformation.color[2] !== color[2]) {
        rerender = true
      }
      this.blendingInformation.color = [...color]
    }
    if (opacity) {
      if (Math.abs(this.blendingInformation.opacity - opacity) > 1.e-3) {
        rerender = true
      }
      this.blendingInformation.opacity = opacity
    }
    if (thresholdValues) {
      if (this.blendingInformation.thresholdValues[0] !== thresholdValues[0] ||
        this.blendingInformation.thresholdValues[1] !== thresholdValues[1]) {
        rerender = true
      }
      this.blendingInformation.thresholdValues = [...thresholdValues]
    }
    if (visible !== undefined && visible !== null) {
      this.blendingInformation.visible = visible
      this.tileLayer.setVisible(this.blendingInformation.visible)
    }

    // rerender tiles already loaded
    if (rerender) {
      return this.updateTilesRendering(
        true,
        tilesCoordRanges[2],
        [tilesCoordRanges[0], tilesCoordRanges[1]]
      )
    } else {
      return false
    }
  }

  /** Reruns the offscreen render to color the tiles if needed.
   * This is called at every zoom interaction.
   * @param {boolean} visuParamChanged - true if this is called by setBlendingInformation
   * @param {number} zoomLevel - zoom level to update
   * @param {number[]} tilesCoordRanges - array with tiles X and Y coordinates ranges to update
   *
   * @returns {boolean} rerender - force OpenLayer to rerender the view.
  */
  updateTilesRendering (visuParamChanged, zoomLevel, tilesCoordRanges) {
    // rerender tiles already loaded
    // retrieve all the cached tiles from the raster source and reapply the offscreen render
    let mapRerender = false
    for (const [key, value] of Object.entries(this.rasterSource.tileCache.entries_)) {
      const tile = value.value_
      const z = tile.tileCoord[0] // integer
      const y = tile.tileCoord[1]
      const x = tile.tileCoord[2]
      // for perfomances reasons we refresh only the tiles that are currently
      // at the same zoom level and extent of the view. The other tiles will be updated
      // interactively when zooming or panning the view.
      let render = false
      let update = Math.abs(z - zoomLevel) < 0.75
      if (tilesCoordRanges) {
        update = update &&
          (y >= tilesCoordRanges[1].min && y <= tilesCoordRanges[1].max) &&
          (x >= tilesCoordRanges[0].min && x <= tilesCoordRanges[0].max)
      }
      if (update) {
        if (visuParamChanged) {
          render = true
        } else {
          render = tile.needToRerender !== false
        }
      }

      if (visuParamChanged) {
        tile.needToRerender = !render
      }

      if (render) {
        console.log('updating rendering for tile : ', key)
        const samplesPerPixel = this.pyramidMetadata[z].SamplesPerPixel // number of colors for pixel
        if (samplesPerPixel === 1) {
          const columns = this.pyramidMetadata[z].Columns
          const rows = this.pyramidMetadata[z].Rows
          const { thresholdValues, color, opacity } = this.blendingInformation
          const img = tile.getImage()

          // coloring images
          const frameData = {
            img,
            thresholdValues,
            color,
            opacity,
            columns,
            rows
          }

          const rendered = this.renderingEngine.colorMonochomeImageFrame(frameData)
          if (rendered) {
            mapRerender = true
            tile.needToRerender = !rendered
          }
        }
      }
    }

    return mapRerender
  }
}

export { _Channel, BlendingInformation }
