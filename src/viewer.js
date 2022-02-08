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
import OverviewMap from 'ol/control/OverviewMap'
import Projection from 'ol/proj/Projection'
import publish from './eventPublisher'
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
import { getCenter } from 'ol/extent'
import { defaults as defaultInteractions } from 'ol/interaction'
import dcmjs from 'dcmjs'
import { quantileSeq } from 'mathjs'

import {
  AnnotationGroup,
  fetchGraphicData,
  fetchGraphicIndex,
  fetchMeasurements
} from './annotation.js'
import {
  ColorMapNames,
  createColorMap,
  _buildColorLookupTable
} from './color.js'
import {
  VLWholeSlideMicroscopyImage,
  groupMonochromeInstances,
  groupColorInstances
} from './metadata.js'
import { Mapping, _groupFramesPerMapping } from './mapping.js'
import { ROI } from './roi.js'
import { Segment } from './segment.js'
import {
  computeRotation,
  generateUID,
  getUnitSuffix,
  doContentItemsMatch,
  getContentItemNameCodedConcept,
  createWindow
} from './utils.js'
import {
  scoord3dCoordinates2geometryCoordinates,
  scoord3d2Geometry,
  getPixelSpacing,
  geometry2Scoord3d,
  getFeatureScoord3dLength,
  getFeatureScoord3dArea
} from './scoord3dUtils'
import { OpticalPath } from './opticalPath.js'
import {
  _areImagePyramidsEqual,
  _computeImagePyramid,
  _createTileLoadFunction,
  _fitImagePyramid
} from './pyramid.js'

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
    μm2: 'square micrometer',
    mm: 'millimeter',
    mm2: 'square millimeter',
    m: 'meters',
    m2: 'square meters',
    km2: 'square kilometers'
  }

  let measurement
  const view = map.getView()
  const unitSuffix = getUnitSuffix(view)

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
    const unitCodedConceptValue = unitSuffix
    const unitCodedConceptMeaning = unitSuffixToMeaningMap[unitSuffix]
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
const _rotation = Symbol('rotation')
const _projection = Symbol('projection')
const _tileGrid = Symbol('tileGrid')
const _annotationManager = Symbol('annotationManager')
const _annotationGroups = Symbol('annotationGroups')
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
   * @param {object} options.styleOptions - Default style options for annotations.
   * @param {string[]} [options.controls=[]] - Names of viewer control elements that should be included in the viewport
   * @param {boolean} [options.debug=false] - Whether debug features should be turned on (e.g., display of tile boundaries)
   * @param {number} [options.tilesCacheSize=512] - initial cache size for a TileImage
   */
  constructor (options) {
    this[_options] = options

    if (this[_options].debug == null) {
      this[_options].debug = false
    }

    if (this[_options].tilesCacheSize == null) {
      this[_options].tilesCacheSize = 1000
    }

    if (this[_options].overview == null) {
      this[_options].overview = {}
    }

    if (this[_options].controls == null) {
      this[_options].controls = []
    }
    this[_options].controls = new Set(this[_options].controls)

    // Collection of Openlayers "TileLayer" instances
    this[_segments] = {}
    this[_mappings] = {}
    this[_annotationGroups] = {}

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
        metadata: colorGroups[0],
        opticalPath: this[_options].metadata[0].OpticalPathSequence[0]
      }
    }

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
              if (monochromeImageInformation[opticalPathIdentifier]) {
                monochromeImageInformation[opticalPathIdentifier].metadata.push(
                  image
                )
              } else {
                monochromeImageInformation[opticalPathIdentifier] = {
                  metadata: [image],
                  opticalPath
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

    const layers = []
    const overviewLayers = []
    this[_opticalPaths] = {}
    if (numChannels > 0) {
      let channelCount = 0
      const helper = new WebGLHelper()
      const overviewHelper = new WebGLHelper()
      for (const opticalPathIdentifier in monochromeImageInformation) {
        const info = monochromeImageInformation[opticalPathIdentifier]
        const pyramid = _computeImagePyramid({ metadata: info.metadata })
        const minValue = 0
        const maxValue = Math.pow(2, info.metadata[0].BitsAllocated) - 1
        const bitsAllocated = info.metadata[0].BitsAllocated
        const opticalPath = {
          opticalPathIdentifier,
          opticalPath: new OpticalPath({
            identifier: opticalPathIdentifier,
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
            })
          }),
          pyramid: pyramid,
          style: {
            color: [255, 255, 255],
            opacity: 1,
            limitValues: [minValue, maxValue]
          },
          bitsAllocated: bitsAllocated,
          minValue: minValue,
          maxValue: maxValue
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
          loader: _createTileLoadFunction({
            pyramid: opticalPath.pyramid,
            client: this[_options].client,
            channel: opticalPathIdentifier
          }),
          tileGrid: this[_tileGrid],
          projection: this[_projection],
          wrapX: false,
          transition: 0,
          bandCount: 1
        })

        const [windowCenter, windowWidth] = createWindow(
          opticalPath.style.limitValues[0],
          opticalPath.style.limitValues[1]
        )

        // TODO: use palette color lookup table if available
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
            0,
            [0, 0, 0, 1],
            1,
            ['color', ['var', 'red'], ['var', 'green'], ['var', 'blue'], 1]
          ],
          variables: {
            red: opticalPath.style.color[0],
            green: opticalPath.style.color[1],
            blue: opticalPath.style.color[2],
            windowCenter: windowCenter,
            windowWidth: windowWidth
          }
        }

        opticalPath.layer = new TileLayer({
          source,
          extent: pyramid.extent,
          preload: 1,
          style: style,
          visible: false,
          useInterimTilesOnError: false,
          cacheSize: this[_options].tilesCacheSize
        })
        opticalPath.layer.helper = helper
        opticalPath.layer.on('precompose', (event) => {
          const gl = event.context
          gl.blendEquation(gl.FUNC_ADD)
          gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR)
        })

        opticalPath.overviewTileLayer = new TileLayer({
          source,
          extent: pyramid.extent,
          preload: 0,
          style: style,
          visible: false,
          useInterimTilesOnError: false
        })
        opticalPath.overviewTileLayer.helper = overviewHelper
        opticalPath.overviewTileLayer.on('precompose', (event) => {
          const gl = event.context
          gl.blendEquation(gl.FUNC_ADD)
          gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR)
        })

        if (channelCount === 0) {
          layers.push(opticalPath.layer)
          opticalPath.layer.setVisible(true)
          overviewLayers.push(opticalPath.overviewTileLayer)
          opticalPath.overviewTileLayer.setVisible(true)
        }

        this[_opticalPaths][opticalPathIdentifier] = opticalPath
        channelCount += 1
      }
    } else {
      const opticalPathIdentifier = colorOpticalPathIdentifiers[0]
      const info = colorImageInformation[opticalPathIdentifier]
      const pyramid = _computeImagePyramid({ metadata: info.metadata })
      const opticalPath = {
        opticalPathIdentifier,
        opticalPath: new OpticalPath({
          identifier: opticalPathIdentifier,
          illuminationType: info.opticalPath.IlluminationTypeCodeSequence[0],
          studyInstanceUID: info.metadata[0].StudyInstanceUID,
          seriesInstanceUID: info.metadata[0].SeriesInstanceUID,
          sopInstanceUIDs: pyramid.metadata.map(element => {
            return element.SOPInstanceUID
          })
        }),
        style: {
          opacity: 1
        },
        pyramid: pyramid,
        bitsAllocated: 8,
        minValue: 0,
        maxValue: 255
      }

      const source = new DataTileSource({
        loader: _createTileLoadFunction({
          pyramid: opticalPath.pyramid,
          client: this[_options].client,
          channel: opticalPathIdentifier
        }),
        tileGrid: this[_tileGrid],
        projection: this[_projection],
        wrapX: false,
        transition: 0,
        preload: 1,
        bandCount: 3
      })

      opticalPath.layer = new TileLayer({
        source,
        extent: this[_tileGrid].extent,
        preload: 1,
        useInterimTilesOnError: false,
        cacheSize: this[_options].tilesCacheSize
      })

      opticalPath.overviewTileLayer = new TileLayer({
        source,
        extent: pyramid.extent,
        preload: 0,
        useInterimTilesOnError: false
      })

      layers.push(opticalPath.layer)
      overviewLayers.push(opticalPath.overviewTileLayer)

      this[_opticalPaths][opticalPathIdentifier] = opticalPath
    }

    if (this[_options].debug) {
      const tileDebugSource = new TileDebug({
        projection: this[_projection],
        extent: this[_pyramid].extent,
        tileGrid: this[_tileGrid],
        wrapX: false,
        template: '{z}-{x}-{y}'
      })
      const tileDebugLayer = new TileLayer({
        source: tileDebugSource,
        extent: this[_pyramid].extent,
        projection: this[_projection]
      })
      layers.push(tileDebugLayer)
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
   * linear interpolation.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @param {object} styleOptions
   * @param {number[]} styleOptions.color - RGB color triplet
   * @param {number} styleOptions.opacity - Opacity
   * @param {number[]} styleOptions.limitValues - Upper and lower windowing limits
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
      opticalPath.layer.setOpacity(styleOptions.opacity)
    }

    const styleVariables = {}
    if (styleOptions.color != null) {
      opticalPath.style.color = styleOptions.color
      styleVariables.red = opticalPath.style.color[0]
      styleVariables.green = opticalPath.style.color[1]
      styleVariables.blue = opticalPath.style.color[2]
    }
    if (styleOptions.limitValues != null) {
      opticalPath.style.limitValues = styleOptions.limitValues
      const [windowCenter, windowWidth] = createWindow(
        styleOptions.limitValues[0],
        styleOptions.limitValues[1]
      )
      styleVariables.windowCenter = windowCenter
      styleVariables.windowWidth = windowWidth
    }
    opticalPath.layer.updateStyleVariables(styleVariables)
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
        'Cannot get style of optical path. ' +
        `Could not find optical path "${opticalPathIdentifier}".`
      )
    }
    if (opticalPath.style == null) {
      return {
        opacity: opticalPath.style.opacity
      }
    }
    return {
      color: opticalPath.style.color,
      opacity: opticalPath.style.opacity,
      limitValues: opticalPath.style.limitValues
    }
  }

  /** Get image metadata for an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @returns {VLWholeSlideMicroscopyImage[]} Slide microscopy image metadata
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
      opticalPath.layer
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
    opticalPath.layer.dispose()
    this[_map].removeLayer(opticalPath.layer)
    opticalPath.overviewTileLayer.dispose()
    this[_overviewMap].getOverviewMap().removeLayer(opticalPath.overviewTileLayer)
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
      return layer === opticalPath.layer
    })
  }

  /** Show an optical path.
   *
   * @param {string} opticalPathIdentifier - Optical Path Identifier
   * @param {object} styleOptions
   * @param {number[]} styleOptions.color - RGB color triplet
   * @param {number} styleOptions.opacity - Opacity
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
    console.info(`show optical path ${opticalPathIdentifier}`)
    if (!this.isOpticalPathActive(opticalPathIdentifier)) {
      this.activateOpticalPath(opticalPathIdentifier)
    }
    opticalPath.layer.setVisible(true)
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
    console.info(`hide optical path ${opticalPathIdentifier}`)
    opticalPath.layer.setVisible(false)
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
    return opticalPath.layer.getVisible()
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
    if (options.container == null) {
      console.error('container must be provided for rendering images')
      return
    }

    this[_map].setTarget(options.container)

    const view = this[_map].getView()
    const projection = view.getProjection()
    const containerElement = this[_map].getTargetElement()

    view.fit(projection.getExtent(), { size: this[_map].getSize() })

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
  }

  /** Activate the draw interaction for graphic annotation of regions of interest.
   *
   * @param {object} options - Drawing options
   * @param {string} options.geometryType - Name of the geometry type (point, circle, box, polygon, freehandpolygon, line, freehandline)
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
   * Get an individual annotated region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @returns {ROI} Region of interest.
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
   * Add annotation groups.
   *
   * @param {MicroscopySimpleBulkAnnotations} metadata - Metadata of a DICOM Microscopy Simple Bulk Annotations instance
   * @param {Object} bulkdata - Bulkdata of a DICOM Microscopy Simple Bulk Annotations instance
   */
  addAnnotationGroups (metadata, bulkdata = {}) {
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
        style: {
          opacity: 1.0,
          color: '#027ea3'
        },
        metadata: metadata,
        bulkdata: bulkdata
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

      // TODO: how to use "loader" with bbox or tile "strategy"?
      const source = new VectorSource({
        wrapX: false,
        rotateWithView: true,
        overlaps: false
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
        disableHitDetection: true
      })
      annotationGroup.layer.setVisible(false)

      this[_map].addLayer(annotationGroup.layer)
      this[_annotationGroups][annotationGroupUID] = annotationGroup
    })
  }

  /**
   * Remove an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation group
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
   * Show an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation group
   * @param {object} styleOptions
   * @param {number} styleOptions.measurement - Selected measurement for colorizing annotations
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
    const client = this[_options].client

    const index = annotationGroup.annotationGroup.number - 1
    const metadataItem = annotationGroup.metadata.AnnotationGroupSequence[index]
    const bulkdataItem = annotationGroup.bulkdata.AnnotationGroupSequence[index]
    const numberOfAnnotations = Number(metadataItem.NumberOfAnnotations)
    const graphicType = metadataItem.GraphicType
    const coordinateType = metadataItem.AnnotationCoordinateType
    let commonZCoordinate
    let n
    if (metadataItem.CommonZCoordinateValue == null) {
      commonZCoordinate = Number.NaN
      if (coordinateType === '2D') {
        n = 2
      } else {
        n = 3
      }
    } else {
      commonZCoordinate = Number(metadataItem.CommonZCoordinateValue)
      n = 2
    }

    const source = annotationGroup.layer.getSource()
    const features = source.getFeatures()

    // Data has already been retrieved and cached
    if (features.length > 0) {
      this.setAnnotationGroupStyle(annotationGroupUID, styleOptions)
      annotationGroup.layer.setVisible(true)
      return
    }

    const getCoordinates = (graphicData, offset, commonZCoordinate) => {
      const point = [
        graphicData[offset],
        graphicData[offset + 1]
      ]
      if (isNaN(commonZCoordinate)) {
        point.push(graphicData[offset + 2])
      } else {
        point.push(commonZCoordinate)
      }
      return point
    }

    const getPointRepresentation = (
      graphicType, graphicData, commonZCoordinate, i, numberOfAnnotations
    ) => {
      let point
      if (graphicType === 'POINT') {
        const length = n
        const offset = i * length
        point = getCoordinates(graphicData, offset, commonZCoordinate)
      } else {
        // Compute centroid
        if (graphicType === 'RECTANGLE' || graphicType === 'ELLIPSE') {
          const length = n * 4
          const offset = i * length
          const coordinates = []
          for (let j = offset; j < offset + length; j++) {
            const p = getCoordinates(graphicData, j, commonZCoordinate)
            coordinates.push(p)
            j += n - 1
          }
          if (graphicType === 'ELLIPSE') {
            const majorAxisFirstEndpoint = coordinates[0]
            const majorAxisSecondEndpoint = coordinates[1]
            point = [
              (majorAxisSecondEndpoint[0] - majorAxisFirstEndpoint[0]) / 2,
              (majorAxisSecondEndpoint[1] - majorAxisFirstEndpoint[1]) / 2,
              0
            ]
          } else if (graphicType === 'RECTANGLE') {
            const topLeft = coordinates[0]
            const topRight = coordinates[1]
            const bottomLeft = coordinates[3]
            point = [
              topLeft[0] + (topRight[0] - topLeft[0]) / 2,
              topLeft[1] + (topLeft[1] - bottomLeft[1]) / 2,
              0
            ]
          }
        } else {
          const offset = graphicIndex[i] - 1
          let length
          if (i < (numberOfAnnotations - 1)) {
            length = offset - graphicIndex[i + 1]
          } else {
            length = graphicData.length
          }
          // https://en.wikipedia.org/wiki/Centroid#Of_a_polygon
          point = [0, 0, 0]
          let area = 0
          for (let j = offset; j < offset + length; j++) {
            const p0 = getCoordinates(graphicData, j, commonZCoordinate)
            let p1
            if (j === (offset + length - n)) {
              p1 = getCoordinates(graphicData, offset, commonZCoordinate)
            } else {
              p1 = getCoordinates(graphicData, j + n, commonZCoordinate)
            }
            const a = p0[0] * p1[1] - p1[0] * p0[1]
            area += a
            point[0] += (p0[0] + p1[0]) * a
            point[1] += (p0[1] + p1[1]) * a
            j += n - 1
          }
          area *= 0.5
          point[0] /= 6 * area
          point[1] /= 6 * area
        }
      }
      return point
    }

    console.log(
      `retrieve bulkdata for annotation group "${annotationGroupUID}"`
    )
    const container = this[_map].getTargetElement()
    publish(container, EVENT.LOADING_STARTED)
    const promises = [
      fetchGraphicData({ metadataItem, bulkdataItem, client }),
      fetchGraphicIndex({ metadataItem, bulkdataItem, client }),
      fetchMeasurements({ metadataItem, bulkdataItem, client })
    ]
    Promise.all(promises).then(retrievedBulkdata => {
      const graphicData = retrievedBulkdata[0]
      const graphicIndex = retrievedBulkdata[1]
      const measurements = retrievedBulkdata[2]

      for (let i = 0; i < numberOfAnnotations; i++) {
        const point = getPointRepresentation(
          graphicType, graphicData, commonZCoordinate, i, numberOfAnnotations
        )
        const feature = new Feature({
          geometry: new PointGeometry(
            scoord3dCoordinates2geometryCoordinates(
              point,
              this[_pyramid].metadata
            )
          )
        })
        const properties = {}
        measurements.forEach(item => {
          const name = item.name
          const key = `${name.CodingSchemeDesignator}${name.CodeValue}`
          const value = item.values[i]
          properties[key] = value
        })
        feature.setProperties(properties)
        feature.setId(i + 1)
        features.push(feature)
      }

      console.log(
        `add n=${features.length} annotations ` +
        `for annotation group "${annotationGroupUID}"`
      )
      source.addFeatures(features)
      const properties = {}
      measurements.forEach(item => {
        const name = item.name
        const key = `${name.CodingSchemeDesignator}${name.CodeValue}`
        const value = quantileSeq(
          [...item.values],
          [0, 0.015, 0.25, 0.5, 0.75, 0.95, 1]
        )
        properties[key] = value
      })
      source.setProperties(properties)

      publish(container, EVENT.LOADING_ENDED)
      this.setAnnotationGroupStyle(annotationGroupUID, styleOptions)
    }).catch(error => {
      console.error(error)
    })

    annotationGroup.layer.setVisible(true)
  }

  /**
   * Hide an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation group
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
   * @param {string} annotationGroupUID - Unique identifier of an annotation group
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
   * @param {string} annotationGroupUID - Unique identifier of an annotation group
   * @param {object} styleOptions - Style options
   * @param {number} styleOptions.opacity - Opacity
   * @param {number} styleOptions.measurement - Selected measurement for colorizing annotations
   */
  setAnnotationGroupStyle (annotationGroupUID, styleOptions) {
    if (!(annotationGroupUID in this[_annotationGroups])) {
      throw new Error(
        'Cannot set style of annotation group. ' +
        `Could not find annotation group "${annotationGroupUID}".`
      )
    }
    const annotationGroup = this[_annotationGroups][annotationGroupUID]
    if (styleOptions.opacity != null) {
      annotationGroup.style.opacity = styleOptions.opacity
      annotationGroup.layer.setOpacity(styleOptions.opacity)
    }

    const source = annotationGroup.layer.getSource()
    const name = styleOptions.measurement
    if (name) {
      const key = `${name.CodingSchemeDesignator}${name.CodeValue}`
      const properties = source.getProperties()
      if (properties[key]) {
        const colormap = createColorMap({
          name: ColorMapNames.VIRIDIS,
          bins: 50
        })
        const colorLUT = _buildColorLookupTable({
          colormap: colormap,
          min: properties[key][0],
          max: properties[key][properties[key].length - 2]
        })
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
            color: [
              'interpolate',
              ['linear'],
              ['get', key],
              ...colorLUT
            ],
            opacity: annotationGroup.style.opacity
          }
        }
        const newLayer = new PointsLayer({
          source,
          style,
          disableHitDetection: true
        })
        this[_map].addLayer(newLayer)
        this[_map].removeLayer(annotationGroup.layer)
        annotationGroup.layer.dispose()
        annotationGroup.layer = newLayer
      }
    } else {
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
      const newLayer = new PointsLayer({
        source,
        style,
        disableHitDetection: true
      })
      this[_map].addLayer(newLayer)
      this[_map].removeLayer(annotationGroup.layer)
      annotationGroup.layer.dispose()
      annotationGroup.layer = newLayer
    }
  }

  /**
   * Get style of an annotation group.
   *
   * @param {string} annotationGroupUID - Unique identifier of an annotation group
   *
   * @returns {object} - Style settings
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
   * @returns {AnnotationGroup[]} - Annotation groups
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
   * @returns {MicroscopyBulkSimpleAnnotations[]} - Metadata of DICOM Microscopy Bulk Simple Annotations instances
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

    refSegmentation.SegmentSequence.forEach((item, index) => {
      const segmentNumber = Number(item.SegmentNumber)
      console.info(`add segment # ${segmentNumber}`)
      let segmentUID = generateUID()
      if (item.UniqueTrackingIdentifier) {
        segmentUID = item.UniqueTrackingIdentifier
      }

      const colormap = createColorMap({
        name: ColorMapNames.VIRIDIS,
        bins: 50
      })

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
        fittedPyramid: fittedPyramid,
        style: {
          opacity: 0.75
        },
        overlay: new Overlay({
          element: document.createElement('div'),
          offset: [5 + 5 * index + 2, 5]
        }),
        colormap,
        minValue: 0,
        maxValue: 255
      }

      const source = new DataTileSource({
        loader: _createTileLoadFunction({
          pyramid: fittedPyramid,
          client: this[_options].client,
          channel: segmentNumber
        }),
        tileGrid: tileGrid,
        projection: this[_projection],
        wrapX: false,
        bandCount: 1,
        interpolate: true
      })
      source.on('tileloaderror', (event) => {
        console.error('error loading segment tile', event)
      })

      const colorLUT = _buildColorLookupTable({
        colormap: colormap,
        min: 0,
        max: 1
      })
      segment.layer = new TileLayer({
        source,
        extent: this[_pyramid].extent,
        projection: this[_projection],
        visible: false,
        opacity: 0.9,
        preload: 0,
        transition: 0,
        style: {
          color: [
            'interpolate',
            ['linear'],
            ['band', 1],
            ...colorLUT
          ]
        },
        useInterimTilesOnError: false,
        cacheSize: this[_options].tilesCacheSize
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
    console.info(`show segment ${segmentUID}`)
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

  /** Set the style of a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   * @param {object} styleOptions - Style options
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
   * @returns {object} Style settings
   */
  getSegmentStyle (segmentUID, styleOptions) {
    if (!(segmentUID in this[_segments])) {
      throw new Error(
        'Cannot get style of segment. ' +
        `Could not find segment "${segmentUID}".`
      )
    }
    const segment = this[_segments][segmentUID]

    return { opacity: segment.style.opacity }
  }

  /** Get image metadata for a segment.
   *
   * @param {string} segmentUID - Unique tracking identifier of segment
   * @returns {Segmentation[]} Segmentation image metadata
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
    const fittedPyramid = _fitImagePyramid(pyramid, this[_pyramid])

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
      const mappingLabel = `${mappingNumber}`
      const mappingUID = generateUID()
      const mappingDescriptions = mappingNumberToDescriptions[mappingNumber]

      const range = [NaN, NaN]
      mappingDescriptions.forEach((item, i) => {
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

      if (isNaN(range[0]) || isNaN(range[1])) {
        throw new Error('Could not determine range of real world values.')
      }

      // TODO: build color map based on Real World Value Mapping
      let colormap
      if (range[0] < 0 && range[1] > 0) {
        colormap = createColorMap({
          name: ColorMapNames.BLUE_RED,
          bins: 50
        })
      } else {
        colormap = createColorMap({
          name: ColorMapNames.HOT,
          bins: 50
        })
      }

      const isFloatPixelData = refInstance.BitsAllocated > 16
      let minValue = 0
      let maxValue = Math.pow(2, refInstance.BitsAllocated) - 1
      if (isFloatPixelData) {
        minValue = -Math.pow(2, refInstance.BitsAllocated) / 2 + 1
        maxValue = Math.pow(2, refInstance.BitsAllocated) / 2 - 1
      }

      const mapping = {
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
        pyramid: pyramid,
        fittedPyramid: fittedPyramid,
        overlay: new Overlay({
          element: document.createElement('div'),
          offset: [5 + 100 * index + 2, 5]
        }),
        style: {
          opacity: 1.0,
          limitValues: [
            windowCenter - windowWidth / 2,
            windowCenter + windowWidth / 2
          ]
        },
        colormap: colormap,
        minValue: minValue,
        maxValue: maxValue
      }

      const source = new DataTileSource({
        loader: _createTileLoadFunction({
          pyramid: fittedPyramid,
          client: this[_options].client,
          channel: mappingNumber
        }),
        tileGrid: tileGrid,
        projection: this[_projection],
        wrapX: false,
        bandCount: 1,
        interpolate: true
      })

      // TODO: use the Palette Color LUT of image if available
      const colorLUT = _buildColorLookupTable({
        colormap: colormap,
        min: 0,
        max: 1
      })
      mapping.layer = new TileLayer({
        source,
        extent: this[_pyramid].extent,
        projection: this[_projection],
        visible: false,
        opacity: 1,
        preload: 1,
        transition: 0,
        style: {
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
            ...colorLUT
          ],
          variables: {
            windowCenter: windowCenter,
            windowWidth: windowWidth
          }
        }
      })
      this[_map].addLayer(mapping.layer)

      this[_mappings][mappingUID] = mapping

      index += 1
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
    this[_map].removeLayer(mapping.layer)
    mapping.layer.dispose()
    this[_map].removeOverlay(mapping.overlay)
    delete this[_mappings][mappingUID]
  }

  /**
   * Show a mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of a mapping
   * @param {object} styleOptions
   * @param {number} styleOptions.opacity - Opacity
   * @param {number} styleOptions.limitValues - Opacity
   */
  showMapping (mappingUID, styleOptions = {}) {
    if (!(mappingUID in this[_mappings])) {
      throw new Error(
        `Cannot show mapping. Could not find mapping "${mappingUID}".`
      )
    }
    const mapping = this[_mappings][mappingUID]
    console.info(`show mapping ${mappingUID}`)
    mapping.layer.setVisible(true)
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
    console.info(`hide mapping ${mappingUID}`)
    mapping.layer.setVisible(false)
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
    return mapping.layer.getVisible()
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
      mapping.style.opacity = styleOptions.opacity
      mapping.layer.setOpacity(styleOptions.opacity)
    }

    const styleVariables = {}
    if (styleOptions.limitValues != null) {
      mapping.style.limitValues = styleOptions.limitValues
      const [windowCenter, windowWidth] = createWindow(
        styleOptions.limitValues[0],
        styleOptions.limitValues[1]
      )
      styleVariables.windowCenter = windowCenter
      styleVariables.windowWidth = windowWidth
    }
    mapping.layer.updateStyleVariables(styleVariables)

    let title = mapping.mapping.label
    // FIXME
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

    return {
      opacity: mapping.style.opacity,
      limitValues: mapping.style.limitValues
    }
  }

  /** Get image metadata for a mapping.
   *
   * @param {string} mappingUID - Unique tracking identifier of mapping
   * @returns {ParametricMap[]} Parametric Map image metadata
   */
  getMappingMetadata (mappingUID) {
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

    const source = new Static({
      imageExtent: extent,
      projection: projection,
      imageLoadFunction: imageLoadFunction,
      url: '' // will be set by imageLoadFunction()
    })

    this[_imageLayer] = new ImageLayer({ source: source })

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
      extent: extent,
      smoothExtentConstraint: true,
      showFullExtent: true
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
    if (options.container == null) {
      console.error('container must be provided for rendering images')
      return
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
