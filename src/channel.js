import { getFrameMapping } from './metadata.js'
import *
as DICOMwebClient from 'dicomweb-client'
import {
  areNumbersAlmostEqual,
  are1DArraysAlmostEqual,
  are2DArraysAlmostEqual
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
  * @param {number[]} limitValues
  * @param {boolean} visible
  */
  constructor ({
    opticalPathIdentifier,
    color,
    opacity,
    thresholdValues,
    limitValues,
    visible
  }) {
    this.opticalPathIdentifier = opticalPathIdentifier
    this.color = [...color]
    this.opacity = opacity
    this.thresholdValues = [...thresholdValues]
    this.limitValues = [...limitValues]
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
 * Channel coloring is allowed only for monochrome channels (i.e SamplesPerPixel === 1).
 *
 * @param {object} BlendingInformation
 * @param {string} BlendingInformation.opticalPathIdentifier - channel ID
 * @param {number[]} BlendingInformation.color - channel rgb color
 * @param {number} BlendingInformation.opacity - channel opacity
 * @param {number[]} BlendingInformation.thresholdValues - channel clipping values
 * @param {number[]} BlendingInformation.limitValues - channel min and max color fuinction values
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
   * @param {string} referenceFrameOfReferenceUID - reference frame of reference UID
   * @param {string} referenceContainerIdentifier - container identifier of reference UID
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
  initChannel (
    referenceOpticalPathIdentifier,
    referenceFrameOfReferenceUID,
    referenceContainerIdentifier,
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
    const opticalPathIdentifier = this.blendingInformation.opticalPathIdentifier
    // Check frame of reference
    if (referenceFrameOfReferenceUID !== this.FrameOfReferenceUID) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has different FrameOfReferenceUID with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }

    // Check container identifier
    if (referenceContainerIdentifier !== this.ContainerIdentifier) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has different ContainerIdentifier with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }

    // Check that all the channels have the same pyramid parameters
    if (!are2DArraysAlmostEqual(geometryArrays[0], referenceExtent)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has an incompatible extent with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }
    if (!are2DArraysAlmostEqual(geometryArrays[1], referenceOrigins)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has incompatible origins with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }
    if (!are2DArraysAlmostEqual(geometryArrays[2], referenceResolutions)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has incompatible resolutions with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }
    if (!are2DArraysAlmostEqual(geometryArrays[3], referenceGridSizes)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has incompatible grid sizes with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }
    if (!are2DArraysAlmostEqual(geometryArrays[4], referenceTileSizes)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has incompatible tile sizes with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }
    if (!are2DArraysAlmostEqual(geometryArrays[5], referencePixelSpacings)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has incompatible pixel spacings with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
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
      const z = tile.tileCoord[0]
      const columns = this.pyramidMetadata[z].Columns
      const rows = this.pyramidMetadata[z].Rows
      const samplesPerPixel = this.pyramidMetadata[z].SamplesPerPixel
      const bitsAllocated = this.pyramidMetadata[z].BitsAllocated
      const pixelRepresentation = this.pyramidMetadata[z].PixelRepresentation

      if (src !== null && samplesPerPixel === 1) {
        const studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(src)
        const seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(src)
        const sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(src)
        const frameNumbers = DICOMwebClient.utils.getFrameNumbersFromUri(src)

        tile.needToRerender = false
        tile.isLoading = true

        if (options.retrieveRendered) {
          /*
           * We could use PNG, but at the moment we don't have a PNG decoder
           * library and thus would have to draw to a canvas, retrieve the
           * imageData and then recompat the array from a RGBA to a 1 component
           * array for the offscreen rendering engine, which would result in
           * poor perfomance.
           */
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
                limitValues,
                color
              } = this.blendingInformation

              const frameData = {
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
              }

              const rendered = renderingEngine.colorMonochromeImageFrame(
                frameData
              )
              tile.needToRerender = !rendered
              tile.isLoading = false
            }
          )
        } else {
          const jpegMediaType = 'image/jpeg' // decoded with libJPEG-turbo
          const jpegTransferSyntaxUID = '1.2.840.10008.1.2.4.50'
          const jlsTransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.80'
          const jlsTransferSyntaxUID = '1.2.840.10008.1.2.4.81'
          const jp2MediaType = 'image/jp2' // decoded with OpenJPEG
          const jp2TransferSyntaxUIDlossless = '1.2.840.10008.1.2.4.90'
          const jp2TransferSyntaxUID = '1.2.840.10008.1.2.4.91'
          const jpxMediaType = 'image/jpx' // decoded with OpenJPEG
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
            ]
          }

          options.client.retrieveInstanceFrames(retrieveOptions).then(
            (rawFrames) => {
              // coloring image
              const {
                thresholdValues,
                limitValues,
                color
              } = this.blendingInformation

              const frameData = {
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
              }

              const rendered = renderingEngine.colorMonochromeImageFrame(
                frameData
              )
              tile.needToRerender = !rendered
              tile.isLoading = false
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
                  {
                    mediaType: octetStreamMediaType,
                    transferSyntaxUID: octetStreamTransferSyntaxUID
                  }
                ]
              }
              options.client.retrieveInstanceFrames(retrieveOptions).then(
                (rawFrames) => {
                  // coloring image
                  const {
                    thresholdValues,
                    limitValues,
                    color
                  } = this.blendingInformation

                  const frameData = {
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
                  }

                  const rendered = renderingEngine.colorMonochromeImageFrame(
                    frameData
                  )
                  tile.needToRerender = !rendered
                  tile.isLoading = false
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
     * NOTE: it is needed a very large initial cacheSize value
     *       otherwise, the tile caches will be cleared at each zoom
     *       providing very bad perfomances.
    */
    this.rasterSource = new TileImage({
      crossOrigin: 'Anonymous',
      tileGrid: tileGrid,
      projection: projection,
      wrapX: false,
      transition: 0,
      cacheSize: options.tilesCacheSize
    })

    this.rasterSource.setTileUrlFunction(tileUrlFunction)
    this.rasterSource.setTileLoadFunction(tileLoadFunction)

    // Create OpenLayer renderer object
    this.tileLayer = new TileLayer({
      extent: tileGrid.getExtent(),
      source: this.rasterSource,
      preload: 0,
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
    if (image.metadata.length === 0) {
      throw new Error('No VOLUME image provided for Optioncal Path ID: ' +
      image.blendingInformation.opticalPathIdentifier)
    }

    image.FrameOfReferenceUID = image.metadata[0].FrameOfReferenceUID
    for (let i = 0; i < image.metadata.length; ++i) {
      if (image.FrameOfReferenceUID !== image.metadata[i].FrameOfReferenceUID) {
        const msg = `Optical Path ID ${image.opticalPathIdentifier} ` +
        ` has volume microscopy images with FrameOfReferenceUID=${image.metadata[i].FrameOfReferenceUID}!=${image.FrameOfReferenceUID}`;
        console.warn(msg);
        // throw new Error(msg);
      }
    }

    image.ContainerIdentifier = image.metadata[0].ContainerIdentifier
    for (let i = 0; i < image.metadata.length; ++i) {
      if (image.ContainerIdentifier !== image.metadata[i].ContainerIdentifier) {
        throw new Error('Optioncal Path ID ' +
        image.blendingInformation.opticalPathIdentifier +
        ' has volume microscopy images with different ContainerIdentifier')
      }
    }

    // Sort instances and optionally concatenation parts if present.
    image.metadata.sort((a, b) => {
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
    const frameMappings = image.metadata.map(m => getFrameMapping(m))
    for (let i = 0; i < image.metadata.length; i++) {
      const cols = image.metadata[i].TotalPixelMatrixColumns
      const rows = image.metadata[i].TotalPixelMatrixRows
      const numberOfFrames = image.metadata[i].NumberOfFrames
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
        if ('PerFrameFunctionalGroupsSequence' in image.metadata[index]) {
          image.pyramidMetadata[index].PerFrameFunctionalGroupsSequence.push(
            ...image.metadata[i].PerFrameFunctionalGroupsSequence
          )
        }
        if (!('SOPInstanceUIDOfConcatenationSource' in image.metadata[i])) {
          throw new Error(
            'Attribute "SOPInstanceUIDOfConcatenationSource" is required ' +
            'for concatenation parts.'
          )
        }
        const sopInstanceUID = image.metadata[i].SOPInstanceUIDOfConcatenationSource
        image.pyramidMetadata[index].SOPInstanceUID = sopInstanceUID
        delete image.pyramidMetadata[index].SOPInstanceUIDOfConcatenationSource
        delete image.pyramidMetadata[index].ConcatenationUID
        delete image.pyramidMetadata[index].InConcatenationNumber
        delete image.pyramidMetadata[index].ConcatenationFrameOffsetNumber
      } else {
        image.pyramidMetadata.push(image.metadata[i])
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
    const physicalSizes = []
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

      physicalSizes.push([
        (totalPixelMatrixColumns * pixelSpacing[1]).toFixed(4),
        (totalPixelMatrixRows * pixelSpacing[0]).toFixed(4)
      ])
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

    const uniquePhysicalSizes = [
      ...new Set(physicalSizes.map(v => v.toString()))
    ].map(v => v.split(','))
    if (uniquePhysicalSizes.length > 1) {
      console.warn(
        'images of the image pyramid have different sizes (in millimeter): ',
        physicalSizes
      )
    }

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
    if (metadata.ImageType[2] === 'VOLUME') {
      this.metadata.push(metadata)
    }
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
   * @param {number[]} BlendingInformation.limitValues - channel min and max color function values
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
      limitValues,
      visible
    } = blendingInformation

    let rerender = false
    if (color && !are1DArraysAlmostEqual(this.blendingInformation.color, color)) {
      rerender = true
      this.blendingInformation.color = [...color]
    }
    if (opacity && !areNumbersAlmostEqual(this.blendingInformation.opacity, opacity)) {
      this.blendingInformation.opacity = opacity
      this.tileLayer.setOpacity(this.blendingInformation.opacity)
    }
    if (thresholdValues && !are1DArraysAlmostEqual(this.blendingInformation.thresholdValues, thresholdValues)) {
      rerender = true
      this.blendingInformation.thresholdValues = [...thresholdValues]
    }
    if (limitValues && !are1DArraysAlmostEqual(this.blendingInformation.limitValues, limitValues)) {
      rerender = true
      this.blendingInformation.limitValues = [...limitValues]
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
          render = tile.needToRerender === true && tile.isLoading !== true
        }
      } else if (visuParamChanged) {
        tile.needToRerender = true
      }

      if (render) {
        console.log('updating rendering for tile : ', key)
        const samplesPerPixel = this.pyramidMetadata[z].SamplesPerPixel // number of colors for pixel
        if (samplesPerPixel === 1) {
          const columns = this.pyramidMetadata[z].Columns
          const rows = this.pyramidMetadata[z].Rows
          const { thresholdValues, limitValues, color } = this.blendingInformation
          const img = tile.getImage()

          // coloring images
          const frameData = {
            img,
            thresholdValues,
            limitValues,
            color,
            opacity: 1, // handled by OpenLayers
            columns,
            rows
          }

          this.renderingEngine.colorMonochromeImageFrame(frameData)
          mapRerender = true
          tile.needToRerender = false
        }
      }
    }

    return mapRerender
  }
}

export { _Channel, BlendingInformation }
