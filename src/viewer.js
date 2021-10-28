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
import TileLayer from 'ol/layer/Tile'
import TileImage from 'ol/source/TileImage'
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
  VLWholeSlideMicroscopyImage,
  groupMonochromeInstances,
  groupColorInstances,
} from './metadata.js'
import { ROI } from './roi.js'
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
import {
  _Channel,
  BlendingInformation
} from './channel.js'

import { RenderingEngine } from './renderingEngine.js'
import Enums from './enums'
import _AnnotationManager from './annotations/_AnnotationManager'

function _getInteractionBindingCondition (bindings, condition = () => true) {
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
    return _mouseButtonCondition(event) && _modifierKeyCondition(event) && condition(event)
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
function _addROIPropertiesToFeature(feature, properties, optSilent) {
  const {
    Label,
    Measurements,
    Evaluations,
    Marker,
    PresentationState,
  } = Enums.InternalProperties;

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

  if (properties[PresentationState]) {
    feature.set(PresentationState, properties[PresentationState], optSilent);
  }
}

/**
 * Wire measurements and qualitative events to generate content items
 * based on feature properties and geometry changes
 *
 * @param {object} feature - The feature instance
 * @param {object} viewerProperties - The viewer properties
 * @param {object} viewerProperties.map - The map
 * @param {object} viewerProperties.drawingSource - The drawing source
 * @param {object} viewerProperties.pyramid - The pyramid metadata
 * @returns {void}
 */
function _wireMeasurementsAndQualitativeEvaluationsEvents (
  feature,
  viewerProperties
) {
  /**
   * Update feature measurement properties first and then measurements
   */
  _updateFeatureMeasurements(feature, viewerProperties)
  feature.getGeometry().on(Enums.FeatureGeometryEvents.CHANGE, () => {
    _updateFeatureMeasurements(feature, viewerProperties)
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
  const {
    [Enums.InternalProperties.Evaluations]: featureEvaluations,
    [Enums.InternalProperties.Label]: featureLabel,
  } = feature.getProperties();

  const evaluations = featureEvaluations || [];
  const label = featureLabel;

  if (!label) return;

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
  console.debug(`Evaluations of feature (${feature.getId()}):`, evaluations)
}

/**
 * Generate feature measurements from its measurement properties
 *
 * @param {object} feature - The feature instance
 * @param {object} viewerProperties - The viewer properties
 * @param {object} viewerProperties.map - The map
 * @param {object} viewerProperties.drawingSource - The drawing source
 * @param {object} viewerProperties.pyramid - The pyramid metadata
 * @returns {void}
 */
function _updateFeatureMeasurements (feature, viewerProperties) {
  const { map, pyramid, annotationManager } = viewerProperties;
  const featureMarkup = feature.get(Enums.InternalProperties.Markup);

  if (Enums.Markup.Measurement !== featureMarkup) {
    return;
  }

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

  const view = map.getView()
  const unitSuffix = getUnitSuffix(view)
  const unitCodedConceptValue = unitSuffix
  const unitCodedConceptMeaning = unitSuffixToMeaningMap[unitSuffix]

  const measurements = annotationManager.getMeasurements(feature);
  if (measurements && measurements.length > 0) {
    measurements.forEach(measurement => {
      addOrUpdateMeasurement(feature, measurement);
    });
    return;
  }

  if (area != null) {
    const measurement = new dcmjs.sr.valueTypes.NumContentItem({
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
    addOrUpdateMeasurement(feature, measurement);
    return;
  }

  if (length != null) {
    const measurement = new dcmjs.sr.valueTypes.NumContentItem({
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
    addOrUpdateMeasurement(feature, measurement);
    return;
  }
}

const addOrUpdateMeasurement = (feature, measurement) => {
  if (measurement) {
    const featureMeasurements = feature.get(Enums.InternalProperties.Measurements);
    const measurements = featureMeasurements || []

    const index = measurements.findIndex((m) => (
      doContentItemsMatch(m, measurement)
    ))

    if (index > -1) {
      measurements[index] = measurement
    } else {
      measurements.push(measurement)
    }

    feature.set(Enums.InternalProperties.Measurements, measurements)
    console.debug(`Measurements of feature (${feature.getId()}):`, measurements)
  }
};

const _options = Symbol('options')
const _controls = Symbol('controls')
const _drawingLayer = Symbol('drawingLayer')
const _drawingSource = Symbol('drawingSource')
const _features = Symbol('features')
const _imageLayer = Symbol('imageLayer')
const _interactions = Symbol('interactions')
const _map = Symbol('map')
const _metadata = Symbol('metadata')
const _pyramidMetadata = Symbol('pyramidMetadata')
const _segmentations = Symbol('segmentations')
const _channels = Symbol('channels')
const _colorImage = Symbol('colorImage')
const _renderingEngine = Symbol('renderingEngine')
const _rotation = Symbol('rotation')
const _projection = Symbol('projection')
const _tileGrid = Symbol('tileGrid')
const _referenceExtents = Symbol('referenceExtents')
const _referenceOrigins = Symbol('referenceOrigins')
const _referenceResolutions = Symbol('referenceResolutions')
const _referenceGridSizes = Symbol('referenceGridSizes')
const _referenceTileSizes = Symbol('referenceTileSizes')
const _referencePixelSpacings = Symbol('referencePixelSpacings')
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
   *        The constructor automatically determines which instances represent monochromatic channels (optical paths).
   * @param {object[]} options.blendingInformation - An array containing blending information for the channels with the
   *        standard visualization parameters already setup by an external application.
   * @param {object} options.styleOptions - Default style options for annotations.
   * @param {string[]} [options.controls=[]] - Names of viewer control elements that should be included in the viewport
   * @param {boolean} [options.retrieveRendered=true] - Whether image frames should be retrieved via DICOMweb prerendered by the server.
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile should be included for correction of image colors
   * @param {boolean} [options.useWebGL=true] - Whether WebGL renderer should be used
   * @param {number} [options.tilesCacheSize=1000] - initial cache size for a TileImage
   */
  constructor (options) {
    this[_options] = options
    if (!('useWebGL' in this[_options])) {
      this[_options].useWebGL = true
    }

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

    // Collection of Openlayers "VectorLayer" instances indexable by
    // DICOM Series Instance UID
    this[_segmentations] = {}

    // Collection of Openlayers "Feature" instances
    this[_features] = new Collection([], { unique: true })

    // Add unique identifier to each created "Feature" instance
    this[_features].on('add', (e) => {
      // The ID may have already been set when drawn. However, features could
      // have also been added without a draw event.
      if (e.element.getId() === undefined) {
        e.element.setId(generateUID())
      }
    })

    this[_features].on('remove', (e) => {
      this[_annotationManager].onRemove(e.element)
    })

    // Order all the instances metadata array in channel objects
    this[_channels] = []
    const colors = [
      [0, 0.5, 0.5],
      [0.5, 0.5, 0],
      [1, 0, 0],
      [0.5, 0, 0.5],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1]
    ]

    if (this[_options].metadata.length === 0) {
      throw new Error('Input metadata has no instances.')
    }

    // Group channels by OpticalPathIdentifier
    const groups = groupMonochromeInstances(this[_options].metadata)
    // Perform additional checks and create channel objects
    for (let i = 0; i < groups.length; ++i) {
      for (let j = 0; j < groups[i].length; ++j) {
        const channelImage = groups[i][j]
        if (
          channelImage.DimensionOrganizationType === '3D' ||
          channelImage.DimensionOrganizationType === '3D_TEMPORAL'
        ) {
          throw new Error(
            'Volume Image Viewer does hot hanlde 3D channel data yet.'
          )
        } else if (channelImage.DimensionOrganizationType === 'TILED_FULL') {
          if (channelImage.TotalPixelMatrixFocalPlanes !== 1) {
            continue
          } else {
            const opticalPathIdentifier = channelImage.OpticalPathSequence[0].OpticalPathIdentifier;
            const channel = this[_channels].find(channel => {
              const currentOpticalPathIdentifier = (
                channel
                  .blendingInformation
                  .opticalPathIdentifier
              )
              return currentOpticalPathIdentifier === opticalPathIdentifier
            })
            if (channel) {
              channel.addMetadata(channelImage)
            } else {
              const blendingInformation = (
                this[_options].blendingInformation !== undefined
                  ? this[_options].blendingInformation.find(info => (
                      info.opticalPathIdentifier === opticalPathIdentifier
                    ))
                  : undefined
              )
              if (blendingInformation !== undefined) {
                const newChannel = new _Channel(blendingInformation)
                newChannel.addMetadata(channelImage)
                this[_channels].push(newChannel)
              } else {
                const defaultBlendingInformation = new BlendingInformation({
                  opticalPathIdentifier: `${opticalPathIdentifier}`,
                  color: [...colors[i % colors.length]],
                  opacity: 1.0,
                  thresholdValues: [0, 255],
                  limitValues: [0, 255],
                  visible: false
                })

                const newChannel = new _Channel(defaultBlendingInformation)
                newChannel.addMetadata(channelImage)
                this[_channels].push(newChannel)
              }
            }
          }
        } else if (channelImage.DimensionOrganizationType === 'TILED_SPARSE') {
          /*
           * The spatial location of each tile is explicitly encoded using
           * information in the Per-Frame Functional Group Sequence, and the
           * recipient shall not make any assumption about the spatial position
           * or optical path or order of the encoded frames.
           */
          throw new Error(
            'Volume Image Viewer does hot handle TILED_SPARSE ' +
            'dimension organization for blending of channels yet.'
          )
        }
      }
    }

    // Group color images by opticalPathIdentifier
    const colorImagesMicroscopyImages = groupColorInstances(
      this[_options].metadata
    )
    if (colorImagesMicroscopyImages.length > 1) {
      console.warn(
        'Volume Image Viewer detected more than one color image. ' +
        'It is possible to load and visualize only one color image at time. ' +
        'Please check the input metadata. ' +
        'Only the first detected color image will be loaded.'
      )
    }

    if (colorImagesMicroscopyImages.length >= 1) {
      const colorImageMicroscopyImages = colorImagesMicroscopyImages[0]
      if (colorImageMicroscopyImages.length === 0) {
        throw new Error(
          'The first detected color image has no metadata available.'
        )
      }

      this[_colorImage] = {
        opticalPathIdentifier: colorImageMicroscopyImages[0].OpticalPathSequence[0].OpticalPathIdentifier,
        metadata: []
      }

      for (let i = 0; i < colorImageMicroscopyImages.length; ++i) {
        const colorImageMicroscopyImage = colorImageMicroscopyImages[i]
        this[_colorImage].metadata.push(colorImageMicroscopyImage)
      }
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
     * 3) If the parameters in (1) are different, it means that we have to
     *    perfom regridding/reprojection over the data (i.e. registration).
     *    This, at the moment, is out of scope.
     */
    if (this[_channels].length === 0 && this[_colorImage] === undefined) {
      throw new Error('No channels or colorImage found.')
    }

    let image = null
    if (this[_channels].length !== 0) {
      image = this[_channels][0]
    } else {
      image = this[_colorImage]
    }

    const geometryArrays = _Channel.deriveImageGeometry(image)

    this[_referenceExtents] = [...geometryArrays[0]]
    this[_referenceOrigins] = [...geometryArrays[1]]
    this[_referenceResolutions] = [...geometryArrays[2]]
    this[_referenceGridSizes] = [...geometryArrays[3]]
    this[_referenceTileSizes] = [...geometryArrays[4]]
    this[_referencePixelSpacings] = [...geometryArrays[5]]

    /*
     * We assume the first channel as the reference one for all the pyramid
     * parameters. All other channels have to have the same parameters.
     */
    this[_pyramidMetadata] = [...image.pyramidMetadata]

    this[_rotation] = _getRotation(image.pyramidBaseMetadata)

    /*
     * Specify projection to prevent default automatic projection
     * with the default Mercator projection.
     */
    this[_projection] = new Projection({
      code: 'DICOM',
      units: 'm',
      global: true,
      extent: this[_referenceExtents],
      getPointResolution: (pixelRes, point) => {
        /* DICOM Pixel Spacing has millimeter unit while the projection has
         * meter unit.
         */
        const spacing = getPixelSpacing(
          this[_pyramidMetadata][this[_pyramidMetadata].length - 1]
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
      extent: this[_referenceExtents],
      origins: this[_referenceOrigins],
      resolutions: this[_referenceResolutions],
      sizes: this[_referenceGridSizes],
      tileSizes: this[_referenceTileSizes]
    })

    const view = new View({
      center: getCenter(this[_referenceExtents]),
      projection: this[_projection],
      resolutions: this[_tileGrid].getResolutions(),
      rotation: this[_rotation],
      smoothResolutionConstraint: true,
      showFullExtent: true,
      extent: this[_referenceExtents]
    })

    // Create a rendering engine object for offscreen rendering
    this[_renderingEngine] = new RenderingEngine()

    // For each channel we build up the OpenLayer objects and
    // checks that the geometric assumptions are satisfied.
    this[_channels].forEach((channel) => {
      // here image is a channel
      channel.initChannel(
        image.blendingInformation.opticalPathIdentifier,
        image.FrameOfReferenceUID,
        image.ContainerIdentifier,
        this[_referenceExtents],
        this[_referenceOrigins],
        this[_referenceResolutions],
        this[_referenceGridSizes],
        this[_referenceTileSizes],
        this[_referencePixelSpacings],
        this[_projection],
        this[_tileGrid],
        this[_options],
        this[_renderingEngine]
      )
    })

    // build up the OpenLayer objects for the colorImage
    this._initColorImage()

    this[_drawingSource] = new VectorSource({
      tileGrid: this[_tileGrid],
      projection: this[_projection],
      features: this[_features],
      wrapX: false
    })

    this[_drawingLayer] = new VectorLayer({
      extent: this[_referenceExtents],
      source: this[_drawingSource],
      projection: this[_projection],
      updateWhileAnimating: true,
      updateWhileInteracting: true
    })

    const layers = []
    let rasterSourceOverview
    if (this[_options].blendingInformation !== undefined && this[_channels].length > 0) {
      const hasAnyChannelBeenSelected = this[_channels].some(channel => {
        return channel.blendingInformation.visible
      })
      if (hasAnyChannelBeenSelected) {
        this[_channels].forEach((channel) => {
          if (channel.blendingInformation.visible === true) {
            layers.push(channel.tileLayer)
          }
        })
      } else {
        this[_channels][0].blendingInformation.visible = true
        this[_channels][0].tileLayer.setVisible(true)
        layers.push(this[_channels][0].tileLayer)
      }
      rasterSourceOverview = this[_channels][0].rasterSource
    } else if (this[_channels].length !== 0) {
      this[_channels][0].blendingInformation.visible = true
      this[_channels][0].tileLayer.setVisible(true)
      layers.push(this[_channels][0].tileLayer)
      rasterSourceOverview = this[_channels][0].rasterSource
    } else if (this[_colorImage] !== undefined) {
      layers.push(this[_colorImage].tileLayer)
      rasterSourceOverview = this[_colorImage].rasterSource
    } else {
      throw new Error('Viewer cannot find a color image or a monochrome channel to visualize.')
    }

    layers.push(this[_drawingLayer])

    const overviewImageLayer = new TileLayer({
      extent: this[_referenceExtents],
      source: rasterSourceOverview,
      projection: this[_projection],
      preload: 0
    })

    const overviewView = new View({
      projection: this[_projection],
      rotation: this[_rotation],
      zoom: 0,
      minZoom: 0,
      maxZoom: 0,
      constrainOnlyCenter: true,
      center: getCenter(this[_referenceExtents])
    })

    this[_overviewMap] = new OverviewMap({
      view: overviewView,
      layers: [overviewImageLayer],
      collapsed: false,
      collapsible: false,
      rotateWithView: true
    })

    // Creates the map with the defined layers and view and renders it.
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
     * We need to define them here to avoid duplications
     * of interactions that could cause bugs in the application
     *
     * Enabling or disabling interactions could cause side effects on OverviewMap
     * since it also uses the same interactions in the map
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
      pyramid: this[_pyramidMetadata],
      drawingSource: this[_drawingSource],
      features: this[_features]
    })

    // This updates the tiles offscreen rendering when zoom is applied to the view.
    view.origAnimate = view.animate
    let currZoom = 0
    view.animate = (animateSpecs) => {
      let newZoom = animateSpecs.zoom
      if (!newZoom) {
        newZoom = view.getZoomForResolution(animateSpecs.resolution)
      }
      if (newZoom) {
        if (Math.abs(newZoom - currZoom) > 1e-6) {
          currZoom = newZoom
          this._updateTilesRenderingAtZoom(newZoom)
        }
      }
      view.origAnimate(animateSpecs)
    }

    // This updates the tiles offscreen rendering when panning the view.
    this[_map].on(Enums.MapEvents.POINTER_MOVE, evt => {
      if (evt.dragging) {
        this._updateTilesRenderingAtPanning()
      }
    })

    let startMoveZoom = 0
    this[_map].on(Enums.MapEvents.MOVE_START, evt => {
      startMoveZoom = Math.round(evt.frameState.viewState.zoom)
    })

    this[_map].on(Enums.MapEvents.MOVE_END, evt => {
      const endMoveZoom = Math.round(evt.frameState.viewState.zoom)
      if (endMoveZoom === startMoveZoom) {
        this._updateTilesRenderingAtPanning()
      }
    })
  }

  /** updates tiles rendering for monochrome channels at zoom interactions
   * @param {number} zoom - applied zoom
   */
  _updateTilesRenderingAtZoom (zoom) {
    if (this[_channels] && this[_channels].length !== 0) {
      // For each channel check if any tiles at the new zoom
      // needs to refresh the offscreen coloring rendering.
      let render = false
      this[_channels].forEach((channel) => {
        const channelRender = channel.updateTilesRendering(false, zoom)
        if (channelRender) {
          render = true
        }
      })
      if (render) {
        this[_map].render()
      }
    }
  }

  /** updates tiles rendering for monochrome channels at panning interactions
   */
  _updateTilesRenderingAtPanning () {
    if (this[_channels] && this[_channels].length !== 0) {
      // For each channel check if any tiles at the new panning
      // needs to refresh the offscreen coloring rendering.
      const tilesCoordRanges = this._transformViewCoordinatesInTilesCoordinates()
      let render = false
      this[_channels].forEach((channel) => {
        const channelRender = channel.updateTilesRendering(
          false,
          tilesCoordRanges[2],
          [tilesCoordRanges[0], tilesCoordRanges[1]]
        )
        if (channelRender) {
          render = true
        }
      })
      if (render) {
        this[_map].render()
      }
    }
  }

  /** init unique Open Layer objects
   */
  _initColorImage () {
    if (this[_colorImage] === undefined) {
      return
    }
    /*
     * Define custom tile URL function to retrieve frames via DICOMweb WADO-RS.
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

      const path = this[_colorImage].pyramidFrameMappings[z][index]
      if (path === undefined) {
        console.warn('tile ' + index + ' not found at level ' + z)
        return (null)
      }
      let url = this[_options].client.wadoURL +
        '/studies/' + this[_colorImage].pyramidMetadata[z].StudyInstanceUID +
        '/series/' + this[_colorImage].pyramidMetadata[z].SeriesInstanceUID +
        '/instances/' + path;
      if ( this[_options].retrieveRendered) {
        url = url + '/rendered'; 
      }
      return url
    }

    /*
     * Define custom tile loader function, which is required because the
     * WADO-RS response message has content type "multipart/related".
     */
    const tileLoadFunction = async (tile, src) => {
      const img = tile.getImage()
      const z = tile.tileCoord[0]
      const columns = this[_colorImage].pyramidMetadata[z].Columns
      const rows = this[_colorImage].pyramidMetadata[z].Rows
      const samplesPerPixel = this[_colorImage].pyramidMetadata[z].SamplesPerPixel // number of colors for pixel
      const bitsAllocated = this[_colorImage].pyramidMetadata[z].BitsAllocated // memory for pixel
      const pixelRepresentation = this[_colorImage].pyramidMetadata[z].PixelRepresentation // 0 unsigned, 1 signed

      if (src !== null && samplesPerPixel === 3) {
        const studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(src)
        const seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(src)
        const sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(src)
        const frameNumbers = DICOMwebClient.utils.getFrameNumbersFromUri(src)

        console.info(`get tile (${tile.tileCoord})`)

        if (this[_options].retrieveRendered) {
          // allowed mediaTypes: http://dicom.nema.org/medical/dicom/current/output/chtml/part18/sect_8.7.4.html
          const pngMediaType = 'image/png'
          const transferSyntaxUID = ''

          const retrieveOptions = {
            studyInstanceUID,
            seriesInstanceUID,
            sopInstanceUID,
            frameNumbers,
            mediaTypes: [
              { mediaType: pngMediaType, transferSyntaxUID }
            ]
          }
          if (this[_options].includeIccProfile) {
            retrieveOptions.queryParams = {
              iccprofile: 'yes'
            }
          }

          this[_options].client.retrieveInstanceFramesRendered(retrieveOptions).then(
            (renderedFrame) => {
              const frameData = {
                frames: renderedFrame
              }

              img.src = this[_renderingEngine].createURLFromRGBImage(frameData)
            }
          )
        } else {
          // allowed mediaTypes: http://dicom.nema.org/medical/dicom/current/output/chtml/part18/sect_8.7.4.html
          // we use in order: jls, jp2, jpx, jpeg. Finally octet-stream if the first retrieve will fail.
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
              { mediaType: jpegMediaType, transferSyntaxUID: jpegTransferSyntaxUID },
              { mediaType: jlsMediaType, transferSyntaxUID: jlsTransferSyntaxUIDlossless },
              { mediaType: jlsMediaType, transferSyntaxUID: jlsTransferSyntaxUID },
              { mediaType: jp2MediaType, transferSyntaxUID: jp2TransferSyntaxUIDlossless },
              { mediaType: jp2MediaType, transferSyntaxUID: jp2TransferSyntaxUID },
              { mediaType: jpxMediaType, transferSyntaxUID: jpxTransferSyntaxUIDlossless },
              { mediaType: jpxMediaType, transferSyntaxUID: jpxTransferSyntaxUID },
            ]
          }
          this[_options].client.retrieveInstanceFrames(retrieveOptions).then(
            (rawFrames) => {
              const frameData = {
                frames: rawFrames[0],
                bitsAllocated,
                pixelRepresentation,
                columns,
                rows
              }

              img.src = this[_renderingEngine].createURLFromRGBImage(frameData)
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
              this[_options].client.retrieveInstanceFrames(retrieveOptions).then(
                (rawFrames) => {
                  const frameData = {
                    frames: rawFrames[0],
                    bitsAllocated,
                    pixelRepresentation,
                    columns,
                    rows
                  }

                  img.src = this[_renderingEngine].createURLFromRGBImage(frameData)
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
    this[_colorImage].rasterSource = new TileImage({
      crossOrigin: 'Anonymous',
      tileGrid: this[_tileGrid],
      projection: this[_projection],
      wrapX: false,
      transition: 0,
      cacheSize: this[_options].tilesCacheSize
    })

    this[_colorImage].rasterSource.setTileUrlFunction(tileUrlFunction)
    this[_colorImage].rasterSource.setTileLoadFunction(tileLoadFunction)

    // Create OpenLayer renderer object
    this[_colorImage].tileLayer = new TileLayer({
      extent: this[_tileGrid].getExtent(),
      source: this[_colorImage].rasterSource,
      projection: this[_projection]
    })
  }

  /** Gets the channel or color image given an id
   * @param {string} opticalPathIdentifier - opticalPath of the channel
   * @return {Object} _Channel
   */
  getOpticalPath (opticalPathIdentifier) {
    if (this[_channels].length === 0 && this[_colorImage] === undefined) {
      throw new Error('No channels or colorImage found.')
    }

    let channel
    if (this[_channels].length !== 0) {
      channel = this[_channels].find(
        channel => channel.blendingInformation.opticalPathIdentifier === opticalPathIdentifier
      )
    }

    let colorImage
    if (this[_colorImage] !== undefined) {
      colorImage = this[_colorImage].opticalPathIdentifier === opticalPathIdentifier
        ? this[_colorImage]
        : undefined
    }

    if (channel) {
      return channel
    } else if (colorImage) {
      return colorImage
    } else {
      throw new Error('No OpticalPath with ID ' + opticalPathIdentifier + ' has been found.')
    }
  }

  /** Gets the channel or color image metadata given an id
   * @param {string} opticalPathIdentifier - opticalPath of the channel
   * @return {metadata[]} array with all the instances metadata of the channel
   */
  getOpticalPathMetadata (opticalPathIdentifier) {
    const image = this.getOpticalPath(opticalPathIdentifier)
    return image.metadata
  }

  /** Sets the channel visualization/presentation parameters given an id
   * @param {object} BlendingInformation
   * @param {string} BlendingInformation.opticalPathIdentifier - channel ID
   * @param {number[]} BlendingInformation.color - channel rgb color
   * @param {number} BlendingInformation.opacity - channel opacity
   * @param {number[]} BlendingInformation.thresholdValues - channel clipping values
   * @param {boolean} BlendingInformation.visible - channel visibility
   */
  setBlendingInformation (blendingInformation) {
    const {
      opticalPathIdentifier
    } = blendingInformation

    const channel = this.getOpticalPath(opticalPathIdentifier)
    const tilesCoordRanges = this._transformViewCoordinatesInTilesCoordinates()

    if (channel.setBlendingInformation(blendingInformation, tilesCoordRanges)) {
      this[_map].render()
    }
  }

  /** Returns if the channel is being rendered
   * @returns {number[]} array with tiles X and Y coordinates ranges and zoom level.
   */
  _transformViewCoordinatesInTilesCoordinates () {
    const viewSize = this[_map].getView().calculateExtent(this[_map].getSize())
    // viewSize: x1, y1, x2, y2
    const zoomLevel = this[_map].getView().getZoom()
    const resolution = this[_map].getView().values_.resolution
    const tilesCoordinates = []
    tilesCoordinates.push(this[_tileGrid].getTileCoordForCoordAndResolution(
      [viewSize[0], viewSize[1]], resolution)
    )
    tilesCoordinates.push(this[_tileGrid].getTileCoordForCoordAndResolution(
      [viewSize[0], viewSize[3]], resolution)
    )
    tilesCoordinates.push(this[_tileGrid].getTileCoordForCoordAndResolution(
      [viewSize[2], viewSize[1]], resolution)
    )
    tilesCoordinates.push(this[_tileGrid].getTileCoordForCoordAndResolution(
      [viewSize[2], viewSize[3]], resolution)
    )

    const tileCoordXRange = {
      min: Number.MAX_SAFE_INTEGER,
      max: Number.MIN_SAFE_INTEGER
    }
    const tileCoordYRange = {
      min: Number.MAX_SAFE_INTEGER,
      max: Number.MIN_SAFE_INTEGER
    }
    for (let i = 0; i < tilesCoordinates.length; i++) {
      // X coordinates
      if (tilesCoordinates[i][2] < tileCoordXRange.min) {
        tileCoordXRange.min = tilesCoordinates[i][2]
      }
      if (tilesCoordinates[i][2] > tileCoordXRange.max) {
        tileCoordXRange.max = tilesCoordinates[i][2]
      }
      // Y coordinates
      if (tilesCoordinates[i][1] < tileCoordYRange.min) {
        tileCoordYRange.min = tilesCoordinates[i][1]
      }
      if (tilesCoordinates[i][1] > tileCoordYRange.max) {
        tileCoordYRange.max = tilesCoordinates[i][1]
      }
    }

    return [tileCoordXRange, tileCoordYRange, zoomLevel]
  }

  /** Gets the channel visualization/presentation parameters given an id
   * @param {string} opticalPathIdentifier - opticalPath of the channel
   * @return {object} BlendingInformation
   */
  getBlendingInformation (opticalPathIdentifier) {
    const channel = this.getOpticalPath(opticalPathIdentifier)
    return channel.getBlendingInformation()
  }

  /** Adds the channel to the OpenLayer Map given an id
   * @param {string} opticalPathIdentifier - opticalPath of the channel
   */
  activateOpticalPath (opticalPathIdentifier) {
    if (this.isOpticalPathActive(opticalPathIdentifier)) {
      throw new Error('OpticalPath ' + opticalPathIdentifier + ' already activated')
    }

    const channel = this.getOpticalPath(opticalPathIdentifier)
    this[_map].getLayers().insertAt(0, channel.tileLayer)
  }

  /** Removes the channel to the OpenLayer Map given an id
   * @param {string} opticalPathIdentifier - opticalPath of the channel
   */
  deactivateOpticalPath (opticalPathIdentifier) {
    if (!this.isOpticalPathActive(opticalPathIdentifier)) {
      throw new Error('OpticalPath ' + opticalPathIdentifier + ' already deactivated')
    }

    const channel = this.getOpticalPath(opticalPathIdentifier)
    this[_map].removeLayer(channel.tileLayer)
  }

  /** Returns if the channel is being rendered
   * @param {string} opticalPathIdentifier - opticalPath of the channel
   * @return {boolean} active
   */
  isOpticalPathActive (opticalPathIdentifier) {
    const channel = this.getOpticalPath(opticalPathIdentifier)
    if (channel === null) {
      return false
    }

    return !!this[_map].getLayers().getArray().find(layer => {
      return layer === channel.tileLayer
    })
  }

  /** Set the visibility of the channel to true
   * @param {string} opticalPathIdentifier - opticalPath of the channel
   */
  showOpticalPath (opticalPathIdentifier) {
    const blendingInformation = {
      visible: true,
      opticalPathIdentifier: opticalPathIdentifier
    }
    this.setBlendingInformation(blendingInformation)
  }

  /** Set the visibility of the channel to false
   * @param {string} opticalPathIdentifier - opticalPath of the channel
   */
  hideOpticalPath (opticalPathIdentifier) {
    const blendingInformation = {
      visible: false,
      opticalPathIdentifier: opticalPathIdentifier
    }
    this.setBlendingInformation(blendingInformation)
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

  /**
   * Renders the images in the specified viewport container.
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
    const height = Math.abs(this[_referenceExtents][1])
    const width = Math.abs(this[_referenceExtents][2])
    const rotation = this[_rotation] / Math.PI * 180
    const windowSize = _getWindowSize()
    const targetHeight = Math.ceil(windowSize[1] * 0.2)
    let resizeFactor
    let targetWidth
    if (rotation === 180 || rotation === 0) {
      resizeFactor = targetHeight / height
      targetWidth = width * resizeFactor
    } else {
      resizeFactor = targetHeight / width
      targetWidth = height * resizeFactor
    }
    overviewmapElement.style.width = `${targetWidth}px`
    overviewmapElement.style.height = `${targetHeight}px`

    const container = this[_map].getTargetElement()

    this[_drawingSource].on(VectorEventType.ADDFEATURE, (e) => {
      let feature = e.feature;

      /**
       * Example: Silent until all features from a single annotation are done.
       */
      const isSilentFeature = e.feature.get(Enums.InternalProperties.IsSilentFeature)
      if (isSilentFeature == true) {
        return;
      }

      /** 
       * Some features are a composite of other features. 
       * This function gets the one (normalized) that will map into scoord coordinates. 
       */
      const normalizedFeature = this[_annotationManager].getNormalizedFeature(feature);
      if (normalizedFeature) {
        feature = normalizedFeature;
      }

      /** Dont normalize when is annotation hook */
      this[_annotationManager].onAdd(e.feature)

      console.debug('ROI ADDED', feature);
      publish(
        container,
        EVENT.ROI_ADDED,
        this._getROIFromFeature(feature, this[_pyramidMetadata])
      )
    })

    this[_drawingSource].on(VectorEventType.CHANGEFEATURE, (e) => {
      let feature = e.feature;

      /** 
       * Some features are a composite of other features. 
       * This function gets the one (normalized) that will map into scoord coordinates. 
       */
      const normalizedFeature = this[_annotationManager].getNormalizedFeature(feature);
      if (normalizedFeature) {
        feature = normalizedFeature;
      }

      if (feature !== undefined || feature !== null) {
        const geometry = feature.getGeometry()
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
            feature.setGeometry(geometry)
          }
        }
      }

      publish(
        container,
        EVENT.ROI_MODIFIED,
        this._getROIFromFeature(feature, this[_pyramidMetadata])
      )
    })

    this[_drawingSource].on(VectorEventType.REMOVEFEATURE, (e) => {
      publish(
        container,
        EVENT.ROI_REMOVED,
        this._getROIFromFeature(e.feature, this[_pyramidMetadata])
      )
    })
  }

  /**
   * Updates the style of a feature.
   *
   * @param {Feature} feature - Feature
   * @param {object} styleOptions - Style options
   * @param {object} styleOptions.stroke - Style options for the outline of the geometry
   * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
   * @param {number} styleOptions.stroke.width - Width of the outline
   * @param {object} styleOptions.fill - Style options for body the geometry
   * @param {number[]} styleOptions.fill.color - RGBA color of the body
   * @param {object} styleOptions.image - Style options for image
   */
  setFeatureStyle (feature, styleOptions, optSilent = false) {
    if (styleOptions !== undefined) {   
      const style = _getOpenLayersStyle(styleOptions);
      feature.setStyle(style)
      /**
       * styleOptions is used internally by internal styled components like markers.
       * This allows them to take priority over styling since OpenLayers swaps the styles
       * completely in case of a setStyle happens.
       */
      feature.set(Enums.InternalProperties.StyleOptions, styleOptions, optSilent)
      this[_annotationManager].onSetFeatureStyle(feature, styleOptions);
    }
  }

  /** Activates the draw interaction for graphic annotation of regions of interest.
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
      ellipse: {
        type: 'LineString',
        geometryName: 'line',
        isEllipse: true,
        maxPoints: 1,
        minPoints: 1,
        [Enums.InternalProperties.VertexEnabled]: false
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
      [Enums.InternalProperties.Ellipse]:
        geometryDrawOptions[Enums.InternalProperties.Ellipse],
      [Enums.InternalProperties.Marker]:
        options[Enums.InternalProperties.Marker],
      [Enums.InternalProperties.Markup]:
        options[Enums.InternalProperties.Markup],
      [Enums.InternalProperties.VertexEnabled]: options[Enums.InternalProperties.VertexEnabled],
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
      drawOptions.condition = _getInteractionBindingCondition(options.bindings, drawOptions.condition)
    }

    this[_interactions].draw = new Draw(drawOptions)
    const container = this[_map].getTargetElement()

    this[_interactions].draw.on(Enums.InteractionEvents.DRAW_START, (event) => {
      event.feature.setProperties(builtInDrawOptions, true)
      event.feature.setId(generateUID())

      /** Set external styles before calling internal annotation hooks */
      this.setFeatureStyle(
        event.feature,
        options[Enums.InternalProperties.StyleOptions]
      )

      this[_annotationManager].onDrawStart(event, options)

      _wireMeasurementsAndQualitativeEvaluationsEvents(
        event.feature,
        {
          map: this[_map],
          drawingSource: this[_drawingSource],
          pyramid: this[_pyramidMetadata],
          annotationManager: this[_annotationManager]
        }
      )
    })

    this[_interactions].draw.on(Enums.InteractionEvents.DRAW_ABORT, (event) => {
      this[_annotationManager].onDrawAbort(event)
    })

    this[_interactions].draw.on(Enums.InteractionEvents.DRAW_END, (event) => {
      this[_annotationManager].onDrawEnd(event, options)

      publish(
        container,
        EVENT.ROI_DRAWN,
        this._getROIFromFeature(event.feature, this[_pyramidMetadata])
      )
    })

    this[_map].addInteraction(this[_interactions].draw)
  }

  /**
   * Deactivates draw interaction.
   * @returns {void}
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
   * Deactivates translate interaction. 
   * 
   * @returns {void}
   */
  deactivateTranslateInteraction() {
    console.info('deactivate "translate" interaction');
    if (this[_interactions].translate) {
      this[_map].removeInteraction(this[_interactions].translate);
      this[_interactions].translate = undefined;
    }
  }

  /**
   * Activates select interaction.
   *
   *
   * @param {Object} options - Translation options.
   */
  activateTranslateInteraction (options = {}) {
    this.deactivateTranslateInteraction()

    console.info('activate "translate" interaction')

    const translateOptions = { 
      layers: [this[_drawingLayer]],
      filter: feature => {
        return feature && feature.get(Enums.InternalProperties.CantBeTranslated) !== true
      },
      condition: event => {
        const feature = this[_drawingSource].getClosestFeatureToCoordinate(event.coordinate);
        return feature && feature.get(Enums.InternalProperties.CantBeTranslated) !== true
      },
    }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      translateOptions.condition = _getInteractionBindingCondition(
        options.bindings,
        options.condition
      )
    }

    this[_interactions].translate = new Translate(translateOptions)

    /**
     * This allows feature with sub features to be translated together.
     */
    let lastCoordinate = null;
    map.on(Enums.MapEvents.POINTER_DOWN, ({ coordinate }) => lastCoordinate = coordinate);
    map.on(Enums.MapEvents.POINTER_UP, () => lastCoordinate = null);
    this[_interactions].translate.on(Enums.InteractionEvents.TRANSLATING, event => {
      const newCoordinate = event.coordinate;
      event.features.forEach(feature => {
        const { subFeatures } = feature.getProperties();
        if (subFeatures && subFeatures.length > 0) {
          subFeatures.forEach(subFeature => {
            const geometry = subFeature.getGeometry();
            const coords = lastCoordinate;

            const deltaX = newCoordinate[0] - coords[0];
            const deltaY = newCoordinate[1] - coords[1];

            geometry.translate(deltaX, deltaY);

            lastCoordinate = event.coordinate;
          });
        }
      });
    });

    this[_map].addInteraction(this[_interactions].translate)
  }

  /**
   * Extracts and transforms the region of interest (ROI) from an Openlayers
   * Feature.
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
   * Toggles overview map.
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
   * Deactivates translate interaction.
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
   * Activates dragZoom interaction.
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
   * Deactivates dragZoom interaction.
   * @returns {void}
   */
  deactivateDragZoomInteraction () {
    console.info('deactivate "dragZoom" interaction')
    if (this[_interactions].dragZoom) {
      this[_map].removeInteraction(this[_interactions].dragZoom)
      this[_interactions].dragZoom = undefined
    }
  }

  /**
   * Activates select interaction.
   *
   * @param {object} options selection options.
   */
  activateSelectInteraction (options = {}) {
    this.deactivateSelectInteraction()

    console.info('activate "select" interaction')

    const selectOptions = { 
      layers: [this[_drawingLayer]],
      filter: feature => {
        return feature && feature.get(Enums.InternalProperties.ReadOnly) !== true
      },
      condition: event => {
        const feature = this[_drawingSource].getClosestFeatureToCoordinate(event.coordinate);
        return feature && feature.get(Enums.InternalProperties.ReadOnly) !== true
      },
    }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      selectOptions.condition = _getInteractionBindingCondition(
        options.bindings,
        selectOptions.condition
      )
    }

    this[_interactions].select = new Select(selectOptions)

    const container = this[_map].getTargetElement()

    this[_interactions].select.on('select', (e) => {
      publish(
        container,
        EVENT.ROI_SELECTED,
        this._getROIFromFeature(e.selected[0], this[_pyramidMetadata])
      )
    })

    this[_map].addInteraction(this[_interactions].select)
  }

  /**
   * Deactivates select interaction.
   *
   * @returns {void}
   */
  deactivateSelectInteraction () {
    console.info('deactivate "select" interaction')
    if (this[_interactions].select) {
      this[_map].removeInteraction(this[_interactions].select)
      this[_interactions].select = undefined
    }
  }

  /**
   * Activates dragpan interaction.
   *
   * @param {Object} options - DragPan options.
   */
  activateDragPanInteraction (options = {}) {
    this.deactivateDragPanInteraction()

    console.info('activate "drag pan" interaction')

    const dragPanOptions = {
      features: this[_features],
      condition: event => {
        const feature = this[_drawingSource].getClosestFeatureToCoordinate(event.coordinate);
        return feature && feature.get(Enums.InternalProperties.ReadOnly) !== true
      },
    }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      dragPanOptions.condition = _getInteractionBindingCondition(
        options.bindings,
        options.condition
      )
    }

    this[_interactions].dragPan = new DragPan(dragPanOptions)

    this[_map].addInteraction(this[_interactions].dragPan)
  }

  /**
   * Deactivate dragpan interaction.
   *
   * @returns {void}
   */
  deactivateDragPanInteraction () {
    console.info('deactivate "drag pan" interaction')
    if (this[_interactions].dragPan) {
      this[_map].removeInteraction(this[_interactions].dragPan)
      this[_interactions].dragPan = undefined
    }
  }

  /**
   * Activates snap interaction.
   *
   * @param {Object} options - Snap options.
   */
  activateSnapInteraction (options = {}) {
    this.deactivateSnapInteraction()
    console.info('activate "snap" interaction')
    this[_interactions].snap = new Snap({
      source: this[_drawingSource],
    })

    this[_map].addInteraction(this[_interactions].snap)
  }

  /**
   * Deactivates snap interaction.
   *
   * @returns {void}
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

  /** Activates modify interaction.
   *
   * @param {object} options - Modification options.
   */
  activateModifyInteraction (options = {}) {
    this.deactivateModifyInteraction()

    console.info('activate "modify" interaction')

    const modifyOptions = {
      features: this[_features], // TODO: or source, i.e. 'drawings'???
      condition: event => {
        const feature = this[_drawingSource].getClosestFeatureToCoordinate(event.coordinate);
        return feature && feature.get(Enums.InternalProperties.ReadOnly) !== true
      },
      insertVertexCondition: ({ feature }) =>
        feature && feature.get(Enums.InternalProperties.VertexEnabled) === true,
        condition: event => {
          const feature = this[_drawingSource].getClosestFeatureToCoordinate(event.coordinate);
          return feature && feature.get(Enums.InternalProperties.ReadOnly) !== true
        }
    }

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      modifyOptions.condition = _getInteractionBindingCondition(
        options.bindings,
        modifyOptions.condition
      )
    }

    this[_interactions].modify = new Modify(modifyOptions)

    this[_map].addInteraction(this[_interactions].modify)
  }

  /** Deactivates modify interaction. */
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
   * Gets all annotated regions of interest.
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
   * Gets an individual annotated regions of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @returns {ROI} Regions of interest.
   */
  getROI (uid) {
    console.info(`get ROI ${uid}`)
    const feature = this[_drawingSource].getFeatureById(uid)
    return this._getROIFromFeature(feature, this[_pyramidMetadata])
  }

  /**
   * Adds a measurement to a region of interest.
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
   * Adds a qualitative evaluation to a region of interest.
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

  /** Pops the most recently annotated regions of interest.
   *
   * @returns {ROI} Regions of interest.
   */
  popROI () {
    console.info('pop ROI')
    const feature = this[_features].pop()
    return this._getROIFromFeature(feature, this[_pyramidMetadata])
  }

  /**
   * Adds a regions of interest.
   *
   * @param {ROI} item - Regions of interest
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
    const geometry = scoord3d2Geometry(roi.scoord3d, this[_pyramidMetadata])
    const featureOptions = { geometry }

    const feature = new Feature(featureOptions)
    _addROIPropertiesToFeature(feature, roi.properties, true)
    feature.setId(roi.uid)

    _wireMeasurementsAndQualitativeEvaluationsEvents(
      feature,
      {
        map: this[_map],
        drawingSource: this[_drawingSource],
        pyramid: this[_pyramidMetadata],
        annotationManager: this[_annotationManager]
      }
    )

    /** Style should be set before adding to features array which is tracked elsewhere */
    this.setFeatureStyle(feature, styleOptions)

    this[_features].push(feature)

    const isVisible = Object.keys(styleOptions).length !== 0
    this[_annotationManager].setMarkupVisibility(roi.uid, isVisible)
  }

  /**
   * Update properties of regions of interest.
   *
   * @param {object} roi - ROI to be updated
   * @param {string} roi.uid - Unique identifier of the region of interest
   * @param {object} roi.properties - ROI properties
   * @param {object} roi.properties.measurements - ROI measurements
   * @param {object} roi.properties.evaluations - ROI evaluations
   * @param {object} roi.properties.label - ROI label
   * @param {object} roi.properties.marker - ROI marker (this is used while we don't have presentation states)
   */
  updateROI ({ uid, properties = {} }) {
    if (!uid) return
    console.info(`update ROI ${uid}`)

    const feature = this[_drawingSource].getFeatureById(uid)

    _addROIPropertiesToFeature(feature, properties)

    this[_annotationManager].onUpdate(feature)
  }

  /**
   * Sets the style of a region of interest.
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
        this.setFeatureStyle(feature, styleOptions)
        const isVisible = Object.keys(styleOptions).length !== 0
        this[_annotationManager].setMarkupVisibility(id, isVisible)
      }
    })
  }

  /**
   * Adds a new viewport overlay.
   *
   * @param {object} options Overlay options
   * @param {object} options.element The custom overlay html element
   * @param {object} options.className Class to style the OpenLayer's overlay container
   */
  addViewportOverlay ({ element, className }) {
    this[_map].addOverlay(new Overlay({ element, className }))
  }

  /**
   * Removes an individual regions of interest.
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
   * Removes all annotated regions of interest.
   *
   * @returns {void}
   */
  removeAllROIs () {
    console.info('remove all ROIs')
    this[_features].clear()
  }

  /**
   * Hides annotated regions of interest such that they are no longer
   *  visible on the viewport.
   */
  hideROIs () {
    console.info('hide ROIs')
    this[_drawingLayer].setVisible(false)
    this[_annotationManager].setVisible(false)
  }

  /**
   * Shows annotated regions of interest such that they become visible
   *  on the viewport ontop of the images.
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
   * DICOM metadata for each VL Whole Slide Microscopy Image instance.
   *
   * @return {VLWholeSlideMicroscopyImage[]}
   */
  get imageMetadata () {
    return this[_pyramidMetadata]
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
      options.client
        .retrieveInstanceRendered(retrieveOptions)
        .then((thumbnail) => {
          const blob = new Blob([thumbnail], { type: mediaType })// eslint-disable-line
          image.getImage().src = window.URL.createObjectURL(blob)
        })
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
