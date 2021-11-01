import TileImage from 'ol/source/TileImage'
import TileLayer from 'ol/layer/WebGLTile'
import {
  areNumbersAlmostEqual,
  are1DArraysAlmostEqual,
  are2DArraysAlmostEqual
} from './utils.js'
import {
  _computeImagePyramid,
  _createTileLoadFunction,
  _createTileUrlFunction
} from './pyramid.js'

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

class _Channel {
/**
 * Create a channel instance which contains all the visualization/presentation
 * parameters and OpenLayer objects for a Whole Slide Microscopy Image.
 * Channel coloring is allowed only for monochrome images
 * (i.e., images with only one sample per pixel).
 *
 * @param {object} options
 * @param {string} options.opticalPathIdentifier - channel ID
 * @param {number[]} options.color - channel rgb color
 * @param {number} options.opacity - channel opacity
 * @param {number[]} options.thresholdValues - channel clipping values
 * @param {number[]} options.limitValues - channel min and max color function values
 * @param {boolean} options.visible - channel visibility
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
    renderingEngine
  ) {
    // cache viewer object and info in channel
    this.renderingEngine = renderingEngine

    /*
    * To visualize images accross multiple scales, we first need to
    * determine the structure of the image pyramid, i.e., the size and
    * resolution of images at the different pyramid levels.
    */
    this.pyramid = _computeImagePyramid({ metadata: this.metadata })
    const opticalPathIdentifier = this.blendingInformation.opticalPathIdentifier

    const frameOfReferenceUID = this.metadata[0].FrameOfReferenceUID
    if (referenceFrameOfReferenceUID !== frameOfReferenceUID) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has different FrameOfReferenceUID with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }

    const containerIdentifier = this.metadata[0].ContainerIdentifier
    if (referenceContainerIdentifier !== containerIdentifier) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has different ContainerIdentifier with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }

    // Check that all the channels have the same pyramid parameters
    if (!are2DArraysAlmostEqual(this.pyramid.extent, referenceExtent)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has an incompatible extent with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }
    if (!are2DArraysAlmostEqual(this.pyramid.origins, referenceOrigins)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has incompatible origins with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }
    if (!are2DArraysAlmostEqual(this.pyramid.resolutions, referenceResolutions)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has incompatible resolutions with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }
    if (!are2DArraysAlmostEqual(this.pyramid.gridSizes, referenceGridSizes)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has incompatible grid sizes with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }
    if (!are2DArraysAlmostEqual(this.pyramid.tileSizes, referenceTileSizes)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has incompatible tile sizes with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }
    if (!are2DArraysAlmostEqual(this.pyramid.pixelSpacings, referencePixelSpacings)) {
      throw new Error(
        `Image with optical path "${opticalPathIdentifier}"` +
        'has incompatible pixel spacings with respect to the reference ' +
        'image with optical path ' +
        `"${referenceOpticalPathIdentifier}".`
      )
    }

    const tileUrlFunction = _createTileUrlFunction({
      pyramid: this.pyramid,
      client: options.client,
      retrieveRendered: options.retrieveRendered
    })

    const tileLoadFunction = _createTileLoadFunction({
      pyramid: this.pyramid,
      client: options.client,
      retrieveRendered: options.retrieveRendered,
      includeIccProfile: options.includeIccProfile,
      renderingEngine,
      blendingInformation: this.blendingInformation
    })
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
    // TODO: may no longer be needed with WebGL renderer
    this.tileLayer.on('prerender', function (event) {
      if (event.content) {
        event.context.globalCompositeOperation = 'lighter'
      }
    })

    this.tileLayer.on('postrender', function (event) {
      if (event.content) {
        event.context.globalCompositeOperation = 'source-over'
      }
    })
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

  /** Set the channel visualization/presentation parameters
   *
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
    const doesColorMatch = are1DArraysAlmostEqual(
      this.blendingInformation.color,
      color
    )
    if (color && !doesColorMatch) {
      rerender = true
      this.blendingInformation.color = [...color]
    }
    const doesOpacityMatch = areNumbersAlmostEqual(
      this.blendingInformation.opacity,
      opacity
    )
    if (opacity && !doesOpacityMatch) {
      this.blendingInformation.opacity = opacity
      this.tileLayer.setOpacity(this.blendingInformation.opacity)
    }
    const doThresholdValuesMatch = are1DArraysAlmostEqual(
      this.blendingInformation.thresholdValues,
      thresholdValues
    )
    if (thresholdValues && !doThresholdValuesMatch) {
      rerender = true
      this.blendingInformation.thresholdValues = [...thresholdValues]
    }
    const doLimitValuesMatch = are1DArraysAlmostEqual(
      this.blendingInformation.limitValues,
      limitValues
    )
    if (limitValues && !doLimitValuesMatch) {
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

  /** Rerun the offscreen render to color the tiles if needed.
   *
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
        const samplesPerPixel = this.pyramid.metadata[z].SamplesPerPixel
        if (samplesPerPixel === 1) {
          const columns = this.pyramid.metadata[z].Columns
          const rows = this.pyramid.metadata[z].Rows
          const {
            thresholdValues,
            limitValues,
            color
          } = this.blendingInformation
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

          tile.needToRerender = this.renderingEngine.colorMonochromeImageFrame(
            frameData
          )
          mapRerender = true
        }
      }
    }

    return mapRerender
  }
}

export { _Channel, BlendingInformation }
