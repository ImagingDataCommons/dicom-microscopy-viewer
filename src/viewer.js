import 'ol/ol.css'
import Collection from 'ol/Collection'
import Draw, { createRegularPolygon } from 'ol/interaction/Draw'
import EVENT from './events'
import Feature from 'ol/Feature'
import Fill from 'ol/style/Fill'
import FullScreen from 'ol/control/FullScreen'
import Icon from 'ol/style/Icon'
import ImageLayer from 'ol/layer/Image'
import Map from 'ol/Map'
import Modify from 'ol/interaction/Modify'
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom'
import OverviewMap from 'ol/control/OverviewMap'
import Projection from 'ol/proj/Projection'
import publish from './eventPublisher'
import ScaleLine from 'ol/control/ScaleLine'
import Select from 'ol/interaction/Select'
import Snap from 'ol/interaction/Snap'
import Translate from 'ol/interaction/Translate'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Static from 'ol/source/ImageStatic'
import Overlay from 'ol/Overlay'
import TileLayer from 'ol/layer/WebGLTile'
import DataTileSource from 'ol/source/DataTile'
import TileGrid from 'ol/tilegrid/TileGrid'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import View from 'ol/View'
import DragPan from 'ol/interaction/DragPan'
import DragZoom from 'ol/interaction/DragZoom'

import { default as VectorEventType } from 'ol/source/VectorEventType'// eslint-disable-line
import { ZoomSlider, Zoom } from 'ol/control'
import { getCenter } from 'ol/extent'

import * as DICOMwebClient from 'dicomweb-client'
import dcmjs from 'dcmjs'

import {
  ColorMapNames,
  createColorMap,
  createColorTable
} from './color.js'
import {
  VLWholeSlideMicroscopyImage,
  groupMonochromeInstances,
  groupColorInstances
} from './metadata.js'
import { _groupFramesPerMapping, Mapping } from './mapping.js'
import { ROI } from './roi.js'
import { Segment } from './segment.js'
import {
  computeRotation,
  generateUID,
  getUnitSuffix,
  doContentItemsMatch
} from './utils.js'
import {
  getPixelSpacing,
  geometry2Scoord3d,
  scoord3d2Geometry,
  getFeatureScoord3dLength,
  getFeatureScoord3dArea
} from './scoord3dUtils'
import { BlendingInformation, OpticalPath } from './opticalPath.js'
import {
  _areImagePyramidsEqual,
  _computeImagePyramid,
  _createTileLoadFunction,
  _fitImagePyramid
} from './pyramid.js'

import { RenderingEngine } from './renderingEngine.js'
import Enums from './enums'
import _AnnotationManager from './annotations/_AnnotationManager'

function _getInteractionBindingCondition (bindings) {
  const BUTTONS = {
    left: 1,
    middle: 4,
    right: 2
  }

  const { mouseButtons, modifierKey } = bindings

  const _mouseButtonCondition = (event) => {
    /** No mouse button condition set. */
    if (!mouseButtons || !mouseButtons.length) {
      return true
    }

    const button = event.pointerEvent
      ? event.pointerEvent.buttons
      : event.originalEvent.buttons

    return mouseButtons.some((mb) => BUTTONS[mb] === button)
  }

  const _modifierKeyCondition = (event) => {
    const pointerEvent = event.pointerEvent
      ? event.pointerEvent
      : event.originalEvent

    if (!modifierKey) {
      /**
       * No modifier key, don't pass if key pressed as other
       * tool may be using this tool.
       */
      return (
        !pointerEvent.altKey &&
        !pointerEvent.metaKey &&
        !pointerEvent.shiftKey &&
        !pointerEvent.ctrlKey
      )
    }

    switch (modifierKey) {
      case 'alt':
        return pointerEvent.altKey === true || pointerEvent.metaKey === true
      case 'shift':
        return pointerEvent.shiftKey === true
      case 'ctrl':
        return pointerEvent.ctrlKey === true
      default:
        /** Invalid modifier key set (ignore requirement as if key not pressed). */
        return (
          !pointerEvent.altKey &&
          !pointerEvent.metaKey &&
          !pointerEvent.shiftKey &&
          !pointerEvent.ctrlKey
        )
    }
  }

  return (event) => {
    return _mouseButtonCondition(event) && _modifierKeyCondition(event)
  }
}

/** Determines whether image needs to be rotated relative to slide
 * coordinate system based on direction cosines.
 * We want to rotate all images such that the X axis of the slide coordinate
 * system is the vertical axis (ordinate) of the viewport and the Y axis
 * of the slide coordinate system is the horizontal axis (abscissa) of the
 * viewport. Note that this is opposite to the Openlayers coordinate system.
 * There are only planar rotations, since the total pixel matrix is
 * parallel to the slide surface. Here, we further assume that rows and
 * columns of total pixel matrix are parallel to the borders of the slide,
 * i.e. the x and y axis of the slide coordinate system.
 *
 * The row direction (left to right) of the Total Pixel Matrix
 * is defined by the first three values.
 * The three values specify how the direction changes from the last pixel
 * to the first pixel in the row along each of the three axes of the
 * slide coordinate system (x, y, z), i.e. it express in which direction one
 * is moving in the slide coordinate system when the COLUMN index changes.
 * The column direction (top to bottom) of the Total Pixel Matrix
 * is defined by the second three values.
 * The three values specify how the direction changes from the last pixel
 * to the first pixel in the column along each of the three axes of the
 * slide coordinate system (x, y, z), i.e. it express in which direction one
 * is moving in the slide coordinate system when the ROW index changes.
 *
 * @param {object} metadata - Metadata of a DICOM VL Whole Slide Microscopy Image instance
 * @returns {number} Rotation in radians
 * @private
 */
function _getRotation (metadata) {
  // Angle with respect to the reference orientation
  const angle = computeRotation({
    orientation: metadata.ImageOrientationSlide
  })
  // We want the slide oriented horizontally with the label on the right side
  const correction = 90 * (Math.PI / 180)
  return angle + correction
}

/** Determine size of browser window.
 *
 * @return {number[]} Width and height of the window
 */
function _getWindowSize () {
  let width = 0
  let height = 0
  if (typeof window.innerWidth === 'number') {
    // Non-IE
    width = window.innerWidth
    height = window.innerHeight
  } else if (
    document.documentElement && (
      document.documentElement.clientWidth || document.documentElement.clientHeight
    )
  ) {
    // IE 6+ in 'standards compliant mode'
    width = document.documentElement.clientWidth
    height = document.documentElement.clientHeight
  } else if (
    document.body && (
      document.body.clientWidth || document.body.clientHeight
    )
  ) {
    // IE 4 compatible
    width = document.body.clientWidth
    height = document.body.clientHeight
  }
  return [width, height]
}

/** Map style options to OpenLayers style.
 *
 * @param {object} styleOptions - Style options
 * @param {object} styleOptions.stroke - Style options for the outline of the geometry
 * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
 * @param {number} styleOptions.stroke.width - Width of the outline
 * @param {object} styleOptions.fill - Style options for body the geometry
 * @param {number[]} styleOptions.fill.color - RGBA color of the body
 * @param {object} styleOptions.image - Style options for image
 * @return {Style} OpenLayers style
 */
function _getOpenLayersStyle (styleOptions) {
  const style = new Style()

  if ('stroke' in styleOptions) {
    const strokeOptions = {
      color: styleOptions.stroke.color,
      width: styleOptions.stroke.width
    }
    const stroke = new Stroke(strokeOptions)
    style.setStroke(stroke)
  }

  if ('fill' in styleOptions) {
    const fillOptions = {
      color: styleOptions.fill.color
    }
    const fill = new Fill(fillOptions)
    style.setFill(fill)
  }

  if ('image' in styleOptions) {
    const { image } = styleOptions

    if (image.circle) {
      const options = {
        radius: image.circle.radius,
        stroke: new Stroke(image.circle.stroke),
        fill: new Fill(image.circle.fill)
      }
      const circle = new Circle(options)
      style.setImage(circle)
    }

    if (image.icon) {
      const icon = new Icon(image.icon)
      style.setImage(icon)
    }
  }

  return style
}

/**
 * Add ROI properties to feature in a safe way
 *
 * @param {object} feature - The feature instance that represents the ROI
 * @param {object} properties -Valid ROI properties
 * @param {object} properties.measurements - ROI measurements
 * @param {object} properties.evaluations - ROI evaluations
 * @param {object} properties.label - ROI label
 * @param {object} properties.marker - ROI marker (this is used while we don't have presentation states)
 * @param {boolean} optSilent - Opt silent update
 */
function _addROIPropertiesToFeature (feature, properties, optSilent) {
  const { Label, Measurements, Evaluations, Marker } = Enums.InternalProperties

  if (properties[Label]) {
    feature.set(Label, properties[Label], optSilent)
  }

  if (properties[Measurements]) {
    feature.set(Measurements, properties[Measurements], optSilent)
  }

  if (properties[Evaluations]) {
    feature.set(Evaluations, properties[Evaluations], optSilent)
  }

  if (properties[Marker]) {
    feature.set(Marker, properties[Marker], optSilent)
  }
}

/**
 * Wire measurements and qualitative events to generate content items
 * based on feature properties and geometry changes
 *
 * @param {object} map - The map instance
 * @param {object} feature - The feature instance
 * @param {object} pyramid - The pyramid metadata
 * @returns {void}
 */
function _wireMeasurementsAndQualitativeEvaluationsEvents (
  map,
  feature,
  pyramid
) {
  /**
   * Update feature measurement properties first and then measurements
   */
  _updateFeatureMeasurements(map, feature, pyramid)
  feature.getGeometry().on(Enums.FeatureGeometryEvents.CHANGE, () => {
    _updateFeatureMeasurements(map, feature, pyramid)
  })

  /**
   * Update feature evaluations
   */
  _updateFeatureEvaluations(feature)
  feature.on(Enums.FeatureEvents.PROPERTY_CHANGE, () =>
    _updateFeatureEvaluations(feature)
  )
}

/**
 * Update feature evaluations from its properties
 *
 * @param {Feature} feature
 * @returns {void}
 */
function _updateFeatureEvaluations (feature) {
  const evaluations = feature.get(Enums.InternalProperties.Evaluations) || []
  const label = feature.get(Enums.InternalProperties.Label)

  if (!label) return

  const evaluation = new dcmjs.sr.valueTypes.TextContentItem({
    name: new dcmjs.sr.coding.CodedConcept({
      value: '112039',
      meaning: 'Tracking Identifier',
      schemeDesignator: 'DCM'
    }),
    value: label,
    relationshipType: Enums.RelationshipTypes.HAS_OBS_CONTEXT
  })

  const index = evaluations.findIndex((e) =>
    doContentItemsMatch(e, evaluation)
  )

  if (index > -1) {
    evaluations[index] = evaluation
  } else {
    evaluations.push(evaluation)
  }

  feature.set(Enums.InternalProperties.Evaluations, evaluations)
}

/**
 * Generate feature measurements from its measurement properties
 *
 * @param {object} map - The map instance
 * @param {object} feature - The feature instance
 * @param {object} pyramid - The pyramid metadata
 * @returns {void}
 */
function _updateFeatureMeasurements (map, feature, pyramid) {
  if (
    Enums.Markup.Measurement !== feature.get(Enums.InternalProperties.Markup)
  ) {
    return
  }

  const measurements = feature.get(Enums.InternalProperties.Measurements) || []
  const area = getFeatureScoord3dArea(feature, pyramid)
  const length = getFeatureScoord3dLength(feature, pyramid)

  if (area == null && length == null) {
    return
  }

  const unitSuffixToMeaningMap = {
    μm: 'micrometer',
    mm: 'millimeter',
    m: 'meters',
    km: 'kilometers'
  }

  let measurement
  const view = map.getView()
  const unitSuffix = getUnitSuffix(view)
  const unitCodedConceptValue = unitSuffix
  const unitCodedConceptMeaning = unitSuffixToMeaningMap[unitSuffix]

  if (area != null) {
    measurement = new dcmjs.sr.valueTypes.NumContentItem({
      name: new dcmjs.sr.coding.CodedConcept({
        meaning: 'Area',
        value: '42798000',
        schemeDesignator: 'SCT'
      }),
      value: area,
      unit: [
        new dcmjs.sr.coding.CodedConcept({
          value: unitCodedConceptValue,
          meaning: unitCodedConceptMeaning,
          schemeDesignator: 'SCT'
        })
      ]
    })
  }

  if (length != null) {
    measurement = new dcmjs.sr.valueTypes.NumContentItem({
      name: new dcmjs.sr.coding.CodedConcept({
        meaning: 'Length',
        value: '410668003',
        schemeDesignator: 'SCT'
      }),
      value: length,
      unit: [
        new dcmjs.sr.coding.CodedConcept({
          value: unitCodedConceptValue,
          meaning: unitCodedConceptMeaning,
          schemeDesignator: 'SCT'
        })
      ]
    })
  }

  if (measurement) {
    const index = measurements.findIndex((m) => (
      doContentItemsMatch(m, measurement)
    ))

    if (index > -1) {
      measurements[index] = measurement
    } else {
      measurements.push(measurement)
    }

    feature.set(Enums.InternalProperties.Measurements, measurements)
  }
}

/**
 * Updates the style of a feature.
 *
 * @param {object} styleOptions - Style options
 * @param {object} styleOptions.stroke - Style options for the outline of the geometry
 * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
 * @param {number} styleOptions.stroke.width - Width of the outline
 * @param {object} styleOptions.fill - Style options for body the geometry
 * @param {number[]} styleOptions.fill.color - RGBA color of the body
 * @param {object} styleOptions.image - Style options for image
 */
function _setFeatureStyle (feature, styleOptions) {
  if (styleOptions !== undefined) {
    const style = _getOpenLayersStyle(styleOptions)
    feature.setStyle(style)

    /**
     * styleOptions is used internally by internal styled components like markers.
     * This allows them to take priority over styling since OpenLayers swaps the styles
     * completely in case of a setStyle happens.
     */
    feature.set(Enums.InternalProperties.StyleOptions, styleOptions)
  }
}

const _options = Symbol('options')
const _controls = Symbol('controls')
const _drawingLayer = Symbol('drawingLayer')
const _drawingSource = Symbol('drawingSource')
const _features = Symbol('features')
const _imageLayer = Symbol('imageLayer')
const _interactions = Symbol('interactions')
const _map = Symbol('map')
const _mappings = Symbol('mappings')
const _metadata = Symbol('metadata')
const _pyramid = Symbol('pyramid')
const _segments = Symbol('segments')
const _opticalPaths = Symbol('opticalPaths')
const _renderingEngine = Symbol('renderingEngine')
const _rotation = Symbol('rotation')
const _projection = Symbol('projection')
const _tileGrid = Symbol('tileGrid')
const _annotationManager = Symbol('annotationManager')
const _overviewMap = Symbol('overviewMap')

/** Interactive viewer for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type VOLUME.
 *
 * @class
 * @memberof viewer
 */
class VolumeImageViewer {
  /**
   * Create a viewer instance for displaying VOLUME images.
   *
   * @param {object} options
   * @param {object} options.client - A DICOMwebClient instance for interacting with an origin server over HTTP
   * @param {object[]} options.metadata - An array of DICOM JSON metadata objects or formatted image metadata objects created via "formatMetadata()".
   *        The array shall contain the metadata of all image instances that should be displayed.
   *        The constructor automatically determines optical paths of monochromatic images for blending.
   * @param {object[]} options.blendingInformation - An array containing blending information for the optical paths of monochromatic images standard visualization parameters already setup by an external application.
   * @param {object} options.styleOptions - Default style options for annotations.
   * @param {string[]} [options.controls=[]] - Names of viewer control elements that should be included in the viewport
   * @param {boolean} [options.retrieveRendered=true] - Whether image frames should be retrieved via DICOMweb prerendered by the server.
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile should be included for correction of image colors
   * @param {number} [options.tilesCacheSize=1000] - initial cache size for a TileImage
   */
  constructor (options) {
    this[_options] = options
    if (!('retrieveRendered' in this[_options])) {
      this[_options].retrieveRendered = true
    }

    if (!('includeIccProfile' in this[_options])) {
      this[_options].includeIccProfile = false
    }

    if (!('tilesCacheSize' in this[_options])) {
      this[_options].tilesCacheSize = 1000
    }

    if (!('overview' in this[_options])) {
      this[_options].overview = {}
    }

    if (!('controls' in this[_options])) {
      this[_options].controls = []
    }
    this[_options].controls = new Set(this[_options].controls)

    // Collection of Openlayers "TileLayer" instances
    this[_segments] = {}
    this[_mappings] = {}

    // Collection of Openlayers "Feature" instances
    this[_features] = new Collection([], { unique: true })

    // Add unique identifier to each created "Feature" instance
    this[_features].on('add', (e) => {
      // The ID may have already been set when drawn. However, features could
      // have also been added without a draw event.
      if (e.element.getId() === undefined) {
        e.element.setId(generateUID())
      }

      this[_annotationManager].onAdd(e.element)
    })

    this[_features].on('remove', (e) => {
      this[_annotationManager].onRemove(e.element)
    })

    if (this[_options].metadata.length === 0) {
      throw new Error('Input metadata has no instances.')
    }

    // Group color images by opticalPathIdentifier
    const colorGroups = groupColorInstances(this[_options].metadata)
    const colorImageInformation = {}
    if (colorGroups.length > 0) {
      if (colorGroups.length > 1) {
        console.warn(
          'Volume Image Viewer detected more than one color image, ' +
          'but only one color image can be loaded and visualized at a time. ' +
          'Only the first detected color image will be loaded.'
        )
      }
      const opticalPathIdentifier = (
        colorGroups[0][0]
          .OpticalPathSequence[0]
          .OpticalPathIdentifier
      )
      colorImageInformation[opticalPathIdentifier] = {
        metadata: colorGroups[0]
      }
    }

    const colormap = createColorMap({ name: ColorMapNames.JET, bins: 50 })
    const monochromeGroups = groupMonochromeInstances(this[_options].metadata)
    const monochromeImageInformation = {}
    monochromeGroups.forEach((group, i) => {
      group.forEach(image => {
        if (
          image.DimensionOrganizationType === '3D' ||
          image.DimensionOrganizationType === '3D_TEMPORAL'
        ) {
          throw new Error(
            'Volume Image Viewer does hot hanlde 3D image data yet.'
          )
        } else if (image.DimensionOrganizationType === 'TILED_FULL') {
          if (image.TotalPixelMatrixFocalPlanes === 1) {
            image.OpticalPathSequence.forEach(opticalPath => {
              const opticalPathIdentifier = opticalPath.OpticalPathIdentifier
              const bitsAllocated = image.BitsAllocated
              if (monochromeImageInformation[opticalPathIdentifier]) {
                monochromeImageInformation[opticalPathIdentifier].metadata.push(
                  image
                )
              } else {
                const blendingInformation = (
                  this[_options].blendingInformation !== undefined
                    ? this[_options].blendingInformation.find(info => (
                        info.opticalPathIdentifier === opticalPathIdentifier
                      ))
                    : undefined
                )
                if (blendingInformation !== undefined) {
                  monochromeImageInformation[opticalPathIdentifier] = {
                    metadata: [image],
                    blendingInformation,
                    opticalPath
                  }
                } else {
                  const maxValue = Math.pow(2, bitsAllocated) - 1
                  const defaultBlendingInformation = new BlendingInformation({
                    opticalPathIdentifier: `${opticalPathIdentifier}`,
                    color: [...colormap[i % colormap.length]].slice(0, 3),
                    opacity: 1.0,
                    thresholdValues: [0, 1],
                    limitValues: [0, maxValue],
                    visible: false
                  })
                  monochromeImageInformation[opticalPathIdentifier] = {
                    metadata: [image],
                    blendingInformation: defaultBlendingInformation,
                    opticalPath
                  }
                }
              }
            })
          } else {
            console.warn('images with multiple focal planes are not supported')
          }
        } else if (image.DimensionOrganizationType === 'TILED_SPARSE') {
          /*
           * The spatial location of each tile is explicitly encoded using
           * information in the Per-Frame Functional Group Sequence, and the
           * recipient shall not make any assumption about the spatial position
           * or optical path or order of the encoded frames.
           */
          // FIXME
          throw new Error(
            'Volume Image Viewer does hot handle TILED_SPARSE ' +
            'dimension organization for blending of optical paths yet.'
          )
        }
      })
    })

    const monochromeOpticalPathIdentifiers = Object.keys(monochromeImageInformation)
    const numChannels = monochromeOpticalPathIdentifiers.length
    const colorOpticalPathIdentifiers = Object.keys(colorImageInformation)
    const numColorImages = colorOpticalPathIdentifiers.length
    if (numChannels === 0 && numColorImages === 0) {
      throw new Error('Could not find any channels or color images.')
    }
    if (numChannels > 0 && numColorImages > 0) {
      throw new Error('Found both channels and color images.')
    }
    if (numColorImages > 1) {
      throw new Error('Found more than one color image.')
    }

    /*
     * For blending we have to make some assumptions
     * 1) all channels should have the same origins, resolutions, grid sizes,
     *    tile sizes and pixel spacings (i.e. same TileGrid).
     *    These are arrays with number of element equal the number of pyramid
     *    levels. All channels shall have the same number of levels.
     * 2) given (1), we calculcate the tileGrid, projection and rotation objects
     *    using the metadata of the first channel and subsequently apply them to
     *    all the other channels.
     * 3) If the parameters in (1) are different, it means that we would have to
     *    perfom registration, which (at least for now) is out of scope.
     */
    if (numChannels > 0) {
      const opticalPathIdentifier = monochromeOpticalPathIdentifiers[0]
      const info = monochromeImageInformation[opticalPathIdentifier]
      this[_pyramid] = _computeImagePyramid({ metadata: info.metadata })
    } else {
      const opticalPathIdentifier = colorOpticalPathIdentifiers[0]
      const info = colorImageInformation[opticalPathIdentifier]
      this[_pyramid] = _computeImagePyramid({ metadata: info.metadata })
    }

    this[_rotation] = _getRotation(this[_pyramid].metadata[0])

    /*
     * Specify projection to prevent default automatic projection
     * with the default Mercator projection.
     */
    this[_projection] = new Projection({
      code: 'DICOM',
      units: 'm',
      global: true,
      extent: this[_pyramid].extent,
      getPointResolution: (pixelRes, point) => {
        /*
         * DICOM Pixel Spacing has millimeter unit while the projection has
         * meter unit.
         */
        const spacing = getPixelSpacing(
          this[_pyramid].metadata[this[_pyramid].metadata.length - 1]
        )[0]
        return pixelRes * spacing / 10 ** 3
      }
    })

    /*
     * We need to specify the tile grid, since DICOM allows tiles to
     * have different sizes at each resolution level and a different zoom
     * factor between individual levels.
     */
    this[_tileGrid] = new TileGrid({
      extent: this[_pyramid].extent,
      origins: this[_pyramid].origins,
      resolutions: this[_pyramid].resolutions,
      sizes: this[_pyramid].gridSizes,
      tileSizes: this[_pyramid].tileSizes
    })

    const view = new View({
      center: getCenter(this[_pyramid].extent),
      projection: this[_projection],
      resolutions: this[_tileGrid].getResolutions(),
      rotation: this[_rotation],
      smoothResolutionConstraint: true,
      showFullExtent: true,
      extent: this[_pyramid].extent
    })

    this[_renderingEngine] = new RenderingEngine()

    const layers = []
    const overviewLayers = []
    this[_opticalPaths] = {}
    if (numChannels > 0) {
      for (const opticalPathIdentifier in monochromeImageInformation) {
        const info = monochromeImageInformation[opticalPathIdentifier]
        const pyramid = _computeImagePyramid({ metadata: info.metadata })
        const opticalPath = {
          opticalPathIdentifier,
          opticalPath: new OpticalPath({
            identifier: opticalPathIdentifier,
            studyInstanceUID: info.metadata[0].StudyInstanceUID,
            seriesInstanceUID: info.metadata[0].SeriesInstanceUID,
            sopInstanceUIDs: pyramid.metadata.map(element => {
              return element.SOPInstanceUID
            })
          }),
          pyramid: pyramid,
          style: {
            color: info.blendingInformation.color,
            opacity: info.blendingInformation.opacity,
            thresholdValues: info.blendingInformation.thresholdValues,
            limitValues: info.blendingInformation.limitValues
          },
          bitsAllocated: info.metadata[0].BitsAllocated,
          maxValue: Math.pow(2, info.metadata[0].BitsAllocated) - 1
        }

        const areImagePyramidsEqual = _areImagePyramidsEqual(
          opticalPath.pyramid,
          this[_pyramid]
        )
        if (!areImagePyramidsEqual) {
          throw new Error(
            `Pyramid of optical path "${opticalPathIdentifier}" ` +
            'is different from reference pyramid.'
          )
        }

        opticalPath.rasterSource = new DataTileSource({
          loader: _createTileLoadFunction({
            pyramid: opticalPath.pyramid,
            client: this[_options].client,
            retrieveRendered: this[_options].retrieveRendered,
            includeIccProfile: this[_options].includeIccProfile,
            renderingEngine: this[_renderingEngine],
            channel: opticalPathIdentifier
          }),
          crossOrigin: 'Anonymous',
          tileGrid: this[_tileGrid],
          projection: this[_projection],
          wrapX: false,
          transition: 0,
          bandCount: 1
        })

        const style = {
          color: [
            'interpolate',
            ['linear'],
            [
              '+',
              [
                '/',
                [
                  '-',
                  ['band', 1],
                  ['var', 'windowCenter']
                ],
                ['var', 'windowWidth']
              ],
              0.5
            ],
            ['var', 'lowerThreshold'],
            [0, 0, 0, 1],
            ['var', 'upperThreshold'],
            ['color', ['var', 'red'], ['var', 'green'], ['var', 'blue'], 1]
          ],
          variables: {
            lowerThreshold: opticalPath.style.thresholdValues[0],
            upperThreshold: opticalPath.style.thresholdValues[1],
            red: opticalPath.style.color[0],
            green: opticalPath.style.color[1],
            blue: opticalPath.style.color[2],
            windowCenter: (
              (
                opticalPath.style.limitValues[0] +
                opticalPath.style.limitValues[1]
              ) / 2 / opticalPath.maxValue
            ),
            windowWidth: (
              (
                opticalPath.style.limitValues[1] -
                opticalPath.style.limitValues[0]
              ) / opticalPath.maxValue
            )
          }
        }

        opticalPath.tileLayer = new TileLayer({
          extent: pyramid.extent,
          source: opticalPath.rasterSource,
          preload: 1,
          style: style
        })

        opticalPath.overviewTileLayer = new TileLayer({
          extent: pyramid.extent,
          source: opticalPath.rasterSource,
          preload: 0,
          style: style
        })

        if (info.blendingInformation.visible === true) {
          layers.push(opticalPath.tileLayer)
          opticalPath.tileLayer.setVisible(true)
          overviewLayers.push(opticalPath.overviewTileLayer)
          opticalPath.overviewTileLayer.setVisible(true)
        }

        this[_opticalPaths][opticalPathIdentifier] = opticalPath
      }
    } else {
      const opticalPathIdentifier = colorOpticalPathIdentifiers[0]
      const info = colorImageInformation[opticalPathIdentifier]
      const pyramid = _computeImagePyramid({ metadata: info.metadata })
      const opticalPath = {
        opticalPathIdentifier,
        opticalPath: new OpticalPath({
          identifier: opticalPathIdentifier,
          studyInstanceUID: info.metadata[0].StudyInstanceUID,
          seriesInstanceUID: info.metadata[0].SeriesInstanceUID,
          sopInstanceUIDs: pyramid.metadata.map(element => {
            return element.SOPInstanceUID
          })
        }),
        pyramid: pyramid,
        bitsAllocated: 8,
        maxValue: 255
      }

      opticalPath.rasterSource = new DataTileSource({
        loader: _createTileLoadFunction({
          pyramid: opticalPath.pyramid,
          client: this[_options].client,
          retrieveRendered: this[_options].retrieveRendered,
          renderingEngine: this[_renderingEngine],
          channel: opticalPathIdentifier
        }),
        crossOrigin: 'Anonymous',
        tileGrid: this[_tileGrid],
        projection: this[_projection],
        wrapX: false,
        transition: 0,
        preload: 1,
        bandCount: 4
      })

      opticalPath.tileLayer = new TileLayer({
        extent: this[_tileGrid].extent,
        source: opticalPath.rasterSource,
        preload: 1,
        useInterimTilesOnError: false
      })
      opticalPath.overviewTileLayer = new TileLayer({
        extent: pyramid.extent,
        source: opticalPath.rasterSource,
        preload: 0,
        useInterimTilesOnError: false
      })

      layers.push(opticalPath.tileLayer)
      overviewLayers.push(opticalPath.overviewTileLayer)

      this[_opticalPaths][opticalPathIdentifier] = opticalPath
    }

    const overviewView = new View({
      projection: this[_projection],
      rotation: this[_rotation],
      zoom: 0,
      minZoom: 0,
      maxZoom: 0,
      constrainOnlyCenter: true,
      center: getCenter(this[_pyramid].extent)
    })

    this[_overviewMap] = new OverviewMap({
      view: overviewView,
      layers: overviewLayers,
      collapsed: false,
      collapsible: false,
      rotateWithView: true
    })

    this[_drawingSource] = new VectorSource({
      tileGrid: this[_tileGrid],
      projection: this[_projection],
      features: this[_features],
      wrapX: false
    })
    this[_drawingLayer] = new VectorLayer({
      extent: this[_pyramid].extent,
      source: this[_drawingSource],
      projection: this[_projection],
      updateWhileAnimating: true,
      updateWhileInteracting: true
    })
    layers.push(this[_drawingLayer])

    this[_map] = new Map({
      layers,
      view,
      controls: [],
      keyboardEventTarget: document
    })

    view.fit(this[_projection].getExtent(), { size: this[_map].getSize() })

    /**
     * OpenLayer's map has default active interactions
     * https://openlayers.org/en/latest/apidoc/module-ol_interaction.html#.defaults
     *
     * We need to define them here to avoid duplications.
     * Enabling or disabling interactions could cause side effects on
     * OverviewMap since it also uses the same interactions in the map
     */
    const defaultInteractions = this[_map].getInteractions().getArray()
    this[_interactions] = {
      draw: undefined,
      select: undefined,
      translate: undefined,
      modify: undefined,
      snap: undefined,
      dragPan: defaultInteractions.find((i) => i instanceof DragPan)
    }

    this[_map].addInteraction(new MouseWheelZoom())

    this[_controls] = {
      scale: new ScaleLine({
        units: 'metric',
        className: ''
      })
    }

    if (this[_options].controls.has('fullscreen')) {
      this[_controls].fullscreen = new FullScreen()
    }

    if (this[_options].controls.has('zoom')) {
      this[_controls].zoom = new Zoom()
      this[_controls].zoomslider = new ZoomSlider()
    }

    if (this[_options].controls.has('overview')) {
      this[_controls].overview = this[_overviewMap]
    }

    for (const control in this[_controls]) {
      this[_map].addControl(this[_controls][control])
    }

    this[_annotationManager] = new _AnnotationManager({
      map: this[_map],
      pyramid: this[_pyramid].metadata,
      drawingSource: this[_drawingSource]
    })
  }

  /** Set the style of an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @param {object} styleOptions
   * @param {number[]} styleOptions.color - RGB color triplet
   * @param {number} styleOptions.opacity - Opacity
   * @param {number[]} styleOptions.thresholdValues - Upper and lower clipping values
   * @param {number[]} styleOptions.limitValues - Upper and lower clipping values
   */
  setOpticalPathStyle (opticalPathIdentifier, styleOptions = {}) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot set optical path style. Could not find optical path ' +
        `"${opticalPathIdentifier}".`
      )
    }

    if (Object.entries(styleOptions).length === 0) {
      return
    }

    console.info(
      `set style for optical path ${opticalPathIdentifier}`,
      styleOptions
    )
    if (styleOptions.opacity != null) {
      opticalPath.style.opacity = styleOptions.opacity
      opticalPath.tileLayer.setOpacity(styleOptions.opacity)
      opticalPath.overviewTileLayer.setOpacity(styleOptions.opacity)
    }

    const styleVariables = {}
    if (styleOptions.color != null) {
      opticalPath.style.color = styleOptions.color
      styleVariables.red = opticalPath.style.color[0]
      styleVariables.green = opticalPath.style.color[1]
      styleVariables.blue = opticalPath.style.color[2]
    }
    if (styleOptions.thresholdValues != null) {
      opticalPath.style.thresholdValues = styleOptions.thresholdValues
      styleVariables.lowerThreshold = styleOptions.thresholdValues[0]
      styleVariables.upperThreshold = styleOptions.thresholdValues[1]
    }
    if (styleOptions.limitValues != null) {
      const max = opticalPath.maxValue
      opticalPath.style.limitValues = styleOptions.limitValues
      styleVariables.windowCenter = (
        (styleOptions.limitValues[0] + styleOptions.limitValues[1]) /
        2 /
        max
      )
      styleVariables.windowWidth = (
        (styleOptions.limitValues[1] - styleOptions.limitValues[0]) /
        max
      )
    }
    opticalPath.tileLayer.updateStyleVariables(styleVariables)
    opticalPath.overviewTileLayer.updateStyleVariables(styleVariables)
  }

  /** Get the style of an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @return {object} Style of optical path
   */
  getOpticalPathStyle (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot get optical path style. Could not find optical path ' +
        `"${opticalPathIdentifier}".`
      )
    }
    return {
      color: opticalPath.style.color,
      opacity: opticalPath.style.opacity,
      thresholdValues: opticalPath.style.thresholdValues,
      limitValues: opticalPath.style.limitValues
    }
  }

  /**
   * Get all optical paths.
   *
   * @return {OpticalPath[]}
   */
  getAllOpticalPaths () {
    const opticalPaths = []
    for (const opticalPathIdentifier in this[_opticalPaths]) {
      opticalPaths.push(this[_opticalPaths][opticalPathIdentifier].opticalPath)
    }
    return opticalPaths
  }

  /** Activate an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   */
  activateOpticalPath (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot activate optical path. Could not find optical path ' +
        `"${opticalPathIdentifier}".`
      )
    }
    if (this.isOpticalPathActive(opticalPathIdentifier)) {
      return
    }
    this[_map].getLayers().insertAt(
      0,
      opticalPath.tileLayer
    )
    this[_overviewMap].getOverviewMap().getLayers().insertAt(
      0,
      opticalPath.overviewTileLayer
    )
  }

  /** Deactivate an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   */
  deactivateOpticalPath (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot deactivate optical path. Could not find optical path ' +
        `"${opticalPathIdentifier}".`
      )
    }
    if (!this.isOpticalPathActive(opticalPathIdentifier)) {
      return
    }
    this[_map].removeLayer(opticalPath.tileLayer)
    opticalPath.tileLayer.dispose()
    this[_overviewMap].getOverviewMap().removeLayer(opticalPath.overviewTileLayer)
    opticalPath.overviewTileLayer.dispose()
  }

  /** Determine whether an optical path is active.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @return {boolean} active
   */
  isOpticalPathActive (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      return false
    }
    return !!this[_map].getLayers().getArray().find(layer => {
      return layer === opticalPath.tileLayer
    })
  }

  /** Show an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @param {object} styleOptions
   * @param {number[]} styleOptions.color - RGB color triplet
   * @param {number} styleOptions.opacity - Opacity
   * @param {number[]} styleOptions.thresholdValues - Upper and lower clipping values
   * @param {number[]} styleOptions.limitValues - Upper and lower clipping values
   */
  showOpticalPath (opticalPathIdentifier, styleOptions = {}) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot show optical path. Could not find optical path ' +
        `"${opticalPathIdentifier}".`
      )
    }
    console.info(`show optical path #${opticalPathIdentifier}`)
    if (!this.isOpticalPathActive(opticalPathIdentifier)) {
      this.activateOpticalPath(opticalPathIdentifier)
    }
    opticalPath.tileLayer.setVisible(true)
    opticalPath.overviewTileLayer.setVisible(true)
    this.setOpticalPathStyle(opticalPathIdentifier, styleOptions)
  }

  /** Hide an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   */
  hideOpticalPath (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot hide optical path. Could not find optical path ' +
        `"${opticalPathIdentifier}".`
      )
    }
    opticalPath.tileLayer.setVisible(false)
    opticalPath.overviewTileLayer.setVisible(false)
  }

  /**
   * Determine if an optical path is visible.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @returns {boolean}
   */
  isOpticalPathVisible (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot show optical path. Could not find optical path ' +
        `"${opticalPathIdentifier}".`
      )
    }
    return opticalPath.tileLayer.getVisible()
  }

  /**
   * Resize the viewer to fit the viewport.
   *
   * @returns {void}
   */
  resize () {
    this[_map].updateSize()
  }

  /**
   * Get the size of the viewport.
   *
   * @return {number[]}
   */
  get size () {
    return this[_map].getSize()
  }

  /**
   * Render the images in the specified viewport container.
   *
   * @param {object} options - Rendering options.
   * @param {(string|HTMLElement)} options.container - HTML Element in which the viewer should be injected.
   */
  render (options) {
    if (!('container' in options)) {
      console.error('container must be provided for rendering images')
    }
    this[_map].setTarget(options.container)
    const view = this[_map].getView()
    const projection = view.getProjection()
    view.fit(projection.getExtent(), { size: this[_map].getSize() })

    // Style scale element (overriding default Openlayers CSS "ol-scale-line")
    const scaleElement = this[_controls].scale.element
    scaleElement.style.position = 'absolute'
    scaleElement.style.right = '.5em'
    scaleElement.style.bottom = '.5em'
    scaleElement.style.left = 'auto'
    scaleElement.style.padding = '2px'
    scaleElement.style.backgroundColor = 'rgba(255,255,255,.5)'
    scaleElement.style.borderRadius = '4px'
    scaleElement.style.margin = '1px'

    const scaleInnerElement = this[_controls].scale.innerElement_
    scaleInnerElement.style.color = 'black'
    scaleInnerElement.style.fontWeight = '600'
    scaleInnerElement.style.fontSize = '10px'
    scaleInnerElement.style.textAlign = 'center'
    scaleInnerElement.style.borderWidth = '1.5px'
    scaleInnerElement.style.borderStyle = 'solid'
    scaleInnerElement.style.borderTop = 'none'
    scaleInnerElement.style.borderRightColor = 'black'
    scaleInnerElement.style.borderLeftColor = 'black'
    scaleInnerElement.style.borderBottomColor = 'black'
    scaleInnerElement.style.margin = '1px'
    scaleInnerElement.style.willChange = 'contents,width'

    const overviewElement = this[_overviewMap].element
    const overviewmapElement = Object.values(overviewElement.children).find(
      c => c.className === 'ol-overviewmap-map'
    )
    overviewmapElement.style.border = '1px solid black'
    // Try to fit the overview map into the target control overlay container
    const height = Math.abs(this[_pyramid].extent[1])
    const width = Math.abs(this[_pyramid].extent[2])
    const rotation = this[_rotation] / Math.PI * 180
    const windowSize = _getWindowSize()
    let targetHeight
    let resizeFactor
    let targetWidth
    if (Math.abs(rotation - 180) < 0.01 || Math.abs(rotation - 0) < 0.01) {
      if (windowSize[1] > windowSize[0]) {
        targetHeight = Math.ceil(windowSize[1] * 0.2)
        resizeFactor = targetHeight / height
        targetWidth = width * resizeFactor
      } else {
        targetWidth = Math.ceil(windowSize[0] * 0.15)
        resizeFactor = targetWidth / width
        targetHeight = height * resizeFactor
      }
    } else {
      if (windowSize[1] > windowSize[0]) {
        targetHeight = Math.ceil(windowSize[1] * 0.2)
        resizeFactor = targetHeight / width
        targetWidth = height * resizeFactor
      } else {
        targetWidth = Math.ceil(windowSize[0] * 0.15)
        resizeFactor = targetWidth / height
        targetHeight = width * resizeFactor
      }
    }
    overviewmapElement.style.width = `${targetWidth}px`
    overviewmapElement.style.height = `${targetHeight}px`

    const container = this[_map].getTargetElement()

    this[_drawingSource].on(VectorEventType.ADDFEATURE, (e) => {
      publish(
        container,
        EVENT.ROI_ADDED,
        this._getROIFromFeature(e.feature, this[_pyramid].metadata)
      )
    })

    this[_drawingSource].on(VectorEventType.CHANGEFEATURE, (e) => {
      if (e.feature !== undefined || e.feature !== null) {
        const geometry = e.feature.getGeometry()
        const type = geometry.getType()
        // The first and last point of a polygon must be identical. The last point
        // is an implementation detail and is hidden from the user in the graphical
        // interface. However, we must update the last point in case the first
        // point has been modified by the user.
        if (type === 'Polygon') {
          // NOTE: Polygon in GeoJSON format contains an array of geometries,
          // where the first element represents the coordinates of the outer ring
          // and the second element represents the coordinates of the inner ring
          // (in our case the inner ring should not be present).
          const layout = geometry.getLayout()
          const coordinates = geometry.getCoordinates()
          const firstPoint = coordinates[0][0]
          const lastPoint = coordinates[0][coordinates[0].length - 1]
          if (
            firstPoint[0] !== lastPoint[0] ||
            firstPoint[1] !== lastPoint[1]
          ) {
            coordinates[0][coordinates[0].length - 1] = firstPoint
            geometry.setCoordinates(coordinates, layout)
            e.feature.setGeometry(geometry)
          }
        }
      }
      publish(
        container,
        EVENT.ROI_MODIFIED,
        this._getROIFromFeature(e.feature, this[_pyramid].metadata)
      )
    })

    this[_drawingSource].on(VectorEventType.REMOVEFEATURE, (e) => {
      publish(
        container,
        EVENT.ROI_REMOVED,
        this._getROIFromFeature(e.feature, this[_pyramid].metadata)
      )
    })
  }

  /** Activate the draw interaction for graphic annotation of regions of interest.
   *
   * @param {object} options - Drawing options
   * @param {string} options.geometryType - Name of the geometry type (point, circle, box, polygon, freehandPolygon, line, freehandLine)
   * @param {string} options.marker - Marker
   * @param {string} options.markup - Markup
   * @param {number} options.maxPoints - Geometry max points
   * @param {number} options.minPoints - Geometry min points
   * @param {boolean} options.vertexEnabled - Enable vertex
   * @param {object} options.styleOptions - Style options
   * @param {object} options.styleOptions.stroke - Style options for the outline of the geometry
   * @param {number[]} options.styleOptions.stroke.color - RGBA color of the outline
   * @param {number} options.styleOptions.stroke.width - Width of the outline
   * @param {object} options.styleOptions.fill - Style options for body the geometry
   * @param {number[]} options.styleOptions.fill.color - RGBA color of the body
   * @param {object} options.styleOptions.image - Style options for image
   */
  activateDrawInteraction (options = {}) {
    this.deactivateDrawInteraction()
    console.info('activate "draw" interaction')

    const geometryOptionsMapping = {
      point: {
        type: 'Point',
        geometryName: 'Point'
      },
      circle: {
        type: 'Circle',
        geometryName: 'Circle'
      },
      box: {
        type: 'Circle',
        geometryName: 'Box',
        geometryFunction: createRegularPolygon(4)
      },
      polygon: {
        type: 'Polygon',
        geometryName: 'Polygon',
        freehand: false
      },
      freehandpolygon: {
        type: 'Polygon',
        geometryName: 'FreeHandPolygon',
        freehand: true
      },
      line: {
        type: 'LineString',
        geometryName: 'Line',
        freehand: false,
        maxPoints: options.maxPoints,
        minPoints: options.minPoints
      },
      freehandline: {
        type: 'LineString',
        geometryName: 'FreeHandLine',
        freehand: true
      }
    }

    if (!('geometryType' in options)) {
      console.error('geometry type must be specified for drawing interaction')
    }

    if (!(options.geometryType in geometryOptionsMapping)) {
      console.error(`unsupported geometry type "${options.geometryType}"`)
    }

    const internalDrawOptions = { source: this[_drawingSource] }
    const geometryDrawOptions = geometryOptionsMapping[options.geometryType]
    const builtInDrawOptions = {
      [Enums.InternalProperties.Marker]:
        options[Enums.InternalProperties.Marker],
      [Enums.InternalProperties.Markup]:
        options[Enums.InternalProperties.Markup],
      vertexEnabled: options.vertexEnabled,
      [Enums.InternalProperties.Label]: options[Enums.InternalProperties.Label]
    }
    const drawOptions = Object.assign(
      internalDrawOptions,
      geometryDrawOptions,
      builtInDrawOptions
    )

    /**
     * This used to define which mouse buttons will fire the action.
     *
     * bindings: {
     *   mouseButtons can be 'left', 'right' and/or 'middle'. if absent, the action is bound to all mouse buttons.
     *   mouseButtons: ['left', 'right'],
     *   modifierKey can be 'shift', 'ctrl' or 'alt'. If not present, the action is bound to no modifier key.
     *   modifierKey: 'ctrl' // The modifier
     * },
     */
    if (options.bindings) {
      drawOptions.condition = _getInteractionBindingCondition(options.bindings)
    }

    this[_interactions].draw = new Draw(drawOptions)
    const container = this[_map].getTargetElement()

    this[_interactions].draw.on(Enums.InteractionEvents.DRAW_START, (event) => {
      event.feature.setProperties(builtInDrawOptions, true)
      event.feature.setId(generateUID())

      /** Set external styles before calling internal annotation hooks */
      _setFeatureStyle(
        event.feature,
        options[Enums.InternalProperties.StyleOptions]
      )

      this[_annotationManager].onDrawStart(event)

      _wireMeasurementsAndQualitativeEvaluationsEvents(
        this[_map],
        event.feature,
        this[_pyramid].metadata
      )
    })

    this[_interactions].draw.on(Enums.InteractionEvents.DRAW_ABORT, (event) => {
      this[_annotationManager].onDrawAbort(event)
    })

    this[_interactions].draw.on(Enums.InteractionEvents.DRAW_END, (event) => {
      this[_annotationManager].onDrawEnd(event)
      publish(
        container,
        EVENT.ROI_DRAWN,
        this._getROIFromFeature(event.feature, this[_pyramid].metadata)
      )
    })

    this[_map].addInteraction(this[_interactions].draw)
  }

  /**
   * Deactivate draw interaction.
   */
  deactivateDrawInteraction () {
    console.info('deactivate "draw" interaction')
    if (this[_interactions].draw !== undefined) {
      this[_map].removeInteraction(this[_interactions].draw)
      this[_interactions].draw = undefined
    }
  }

  /**
   * Whether draw interaction is active
   *
   * @return {boolean}
   */
  get isDrawInteractionActive () {
    return this[_interactions].draw !== undefined
  }

  /**
   * Whether dragPan interaction is active.
   *
   * @type {boolean}
   */
  get isDragPanInteractionActive () {
    return this[_interactions].dragPan !== undefined
  }

  /**
   * Whether dragZoom interaction is active.
   *
   * @type {boolean}
   */
  get isDragZoomInteractionActive () {
    return this[_interactions].dragZoom !== undefined
  }

  /**
   * Whether translate interaction is active.
   *
   * @type {boolean}
   */
  get isTranslateInteractionActive () {
    return this[_interactions].translate !== undefined
  }

  /**
   * Activate translate interaction.
   *
   * @param {Object} options - Translation options.
   */
  activateTranslateInteraction (options = {}) {
    this.deactivateTranslateInteraction()

    console.info('activate "translate" interaction')

    const translateOptions = { layers: [this[_drawingLayer]] }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      translateOptions.condition = _getInteractionBindingCondition(
        options.bindings
      )
    }

    this[_interactions].translate = new Translate(translateOptions)

    this[_map].addInteraction(this[_interactions].translate)
  }

  /**
   * Extract and transform the region of interest (ROI).
   *
   * @param {object} feature - Openlayers Feature
   * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
   * @param {Object} context - Context
   * @returns {ROI} Region of interest
   * @private
   */
  _getROIFromFeature (feature, pyramid) {
    if (feature !== undefined && feature !== null) {
      let scoord3d
      try {
        scoord3d = geometry2Scoord3d(feature, pyramid)
      } catch (error) {
        const uid = feature.getId()
        this.removeROI(uid)
        throw error
      }

      const properties = feature.getProperties()
      // Remove geometry from properties mapping
      const geometryName = feature.getGeometryName()
      delete properties[geometryName]
      const uid = feature.getId()
      const roi = new ROI({ scoord3d, properties, uid })
      return roi
    }
  }

  /**
   * Toggle overview map.
   *
   * @returns {void}
   */
  toggleOverviewMap () {
    const controls = this[_map].getControls()
    const overview = controls.getArray().find((c) => c === this[_overviewMap])
    if (overview) {
      this[_map].removeControl(this[_overviewMap])
      return
    }
    this[_map].addControl(this[_overviewMap])
    const map = this[_overviewMap].getOverviewMap()
    const view = map.getView()
    const projection = view.getProjection()
    view.fit(projection.getExtent(), { size: map.getSize() })
  }

  /**
   * Deactivate translate interaction.
   *
   * @returns {void}
   */
  deactivateTranslateInteraction () {
    console.info('deactivate "translate" interaction')
    if (this[_interactions].translate) {
      this[_map].removeInteraction(this[_interactions].translate)
      this[_interactions].translate = undefined
    }
  }

  /**
   * Activate dragZoom interaction.
   *
   * @param {object} options - DragZoom options.
   */
  activateDragZoomInteraction (options = {}) {
    this.deactivateDragZoomInteraction()

    console.info('activate "dragZoom" interaction')

    const dragZoomOptions = { layers: [this[_drawingLayer]] }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      dragZoomOptions.condition = _getInteractionBindingCondition(
        options.bindings
      )
    }

    this[_interactions].dragZoom = new DragZoom(dragZoomOptions)

    this[_map].addInteraction(this[_interactions].dragZoom)
  }

  /**
   * Deactivate dragZoom interaction.
   */
  deactivateDragZoomInteraction () {
    console.info('deactivate "dragZoom" interaction')
    if (this[_interactions].dragZoom) {
      this[_map].removeInteraction(this[_interactions].dragZoom)
      this[_interactions].dragZoom = undefined
    }
  }

  /**
   * Activate select interaction.
   *
   * @param {object} options selection options.
   */
  activateSelectInteraction (options = {}) {
    this.deactivateSelectInteraction()

    console.info('activate "select" interaction')

    const selectOptions = { layers: [this[_drawingLayer]] }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      selectOptions.condition = _getInteractionBindingCondition(
        options.bindings
      )
    }

    this[_interactions].select = new Select(selectOptions)

    const container = this[_map].getTargetElement()

    this[_interactions].select.on('select', (e) => {
      publish(
        container,
        EVENT.ROI_SELECTED,
        this._getROIFromFeature(e.selected[0], this[_pyramid].metadata)
      )
    })

    this[_map].addInteraction(this[_interactions].select)
  }

  /**
   * Deactivate select interaction.
   */
  deactivateSelectInteraction () {
    console.info('deactivate "select" interaction')
    if (this[_interactions].select) {
      this[_map].removeInteraction(this[_interactions].select)
      this[_interactions].select = undefined
    }
  }

  /**
   * Activate dragpan interaction.
   *
   * @param {Object} options - DragPan options.
   */
  activateDragPanInteraction (options = {}) {
    this.deactivateDragPanInteraction()

    console.info('activate "drag pan" interaction')

    const dragPanOptions = {
      features: this[_features]
    }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      dragPanOptions.condition = _getInteractionBindingCondition(
        options.bindings
      )
    }

    this[_interactions].dragPan = new DragPan(dragPanOptions)

    this[_map].addInteraction(this[_interactions].dragPan)
  }

  /**
   * Deactivate dragpan interaction.
   */
  deactivateDragPanInteraction () {
    console.info('deactivate "drag pan" interaction')
    if (this[_interactions].dragPan) {
      this[_map].removeInteraction(this[_interactions].dragPan)
      this[_interactions].dragPan = undefined
    }
  }

  /**
   * Activate snap interaction.
   *
   * @param {Object} options - Snap options.
   */
  activateSnapInteraction (options = {}) {
    this.deactivateSnapInteraction()
    console.info('activate "snap" interaction')
    this[_interactions].snap = new Snap({
      source: this[_drawingSource]
    })

    this[_map].addInteraction(this[_interactions].snap)
  }

  /**
   * Deactivate snap interaction.
   */
  deactivateSnapInteraction () {
    console.info('deactivate "snap" interaction')
    if (this[_interactions].snap) {
      this[_map].removeInteraction(this[_interactions].snap)
      this[_interactions].snap = undefined
    }
  }

  /**
   * Whether select interaction is active.
   *
   * @return {boolean}
   */
  get isSelectInteractionActive () {
    return this[_interactions].select !== undefined
  }

  /** Activate modify interaction.
   *
   * @param {object} options - Modification options.
   */
  activateModifyInteraction (options = {}) {
    this.deactivateModifyInteraction()

    console.info('activate "modify" interaction')

    const modifyOptions = {
      features: this[_features],
      insertVertexCondition: ({ feature }) =>
        feature && feature.get('vertexEnabled') === true
    }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      modifyOptions.condition = _getInteractionBindingCondition(
        options.bindings
      )
    }

    this[_interactions].modify = new Modify(modifyOptions)

    this[_map].addInteraction(this[_interactions].modify)
  }

  /**
   * Deactivate modify interaction.
   */
  deactivateModifyInteraction () {
    console.info('deactivate "modify" interaction')
    if (this[_interactions].modify) {
      this[_map].removeInteraction(this[_interactions].modify)
      this[_interactions].modify = undefined
    }
  }

  /**
   * Whether modify interaction is active.
   *
   * @return {boolean}
   */
  get isModifyInteractionActive () {
    return this[_interactions].modify !== undefined
  }

  /**
   * Get all annotated regions of interest.
   *
   * @returns {ROI[]} Array of regions of interest.
   */
  getAllROIs () {
    console.info('get all ROIs')
    const rois = []
    this[_features].forEach((item) => {
      rois.push(this.getROI(item.getId()))
    })
    return rois
  }

  collapseOverviewMap () {
    this[_overviewMap].setCollapsed(true)
  }

  expandOverviewMap () {
    this[_overviewMap].setCollapsed(true)
  }

  /**
   * Number of annotated regions of interest.
   *
   * @return {number}
   */
  get numberOfROIs () {
    return this[_features].getLength()
  }

  /**
   * Get an individual annotated regions of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @returns {ROI} Regions of interest.
   */
  getROI (uid) {
    console.info(`get ROI ${uid}`)
    const feature = this[_drawingSource].getFeatureById(uid)
    return this._getROIFromFeature(feature, this[_pyramid].metadata)
  }

  /**
   * Add a measurement to a region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @param {object} item - NUM content item representing a measurement
   */
  addROIMeasurement (uid, item) {
    this[_features].forEach((feature) => {
      const id = feature.getId()
      if (id === uid) {
        const properties = feature.getProperties()
        if (!(Enums.InternalProperties.Measurements in properties)) {
          properties[Enums.InternalProperties.Measurements] = [item]
        } else {
          properties[Enums.InternalProperties.Measurements].push(item)
        }
        feature.setProperties(properties, true)
      }
    })
  }

  /**
   * Add a qualitative evaluation to a region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @param {object} item - CODE content item representing a qualitative evaluation
   */
  addROIEvaluation (uid, item) {
    const meaning = item.ConceptNameCodeSequence[0].CodeMeaning
    console.info(`add qualitative evaluation "${meaning}" to ROI ${uid}`)
    this[_features].forEach((feature) => {
      const id = feature.getId()
      if (id === uid) {
        const properties = feature.getProperties()
        if (!(Enums.InternalProperties.Evaluations in properties)) {
          properties[Enums.InternalProperties.Evaluations] = [item]
        } else {
          properties[Enums.InternalProperties.Evaluations].push(item)
        }
        feature.setProperties(properties, true)
      }
    })
  }

  /** Pop the most recently annotated regions of interest.
   *
   * @returns {ROI} Regions of interest.
   */
  popROI () {
    console.info('pop ROI')
    const feature = this[_features].pop()
    return this._getROIFromFeature(feature, this[_pyramid].metadata)
  }

  /**
   * Add a regions of interest.
   *
   * @param {ROI} roi - Regions of interest
   * @param {object} styleOptions - Style options
   * @param {object} styleOptions.stroke - Style options for the outline of the geometry
   * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
   * @param {number} styleOptions.stroke.width - Width of the outline
   * @param {object} styleOptions.fill - Style options for body the geometry
   * @param {number[]} styleOptions.fill.color - RGBA color of the body
   * @param {object} styleOptions.image - Style options for image
   *
   */
  addROI (roi, styleOptions) {
    console.info(`add ROI ${roi.uid}`)
    const geometry = scoord3d2Geometry(roi.scoord3d, this[_pyramid].metadata)
    const featureOptions = { geometry }

    const feature = new Feature(featureOptions)
    _addROIPropertiesToFeature(feature, roi.properties, true)
    feature.setId(roi.uid)

    _wireMeasurementsAndQualitativeEvaluationsEvents(
      this[_map],
      feature,
      this[_pyramid].metadata
    )

    this[_features].push(feature)

    _setFeatureStyle(feature, styleOptions)
    const isVisible = Object.keys(styleOptions).length !== 0
    this[_annotationManager].setMarkupVisibility(roi.uid, isVisible)
  }

  /**
   * Add segments.
   *
   * @param {Segmentation[]} metadata - Metadata of DICOM Segmentation instances
   */
  addSegments (metadata) {
    if (metadata.length === 0) {
      throw new Error(
        'Metadata of Segmentation instances needs to be provided to ' +
        'add segments.'
      )
    }

    const refSegmentation = metadata[0]
    const refImage = this[_pyramid].metadata[0]
    metadata.forEach(instance => {
      if (
        instance.TotalPixelMatrixColumns === undefined ||
        instance.TotalPixelMatrixRows === undefined
      ) {
        const numberOfFrames = Number(instance.NumberOfFrames)
        if (numberOfFrames === 1) {
          /*
           * If the image contains only one frame it is not tiled, and therefore
           * the size of the total pixel matrix equals the size of the frame.
           */
          instance.TotalPixelMatrixRows = instance.Rows
          instance.TotalPixelMatrixColumns = instance.Columns
        } else {
          throw new Error(
            'Segmentation instances must contain attributes ' +
            '"Total Pixel Matrix Rows" and "Total Pixel Matrix Columns".'
          )
        }
      }
      if (refImage.FrameOfReferenceUID !== instance.FrameOfReferenceUID) {
        throw new Error(
          'Segmentation instances must have the same Frame of Reference UID ' +
          'as the corresponding source images.'
        )
      }
      if (refSegmentation.FrameOfReferenceUID !== instance.FrameOfReferenceUID) {
        throw new Error(
          'Segmentation instances must all have same Frame of Reference UID.'
        )
      }
      if (refSegmentation.SeriesInstanceUID !== instance.SeriesInstanceUID) {
        throw new Error(
          'Segmentation instances must all have same Series Instance UID.'
        )
      }
      if (
        refSegmentation.SegmentSequence.length !==
        instance.SegmentSequence.length
      ) {
        throw new Error(
          'Segmentation instances must all contain the same number of items ' +
          'in the Segment Sequence.'
        )
      }
    })
    console.info(
      'add segments of Segmentation instances of series ' +
      `"${refSegmentation.SeriesInstanceUID}"`
    )

    const pyramid = _computeImagePyramid({ metadata })
    const fittedPyramid = _fitImagePyramid(pyramid, this[_pyramid])

    const tileGrid = new TileGrid({
      extent: fittedPyramid.extent,
      origins: fittedPyramid.origins,
      resolutions: fittedPyramid.resolutions,
      sizes: fittedPyramid.gridSizes,
      tileSizes: fittedPyramid.tileSizes
    })

    const refInstance = pyramid.metadata[0]
    for (let i = 0; i < refInstance.SegmentSequence.length; i++) {
      const segmentItem = refInstance.SegmentSequence[i]
      const segmentNumber = Number(segmentItem.SegmentNumber)
      console.info(`add segment # ${segmentNumber}`)
      let segmentUID = generateUID()
      if (segmentItem.UniqueTrackingIdentifier) {
        segmentUID = segmentItem.UniqueTrackingIdentifier
      }

      const rasterSource = new DataTileSource({
        loader: _createTileLoadFunction({
          pyramid: fittedPyramid,
          client: this[_options].client,
          retrieveRendered: this[_options].retrieveRendered,
          renderingEngine: this[_renderingEngine],
          channel: segmentNumber
        }),
        crossOrigin: 'Anonymous',
        tileGrid: tileGrid,
        projection: this[_projection],
        wrapX: false,
        transition: 0,
        bandCount: 1
      })

      const colormap = createColorMap({
        name: ColorMapNames.VIRIDIS,
        bins: 50
      })
      const colorTable = createColorTable({
        colormap: colormap,
        min: 0,
        max: 1
      })
      const layer = new TileLayer({
        source: rasterSource,
        extent: this[_pyramid].extent,
        projection: this[_projection],
        visible: false,
        opacity: 1,
        preload: 0,
        style: {
          color: [
            'interpolate',
            ['linear'],
            ['band', 1],
            ...colorTable
          ]
        }
      })

      this[_segments][segmentUID] = {
        segment: new Segment({
          uid: segmentUID,
          number: segmentNumber,
          label: segmentItem.SegmentLabel,
          algorithmType: segmentItem.SegmentAlgorithmType,
          algorithmName: segmentItem.SegmentAlgorithmName || '',
          propertyCategory: segmentItem.SegmentedPropertyCategoryCodeSequence[0],
          propertyType: segmentItem.SegmentedPropertyTypeCodeSequence[0],
          studyInstanceUID: refInstance.StudyInstanceUID,
          seriesInstanceUID: refInstance.SeriesInstanceUID,
          sopInstanceUIDs: pyramid.metadata.map(element => {
            return element.SOPInstanceUID
          })
        }),
        segmentationType: refInstance.SegmentationType,
        rasterSource: rasterSource,
        tileLayer: layer,
        overlay: null,
        colormap: colormap
      }

      this[_map].addLayer(layer)
    }
  }

  /**
   * Remove a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of a segment
   */
  removeSegment (segmentUID) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        `Cannot remove segment. Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]
    this[_map].removeLayer(segment.tileLayer)
    segment.tileLayer.dispose()
    this[_map].removeOverlay(segment.overlay)
    delete this[_segments][segmentUID]
  }

  /**
   * Show a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of a segment
   * @param {object} styleOptions
   * @param {number} styleOptions.opacity - Opacity
   */
  showSegment (segmentUID, styleOptions = {}) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        `Cannot show segment. Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]
    console.info(`show segment #${segmentUID}`)
    segment.tileLayer.setVisible(true)
    this.setSegmentStyle(segmentUID, styleOptions)
  }

  /**
   * Hide a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of a segment
   */
  hideSegment (segmentUID) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        `Cannot hide segment. Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]
    console.info(`hide segment #${segmentUID}`)
    segment.tileLayer.setVisible(false)
    this[_map].removeOverlay(segment.overlay)
  }

  /**
   * Determine if segment is visible.
   *
   * @param {string} segmentUID - Unique tracking identifier of a segment
   * @returns {boolean}
   */
  isSegmentVisible (segmentUID) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        'Cannot determine if segment is visible. ' +
        `Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]
    return segment.tileLayer.getVisible()
  }

  /** Set the style of a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   * @param {object} styleOptions
   * @param {string} styleOptions.colormap - Name of the color map
   * @param {number} styleOptions.opacity - Opacity
   */
  setSegmentStyle (segmentUID, styleOptions) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        'Cannot set style of segment. ' +
        `Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]

    if (styleOptions.opacity != null) {
      segment.tileLayer.setOpacity(styleOptions.opacity)
    }

    segment.overlay = new Overlay({
      element: document.createElement('div'),
      offset: [5, 5]
    })

    const overlayElement = segment.overlay.getElement()
    overlayElement.innerHTML = segment.segment.propertyType.CodeMeaning
    overlayElement.style = {}
    overlayElement.style.display = 'flex'
    overlayElement.style.flexDirection = 'column'
    overlayElement.style.padding = '4px'
    overlayElement.style.backgroundColor = 'rgba(255, 255, 255, .5)'
    overlayElement.style.borderRadius = '4px'
    overlayElement.style.margin = '1px'
    overlayElement.style.color = 'black'
    overlayElement.style.fontWeight = '600'
    overlayElement.style.fontSize = '12px'
    overlayElement.style.textAlign = 'center'

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const height = 15
    const width = 5
    context.canvas.height = height
    context.canvas.width = width

    const colors = segment.colormap
    for (let j = 0; j < colors.length; j++) {
      const color = colors[colors.length - j - 1]
      const r = color[0]
      const g = color[1]
      const b = color[2]
      context.fillStyle = `rgb(${r}, ${g}, ${b})`
      context.fillRect(0, height / colors.length * j, width, 1)
    }
    overlayElement.appendChild(canvas)

    const parentElement = overlayElement.parentNode
    parentElement.style.display = 'inline'

    this[_map].addOverlay(segment.overlay)
  }

  /** Get the style of a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   * @returns {object} Style Options
   */
  getSegmentStyle (segmentUID, styleOptions) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        'Cannot get style of segment. ' +
        `Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]

    return { opacity: segment.tileLayer.getOpacity() }
  }

  /**
   * Get all segments.
   *
   * @return {Segment[]}
   */
  getAllSegments () {
    const segments = []
    for (const segmentUID in this[_segments]) {
      segments.push(this[_segments][segmentUID].segment)
    }
    return segments
  }

  /**
   * Add mappings.
   *
   * @param {ParametricMap[]} metadata - Metadata of DICOM Parametric Map instances
   */
  addMappings (metadata) {
    if (metadata.length === 0) {
      throw new Error(
        'Metadata of Parametric Map instances needs to be provided to ' +
        'add mappings.'
      )
    }

    const refParametricMap = metadata[0]
    const refImage = this[_pyramid].metadata[0]
    metadata.forEach(instance => {
      if (
        instance.TotalPixelMatrixColumns === undefined ||
        instance.TotalPixelMatrixRows === undefined
      ) {
        throw new Error(
          'Parametric Map instances must contain attributes ' +
          '"Total Pixel Matrix Rows" and "Total Pixel Matrix Columns".'
        )
      }
      if (refImage.FrameOfReferenceUID !== instance.FrameOfReferenceUID) {
        throw new Error(
          'Parametric Map instances must have the same Frame of Reference UID ' +
          'as the corresponding source images.'
        )
      }
      if (refParametricMap.FrameOfReferenceUID !== instance.FrameOfReferenceUID) {
        throw new Error(
          'Parametric Map instances must all have same Frame of Reference UID.'
        )
      }
      if (refParametricMap.SeriesInstanceUID !== instance.SeriesInstanceUID) {
        throw new Error(
          'Parametric Map instances must all have same Series Instance UID.'
        )
      }
    })
    console.info(
      'add mappings of Parametric Map instances of series ' +
      `"${refParametricMap.SeriesInstanceUID}"`
    )

    const pyramid = _computeImagePyramid({ metadata })
    const fittedPyramid = _fitImagePyramid(pyramid, this[_pyramid])

    const tileGrid = new TileGrid({
      extent: fittedPyramid.extent,
      origins: fittedPyramid.origins,
      resolutions: fittedPyramid.resolutions,
      sizes: fittedPyramid.gridSizes,
      tileSizes: fittedPyramid.tileSizes
    })

    const refInstance = pyramid.metadata[0]
    for (let i = 0; i < pyramid.numberOfChannels; i++) {
      const mappingNumber = i + 1
      const mappingLabel = `${mappingNumber}`
      const mappingUID = generateUID()

      const rasterSource = new DataTileSource({
        loader: _createTileLoadFunction({
          pyramid: fittedPyramid,
          client: this[_options].client,
          retrieveRendered: this[_options].retrieveRendered,
          renderingEngine: this[_renderingEngine],
          channel: mappingNumber
        }),
        crossOrigin: 'Anonymous',
        tileGrid: tileGrid,
        projection: this[_projection],
        wrapX: false,
        transition: 0,
        bandCount: 1
      })

      // TODO: choose color map based on
      // Real World Value First/Last Value Mapped
      const firstValueMapped = 0
      const lastValueMapped = 1
      let colormap
      if (firstValueMapped < 0 && lastValueMapped > 0) {
        colormap = createColorMap({
          name: ColorMapNames.BLUE_RED,
          bins: 50
        })
      } else {
        colormap = createColorMap({
          name: ColorMapNames.INFERNO,
          bins: 50
        })
      }
      const colorTable = createColorTable({
        colormap: colormap,
        min: 0,
        max: 1
      })
      const layer = new TileLayer({
        source: rasterSource,
        extent: this[_pyramid].extent,
        projection: this[_projection],
        visible: false,
        opacity: 1,
        preload: 1,
        style: {
          color: [
            'interpolate',
            ['linear'],
            ['band', 1], // FIXME: Real World Value Mapping Sequence
            ...colorTable
          ]
        }
      })
      this[_map].addLayer(layer)

      this[_mappings][mappingUID] = {
        mapping: new Mapping({
          uid: mappingUID,
          number: mappingNumber,
          label: mappingLabel,
          studyInstanceUID: refInstance.StudyInstanceUID,
          seriesInstanceUID: refInstance.SeriesInstanceUID,
          sopInstanceUIDs: pyramid.metadata.map(element => {
            return element.SOPInstanceUID
          })
        }),
        rasterSource: rasterSource,
        tileLayer: layer,
        overlay: null,
        colormap: colormap
      }
    }
  }

  /**
   * Remove a mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of a mapping
   */
  removeMapping (mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        `Cannot remove mapping. Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    this[_map].removeLayer(mapping.tileLayer)
    mapping.tileLayer.dispose()
    this[_map].removeOverlay(mapping.overlay)
    delete this[_mappings][mappingUID]
  }

  /**
   * Show a mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of a mapping
   * @param {object} styleOptions
   * @param {number} styleOptions.opacity - Opacity
   */
  showMapping (mappingUID, styleOptions = {}) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        `Cannot show mapping. Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    console.info(`show mapping #${mappingUID}`)
    mapping.tileLayer.setVisible(true)
    this.setMappingStyle(mappingUID, styleOptions)
  }

  /**
   * Hide a mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of a mapping
   */
  hideMapping (mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        `Cannot hide mapping. Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    console.info(`hide mapping #${mappingUID}`)
    mapping.tileLayer.setVisible(false)
    this[_map].removeOverlay(mapping.overlay)
  }

  /**
   * Determine if mapping is visible.
   *
   * @param {string} mappingUID - Unique tracking identifier of a mapping
   * @returns {boolean}
   */
  isMappingVisible (mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        'Cannot determine if mapping is visible. ' +
        `Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    return mapping.tileLayer.getVisible()
  }

  /** Set the style of a mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of mapping
   * @param {object} styleOptions
   * @param {string} styleOptions.colormap - Name of the color map
   * @param {number} styleOptions.opacity - Opacity
   */
  setMappingStyle (mappingUID, styleOptions) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        'Cannot set style of mapping. ' +
        `Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]

    if (styleOptions.opacity != null) {
      mapping.tileLayer.setOpacity(styleOptions.opacity)
    }

    mapping.overlay = new Overlay({
      element: document.createElement('div'),
      offset: [5, 5]
    })

    const overlayElement = mapping.overlay.getElement()
    overlayElement.innerHTML = mapping.mapping.label
    overlayElement.style = {}
    overlayElement.style.display = 'flex'
    overlayElement.style.flexDirection = 'column'
    overlayElement.style.padding = '4px'
    overlayElement.style.backgroundColor = 'rgba(255, 255, 255, .5)'
    overlayElement.style.borderRadius = '4px'
    overlayElement.style.margin = '1px'
    overlayElement.style.color = 'black'
    overlayElement.style.fontWeight = '600'
    overlayElement.style.fontSize = '12px'
    overlayElement.style.textAlign = 'center'

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const height = 15
    const width = 5
    context.canvas.height = height
    context.canvas.width = width

    const colors = mapping.colormap
    for (let j = 0; j < colors.length; j++) {
      const color = colors[colors.length - j - 1]
      const r = color[0]
      const g = color[1]
      const b = color[2]
      context.fillStyle = `rgb(${r}, ${g}, ${b})`
      context.fillRect(0, height / colors.length * j, width, 1)
    }
    overlayElement.appendChild(canvas)

    const parentElement = overlayElement.parentNode
    parentElement.style.display = 'inline'

    this[_map].addOverlay(mapping.overlay)
  }

  /** Get the style of a mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of mapping
   * @returns {object} Style Options
   */
  getMappingStyle (mappingUID, styleOptions) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        'Cannot get style of mapping. ' +
        `Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]

    return { opacity: mapping.tileLayer.getOpacity() }
  }

  /**
   * Get all mappings.
   *
   * @return {Mapping[]}
   */
  getAllMappings () {
    const mappings = []
    for (const mappingUID in this[_mappings]) {
      mappings.push(this[_mappings][mappingUID].mapping)
    }
    return mappings
  }

  /**
   * Update properties of a region of interest.
   *
   * @param {object} roi - ROI to be updated
   * @param {string} roi.uid - Unique identifier of the region of interest
   * @param {object} roi.properties - ROI properties
   * @param {object} roi.properties.measurements - ROI measurements
   * @param {object} roi.properties.evaluations - ROI evaluations
   * @param {object} roi.properties.label - ROI label
   * @param {object} roi.properties.marker - ROI marker
   */
  updateROI ({ uid, properties = {} }) {
    if (!uid) return
    console.info(`update ROI ${uid}`)

    const feature = this[_drawingSource].getFeatureById(uid)

    _addROIPropertiesToFeature(feature, properties)

    this[_annotationManager].onUpdate(feature)
  }

  /**
   * Set the style of a region of interest.
   *
   * @param {string} uid - Unique identifier of the regions of interest
   * @param {object} styleOptions - Style options
   * @param {object} styleOptions.stroke - Style options for the outline of the geometry
   * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
   * @param {number} styleOptions.stroke.width - Width of the outline
   * @param {object} styleOptions.fill - Style options for body the geometry
   * @param {number[]} styleOptions.fill.color - RGBA color of the body
   * @param {object} styleOptions.image - Style options for image
   *
   */
  setROIStyle (uid, styleOptions) {
    this[_features].forEach((feature) => {
      const id = feature.getId()
      if (id === uid) {
        _setFeatureStyle(feature, styleOptions)
        const isVisible = Object.keys(styleOptions).length !== 0
        this[_annotationManager].setMarkupVisibility(id, isVisible)
      }
    })
  }

  /**
   * Add a new viewport overlay.
   *
   * @param {object} options Overlay options
   * @param {object} options.element The custom overlay HTML element
   * @param {string} options.className Class to style the overlay container
   * @param {number[]} options.offset Horizontal and vertical offset of the overlay container in pixels
   */
  addViewportOverlay ({ element, className, offset }) {
    const overlay = new Overlay({
      element,
      className,
      offset,
      stopEvent: false
    })
    this[_map].addOverlay(overlay)
  }

  /**
   * Remove an individual regions of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   */
  removeROI (uid) {
    console.info(`remove ROI ${uid}`)
    const feature = this[_drawingSource].getFeatureById(uid)

    if (feature) {
      this[_features].remove(feature)
      return
    }

    /**
     * If failed to draw/cache feature in drawing source, call onFailure
     * to avoid trash of broken annotations
     */
    this[_annotationManager].onFailure(uid)
  }

  /**
   * Remove all annotated regions of interest.
   */
  removeAllROIs () {
    console.info('remove all ROIs')
    this[_features].clear()
  }

  /**
   * Hide annotated regions of interest.
   */
  hideROIs () {
    console.info('hide ROIs')
    this[_drawingLayer].setVisible(false)
    this[_annotationManager].setVisible(false)
  }

  /**
   * Show annotated regions of interest.
   */
  showROIs () {
    console.info('show ROIs')
    this[_drawingLayer].setVisible(true)
    this[_annotationManager].setVisible(true)
  }

  /**
   * Whether annotated regions of interest are currently visible.
   *
   * @return {boolean}
   */
  get areROIsVisible () {
    return this[_drawingLayer].getVisible()
  }

  /**
   * Metadata for each DICOM VL Whole Slide Microscopy Image instance.
   *
   * @return {VLWholeSlideMicroscopyImage[]}
   */
  get imageMetadata () {
    return this[_pyramid].metadata
  }
}

/**
 * Static viewer for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type other than VOLUME.
 *
 * @class
 * @private
 */
class _NonVolumeImageViewer {
  /**
   * Creates a viewer instance for displaying non-VOLUME images.
   *
   * @param {object} options
   * @param {object} options.client - A DICOMwebClient instance for interacting with an origin server over HTTP.
   * @param {object} options.metadata - DICOM JSON metadata object for a VL Whole Slide Microscopy Image instance.
   * @param {string} options.orientation - Orientation of the slide (vertical: label on top, or horizontal: label on right side).
   * @param {number} [options.resizeFactor=1] - To which extent image should be reduced in size (fraction).
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile should be included for correction of image colors.
   */
  constructor (options) {
    this[_metadata] = new VLWholeSlideMicroscopyImage({
      metadata: options.metadata
    })

    if (this[_metadata].ImageType[2] === 'VOLUME') {
      throw new Error('Viewer cannot render images of type VOLUME.')
    }

    const resizeFactor = options.resizeFactor ? options.resizeFactor : 1
    const height = this[_metadata].TotalPixelMatrixRows * resizeFactor
    const width = this[_metadata].TotalPixelMatrixColumns * resizeFactor
    const extent = [
      0, // min X
      -(height + 1), // min Y
      width, // max X
      -1 // max Y
    ]

    const imageLoadFunction = (image, src) => {
      console.info('load image')
      const mediaType = 'image/png'
      const queryParams = {}
      if (resizeFactor !== 1) {
        queryParams.viewport = [width, height].join(',')
      }
      // We make this optional because ICC Profiles can be large and
      // their inclusion can result in significant overhead.
      if (options.includeIccProfile) {
        queryParams.iccprofile = 'yes'
      }
      const retrieveOptions = {
        studyInstanceUID: this[_metadata].StudyInstanceUID,
        seriesInstanceUID: this[_metadata].SeriesInstanceUID,
        sopInstanceUID: this[_metadata].SOPInstanceUID,
        mediaTypes: [{ mediaType }],
        queryParams: queryParams
      }
      options.client.retrieveInstanceRendered(retrieveOptions).then(
        (thumbnail) => {
          const blob = new Blob([thumbnail], { type: mediaType })// eslint-disable-line
          image.getImage().src = window.URL.createObjectURL(blob)
        }
      )
    }

    const projection = new Projection({
      code: 'DICOM',
      units: 'metric',
      extent: extent,
      getPointResolution: (pixelRes, point) => {
        /** DICOM Pixel Spacing has millimeter unit while the projection has
         * meter unit.
         */
        const mmSpacing = getPixelSpacing(this[_metadata])[0]
        const spacing = mmSpacing / resizeFactor / 10 ** 3
        return pixelRes * spacing
      }
    })

    const rasterSource = new Static({
      crossOrigin: 'Anonymous',
      imageExtent: extent,
      projection: projection,
      imageLoadFunction: imageLoadFunction,
      url: '' // will be set by imageLoadFunction()
    })

    this[_imageLayer] = new ImageLayer({ source: rasterSource })

    // The default rotation is 'horizontal' with the slide label on the right
    let rotation = _getRotation(this[_metadata])
    if (options.orientation === 'vertical') {
      // Rotate counterclockwise by 90 degrees to have slide label at the top
      rotation -= 90 * (Math.PI / 180)
    }

    const view = new View({
      center: getCenter(extent),
      rotation: rotation,
      projection: projection,
      extent: extent
    })

    // Creates the map with the defined layers and view and renders it.
    this[_map] = new Map({
      layers: [this[_imageLayer]],
      view: view,
      controls: [],
      keyboardEventTarget: document
    })

    view.fit(projection.getExtent(), { size: this[_map].getSize() })
  }

  /** Renders the image in the specified viewport container.
   * @param {object} options - Rendering options.
   * @param {(string|HTMLElement)} options.container - HTML Element in which the viewer should be injected.
   */
  render (options) {
    if (!('container' in options)) {
      console.error('container must be provided for rendering images')
    }
    this[_map].setTarget(options.container)
    const view = this[_map].getView()
    const projection = view.getProjection()
    view.fit(projection.getExtent(), { size: this[_map].getSize() })

    this[_map].getInteractions().forEach((interaction) => {
      this[_map].removeInteraction(interaction)
    })
  }

  /**
   * DICOM metadata for the displayed VL Whole Slide Microscopy Image instance.
   *
   * @return {VLWholeSlideMicroscopyImage}
   */
  get imageMetadata () {
    return this[_metadata]
  }

  /**
   * Resizes the viewer to fit the viewport.
   *
   * @returns {void}
   */
  resize () {
    this[_map].updateSize()
  }

  /**
   * Gets the size of the viewport.
   *
   * @return {number[]}
   */
  get size () {
    return this[_map].getSize()
  }
}

/**
 * Static viewer for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type OVERVIEW.
 *
 * @class
 * @memberof viewer
 */
class OverviewImageViewer extends _NonVolumeImageViewer {
  /** Creates a viewer instance for displaying OVERVIEW images.
   *
   * @param {object} options
   * @param {object} options.client - A DICOMwebClient instance for interacting with an origin server over HTTP.
   * @param {object} options.metadata - DICOM JSON metadata object for a VL Whole Slide Microscopy Image instance.
   * @param {string} [options.orientation='horizontal'] - Orientation of the slide (vertical: label on top, or horizontal: label on right side).
   * @param {number} [options.resizeFactor=1] - To which extent image should be reduced in size (fraction).
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile should be included for correction of image colors.
   */
  constructor (options) {
    if (options.orientation === undefined) {
      options.orientation = 'horizontal'
    }
    super(options)
  }
}

/**
 * Static viewer for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type LABEL.
 *
 * @class
 * @memberof viewer
 */
class LabelImageViewer extends _NonVolumeImageViewer {
  /** Creates a viewer instance for displaying LABEL images.
   *
   * @param {object} options
   * @param {object} options.client - A DICOMwebClient instance for interacting with an origin server over HTTP
   * @param {object} options.metadata - DICOM JSON metadata object for a VL Whole Slide Microscopy Image instance
   * @param {string} [options.orientation='vertical'] - Orientation of the slide (vertical: label on top, or horizontal: label on right side)
   * @param {number} [options.resizeFactor=1] - To which extent image should be reduced in size (fraction)
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile should be included for correction of image colors
   */
  constructor (options) {
    if (options.orientation === undefined) {
      options.orientation = 'vertical'
    }
    super(options)
  }
}

export { LabelImageViewer, OverviewImageViewer, VolumeImageViewer }
