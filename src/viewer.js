import 'ol/ol.css'
import Collection from 'ol/Collection'
import Draw, { createBox } from 'ol/interaction/Draw'
import EVENT from './events'
import publish from './eventPublisher'
import Feature from 'ol/Feature'
import Fill from 'ol/style/Fill'
import FullScreen from 'ol/control/FullScreen'
import Icon from 'ol/style/Icon'
import ImageLayer from 'ol/layer/Image'
import Map from 'ol/Map'
import Modify from 'ol/interaction/Modify'
import MousePosition from 'ol/control/MousePosition'
import OverviewMap from 'ol/control/OverviewMap'
import Projection from 'ol/proj/Projection'
import ScaleLine from 'ol/control/ScaleLine'
import Select from 'ol/interaction/Select'
import Snap from 'ol/interaction/Snap'
import Translate from 'ol/interaction/Translate'
import PointGeometry from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Static from 'ol/source/ImageStatic'
import Overlay from 'ol/Overlay'
import PointsLayer from 'ol/layer/WebGLPoints'
import TileLayer from 'ol/layer/WebGLTile'
import DataTileSource from 'ol/source/DataTile'
import TileGrid from 'ol/tilegrid/TileGrid'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import View from 'ol/View'
import DragPan from 'ol/interaction/DragPan'
import DragZoom from 'ol/interaction/DragZoom'
import WebGLHelper from 'ol/webgl/Helper'
import TileDebug from 'ol/source/TileDebug'
import { default as VectorEventType } from 'ol/source/VectorEventType'// eslint-disable-line
import { ZoomSlider, Zoom } from 'ol/control'
import { getCenter, getHeight, getWidth } from 'ol/extent'
import { defaults as defaultInteractions } from 'ol/interaction'
import dcmjs from 'dcmjs'
import _ from 'lodash'

import {
  AnnotationGroup,
  _fetchGraphicData,
  _fetchGraphicIndex,
  _fetchMeasurements,
  _getCentroid,
  _getCommonZCoordinate,
  _getCoordinateDimensionality
} from './annotation.js'
import {
  ColormapNames,
  createColormap,
  PaletteColorLookupTable,
  buildPaletteColorLookupTable
} from './color.js'
import {
  groupMonochromeInstances,
  groupColorInstances,
  VLWholeSlideMicroscopyImage
} from './metadata.js'
import { ParameterMapping, _groupFramesPerMapping } from './mapping.js'
import { ROI } from './roi.js'
import { Segment } from './segment.js'
import {
  areCodedConceptsEqual,
  applyTransform,
  buildInverseTransform,
  buildTransform,
  computeRotation,
  getContentItemNameCodedConcept,
  _generateUID,
  _getUnitSuffix,
  doContentItemsMatch,
  createWindow,
  rgb2hex
} from './utils.js'
import {
  _scoord3dCoordinates2geometryCoordinates,
  _scoord3d2Geometry,
  getPixelSpacing,
  _geometry2Scoord3d,
  _geometryCoordinates2scoord3dCoordinates,
  _getFeatureLength,
  _getFeatureArea
} from './scoord3dUtils'
import { OpticalPath } from './opticalPath.js'
import {
  _areImagePyramidsEqual,
  _computeImagePyramid,
  _createTileLoadFunction,
  _fitImagePyramid,
  _getIccProfiles
} from './pyramid.js'

import Enums from './enums'
import _AnnotationManager from './annotations/_AnnotationManager'
import webWorkerManager from './webWorker/webWorkerManager.js'

function _getClient (clientMapping, sopClassUID) {
  if (clientMapping[sopClassUID] == null) {
    return clientMapping.default
  }
  return clientMapping[sopClassUID]
}

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
function _getRotation (metadata) {
  // Angle with respect to the reference orientation
  const angle = computeRotation({
    orientation: metadata.ImageOrientationSlide
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
function _wireMeasurementsAndQualitativeEvaluationsEvents (
  map,
  feature,
  pyramid,
  affine
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
    _updateFeatureEvaluations(event.target)
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
 * @param {Object} map - The map instance
 * @param {Object} feature - The feature instance
 * @param {Object} pyramid - The pyramid metadata
 * @returns {void}
 *
 * @private
 */
function _updateFeatureMeasurements (map, feature, pyramid, affine) {
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
    km2: 'square kilometers'
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
        schemeDesignator: 'SCT'
      }),
      value: area,
      unit: new dcmjs.sr.coding.CodedConcept({
        value: unitCodedConceptValue,
        meaning: unitCodedConceptMeaning,
        schemeDesignator: 'SCT'
      })
    })
  }

  if (length != null) {
    const unitCodedConceptValue = unitSuffix
    const unitCodedConceptMeaning = unitSuffixToMeaningMap[unitSuffix]
    measurement = new dcmjs.sr.valueTypes.NumContentItem({
      name: new dcmjs.sr.coding.CodedConcept({
        meaning: 'Length',
        value: '410668003',
        schemeDesignator: 'SCT'
      }),
      value: length,
      unit: new dcmjs.sr.coding.CodedConcept({
        value: unitCodedConceptValue,
        meaning: unitCodedConceptMeaning,
        schemeDesignator: 'SCT'
      })
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
function _getColorPaletteStyleForTileLayer ({
  windowCenter,
  windowWidth,
  colormap
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
            [
              '-',
              ['band', 1],
              [
                '-',
                ['var', 'windowCenter'],
                0.5
              ]
            ],
            [
              '-',
              ['var', 'windowWidth'],
              1
            ]
          ],
          0.5
        ],
        [
          '-',
          maxIndexValue,
          minIndexValue
        ]
      ],
      minIndexValue
    ],
    minIndexValue,
    maxIndexValue
  ]

  const expression = [
    'palette',
    indexExpression,
    colormap
  ]

  const variables = {
    windowCenter,
    windowWidth
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
function _getColorInterpolationStyleForTileLayer ({
  windowCenter,
  windowWidth,
  color
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
        [
          '-',
          ['band', 1],
          ['var', 'windowCenter']
        ],
        ['var', 'windowWidth']
      ],
      0.5
    ],
    0,
    [0, 0, 0, 1],
    1,
    ['color', ['var', 'red'], ['var', 'green'], ['var', 'blue'], 1]
  ]

  const variables = {
    red: color[0],
    green: color[1],
    blue: color[2],
    windowCenter,
    windowWidth
  }

  return { color: expression, variables }
}

/**
 * Build OpenLayers style expression for coloring a WebGL PointLayer.
 *
 * @param {Object} styleOptions - Style options
 * @param {string} styleOptions.name - Name of a property for which values should be colorized
 * @param {number} styleOptions.minValue - Mininum value of the output range
 * @param {number} styleOptions.maxValue - Maxinum value of the output range
 * @param {number[][]} styleOptions.colormap - RGB color triplets
 *
 * @returns {Object} color style expression
 *
 * @private
 */
function _getColorPaletteStyleForPointLayer ({
  key,
  minValue,
  maxValue,
  colormap
}) {
  const minIndexValue = 0
  const maxIndexValue = colormap.length - 1
  const indexExpression = [
    'clamp',
    [
      'round',
      [
        '+',
        [
          '/',
          [
            '*',
            [
              '-',
              ['get', key],
              minValue
            ],
            [
              '-',
              maxIndexValue,
              minIndexValue
            ]
          ],
          [
            '-',
            maxValue,
            minValue
          ]
        ],
        minIndexValue
      ]
    ],
    minIndexValue,
    maxIndexValue
  ]

  const expression = [
    'palette',
    indexExpression,
    colormap
  ]

  return { color: expression }
}

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
const _mappings = Symbol.for('mappings')
const _metadata = Symbol('metadata')
const _opticalPaths = Symbol('opticalPaths')
const _options = Symbol('options')
const _overlays = Symbol('overlays')
const _overviewMap = Symbol('overviewMap')
const _projection = Symbol.for('projection')
const _pyramid = Symbol('pyramid')
const _segments = Symbol('segments')
const _rotation = Symbol('rotation')
const _tileGrid = Symbol('tileGrid')
const _updateOverviewMapSize = Symbol('updateOverviewMapSize')

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
   * turned on (e.g., display of tile boundaries)
   * @param {number} [options.tilesCacheSize=1000] - Number of tiles that should
   * be cached to avoid repeated retrieval for the DICOMweb server
   * @param {number[]} [options.primaryColor=[0, 126, 163]] - Primary color of
   * the application
   * @param {number[]} [options.highlightColor=[140, 184, 198]] - Color that
   * should be used to highlight things that get selected by the user
   * @param {number[]} [options.mapViewResolutions] Map's view list of
   * resolutions. If not passed, the tile grid resolution will be used.
   */
  constructor (options) {
    this[_options] = options

    this[_clients] = {}
    if (this[_options].client) {
      this[_clients].default = this[_options].client
    } else {
      if (this[_options].clientMapping == null) {
        throw new Error(
          'Either option "client" or option "clientMapping" must be provided.'
        )
      }
      if (!(typeof this[_options].clientMapping === 'object')) {
        throw new Error('Option "clientMapping" must be an object.')
      }
      if (this[_options].clientMapping.default == null) {
        throw new Error('Option "clientMapping" must contain "default" key.')
      }
      for (const key in this[_options].clientMapping) {
        this[_clients][key] = this[_options].clientMapping[key]
      }
    }

    if (this[_options].debug == null) {
      this[_options].debug = false
    } else {
      this[_options].debug = true
    }

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
    console.log("Setting controls to", this[_options].controls);
    this[_options].controls = new Set(this[_options].controls)

    if (this[_options].primaryColor == null) {
      this[_options].primaryColor = [0, 126, 163]
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
      throw new Error('Input metadata must be an array.')
    }

    if (this[_options].metadata.length === 0) {
      throw new Error('Input metadata array is empty.')
    }

    if (this[_options].metadata.some((item) => typeof item !== 'object')) {
      throw new Error('Input metadata must be an array of objects.')
    }

    // We also accept metadata in raw JSON format for backwards compatibility
    if (this[_options].metadata[0].SOPClassUID != null) {
      this[_metadata] = this[_options].metadata
    } else {
      this[_metadata] = this[_options].metadata.map(instance => {
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
          'Only the first detected color image will be loaded.'
        )
        colorOpticalPathIdentifiers = [id]
      }
      colorImageInformation[id] = {
        metadata: colorGroups[id],
        opticalPath: this[_metadata][0].OpticalPathSequence[0]
      }
    }

    const monochromeGroups = groupMonochromeInstances(this[_metadata])
    const monochromeOpticalPathIdentifiers = Object.keys(monochromeGroups)
    const monochromeImageInformation = {}
    monochromeOpticalPathIdentifiers.forEach(id => {
      const refImage = monochromeGroups[id][0]
      const opticalPath = refImage.OpticalPathSequence.find(item => {
        return item.OpticalPathIdentifier === id
      })
      monochromeImageInformation[id] = {
        metadata: monochromeGroups[id],
        opticalPath
      }
    })

    const numChannels = monochromeOpticalPathIdentifiers.length
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

    const metadata = this[_pyramid].metadata[this[_pyramid].metadata.length - 1]
    const origin = metadata.TotalPixelMatrixOriginSequence[0]
    const orientation = metadata.ImageOrientationSlide
    const spacing = getPixelSpacing(metadata)
    const offset = [
      Number(origin.XOffsetInSlideCoordinateSystem),
      Number(origin.YOffsetInSlideCoordinateSystem)
    ]
    this[_affine] = buildTransform({
      offset,
      orientation,
      spacing
    })
    this[_affineInverse] = buildInverseTransform({
      offset,
      orientation,
      spacing
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

    let mapViewResolutions = this[_tileGrid].getResolutions()

    if (_.has(this[_options], 'mapViewResolutions')) {
      mapViewResolutions = this[_options].mapViewResolutions
    }

    const view = new View({
      center: getCenter(this[_pyramid].extent),
      projection: this[_projection],
      resolutions: mapViewResolutions,
      rotation: this[_rotation],
      constrainOnlyCenter: false,
      smoothResolutionConstraint: true,
      showFullExtent: true,
      extent: this[_pyramid].extent
    })

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
        const maxStoredValue = Math.pow(2, bitsAllocated) - 1

        let paletteColorLookupTableUID
        let paletteColorLookupTable
        if (info.opticalPath.PaletteColorLookupTableSequence) {
          const item = info.opticalPath.PaletteColorLookupTableSequence[0]
          paletteColorLookupTableUID = (
            item.PaletteColorLookupTableUID
              ? item.PaletteColorLookupTableUID
              : _generateUID()
          )
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
            blueSegmentedData: item.SegmentedBluePaletteColorLookupTableData
          })
        }
        const defaultOpticalPathStyle = {
          opacity: 1,
          limitValues: [minStoredValue, maxStoredValue]
        }
        if (paletteColorLookupTable) {
          defaultOpticalPathStyle.paletteColorLookupTable = paletteColorLookupTable
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
            illuminationColor: (
              info.opticalPath.IlluminationColorCodeSequence
                ? info.opticalPath.IlluminationColorCodeSequence[0]
                : undefined
            ),
            studyInstanceUID: info.metadata[0].StudyInstanceUID,
            seriesInstanceUID: info.metadata[0].SeriesInstanceUID,
            sopInstanceUIDs: pyramid.metadata.map(element => {
              return element.SOPInstanceUID
            }),
            paletteColorLookupTableUID
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
              Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE
            ),
            channel: opticalPathIdentifier
          },
          hasLoader: false
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

        const source = new DataTileSource({
          tileGrid: this[_tileGrid],
          projection: this[_projection],
          wrapX: false,
          transition: 0,
          bandCount: 1
        })
        source.on('tileloaderror', (event) => {
          console.error(
            `error loading tile of optical path "${opticalPathIdentifier}"`,
            event
          )
        })

        const [windowCenter, windowWidth] = createWindow(
          opticalPath.style.limitValues[0],
          opticalPath.style.limitValues[1]
        )

        let layerStyle
        if (opticalPath.style.paletteColorLookupTable) {
          layerStyle = _getColorPaletteStyleForTileLayer({
            windowCenter,
            windowWidth,
            colormap: opticalPath.style.paletteColorLookupTable.data
          })
        } else {
          layerStyle = _getColorInterpolationStyleForTileLayer({
            windowCenter,
            windowWidth,
            color: opticalPath.style.color
          })
        }

        opticalPath.layer = new TileLayer({
          source,
          extent: pyramid.extent,
          preload: this[_options].preload ? 1 : 0,
          style: layerStyle,
          visible: false,
          useInterimTilesOnError: false,
          cacheSize: this[_options].tilesCacheSize
        })
        opticalPath.layer.helper = helper
        opticalPath.layer.on('precompose', (event) => {
          const gl = event.context
          gl.enable(gl.BLEND)
          gl.blendEquation(gl.FUNC_ADD)
          gl.blendFunc(gl.SRC_COLOR, gl.ONE)
        })
        opticalPath.layer.on('error', (event) => {
          console.error(
            `error rendering optical path "${opticalPathIdentifier}"`,
            event
          )
        })

        opticalPath.overviewLayer = new TileLayer({
          source,
          extent: pyramid.extent,
          preload: 0,
          style: layerStyle,
          visible: false,
          useInterimTilesOnError: false
        })
        opticalPath.overviewLayer.helper = overviewHelper
        opticalPath.overviewLayer.on('precompose', (event) => {
          const gl = event.context
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

      const defaultOpticalPathStyle = {
        opacity: 1
      }

      const opticalPath = {
        opticalPathIdentifier,
        opticalPath: new OpticalPath({
          identifier: opticalPathIdentifier,
          description: info.opticalPath.OpticalPathDescription,
          illuminationType: info.opticalPath.IlluminationTypeCodeSequence[0],
          isMonochromatic: false,
          studyInstanceUID: info.metadata[0].StudyInstanceUID,
          seriesInstanceUID: info.metadata[0].SeriesInstanceUID,
          sopInstanceUIDs: pyramid.metadata.map(element => {
            return element.SOPInstanceUID
          })
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
            Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE
          ),
          channel: opticalPathIdentifier
        },
        hasLoader: false
      }

      const source = new DataTileSource({
        tileGrid: this[_tileGrid],
        projection: this[_projection],
        wrapX: false,
        transition: 0,
        bandCount: 3
      })
      source.on('tileloaderror', (event) => {
        console.error(
          `error loading tile of optical path "${opticalPathIdentifier}"`,
          event
        )
      })

      opticalPath.layer = new TileLayer({
        source,
        extent: this[_tileGrid].extent,
        preload: this[_options].preload ? 1 : 0,
        useInterimTilesOnError: false,
        cacheSize: this[_options].tilesCacheSize
      })
      opticalPath.layer.on('error', (event) => {
        console.error(
          `error rendering optical path "${opticalPathIdentifier}"`,
          event
        )
      })

      opticalPath.overviewLayer = new TileLayer({
        source,
        extent: pyramid.extent,
        preload: 0,
        useInterimTilesOnError: false
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
        template: ' '
      })
      const tileDebugLayer = new TileLayer({
        source: tileDebugSource,
        extent: this[_pyramid].extent,
        projection: this[_projection]
      })
      layers.push(tileDebugLayer)
    }

    if (Math.max(...this[_pyramid].gridSizes[0]) <= 10) {
      const center = getCenter(this[_projection].getExtent())
      this[_overviewMap] = new OverviewMap({
        view: new View({
          projection: this[_projection],
          rotation: this[_rotation],
          constrainOnlyCenter: true,
          resolutions: [this[_tileGrid].getResolution(0)],
          extent: center.concat(center),
          showFullExtent: true
        }),
        layers: overviewLayers,
        collapsed: false,
        collapsible: true,
        rotateWithView: true
      })
      this[_updateOverviewMapSize] = () => {
        const degrees = this[_rotation] / Math.PI * 180
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
          showFullExtent: true
        })
        const map = this[_overviewMap].getOverviewMap()

        const overviewElement = this[_overviewMap].element
        const overviewmapElement = Object.values(overviewElement.children).find(
          c => c.className === 'ol-overviewmap-map'
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
      keyboardEventTarget: document,
      interactions: defaultInteractions({
        altShiftDragRotate: true,
        doubleClickZoom: false,
        mouseWheelZoom: true,
        keyboard: false,
        shiftDragZoom: true,
        dragPan: true,
        pinchRotate: true,
        pinchZoom: true
      })
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
      dragPan: this[_map].getInteractions().getArray().find((i) => {
        return i instanceof DragPan
      })
    }

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
      if (this[_overviewMap]) {
        this[_controls].overview = this[_overviewMap]
      }
    }
    if (this[_options].controls.has('position')) {
      this[_controls].position = new MousePosition({
        projection: this[_projection],
        coordinateFormat: (imageCoordinates) => {
          const slideCoordinates = _geometryCoordinates2scoord3dCoordinates(
            imageCoordinates,
            this[_pyramid].metadata,
            this[_affine]
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
        }
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
      drawingSource: this[_drawingSource]
    })

    this[_overlays] = {}
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
      `set style for optical path "${opticalPathIdentifier}"`,
      styleOptions
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
          Math.min(styleOptions.limitValues[1], opticalPath.maxStoredValue)
        ]
      }
      const [windowCenter, windowWidth] = createWindow(
        opticalPath.style.limitValues[0],
        opticalPath.style.limitValues[1]
      )

      if (styleOptions.paletteColorLookupTable != null) {
        opticalPath.style.paletteColorLookupTable = styleOptions.paletteColorLookupTable
        const style = _getColorPaletteStyleForTileLayer({
          windowCenter,
          windowWidth,
          colormap: styleOptions.paletteColorLookupTable.data
        })
        opticalPath.layer.setStyle(style)
        opticalPath.overviewLayer.setStyle(style)
      } else if (styleOptions.color != null) {
        opticalPath.style.color = styleOptions.color
        if (opticalPath.style.paletteColorLookupTable) {
          const style = _getColorInterpolationStyleForTileLayer({
            windowCenter,
            windowWidth,
            color: opticalPath.style.color
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
            blue: opticalPath.style.color[2]
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
  isOpticalPathColorable (opticalPathIdentifier) {
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
  isOpticalPathMonochromatic (opticalPathIdentifier) {
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
  getOpticalPathDefaultStyle (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath == null) {
      throw new Error(
        'Cannot get default style of optical path. ' +
        `Could not find optical path "${opticalPathIdentifier}".`
      )
    }
    if (opticalPath.opticalPath.isMonochromatic) {
      if (opticalPath.defaultStyle.paletteColorLookupTable) {
        return {
          paletteColorLookupTable: opticalPath.defaultStyle.paletteColorLookupTable,
          opacity: opticalPath.defaultStyle.opacity,
          limitValues: opticalPath.defaultStyle.limitValues
        }
      }
      return {
        color: opticalPath.defaultStyle.color,
        opacity: opticalPath.defaultStyle.opacity,
        limitValues: opticalPath.defaultStyle.limitValues
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
  getOpticalPathStyle (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath == null) {
      throw new Error(
        'Cannot get style of optical path. ' +
        `Could not find optical path "${opticalPathIdentifier}".`
      )
    }
    if (opticalPath.opticalPath.isMonochromatic) {
      if (opticalPath.style.paletteColorLookupTable) {
        return {
          paletteColorLookupTable: opticalPath.style.paletteColorLookupTable,
          opacity: opticalPath.style.opacity,
          limitValues: opticalPath.style.limitValues
        }
      }
      return {
        color: opticalPath.style.color,
        opacity: opticalPath.style.opacity,
        limitValues: opticalPath.style.limitValues
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
  getOpticalPathMetadata (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot get image metadata optical path. ' +
        `Could not find optical path "${opticalPathIdentifier}".`
      )
    }
    return opticalPath.pyramid.metadata
  }

  /**
   * Get all optical paths.
   *
   * @return {opticalPath.OpticalPath[]}
   */
  getAllOpticalPaths () {
    const opticalPaths = []
    for (const opticalPathIdentifier in this[_opticalPaths]) {
      opticalPaths.push(this[_opticalPaths][opticalPathIdentifier].opticalPath)
    }
    return opticalPaths.sort(item => (item.OpticalPathIdentifier))
  }

  /**
   * Activate an optical path.
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
    if (!this.isOpticalPathActive(opticalPathIdentifier)) {
      /*
       * Add layer to the bottom of the layer stack to ensure that vector
       * graphics are overlayed ontop of the raster graphics.
       */
      this[_map].getLayers().insertAt(
        0,
        opticalPath.layer
      )
      if (this[_overviewMap]) {
        this[_overviewMap].getOverviewMap().getLayers().insertAt(
          0,
          opticalPath.overviewLayer
        )
      }
    }
  }

  /**
   * Deactivate an optical path.
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
  isOpticalPathActive (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath == null) {
      return false
    }
    const layers = this[_map].getLayers()
    const match = layers.getArray().find(layer => {
      return layer.ol_uid === opticalPath.layer.ol_uid
    })
    if (this[_overviewMap] != null) {
      const overviewLayers = this[_overviewMap].getOverviewMap().getLayers()
      const overviewMatch = overviewLayers.getArray().find(layer => {
        return layer.ol_uid === opticalPath.overviewLayer.ol_uid
      })
      return match != null || overviewMatch != null
    } else {
      return match != null
    }
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
  showOpticalPath (opticalPathIdentifier, styleOptions = {}) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot show optical path. Could not find optical path ' +
        `"${opticalPathIdentifier}".`
      )
    }
    console.info(`show optical path ${opticalPathIdentifier}`)
    this.activateOpticalPath(opticalPathIdentifier)

    const container = this[_map].getTargetElement()
    if (container && !opticalPath.hasLoader) {
      const metadata = opticalPath.pyramid.metadata
      const client = _getClient(
        this[_clients],
        Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE
      )
      _getIccProfiles(metadata, client).then(profiles => {
        const loader = _createTileLoadFunction({
          targetElement: container,
          iccProfiles: profiles,
          ...opticalPath.loaderParams
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
  hideOpticalPath (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot hide optical path. Could not find optical path ' +
        `"${opticalPathIdentifier}".`
      )
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
  isOpticalPathVisible (opticalPathIdentifier) {
    const opticalPath = this[_opticalPaths][opticalPathIdentifier]
    if (opticalPath === undefined) {
      throw new Error(
        'Cannot show optical path. Could not find optical path ' +
        `"${opticalPathIdentifier}".`
      )
    }
    return opticalPath.layer.getVisible()
  }

  /**
   * Resize the viewer to fit the viewport.
   *
   * @returns {void}
   */
  resize () {
    this[_map].updateSize()
    this[_updateOverviewMapSize]()
  }

  /**
   * Size of the viewport.
   *
   * @type {number[]}
   */
  get size () {
    return this[_map].getSize()
  }

  /**
   * Clean up.
   *
   * Release allocated memory and clear the viewport.
   */
  cleanup () {
    console.info('cleanup')
    const itemsRequiringDisposal = [
      ...Object.values(this[_opticalPaths]),
      ...Object.values(this[_segments]),
      ...Object.values(this[_mappings]),
      ...Object.values(this[_annotationGroups])
    ]
    itemsRequiringDisposal.forEach(item => {
      item.layer.dispose()
      this[_map].removeLayer(item.layer)
      if (item.overlay) {
        item.overlay.dispose()
        this[_map].removeOverlay(item.overlay)
      }
      this[_features].clear()
    })

    webWorkerManager.terminateAllWebWorkers()
  }

  /**
   * Render the images in the specified viewport container.
   *
   * @param {Object} options - Rendering options.
   * @param {(string|HTMLElement)} options.container - HTML Element in which the viewer should be injected.
   */
  render ({ container }) {
    if (container == null) {
      console.error('container must be provided for rendering images')
      return
    }

    const itemsRequiringDecodersAndTransformers = [
      ...Object.values(this[_opticalPaths]),
      ...Object.values(this[_segments]),
      ...Object.values(this[_mappings])
    ]

    const styleControlElement = (element) => {
      element.style.backgroundColor = 'rgba(255,255,255,.75)'
      element.style.color = 'black'
      element.style.padding = '2px'
      element.style.margin = '1px'
    }

    itemsRequiringDecodersAndTransformers.forEach(item => {
      const metadata = item.pyramid.metadata
      const client = _getClient(
        this[_clients],
        Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE
      )
      _getIccProfiles(metadata, client).then(profiles => {
        const source = item.layer.getSource()
        if (!source) {
          return
        }
        const loader = _createTileLoadFunction({
          targetElement: container,
          iccProfiles: profiles,
          ...item.loaderParams
        })
        source.setLoader(loader)
        item.hasLoader = true
        this[_map].setTarget(container)

        const view = this[_map].getView()
        const projection = view.getProjection()
        view.fit(projection.getExtent(), { size: this[_map].getSize() })
        this[_updateOverviewMapSize]()

        this[_drawingSource].on(VectorEventType.ADDFEATURE, (e) => {
          publish(
            container,
            EVENT.ROI_ADDED,
            this._getROIFromFeature(e.feature, metadata, this[_affine])
          )
        })
        this[_drawingSource].on(VectorEventType.CHANGEFEATURE, (e) => {
          if (e.feature !== undefined || e.feature !== null) {
            const geometry = e.feature.getGeometry()
            const type = geometry.getType()
            /*
             * The first and last point of a polygon must be identical. The
             * last point is an implementation detail and is hidden from the
             * user in the graphical interface. However, we must update the
             * last point in case the first point has been modified by the
             * user.
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
            this._getROIFromFeature(e.feature, metadata, this[_affine])
          )
        })
        this[_drawingSource].on(VectorEventType.REMOVEFEATURE, (e) => {
          publish(
            container,
            EVENT.ROI_REMOVED,
            this._getROIFromFeature(e.feature, metadata, this[_affine])
          )
        })

        if (this[_controls].overview && this[_overviewMap]) {
          // Style overview element (overriding Openlayers CSS "ol-overviewmap")
          const overviewElement = this[_controls].overview.element
          const overviewChildren = overviewElement.children
          const overviewmapElement = Object.values(overviewChildren).find(
            c => c.className === 'ol-overviewmap-map'
          )
          const buttonElement = Object.values(overviewChildren).find(
            c => c.type === 'button'
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
  get numLevels () {
    return this[_pyramid].pixelSpacings.length
  }

  /**
   * Frame of Reference UID.
   *
   * @type string
   */
  get frameOfReferenceUID () {
    return this[_pyramid].metadata[0].FrameOfReferenceUID
  }

  /**
   * Get the pixel spacing at a given zoom level.
   *
   * @param {Object} options - Options.
   * @param {number} options.level - Zoom level.
   * @returns {number[]} Spacing between the centers of two neighboring pixels
   */
  getPixelSpacing (level) {
    return this[_pyramid].pixelSpacings[level].slice(0)
  }

  /**
   * Physical offset of images.
   * Offset along the X and Y axes of the slide coordinate system in
   * millimeter unit.
   *
   * @type number[]
   */
  get physicalOffset () {
    const point = applyTransform({
      coordinate: [0, 0],
      affine: this[_affine]
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
  get physicalSize () {
    const offset = this.physicalOffset
    const metadata = this[_pyramid].metadata[this[_pyramid].metadata.length - 1]
    const point = applyTransform({
      coordinate: [
        metadata.TotalPixelMatrixColumns,
        metadata.TotalPixelMatrixRows
      ],
      affine: this[_affine]
    })
    return [
      Math.abs(point[0] - offset[0]),
      Math.abs(point[1] - offset[1])
    ]
  }

  /**
   * Bounding box that contains the images.
   *
   * @type number[][]
   */
  get boundingBox () {
    const startPoint = this.physicalOffset
    const metadata = this[_pyramid].metadata[this[_pyramid].metadata.length - 1]
    const endPoint = applyTransform({
      coordinate: [
        metadata.TotalPixelMatrixColumns,
        metadata.TotalPixelMatrixRows
      ],
      affine: this[_affine]
    })
    const offset = [
      Math.min(startPoint[0], endPoint[0]),
      Math.min(startPoint[1], endPoint[1])
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
  navigate ({ level, position }) {
    if (level > this.numLevels) {
      throw new Error('Argument "level" exceeds number of resolution levels.')
    }
    let coordinates
    if (position != null) {
      coordinates = _scoord3dCoordinates2geometryCoordinates(
        position,
        this[_pyramid],
        this[_affineInverse]
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
  activateDrawInteraction (options) {
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
        geometryFunction: createBox()
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
    console.log("bindings are", options.bindings);
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
        options[Enums.InternalProperties.StyleOptions]
      )

      this[_annotationManager].onDrawStart(event)

      _wireMeasurementsAndQualitativeEvaluationsEvents(
        this[_map],
        event.feature,
        this[_pyramid].metadata,
        this[_affine]
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
          this[_affine]
        )
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
   * @type boolean
   */
  get isDrawInteractionActive () {
    return this[_interactions].draw !== undefined
  }

  /**
   * Whether drag pan interaction is active.
   *
   * @type boolean
   */
  get isDragPanInteractionActive () {
    return this[_interactions].dragPan !== undefined
  }

  /**
   * Whether drag zoom interaction is active.
   *
   * @type boolean
   */
  get isDragZoomInteractionActive () {
    return this[_interactions].dragZoom !== undefined
  }

  /**
   * Whether translate interaction is active.
   *
   * @type boolean
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
   * @param {Object} feature - Openlayers Feature
   * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
   * @param {number[][]} affine - 3x3 affine transformation matrix
   * @param {Object} context - Context
   * @returns {roi.ROI} Region of interest
   * @private
   */
  _getROIFromFeature (feature, pyramid, affine) {
    let scoord3d
    try {
      scoord3d = _geometry2Scoord3d(feature, pyramid, affine)
    } catch (error) {
      const uid = feature.getId()
      this.removeROI(uid)
      throw error
    }

    const featureProperties = feature.getProperties()
    const properties = {
      measurements: featureProperties.measurements,
      evaluations: featureProperties.evaluations
    }
    const uid = feature.getId()
    return new ROI({ scoord3d, properties, uid })
  }

  /**
   * Toggle overview map.
   *
   * @returns {void}
   */
  toggleOverviewMap () {
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
  deactivateTranslateInteraction () {
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
   * Deactivate drag zoom interaction.
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
   * @param {Object} options selection options.
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
        this._getROIFromFeature(
          e.selected[0],
          this[_pyramid].metadata,
          this[_affine]
        )
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
   * Activate drag pan interaction.
   *
   * @param {Object} options - Options.
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
   * Deactivate drag pan interaction.
   */
  deactivateDragPanInteraction () {
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
   * @type boolean
   */
  get isSelectInteractionActive () {
    return this[_interactions].select !== undefined
  }

  /**
   * Activate modify interaction.
   *
   * @param {Object} options - Modification options.
   */
  activateModifyInteraction (options = {}) {
    this.deactivateModifyInteraction()

    console.info('activate "modify" interaction')

    const modifyOptions = {
      features: this[_features],
      insertVertexCondition: (event) => true
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
    const container = this[_map].getTargetElement()

    this[_interactions].modify.on(Enums.InteractionEvents.MODIFY_END, (event) => {
      const feature = event.features.item(0)
      _updateFeatureMeasurements(
        this[_map], feature,
        this[_pyramid].metadata,
        this[_affine]
      )
      this[_annotationManager].onUpdate(feature)
      publish(
        container,
        EVENT.ROI_MODIFIED,
        this._getROIFromFeature(
          feature,
          this[_pyramid].metadata,
          this[_affine]
        )
      )
    })

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
   * @type boolean
   */
  get isModifyInteractionActive () {
    return this[_interactions].modify !== undefined
  }

  /**
   * Get all annotated regions of interest.
   *
   * @returns {roi.ROI[]} Array of regions of interest.
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
    if (this[_overviewMap]) {
      this[_overviewMap].setCollapsed(true)
    }
  }

  expandOverviewMap () {
    if (this[_overviewMap]) {
      this[_overviewMap].setCollapsed(true)
    }
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
   * Get an individual annotated region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @returns {roi.ROI} Region of interest.
   */
  getROI (uid) {
    console.debug(`get ROI ${uid}`)
    const feature = this[_drawingSource].getFeatureById(uid)
    if (feature == null) {
      throw new Error(`Could not find a ROI with UID "${uid}".`)
    }
    return this._getROIFromFeature(
      feature,
      this[_pyramid].metadata,
      this[_affine]
    )
  }

  /**
   * Add a measurement to a region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @param {Object} item - NUM content item representing a measurement
   */
  addROIMeasurement (uid, item) {
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

  /**
   * Pop the most recently annotated regions of interest.
   *
   * @returns {roi.ROI} Regions of interest.
   */
  popROI () {
    console.info('pop ROI')
    const feature = this[_features].pop()
    return this._getROIFromFeature(
      feature,
      this[_pyramid].metadata,
      this[_affine]
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
  addROI (roi, styleOptions = {}) {
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

    const frameOfReferenceUID = this[_pyramid].metadata.FrameOfReferenceUID
    if (roi.frameOfReferenceUID !== frameOfReferenceUID) {
      throw new Error(
        `Frame of Reference UID of ROI ${roi.uid} does not match ` +
        'Frame of Reference UID of source images.'
      )
    }

    const geometry = _scoord3d2Geometry(
      roi.scoord3d,
      this[_pyramid].metadata,
      this[_affineInverse]
    )
    const featureOptions = { geometry }

    const feature = new Feature(featureOptions)
    _addROIPropertiesToFeature(feature, roi.properties, true)
    feature.setId(roi.uid)

    _wireMeasurementsAndQualitativeEvaluationsEvents(
      this[_map],
      feature,
      this[_pyramid].metadata,
      this[_affine]
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
  updateROI ({ uid, properties = {} }) {
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
  getROIStyle (uid) {
    const feature = this[_features].getArray().find((feature) => {
      return feature.getId() === uid
    })
    if (feature == null) {
      throw new Error(`Could not find a ROI with UID "${uid}".`)
    }
    const style = feature.getStyle()
    const stroke = style.getStroke()
    const fill = style.getFill()
    return {
      stroke: {
        color: stroke.getColor(),
        width: stroke.getWidth()
      },
      fill: {
        color: fill.getColor()
      }
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
  setROIStyle (uid, styleOptions = {}) {
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
  addViewportOverlay ({ element, coordinates, navigate, className }) {
    const offset = _scoord3dCoordinates2geometryCoordinates(
      coordinates,
      this[_pyramid],
      this[_affineInverse]
    )
    const overlay = new Overlay({
      element,
      className: (
        className != null
          ? `ol-overlay-container ol-selectable ${className}`
          : 'ol-overlay-container ol-selectable'
      ),
      offset,
      autoPan: navigate != null ? navigate : false,
      stopEvent: false
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
  removeViewportOverlay ({ element }) {
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
  removeROI (uid) {
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
   * Add annotation groups.
   *
   * @param {metadata.MicroscopyBulkSimpleAnnotations} metadata - Metadata of a
   * DICOM Microscopy Simple Bulk Annotations instance
   */
  addAnnotationGroups (metadata) {
    const refImage = this[_pyramid].metadata[0]
    if (refImage.FrameOfReferenceUID !== metadata.FrameOfReferenceUID) {
      throw new Error(
        'Microscopy Bulk Simple Annotation instances must have the same ' +
        'Frame of Reference UID as the corresponding source images.'
      )
    }
    console.info(
      'add annotation groups of Microscopy Bulk Simple Annotation instances ' +
      `of series "${metadata.SeriesInstanceUID}"`
    )

    const defaultAnnotationGroupStyle = {
      opacity: 1.0,
      color: this[_options].primaryColor
    }

    const _getROIFromFeature = (feature) => {
      const roi = this._getROIFromFeature(
        feature,
        this[_pyramid].metadata,
        this[_affine]
      )
      const annotationGroupUID = feature.get('annotationGroupUID')
      const annotationGroupMetadata = metadata.AnnotationGroupSequence.find(
        item => item.AnnotationGroupUID === annotationGroupUID
      )
      if (annotationGroupUID == null || annotationGroupMetadata == null) {
        throw new Error(
          'Could not obtain information of annotation from ' +
          `annotation group "${annotationGroupUID}".`
        )
      }

      if (annotationGroupMetadata.AnnotationPropertyCategoryCodeSequence != null) {
        const findingCategory = (
          annotationGroupMetadata.AnnotationPropertyCategoryCodeSequence[0]
        )
        roi.addEvaluation(
          new dcmjs.sr.valueTypes.CodeContentItem({
            name: new dcmjs.sr.coding.CodedConcept({
              value: '276214006',
              meaning: 'Finding category',
              schemeDesignator: 'SCT'
            }),
            value: new dcmjs.sr.coding.CodedConcept({
              value: findingCategory.CodeValue,
              meaning: findingCategory.CodeMeaning,
              schemeDesignator: findingCategory.CodingSchemeDesignator
            }),
            relationshipType:
              dcmjs.sr.valueTypes.RelationshipTypes.HAS_CONCEPT_MOD
          })
        )
      }
      if (annotationGroupMetadata.AnnotationPropertyTypeCodeSequence != null) {
        const findingType = (
          annotationGroupMetadata.AnnotationPropertyTypeCodeSequence[0]
        )
        roi.addEvaluation(
          new dcmjs.sr.valueTypes.CodeContentItem({
            name: new dcmjs.sr.coding.CodedConcept({
              value: '121071',
              meaning: 'Finding',
              schemeDesignator: 'DCM'
            }),
            value: new dcmjs.sr.coding.CodedConcept({
              value: findingType.CodeValue,
              meaning: findingType.CodeMeaning,
              schemeDesignator: findingType.CodingSchemeDesignator
            }),
            relationshipType:
              dcmjs.sr.valueTypes.RelationshipTypes.HAS_CONCEPT_MOD
          })
        )
      }

      if (annotationGroupMetadata.MeasurementsSequence != null) {
        annotationGroupMetadata.MeasurementsSequence.forEach(
          (measurementItem, measurementIndex) => {
            const key = `measurementValue${measurementIndex.toString()}`
            const value = feature.get(key)
            const name = measurementItem.ConceptNameCodeSequence[0]
            const unit = measurementItem.MeasurementUnitsCodeSequence[0]

            const measurement = new dcmjs.sr.valueTypes.NumContentItem({
              value: Number(value),
              name: new dcmjs.sr.coding.CodedConcept({
                value: name.CodeValue,
                meaning: name.CodeMeaning,
                schemeDesignator: name.CodingSchemeDesignator
              }),
              unit: new dcmjs.sr.coding.CodedConcept({
                value: unit.CodeValue,
                meaning: unit.CodeMeaning,
                schemeDesignator: unit.CodingSchemeDesignator
              }),
              relationshipType: dcmjs.sr.valueTypes.RelationshipTypes.CONTAINS
            })
            if (measurementItem.ReferencedImageSequence != null) {
              const ref = measurementItem.ReferencedImageSequence[0]
              const image = new dcmjs.sr.valueTypes.ImageContentItem({
                name: new dcmjs.sr.coding.CodedConcept({
                  value: '121112',
                  meaning: 'Source of Measurement',
                  schemeDesignator: 'DCM'
                }),
                referencedSOPClassUID: ref.ReferencedSOPClassUID,
                referencedSOPInstanceUID: ref.ReferencedSOPInstanceUID
              })
              if (ref.ReferencedOpticalPathIdentifier != null) {
                image.ReferencedSOPSequence[0].ReferencedOpticalPathIdentifier = (
                  ref.ReferencedOpticalPathIdentifier
                )
              }
              measurement.ContentSequence = [image]
            }
            roi.addMeasurement(measurement)
          }
        )
      }

      return roi
    }

    // We need to bind those variables to constants for the loader function
    const client = _getClient(
      this[_clients],
      Enums.SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE
    )
    const pyramid = this[_pyramid].metadata
    const affineInverse = this[_affineInverse]

    metadata.AnnotationGroupSequence.forEach((item, index) => {
      const annotationGroupUID = item.AnnotationGroupUID
      const algorithm = item.AnnotationGroupAlgorithmIdentificationSequence[0]
      const annotationGroup = {
        annotationGroup: new AnnotationGroup({
          uid: annotationGroupUID,
          number: item.AnnotationGroupNumber,
          label: item.AnnotationGroupLabel,
          algorithmType: item.AnnotationGroupGenerationType,
          algorithmName: algorithm.AlgorithmName,
          propertyCategory: item.AnnotationPropertyCategoryCodeSequence[0],
          propertyType: item.AnnotationPropertyTypeCodeSequence[0],
          studyInstanceUID: metadata.StudyInstanceUID,
          seriesInstanceUID: metadata.SeriesInstanceUID,
          sopInstanceUIDs: [metadata.SOPInstanceUID]
        }),
        style: { ...defaultAnnotationGroupStyle },
        defaultStyle: defaultAnnotationGroupStyle,
        metadata
      }

      if (item.GraphicType === 'POLYLINE') {
        /*
         * We represent graphics as centroid points, but it's unclear whether
         * the centroid of a polyline would be meaningful
         */
        console.warn(
          `skip annotation group "${annotationGroupUID}" ` +
          'with Graphic Type POLYLINE'
        )
        return
      }

      /**
       * In the loader function "this" is bound to the vector source.
       */
      function loader (extent, resolution, projection, success, failure) {
        // TODO: figure out how to use "loader" with bbox or tile "strategy"?
        const index = annotationGroup.annotationGroup.number - 1
        const metadataItem = annotationGroup.metadata.AnnotationGroupSequence[index]
        /**
         * Bulkdata may not be available, since it's possible that all information
         * has been included into the metadata by value as InlineBinary. It must
         * only be provided if information has been included by reference as
         * BulkDataURI.
         */
        const bulkdataReferences = annotationGroup.metadata.bulkdataReferences
        let bulkdataItem
        if (bulkdataReferences.AnnotationGroupSequence != null) {
          bulkdataItem = bulkdataReferences.AnnotationGroupSequence[index]
        }

        const numberOfAnnotations = Number(metadataItem.NumberOfAnnotations)
        const graphicType = metadataItem.GraphicType
        const coordinateDimensionality = _getCoordinateDimensionality(
          metadataItem
        )
        const commonZCoordinate = _getCommonZCoordinate(metadataItem)

        const features = this.getFeatures()
        if (features.length > 0) {
          success(features)
          return
        }

        // TODO: Only fetch measurements if required.
        const promises = [
          _fetchGraphicData({ metadataItem, bulkdataItem, client }),
          _fetchGraphicIndex({ metadataItem, bulkdataItem, client }),
          _fetchMeasurements({ metadataItem, bulkdataItem, client })
        ]
        Promise.all(promises).then(retrievedBulkdata => {
          const graphicData = retrievedBulkdata[0]
          const graphicIndex = retrievedBulkdata[1]
          const measurements = retrievedBulkdata[2]

          console.log('process annotations')
          for (let i = 0; i < numberOfAnnotations; i++) {
            const point = _getCentroid(
              graphicType,
              graphicData,
              graphicIndex,
              coordinateDimensionality,
              commonZCoordinate,
              i,
              numberOfAnnotations
            )
            const coordinates = _scoord3dCoordinates2geometryCoordinates(
              point,
              pyramid,
              affineInverse
            )
            const feature = new Feature({
              geometry: new PointGeometry(coordinates)
            })

            feature.set('annotationGroupUID', annotationGroupUID, true)
            measurements.forEach((measurementItem, measurementIndex) => {
              const key = `measurementValue${measurementIndex.toString()}`
              const value = measurementItem.values[i]
              // Needed for the WebGL renderer
              feature.set(key, value, true)
            })
            const uid = _generateUID({ value: `${annotationGroupUID}-${i}` })
            feature.setId(uid)
            features.push(feature)
          }

          console.info(
            `add n=${features.length} annotations ` +
            `for annotation group "${annotationGroupUID}"`
          )
          this.addFeatures(features)
          console.info(
            'compute statistics for measurement values ' +
            `of annotation group "${annotationGroupUID}"`
          )
          const properties = {}
          measurements.forEach((measurementItem, measurementIndex) => {
            /*
             * Ideally, we would compute quantiles, but that is an expensive
             * operation. For now, just compute mininum and maximum.
             */
            const min = measurementItem.values.reduce(
              (a, b) => Math.min(a, b),
              Infinity
            )
            const max = measurementItem.values.reduce(
              (a, b) => Math.max(a, b),
              -Infinity
            )
            const key = `measurementValue${measurementIndex.toString()}`
            properties[key] = { min, max }
          })
          this.setProperties(properties, true)
          success(features)
        }).catch(error => {
          console.error(error)
          failure()
        })
      }

      const source = new VectorSource({
        loader,
        wrapX: false,
        rotateWithView: true,
        overlaps: false
      })
      source.on('featuresloadstart', (event) => {
        const container = this[_map].getTargetElement()
        publish(container, EVENT.LOADING_STARTED)
      })
      source.on('featuresloadend', (event) => {
        const container = this[_map].getTargetElement()
        publish(container, EVENT.LOADING_ENDED)
      })
      source.on('featuresloaderror', (event) => {
        const container = this[_map].getTargetElement()
        publish(container, EVENT.LOADING_ENDED)
        publish(container, EVENT.LOADING_ERROR)
      })

      /*
       * TODO: Determine optimal sizes based on number of zoom levels and
       * number of objects, and zoom factor between levels.
       * Use style variable(s) that can subsequently be updated.
       */
      const style = {
        symbol: {
          symbolType: 'circle',
          size: [
            'interpolate',
            ['linear'],
            ['zoom'],
            1,
            2,
            this[_pyramid].metadata.length,
            15
          ],
          color: annotationGroup.style.color,
          opacity: annotationGroup.style.opacity
        }
      }
      annotationGroup.layer = new PointsLayer({
        source,
        style,
        disableHitDetection: false
      })
      annotationGroup.layer.setVisible(false)

      this[_map].addLayer(annotationGroup.layer)
      this[_annotationGroups][annotationGroupUID] = annotationGroup
    })

    let selectedAnnotation = null
    this[_map].on('singleclick', (e) => {
      if (e != null) {
        if (selectedAnnotation != null) {
          selectedAnnotation.set('selected', 0)
          selectedAnnotation = null
        }
        const container = this[_map].getTargetElement()
        this[_map].forEachFeatureAtPixel(
          e.pixel,
          (feature) => {
            if (feature != null) {
              feature.set('selected', 1)
              selectedAnnotation = feature
              publish(
                container,
                EVENT.ROI_SELECTED,
                _getROIFromFeature(feature)
              )
              return true
            }
            return false
          },
          {
            hitTolerance: 1,
            layerFilter: (layer) => (layer instanceof PointsLayer)
          }
        )
      }
    })
  }

  /**
   * Remove an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation
   * group
   */
  removeAnnotationGroup (annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      throw new Error(
        'Cannot remove annotation group. ' +
        `Could not find annotation group "${annotationGroupUID}".`
      )
    }
    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    console.info(`remove annotation group ${annotationGroupUID}`)
    this[_map].removeLayer(annotationGroup.layer)
    annotationGroup.layer.dispose()
    delete this[_annotationGroups][annotationGroupUID]
  }

  /**
   * Remove all annotation groups.
   */
  removeAllAnnotationGroups () {
    Object.keys(this[_annotationGroups]).forEach(annotationGroupUID => {
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
  showAnnotationGroup (annotationGroupUID, styleOptions = {}) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      throw new Error(
        'Cannot show annotation group. ' +
        `Could not find annotation group "${annotationGroupUID}".`
      )
    }
    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    console.info(`show annotation group ${annotationGroupUID}`)
    this.setAnnotationGroupStyle(annotationGroupUID, styleOptions)
    annotationGroup.layer.setVisible(true)
  }

  /**
   * Hide an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation
   * group
   */
  hideAnnotationGroup (annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      throw new Error(
        'Cannot hide annotation group. ' +
        `Could not find annotation group "${annotationGroupUID}".`
      )
    }
    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    console.info(`hide annotation group ${annotationGroupUID}`)
    annotationGroup.layer.setVisible(false)
  }

  /**
   * Is annotation group visible.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation
   * group
   */
  isAnnotationGroupVisible (annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      throw new Error(
        'Cannot determine if annotation group is visible. ' +
        `Could not find annotation group "${annotationGroupUID}".`
      )
    }
    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    return annotationGroup.layer.getVisible()
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
   */
  setAnnotationGroupStyle (annotationGroupUID, styleOptions = {}) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      throw new Error(
        'Cannot set style of annotation group. ' +
        `Could not find annotation group "${annotationGroupUID}".`
      )
    }
    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    console.info(
      `set style for annotation group "${annotationGroupUID}"`,
      styleOptions
    )

    if (styleOptions.opacity != null) {
      annotationGroup.style.opacity = styleOptions.opacity
      annotationGroup.layer.setOpacity(styleOptions.opacity)
    }
    if (styleOptions.color != null) {
      annotationGroup.style.color = styleOptions.color
    }

    const metadata = annotationGroup.metadata
    const source = annotationGroup.layer.getSource()
    const groupItem = metadata.AnnotationGroupSequence.find(item => {
      return item.AnnotationGroupUID === annotationGroupUID
    })
    if (groupItem == null) {
      throw new Error(
        'Cannot set style of annotation group. ' +
        `Could not find metadata of annotation group "${annotationGroupUID}".`
      )
    }

    const markerType = 'circle'
    const topLayerIndex = 0
    const topLayerPixelSpacing = this[_pyramid].pixelSpacings[topLayerIndex]
    const baseLayerIndex = this[_pyramid].metadata.length - 1
    const baseLayerPixelSpacing = this[_pyramid].pixelSpacings[baseLayerIndex]
    const diameter = 5 * 10 ** -3 // micometer
    const markerSize = [
      'interpolate',
      ['exponential', 2],
      ['zoom'],
      1,
      Math.max(diameter / topLayerPixelSpacing[0], 1),
      this[_pyramid].resolutions.length,
      Math.min(diameter / baseLayerPixelSpacing[0], 50)
    ]

    const name = styleOptions.measurement
    if (name) {
      const measurementIndex = groupItem.MeasurementsSequence.findIndex(item => {
        return areCodedConceptsEqual(name, getContentItemNameCodedConcept(item))
      })
      if (measurementIndex == null) {
        throw new Error(
          'Cannot set style of annotation group. ' +
          `Could not find measurement "${name.CodeMeaning}" ` +
          `of annotation group "${annotationGroupUID}".`
        )
      }
      const properties = source.getProperties()
      const key = `measurementValue${measurementIndex.toString()}`

      if (properties[key]) {
        const style = {
          symbol: {
            symbolType: markerType,
            size: markerSize,
            opacity: annotationGroup.style.opacity
          }
        }
        const colormap = createColormap({
          name: ColormapNames.VIRIDIS,
          bins: 50
        })
        Object.assign(
          style.symbol,
          _getColorPaletteStyleForPointLayer({
            key,
            minValue: properties[key].min,
            maxValue: properties[key].max,
            colormap
          })
        )
        const newLayer = new PointsLayer({
          source,
          style,
          disableHitDetection: false,
          visible: false
        })
        this[_map].addLayer(newLayer)
        this[_map].removeLayer(annotationGroup.layer)
        annotationGroup.layer.dispose()
        annotationGroup.layer = newLayer
      }
    } else {
      if (styleOptions.color != null) {
        // Only replace the layer if necessary
        const style = {
          symbol: {
            symbolType: markerType,
            size: markerSize,
            color: [
              'match',
              ['get', 'selected'],
              1,
              rgb2hex(this[_options].highlightColor),
              rgb2hex(annotationGroup.style.color)
            ],
            opacity: annotationGroup.style.opacity
          }
        }
        const newLayer = new PointsLayer({
          source,
          style,
          disableHitDetection: false,
          visible: false
        })
        this[_map].addLayer(newLayer)
        this[_map].removeLayer(annotationGroup.layer)
        const isVisible = annotationGroup.layer.getVisible()
        annotationGroup.layer.dispose()
        annotationGroup.layer = newLayer
        annotationGroup.layer.setVisible(isVisible)
      }
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
  getAnnotationGroupDefaultStyle (annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      throw new Error(
        'Cannot get default style of annotation group. ' +
        `Could not find annotation group "${annotationGroupUID}".`
      )
    }
    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    return {
      opacity: annotationGroup.defaultStyle.opacity,
      color: annotationGroup.defaultStyle.color
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
  getAnnotationGroupStyle (annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      throw new Error(
        'Cannot get style of annotation group. ' +
        `Could not find annotation group "${annotationGroupUID}".`
      )
    }
    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    return {
      opacity: annotationGroup.style.opacity,
      color: annotationGroup.style.color
    }
  }

  /**
   * Get all annotation groups.
   *
   * @returns {annotation.AnnotationGroup[]}
   */
  getAllAnnotationGroups () {
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
  getAnnotationGroupMetadata (annotationGroupUID) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      throw new Error(
        'Cannot get metadata of annotation group. ' +
        `Could not find annotation group "${annotationGroupUID}".`
      )
    }
    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    return annotationGroup.metadata
  }

  /**
   * Add segments.
   *
   * @param {metadata.Segmentation[]} metadata - Metadata of one or more DICOM Segmentation instances
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
        throw new Error(
          'Segmentation instances must contain attributes ' +
          '"Total Pixel Matrix Rows" and "Total Pixel Matrix Columns".'
        )
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
    const [fittedPyramid, minZoomLevel, maxZoomLevel] = _fitImagePyramid(
      pyramid,
      this[_pyramid]
    )

    const tileGrid = new TileGrid({
      extent: fittedPyramid.extent,
      origins: fittedPyramid.origins,
      resolutions: fittedPyramid.resolutions,
      sizes: fittedPyramid.gridSizes,
      tileSizes: fittedPyramid.tileSizes
    })

    let minStoredValue = 0
    let maxStoredValue = 255
    if (refSegmentation.SegmentationType === 'BINARY') {
      minStoredValue = 0
      maxStoredValue = 1
    }

    refSegmentation.SegmentSequence.forEach((item, index) => {
      const segmentNumber = Number(item.SegmentNumber)
      console.info(`add segment #${segmentNumber}`)
      let segmentUID = _generateUID({
        value: refSegmentation.SOPInstanceUID + segmentNumber.toString()
      })
      if (item.TrackingUID != null) {
        segmentUID = item.TrackingUID
      }

      const colormap = createColormap({
        name: ColormapNames.VIRIDIS,
        bins: Math.pow(2, 8)
      })

      const defaultSegmentStyle = {
        opacity: 0.75,
        paletteColorLookupTable: buildPaletteColorLookupTable({
          data: colormap,
          firstValueMapped: 0
        })
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
          sopInstanceUIDs: pyramid.metadata.map(element => {
            return element.SOPInstanceUID
          })
        }),
        pyramid,
        style: { ...defaultSegmentStyle },
        defaultStyle: defaultSegmentStyle,
        overlay: new Overlay({
          element: document.createElement('div'),
          offset: [5 + 5 * index + 2, 5]
        }),
        minStoredValue,
        maxStoredValue,
        minZoomLevel,
        maxZoomLevel,
        loaderParams: {
          pyramid: fittedPyramid,
          client: _getClient(this[_clients], Enums.SOPClassUIDs.SEGMENTATION),
          channel: segmentNumber
        },
        hasLoader: false
      }

      const source = new DataTileSource({
        tileGrid,
        projection: this[_projection],
        wrapX: false,
        bandCount: 1,
        interpolate: true
      })
      source.on('tileloaderror', (event) => {
        console.error(`error loading tile of segment "${segmentUID}"`, event)
      })

      const [windowCenter, windowWidth] = createWindow(
        minStoredValue,
        maxStoredValue
      )
      segment.layer = new TileLayer({
        source,
        extent: this[_pyramid].extent,
        visible: false,
        opacity: 0.9,
        preload: this[_options].preload ? 1 : 0,
        transition: 0,
        style: _getColorPaletteStyleForTileLayer({
          windowCenter,
          windowWidth,
          colormap: segment.style.paletteColorLookupTable.data
        }),
        useInterimTilesOnError: false,
        cacheSize: this[_options].tilesCacheSize,
        minResolution: (
          minZoomLevel > 0
            ? this[_pyramid].resolutions[minZoomLevel]
            : undefined
        )
      })
      segment.layer.on('error', (event) => {
        console.error(`error rendering segment "${segmentUID}"`, event)
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
  removeSegment (segmentUID) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        `Cannot remove segment. Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]
    this[_map].removeLayer(segment.layer)
    segment.layer.dispose()
    this[_map].removeOverlay(segment.overlay)
    delete this[_segments][segmentUID]
  }

  /**
   * Remove all segments.
   */
  removeAllSegments () {
    Object.keys(this[_segments]).forEach(segmentUID => {
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
  showSegment (segmentUID, styleOptions = {}) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        `Cannot show segment. Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]
    console.info(`show segment ${segmentUID}`)

    const container = this[_map].getTargetElement()
    if (container && !segment.hasLoader) {
      const loader = _createTileLoadFunction({
        targetElement: container,
        iccProfiles: [],
        ...segment.loaderParams
      })
      const source = segment.layer.getSource()
      source.setLoader(loader)
    }

    const view = this[_map].getView()
    const currentZoomLevel = view.getZoom()
    if (
      currentZoomLevel < segment.minZoomLevel ||
      currentZoomLevel > segment.maxZoomLevel
    ) {
      view.animate({ zoom: segment.minZoomLevel })
    }

    segment.layer.setVisible(true)
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
    console.info(`hide segment ${segmentUID}`)
    segment.layer.setVisible(false)
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
    return segment.layer.getVisible()
  }

  /**
   * Set the style of a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   * @param {Object} styleOptions - Style options
   * @param {number} [styleOptions.opacity] - Opacity
   */
  setSegmentStyle (segmentUID, styleOptions = {}) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        'Cannot set style of segment. ' +
        `Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]

    if (styleOptions.opacity != null) {
      segment.style.opacity = styleOptions.opacity
      segment.layer.setOpacity(styleOptions.opacity)
    }

    let title = segment.segment.propertyType.CodeMeaning
    const padding = Math.round((16 - title.length) / 2)
    title = title.padStart(title.length + padding)
    title = title.padEnd(title.length + 2 * padding)
    const overlayElement = segment.overlay.getElement()
    overlayElement.innerHTML = title
    overlayElement.style = {}
    overlayElement.style.display = 'flex'
    overlayElement.style.flexDirection = 'column'
    overlayElement.style.justifyContent = 'center'
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
    const height = 30
    const width = 15
    context.canvas.height = height
    context.canvas.width = width

    const colors = segment.style.paletteColorLookupTable.data
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

  /**
   * Get the default style of a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   *
   * @returns {Object} Default style settings
   */
  getSegmentDefaultStyle (segmentUID) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        'Cannot get default style of segment. ' +
        `Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]
    return {
      opacity: segment.defaultStyle.opacity,
      paletteColorLookupTable: segment.defaultStyle.paletteColorLookupTable
    }
  }

  /**
   * Get the style of a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   *
   * @returns {Object} Style settings
   */
  getSegmentStyle (segmentUID) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        'Cannot get style of segment. ' +
        `Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]
    return {
      opacity: segment.style.opacity,
      paletteColorLookupTable: segment.style.paletteColorLookupTable
    }
  }

  /**
   * Get image metadata for a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   *
   * @returns {metadata.Segmentation[]} Metadata of DICOM Segmentation instances
   */
  getSegmentMetadata (segmentUID) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        'Cannot get image metadata of segment. ' +
        `Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]
    return segment.pyramid.metadata
  }

  /**
   * Get all segments.
   *
   * @return {segment.Segment[]}
   */
  getAllSegments () {
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
  addParameterMappings (metadata) {
    if (metadata.length === 0) {
      throw new Error(
        'Metadata of Parametric Map instances needs to be provided to ' +
        'add mappings.'
      )
    }

    const refImage = this[_pyramid].metadata[0]
    const refParametricMap = metadata[0]
    if (refParametricMap.ContentLabel !== 'HEATMAP') {
      console.warn(
        'skip mappings because value of "Content Label" attribute of ' +
        'Parametric Map instances is not "HEATMAP"'
      )
      return
    }

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
    const [fittedPyramid, minZoomLevel, maxZoomLevel] = _fitImagePyramid(
      pyramid,
      this[_pyramid]
    )

    const tileGrid = new TileGrid({
      extent: fittedPyramid.extent,
      origins: fittedPyramid.origins,
      resolutions: fittedPyramid.resolutions,
      sizes: fittedPyramid.gridSizes,
      tileSizes: fittedPyramid.tileSizes
    })

    const refInstance = pyramid.metadata[0]

    const sharedFuncGroup = refInstance.SharedFunctionalGroupsSequence[0]
    const frameVOILUT = sharedFuncGroup.FrameVOILUTSequence[0]
    if (frameVOILUT === undefined) {
      throw new Error(
        'The Parametric Map image does not specify a shared frame ' +
        'Value of Interest (VOI) lookup table (LUT).'
      )
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
        value: refInstance.SOPInstanceUID + mappingLabel
      })
      if (refItem.TrackingUID != null) {
        mappingUID = refItem.TrackingUID
      }

      const range = [NaN, NaN]
      mappingDescriptions.forEach((item, i) => {
        if (item.TrackingUID != null) {
          if (item.TrackingUID !== mappingUID) {
            throw new Error(
              `Item #${i + 1} of Real World Value Mapping Sequence ` +
              `of frame #${index + 1} has unexpected Tracking UID. ` +
              'All items must have the same unique identifier value.'
            )
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
        const lowerBound = firstValueMapped * slope + intercept
        const upperBound = lastValueMapped * slope + intercept
        if (i === 0) {
          range[0] = lowerBound
          range[1] = upperBound
        } else {
          range[0] = Math.min(range[0], lowerBound)
          range[1] = Math.max(range[1], upperBound)
        }
      })

      // TODO: include real world values in legend
      if (isNaN(range[0]) || isNaN(range[1])) {
        throw new Error('Could not determine range of real world values.')
      }

      let colormap
      const isFloatPixelData = refInstance.BitsAllocated > 16
      let minStoredValue = 0
      let maxStoredValue = Math.pow(2, refInstance.BitsAllocated) - 1
      if (isFloatPixelData) {
        minStoredValue = -(Math.pow(2, refInstance.BitsAllocated) - 1) / 2
        maxStoredValue = (Math.pow(2, refInstance.BitsAllocated) - 1) / 2
      }
      if (refInstance.PixelPresentation === 'MONOCHROME') {
        colormap = createColormap({
          name: ColormapNames.MAGMA,
          bins: Math.pow(2, 8)
        })
      } else {
        if (range[0] < 0 && range[1] > 0) {
          colormap = createColormap({
            name: ColormapNames.BLUE_RED,
            bins: Math.pow(2, 8)
          })
        } else {
          colormap = createColormap({
            name: ColormapNames.HOT,
            bins: Math.pow(2, 8)
          })
        }
      }

      const defaultMappingStyle = {
        opacity: 1.0,
        limitValues: [
          Math.ceil(windowCenter - windowWidth / 2),
          Math.floor(windowCenter + windowWidth / 2)
        ],
        paletteColorLookupTable: buildPaletteColorLookupTable({
          data: colormap,
          firstValueMapped: 0
        })
      }

      const mapping = {
        mapping: new ParameterMapping({
          uid: mappingUID,
          number: mappingNumber,
          label: mappingLabel,
          description: mappingExplanation,
          studyInstanceUID: refInstance.StudyInstanceUID,
          seriesInstanceUID: refInstance.SeriesInstanceUID,
          sopInstanceUIDs: pyramid.metadata.map(element => {
            return element.SOPInstanceUID
          })
        }),
        pyramid,
        overlay: new Overlay({
          element: document.createElement('div'),
          offset: [5 + 100 * index + 2, 5]
        }),
        style: { ...defaultMappingStyle },
        defaultStyle: defaultMappingStyle,
        minStoredValue,
        maxStoredValue,
        minZoomLevel,
        maxZoomLevel,
        loaderParams: {
          pyramid: fittedPyramid,
          client: _getClient(this[_clients], Enums.SOPClassUIDs.PARAMETRIC_MAP),
          channel: mappingNumber
        },
        hasLoader: false
      }

      const source = new DataTileSource({
        tileGrid,
        projection: this[_projection],
        wrapX: false,
        bandCount: 1,
        interpolate: true
      })
      source.on('tileloaderror', (event) => {
        console.error(`error loading tile of mapping "${mappingUID}"`, event)
      })

      mapping.layer = new TileLayer({
        source,
        extent: this[_pyramid].extent,
        projection: this[_projection],
        visible: false,
        opacity: 1,
        preload: this[_options].preload ? 1 : 0,
        transition: 0,
        style: _getColorPaletteStyleForTileLayer({
          windowCenter,
          windowWidth,
          colormap: mapping.style.paletteColorLookupTable.data
        })
      })
      mapping.layer.on('error', (event) => {
        console.error(`error rendering mapping "${mappingUID}"`, event)
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
  removeParameterMapping (mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        `Cannot remove mapping. Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    this[_map].removeLayer(mapping.layer)
    mapping.layer.dispose()
    this[_map].removeOverlay(mapping.overlay)
    delete this[_mappings][mappingUID]
  }

  /**
   * Remove all parameter mappings.
   */
  removeAllParameterMappings () {
    Object.keys(this[_mappings]).forEach(mappingUID => {
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
  showParameterMapping (mappingUID, styleOptions = {}) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        `Cannot show mapping. Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    console.info(`show mapping ${mappingUID}`)

    const container = this[_map].getTargetElement()
    if (container && !mapping.hasLoader) {
      const loader = _createTileLoadFunction({
        targetElement: container,
        iccProfiles: [],
        ...mapping.loaderParams
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
  hideParameterMapping (mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        `Cannot hide mapping. Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    console.info(`hide mapping ${mappingUID}`)
    mapping.layer.setVisible(false)
    this[_map].removeOverlay(mapping.overlay)
  }

  /**
   * Determine if parameter mapping is visible.
   *
   * @param {string} mappingUID - Unique tracking identifier of a mapping
   * @returns {boolean}
   */
  isParameterMappingVisible (mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        'Cannot determine if mapping is visible. ' +
        `Could not find mapping "${mappingUID}".`
      )
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
  setParameterMappingStyle (mappingUID, styleOptions = {}) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        'Cannot set style of mapping. ' +
        `Could not find mapping "${mappingUID}".`
      )
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
        Math.min(styleOptions.limitValues[1], mapping.maxStoredValue)
      ]
      const [windowCenter, windowWidth] = createWindow(
        mapping.style.limitValues[0],
        mapping.style.limitValues[1]
      )
      styleVariables.windowCenter = windowCenter
      styleVariables.windowWidth = windowWidth
      mapping.layer.updateStyleVariables(styleVariables)
    }

    let title = mapping.mapping.label
    const padding = Math.round((16 - title.length) / 2)
    title = title.padStart(title.length + padding)
    title = title.padEnd(title.length + 2 * padding)
    const overlayElement = mapping.overlay.getElement()
    overlayElement.innerHTML = title
    overlayElement.style = {}
    overlayElement.style.display = 'flex'
    overlayElement.style.flexDirection = 'column'
    overlayElement.style.justifyContent = 'center'
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
    const height = 30
    const width = 15
    context.canvas.height = height
    context.canvas.width = width

    const colors = mapping.style.paletteColorLookupTable.data
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

  /**
   * Get the default style of a parameter mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of mapping
   * @returns {Object} Default style Options
   */
  getParameterMappingDefaultStyle (mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        'Cannot get default style of mapping. ' +
        `Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    return {
      opacity: mapping.defaultStyle.opacity,
      limitValues: mapping.defaultStyle.limitValues,
      paletteColorLookupTable: mapping.defaultStyle.paletteColorLookupTable
    }
  }

  /**
   * Get the style of a parameter mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of mapping
   * @returns {Object} Style Options
   */
  getParameterMappingStyle (mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        'Cannot get style of mapping. ' +
        `Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    return {
      opacity: mapping.style.opacity,
      limitValues: mapping.style.limitValues,
      paletteColorLookupTable: mapping.style.paletteColorLookupTable
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
  getParameterMappingMetadata (mappingUID) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        'Cannot get image metadata of mapping. ' +
        `Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    return mapping.pyramid.metadata
  }

  /**
   * Get all parameter mappings.
   *
   * @return {mapping.ParameterMapping[]}
   */
  getAllParameterMappings () {
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
   */
  constructor (options) {
    // We also accept metadata in raw JSON format for backwards compatibility
    if (options.metadata.SOPClassUID != null) {
      this[_metadata] = options.metadata
    } else {
      this[_metadata] = options.metadata.map(instance => {
        return new VLWholeSlideMicroscopyImage({ metadata: instance })
      })
    }

    const imageFlavor = this[_metadata].ImageType[2]
    if (imageFlavor === 'VOLUME') {
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
        queryParams
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
      extent,
      getPointResolution: (pixelRes, point) => {
        /*
         * DICOM Pixel Spacing has millimeter unit while the projection has
         * meter unit.
         */
        const mmSpacing = getPixelSpacing(this[_metadata])[0]
        const spacing = mmSpacing / resizeFactor / 10 ** 3
        return pixelRes * spacing
      }
    })

    const source = new Static({
      imageExtent: extent,
      projection,
      imageLoadFunction,
      url: '' // will be set by imageLoadFunction()
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
      showFullExtent: true
    })

    // Creates the map with the defined layers and view and renders it.
    this[_map] = new Map({
      layers: [this[_imageLayer]],
      view,
      controls: [],
      keyboardEventTarget: document
    })

    view.fit(projection.getExtent(), { size: this[_map].getSize() })
  }

  /**
   * Clean up.
   *
   * Release allocated memory and clear the viewport.
   */
  cleanup () {}

  /**
   * Render the image in the specified viewport container.
   *
   * @param {Object} options - Rendering options.
   * @param {(string|HTMLElement)} options.container - HTML Element in which the viewer should be injected.
   */
  render ({ container }) {
    if (container == null) {
      console.error('container must be provided for rendering images')
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
  get imageMetadata () {
    return this[_metadata]
  }

  /**
   * Frame of Reference UID.
   *
   * @type string
   */
  get frameOfReferenceUID () {
    return this[_metadata].FrameOfReferenceUID
  }

  /**
   * Resize the viewer to fit the viewport.
   *
   * @returns {void}
   */
  resize () {
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
  constructor (options) {
    if (options.orientation === undefined) {
      options.orientation = 'vertical'
    }
    super(options)
  }
}

export { LabelImageViewer, OverviewImageViewer, VolumeImageViewer }
