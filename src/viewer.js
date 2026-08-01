import 'ol/ol.css'
import dcmjs from 'dcmjs'
import { has } from 'lodash'
import Collection from 'ol/Collection'
import { Zoom, ZoomSlider } from 'ol/control'
import FullScreen from 'ol/control/FullScreen'
import MousePosition from 'ol/control/MousePosition'
import OverviewMap from 'ol/control/OverviewMap'
import ScaleLine from 'ol/control/ScaleLine'
import { getCenter, getHeight, getWidth } from 'ol/extent'
import Feature from 'ol/Feature'
import { defaults as defaultInteractions } from 'ol/interaction'
import DragPan from 'ol/interaction/DragPan'
import DragZoom from 'ol/interaction/DragZoom'
import Draw, { createBox } from 'ol/interaction/Draw'
import Modify from 'ol/interaction/Modify'
import Select from 'ol/interaction/Select'
import Snap from 'ol/interaction/Snap'
import Translate from 'ol/interaction/Translate'
import ImageLayer from 'ol/layer/Image'
import VectorLayer from 'ol/layer/Vector'
import TileLayer from 'ol/layer/WebGLTile'
import WebGLVector from 'ol/layer/WebGLVector'
import OlMap from 'ol/Map'
import Overlay from 'ol/Overlay'
import Projection from 'ol/proj/Projection'
import DataTileSource from 'ol/source/DataTile'
import Static from 'ol/source/ImageStatic'
import TileDebug from 'ol/source/TileDebug'
import VectorSource from 'ol/source/Vector'
import { default as VectorEventType } from 'ol/source/VectorEventType' // eslint-disable-line
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Icon from 'ol/style/Icon'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'
import TileGrid from 'ol/tilegrid/TileGrid'
import View from 'ol/View'
import WebGLHelper from 'ol/webgl/Helper'
import { AnnotationGroup } from './annotation.js'
import _AnnotationManager from './annotations/_AnnotationManager'
import getExtendedROI from './bulkAnnotations/getExtendedROI'
import { BulkAnnotationManager } from './bulkAnnotations/manager.js'
import {
  buildPaletteColorLookupTable,
  ColormapNames,
  createColormap,
  createDistinctColormap,
  PaletteColorLookupTable,
} from './color.js'
import { CustomError, errorTypes } from './customError'
import Enums from './enums'
import publish from './eventPublisher'
import EVENT from './events'
import { applyViewerOptions } from './logger.js'
import { _groupFramesPerMapping, ParameterMapping } from './mapping.js'
import {
  groupColorInstances,
  groupMonochromeInstances,
  VLWholeSlideMicroscopyImage,
} from './metadata.js'
import { OpticalPath } from './opticalPath.js'
import {
  _areImagePyramidsEqual,
  _computeImagePyramid,
  _createTileLoadFunction,
  _fitImagePyramid,
  _getIccProfiles,
} from './pyramid.js'
import { ROI } from './roi.js'
import { Point, Polygon, Polyline } from './scoord3d.js'
import {
  _geometry2Scoord3d,
  _geometryCoordinates2scoord3dCoordinates,
  _getFeatureArea,
  _getFeatureLength,
  _scoord3d2Geometry,
  _scoord3dCoordinates2geometryCoordinates,
  getPixelSpacing,
} from './scoord3dUtils'
import { Segment } from './segment.js'
import {
  _generateUID,
  _getUnitSuffix,
  applyTransform,
  buildInverseTransform,
  buildTransform,
  computeRotation,
  createWindow,
  detectDisplayColorSpace,
  doContentItemsMatch,
} from './utils.js'
import webWorkerManager from './webWorker/webWorkerManager.js'

/**
 * Dispose all map layers to free up memory.
 */
function disposeMapLayers(map) {
  console.info('dispose map layers...')
  map.getAllLayers().forEach((layer) => {
    disposeLayer(layer, true)
    map.getView().dispose()
    map.removeLayer(layer)
  })
}

/**
 * Dispose overview map layers to free up memory.
 */
function disposeOverviewMapLayers(map) {
  console.info('dispose overview map layers...')
  const overviewMap = map?.getOverviewMap()
  if (overviewMap) {
    const overviewMapLayers = overviewMap.getLayers()
    if (overviewMapLayers) {
      overviewMapLayers.forEach((layer) => {
        disposeLayer(layer, true)
        overviewMap.removeLayer(layer)
      })
    }
  }
}

/**
 * Dispose layer and its dependencies to free up memory.
 */
export function disposeLayer(layer, disposeSource = false) {
  console.info('dispose layer:', layer)
  if (typeof layer?.getSource !== 'function') {
    return
  }

  const source = layer.getSource()
  if (disposeSource === true && source && source.clear) {
    source.clear()
    source.dispose()
  }

  layer.setSource(undefined)
  layer.dispose()
}

function _getClient(clientMapping, sopClassUID) {
  if (clientMapping[sopClassUID] == null) {
    return clientMapping.default
  }
  return clientMapping[sopClassUID]
}

function _getInteractionBindingCondition(bindings) {
  const BUTTONS = {
    left: 1,
    middle: 4,
    right: 2,
  }

  const { mouseButtons, modifierKey } = bindings

  const _mouseButtonCondition = (event) => {
    /** No mouse button condition set. */
    if (!mouseButtons?.length) {
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

/**
 * Get rotation of image relative to the slide coordinate system.
 *
 * Determines whether image needs to be rotated relative to slide
 * coordinate system based on direction cosines.
 * We want to rotate all images such that the X axis of the slide coordinate
 * system is the vertical axis (ordinate) of the viewport and the Y axis
 * of the slide coordinate system is the horizontal axis (abscissa) of the
 * viewport. Note that this is opposite to the Openlayers coordinate system.
 * There are only planar rotations, since the total pixel matrix is
 * parallel to the slide surface. Here, we further assume that rows and
 * columns of total pixel matrix are parallel to the borders of the slide,
 * i.e. the X and Y axes of the slide coordinate system.
 *
 * The row direction (left to right) of the Total Pixel Matrix
 * is defined by the first three Image Orientation Slide values.
 * The three values specify how the direction changes from the last pixel
 * to the first pixel in the row along each of the three axes of the
 * slide coordinate system (X, Y, Z), i.e. it express in which direction one
 * is moving in the slide coordinate system when the COLUMN index changes.
 * The column direction (top to bottom) of the Total Pixel Matrix
 * is defined by the second three Image Orientation Slide values.
 * The three values specify how the direction changes from the last pixel
 * to the first pixel in the column along each of the three axes of the
 * slide coordinate system (X, Y, Z), i.e. it express in which direction one
 * is moving in the slide coordinate system when the ROW index changes.
 *
 * @param {metadata.VLWholeSlideMicroscopyImage} metadata - Metadata of a DICOM
 * VL Whole Slide Microscopy Image instance
 *
 * @returns {number} Rotation in radians
 *
 * @private
 */
function _getRotation(metadata) {
  // Angle with respect to the reference orientation
  const angle = computeRotation({
    orientation: metadata.ImageOrientationSlide,
  })
  // We want the slide oriented horizontally with the label on the right side
  const correction = 90 * (Math.PI / 180)
  return angle + correction
}

/**
 * Map style options to OpenLayers style.
 *
 * @param {Object} styleOptions - Style options
 * @param {Object} styleOptions.stroke - Style options for the outline of the geometry
 * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
 * @param {number} styleOptions.stroke.width - Width of the outline
 * @param {Object} styleOptions.fill - Style options for body the geometry
 * @param {number[]} styleOptions.fill.color - RGBA color of the body
 * @param {Object} styleOptions.image - Style options for image
 * @return {Style} OpenLayers style
 *
 * @private
 */
function _getOpenLayersStyle(styleOptions) {
  const style = new Style()

  if ('stroke' in styleOptions) {
    const strokeOptions = {
      color: styleOptions.stroke.color,
      width: styleOptions.stroke.width,
    }
    const stroke = new Stroke(strokeOptions)
    style.setStroke(stroke)
  }

  if ('fill' in styleOptions) {
    const fillOptions = {
      color: styleOptions.fill.color,
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
        fill: new Fill(image.circle.fill),
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
 * @param {Object} feature - The feature instance that represents the ROI
 * @param {Object} properties -Valid ROI properties
 * @param {Object} properties.measurements - ROI measurements
 * @param {Object} properties.evaluations - ROI evaluations
 * @param {Object} properties.label - ROI label
 * @param {Object} properties.marker - ROI marker (this is used while we don't have presentation states)
 * @param {boolean} optSilent - Opt silent update
 *
 * @private
 */
function _addROIPropertiesToFeature(feature, properties, optSilent) {
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
 * Wire measurements and qualitative evaluations to generate content items
 * based on OpenLayers feature properties and geometry.
 *
 * @param {Object} map - The map instance
 * @param {Object} feature - The feature instance
 * @param {Object} pyramid - The pyramid metadata
 * @param {number[][]} affine - 3x3 affine transformation matrix
 * @returns {void}
 *
 * @private
 */
function _wireMeasurementsAndQualitativeEvaluationsEvents(
  map,
  feature,
  pyramid,
  affine,
) {
  /**
   * Update feature measurement properties first and then measurements
   */
  _updateFeatureMeasurements(map, feature, pyramid, affine)
  feature.on(Enums.FeatureEvents.CHANGE, (event) => {
    _updateFeatureMeasurements(map, event.target, pyramid, affine)
  })

  /**
   * Update feature evaluations
   */
  _updateFeatureEvaluations(feature)
  feature.on(Enums.FeatureEvents.PROPERTY_CHANGE, (event) =>
    _updateFeatureEvaluations(event.target),
  )
}

/**
 * Update feature evaluations from its properties
 *
 * @param {Feature} feature
 * @returns {void}
 *
 * @private
 */
function _updateFeatureEvaluations(feature) {
  const evaluations = feature.get(Enums.InternalProperties.Evaluations) || []
  const label = feature.get(Enums.InternalProperties.Label)

  if (!label) return

  const evaluation = new dcmjs.sr.valueTypes.TextContentItem({
    name: new dcmjs.sr.coding.CodedConcept({
      value: '112039',
      meaning: 'Tracking Identifier',
      schemeDesignator: 'DCM',
    }),
    value: label,
    relationshipType: Enums.RelationshipTypes.HAS_OBS_CONTEXT,
  })

  const index = evaluations.findIndex((e) => doContentItemsMatch(e, evaluation))

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
 * @param {Object} map - The map instance
 * @param {Object} feature - The feature instance
 * @param {Object} pyramid - The pyramid metadata
 * @returns {void}
 *
 * @private
 */
function _updateFeatureMeasurements(map, feature, pyramid, affine) {
  if (
    Enums.Markup.Measurement !== feature.get(Enums.InternalProperties.Markup)
  ) {
    return
  }

  const measurements = feature.get(Enums.InternalProperties.Measurements) || []
  const area = _getFeatureArea(feature, pyramid, affine)
  const length = _getFeatureLength(feature, pyramid, affine)

  if (area == null && length == null) {
    return
  }

  const unitSuffixToMeaningMap = {
    μm: 'micrometer',
    μm2: 'square micrometer',
    mm: 'millimeter',
    mm2: 'square millimeter',
    m: 'meters',
    m2: 'square meters',
    km2: 'square kilometers',
  }

  let measurement
  const view = map.getView()
  const unitSuffix = _getUnitSuffix(view)

  if (area != null) {
    const unitCodedConceptValue = `${unitSuffix}2`
    const unitCodedConceptMeaning = unitSuffixToMeaningMap[unitSuffix]
    measurement = new dcmjs.sr.valueTypes.NumContentItem({
      name: new dcmjs.sr.coding.CodedConcept({
        meaning: 'Area',
        value: '42798000',
        schemeDesignator: 'SCT',
      }),
      value: area,
      unit: new dcmjs.sr.coding.CodedConcept({
        value: unitCodedConceptValue,
        meaning: unitCodedConceptMeaning,
        schemeDesignator: 'SCT',
      }),
    })
  }

  if (length != null) {
    const unitCodedConceptValue = unitSuffix
    const unitCodedConceptMeaning = unitSuffixToMeaningMap[unitSuffix]
    measurement = new dcmjs.sr.valueTypes.NumContentItem({
      name: new dcmjs.sr.coding.CodedConcept({
        meaning: 'Length',
        value: '410668003',
        schemeDesignator: 'SCT',
      }),
      value: length,
      unit: new dcmjs.sr.coding.CodedConcept({
        value: unitCodedConceptValue,
        meaning: unitCodedConceptMeaning,
        schemeDesignator: 'SCT',
      }),
    })
  }

  if (measurement) {
    const index = measurements.findIndex((m) =>
      doContentItemsMatch(m, measurement),
    )

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
 * @param {Object} styleOptions - Style options
 * @param {Object} styleOptions.stroke - Style options for the outline of the geometry
 * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
 * @param {number} styleOptions.stroke.width - Width of the outline
 * @param {Object} styleOptions.fill - Style options for body the geometry
 * @param {number[]} styleOptions.fill.color - RGBA color of the body
 * @param {Object} styleOptions.image - Style options for image
 *
 * @private
 */
function _setFeatureStyle(feature, styleOptions) {
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

/**
 * Build OpenLayers style expression for coloring a WebGL TileLayer.
 *
 * @param {Object} styleOptions - Style options
 * @param {number} styleOptions.windowCenter - Center of the window used for contrast stretching
 * @param {number} styleOptions.windowWidth - Width of the window used for contrast stretching
 * @param {number[][]} styleOptions.colormap - RGB color triplets
 *
 * @returns {Object} color style expression and corresponding variables
 *
 * @private
 */
function _getColorPaletteStyleForTileLayer({
  windowCenter,
  windowWidth,
  colormap,
}) {
  /*
   * The Palette Color Lookup Table applies to the index values in the range
   * [0, n] that are obtained by scaling stored pixel values between the lower
   * and upper value of interest (VOI) defined by the window center and width.
   */
  const minIndexValue = 0
  const maxIndexValue = colormap.length - 1
  const indexExpression = [
    'clamp',
    [
      '+',
      [
        '*',
        [
          '+',
          [
            '/',
            ['-', ['band', 1], ['-', ['var', 'windowCenter'], 0.5]],
            ['-', ['var', 'windowWidth'], 1],
          ],
          0.5,
        ],
        ['-', maxIndexValue, minIndexValue],
      ],
      minIndexValue,
    ],
    minIndexValue,
    maxIndexValue,
  ]

  const expression = ['palette', indexExpression, colormap]

  const variables = {
    windowCenter,
    windowWidth,
  }

  return { color: expression, variables }
}

/**
 * Build OpenLayers style expression for coloring a WebGL TileLayer.
 *
 * @param {Object} styleOptions - Style options
 * @param {number} styleOptions.windowCenter - Center of the window used for contrast stretching
 * @param {number} styleOptions.windowWidth - Width of the window used for contrast stretching
 * @param {number[][]} styleOptions.colormap - RGB color triplets
 *
 * @returns {Object} color style expression and corresponding variables
 *
 * @private
 */
function _getColorPaletteStyleForParametricMappingTileLayer({
  windowCenter,
  windowWidth,
  colormap,
}) {
  /*
   * The Palette Color Lookup Table applies to the index values in the range
   * [0, n] that are obtained by scaling stored pixel values between the lower
   * and upper value of interest (VOI) defined by the window center and width.
   */
  const minIndexValue = 0
  const maxIndexValue = colormap.length - 1

  // Calculate the actual data range
  const minDataValue = windowCenter - windowWidth / 2
  const maxDataValue = windowCenter + windowWidth / 2

  const indexExpression = [
    'clamp',
    [
      'round',
      [
        '+',
        [
          '*',
          [
            '/',
            ['-', ['band', 1], minDataValue],
            ['-', maxDataValue, minDataValue],
          ],
          maxIndexValue,
        ],
        minIndexValue,
      ],
    ],
    minIndexValue,
    maxIndexValue,
  ]

  const expression = ['palette', indexExpression, colormap]

  const variables = {
    windowCenter,
    windowWidth,
  }

  return { color: expression, variables }
}

/**
 * Build OpenLayers style expression for coloring a WebGL TileLayer.
 *
 * @param {Object} styleOptions - Style options
 * @param {number} styleOptions.windowCenter - Center of the window used for contrast stretching
 * @param {number} styleOptions.windowWidth - Width of the window used for contrast stretching
 * @param {number[]} styleOptions.color - RGB color triplet
 *
 * @returns {Object} color style expression and corresponding variables
 *
 * @private
 */
function _getColorInterpolationStyleForTileLayer({
  windowCenter,
  windowWidth,
  color,
}) {
  /*
   * If no Palette Color Lookup Table is available, don't create one
   * but let WebGL interpolate colors for improved performance.
   */
  const expression = [
    'interpolate',
    ['linear'],
    [
      '+',
      [
        '/',
        ['-', ['band', 1], ['var', 'windowCenter']],
        ['var', 'windowWidth'],
      ],
      0.5,
    ],
    0,
    [0, 0, 0, 1],
    1,
    ['color', ['var', 'red'], ['var', 'green'], ['var', 'blue'], 1],
  ]

  const variables = {
    red: color[0],
    green: color[1],
    blue: color[2],
    windowCenter,
    windowWidth,
  }

  return { color: expression, variables }
}

const _errorInterceptor = Symbol('errorInterceptor')
const _retrievedBulkdata = Symbol('retrievedBulkdata')
const _affine = Symbol.for('affine')
const _affineInverse = Symbol('affineInverse')
const _annotationManager = Symbol('annotationManager')
const _annotationGroups = Symbol('annotationGroups')
const _areIccProfilesFetched = Symbol('areIccProfilesFetched')
const _clients = Symbol('clients')
const _controls = Symbol('controls')
const _drawingLayer = Symbol('drawingLayer')
const _drawingSource = Symbol('drawingSource')
const _features = Symbol('features')
const _imageLayer = Symbol('imageLayer')
const _interactions = Symbol.for('interactions')
const _map = Symbol.for('map')
const _mappings = Symbol('mappings')
const _metadata = Symbol('metadata')
const _opticalPaths = Symbol('opticalPaths')
const _options = Symbol('options')
const _overlays = Symbol('overlays')
const _overviewMap = Symbol('overviewMap')
const _projection = Symbol('projection')
const _pyramid = Symbol('pyramid')
const _segments = Symbol('segments')
const _rotation = Symbol('rotation')
const _tileGrid = Symbol('tileGrid')
const _updateOverviewMapSize = Symbol('updateOverviewMapSize')
const _annotationOptions = Symbol('annotationOptions')
const _isICCProfilesEnabled = Symbol('isICCProfilesEnabled')
const _iccOutputType = Symbol('iccOutputType')
const _iccProfiles = Symbol('iccProfiles')
const _container = Symbol('container')
const _bulkAnnotationManager = Symbol('bulkAnnotationManager')
const _segmentationInterpolate = Symbol('segmentationInterpolate')
const _segmentationTileGrid = Symbol('segmentationTileGrid')
const _parametricMapInterpolate = Symbol('parametricMapInterpolate')
const _mapViewResolutions = Symbol('mapViewResolutions')

/**
 * Interactive viewer for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type VOLUME.
 *
 * @class
 * @memberof viewer
 */
class VolumeImageViewer {
  /**
   * Create a viewer instance for displaying VOLUME images.
   *
   * @param {Object} options
   * @param {metadata.VLWholeSlideMicroscopyImage[]} options.metadata -
   * Metadata of DICOM VL Whole Slide Microscopy Image instances that should be
   * diplayed.
   * @param {Object} [options.client] - A DICOMwebClient instance for search for
   * and retrieve data from an origin server over HTTP
   * @param {Object} [options.clientMapping] - Mapping of SOP Class UIDs to
   * DICOMwebClient instances to search for and retrieve data from different
   * origin servers, depending on the type of DICOM object. Using a mapping can
   * be usedful, for example, if images, image annotations, or image analysis
   * results are stored in different archives.
   * @param {number} [options.preload=0] - Number of resolution levels that
   * should be preloaded
   * @param {string[]} [options.controls=[]] - Names of viewer control elements
   * that should be included in the viewport
   * @param {boolean} [options.debug=false] - Whether debug features should be
   * turned on (e.g., display of tile boundaries). When true, also enables
   * verbose library logging at DEBUG level unless `options.logger` is set.
   * @param {object} [options.logger] - Global logging override applied at
   * construction time (affects all viewers and workers). Host apps should
   * prefer {@link setLogLevel} at startup instead.
   * @param {string} [options.logger.level] - DEBUG, LOG, WARN, ERROR, or NONE
   * @param {number} [options.tilesCacheSize=1000] - Number of tiles that should
   * be cached to avoid repeated retrieval for the DICOMweb server
   * @param {number[]} [options.primaryColor=[255, 234, 0]] - Primary color of
   * the application
   * @param {number[]} [options.highlightColor=[140, 184, 198]] - Color that
   * should be used to highlight things that get selected by the user
   * @param {object} [options.annotationOptions] - Annotation options
   * @param {number} [options.annotationOptions.clusteringPixelSizeThreshold=0.001] -
   * Pixel size threshold in millimeters. When the current pixel size is smaller
   * than or equal to this threshold, clustering is disabled (high resolution mode).
   * Defaults to 0.001 (clustering enabled by default). Set to undefined to always
   * use the high-resolution layer (disable clustering).
   * @param {errorInterceptor} [options.errorInterceptor] - Callback for
   * intercepting errors
   * @param {number[]} [options.mapViewResolutions] Map's view list of
   * resolutions.
   * @param {boolean} [options.useTileGridResolutions=true] If false,
   * zoom will not be limited and the image will fit the viewport extent (no clipping).
   * Note: This option will be ignored if there are no thumbnail images available or its just one image.
   * If you set skipThumbnails to true, this option is not needed.
   * @param {boolean} [options.skipThumbnails=false] If true, thumbnail images will not be loaded as part of the pyramid.
   */
  constructor(options) {
    this[_options] = options
    this[_retrievedBulkdata] = {}
    this[_annotationOptions] = {}
    this[_clients] = {}
    this[_errorInterceptor] = options.errorInterceptor || ((error) => error)
    this[_isICCProfilesEnabled] = true
    this[_iccOutputType] = 'srgb'
    this[_container] = null
    this[_clients] = {}
    this[_iccProfiles] = []
    this[_bulkAnnotationManager] = null
    this[_segmentationInterpolate] = false
    this[_parametricMapInterpolate] = true

    this._onBulkAnnotationsFeaturesLoadStart =
      this._onBulkAnnotationsFeaturesLoadStart.bind(this)
    this._onBulkAnnotationsFeaturesLoadEnd =
      this._onBulkAnnotationsFeaturesLoadEnd.bind(this)
    this._onBulkAnnotationsFeaturesLoadError =
      this._onBulkAnnotationsFeaturesLoadError.bind(this)

    this.segmentOverlay = new Overlay({
      element: document.createElement('div'),
      offset: [7, 5],
    })

    if (this[_options].client) {
      this[_clients].default = this[_options].client
    } else {
      if (this[_options].clientMapping == null) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Either option "client" or option "clientMapping" must be provided .',
        )
        throw this[_options].errorInterceptor(error)
      }

      if (!(typeof this[_options].clientMapping === 'object')) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Option "clientMapping" must be an object.',
        )
        throw this[_options].errorInterceptor(error)
      }

      if (this[_options].clientMapping.default == null) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Option "clientMapping" must contain "default" key.',
        )
        throw this[_options].errorInterceptor(error)
      }

      for (const key in this[_options].clientMapping) {
        this[_clients][key] = this[_options].clientMapping[key]
      }
    }

    if (this[_options].skipThumbnails == null) {
      this[_options].skipThumbnails = false
    }

    if (this[_options].annotationOptions) {
      this[_annotationOptions] = this[_options].annotationOptions
    }

    if (this[_annotationOptions].clusteringPixelSizeThreshold === undefined) {
      this[_annotationOptions].clusteringPixelSizeThreshold = 0.001
    }

    if (this[_options].errorInterceptor == null) {
      this[_options].errorInterceptor = (error) => error
    }

    if (this[_options].useTileGridResolutions == null) {
      this[_options].useTileGridResolutions = true
    }

    /**
     * Strict boolean semantics: only a literal `true` enables debug, so that
     * e.g. `debug: false` does not flip the global log level to DEBUG.
     */
    this[_options].debug = this[_options].debug === true

    applyViewerOptions(this[_options])

    if (this[_options].preload == null) {
      this[_options].preload = false
    } else {
      this[_options].preload = true
    }

    if (this[_options].tilesCacheSize == null) {
      this[_options].tilesCacheSize = 1000
    }

    if (this[_options].controls == null) {
      this[_options].controls = []
    }
    this[_options].controls = new Set(this[_options].controls)

    if (this[_options].primaryColor == null) {
      this[_options].primaryColor = [255, 234, 0]
    }

    if (this[_options].highlightColor == null) {
      this[_options].highlightColor = [140, 184, 198]
    }

    // Collection of Openlayers "TileLayer" instances
    this[_segments] = {}
    this[_mappings] = {}
    this[_annotationGroups] = {}
    this[_areIccProfilesFetched] = false

    // Collection of Openlayers "Feature" instances
    this[_features] = new Collection([], { unique: true })

    // Add unique identifier to each created "Feature" instance
    this[_features].on('add', (e) => {
      // The ID may have already been set when drawn. However, features could
      // have also been added without a draw event.
      if (e.element.getId() === undefined) {
        e.element.setId(_generateUID())
      }

      this[_annotationManager].onAdd(e.element)
    })

    this[_features].on('remove', (e) => {
      this[_annotationManager].onRemove(e.element)
    })

    if (this[_options].metadata.constructor.name !== 'Array') {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Input metadata must be an array.',
      )
      throw this[_options].errorInterceptor(error)
    }

    if (this[_options].metadata.length === 0) {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Input metadata array is empty.',
      )
      throw this[_options].errorInterceptor(error)
    }

    if (this[_options].metadata.some((item) => typeof item !== 'object')) {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Input metadata must be an array of objects.',
      )
      throw this[_options].errorInterceptor(error)
    }

    const ImageFlavors = {
      VOLUME: 'VOLUME',
      LABEL: 'LABEL',
      OVERVIEW: 'OVERVIEW',
      THUMBNAIL: 'THUMBNAIL',
    }

    const hasImageFlavor = (image, imageFlavor) => {
      return image.ImageType[2] === imageFlavor
    }

    /*
     * Only include THUMBNAIL image into metadata if no other VOLUME image
     * exists with the same resolution
     */
    const filterImagesByResolution = (metadata) => {
      const pyramidBaseMetadata = metadata[metadata.length - 1]
      const filteredMetadata = metadata.filter((image) => {
        if (
          hasImageFlavor(image, ImageFlavors.THUMBNAIL) &&
          this[_options].skipThumbnails === true
        ) {
          return false
        }
        if (hasImageFlavor(image, ImageFlavors.THUMBNAIL)) {
          const hasThumbnailEquivalentVolumeImage = metadata.some(
            (img) =>
              hasImageFlavor(img, ImageFlavors.VOLUME) &&
              pyramidBaseMetadata.TotalPixelMatrixColumns /
                img.TotalPixelMatrixColumns ===
                pyramidBaseMetadata.TotalPixelMatrixColumns /
                  image.TotalPixelMatrixColumns,
          )
          if (hasThumbnailEquivalentVolumeImage) {
            console.debug(
              'Thumbnail image has equivalent volume image resolution, skipping thumbnail.',
              image.SOPInstanceUID,
            )
            return false
          }
          return true
        } else {
          return true
        }
      })

      return filteredMetadata
    }

    // We also accept metadata in raw JSON format for backwards compatibility
    const filteredMetadata = filterImagesByResolution(this[_options].metadata)
    if (filteredMetadata[0].SOPClassUID != null) {
      this[_metadata] = filteredMetadata
    } else {
      this[_metadata] = filteredMetadata.map((instance) => {
        return new VLWholeSlideMicroscopyImage({ metadata: instance })
      })
    }

    // Group color images by opticalPathIdentifier
    const colorGroups = groupColorInstances(this[_metadata])
    const colorImageInformation = {}
    let colorOpticalPathIdentifiers = Object.keys(colorGroups)
    if (colorOpticalPathIdentifiers.length > 0) {
      const id = colorOpticalPathIdentifiers[0]
      if (colorOpticalPathIdentifiers.length > 1) {
        console.warn(
          'Volume Image Viewer detected more than one color image, ' +
            'but only one color image can be loaded and visualized at a time. ' +
            'Only the first detected color image will be loaded.',
        )
        colorOpticalPathIdentifiers = [id]
      }
      colorImageInformation[id] = {
        metadata: colorGroups[id],
        opticalPath: this[_metadata][0].OpticalPathSequence[0],
      }
    }

    const monochromeGroups = groupMonochromeInstances(this[_metadata])
    const monochromeOpticalPathIdentifiers = Object.keys(monochromeGroups)
    const monochromeImageInformation = {}
    monochromeOpticalPathIdentifiers.forEach((id) => {
      const refImage = monochromeGroups[id][0]
      const opticalPath = refImage.OpticalPathSequence.find((item) => {
        return item.OpticalPathIdentifier === id
      })
      monochromeImageInformation[id] = {
        metadata: monochromeGroups[id],
        opticalPath,
      }
    })

    const numChannels = monochromeOpticalPathIdentifiers.length
    const numColorImages = colorOpticalPathIdentifiers.length
    if (numChannels === 0 && numColorImages === 0) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Could not find any channels or color images.',
      )
      throw this[_options].errorInterceptor(error)
    }

    if (numChannels > 0 && numColorImages > 0) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Found both channels and color images.',
      )
      throw this[_options].errorInterceptor(error)
    }

    if (numColorImages > 1) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Found more than one color image.',
      )
      throw this[_options].errorInterceptor(error)
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

    const metadata = this[_pyramid].metadata[this[_pyramid].metadata.length - 1]
    const origin = metadata.TotalPixelMatrixOriginSequence[0]
    const orientation = metadata.ImageOrientationSlide
    const spacing = getPixelSpacing(metadata)
    const offset = [
      Number(origin.XOffsetInSlideCoordinateSystem),
      Number(origin.YOffsetInSlideCoordinateSystem),
    ]
    this[_affine] = buildTransform({
      offset,
      orientation,
      spacing,
    })
    this[_affineInverse] = buildInverseTransform({
      offset,
      orientation,
      spacing,
    })

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
      getPointResolution: (pixelRes, _point) => {
        /*
         * DICOM Pixel Spacing has millimeter unit while the projection has
         * meter unit.
         */
        const spacing = getPixelSpacing(
          this[_pyramid].metadata[this[_pyramid].metadata.length - 1],
        )[0]
        return (pixelRes * spacing) / 10 ** 3
      },
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
      tileSizes: this[_pyramid].tileSizes,
    })

    this[_mapViewResolutions] =
      this[_options].useTileGridResolutions === false ||
      this[_options].skipThumbnails === true
        ? undefined
        : this[_tileGrid].getResolutions()

    /**
     * If there are no thumbnail images, dont use any resolutions so we can create a thumbnail image by
     * loading the the tiles of the lowest resolution and show the entire extent.
     * Using resolutions will cause the viewer to clip the image to the extent of the viewport. This is
     * not what we want for a thumbnail image.
     */
    if (
      !this[_metadata].find(
        (image) => image.ImageType[2] === ImageFlavors.THUMBNAIL,
      ) &&
      this[_metadata].length > 1
    ) {
      this[_mapViewResolutions] = undefined
    }

    if (has(this[_options], 'mapViewResolutions')) {
      this[_mapViewResolutions] = this[_options].mapViewResolutions
    }

    const view = new View({
      center: getCenter(this[_pyramid].extent),
      projection: this[_projection],
      rotation: this[_rotation],
      constrainOnlyCenter: false,
      resolutions: this[_mapViewResolutions],
      smoothResolutionConstraint: true,
      showFullExtent: true,
      extent: this[_pyramid].extent,
    })

    this[_iccOutputType] = detectDisplayColorSpace()
    const layers = []
    const overviewLayers = []
    this[_opticalPaths] = {}
    if (numChannels > 0) {
      const helper = new WebGLHelper()
      const overviewHelper = new WebGLHelper()
      for (const opticalPathIdentifier in monochromeImageInformation) {
        const info = monochromeImageInformation[opticalPathIdentifier]
        const pyramid = _computeImagePyramid({ metadata: info.metadata })
        console.info(`channel "${opticalPathIdentifier}"`, pyramid)
        const bitsAllocated = info.metadata[0].BitsAllocated
        const minStoredValue = 0
        const maxStoredValue = 2 ** bitsAllocated - 1

        let paletteColorLookupTableUID
        let paletteColorLookupTable
        if (info.opticalPath.PaletteColorLookupTableSequence) {
          const item = info.opticalPath.PaletteColorLookupTableSequence[0]
          paletteColorLookupTableUID = item.PaletteColorLookupTableUID
            ? item.PaletteColorLookupTableUID
            : _generateUID()
          /*
           * TODO: If the LUT Data are large, the elements may be bulkdata and
           * then have to be retrieved separately. However, for optical paths
           * they are typically communicated as Segmented LUT Data and thus
           * relatively small.
           */
          paletteColorLookupTable = new PaletteColorLookupTable({
            uid: item.PaletteColorLookupTableUID,
            redDescriptor: item.RedPaletteColorLookupTableDescriptor,
            greenDescriptor: item.GreenPaletteColorLookupTableDescriptor,
            blueDescriptor: item.BluePaletteColorLookupTableDescriptor,
            redData: item.RedPaletteColorLookupTableData,
            greenData: item.GreenPaletteColorLookupTableData,
            blueData: item.BluePaletteColorLookupTableData,
            redSegmentedData: item.SegmentedRedPaletteColorLookupTableData,
            greenSegmentedData: item.SegmentedGreenPaletteColorLookupTableData,
            blueSegmentedData: item.SegmentedBluePaletteColorLookupTableData,
          })
        }

        const defaultOpticalPathStyle = {
          opacity: 1,
          limitValues: [minStoredValue, maxStoredValue],
        }
        if (paletteColorLookupTable) {
          defaultOpticalPathStyle.paletteColorLookupTable =
            paletteColorLookupTable
        } else {
          defaultOpticalPathStyle.color = [255, 255, 255]
        }

        const opticalPath = {
          opticalPathIdentifier,
          opticalPath: new OpticalPath({
            identifier: opticalPathIdentifier,
            description: info.opticalPath.OpticalPathDescription,
            isMonochromatic: true,
            illuminationType: info.opticalPath.IlluminationTypeCodeSequence[0],
            illuminationWaveLength: info.opticalPath.IlluminationWaveLength,
            illuminationColor: info.opticalPath.IlluminationColorCodeSequence
              ? info.opticalPath.IlluminationColorCodeSequence[0]
              : undefined,
            studyInstanceUID: info.metadata[0].StudyInstanceUID,
            seriesInstanceUID: info.metadata[0].SeriesInstanceUID,
            sopInstanceUIDs: pyramid.metadata.map((element) => {
              return element.SOPInstanceUID
            }),
            paletteColorLookupTableUID,
          }),
          pyramid,
          style: { ...defaultOpticalPathStyle },
          defaultStyle: defaultOpticalPathStyle,
          bitsAllocated,
          minStoredValue,
          maxStoredValue,
          loaderParams: {
            pyramid,
            client: _getClient(
              this[_clients],
              Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE,
            ),
            channel: opticalPathIdentifier,
          },
          hasLoader: false,
        }

        const areImagePyramidsEqual = _areImagePyramidsEqual(
          opticalPath.pyramid,
          this[_pyramid],
        )
        if (!areImagePyramidsEqual) {
          const error = new CustomError(
            errorTypes.VISUALIZATION,
            `Pyramid of optical path "${opticalPathIdentifier}" ` +
              'is different from reference pyramid.',
          )
          throw this[_options].errorInterceptor(error)
        }

        const source = new DataTileSource({
          tileGrid: this[_tileGrid],
          projection: this[_projection],
          wrapX: false,
          transition: 0,
          bandCount: 1,
        })
        source.on('tileloaderror', (event) => {
          console.error(
            `error loading tile of optical path "${opticalPathIdentifier}"`,
            event.tile?.error_?.message || event,
          )
          const error = new CustomError(
            errorTypes.VISUALIZATION,
            `error loading tile of optical path "${opticalPathIdentifier}": ${event.tile?.error_?.message || event.message}`,
          )
          this[_options].errorInterceptor(error)
        })

        const [windowCenter, windowWidth] = createWindow(
          opticalPath.style.limitValues[0],
          opticalPath.style.limitValues[1],
        )

        let layerStyle
        if (opticalPath.style.paletteColorLookupTable) {
          layerStyle = _getColorPaletteStyleForTileLayer({
            windowCenter,
            windowWidth,
            colormap: opticalPath.style.paletteColorLookupTable.data,
          })
        } else {
          layerStyle = _getColorInterpolationStyleForTileLayer({
            windowCenter,
            windowWidth,
            color: opticalPath.style.color,
          })
        }

        opticalPath.layer = new TileLayer({
          source,
          extent: pyramid.extent,
          preload: this[_options].preload ? 1 : 0,
          style: layerStyle,
          visible: false,
          useInterimTilesOnError: false,
          cacheSize: this[_options].tilesCacheSize,
        })
        opticalPath.layer.helper = helper
        opticalPath.layer.on('precompose', (event) => {
          const gl = event.context
          if ('drawingBufferColorSpace' in gl) {
            gl.drawingBufferColorSpace = this[_iccOutputType]
          }
          gl.enable(gl.BLEND)
          gl.blendEquation(gl.FUNC_ADD)
          gl.blendFunc(gl.SRC_COLOR, gl.ONE)
        })
        opticalPath.layer.on('error', (event) => {
          console.error(
            `error rendering optical path "${opticalPathIdentifier}"`,
            event,
          )
          const error = new CustomError(
            errorTypes.VISUALIZATION,
            `error rendering optical path "${opticalPathIdentifier}": ${event.message}`,
          )
          this[_options].errorInterceptor(error)
        })
        opticalPath.overviewLayer = new TileLayer({
          source,
          extent: pyramid.extent,
          preload: 0,
          style: layerStyle,
          visible: false,
          useInterimTilesOnError: false,
        })
        opticalPath.overviewLayer.helper = overviewHelper
        opticalPath.overviewLayer.on('precompose', (event) => {
          const gl = event.context
          if ('drawingBufferColorSpace' in gl) {
            gl.drawingBufferColorSpace = this[_iccOutputType]
          }
          gl.enable(gl.BLEND)
          gl.blendEquation(gl.FUNC_ADD)
          gl.blendFunc(gl.SRC_COLOR, gl.ONE)
        })

        this[_opticalPaths][opticalPathIdentifier] = opticalPath
      }
    } else {
      const opticalPathIdentifier = colorOpticalPathIdentifiers[0]
      const info = colorImageInformation[opticalPathIdentifier]
      const pyramid = _computeImagePyramid({ metadata: info.metadata })
      const defaultOpticalPathStyle = { opacity: 1 }

      const opticalPath = {
        opticalPathIdentifier,
        opticalPath: new OpticalPath({
          identifier: opticalPathIdentifier,
          description: info.opticalPath.OpticalPathDescription,
          illuminationType: info.opticalPath.IlluminationTypeCodeSequence[0],
          isMonochromatic: false,
          studyInstanceUID: info.metadata[0].StudyInstanceUID,
          seriesInstanceUID: info.metadata[0].SeriesInstanceUID,
          sopInstanceUIDs: pyramid.metadata.map((element) => {
            return element.SOPInstanceUID
          }),
        }),
        style: { ...defaultOpticalPathStyle },
        defaultStyle: defaultOpticalPathStyle,
        pyramid,
        bitsAllocated: 8,
        minStoredValue: 0,
        maxStoredValue: 255,
        loaderParams: {
          pyramid,
          client: _getClient(
            this[_clients],
            Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE,
          ),
          channel: opticalPathIdentifier,
        },
        hasLoader: false,
      }

      const source = new DataTileSource({
        tileGrid: this[_tileGrid],
        projection: this[_projection],
        wrapX: false,
        transition: 0,
        bandCount: 3,
      })
      source.on('tileloaderror', (event) => {
        console.error(
          `error loading tile of optical path "${opticalPathIdentifier}"`,
          event.tile?.error_?.message || event,
        )
        const error = new CustomError(
          errorTypes.VISUALIZATION,
          `error loading tile of optical path "${opticalPathIdentifier}": ${event.tile?.error_?.message || event.message}`,
        )
        this[_options].errorInterceptor(error)
      })

      opticalPath.layer = new TileLayer({
        source,
        extent: this[_tileGrid].extent,
        preload: this[_options].preload ? 1 : 0,
        useInterimTilesOnError: false,
        cacheSize: this[_options].tilesCacheSize,
      })
      opticalPath.layer.on('precompose', (event) => {
        const gl = event.context
        if ('drawingBufferColorSpace' in gl) {
          gl.drawingBufferColorSpace = this[_iccOutputType]
        }
      })

      opticalPath.layer.on('error', (event) => {
        console.error(
          `error rendering optical path "${opticalPathIdentifier}"`,
          event,
        )
        const error = new CustomError(
          errorTypes.VISUALIZATION,
          `error rendering optical path "${opticalPathIdentifier}": ${event.message}`,
        )
        this[_options].errorInterceptor(error)
      })
      opticalPath.overviewLayer = new TileLayer({
        source,
        extent: pyramid.extent,
        preload: 0,
        useInterimTilesOnError: false,
      })
      opticalPath.overviewLayer.on('precompose', (event) => {
        const gl = event.context
        if ('drawingBufferColorSpace' in gl) {
          gl.drawingBufferColorSpace = this[_iccOutputType]
        }
      })

      layers.push(opticalPath.layer)
      overviewLayers.push(opticalPath.overviewLayer)
      this[_opticalPaths][opticalPathIdentifier] = opticalPath
    }

    if (this[_options].debug) {
      const tileDebugSource = new TileDebug({
        projection: this[_projection],
        extent: this[_pyramid].extent,
        tileGrid: this[_tileGrid],
        wrapX: false,
        template: ' ',
      })
      const tileDebugLayer = new TileLayer({
        source: tileDebugSource,
        extent: this[_pyramid].extent,
        projection: this[_projection],
      })
      layers.push(tileDebugLayer)
    }

    const noThumbnails =
      !this[_metadata].find(
        (image) => image.ImageType[2] === ImageFlavors.THUMBNAIL,
      ) && this[_metadata].length > 1

    if (Math.max(...this[_pyramid].gridSizes[0]) <= 10 || noThumbnails) {
      const center = getCenter(this[_projection].getExtent())
      this[_overviewMap] = new OverviewMap({
        view: new View({
          projection: this[_projection],
          rotation: this[_rotation],
          constrainOnlyCenter: true,
          resolutions: [this[_tileGrid].getResolution(0)],
          extent: center.concat(center),
          showFullExtent: true,
        }),
        layers: overviewLayers,
        collapsed: false,
        collapsible: true,
        rotateWithView: true,
      })

      this[_updateOverviewMapSize] = () => {
        const degrees = (this[_rotation] / Math.PI) * 180
        const isRotated = !(
          Math.abs(degrees - 180) < 0.01 || Math.abs(degrees - 0) < 0.01
        )
        const viewport = this[_map].getViewport()
        const viewportHeight = viewport.clientHeight
        const viewportWidth = viewport.clientWidth
        const viewportHeightFraction = 0.45
        const viewportWidthFraction = 0.25
        const targetHeight = viewportHeight * viewportHeightFraction
        const targetWidth = viewportWidth * viewportWidthFraction
        const extent = this[_projection].getExtent()
        let height
        let width
        let resolution

        if (isRotated) {
          if (targetWidth > targetHeight) {
            height = targetHeight
            width = (height * getHeight(extent)) / getWidth(extent)
            resolution = getWidth(extent) / height
          } else {
            width = targetWidth
            height = (width * getWidth(extent)) / getHeight(extent)
            resolution = getHeight(extent) / width
          }
        } else {
          if (targetHeight > targetWidth) {
            width = targetWidth
            height = (width * getHeight(extent)) / getWidth(extent)
            resolution = getWidth(extent) / width
          } else {
            height = targetHeight
            width = (height * getWidth(extent)) / getHeight(extent)
            resolution = getHeight(extent) / height
          }
        }

        const center = getCenter(extent)
        const overviewView = new View({
          projection: this[_projection],
          rotation: this[_rotation],
          constrainOnlyCenter: true,
          minResolution: resolution,
          maxResolution: resolution,
          extent: center.concat(center),
          showFullExtent: true,
        })
        const map = this[_overviewMap].getOverviewMap()
        const overviewElement = this[_overviewMap].element
        const overviewmapElement = Object.values(overviewElement.children).find(
          (c) => c.className === 'ol-overviewmap-map',
        )
        // TODO: color "ol-overviewmap-map-box" using primary color
        overviewmapElement.style.width = `${width}px`
        overviewmapElement.style.height = `${height}px`
        map.updateSize()
        map.setView(overviewView)
        this[_map].removeControl(this[_overviewMap])
        this[_map].addControl(this[_overviewMap])
      }
    } else {
      this[_overviewMap] = null
      this[_updateOverviewMapSize] = () => {}
    }

    this[_drawingSource] = new VectorSource({
      tileGrid: this[_tileGrid],
      projection: this[_projection],
      features: this[_features],
      wrapX: false,
    })

    this[_drawingLayer] = new VectorLayer({
      extent: this[_pyramid].extent,
      source: this[_drawingSource],
      projection: this[_projection],
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    })

    layers.push(this[_drawingLayer])

    this[_map] = new OlMap({
      layers,
      view,
      controls: [],
      keyboardEventTarget: document,
      interactions: defaultInteractions({
        altShiftDragRotate: true,
        doubleClickZoom: false,
        mouseWheelZoom: true,
        keyboard: false,
        shiftDragZoom: true,
        dragPan: true,
        pinchRotate: true,
        pinchZoom: true,
      }),
    })

    view.fit(this[_projection].getExtent(), { size: this[_map].getSize() })

    /**
     * OpenLayer's map has default active interactions.
     * We need to reuse them here to avoid duplications.
     * Enabling or disabling interactions could cause side effects on
     * OverviewMap since it also uses the same interactions in the map
     * @private
     */
    this[_interactions] = {
      draw: undefined,
      select: undefined,
      translate: undefined,
      modify: undefined,
      snap: undefined,
      dragPan: this[_map]
        .getInteractions()
        .getArray()
        .find((i) => {
          return i instanceof DragPan
        }),
    }

    this[_controls] = {
      scale: new ScaleLine({
        units: 'metric',
        className: '',
      }),
    }

    if (this[_options].controls.has('fullscreen')) {
      this[_controls].fullscreen = new FullScreen()
    }

    if (this[_options].controls.has('zoom')) {
      this[_controls].zoom = new Zoom()
      this[_controls].zoomslider = new ZoomSlider()
    }

    if (this[_options].controls.has('overview')) {
      if (this[_overviewMap]) {
        this[_controls].overview = this[_overviewMap]
      }
    }

    if (this[_options].controls.has('position')) {
      this[_controls].position = new MousePosition({
        coordinateFormat: (imageCoordinates) => {
          const slideCoordinates = _geometryCoordinates2scoord3dCoordinates(
            imageCoordinates,
            this[_pyramid].metadata,
            this[_affine],
          )
          /*
           * This assumes that the image is aligned with the X and Y axes
           * of the slide (frame of reference).
           * If one would ever change the orientation (rotation), this may
           * need to be changed accordingly. The values would not become wrong,
           * but the X and Y axes of the slide would no longer align with the
           * vertical and horizontal axes of the viewport, respectively.
           */
          const x = slideCoordinates[0].toFixed(5)
          const y = slideCoordinates[1].toFixed(5)
          return `(${x}, ${y})`
        },
      })
    }

    for (const name in this[_controls]) {
      console.info(`add control "${name}"`)
      this[_map].addControl(this[_controls][name])
    }

    this[_annotationManager] = new _AnnotationManager({
      map: this[_map],
      pyramid: this[_pyramid].metadata,
      affine: this[_affine],
      drawingSource: this[_drawingSource],
    })

    this[_overlays] = {}

    this._setupMapEventListeners()
    this._setupDrawingSourceEventListeners()
  }

  /**
   * Gets the internal map object, used for finer grained control over the display
   * area/setup.
   */
  getMap() {
    return this[_map]
  }

  /**
   * Gets the affine transform
   */
  getAffine() {
    return this[_affine]
  }

  /**
   * Set up event listeners for the map.
   * @private
   */
  _setupMapEventListeners() {
    /**
     * Handle the start of a movement event.
     * @private
     */
    this[_map].on('movestart', (event) => {
      publish(this[_map].getTargetElement(), EVENT.MOVE_STARTED, { event })
    })

    /**
     * Handle the end of a movement event.
     * @private
     */
    this[_map].on('moveend', (event) => {
      publish(this[_map].getTargetElement(), EVENT.MOVE_ENDED, { event })
    })

    let clickEvent = null

    /**
     * Handle pointer movement events.
     * @private
     */
    this[_map].on('pointermove', (event) => {
      const features = this[_map].getFeaturesAtPixel(event.pixel, {
        hitTolerance: 1,
        layerFilter: (layer) =>
          layer instanceof VectorLayer || layer instanceof WebGLVector,
      })

      const featuresWithROIs = []
      for (const feature of features) {
        if (feature !== null && feature.getId() !== undefined) {
          const correctFeature = feature.values_?.features?.[0] || feature
          if (correctFeature?.getId()) {
            const annotationGroupUID = correctFeature.get('annotationGroupUID')
            featuresWithROIs.push({
              feature: this._getROIFromFeature(
                correctFeature,
                this[_pyramid].metadata,
                this[_affine],
              ),
              annotationGroupUID: annotationGroupUID || null,
            })
          }
        }
      }

      /** Merge deck.gl bulk-annotation CPU picks (pickable:false on layers). */
      if (this[_bulkAnnotationManager] != null && event.coordinate) {
        const hit = this[_bulkAnnotationManager].pickAtMapCoordinate(
          event.coordinate,
        )
        if (hit != null) {
          const record = this[_bulkAnnotationManager].getGroupRecord(
            hit.annotationGroupUID,
          )
          const roi = this._buildBulkAnnotationROI(hit, record)
          if (roi != null) {
            featuresWithROIs.push({
              feature: roi,
              annotationGroupUID: hit.annotationGroupUID,
            })
          }
        }
      }

      publish(this[_map].getTargetElement(), EVENT.POINTER_MOVE, {
        features: featuresWithROIs,
        event,
      })
    })

    /**
     * Handle double-click events.
     * @private
     */
    this[_map].on('dblclick', (event) => {
      if (this[_interactions].draw !== undefined) {
        return
      }

      clickEvent = 'dblclick'
      this[_map].forEachFeatureAtPixel(
        event.pixel,
        (feature) => {
          if (feature !== null && feature.getId() !== undefined) {
            const correctFeature = feature.values_?.features?.[0] || feature
            if (correctFeature?.getId()) {
              publish(
                this[_map].getTargetElement(),
                EVENT.ROI_SELECTED,
                this._getROIFromFeature(
                  correctFeature,
                  this[_pyramid].metadata,
                  this[_affine],
                ),
              )
              publish(
                this[_map].getTargetElement(),
                EVENT.ROI_DOUBLE_CLICKED,
                this._getROIFromFeature(
                  correctFeature,
                  this[_pyramid].metadata,
                  this[_affine],
                ),
              )
            }
            clickEvent = null
          }
        },
        {
          hitTolerance: 1,
          layerFilter: (layer) =>
            layer instanceof VectorLayer || layer instanceof WebGLVector,
        },
      )
    })

    /**
     * Handle click events.
     * @private
     */
    this[_map].on('click', (event) => {
      if (clickEvent === 'dblclick') {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      clickEvent = 'click'
      const features = this[_map].getFeaturesAtPixel(event.pixel)
      const rois = features
        .map((feature) =>
          this._getROIFromFeature(
            feature,
            this[_pyramid].metadata,
            this[_affine],
          ),
        )
        .filter(Boolean)

      let bulkRoi = null
      if (this[_bulkAnnotationManager] != null && event.coordinate) {
        const hit = this[_bulkAnnotationManager].pickAtMapCoordinate(
          event.coordinate,
        )
        if (hit != null) {
          const record = this[_bulkAnnotationManager].getGroupRecord(
            hit.annotationGroupUID,
          )
          bulkRoi = this._buildBulkAnnotationROI(hit, record)
          if (bulkRoi != null) {
            rois.push(bulkRoi)
          }
        }
      }

      publish(this[_map].getTargetElement(), EVENT.VIEWPORT_CLICKED, {
        rois,
      })

      let selected = false
      this[_map].forEachFeatureAtPixel(
        event.pixel,
        (feature) => {
          if (feature !== null && feature.getId() !== undefined) {
            const correctFeature = feature.values_?.features?.[0] || feature
            if (correctFeature?.getId()) {
              publish(
                this[_map].getTargetElement(),
                EVENT.ROI_SELECTED,
                this._getROIFromFeature(
                  correctFeature,
                  this[_pyramid].metadata,
                  this[_affine],
                ),
              )
              selected = true
            }
            clickEvent = null
          }
        },
        {
          hitTolerance: 1,
          layerFilter: (layer) =>
            layer instanceof VectorLayer || layer instanceof WebGLVector,
        },
      )

      if (!selected && bulkRoi != null) {
        publish(this[_map].getTargetElement(), EVENT.ROI_SELECTED, bulkRoi)
        clickEvent = null
      }
    })
  }

  /**
   * Set up event listeners for the drawing source.
   * @private
   */
  _setupDrawingSourceEventListeners() {
    /**
     * Handle adding a feature to the drawing source.
     * @private
     */
    this[_drawingSource].on(VectorEventType.ADDFEATURE, (e) => {
      const container = this[_map].getTargetElement()
      if (!container) {
        return
      }
      publish(
        container,
        EVENT.ROI_ADDED,
        this._getROIFromFeature(
          e.feature,
          this[_pyramid].metadata,
          this[_affine],
        ),
      )
    })

    /**
     * Handle changes to a feature in the drawing source.
     * @private
     */
    this[_drawingSource].on(VectorEventType.CHANGEFEATURE, (e) => {
      const container = this[_map].getTargetElement()
      if (!container) {
        return
      }
      if (e.feature !== undefined && e.feature !== null) {
        const geometry = e.feature.getGeometry()
        const type = geometry.getType()
        /*
         * The first and last point of a polygon must be identical. The
         * last point is an implementation detail and is hidden from the
         * user in the graphical interface. However, we must update the
         * last point in case the first point has been modified by the
         * user.
         *
         * Note: the POLYGON GraphicType value for ANN specifies that the
         * first and last points are implicitly joined, so the first point
         * should not be repeated at the end (unlike other uses in other IODs).
         * Reference: https://github.com/ImagingDataCommons/slim/issues/298#issuecomment-2959241315
         */
        if (type === 'Polygon') {
          /*
           * Polygon in GeoJSON format contains an array of geometries,
           * where the first element represents the coordinates of the
           * outer ring and the second element represents the coordinates
           * of the inner ring (in our case the inner ring should not be
           * present).
           */
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
        this._getROIFromFeature(
          e.feature,
          this[_pyramid].metadata,
          this[_affine],
        ),
      )
    })

    /**
     * Remove a feature from the drawing source.
     * @private
     */
    this[_drawingSource].on(VectorEventType.REMOVEFEATURE, (e) => {
      const container = this[_map].getTargetElement()
      if (!container) {
        return
      }
      publish(
        container,
        EVENT.ROI_REMOVED,
        this._getROIFromFeature(
          e.feature,
          this[_pyramid].metadata,
          this[_affine],
        ),
      )
    })
  }

  /**
   * Set the style of an optical path.
   *
   * The style determine how grayscale stored values of a MONOCHROME2 image
   * will be transformed into pseudo-color display values.
   * Grayscale stored values are first transformed into normalized grayscale
   * display values, which are subsequently transformed into pseudo-color
   * values in RGB color space.
   *
   * The input to the first transformation are grayscale stored values in the
   * range defined by parameter "limitValues", which specify a window for
   * optimizing display value intensity and contrast. The resulting normalized
   * grayscale display values are then used as input to the second
   * transformation, which maps them to pseudo-color values ranging from black
   * color (R=0, G=0, B=0) to the color defined by parameter "color" using
   * linear interpolation. Alternatively, a palette color lookup table can be
   * provided to perform more sophisticated pseudo-coloring.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @param {Object} styleOptions
   * @param {number[]} [styleOptions.color] - RGB color triplet
   * @param {number[]} [styleOptions.paletteColorLookupTable] - palette color
   * lookup table
   * @param {number} [styleOptions.opacity] - Opacity
   * @param {number[]} [styleOptions.limitValues] - Upper and lower windowing
   * limits
   */
  setOpticalPathStyle(opticalPathIdentifier, styleOptions = {}) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot set optical path style. Could not find optical path ' +
          `"${opticalPathIdentifier}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    if (Object.entries(styleOptions).length === 0) {
      return
    }

    console.info(
      `set style for optical path "${opticalPathIdentifier}"`,
      styleOptions,
    )
    if (styleOptions.opacity != null) {
      opticalPath.style.opacity = styleOptions.opacity
      opticalPath.layer.setOpacity(styleOptions.opacity)
      opticalPath.overviewLayer.setOpacity(styleOptions.opacity)
    }

    if (opticalPath.opticalPath.isMonochromatic) {
      if (styleOptions.limitValues != null) {
        opticalPath.style.limitValues = [
          Math.max(styleOptions.limitValues[0], opticalPath.minStoredValue),
          Math.min(styleOptions.limitValues[1], opticalPath.maxStoredValue),
        ]
      }
      const [windowCenter, windowWidth] = createWindow(
        opticalPath.style.limitValues[0],
        opticalPath.style.limitValues[1],
      )

      if (styleOptions.paletteColorLookupTable != null) {
        opticalPath.style.paletteColorLookupTable =
          styleOptions.paletteColorLookupTable
        const style = _getColorPaletteStyleForTileLayer({
          windowCenter,
          windowWidth,
          colormap: styleOptions.paletteColorLookupTable.data,
        })
        opticalPath.layer.setStyle(style)
        opticalPath.overviewLayer.setStyle(style)
      } else if (styleOptions.color != null) {
        opticalPath.style.color = styleOptions.color
        if (opticalPath.style.paletteColorLookupTable) {
          const style = _getColorInterpolationStyleForTileLayer({
            windowCenter,
            windowWidth,
            color: opticalPath.style.color,
          })
          opticalPath.style.paletteColorLookupTable = undefined
          opticalPath.layer.setStyle(style)
          opticalPath.overviewLayer.setStyle(style)
        } else {
          const styleVariables = {
            windowCenter,
            windowWidth,
            red: opticalPath.style.color[0],
            green: opticalPath.style.color[1],
            blue: opticalPath.style.color[2],
          }
          opticalPath.layer.updateStyleVariables(styleVariables)
          opticalPath.overviewLayer.updateStyleVariables(styleVariables)
        }
      } else {
        const styleVariables = { windowCenter, windowWidth }
        opticalPath.layer.updateStyleVariables(styleVariables)
        opticalPath.overviewLayer.updateStyleVariables(styleVariables)
      }
    }
  }

  /**
   * Determine whether an optical path is colorable.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @return {boolean} yes/no answer
   */
  isOpticalPathColorable(opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath == null) {
      return false
    }
    return opticalPath.opticalPath.isColorable
  }

  /**
   * Determine whether an optical path is monochromatic.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @return {boolean} yes/no answer
   */
  isOpticalPathMonochromatic(opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath == null) {
      return false
    }
    return opticalPath.opticalisMonochromatic
  }

  /**
   * Get the default style of an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @return {Object} Default style of optical path
   */
  getOpticalPathDefaultStyle(opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath == null) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get default style of optical path. ' +
          `Could not find optical path "${opticalPathIdentifier}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    if (opticalPath.opticalPath.isMonochromatic) {
      if (opticalPath.defaultStyle.paletteColorLookupTable) {
        return {
          paletteColorLookupTable:
            opticalPath.defaultStyle.paletteColorLookupTable,
          opacity: opticalPath.defaultStyle.opacity,
          limitValues: opticalPath.defaultStyle.limitValues,
        }
      }
      return {
        color: opticalPath.defaultStyle.color,
        opacity: opticalPath.defaultStyle.opacity,
        limitValues: opticalPath.defaultStyle.limitValues,
      }
    }

    return { opacity: opticalPath.defaultStyle.opacity }
  }

  /**
   * Get the style of an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @return {Object} Style of optical path
   */
  getOpticalPathStyle(opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath == null) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get style of optical path. ' +
          `Could not find optical path "${opticalPathIdentifier}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    if (opticalPath.opticalPath.isMonochromatic) {
      if (opticalPath.style.paletteColorLookupTable) {
        return {
          paletteColorLookupTable: opticalPath.style.paletteColorLookupTable,
          opacity: opticalPath.style.opacity,
          limitValues: opticalPath.style.limitValues,
        }
      }
      return {
        color: opticalPath.style.color,
        opacity: opticalPath.style.opacity,
        limitValues: opticalPath.style.limitValues,
      }
    }

    return { opacity: opticalPath.style.opacity }
  }

  /**
   * Get image metadata for an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @returns {metadata.VLWholeSlideMicroscopyImage[]} Slide microscopy image
   * metadata
   */
  getOpticalPathMetadata(opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get image metadata optical path. ' +
          `Could not find optical path "${opticalPathIdentifier}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    return opticalPath.pyramid.metadata
  }

  /**
   * Get all optical paths.
   *
   * @return {opticalPath.OpticalPath[]}
   */
  getAllOpticalPaths() {
    const opticalPaths = []

    for (const opticalPathIdentifier in this[_opticalPaths]) {
      opticalPaths.push(this[_opticalPaths][opticalPathIdentifier].opticalPath)
    }

    return opticalPaths.sort((item) => item.OpticalPathIdentifier)
  }

  /**
   * Activate an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   */
  activateOpticalPath(opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot activate optical path. Could not find optical path ' +
          `"${opticalPathIdentifier}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    if (!this.isOpticalPathActive(opticalPathIdentifier)) {
      /*
       * Add layer to the bottom of the layer stack to ensure that vector
       * graphics are overlayed ontop of the raster graphics.
       */
      this[_map].getLayers().insertAt(0, opticalPath.layer)
      if (this[_overviewMap]) {
        this[_overviewMap]
          .getOverviewMap()
          .getLayers()
          .insertAt(0, opticalPath.overviewLayer)
      }
    }
  }

  /**
   * Deactivate an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   */
  deactivateOpticalPath(opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot deactivate optical path. Could not find optical path ' +
          `"${opticalPathIdentifier}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    if (!this.isOpticalPathActive(opticalPathIdentifier)) {
      return
    }

    this[_map].removeLayer(opticalPath.layer)

    if (this[_overviewMap]) {
      this[_overviewMap].getOverviewMap().removeLayer(opticalPath.overviewLayer)
    }
  }

  /**
   * Determine whether an optical path is active.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @return {boolean} active
   */
  isOpticalPathActive(opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath == null) {
      return false
    }

    const layers = this[_map].getLayers()
    const match = layers.getArray().find((layer) => {
      return layer.ol_uid === opticalPath.layer.ol_uid
    })

    if (this[_overviewMap] != null) {
      const overviewLayers = this[_overviewMap].getOverviewMap().getLayers()
      const overviewMatch = overviewLayers.getArray().find((layer) => {
        return layer.ol_uid === opticalPath.overviewLayer.ol_uid
      })
      return match != null || overviewMatch != null
    } else {
      return match != null
    }
  }

  /**
   * Get ICC profiles.
   *
   * @returns {any[]} ICC profiles
   */
  getICCProfiles() {
    return this[_iccProfiles] || []
  }

  /**
   * Get ICC output type.
   *
   * @returns {string} ICC output type
   */
  getICCOutputType() {
    return this[_iccOutputType]
  }

  /**
   * Toggle ICC profiles.
   *
   * @returns {void}
   */
  toggleICCProfiles() {
    console.debug('toggle ICC profiles:', this[_isICCProfilesEnabled])
    const itemsRequiringDecodersAndTransformers = [
      ...Object.values(this[_opticalPaths]),
      ...Object.values(this[_segments]),
      ...Object.values(this[_mappings]),
    ]

    itemsRequiringDecodersAndTransformers.forEach((item) => {
      const metadata = item.pyramid.metadata
      const client = _getClient(
        this[_clients],
        Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE,
      )
      _getIccProfiles({
        metadata,
        client,
        onError: (error) => {
          console.error('Failed to fetch ICC profiles:', error)
          const customError = new CustomError(
            errorTypes.VISUALIZATION,
            'Failed to fetch ICC profiles',
          )
          this[_options].errorInterceptor(customError)
        },
      }).then((profiles) => {
        this[_iccProfiles] = profiles
        const source = item.layer.getSource()
        if (!source) {
          return
        }
        const loaderWithICCProfiles = _createTileLoadFunction({
          targetElement: this[_container],
          iccProfiles: profiles,
          iccOutputType: this[_iccOutputType],
          ...item.loaderParams,
        })
        const loaderWithoutICCProfiles = _createTileLoadFunction({
          targetElement: this[_container],
          ...item.loaderParams,
        })
        const loader = this[_isICCProfilesEnabled]
          ? loaderWithICCProfiles
          : loaderWithoutICCProfiles
        source.setLoader(loader)
        source.refresh()
        item.hasLoader = true
      })
    })

    this[_isICCProfilesEnabled] = !this[_isICCProfilesEnabled]
  }

  /**
   * Toggle segmentation interpolation.
   *
   * @returns {void}
   */
  toggleSegmentationInterpolation() {
    console.debug(
      'toggle segmentation interpolation:',
      this[_segmentationInterpolate],
    )
    this[_segmentationInterpolate] = !this[_segmentationInterpolate]

    const segments = Object.values(this[_segments])

    segments.forEach((segment) => {
      segment.layer.setSource(
        new DataTileSource({
          tileGrid: this[_segmentationTileGrid],
          projection: this[_projection],
          wrapX: false,
          bandCount: 1,
          interpolate: this[_segmentationInterpolate],
        }),
      )
      segment.hasLoader = false
      if (segment.layer.getVisible() === true) {
        this.showSegment(segment.segment.uid)
      } else {
        this.hideSegment(segment.segment.uid)
      }
    })
  }

  /**
   * Toggle parametric map interpolation.
   *
   * @returns {void}
   */
  toggleParametricMapInterpolation() {
    console.debug(
      'toggle parametric map interpolation:',
      this[_parametricMapInterpolate],
    )
    this[_parametricMapInterpolate] = !this[_parametricMapInterpolate]

    const mappings = Object.values(this[_mappings])

    mappings.forEach((mapping) => {
      const tileGrid = new TileGrid({
        extent: mapping.loaderParams.pyramid.extent,
        origins: mapping.loaderParams.pyramid.origins,
        resolutions: mapping.loaderParams.pyramid.resolutions,
        sizes: mapping.loaderParams.pyramid.gridSizes,
        tileSizes: mapping.loaderParams.pyramid.tileSizes,
      })

      mapping.layer.setSource(
        new DataTileSource({
          tileGrid,
          projection: this[_projection],
          wrapX: false,
          bandCount: 1,
          interpolate: this[_parametricMapInterpolate],
        }),
      )
      // Reset hasLoader flag since we created a new source
      mapping.hasLoader = false
      if (mapping.layer.getVisible() === true) {
        this.showParameterMapping(mapping.mapping.uid)
      } else {
        this.hideParameterMapping(mapping.mapping.uid)
      }
    })
  }

  /**
   * Show an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @param {Object} [styleOptions]
   * @param {number[]} [styleOptions.color] - RGB color triplet
   * @param {number[]} [styleOptions.paletteColorLookupTable] - palette color
   * lookup table
   * @param {number} [styleOptions.opacity] - Opacity
   * @param {number[]} [styleOptions.limitValues] - Upper and lower windowing
   * limits
   */
  showOpticalPath(opticalPathIdentifier, styleOptions = {}) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot show optical path. Could not find optical path ' +
          `"${opticalPathIdentifier}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    console.info(`show optical path ${opticalPathIdentifier}`)
    this.activateOpticalPath(opticalPathIdentifier)

    const container = this[_map].getTargetElement()
    if (container && !opticalPath.hasLoader) {
      const metadata = opticalPath.pyramid.metadata
      const client = _getClient(
        this[_clients],
        Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE,
      )
      _getIccProfiles({
        metadata,
        client,
        onError: (error) => {
          console.error('Failed to fetch ICC profiles:', error)
          const customError = new CustomError(
            errorTypes.VISUALIZATION,
            'Failed to fetch ICC profiles',
          )
          this[_options].errorInterceptor(customError)
        },
      }).then((profiles) => {
        this[_iccProfiles] = profiles
        const loader = _createTileLoadFunction({
          targetElement: container,
          iccProfiles: profiles,
          iccOutputType: this[_iccOutputType],
          ...opticalPath.loaderParams,
        })
        const source = opticalPath.layer.getSource()
        source.setLoader(loader)
      })
    }

    opticalPath.layer.setVisible(true)
    opticalPath.overviewLayer.setVisible(true)
    this.setOpticalPathStyle(opticalPathIdentifier, styleOptions)
  }

  /**
   * Hide an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   */
  hideOpticalPath(opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot hide optical path. Could not find optical path ' +
          `"${opticalPathIdentifier}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    console.info(`hide optical path ${opticalPathIdentifier}`)
    opticalPath.layer.setVisible(false)
    opticalPath.overviewLayer.setVisible(false)
  }

  /**
   * Determine if an optical path is visible.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @returns {boolean}
   */
  isOpticalPathVisible(opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot show optical path. Could not find optical path ' +
          `"${opticalPathIdentifier}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    return opticalPath.layer.getVisible()
  }

  /**
   * Resize the viewer to fit the viewport.
   *
   * @returns {void}
   */
  resize() {
    this[_map].updateSize()
    this[_updateOverviewMapSize]()
  }

  /**
   * Size of the viewport.
   *
   * @type {number[]}
   */
  get size() {
    return this[_map].getSize()
  }

  /**
   * Clean up memory by releasing allocated memory
   * to the map and its layers and clearing the viewport.
   */
  cleanup() {
    console.info('cleanup memory')
    if (this[_bulkAnnotationManager] != null) {
      this[_bulkAnnotationManager].cleanup()
      this[_bulkAnnotationManager] = null
    }
    this[_annotationGroups] = {}

    const itemsRequiringDisposal = [
      ...Object.values(this[_opticalPaths]),
      ...Object.values(this[_segments]),
      ...Object.values(this[_mappings]),
    ]

    console.info('items requiring disposal:', itemsRequiringDisposal)

    itemsRequiringDisposal.forEach((item) => {
      if (item.layer) {
        disposeLayer(item.layer)
        this[_map].removeLayer(item.layer)
      }
      if (item.overlay) {
        disposeLayer(item.overlay)
        this[_map].removeOverlay(item.overlay)
      }
      if (item.layers) {
        item.layers.forEach((layer) => {
          disposeLayer(layer)
          this[_map].removeLayer(layer)
        })
      }
      this[_features].clear()
    })

    disposeMapLayers(this[_map])
    disposeOverviewMapLayers(this[_overviewMap])
    webWorkerManager.terminateAllWebWorkers()
  }

  /**
   * Render the images in the specified viewport container.
   *
   * @param {Object} options - Rendering options.
   * @param {(string|HTMLElement)} options.container - HTML Element in which the viewer should be injected.
   */
  render({ container }) {
    window.toggleICCProfiles = this.toggleICCProfiles.bind(this)
    window.getICCProfiles = this.getICCProfiles.bind(this)
    window.cleanup = this.cleanup.bind(this)
    window.zoomToROI = this.zoomToROI.bind(this)
    window.toggleSegmentationInterpolation =
      this.toggleSegmentationInterpolation.bind(this)

    if (container == null) {
      console.error('container must be provided for rendering images')
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'container must be provided for rendering images',
      )
      this[_options].errorInterceptor(error)
      return
    }

    this[_container] = container

    const itemsRequiringDecodersAndTransformers = [
      ...Object.values(this[_opticalPaths]),
      ...Object.values(this[_segments]),
      ...Object.values(this[_mappings]),
    ]

    const styleControlElement = (element) => {
      element.style.backgroundColor = 'rgba(255,255,255,.75)'
      element.style.color = 'black'
      element.style.padding = '2px'
      element.style.margin = '1px'
    }

    itemsRequiringDecodersAndTransformers.forEach(async (item) => {
      const metadata = item.pyramid.metadata
      const client = _getClient(
        this[_clients],
        Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE,
      )

      const profiles = await _getIccProfiles({
        metadata,
        client,
        onError: (error) => {
          console.error('Failed to fetch ICC profiles:', error)
          const customError = new CustomError(
            errorTypes.VISUALIZATION,
            'Failed to fetch ICC profiles',
          )
          this[_options].errorInterceptor(customError)
        },
      })
      this[_iccProfiles] = profiles

      const source = item.layer.getSource()
      if (!source) {
        return
      }

      const loader = _createTileLoadFunction({
        targetElement: container,
        iccProfiles:
          this[_isICCProfilesEnabled] && profiles.length > 0 ? profiles : null,
        iccOutputType:
          this[_isICCProfilesEnabled] && profiles.length > 0
            ? this[_iccOutputType]
            : undefined,
        ...item.loaderParams,
      })
      source.setLoader(loader)
      item.hasLoader = true
      this[_map].setTarget(container)
      const view = this[_map].getView()
      const projection = view.getProjection()
      view.fit(projection.getExtent(), { size: this[_map].getSize() })
      this[_updateOverviewMapSize]()

      if (this[_controls].overview && this[_overviewMap]) {
        // Style overview element (overriding Openlayers CSS "ol-overviewmap")
        const overviewElement = this[_controls].overview.element
        const overviewChildren = overviewElement.children
        const overviewmapElement = Object.values(overviewChildren).find(
          (c) => c.className === 'ol-overviewmap-map',
        )
        const buttonElement = Object.values(overviewChildren).find(
          (c) => c.type === 'button',
        )
        if (buttonElement) {
          buttonElement.title = 'Overview'
          buttonElement.style.border = '0.25px solid black'
          buttonElement.style.backgroundColor = 'white'
          buttonElement.style.cursor = 'pointer'
          const spanElement = buttonElement.children[0]
          spanElement.style.color = 'black'
          spanElement.style.backgroundColor = 'white'
        }
        styleControlElement(overviewmapElement)
        overviewmapElement.style.border = '1px solid black'
        overviewmapElement.style.color = 'black'
        this[_updateOverviewMapSize]()
      }
    })

    // Style scale element (overriding Openlayers CSS "ol-scale-line")
    const scaleElement = this[_controls].scale.element
    scaleElement.style.position = 'absolute'
    scaleElement.style.right = '.5em'
    scaleElement.style.bottom = '.5em'
    scaleElement.style.left = 'auto'
    scaleElement.style.borderRadius = '4px'
    styleControlElement(scaleElement)
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

    // Style position element (overriding Openlayers CSS "ol-mouse-position")
    if (this[_controls].position != null) {
      const positionElement = this[_controls].position.element
      positionElement.style.position = 'absolute'
      positionElement.style.right = '.5em'
      positionElement.style.top = '.5em'
      positionElement.style.left = 'auto'
      positionElement.style.bottom = 'auto'
      positionElement.style.fontWeight = '600'
      positionElement.style.fontSize = '10px'
      positionElement.style.textAlign = 'center'
      positionElement.style.borderRadius = '4px'
      styleControlElement(positionElement)
    }
  }

  /**
   * Number of zoom levels.
   *
   * @type number
   */
  get numLevels() {
    return this[_pyramid].pixelSpacings.length
  }

  /**
   * Frame of Reference UID.
   *
   * @type string
   */
  get frameOfReferenceUID() {
    return this[_pyramid].metadata[0].FrameOfReferenceUID
  }

  /**
   * Get the pixel spacing at a given zoom level.
   *
   * @param {Object} options - Options.
   * @param {number} options.level - Zoom level.
   * @returns {number[]} Spacing between the centers of two neighboring pixels
   */
  getPixelSpacing(level) {
    return this[_pyramid].pixelSpacings[level].slice(0)
  }

  /**
   * Physical offset of images.
   * Offset along the X and Y axes of the slide coordinate system in
   * millimeter unit.
   *
   * @type number[]
   */
  get physicalOffset() {
    const point = applyTransform({
      coordinate: [0, 0],
      affine: this[_affine],
    })
    return [point[0], point[1], 0]
  }

  /**
   * Physical size of images.
   * Length along the X and Y axes of the slide coordinate system in
   * millimeter unit.
   *
   * @type number[]
   */
  get physicalSize() {
    const offset = this.physicalOffset
    const metadata = this[_pyramid].metadata[this[_pyramid].metadata.length - 1]
    const point = applyTransform({
      coordinate: [
        metadata.TotalPixelMatrixColumns,
        metadata.TotalPixelMatrixRows,
      ],
      affine: this[_affine],
    })
    return [Math.abs(point[0] - offset[0]), Math.abs(point[1] - offset[1])]
  }

  /**
   * Bounding box that contains the images.
   *
   * @type number[][]
   */
  get boundingBox() {
    const startPoint = this.physicalOffset
    const metadata = this[_pyramid].metadata[this[_pyramid].metadata.length - 1]
    const endPoint = applyTransform({
      coordinate: [
        metadata.TotalPixelMatrixColumns,
        metadata.TotalPixelMatrixRows,
      ],
      affine: this[_affine],
    })
    const offset = [
      Math.min(startPoint[0], endPoint[0]),
      Math.min(startPoint[1], endPoint[1]),
    ]
    const size = this.physicalSize
    return [offset, size]
  }

  /**
   * Navigate the view to a spatial position or resolution level.
   *
   * @param {Object} options - Options.
   * @param {number} options.level - Zoom level.
   * @param {number[]} options.position - X, Y coordinates in slide coordinate system.
   */
  navigate({ level, position }) {
    if (level > this.numLevels) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Argument "level" exceeds number of resolution levels.',
      )
      throw this[_options].errorInterceptor(error)
    }

    let coordinates
    if (position != null) {
      coordinates = _scoord3dCoordinates2geometryCoordinates(
        position,
        this[_affineInverse],
      )
    }

    const view = this[_map].getView()
    view.animate({ zoom: level, center: coordinates })
  }

  /**
   * Activate the draw interaction for graphic annotation of regions of interest.
   *
   * @param {Object} options - Drawing options
   * @param {string} options.geometryType - Name of the geometry type (point, circle, box, polygon, freehandpolygon, line, freehandline)
   * @param {number} [options.maxPoints] - Maximum number of points for "line"
   * geometry
   * @param {number} [options.minPoints] - Mininum number of points for "line"
   * geometry
   * @param {Object} [options.styleOptions] - Style options
   * @param {Object} [styleOptions.stroke] - Style options for the contour of
   * the geometry
   * @param {number[]} styleOptions.stroke.color - RGBA color of the contour
   * @param {number} styleOptions.stroke.width - Width of the contour
   * @param {Object} [styleOptions.fill] - Style options for the body of the
   * geometry
   * @param {number[]} styleOptions.fill.color - RGBA color of the body
   */
  activateDrawInteraction(options) {
    this.deactivateDrawInteraction()
    console.info('activate "draw" interaction')

    const geometryOptionsMapping = {
      point: {
        type: 'Point',
        geometryName: 'Point',
      },
      circle: {
        type: 'Circle',
        geometryName: 'Circle',
      },
      box: {
        type: 'Circle',
        geometryName: 'Box',
        geometryFunction: createBox(),
      },
      polygon: {
        type: 'Polygon',
        geometryName: 'Polygon',
        freehand: false,
      },
      freehandpolygon: {
        type: 'Polygon',
        geometryName: 'FreeHandPolygon',
        freehand: true,
      },
      line: {
        type: 'LineString',
        geometryName: 'Line',
        freehand: false,
        maxPoints: options.maxPoints,
        minPoints: options.minPoints,
      },
      freehandline: {
        type: 'LineString',
        geometryName: 'FreeHandLine',
        freehand: true,
      },
    }

    if (!('geometryType' in options)) {
      console.error('geometry type must be specified for drawing interaction')
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'geometry type must be specified for drawing interaction',
      )
      this[_options].errorInterceptor(error)
    }

    if (!(options.geometryType in geometryOptionsMapping)) {
      console.error(`unsupported geometry type "${options.geometryType}"`)
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        `unsupported geometry type "${options.geometryType}"`,
      )
      this[_options].errorInterceptor(error)
    }

    const internalDrawOptions = { source: this[_drawingSource] }
    const geometryDrawOptions = geometryOptionsMapping[options.geometryType]
    const builtInDrawOptions = {
      [Enums.InternalProperties.Marker]:
        options[Enums.InternalProperties.Marker],
      [Enums.InternalProperties.Markup]:
        options[Enums.InternalProperties.Markup],
      [Enums.InternalProperties.Label]: options[Enums.InternalProperties.Label],
    }
    const drawOptions = Object.assign(
      internalDrawOptions,
      geometryDrawOptions,
      builtInDrawOptions,
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
      event.feature.setId(_generateUID())

      /** Set external styles before calling internal annotation hooks */
      _setFeatureStyle(
        event.feature,
        options[Enums.InternalProperties.StyleOptions],
      )

      this[_annotationManager].onDrawStart(event)

      _wireMeasurementsAndQualitativeEvaluationsEvents(
        this[_map],
        event.feature,
        this[_pyramid].metadata,
        this[_affine],
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
        this._getROIFromFeature(
          event.feature,
          this[_pyramid].metadata,
          this[_affine],
        ),
      )
    })

    this[_map].addInteraction(this[_interactions].draw)
  }

  /**
   * Deactivate draw interaction.
   */
  deactivateDrawInteraction() {
    console.info('deactivate "draw" interaction')
    if (this[_interactions].draw !== undefined) {
      this[_map].removeInteraction(this[_interactions].draw)
      this[_interactions].draw = undefined
    }
  }

  /**
   * Whether draw interaction is active
   *
   * @type boolean
   */
  get isDrawInteractionActive() {
    return this[_interactions].draw !== undefined
  }

  /**
   * Whether drag pan interaction is active.
   *
   * @type boolean
   */
  get isDragPanInteractionActive() {
    return this[_interactions].dragPan !== undefined
  }

  /**
   * Whether drag zoom interaction is active.
   *
   * @type boolean
   */
  get isDragZoomInteractionActive() {
    return this[_interactions].dragZoom !== undefined
  }

  /**
   * Whether translate interaction is active.
   *
   * @type boolean
   */
  get isTranslateInteractionActive() {
    return this[_interactions].translate !== undefined
  }

  /**
   * Activate translate interaction.
   *
   * @param {Object} options - Translation options.
   */
  activateTranslateInteraction(options = {}) {
    this.deactivateTranslateInteraction()

    console.info('activate "translate" interaction')

    const translateOptions = { layers: [this[_drawingLayer]] }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      translateOptions.condition = _getInteractionBindingCondition(
        options.bindings,
      )
    }

    this[_interactions].translate = new Translate(translateOptions)
    this[_map].addInteraction(this[_interactions].translate)
  }

  /**
   * Zoom the map view to the feature with the given ROI id.
   *
   * @param {string} uid - Unique identifier of the region of interest or annotation group UID
   */
  zoomToROI(uid) {
    const feature = this[_drawingSource].getFeatureById(uid)
    if (feature) {
      const geometry = feature.getGeometry()
      if (!geometry) {
        console.warn(`Feature with UID "${uid}" has no geometry to zoom to.`)
        return
      }
      const view = this[_map].getView()
      const extent = geometry.getExtent()
      const center = getCenter(extent)
      const width = getWidth(extent)
      const height = getHeight(extent)
      const scale = 7
      const expandedExtent = [
        center[0] - (width * scale) / 2,
        center[1] - (height * scale) / 2,
        center[0] + (width * scale) / 2,
        center[1] + (height * scale) / 2,
      ]
      view.fit(expandedExtent, { duration: 500 })
      return
    }

    /** Annotation-group UID — zoom to first annotation (parity with prior OL path). */
    if (this[_bulkAnnotationManager]?.zoomToAnnotationGroup(uid)) {
      return
    }
    console.warn(`Could not find a ROI with UID "${uid}" to zoom to.`)
  }

  /**
   * Extract and transform the region of interest (ROI).
   *
   * @param {Object} feature - Openlayers Feature
   * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
   * @param {number[][]} affine - 3x3 affine transformation matrix
   * @param {Object} context - Context
   * @returns {roi.ROI} Region of interest
   * @private
   */
  _getROIFromFeature(feature, pyramid, affine) {
    let scoord3d
    try {
      scoord3d = _geometry2Scoord3d(feature, pyramid, affine)
    } catch (error) {
      const uid = feature.getId()
      this.removeROI(uid)
      const roiError = new CustomError(
        errorTypes.VISUALIZATION,
        `Unable to get ROI: ${error.message}`,
      )
      throw this[_options].errorInterceptor(roiError || error)
    }

    const featureProperties = feature.getProperties()
    const properties = {
      measurements: featureProperties.measurements,
      evaluations: featureProperties.evaluations,
    }
    const uid = feature.getId()
    if (uid) {
      return new ROI({ scoord3d, properties, uid })
    }
  }

  /**
   * Build a frozen roi.ROI for a deck.gl bulk-annotation pick.
   * @private
   */
  _buildBulkAnnotationROI(hit, record) {
    if (hit == null || record?.decoded == null) {
      return null
    }
    const { positions, startIndices, graphicType } = record.decoded
    const start = startIndices[hit.annotationIndex]
    const end = startIndices[hit.annotationIndex + 1]
    const affine = this[_affine]
    const frameOfReferenceUID =
      this[_pyramid]?.metadata?.[0]?.FrameOfReferenceUID

    const mapToSlide = (mapX, mapY) => {
      const col = mapX
      const row = -mapY - 1
      return applyTransform({ coordinate: [col, row], affine })
    }

    const coords = []
    for (let i = start; i < end; i++) {
      const slide = mapToSlide(positions[i * 2], positions[i * 2 + 1])
      coords.push([slide[0], slide[1], 0])
    }

    let scoord3d
    try {
      if (graphicType === 'POINT') {
        scoord3d = new Point({
          coordinates: coords[0],
          frameOfReferenceUID,
        })
      } else if (graphicType === 'POLYLINE') {
        scoord3d = new Polyline({
          coordinates: coords,
          frameOfReferenceUID,
        })
      } else {
        /** POLYGON / RECTANGLE / ELLIPSE */
        scoord3d = new Polygon({
          coordinates: coords,
          frameOfReferenceUID,
        })
      }
    } catch (error) {
      console.warn('[bulkAnnotations] failed to build scoord3d for pick', error)
      return null
    }

    const uid = `${hit.annotationGroupUID}-${hit.annotationIndex}`
    let roi = new ROI({ scoord3d, properties: {}, uid })
    try {
      roi = getExtendedROI({
        annotationGroupUID: hit.annotationGroupUID,
        annotationIndex: hit.annotationIndex,
        roi,
        metadata: record.metadata,
        annotationGroup: record.metadataItem,
      })
    } catch (error) {
      console.warn('[bulkAnnotations] getExtendedROI failed', error)
    }
    return roi
  }

  /**
   * Measurement value range for an annotation group (for slim limitValues UI).
   *
   * @param {string} annotationGroupUID
   * @param {Object} [measurement]
   * @returns {{ min: number, max: number }}
   */
  getAnnotationGroupMeasurementRange(annotationGroupUID, measurement) {
    return this._getBulkAnnotationManager().getAnnotationGroupMeasurementRange(
      annotationGroupUID,
      measurement,
    )
  }

  /**
   * Toggle overview map.
   *
   * @returns {void}
   */
  toggleOverviewMap() {
    if (this[_overviewMap]) {
      const controls = this[_map].getControls()
      const overview = controls.getArray().find((c) => c === this[_overviewMap])
      if (overview) {
        this[_map].removeControl(this[_overviewMap])
        delete this[_controls].overview
      } else {
        this[_controls].overview = this[_overviewMap]
        this[_map].addControl(this[_overviewMap])
        const map = this[_overviewMap].getOverviewMap()
        const view = map.getView()
        const projection = view.getProjection()
        view.fit(projection.getExtent(), { size: map.getSize() })
      }
    }
  }

  /**
   * Deactivate translate interaction.
   *
   * @returns {void}
   */
  deactivateTranslateInteraction() {
    console.info('deactivate "translate" interaction')
    if (this[_interactions].translate) {
      this[_map].removeInteraction(this[_interactions].translate)
      this[_interactions].translate = undefined
    }
  }

  /**
   * Activate drag zoom interaction.
   *
   * @param {Object} options - Options.
   */
  activateDragZoomInteraction(options = {}) {
    this.deactivateDragZoomInteraction()

    console.info('activate "dragZoom" interaction')

    const dragZoomOptions = { layers: [this[_drawingLayer]] }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      dragZoomOptions.condition = _getInteractionBindingCondition(
        options.bindings,
      )
    }

    this[_interactions].dragZoom = new DragZoom(dragZoomOptions)
    this[_map].addInteraction(this[_interactions].dragZoom)
  }

  /**
   * Deactivate drag zoom interaction.
   */
  deactivateDragZoomInteraction() {
    console.info('deactivate "dragZoom" interaction')
    if (this[_interactions].dragZoom) {
      this[_map].removeInteraction(this[_interactions].dragZoom)
      this[_interactions].dragZoom = undefined
    }
  }

  /**
   * Activate select interaction.
   *
   * @param {Object} options selection options.
   */
  activateSelectInteraction(options = {}) {
    this.deactivateSelectInteraction()

    console.info('activate "select" interaction')

    const selectOptions = { layers: [this[_drawingLayer]] }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      selectOptions.condition = _getInteractionBindingCondition(
        options.bindings,
      )
    }

    this[_interactions].select = new Select(selectOptions)
    const container = this[_map].getTargetElement()

    this[_interactions].select.on('select', (e) => {
      if (e.selected[0]?.getId()) {
        publish(
          container,
          EVENT.ROI_SELECTED,
          this._getROIFromFeature(
            e.selected[0],
            this[_pyramid].metadata,
            this[_affine],
          ),
        )
      }
    })

    this[_map].addInteraction(this[_interactions].select)
  }

  /**
   * Deactivate select interaction.
   */
  deactivateSelectInteraction() {
    console.info('deactivate "select" interaction')
    if (this[_interactions].select) {
      this[_map].removeInteraction(this[_interactions].select)
      this[_interactions].select = undefined
    }
  }

  /**
   * Clear all selections.
   */
  clearSelections() {
    this.deactivateSelectInteraction()
    this.activateSelectInteraction()
  }

  /**
   * Activate drag pan interaction.
   *
   * @param {Object} options - Options.
   */
  activateDragPanInteraction(options = {}) {
    this.deactivateDragPanInteraction()

    console.info('activate "drag pan" interaction')

    const dragPanOptions = {
      features: this[_features],
    }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      dragPanOptions.condition = _getInteractionBindingCondition(
        options.bindings,
      )
    }

    this[_interactions].dragPan = new DragPan(dragPanOptions)
    this[_map].addInteraction(this[_interactions].dragPan)
  }

  /**
   * Deactivate drag pan interaction.
   */
  deactivateDragPanInteraction() {
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
  activateSnapInteraction(_options = {}) {
    this.deactivateSnapInteraction()
    console.info('activate "snap" interaction')
    this[_interactions].snap = new Snap({
      source: this[_drawingSource],
    })

    this[_map].addInteraction(this[_interactions].snap)
  }

  /**
   * Deactivate snap interaction.
   */
  deactivateSnapInteraction() {
    console.info('deactivate "snap" interaction')
    if (this[_interactions].snap) {
      this[_map].removeInteraction(this[_interactions].snap)
      this[_interactions].snap = undefined
    }
  }

  /**
   * Whether select interaction is active.
   *
   * @type boolean
   */
  get isSelectInteractionActive() {
    return this[_interactions].select !== undefined
  }

  /**
   * Activate modify interaction.
   *
   * @param {Object} options - Modification options.
   */
  activateModifyInteraction(options = {}) {
    this.deactivateModifyInteraction()

    console.info('activate "modify" interaction')

    const modifyOptions = {
      features: this[_features],
      insertVertexCondition: (_event) => true,
    }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      modifyOptions.condition = _getInteractionBindingCondition(
        options.bindings,
      )
    }

    this[_interactions].modify = new Modify(modifyOptions)
    const container = this[_map].getTargetElement()

    this[_interactions].modify.on(
      Enums.InteractionEvents.MODIFY_END,
      (event) => {
        const feature = event.features.item(0)
        _updateFeatureMeasurements(
          this[_map],
          feature,
          this[_pyramid].metadata,
          this[_affine],
        )
        this[_annotationManager].onUpdate(feature)
        publish(
          container,
          EVENT.ROI_MODIFIED,
          this._getROIFromFeature(
            feature,
            this[_pyramid].metadata,
            this[_affine],
          ),
        )
      },
    )

    this[_map].addInteraction(this[_interactions].modify)
  }

  /**
   * Deactivate modify interaction.
   */
  deactivateModifyInteraction() {
    console.info('deactivate "modify" interaction')
    if (this[_interactions].modify) {
      this[_map].removeInteraction(this[_interactions].modify)
      this[_interactions].modify = undefined
    }
  }

  /**
   * Whether modify interaction is active.
   *
   * @type boolean
   */
  get isModifyInteractionActive() {
    return this[_interactions].modify !== undefined
  }

  /**
   * Get all annotated regions of interest.
   *
   * @returns {roi.ROI[]} Array of regions of interest.
   */
  getAllROIs() {
    const rois = []
    this[_features].forEach((item) => {
      rois.push(this.getROI(item.getId()))
    })
    return rois
  }

  collapseOverviewMap() {
    if (this[_overviewMap]) {
      this[_overviewMap].setCollapsed(true)
    }
  }

  expandOverviewMap() {
    if (this[_overviewMap]) {
      this[_overviewMap].setCollapsed(true)
    }
  }

  /**
   * Number of annotated regions of interest.
   *
   * @return {number}
   */
  get numberOfROIs() {
    return this[_features].getLength()
  }

  /**
   * Get an individual annotated region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @returns {roi.ROI} Region of interest.
   */
  getROI(uid) {
    const feature = this[_drawingSource].getFeatureById(uid)
    if (feature == null) {
      console.warn(`Could not find a ROI with UID "${uid}".`)
      return
    }
    return this._getROIFromFeature(
      feature,
      this[_pyramid].metadata,
      this[_affine],
    )
  }

  /**
   * Add a measurement to a region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @param {Object} item - NUM content item representing a measurement
   */
  addROIMeasurement(uid, item) {
    const meaning = item.ConceptNameCodeSequence[0].CodeMeaning
    console.info(`add measurement "${meaning}" to ROI ${uid}`)
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
   * @param {Object} item - CODE content item representing a qualitative evaluation
   */
  addROIEvaluation(uid, item) {
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

  /**
   * Pop the most recently annotated regions of interest.
   *
   * @returns {roi.ROI} Regions of interest.
   */
  popROI() {
    console.info('pop ROI')
    const feature = this[_features].pop()
    return this._getROIFromFeature(
      feature,
      this[_pyramid].metadata,
      this[_affine],
    )
  }

  /**
   * Add a regions of interest.
   *
   * @param {roi.ROI} roi - Regions of interest
   * @param {Object} [styleOptions] - Style options
   * @param {Object} [styleOptions.stroke] - Style options for the contour of
   * the geometry
   * @param {number[]} styleOptions.stroke.color - RGBA color of the contour
   * @param {number} styleOptions.stroke.width - Width of the contour
   * @param {Object} [styleOptions.fill] - Style options for the body of the
   * geometry
   * @param {number[]} styleOptions.fill.color - RGBA color of the body
   */
  addROI(roi, styleOptions = {}) {
    console.info(`add ROI "${roi.uid}"`)

    // Avoid insertion of duplicates
    let exists = false
    for (let i = 0; i < this[_features].getLength(); i++) {
      const feature = this[_features].item(i)
      if (feature.getId() === roi.uid) {
        exists = true
        break
      }
    }
    if (exists) {
      console.warn(`ROI "${roi.uid}" not added because it already exists`)
    }

    // TODO: Check for 3D coordinate dimentionality?
    const frameOfReferenceUID = this[_pyramid].metadata.FrameOfReferenceUID
    if (roi.frameOfReferenceUID !== frameOfReferenceUID) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        `Frame of Reference UID of ROI ${roi.uid} does not match ` +
          'Frame of Reference UID of source images.',
      )
      throw this[_options].errorInterceptor(error)
    }

    const geometry = _scoord3d2Geometry(roi.scoord3d, this[_affineInverse])
    const featureOptions = { geometry }

    const feature = new Feature(featureOptions)
    _addROIPropertiesToFeature(feature, roi.properties, true)
    feature.setId(roi.uid)

    _wireMeasurementsAndQualitativeEvaluationsEvents(
      this[_map],
      feature,
      this[_pyramid].metadata,
      this[_affine],
    )

    this[_features].push(feature)
    _setFeatureStyle(feature, styleOptions)
    const isVisible = Object.keys(styleOptions).length !== 0
    this[_annotationManager].setMarkupVisibility(roi.uid, isVisible)
  }

  /**
   * Update properties of a region of interest.
   *
   * @param {Object} roi - ROI to be updated
   * @param {string} roi.uid - Unique identifier of the region of interest
   * @param {Object} roi.properties - ROI properties
   * @param {Object} [roi.properties.measurements] - ROI measurements
   * @param {Object} [roi.properties.evaluations] - ROI evaluations
   * @param {Object} [roi.properties.label] - ROI label
   * @param {Object} [roi.properties.marker] - ROI marker
   */
  updateROI({ uid, properties = {} }) {
    if (!uid) return
    console.info(`update ROI ${uid}`)
    const feature = this[_drawingSource].getFeatureById(uid)
    _addROIPropertiesToFeature(feature, properties)
    this[_annotationManager].onUpdate(feature)
  }

  /**
   * Get the style of a region of interest.
   *
   * @param {string} uid - Unique identifier of the regions of interest
   *
   * @returns {Object} - Style settings
   */
  getROIStyle(uid) {
    const feature = this[_features].getArray().find((feature) => {
      return feature.getId() === uid
    })

    if (feature == null) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        `Could not find a ROI with UID "${uid}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const style = feature.getStyle()
    const stroke = style.getStroke()
    const fill = style.getFill()
    return {
      stroke: {
        color: stroke.getColor(),
        width: stroke.getWidth(),
      },
      fill: {
        color: fill.getColor(),
      },
    }
  }

  /**
   * Set the style of a region of interest.
   *
   * @param {string} uid - Unique identifier of the regions of interest
   * @param {Object} styleOptions - Style options
   * @param {Object} [styleOptions.stroke] - Style options for the contour of
   * the geometry
   * @param {number[]} styleOptions.stroke.color - RGBA color of the contour
   * @param {number} styleOptions.stroke.width - Width of the contour
   * @param {Object} [styleOptions.fill] - Style options for the body of the
   * geometry
   * @param {number[]} styleOptions.fill.color - RGBA color of the body
   */
  setROIStyle(uid, styleOptions = {}) {
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
   * @param {Object} options - Overlay options
   * @param {Object} options.element - The custom overlay HTML element
   * @param {number[]} options.coordinates - Offset of the overlay along the X and
   * Y axes of the slide coordinate system
   * @param {bool} [options.coordinates=false] - Whether the viewer should
   * automatically navigate to the element such that it is in focus and fully
   * visible
   * @param {string} [options.className] - Class to style the overlay container
   */
  addViewportOverlay({ element, coordinates, navigate, className }) {
    const offset = _scoord3dCoordinates2geometryCoordinates(
      coordinates,
      this[_affineInverse],
    )
    const overlay = new Overlay({
      element,
      className:
        className != null
          ? `ol-overlay-container ol-selectable ${className}`
          : 'ol-overlay-container ol-selectable',
      offset,
      autoPan: navigate != null ? navigate : false,
      stopEvent: false,
    })
    this[_overlays][element.id] = overlay
    this[_map].addOverlay(overlay)
  }

  /**
   * Remove an existing viewport overlay.
   *
   * @param {Object} options - Overlay options
   * @param {Object} options.element - The custom overlay HTML element
   */
  removeViewportOverlay({ element }) {
    const id = element.id
    if (id in this[_overlays]) {
      const overlay = this[_overlays][id]
      this[_map].removeOverlay(overlay)
      delete this[_overlays][id]
    }
  }

  /**
   * Remove an individual regions of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   */
  removeROI(uid) {
    console.info(`remove ROI ${uid}`)
    const feature = this[_drawingSource].getFeatureById(uid)

    if (feature) {
      this[_features].remove(feature)
      this[_annotationManager].onRemove(feature)
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
  removeAllROIs() {
    console.info('remove all ROIs')
    this[_features].clear()
  }

  /**
   * Hide annotated regions of interest.
   */
  hideROIs() {
    console.info('hide ROIs')
    this[_drawingLayer].setVisible(false)
    this[_annotationManager].setVisible(false)
  }

  /**
   * Show annotated regions of interest.
   */
  showROIs() {
    console.info('show ROIs')
    this[_drawingLayer].setVisible(true)
    this[_annotationManager].setVisible(true)
  }

  /**
   * Whether annotated regions of interest are currently visible.
   *
   * @return {boolean}
   */
  get areROIsVisible() {
    return this[_drawingLayer].getVisible()
  }

  /**
   * Compute whether the current view is in high-resolution mode based on pixel size vs threshold.
   * When clusteringPixelSizeThreshold is undefined, returns true (always high-res, clustering disabled).
   * Validates resolutions, currentResolution, and pixelSpacings to avoid NaN/TypeError.
   *
   * @param {import('ol/View').default} view - OpenLayers map view
   * @returns {boolean} true if high-resolution layer should be shown
   * @private
   */
  _computeIsHighResolution(view) {
    const clusteringPixelSizeThreshold =
      this[_annotationOptions]?.clusteringPixelSizeThreshold
    if (clusteringPixelSizeThreshold === undefined) {
      return true
    }

    const currentResolution = view.getResolution()
    if (
      typeof currentResolution !== 'number' ||
      !Number.isFinite(currentResolution) ||
      currentResolution <= 0
    ) {
      return true
    }

    const resolutions = this[_tileGrid].getResolutions()
    if (!resolutions || resolutions.length === 0) {
      return true
    }

    let closestLevelIndex = 0
    if (resolutions.length >= 2) {
      let minDiff = Math.abs(resolutions[0] - currentResolution)
      for (let i = 1; i < resolutions.length; i++) {
        const diff = Math.abs(resolutions[i] - currentResolution)
        if (diff < minDiff) {
          minDiff = diff
          closestLevelIndex = i
        }
      }
    }

    const pixelSpacings = this[_pyramid].pixelSpacings
    const currentPixelSpacing = pixelSpacings?.[closestLevelIndex]
    if (!currentPixelSpacing || currentPixelSpacing.length < 2) {
      return true
    }

    const currentPixelSize = Math.min(
      currentPixelSpacing[0],
      currentPixelSpacing[1],
    )
    return currentPixelSize <= clusteringPixelSizeThreshold
  }

  /**
   * Handle the start of a bulk annotations features load event.
   * @private
   */
  _onBulkAnnotationsFeaturesLoadStart(event) {
    const container = this[_map].getTargetElement()
    publish(container, EVENT.LOADING_STARTED, event)
  }

  /**
   * Handle the end of a bulk annotations features load event.
   * @private
   */
  _onBulkAnnotationsFeaturesLoadEnd(event) {
    const container = this[_map].getTargetElement()
    publish(container, EVENT.LOADING_ENDED, event)
  }

  /**
   * Handle the error of a bulk annotations features load event.
   * @private
   */
  _onBulkAnnotationsFeaturesLoadError(event) {
    const container = this[_map].getTargetElement()
    const customError = new CustomError(
      errorTypes.VISUALIZATION,
      `Failed to load bulk annotations: ${event.type}`,
    )
    publish(container, EVENT.LOADING_ERROR, customError)
  }

  /**
   * Lazily construct the deck.gl bulk-annotation manager.
   * @private
   */
  _getBulkAnnotationManager() {
    if (this[_bulkAnnotationManager] != null) {
      return this[_bulkAnnotationManager]
    }
    this[_bulkAnnotationManager] = new BulkAnnotationManager({
      getMap: () => this[_map],
      getPyramid: () => this[_pyramid],
      getAffineInverse: () => this[_affineInverse],
      getClient: () =>
        _getClient(
          this[_clients],
          Enums.SOPClassUIDs.MICROSCOPY_BULK_SIMPLE_ANNOTATIONS ||
            Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE,
        ),
      getContainer: () =>
        this[_container] || this[_map]?.getTargetElement?.() || null,
      annotationOptions: this[_annotationOptions],
      errorInterceptor: this[_options].errorInterceptor,
      primaryColor: this[_options].primaryColor,
    })
    return this[_bulkAnnotationManager]
  }

  /**
   * Add annotation groups.
   *
   * Registers Microscopy Bulk Simple Annotation groups with the deck.gl
   * renderer. Coordinate data is fetched lazily on showAnnotationGroup.
   *
   * @param {metadata.MicroscopyBulkSimpleAnnotations} metadata - Metadata of a
   * DICOM Microscopy Simple Bulk Annotations instance
   */
  addAnnotationGroups(metadata) {
    console.info(
      'add annotation groups of Microscopy Bulk Simple Annotation instances ' +
        `of series "${metadata.SeriesInstanceUID}"`,
    )
    const manager = this._getBulkAnnotationManager()
    manager.addAnnotationGroups(metadata)

    /**
     * Keep a lightweight mirror on `_annotationGroups` for cleanup / legacy
     * readers. Rendering is owned by BulkAnnotationManager.
     */
    for (const group of manager.getAllAnnotationGroups()) {
      const uid = group.uid
      if (this[_annotationGroups][uid]) {
        continue
      }
      this[_annotationGroups][uid] = {
        annotationGroup: group,
        style: manager.getAnnotationGroupStyle(uid),
        defaultStyle: manager.getAnnotationGroupDefaultStyle(uid),
        metadata: manager.getAnnotationGroupMetadata(uid),
        layers: [],
        activeLayer: () => ({
          getVisible: () => manager.isAnnotationGroupVisible(uid),
          setVisible: (v) => {
            if (v) manager.showAnnotationGroup(uid)
            else manager.hideAnnotationGroup(uid)
          },
          setOpacity: () => {},
          setStyle: () => {},
          getSource: () => null,
        }),
      }
    }
  }

  /**
   * @deprecated OpenLayers vector styles are no longer used for bulk annotations.
   * Kept for API compatibility.
   */
  getGraphicTypeLayerStyle(_annotationGroup) {
    console.warn(
      '[bulkAnnotations] getGraphicTypeLayerStyle is deprecated; bulk annotations use deck.gl styles.',
    )
    return null
  }

  /**
   * Remove an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation
   * group
   */
  removeAnnotationGroup(annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Cannot remove annotation group. ' +
          `Could not find annotation group "${annotationGroupUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }
    console.info(`remove annotation group ${annotationGroupUID}`)
    this._getBulkAnnotationManager().removeAnnotationGroup(annotationGroupUID)
    delete this[_annotationGroups][annotationGroupUID]
  }

  /**
   * Remove all annotation groups.
   */
  removeAllAnnotationGroups() {
    Object.keys(this[_annotationGroups]).forEach((annotationGroupUID) => {
      this.removeAnnotationGroup(annotationGroupUID)
    })
  }

  /**
   * Show an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation
   * group
   * @param {Object} styleOptions
   * @param {number} [styleOptions.opacity] - Opacity
   * @param {number[]} [styleOptions.color] - RGB color triplet
   * @param {Object} [styleOptions.measurement] - Selected measurement
   */
  showAnnotationGroup(annotationGroupUID, styleOptions = {}) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Cannot show annotation group. ' +
          `Could not find annotation group "${annotationGroupUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }
    console.info(`show annotation group ${annotationGroupUID}`)
    this._getBulkAnnotationManager().showAnnotationGroup(
      annotationGroupUID,
      styleOptions,
    )
    const mirror = this[_annotationGroups][annotationGroupUID]
    if (mirror) {
      mirror.style = {
        ...mirror.style,
        ...this._getBulkAnnotationManager().getAnnotationGroupStyle(
          annotationGroupUID,
        ),
      }
    }
  }

  /**
   * Hide an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation
   * group
   */
  hideAnnotationGroup(annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Cannot hide annotation group. ' +
          `Could not find annotation group "${annotationGroupUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }
    console.info(`hide annotation group ${annotationGroupUID}`)
    this._getBulkAnnotationManager().hideAnnotationGroup(annotationGroupUID)
  }

  /**
   * Is annotation group visible.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation
   * group
   */
  isAnnotationGroupVisible(annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Cannot determine if annotation group is visible. ' +
          `Could not find annotation group "${annotationGroupUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }
    return this._getBulkAnnotationManager().isAnnotationGroupVisible(
      annotationGroupUID,
    )
  }

  /**
   * Update annotation options.
   *
   * @param {Object} options - Annotation options
   * @param {number} [options.clusteringPixelSizeThreshold] - Pixel size threshold
   * in millimeters. When the current pixel size is smaller than or equal to this
   * threshold, clustering is disabled (high resolution mode). Set to undefined
   * to always use high-resolution layer (disable clustering).
   * @returns {void}
   */
  setAnnotationOptions(options = {}) {
    if ('clusteringPixelSizeThreshold' in options) {
      if (options.clusteringPixelSizeThreshold !== undefined) {
        this[_annotationOptions].clusteringPixelSizeThreshold =
          options.clusteringPixelSizeThreshold
      } else {
        delete this[_annotationOptions].clusteringPixelSizeThreshold
      }
    }
    if ('lodLevelsFromFinest' in options) {
      this[_annotationOptions].lodLevelsFromFinest = options.lodLevelsFromFinest
    }
    this._getBulkAnnotationManager().setAnnotationOptions(options)
  }

  /**
   * Set style of an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation
   * group
   * @param {Object} styleOptions - Style options
   * @param {number} [styleOptions.opacity] - Opacity
   * @param {number[]} [styleOptions.color] - RGB color triplet
   * @param {Object} [styleOptions.measurement] - Selected measurement for
   * pseudo-coloring of annotations using measurement values
   * @returns {void}
   */
  setAnnotationGroupStyle(annotationGroupUID, styleOptions = {}) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot set style of annotation group. ' +
          `Could not find annotation group "${annotationGroupUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }
    console.info(
      `set style for annotation group "${annotationGroupUID}"`,
      styleOptions,
    )
    this._getBulkAnnotationManager().setAnnotationGroupStyle(
      annotationGroupUID,
      styleOptions,
    )
    const mirror = this[_annotationGroups][annotationGroupUID]
    if (mirror) {
      mirror.style =
        this._getBulkAnnotationManager().getAnnotationGroupStyle(
          annotationGroupUID,
        )
    }
  }

  /**
   * Get default style of an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation
   * group
   *
   * @returns {Object} - Default style settings
   */
  getAnnotationGroupDefaultStyle(annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get default style of annotation group. ' +
          `Could not find annotation group "${annotationGroupUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    return {
      opacity: annotationGroup.defaultStyle.opacity,
      color: annotationGroup.defaultStyle.color,
    }
  }

  /**
   * Get style of an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation
   * group
   *
   * @returns {Object} - Style settings
   */
  getAnnotationGroupStyle(annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get style of annotation group. ' +
          `Could not find annotation group "${annotationGroupUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    return {
      opacity: annotationGroup.style.opacity,
      color: annotationGroup.style.color,
    }
  }

  /**
   * Get all annotation groups.
   *
   * @returns {annotation.AnnotationGroup[]}
   */
  getAllAnnotationGroups() {
    const groups = []
    for (const annotationGroupUID in this[_annotationGroups]) {
      groups.push(this[_annotationGroups][annotationGroupUID].annotationGroup)
    }
    return groups
  }

  /**
   * Get annotation group metadata.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation group
   *
   * @returns {metadata.MicroscopyBulkSimpleAnnotations} - Metadata of DICOM
   * Microscopy Bulk Simple Annotations instance
   */
  getAnnotationGroupMetadata(annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get metadata of annotation group. ' +
          `Could not find annotation group "${annotationGroupUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    return annotationGroup.metadata
  }

  /**
   * Add segments.
   *
   * @param {metadata.Segmentation[]} metadata - Metadata of one or more DICOM Segmentation instances
   */
  addSegments(metadata) {
    if (metadata.length === 0) {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Metadata of Segmentation instances needs to be provided to ' +
          'add segments.',
      )
      throw this[_options].errorInterceptor(error)
    }

    const refSegmentation = metadata[0]
    const refImage = this[_pyramid].metadata[0]
    metadata.forEach((instance) => {
      if (
        instance.TotalPixelMatrixColumns === undefined ||
        instance.TotalPixelMatrixRows === undefined
      ) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Segmentation instances must contain attributes ' +
            '"Total Pixel Matrix Rows" and "Total Pixel Matrix Columns".',
        )
        throw this[_options].errorInterceptor(error)
      }

      if (refImage.FrameOfReferenceUID !== instance.FrameOfReferenceUID) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Segmentation instances must have the same Frame of Reference UID ' +
            'as the corresponding source images.',
        )
        throw this[_options].errorInterceptor(error)
      }

      if (
        refSegmentation.FrameOfReferenceUID !== instance.FrameOfReferenceUID
      ) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Segmentation instances must all have same Frame of Reference UID.',
        )
        throw this[_options].errorInterceptor(error)
      }

      if (refSegmentation.SeriesInstanceUID !== instance.SeriesInstanceUID) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Segmentation instances must all have same Series Instance UID.',
        )
        throw this[_options].errorInterceptor(error)
      }

      if (
        refSegmentation.SegmentSequence.length !==
        instance.SegmentSequence.length
      ) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Segmentation instances must all contain the same number of items ' +
            'in the Segment Sequence.',
        )
        throw this[_options].errorInterceptor(error)
      }
    })

    console.info(
      'add segments of Segmentation instances of series ' +
        `"${refSegmentation.SeriesInstanceUID}"`,
    )

    const pyramid = _computeImagePyramid({ metadata })
    const [fittedPyramid, minZoomLevel, maxZoomLevel] = _fitImagePyramid(
      pyramid,
      this[_pyramid],
    )

    const tileGrid = new TileGrid({
      extent: fittedPyramid.extent,
      origins: fittedPyramid.origins,
      resolutions: fittedPyramid.resolutions,
      sizes: fittedPyramid.gridSizes,
      tileSizes: fittedPyramid.tileSizes,
    })
    this[_segmentationTileGrid] = tileGrid

    let minStoredValue = 0
    let maxStoredValue = 255
    if (refSegmentation.SegmentationType === 'BINARY') {
      minStoredValue = 0
      maxStoredValue = 1
    }

    /**
     * Fractional segments are colorized with distinct, single-hue color maps so
     * that multiple overlays are easy to tell apart and to match against the
     * legend (see issue #240). Continue the hue sequence from any fractional
     * segments that already exist so newly added series do not reuse hues.
     */
    const isFractional = refSegmentation.SegmentationType === 'FRACTIONAL'
    let fractionalOrdinal = Object.values(this[_segments]).filter(
      (existing) => existing.segmentationType === 'FRACTIONAL',
    ).length

    refSegmentation.SegmentSequence.forEach((item, _index) => {
      const segmentNumber = Number(item.SegmentNumber)
      console.info(`add segment #${segmentNumber}`)
      let segmentUID = _generateUID({
        value: refSegmentation.SOPInstanceUID + segmentNumber.toString(),
      })

      if (this[_segments][segmentUID]) {
        console.info(`segment "${segmentUID}" already exists`)
        return
      }

      if (item.TrackingUID != null) {
        segmentUID = item.TrackingUID
      }

      const colormap = isFractional
        ? createDistinctColormap({
            index: fractionalOrdinal++,
            bins: 2 ** 8,
          })
        : createColormap({
            name: ColormapNames.VIRIDIS,
            bins: 2 ** 8,
          })

      const defaultSegmentStyle = {
        opacity: 0.75,
        backgroundOpacity: 0,
        paletteColorLookupTable: buildPaletteColorLookupTable({
          data: colormap,
          firstValueMapped: 0,
        }),
      }

      const segment = {
        segment: new Segment({
          uid: segmentUID,
          number: segmentNumber,
          label: item.SegmentLabel,
          algorithmType: item.SegmentAlgorithmType,
          algorithmName: item.SegmentAlgorithmName || '',
          propertyCategory: item.SegmentedPropertyCategoryCodeSequence[0],
          propertyType: item.SegmentedPropertyTypeCodeSequence[0],
          studyInstanceUID: refSegmentation.StudyInstanceUID,
          seriesInstanceUID: refSegmentation.SeriesInstanceUID,
          sopInstanceUIDs: pyramid.metadata.map((element) => {
            return element.SOPInstanceUID
          }),
        }),
        pyramid,
        style: { ...defaultSegmentStyle },
        defaultStyle: defaultSegmentStyle,
        minStoredValue,
        maxStoredValue,
        minZoomLevel,
        maxZoomLevel,
        loaderParams: {
          pyramid: fittedPyramid,
          client: _getClient(this[_clients], Enums.SOPClassUIDs.SEGMENTATION),
          channel: segmentNumber,
        },
        hasLoader: false,
        segmentationType: refSegmentation.SegmentationType,
      }

      const source = new DataTileSource({
        tileGrid,
        projection: this[_projection],
        wrapX: false,
        bandCount: 1,
        /** Avoid interpolation for single resolution (avoid blocky pixels) */
        interpolate: this[_segmentationInterpolate],
      })
      source.on('tileloaderror', (event) => {
        console.error(
          `error loading tile of segment "${segmentUID}"`,
          event.tile?.error_?.message || event,
        )
        const error = new CustomError(
          errorTypes.VISUALIZATION,
          `error loading tile of segment "${segmentUID}": ${event.message}`,
        )
        this[_options].errorInterceptor(error)
      })

      const [windowCenter, windowWidth] = createWindow(
        minStoredValue,
        maxStoredValue,
      )

      segment.layer = new TileLayer({
        source,
        extent: this[_pyramid].extent,
        visible: false,
        opacity: 1,
        preload: this[_options].preload ? 1 : 0,
        transition: 0,
        style: _getColorPaletteStyleForTileLayer({
          windowCenter,
          windowWidth,
          colormap: [
            [
              ...segment.style.paletteColorLookupTable.data.at(0),
              defaultSegmentStyle.backgroundOpacity,
            ],
            ...segment.style.paletteColorLookupTable.data.slice(1),
          ],
        }),
        useInterimTilesOnError: false,
        cacheSize: this[_options].tilesCacheSize,
        minResolution:
          this[_mapViewResolutions] === undefined
            ? undefined
            : minZoomLevel > 0
              ? this[_pyramid].resolutions[minZoomLevel]
              : undefined,
      })
      segment.layer.on('error', (event) => {
        console.error(`error rendering segment "${segmentUID}"`, event)
        const error = new CustomError(
          errorTypes.VISUALIZATION,
          `error rendering segment "${segmentUID}": ${event.message}`,
        )
        this[_options].errorInterceptor(error)
      })

      this[_map].addLayer(segment.layer)
      this[_segments][segmentUID] = segment
    })
  }

  /**
   * Remove a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of a segment
   */
  removeSegment(segmentUID) {
    if (!(segmentUID in this[_segments])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        `Cannot remove segment. Could not find segment "${segmentUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const segment = this[_segments][segmentUID]
    this[_map].removeLayer(segment.layer)
    disposeLayer(segment.layer)
    delete this[_segments][segmentUID]

    this._syncStackedDerivedLegendOverlays()
  }

  /**
   * Remove all segments.
   */
  removeAllSegments() {
    Object.keys(this[_segments]).forEach((segmentUID) => {
      this.removeSegment(segmentUID)
    })
  }

  /**
   * Show a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of a segment
   * @param {Object} [styleOptions]
   * @param {number} [styleOptions.opacity] - Opacity
   */
  showSegment(segmentUID, styleOptions = {}, shouldZoomIn = false) {
    if (!(segmentUID in this[_segments])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        `Cannot show segment. Could not find segment "${segmentUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const segment = this[_segments][segmentUID]
    console.info(`show segment ${segmentUID}`)

    const container = this[_map].getTargetElement() || this[_container]

    if (container && !segment.hasLoader) {
      try {
        const loader = _createTileLoadFunction({
          targetElement: container,
          iccProfiles: [],
          ...segment.loaderParams,
        })
        const source = segment.layer.getSource()
        if (source) {
          source.setLoader(loader)
          segment.hasLoader = true
        }
      } catch (error) {
        console.error(
          `Failed to set loader for segment "${segmentUID}":`,
          error,
        )
      }
    }

    segment.layer.setVisible(true)
    this.setSegmentStyle(segmentUID, styleOptions)

    if (!segment.hasLoader) {
      console.debug(
        `Showing segment "${segmentUID}" - loader not set yet (container may not be available yet)`,
      )
      return
    }

    if (shouldZoomIn) {
      const view = this[_map].getView()
      const currentZoomLevel = view.getZoom()

      if (
        currentZoomLevel < segment.minZoomLevel ||
        currentZoomLevel > segment.maxZoomLevel
      ) {
        view.animate({ zoom: segment.minZoomLevel })
      }
    }
  }

  /**
   * Hide a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of a segment
   */
  hideSegment(segmentUID) {
    if (!(segmentUID in this[_segments])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        `Cannot hide segment. Could not find segment "${segmentUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const segment = this[_segments][segmentUID]
    console.info(`hide segment ${segmentUID}`)
    segment.layer.setVisible(false)

    this._syncStackedDerivedLegendOverlays()
  }

  /**
   * Determine if segment is visible.
   *
   * @param {string} segmentUID - Unique tracking identifier of a segment
   * @returns {boolean}
   */
  isSegmentVisible(segmentUID) {
    if (!(segmentUID in this[_segments])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot determine if segment is visible. ' +
          `Could not find segment "${segmentUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const segment = this[_segments][segmentUID]
    return segment.layer.getVisible()
  }

  /**
   * Single viewport overlay: all visible fractional segments and parametric
   * maps as rows in one column (property type Code Meaning / LUT label).
   *
   * @private
   */
  _syncStackedDerivedLegendOverlays() {
    for (const uid in this[_segments]) {
      const rec = this[_segments][uid]
      if (rec.legendOverlay != null) {
        if (rec.legendOverlay.getMap() != null) {
          this[_map].removeOverlay(rec.legendOverlay)
        }
        rec.legendOverlay = null
      }
    }
    for (const muid in this[_mappings]) {
      const mapping = this[_mappings][muid]
      if (mapping.overlay != null && mapping.overlay.getMap() != null) {
        this[_map].removeOverlay(mapping.overlay)
      }
    }

    const root = this.segmentOverlay.getElement()
    root.innerHTML = ''
    root.style.display = 'flex'
    root.style.flexDirection = 'column'
    root.style.alignItems = 'stretch'
    root.style.gap = '10px'
    root.style.padding = '8px'
    root.style.backgroundColor = 'rgba(255, 255, 255, 0.94)'
    root.style.borderRadius = '6px'
    root.style.margin = '1px'
    root.style.marginTop = '8px'
    root.style.marginLeft = '4px'
    root.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.12)'

    let rowCount = 0

    /**
     * Render every fractional segment / parametric map (not only the visible
     * ones) so the in-viewport legend doubles as a visibility control: hidden
     * overlays appear dimmed with an "off" toggle and can be re-enabled
     * without opening the host application's side panel (see issue #240).
     */
    const segmentUids = Object.keys(this[_segments]).sort()
    for (let s = 0; s < segmentUids.length; s++) {
      const uid = segmentUids[s]
      const rec = this[_segments][uid]
      if (rec.segmentationType !== 'FRACTIONAL') {
        continue
      }
      const data = rec.style.paletteColorLookupTable?.data
      if (data == null || data.length === 0) {
        continue
      }
      const prop = rec.segment?.propertyType
      const title =
        prop?.CodeMeaning != null && String(prop.CodeMeaning).trim() !== ''
          ? prop.CodeMeaning
          : (rec.segment?.label ?? 'Fractional')

      this._appendDerivedLegendRow(root, title, data, {
        minValue: rec.minStoredValue,
        maxValue: rec.maxStoredValue,
        useRealWorldValues: false,
        isVisible: rec.layer.getVisible(),
        kind: 'segment',
        uid,
      })
      rowCount += 1
    }

    const mappingUids = Object.keys(this[_mappings]).sort()
    for (let m = 0; m < mappingUids.length; m++) {
      const muid = mappingUids[m]
      const mapping = this[_mappings][muid]
      const mapData = mapping.style.paletteColorLookupTable?.data
      if (mapData == null || mapData.length === 0) {
        continue
      }

      let minValue = mapping.minStoredValue
      let maxValue = mapping.maxStoredValue
      let useRealWorldValues = false
      if (mapping.realWorldValueRange) {
        minValue = mapping.realWorldValueRange[0]
        maxValue = mapping.realWorldValueRange[1]
        useRealWorldValues = true
      }
      const mapTitle =
        mapping.mapping?.label != null &&
        String(mapping.mapping.label).trim() !== ''
          ? mapping.mapping.label
          : 'Parametric map'

      this._appendDerivedLegendRow(root, mapTitle, mapData, {
        minValue,
        maxValue,
        useRealWorldValues,
        isVisible: mapping.layer.getVisible(),
        kind: 'mapping',
        uid: muid,
      })
      rowCount += 1
    }

    const parentEl = root.parentNode
    if (rowCount === 0) {
      if (this.segmentOverlay.getMap() != null) {
        this[_map].removeOverlay(this.segmentOverlay)
      }
      if (parentEl != null) {
        parentEl.style.display = 'none'
      }
      return
    }

    if (parentEl != null) {
      parentEl.style.display = 'block'
      parentEl.style.paddingLeft = '5px'
    }
    this.segmentOverlay.setOffset([7, 5])
    if (this.segmentOverlay.getMap() == null) {
      this[_map].addOverlay(this.segmentOverlay)
    }
  }

  /**
   * One legend row [toggle] [min] [color bar] [max] [label] inside a column
   * panel. The leading toggle controls overlay visibility directly from the
   * viewport (see issue #240).
   *
   * @param {HTMLElement} column - Container the row is appended to
   * @param {string} title - Row label (property type / mapping label)
   * @param {number[][]} colors - RGB triplets for the color bar
   * @param {Object} options
   * @param {number} options.minValue - Lower bound shown left of the bar
   * @param {number} options.maxValue - Upper bound shown right of the bar
   * @param {boolean} [options.useRealWorldValues] - Format bounds as floats
   * @param {boolean} [options.isVisible] - Current visibility of the overlay
   * @param {('segment'|'mapping')} [options.kind] - Overlay kind for the toggle
   * @param {string} [options.uid] - Overlay UID for the toggle
   *
   * @private
   */
  _appendDerivedLegendRow(column, title, colors, options = {}) {
    if (colors == null || colors.length === 0) {
      return
    }

    const {
      minValue,
      maxValue,
      useRealWorldValues = false,
      isVisible = true,
      kind,
      uid,
    } = options

    const row = document.createElement('div')
    row.style.display = 'flex'
    row.style.flexDirection = 'row'
    row.style.alignItems = 'center'
    row.style.gap = '8px'
    row.style.width = '100%'

    if (kind != null && uid != null) {
      /**
       * Native checkbox so the control renders identically whether checked or
       * not (Unicode box glyphs differ in size / emoji presentation across
       * platforms and shift the row); it is also the correct semantics and is
       * keyboard accessible.
       */
      const toggle = document.createElement('input')
      toggle.type = 'checkbox'
      toggle.checked = isVisible
      toggle.title = isVisible ? 'Hide overlay' : 'Show overlay'
      toggle.setAttribute('aria-label', toggle.title)
      toggle.style.cursor = 'pointer'
      toggle.style.flex = '0 0 auto'
      toggle.style.width = '14px'
      toggle.style.height = '14px'
      toggle.style.margin = '0'
      /** Muted check color so it does not compete with the legend colors. */
      toggle.style.accentColor = '#8c8c8c'
      toggle.addEventListener('change', (event) => {
        event.stopPropagation()
        this._toggleDerivedOverlayVisibility(kind, uid)
      })
      row.appendChild(toggle)
    }

    /** Dim the legend content when the overlay is currently hidden. */
    const contentOpacity = isVisible ? '1' : '0.4'

    const minElement = document.createElement('div')
    if (useRealWorldValues) {
      minElement.textContent = minValue.toFixed(2)
    } else {
      minElement.textContent = minValue.toString()
    }
    minElement.style.fontSize = '10px'
    minElement.style.fontWeight = '600'
    minElement.style.color = 'rgba(0, 0, 0, 0.9)'
    minElement.style.whiteSpace = 'nowrap'
    minElement.style.opacity = contentOpacity

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const width = 200
    const height = 20
    context.canvas.width = width
    context.canvas.height = height
    canvas.style.opacity = contentOpacity

    for (let i = 0; i < colors.length; i++) {
      const color = colors[i]
      const r = color[0]
      const g = color[1]
      const b = color[2]
      context.fillStyle = `rgb(${r}, ${g}, ${b})`
      context.fillRect(
        (width / colors.length) * i,
        0,
        Math.ceil(width / colors.length),
        height,
      )
    }

    const maxElement = document.createElement('div')
    if (useRealWorldValues) {
      maxElement.textContent = maxValue.toFixed(2)
    } else {
      maxElement.textContent = maxValue.toString()
    }
    maxElement.style.fontSize = '10px'
    maxElement.style.fontWeight = '600'
    maxElement.style.color = 'rgba(0, 0, 0, 0.9)'
    maxElement.style.whiteSpace = 'nowrap'
    maxElement.style.opacity = contentOpacity

    const titleElement = document.createElement('div')
    titleElement.textContent = title
    titleElement.style.fontSize = '12px'
    titleElement.style.fontWeight = '600'
    titleElement.style.color = 'black'
    titleElement.style.whiteSpace = 'nowrap'
    titleElement.style.marginLeft = 'auto'
    titleElement.style.opacity = contentOpacity

    row.appendChild(minElement)
    row.appendChild(canvas)
    row.appendChild(maxElement)
    row.appendChild(titleElement)
    column.appendChild(row)
  }

  /**
   * Toggle the visibility of a fractional segment or parameter mapping from
   * the in-viewport legend, and notify host applications so any external UI
   * (e.g. a side panel) can stay in sync.
   *
   * @param {('segment'|'mapping')} kind - Overlay kind
   * @param {string} uid - Overlay UID
   *
   * @private
   */
  _toggleDerivedOverlayVisibility(kind, uid) {
    const targetElement = this[_map].getTargetElement()
    if (kind === 'segment') {
      if (!(uid in this[_segments])) {
        return
      }
      const willBeVisible = !this[_segments][uid].layer.getVisible()
      if (willBeVisible) {
        this.showSegment(uid)
      } else {
        this.hideSegment(uid)
      }
      if (targetElement != null) {
        publish(targetElement, EVENT.SEGMENT_VISIBILITY_CHANGED, {
          segmentUID: uid,
          isVisible: willBeVisible,
        })
      }
      return
    }
    if (kind === 'mapping') {
      if (!(uid in this[_mappings])) {
        return
      }
      const willBeVisible = !this[_mappings][uid].layer.getVisible()
      if (willBeVisible) {
        this.showParameterMapping(uid)
      } else {
        this.hideParameterMapping(uid)
      }
      if (targetElement != null) {
        publish(targetElement, EVENT.PARAMETER_MAPPING_VISIBILITY_CHANGED, {
          mappingUID: uid,
          isVisible: willBeVisible,
        })
      }
    }
  }

  /**
   * Refresh stacked per-segment / per-mapping legend overlays.
   */
  addSegmentOverlay() {
    this._syncStackedDerivedLegendOverlays()
  }

  /**
   * Set the style of a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   * @param {Object} styleOptions - Style options
   * @param {number} [styleOptions.opacity] - Opacity
   * @param {color.PaletteColorLookupTable} [styleOptions.paletteColorLookupTable] - Palette color lookup table
   */
  setSegmentStyle(segmentUID, styleOptions = {}) {
    if (!(segmentUID in this[_segments])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot set style of segment. ' +
          `Could not find segment "${segmentUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const segment = this[_segments][segmentUID]
    if (styleOptions.opacity != null) {
      segment.style.opacity = styleOptions.opacity
      segment.layer.setOpacity(styleOptions.opacity)
    }

    /** Update palette color lookup table if provided (including FRACTIONAL) */
    if (styleOptions.paletteColorLookupTable != null) {
      /** Calculate window center and width from segment's limit values or use defaults */
      const windowCenter = segment.style.windowCenter || 128
      const windowWidth = segment.style.windowWidth || 256

      /** Store window center and width in segment style for later use */
      segment.style.windowCenter = windowCenter
      segment.style.windowWidth = windowWidth

      let paletteColorLookupTable = styleOptions.paletteColorLookupTable

      /** If the palette is a plain object (not a PaletteColorLookupTable instance),
       * convert it to a proper PaletteColorLookupTable instance */
      if (!paletteColorLookupTable.data && paletteColorLookupTable.redData) {
        paletteColorLookupTable = new PaletteColorLookupTable({
          uid: paletteColorLookupTable.uid,
          redDescriptor: paletteColorLookupTable.redDescriptor,
          greenDescriptor: paletteColorLookupTable.greenDescriptor,
          blueDescriptor: paletteColorLookupTable.blueDescriptor,
          redData: paletteColorLookupTable.redData,
          greenData: paletteColorLookupTable.greenData,
          blueData: paletteColorLookupTable.blueData,
        })
      }

      segment.style.paletteColorLookupTable = paletteColorLookupTable

      /** Ensure the palette color lookup table has data */
      if (!paletteColorLookupTable.data) {
        console.warn(
          `Palette color lookup table for segment ${segmentUID} has no data. Ensure the palette contains valid data property. Skipping style update.`,
        )
        return
      }

      /** Update the layer style with the new palette */
      const defaultSegmentStyle = segment.defaultStyle

      const newStyle = _getColorPaletteStyleForTileLayer({
        windowCenter,
        windowWidth,
        colormap: [
          [
            ...segment.style.paletteColorLookupTable.data[0],
            defaultSegmentStyle.backgroundOpacity,
          ],
          ...segment.style.paletteColorLookupTable.data.slice(1),
        ],
      })

      segment.layer.setStyle(newStyle)
    }

    if (segment.segmentationType === 'FRACTIONAL') {
      this.addSegmentOverlay()
    }
  }

  /**
   * Get the default style of a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   *
   * @returns {Object} Default style settings
   */
  getSegmentDefaultStyle(segmentUID) {
    if (!(segmentUID in this[_segments])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get default style of segment. ' +
          `Could not find segment "${segmentUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const segment = this[_segments][segmentUID]
    return {
      opacity: segment.defaultStyle.opacity,
      paletteColorLookupTable: segment.defaultStyle.paletteColorLookupTable,
    }
  }

  /**
   * Get the style of a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   *
   * @returns {Object} Style settings
   */
  getSegmentStyle(segmentUID) {
    if (!(segmentUID in this[_segments])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get style of segment. ' +
          `Could not find segment "${segmentUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const segment = this[_segments][segmentUID]
    return {
      opacity: segment.style.opacity,
      paletteColorLookupTable: segment.style.paletteColorLookupTable,
    }
  }

  /**
   * Get image metadata for a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   *
   * @returns {metadata.Segmentation[]} Metadata of DICOM Segmentation instances
   */
  getSegmentMetadata(segmentUID) {
    if (!(segmentUID in this[_segments])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get image metadata of segment. ' +
          `Could not find segment "${segmentUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const segment = this[_segments][segmentUID]
    return segment.pyramid.metadata
  }

  /**
   * Get all segments.
   *
   * @return {segment.Segment[]}
   */
  getAllSegments() {
    const segments = []
    for (const segmentUID in this[_segments]) {
      segments.push(this[_segments][segmentUID].segment)
    }
    return segments
  }

  /**
   * Add parameter mappings.
   *
   * @param {metadata.ParametricMap[]} metadata - Metadata of one or more DICOM Parametric Map instances
   */
  addParameterMappings(metadata) {
    if (metadata.length === 0) {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Metadata of Parametric Map instances needs to be provided to ' +
          'add mappings.',
      )
      throw this[_options].errorInterceptor(error)
    }

    const refImage = this[_pyramid].metadata[0]
    const refParametricMap = metadata[0]

    metadata.forEach((instance) => {
      if (
        instance.TotalPixelMatrixColumns === undefined ||
        instance.TotalPixelMatrixRows === undefined
      ) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Parametric Map instances must contain attributes ' +
            '"Total Pixel Matrix Rows" and "Total Pixel Matrix Columns".',
        )
        throw this[_options].errorInterceptor(error)
      }

      if (refImage.FrameOfReferenceUID !== instance.FrameOfReferenceUID) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Parametric Map instances must have the same Frame of Reference UID ' +
            'as the corresponding source images.',
        )
        throw this[_options].errorInterceptor(error)
      }

      if (
        refParametricMap.FrameOfReferenceUID !== instance.FrameOfReferenceUID
      ) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Parametric Map instances must all have same Frame of Reference UID.',
        )
        throw this[_options].errorInterceptor(error)
      }

      if (refParametricMap.SeriesInstanceUID !== instance.SeriesInstanceUID) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Parametric Map instances must all have same Series Instance UID.',
        )
        throw this[_options].errorInterceptor(error)
      }
    })

    console.info(
      'add mappings of Parametric Map instances of series ' +
        `"${refParametricMap.SeriesInstanceUID}"`,
    )

    const pyramid = _computeImagePyramid({ metadata })
    const [fittedPyramid, minZoomLevel, maxZoomLevel] = _fitImagePyramid(
      pyramid,
      this[_pyramid],
    )

    const tileGrid = new TileGrid({
      extent: fittedPyramid.extent,
      origins: fittedPyramid.origins,
      resolutions: fittedPyramid.resolutions,
      sizes: fittedPyramid.gridSizes,
      tileSizes: fittedPyramid.tileSizes,
    })

    const refInstance = pyramid.metadata[0]
    const sharedFuncGroup = refInstance.SharedFunctionalGroupsSequence[0]
    const frameVOILUT = sharedFuncGroup.FrameVOILUTSequence[0]
    if (frameVOILUT === undefined) {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'The Parametric Map image does not specify a shared frame ' +
          'Value of Interest (VOI) lookup table (LUT).',
      )
      throw this[_options].errorInterceptor(error)
    }

    const windowCenter = frameVOILUT.WindowCenter
    const windowWidth = frameVOILUT.WindowWidth

    const { mappingNumberToDescriptions } = _groupFramesPerMapping(refInstance)

    let index = 0
    for (const mappingNumber in mappingNumberToDescriptions) {
      const mappingDescriptions = mappingNumberToDescriptions[mappingNumber]
      const refItem = mappingDescriptions[0]
      const mappingLabel = refItem.LUTLabel
      const mappingExplanation = refItem.LUTExplanation
      let mappingUID = _generateUID({
        value: refInstance.SOPInstanceUID + mappingLabel,
      })
      if (refItem.TrackingUID != null) {
        mappingUID = refItem.TrackingUID
      }

      const range = [NaN, NaN]
      mappingDescriptions.forEach((item, i) => {
        if (item.TrackingUID != null) {
          if (item.TrackingUID !== mappingUID) {
            const error = new CustomError(
              errorTypes.ENCODINGANDDECODING,
              `Item #${i + 1} of Real World Value Mapping Sequence ` +
                `of frame #${index + 1} has unexpected Tracking UID. ` +
                'All items must have the same unique identifier value.',
            )
            throw this[_options].errorInterceptor(error)
          }
        }

        let firstValueMapped = item.RealWorldValueFirstValueMapped
        let lastValueMapped = item.RealWorldValueLastValueMapped

        if (firstValueMapped === undefined && lastValueMapped === undefined) {
          firstValueMapped = item.DoubleFloatRealWorldValueFirstValueMapped
          lastValueMapped = item.DoubleFloatRealWorldValueLastValueMapped
        }

        const intercept = item.RealWorldValueIntercept
        const slope = item.RealWorldValueSlope
        const bound1 = firstValueMapped * slope + intercept
        const bound2 = lastValueMapped * slope + intercept
        const lowerBound = Math.min(bound1, bound2)
        const upperBound = Math.max(bound1, bound2)

        if (i === 0) {
          range[0] = lowerBound
          range[1] = upperBound
        } else {
          range[0] = Math.min(range[0], lowerBound)
          range[1] = Math.max(range[1], upperBound)
        }
      })

      // Store real world value range for legend display
      if (Number.isNaN(range[0]) || Number.isNaN(range[1])) {
        const error = new CustomError(
          errorTypes.ENCODINGANDDECODING,
          'Could not determine range of real world values.',
        )
        throw this[_options].errorInterceptor(error)
      }

      let colormap
      const isFloatPixelData = refInstance.BitsAllocated > 16
      let minStoredValue = 0
      let maxStoredValue = 2 ** refInstance.BitsAllocated - 1

      if (isFloatPixelData) {
        minStoredValue = -(2 ** refInstance.BitsAllocated - 1) / 2
        maxStoredValue = (2 ** refInstance.BitsAllocated - 1) / 2
      }

      if (refInstance.PixelPresentation === 'MONOCHROME') {
        colormap = createColormap({
          name: ColormapNames.MAGMA,
          bins: 2 ** 8,
        })
      } else {
        if (range[0] < 0 && range[1] > 0) {
          colormap = createColormap({
            name: ColormapNames.BLUE_RED,
            bins: 2 ** 8,
          })
        } else {
          colormap = createColormap({
            name: ColormapNames.HOT,
            bins: 2 ** 8,
          })
        }
      }

      const defaultMappingStyle = {
        opacity: 1.0,
        limitValues: [
          Math.ceil(windowCenter - windowWidth / 2),
          Math.floor(windowCenter + windowWidth / 2),
        ],
        paletteColorLookupTable: buildPaletteColorLookupTable({
          data: colormap,
          firstValueMapped: 0,
        }),
      }

      const mapping = {
        mapping: new ParameterMapping({
          uid: mappingUID,
          number: mappingNumber,
          label: mappingLabel,
          description: mappingExplanation,
          studyInstanceUID: refInstance.StudyInstanceUID,
          seriesInstanceUID: refInstance.SeriesInstanceUID,
          sopInstanceUIDs: pyramid.metadata.map((element) => {
            return element.SOPInstanceUID
          }),
        }),
        pyramid,
        style: { ...defaultMappingStyle },
        defaultStyle: defaultMappingStyle,
        minStoredValue,
        maxStoredValue,
        realWorldValueRange: range, // Store real world value range for legend
        minZoomLevel,
        maxZoomLevel,
        loaderParams: {
          pyramid: fittedPyramid,
          client: _getClient(this[_clients], Enums.SOPClassUIDs.PARAMETRIC_MAP),
          channel: mappingNumber,
        },
        hasLoader: false,
      }

      const source = new DataTileSource({
        tileGrid,
        projection: this[_projection],
        wrapX: false,
        bandCount: 1,
        interpolate: this[_parametricMapInterpolate],
      })
      source.on('tileloaderror', (event) => {
        console.error(
          `error loading tile of mapping "${mappingUID}"`,
          event.tile?.error_?.message || event,
        )
        const error = new CustomError(
          errorTypes.VISUALIZATION,
          `error loading tile of mapping "${mappingUID}": ${event.message}`,
        )
        this[_options].errorInterceptor(error)
      })

      mapping.layer = new TileLayer({
        source,
        extent: this[_pyramid].extent,
        projection: this[_projection],
        visible: false,
        opacity: 1,
        preload: this[_options].preload ? 1 : 0,
        transition: 0,
        style: _getColorPaletteStyleForParametricMappingTileLayer({
          windowCenter,
          windowWidth,
          colormap: mapping.style.paletteColorLookupTable.data,
        }),
      })
      mapping.layer.on('error', (event) => {
        console.error(`error rendering mapping "${mappingUID}"`, event)
        const error = new CustomError(
          errorTypes.VISUALIZATION,
          `error rendering mapping "${mappingUID}": ${event.message}`,
        )
        this[_options].errorInterceptor(error)
      })
      this[_map].addLayer(mapping.layer)

      this[_mappings][mappingUID] = mapping

      index += 1
    }
  }

  /**
   * Remove a parameter mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of a mapping
   */
  removeParameterMapping(mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        `Cannot remove mapping. Could not find mapping "${mappingUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const mapping = this[_mappings][mappingUID]
    this[_map].removeLayer(mapping.layer)
    disposeLayer(mapping.layer)
    delete this[_mappings][mappingUID]
    this._syncStackedDerivedLegendOverlays()
  }

  /**
   * Remove all parameter mappings.
   */
  removeAllParameterMappings() {
    Object.keys(this[_mappings]).forEach((mappingUID) => {
      this.removeParameterMapping(mappingUID)
    })
  }

  /**
   * Show a parameter mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of a mapping
   * @param {Object} [styleOptions]
   * @param {number} [styleOptions.opacity] - Opacity
   * @param {number[]} [styleOptions.limitValues] - Upper and lower windowing
   */
  showParameterMapping(mappingUID, styleOptions = {}) {
    if (!(mappingUID in this[_mappings])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        `Cannot show mapping. Could not find mapping "${mappingUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const mapping = this[_mappings][mappingUID]
    console.info(`show mapping ${mappingUID}`)

    const container = this[_map].getTargetElement()
    if (container && !mapping.hasLoader) {
      const loader = _createTileLoadFunction({
        targetElement: container,
        iccProfiles: [],
        ...mapping.loaderParams,
      })
      const source = mapping.layer.getSource()
      source.setLoader(loader)
    }

    const view = this[_map].getView()
    const currentZoomLevel = view.getZoom()
    if (
      currentZoomLevel < mapping.minZoomLevel ||
      currentZoomLevel > mapping.maxZoomLevel
    ) {
      view.animate({ zoom: mapping.minZoomLevel })
    }

    mapping.layer.setVisible(true)
    this.setParameterMappingStyle(mappingUID, styleOptions)
  }

  /**
   * Hide a parameter mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of a mapping
   */
  hideParameterMapping(mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        `Cannot hide mapping. Could not find mapping "${mappingUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const mapping = this[_mappings][mappingUID]
    console.info(`hide mapping ${mappingUID}`)
    mapping.layer.setVisible(false)
    this._syncStackedDerivedLegendOverlays()
  }

  /**
   * Determine if parameter mapping is visible.
   *
   * @param {string} mappingUID - Unique tracking identifier of a mapping
   * @returns {boolean}
   */
  isParameterMappingVisible(mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      const error = new CustomError(
        errorTypes.ENCODINGANDDECODING,
        'Cannot determine if mapping is visible. ' +
          `Could not find mapping "${mappingUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const mapping = this[_mappings][mappingUID]
    return mapping.layer.getVisible()
  }

  /**
   * Set the style of a parameter mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of mapping
   * @param {Object} styleOptions
   * @param {number} [styleOptions.opacity] - Opacity
   * @param {number[]} [styleOptions.limitValues] - Upper and lower windowing
   */
  setParameterMappingStyle(mappingUID, styleOptions = {}) {
    if (!(mappingUID in this[_mappings])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot set style of mapping. ' +
          `Could not find mapping "${mappingUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const mapping = this[_mappings][mappingUID]

    if (styleOptions.opacity != null) {
      mapping.style.opacity = styleOptions.opacity
      mapping.layer.setOpacity(styleOptions.opacity)
    }

    const styleVariables = {}
    if (styleOptions.limitValues != null) {
      mapping.style.limitValues = [
        Math.max(styleOptions.limitValues[0], mapping.minStoredValue),
        Math.min(styleOptions.limitValues[1], mapping.maxStoredValue),
      ]
      const [windowCenter, windowWidth] = createWindow(
        mapping.style.limitValues[0],
        mapping.style.limitValues[1],
      )
      styleVariables.windowCenter = windowCenter
      styleVariables.windowWidth = windowWidth
      mapping.layer.updateStyleVariables(styleVariables)
    }

    if (
      styleOptions.paletteColorLookupTable != null &&
      styleOptions.paletteColorLookupTable.data != null
    ) {
      mapping.style.paletteColorLookupTable =
        styleOptions.paletteColorLookupTable
      const [palWindowCenter, palWindowWidth] = createWindow(
        mapping.style.limitValues[0],
        mapping.style.limitValues[1],
      )
      mapping.layer.setStyle(
        _getColorPaletteStyleForParametricMappingTileLayer({
          windowCenter: palWindowCenter,
          windowWidth: palWindowWidth,
          colormap: mapping.style.paletteColorLookupTable.data,
        }),
      )
    }

    this._syncStackedDerivedLegendOverlays()
  }

  /**
   * Get the default style of a parameter mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of mapping
   * @returns {Object} Default style Options
   */
  getParameterMappingDefaultStyle(mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get default style of mapping. ' +
          `Could not find mapping "${mappingUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const mapping = this[_mappings][mappingUID]
    return {
      opacity: mapping.defaultStyle.opacity,
      limitValues: mapping.defaultStyle.limitValues,
      paletteColorLookupTable: mapping.defaultStyle.paletteColorLookupTable,
    }
  }

  /**
   * Get the style of a parameter mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of mapping
   * @returns {Object} Style Options
   */
  getParameterMappingStyle(mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get style of mapping. ' +
          `Could not find mapping "${mappingUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const mapping = this[_mappings][mappingUID]
    return {
      opacity: mapping.style.opacity,
      limitValues: mapping.style.limitValues,
      paletteColorLookupTable: mapping.style.paletteColorLookupTable,
    }
  }

  /**
   * Get image metadata for a parameter mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of mapping
   *
   * @returns {metadata.ParametricMap[]} Metadata of DICOM Parametric Map
   * instances
   */
  getParameterMappingMetadata(mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Cannot get image metadata of mapping. ' +
          `Could not find mapping "${mappingUID}".`,
      )
      throw this[_options].errorInterceptor(error)
    }

    const mapping = this[_mappings][mappingUID]
    return mapping.pyramid.metadata
  }

  /**
   * Get all parameter mappings.
   *
   * @return {mapping.ParameterMapping[]}
   */
  getAllParameterMappings() {
    const mappings = []
    for (const mappingUID in this[_mappings]) {
      mappings.push(this[_mappings][mappingUID].mapping)
    }
    return mappings
  }
}

/**
 * Static viewer for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type other than VOLUME.
 *
 * @class
 * @abstract
 * @private
 */
class _NonVolumeImageViewer {
  /**
   * @param {Object} options
   * @param {Object} options.client - A DICOMwebClient instance for interacting
   * with an origin server over HTTP.
   * @param {metadata.VLWholeSlideMicroscopyImage[]} options.metadata -
   * Metadata of DICOM VL Whole Slide Microscopy Image instances
   * @param {string} options.orientation - Orientation of the slide (vertical:
   * label on top, or horizontal: label on right side).
   * @param {number} [options.resizeFactor=1] - To which extent image should be
   * reduced in size (fraction).
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile
   * should be included for correction of image colors.
   * @param {boolean} [options.disableInteractions=false] - Whether interactions
   * should be disabled e.g. zooming, panning, etc.
   */
  constructor(options) {
    this[_errorInterceptor] = options.errorInterceptor || ((error) => error)

    if (options.disableInteractions === undefined) {
      options.disableInteractions = false
    }

    // We also accept metadata in raw JSON format for backwards compatibility
    if (options.metadata.SOPClassUID != null) {
      this[_metadata] = options.metadata
    } else {
      this[_metadata] = options.metadata.map((instance) => {
        return new VLWholeSlideMicroscopyImage({ metadata: instance })
      })
    }

    const imageFlavor = this[_metadata].ImageType[2]
    if (imageFlavor === 'VOLUME') {
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'Viewer cannot render images of type VOLUME.',
      )
      throw this[_errorInterceptor](error)
    }

    const resizeFactor = options.resizeFactor ? options.resizeFactor : 1
    const height = this[_metadata].TotalPixelMatrixRows * resizeFactor
    const width = this[_metadata].TotalPixelMatrixColumns * resizeFactor
    const extent = [
      0, // min X
      -(height + 1), // min Y
      width, // max X
      -1, // max Y
    ]

    const imageLoadFunction = (image, _src) => {
      console.info(`load ${imageFlavor} image`)
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
        queryParams,
      }

      options.client
        .retrieveInstanceRendered(retrieveOptions)
        .then((thumbnail) => {
          let thumbnailData = thumbnail
          if (Array.isArray(thumbnail)) {
            thumbnailData = thumbnail[0]
          }
          // eslint-disable-next-line no-undef
          const blob = new Blob([thumbnailData], { type: mediaType })
          image.getImage().src = window.URL.createObjectURL(blob)
          image.getImage().onload = () => {
            window.URL.revokeObjectURL(image.getImage().src)
          }
        })
    }

    const projection = new Projection({
      code: 'DICOM',
      units: 'metric',
      extent,
      getPointResolution: (pixelRes, _point) => {
        /*
         * DICOM Pixel Spacing has millimeter unit while the projection has
         * meter unit.
         */
        const mmSpacing = getPixelSpacing(this[_metadata])[0]
        const spacing = mmSpacing / resizeFactor / 10 ** 3
        return pixelRes * spacing
      },
    })

    const source = new Static({
      imageExtent: extent,
      projection,
      imageLoadFunction,
      url: '', // will be set by imageLoadFunction()
    })

    this[_imageLayer] = new ImageLayer({ source })

    // The default rotation is 'horizontal' with the slide label on the right
    let rotation = _getRotation(this[_metadata])
    if (options.orientation === 'vertical') {
      // Rotate counterclockwise by 90 degrees to have slide label at the top
      rotation -= 90 * (Math.PI / 180)
    }

    const view = new View({
      center: getCenter(extent),
      rotation,
      projection,
      extent,
      smoothExtentConstraint: true,
      smoothResolutionConstraint: true,
      showFullExtent: true,
    })

    // Creates the map with the defined layers and view and renders it.
    this[_map] = new OlMap({
      layers: [this[_imageLayer]],
      view,
      controls: [],
      interactions: options.disableInteractions ? [] : undefined,
      keyboardEventTarget: document,
    })

    this[_map].on('movestart', (event) => {
      publish(this[_map].getTargetElement(), EVENT.MOVE_STARTED, { event })
    })

    this[_map].on('moveend', (event) => {
      publish(this[_map].getTargetElement(), EVENT.MOVE_ENDED, { event })
    })

    view.fit(projection.getExtent(), { size: this[_map].getSize() })
  }

  /**
   * Clean up.
   *
   * Release allocated memory and clear the viewport.
   */
  cleanup() {
    disposeMapLayers(this[_map])
  }

  /**
   * Render the image in the specified viewport container.
   *
   * @param {Object} options - Rendering options.
   * @param {(string|HTMLElement)} options.container - HTML Element in which the viewer should be injected.
   */
  render({ container }) {
    if (container == null) {
      console.error('container must be provided for rendering images')
      const error = new CustomError(
        errorTypes.VISUALIZATION,
        'container must be provided for rendering images',
      )
      this[_options].errorInterceptor(error)
      return
    }

    this[_map].setTarget(container)
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
   * @type {VLWholeSlideMicroscopyImage}
   */
  get imageMetadata() {
    return this[_metadata]
  }

  /**
   * Frame of Reference UID.
   *
   * @type string
   */
  get frameOfReferenceUID() {
    return this[_metadata].FrameOfReferenceUID
  }

  /**
   * Resize the viewer to fit the viewport.
   *
   * @returns {void}
   */
  resize() {
    this[_map].updateSize()
    if (this[_overviewMap]) {
      this[_overviewMap].getOverviewMap().updateSize()
    }
  }

  /**
   * Size of the viewport.
   *
   * @type number[]
   */
  get size() {
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
  /**
   * @param {Object} options
   * @param {Object} options.client - A DICOMwebClient instance for interacting
   * with an origin server over HTTP.
   * @param {metadata.VLWholeSlideMicroscopyImage[]} options.metadata -
   * Metadata of DICOM VL Whole Slide Microscopy Image instances
   * @param {string} [options.orientation='horizontal'] - Orientation of the
   * slide (vertical: label on top, or horizontal: label on right side).
   * @param {number} [options.resizeFactor=1] - To which extent image should be
   * reduced in size (fraction).
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile
   * should be included for correction of image colors.
   * @param {boolean} [options.disableInteractions=false] - Whether interactions
   * should be disabled e.g. zooming, panning, etc.
   */
  constructor(options) {
    if (options.orientation === undefined) {
      options.orientation = 'horizontal'
    }

    if (options.disableInteractions === undefined) {
      options.disableInteractions = false
    }

    super(options)

    this[_errorInterceptor] = options.errorInterceptor || ((error) => error)
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
  /**
   * @param {Object} options - Options
   * @param {Object} options.client - A DICOMwebClient instance for interacting with an origin server over HTTP
   * @param {metadata.VLWholeSlideMicroscopyImage[]} options.metadata -
   * Metadata of DICOM VL Whole Slide Microscopy Image instances
   * @param {string} [options.orientation='vertical'] - Orientation of the
   * slide (vertical: label on top, or horizontal: label on right side)
   * @param {number} [options.resizeFactor=1] - To which extent image should be
   * reduced in size (fraction)
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile
   * should be included for correction of image colors
   */
  constructor(options) {
    if (options.orientation === undefined) {
      options.orientation = 'vertical'
    }

    super(options)

    this[_errorInterceptor] = options.errorInterceptor || ((error) => error)
  }
}

export { LabelImageViewer, OverviewImageViewer, VolumeImageViewer }
