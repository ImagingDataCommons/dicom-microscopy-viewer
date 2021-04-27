import 'ol/ol.css';
import Collection from 'ol/Collection';
import Draw, { createRegularPolygon, createBox } from 'ol/interaction/Draw';
import EVENT from "./events";
import Feature from 'ol/Feature';
import Fill from 'ol/style/Fill';
import FullScreen from 'ol/control/FullScreen';
import ImageLayer from 'ol/layer/Image';
import Map from 'ol/Map';
import Modify from 'ol/interaction/Modify';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';
import OverviewMap from 'ol/control/OverviewMap';
import Projection from 'ol/proj/Projection';
import publish from "./eventPublisher";
import ScaleLine from 'ol/control/ScaleLine';
import Select from 'ol/interaction/Select';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Static from 'ol/source/ImageStatic';
import Overlay from 'ol/Overlay';
import TileLayer from 'ol/layer/Tile';
import TileImage from 'ol/source/TileImage';
import TileGrid from 'ol/tilegrid/TileGrid';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import View from 'ol/View';
import { default as PolygonGeometry } from 'ol/geom/Polygon';
import { default as PointGeometry } from 'ol/geom/Point';
import { default as LineStringGeometry } from 'ol/geom/LineString';
import { default as CircleGeometry } from 'ol/geom/Circle';
import { default as VectorEventType } from "ol/source/VectorEventType";
import { default as MapEventType } from "ol/MapEventType";
import { defaults as defaultInteractions } from 'ol/interaction';
import {ZoomSlider, defaults as defaultControls} from 'ol/control';

import { getCenter } from 'ol/extent';
import { toStringXY, rotate } from 'ol/coordinate';

import { VLWholeSlideMicroscopyImage, getFrameMapping } from './metadata.js';
import { ROI } from './roi.js';
import {
  computeRotation,
  generateUID,
  applyInverseTransform,
  applyTransform,
  buildInverseTransform,
  buildTransform,
} from './utils.js';
import {
  Point,
  Multipoint,
  Polyline,
  Polygon,
  Ellipsoid,
  Ellipse
} from './scoord3d.js';
import {
  _Channel,
  BlendingInformation,
} from './channel.js'
import {
  formatMetadata,
} from './metadata.js'
import { RenderingEngine } from './renderingEngine.js';

import * as DICOMwebClient from 'dicomweb-client';
import { forEach } from 'mathjs';


/** Extracts value of Pixel Spacing attribute from metadata.
 *
 * @param {object} metadata - Metadata of a DICOM VL Whole Slide Microscopy Image instance
 * @returns {number[]} Spacing between pixel columns and rows in millimeter
 * @private
 */
function _getPixelSpacing(metadata) {
  const functionalGroup = metadata.SharedFunctionalGroupsSequence[0];
  const pixelMeasures = functionalGroup.PixelMeasuresSequence[0];
  return pixelMeasures.PixelSpacing;
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
function _getRotation(metadata) {
  // Angle with respect to the reference orientation
  const angle = computeRotation({
    orientation: metadata.ImageOrientationSlide
  });
  // We want the slide oriented horizontally with the label on the right side
  const correction = 90 * (Math.PI / 180)
  return angle + correction
}


/** Converts a vector graphic from an Openlayers Geometry into a DICOM SCOORD3D
 * representation.
 *
 * @param {object} geometry - Openlayers Geometry
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @returns {Scoord3D} DICOM Microscopy Viewer Scoord3D
 * @private
 */
function _geometry2Scoord3d(geometry, pyramid) {
  console.info('map coordinates from pixel matrix to slide coordinate system')
  const frameOfReferenceUID = pyramid[pyramid.length - 1].FrameOfReferenceUID;
  const type = geometry.getType();
  if (type === 'Point') {
    let coordinates = geometry.getCoordinates();
    coordinates = _geometryCoordinates2scoord3dCoordinates(coordinates, pyramid);
    return new Point({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID
    });
  } else if (type === 'Polygon') {
    /*
     * The first linear ring of the array defines the outer-boundary (surface).
     * Each subsequent linear ring defines a hole in the surface.
     */
    let coordinates = geometry.getCoordinates()[0].map(c => {
      return _geometryCoordinates2scoord3dCoordinates(c, pyramid);
    });
    return new Polygon({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID
    });
  } else if (type === 'LineString') {
    let coordinates = geometry.getCoordinates().map(c => {
      return _geometryCoordinates2scoord3dCoordinates(c, pyramid);
    });
    return new Polyline({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID
    });
  } else if (type === 'Circle') {
    const center = geometry.getCenter();
    const radius = geometry.getRadius();
    // Endpoints of major and  minor axis of the ellipse.
    let coordinates = [
      [center[0] - radius, center[1], 0],
      [center[0] + radius, center[1], 0],
      [center[0], center[1] - radius, 0],
      [center[0], center[1] + radius, 0],
    ];
    coordinates = coordinates.map(c => {
      return _geometryCoordinates2scoord3dCoordinates(c, pyramid);
    })
    return new Ellipse({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID
    });
  } else {
    // TODO: Combine multiple points into MULTIPOINT.
    console.error(`unknown geometry type "${type}"`)
  }
}

/** Converts a vector graphic from a DICOM SCOORD3D into an Openlayers Geometry
 * representation.
 *
 * @param {Scoord3D} scoord3d - DICOM Microscopy Viewer Scoord3D
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @returns {object} Openlayers Geometry
 * @private
 */
function _scoord3d2Geometry(scoord3d, pyramid) {
  console.info('map coordinates from slide coordinate system to pixel matrix')
  const type = scoord3d.graphicType;
  const data = scoord3d.graphicData;

  if (type === 'POINT') {
    let coordinates = _scoord3dCoordinates2geometryCoordinates(data, pyramid);
    return new PointGeometry(coordinates);
  } else if (type === 'POLYLINE') {
    const coordinates = data.map(d => {
      return _scoord3dCoordinates2geometryCoordinates(d, pyramid);
    });
    return new LineStringGeometry(coordinates);
  } else if (type === 'POLYGON') {
    const coordinates = data.map(d => {
      return _scoord3dCoordinates2geometryCoordinates(d, pyramid);
    });
    return new PolygonGeometry([coordinates]);
  } else if (type === 'ELLIPSE') {
    // TODO: ensure that the ellipse represents a circle, i.e. that
    // major and minor axis form a right angle and have the same length
    const majorAxisCoordinates = data.slice(0, 2);
    const minorAxisCoordinates = data.slice(2, 4);
    // Circle is defined by two points: the center point and a point on the
    // circumference.
    const point1 = majorAxisCoordinates[0];
    const point2 = majorAxisCoordinates[1];
    let coordinates = [
      [
        (point1[0] + point2[0]) / parseFloat(2),
        (point1[1] + point2[1]) / parseFloat(2),
        0
      ],
      point2
    ];
    coordinates = coordinates.map(d => {
      return _scoord3dCoordinates2geometryCoordinates(d, pyramid);
    });
    // to flat coordinates
    coordinates = [...coordinates[0].slice(0, 2), ...coordinates[1].slice(0, 2)];

    // flat coordinates in combination with opt_layout and no opt_radius are also accepted
    // and internaly it calculates the Radius
    return new CircleGeometry(coordinates, null, "XY");
  } else {
    console.error(`unsupported graphic type "${type}"`)
  }
}

function _geometryCoordinates2scoord3dCoordinates(coordinates, pyramid) {
  return _coordinateFormatGeometry2Scoord3d([coordinates[0], coordinates[1], coordinates[2]], pyramid);
}

function _scoord3dCoordinates2geometryCoordinates(coordinates, pyramid) {
  return _coordinateFormatScoord3d2Geometry([coordinates[0], coordinates[1], coordinates[2]], pyramid)
}

/** Translates coordinates of Total Pixel Matrix in pixel unit into coordinates
 * in Frame of Reference (slide coordinate system) in millimeter unit.
 *
 * @param {number[]|number[][]} coordinates - Coordinates in Total Pixel Matrix
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @returns {number[]|number[][]} Coordinates in Frame of Reference
 * @private
 */
function _coordinateFormatGeometry2Scoord3d(coordinates, pyramid) {
  let transform = false;
  if (!Array.isArray(coordinates[0])) {
    coordinates = [coordinates];
    transform = true;
  }
  const metadata = pyramid[pyramid.length - 1];
  const origin = metadata.TotalPixelMatrixOriginSequence[0];
  const orientation = metadata.ImageOrientationSlide;
  const spacing = _getPixelSpacing(metadata);
  const offset = [
    Number(origin.XOffsetInSlideCoordinateSystem),
    Number(origin.YOffsetInSlideCoordinateSystem),
  ];

  const affine = buildTransform({
    offset,
    orientation,
    spacing,
  })
  coordinates = coordinates.map(c => {
    const pixelCoord = [c[0], -(c[1] + 1)];
    const slideCoord = applyTransform({ coordinate: pixelCoord, affine });
    return [slideCoord[0], slideCoord[1], 0];
  });
  if (transform) {
    return coordinates[0];
  }
  return coordinates;
}

/** Translates coordinates of coordinates in Frame of Reference
 * (slide coordinate system) in millimeter unit into coordinates in
 * Total Pixel Matrix in pixel unit.
 *
 * @param {number[]|number[][]} coordinates - Coordinates in Frame of Reference
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @returns {number[]|number[][]} Coordinates in Total Pixel Matrix
 * @private
 */
function _coordinateFormatScoord3d2Geometry(coordinates, pyramid) {
  let transform = false;
  if (!Array.isArray(coordinates[0])) {
    coordinates = [coordinates];
    transform = true;
  }
  const metadata = pyramid[pyramid.length - 1];
  const orientation = metadata.ImageOrientationSlide;
  const spacing = _getPixelSpacing(metadata);
  const origin = metadata.TotalPixelMatrixOriginSequence[0];
  const offset = [
    Number(origin.XOffsetInSlideCoordinateSystem),
    Number(origin.YOffsetInSlideCoordinateSystem),
  ];

  let outOfFrame = false
  const affine = buildInverseTransform({
    offset,
    orientation,
    spacing,
  })
  coordinates = coordinates.map(c => {
    if (c[0] > 25 || c[1] > 76) {
      outOfFrame = true
    }
    const slideCoord = [c[0], c[1]];
    const pixelCoord = applyInverseTransform({
      coordinate: slideCoord,
      affine
    });
    return [pixelCoord[0], -(pixelCoord[1] + 1), 0];
  });
  if (transform) {
    return coordinates[0];
  }
  if (outOfFrame) {
    console.warning(
      'found coordinates outside slide coordinate system 25 x 76 mm'
    )
  }
  return coordinates;
}

/** Extracts and transforms the region of interest (ROI) from an Openlayers
 * Feature.
 *
 * @param {object} feature - Openlayers Feature
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @returns {ROI} Region of interest
 * @private
 */
function _getROIFromFeature(feature, pyramid) {
  if (feature !== undefined && feature !== null) {
    const geometry = feature.getGeometry();
    const scoord3d = _geometry2Scoord3d(geometry, pyramid);
    const properties = feature.getProperties();
    // Remove geometry from properties mapping
    const geometryName = feature.getGeometryName();
    delete properties[geometryName];
    const uid = feature.getId();
    return new ROI({ scoord3d, properties, uid });
  }
  return
}

/** Updates the style of a feature.
 *
 * @param {object} styleOptions - Style options
 * @param {object} styleOptions.stroke - Style options for the outline of the geometry
 * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
 * @param {number} styleOptions.stroke.width - Width of the outline
 * @param {object} styleOptions.fill - Style options for body the geometry
 * @param {number[]} styleOptions.fill.color - RGBA color of the body
 */
function _setFeatureStyle(feature, styleOptions) {
  if (styleOptions !== undefined) {
    const style = new Style();
    if ('stroke' in styleOptions) {
      const strokeOptions = {
        color: styleOptions.stroke.color,
        width: styleOptions.stroke.width,
      }
      const stroke = new Stroke(strokeOptions);
      style.setStroke(stroke);
    }
    if ('fill' in styleOptions) {
      const fillOptions = {
        color: styleOptions.fill.color
      }
      const fill = new Fill(fillOptions);
      style.setFill(fill);
    }
    feature.setStyle(style);
  }
}

const _options = Symbol('options');
const _client = Symbol('client');
const _controls = Symbol('controls');
const _drawingLayer = Symbol('drawingLayer');
const _drawingSource = Symbol('drawingSource');
const _features = Symbol('features');
const _imageLayer = Symbol('imageLayer');
const _interactions = Symbol('interactions');
const _map = Symbol('map');
const _metadata = Symbol('metadata');
const _pyramidMetadata = Symbol('pyramidMetadata');
const _segmentations = Symbol('segmentations');
const _usewebgl = Symbol('usewebgl');
const _channels = Symbol('channels');
const _colorImage = Symbol('colorImage');
const _renderingEngine = Symbol('renderingEngine');
const _rotation = Symbol('rotation');
const _projection = Symbol('projection');
const _tileGrid = Symbol('tileGrid');
const _referenceExtents = Symbol('referenceExtents');
const _referenceOrigins = Symbol('referenceOrigins');
const _referenceResolutions = Symbol('referenceResolutions');
const _referenceGridSizes = Symbol('referenceGridSizes');
const _referenceTileSizes = Symbol('referenceTileSizes');
const _referencePixelSpacings = Symbol('referencePixelSpacings');
const _retrieveRendered = Symbol('retrieveRendered');
const _includeIccProfile = Symbol('includeIccProfile');

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
   * @param {object[]} options.metadata - An array of DICOM JSON metadata objects, 
   *        the array is full dicom metadata (all the instances) and the Library has to take care of determining which
   *        instances represent channels (optical paths) and internally build a lookup table upon Library object construction
   * @param {object[]} options.blendingInformation - An array containing blending information for the channels with the
   *        standard visualization parameters already setup by an external APPs 
   * @param {string[]} [options.controls=[]] - Names of viewer control elements that should be included in the viewport
   * @param {boolean} [options.retrieveRendered=true] - Whether image frames should be retrieved via DICOMweb prerendered by the server.
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile should be included for correction of image colors
   * @param {boolean} [options.useWebGL=true] - Whether WebGL renderer should be used
   */
  constructor(options) {
    this[_options] = options
    if ('useWebGL' in this[_options]) {
      this[_usewebgl] = this[_options].useWebGL;
    } else {
      this[_usewebgl] = true;
    }

    if (!('retrieveRendered' in this[_options])) {
      this[_retrieveRendered] = true;
    } else {
      this[_retrieveRendered] = this[_options].retrieveRendered;
    }

    if (!('includeIccProfile' in this[_options])) {
      this[_includeIccProfile] = false;
    } else {
      this[_includeIccProfile] = this[_options].includeIccProfile;
    }

    if (!('controls' in this[_options])) {
      this[_options].controls = [];
    }
    this[_options].controls = new Set(this[_options].controls);

    
    // Collection of Openlayers "VectorLayer" instances indexable by
    // DICOM Series Instance UID
    this[_segmentations] = {};

    // Collection of Openlayers "Feature" instances
    this[_features] = new Collection([], { unique: true });
    // Add unique identifier to each created "Feature" instance
    this[_features].on('add', (e) => {
      // The ID may have already been set when drawn. However, features could
      // have also been added without a draw event.
      if (e.element.getId() === undefined) {
        e.element.setId(generateUID());
      }
    });

    // Order all the instances metadata array in channel objects
    this[_channels] = [];
    const colors = [
      [0, 0.5, 0.5],
      [0.5, 0.5, 0],
      [1,0,0],
      [0.5, 0, 0.5],
      [0,1,0],
      [0,0,1],
      [1,1,1],
    ];

    if (this[_options].metadata.length === 0) {
      throw new Error('Input metadata has no instances.');
    }

    // Metadata Tiles types checks for each instance
    // look for channels
    for (let i = 0; i < this[_options].metadata.length; ++i) {
      let instanceMetadata = formatMetadata(this[_options].metadata[i]);
      if (instanceMetadata.SamplesPerPixel !== 1) {
        // this is not a monochorme channel, but a color image.
        continue;
      }
      if (instanceMetadata.DimensionOrganizationType === '3D' || instanceMetadata.DimensionOrganizationType === '3D_TEMPORAL') {
        // 3D data
        // TO DO: get some example data.
        throw new Error('Volume Image Viewer does hot hanlde 3D channel data yet.');
      } else if (instanceMetadata.DimensionOrganizationType === 'TILED_FULL') {
        if (instanceMetadata.TotalPixelMatrixFocalPlanes !== 1) {
          continue;
        } else {
          const pathIdentifier = instanceMetadata.OpticalPathSequence[0].OpticalPathIdentifier;
          let channel = this[_channels].find(channel => channel.blendingInformation.opticalPathIdentifier === pathIdentifier);
          if (channel) {
            channel.addMetadata(this[_options].metadata[i])        
          } else {
            const blendingInformation = this[_options].blendingInformation !== undefined ? 
            this[_options].blendingInformation.find(blendingInformation => 
                blendingInformation.opticalPathIdentifier === pathIdentifier) :
                 undefined;
            if (blendingInformation) {
              const newChannel = new _Channel(blendingInformation);
              newChannel.addMetadata(this[_options].metadata[i]);
              this[_channels].push(newChannel)
            } else {
              const defaultBlendingInformation = new BlendingInformation(
                opticalPathIdentifier = `${pathIdentifier}`, 
                color = [...colors[i % colors.length]],
                opacity = 1.0,
                thresholdValues = [0, 255],
                visible = false,
              );

              const newChannel = new _Channel(defaultBlendingInformation);
              newChannel.addMetadata(this[_options].metadata[i]);
              this[_channels].push(newChannel);
            }
          }
        }
      } else if (instanceMetadata.DimensionOrganizationType === 'TILED_SPARSE') {
        // the spatial location of each tile is explicitly encoded using information 
        // in the Per-Frame Functional Group Sequence, and the recipient shall not 
        // make any assumption about the spatial position or optical path or order of the encoded frames.
        // TO DO: get some example data.
        throw new Error('Volume Image Viewer does hot handle TILED_SPARSE ' +
                        'dimension organization for blending of channels yet.');
      }
    }

    this[_colorImage] = {
      OpticalPathIdentifier: '',
      metadata: [],
    };
    // look for color images
    for (let i = 0; i < this[_options].metadata.length; ++i) {
      let instanceMetadata = formatMetadata(this[_options].metadata[i]);
      if (instanceMetadata.SamplesPerPixel === 1) {
        // this is not a color image, but a monochorme channel.
        continue;
      }
      const pathIdentifier = instanceMetadata.OpticalPathSequence[0].OpticalPathIdentifier;
      if (this[_colorImage].OpticalPathIdentifier === '') {
        this[_colorImage].OpticalPathIdentifier = pathIdentifier;
      } else if (this[_colorImage].OpticalPathIdentifier !== pathIdentifier) {
        console.warn('Volume Image Viewer detected more than one color image. ' + 
                     'It is possible to load and visualize only one color image at time. ' + 
                     'Please check the input metadata. Only the first detected color image will be loaded');
        continue;
      }

      this[_colorImage].metadata.push(this[_options].metadata[i]);
    }

    /*
    * For blending we have to make some assumptions 
    * 1) all channels should have the same origins, resolutions, grid sizes,
    *    tile sizes and pixel spacings (i.e. same TileGrid).
    *    These are arrays with number of element equal to nlevel (levels of the pyramid). 
    *    All channels should have the same nlevel value.
    * 2) given (1), we calculcate the tileGrid, projection and rotation objects using 
    *    the metadata of the first channel and use them for all the channels.
    * 3) If the parameters in (1) are different, it means that we have to perfom 
    *    regridding/reprojection over the data (i.e. registration).
    *    This, at the moment, is out of scope. 
    */
    if (this[_channels].length === 0 && this[_colorImage].OpticalPathIdentifier === '') {
      throw new Error('No channels or colorImage found.');
    }

    let image = null;
    if (this[_channels].length !== 0) {
      image = this[_channels][0];
    } else {
      image = this[_colorImage];
    }

    let geometryArrays = _Channel.deriveImageGeometry(image);

    this[_referenceExtents] = [...geometryArrays[0]];
    this[_referenceOrigins] = [...geometryArrays[1]];
    this[_referenceResolutions] = [...geometryArrays[2]];
    this[_referenceGridSizes] = [...geometryArrays[3]];
    this[_referenceTileSizes] = [...geometryArrays[4]];
    this[_referencePixelSpacings] = [...geometryArrays[5]];
    
    // We assume the first channel as the reference one for all the pyramid parameters.
    // All the other channels have to have the same parameters.
    this[_pyramidMetadata] = [...image.pyramidMetadata];
    
    this[_rotation] = _getRotation(image.pyramidBaseMetadata);

    /*
    * Specify projection to prevent default automatic projection
    * with the default Mercator projection.
    */
    this[_projection] = new Projection({
      code: 'DICOM',
      units: 'metric',
      extent: this[_referenceExtents],
      getPointResolution: (pixelRes, point) => {
        /** DICOM Pixel Spacing has millimeter unit while the projection has
          * has meter unit.
          */
        const spacing = _getPixelSpacing(image.pyramidMetadata[image.pyramidMetadata.length - 1])[0] / 10 ** 3;
        return pixelRes * spacing;
      }
    });
    
    /*
    * TODO: Register custom projection:
    *  - http://openlayers.org/en/latest/apidoc/ol.proj.html
    *  - http://openlayers.org/en/latest/apidoc/module-ol_proj.html#~ProjectionLike
    * Direction cosines could be handled via projection rather
    * than specifying a rotation
    */
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
      tileSizes: this[_referenceTileSizes],
    });

    const view = new View({
      center: getCenter(this[_referenceExtents]),
      extent: this[_referenceExtents],
      projection: this[_projection],
      resolutions: this[_tileGrid].getResolutions(),
      rotation: this[_rotation],
    });

    // Create a rendering engine object for offscreen rendering
    this[_renderingEngine] = new RenderingEngine();

    // For each channel we build up the OpenLayer objects and 
    // checks that the geometric assumptions are satisfied. 
    this[_channels].forEach((channel) => {  
      channel.initChannel(
        image.opticalPathIdentifier,
        this[_referenceExtents],
        this[_referenceOrigins],
        this[_referenceResolutions],
        this[_referenceGridSizes],
        this[_referenceTileSizes],
        this[_referencePixelSpacings],
        this[_projection],
        this[_tileGrid],
        this[_options],
        this[_renderingEngine],
      );
    });

    // build up the OpenLayer objects for the colorImage
    this._initColorImage();

    this[_drawingSource] = new VectorSource({
      tileGrid: this[_tileGrid],
      projection: this[_projection],
      features: this[_features],
      wrapX: false,
    });

    this[_drawingLayer] = new VectorLayer({
      extent: this[_referenceExtents],
      source: this[_drawingSource],
      projection: this[_projection],
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    });

    this[_interactions] = {
      draw: undefined,
      select: undefined,
      modify: undefined,
    };

    this[_controls] = {
      scale: new ScaleLine({
        units: 'metric',
        className: '',
      })
    }

    const layers = [];
    let rasterSourceOverview;
    if (this[_options].blendingInformation !== undefined) {
      this[_channels].forEach((channel) => {
        if (channel.blendingInformation.visible === true) {
          layers.push(channel.tileLayer);
        }
      });
      rasterSourceOverview = this[_channels][0].rasterSource;
    } else if (this[_channels].length !== 0) {
      layers.push(this[_channels][0].tileLayer);
      rasterSourceOverview = this[_channels][0].rasterSource;  
    } else if (this[_colorImage].OpticalPathIdentifier !== '') {
      layers.push(this[_colorImage].tileLayer);
      rasterSourceOverview = this[_colorImage].rasterSource;
    } else {
      throw new Error('Viewer cannot find a color image or a monochorme channel to visualize.')
    }

    layers.push(this[_drawingLayer]);

    if (this[_options].controls.has('fullscreen')) {
      this[_controls].fullscreen = new FullScreen();
    }

    if (this[_options].controls.has('zoom')) {
      this[_controls].zoomslider = new ZoomSlider();
    }

    if (this[_options].controls.has('overview')) {
      const overviewTileLayer = new TileLayer({
        extent: this[_referenceExtents],
        source: rasterSourceOverview,
        projection: this[_projection],
      });

      const overviewView = new View({
        projection: this[_projection],
        resolutions: this[_tileGrid].getResolutions(),
        rotation: this[_rotation],
      });

      this[_controls].overview = new OverviewMap({
        view: overviewView,
        layers: [overviewTileLayer],
      });
    }

    // Creates the map with the defined layers and view and renders it.
    this[_map] = new Map({
      layers,
      view: view,
      controls: defaultControls(),
      keyboardEventTarget: document,
    });

    this[_map].addInteraction(new MouseWheelZoom());

    for (let control in this[_controls]) {
      this[_map].addControl(this[_controls][control]);
    }
    this[_map].getView().fit(this[_referenceExtents]);

    // This updates the tiles offscreen rendering when zoom is applied to the view.
    const viewer = this;
    view.origAnimate = view.animate;
    let currZoom = 0;
    view.animate = function(animateSpecs) { 
      let newZoom = animateSpecs.zoom;
      if (!newZoom) {
        newZoom = this.getZoomForResolution(animateSpecs.resolution);
      }
      if (newZoom) {      
        if (Math.round(newZoom) !== Math.round(currZoom)) {
          currZoom = newZoom;
          if (viewer[_channels] && viewer[_channels].length !== 0) {
            // For each channel check if any tiles at the new zoom 
            // needs to refresh the offscreen coloring rendering.
            let render = false;
            viewer[_channels].forEach((channel) => {  
              const channelRender = channel.updateTilesRendering(false, newZoom);
              if (channelRender) {
                render = true;
              }
            });
            if (render) {
              viewer[_map].render();
            }
          }
        }
      }
      this.origAnimate(animateSpecs);
    };

    // This updates the tiles offscreen rendering when panning the view.
    this[_map].on('pointermove', evt => {
      if (evt.dragging){
        if (viewer[_channels] && viewer[_channels].length !== 0) {
          // For each channel check if any tiles at the new panning 
          // needs to refresh the offscreen coloring rendering.
          const tilesCoordRanges = this._transformViewCoordinatesInTilesCoordinates();
          let render = false;
          viewer[_channels].forEach((channel) => {  
            const channelRender = channel.updateTilesRendering(
              false, 
              tilesCoordRanges[2], 
              [tilesCoordRanges[0], tilesCoordRanges[1]]
            );
            if (channelRender) {
              render = true;
            }
          });
          if (render) {
            viewer[_map].render();
          }
        }
      }
    });
  }

  /** init unique Open Layer objects
   */
  _initColorImage() {
    if (this[_colorImage].OpticalPathIdentifier === '') {
      return;
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

      const z = tileCoord[0];
      const y = tileCoord[1] + 1;
      const x = tileCoord[2] + 1;
      const index = x + '-' + y;

      const path = this[_colorImage].pyramidFrameMappings[z][index];
      if (path === undefined) {
        console.warn('tile ' + index + ' not found at level ' + z);
        return (null);
      }
      let url = this[_options].client.wadoURL +
        '/studies/' + this[_colorImage].pyramidMetadata[z].StudyInstanceUID +
        '/series/' + this[_colorImage].pyramidMetadata[z].SeriesInstanceUID +
        '/instances/' + path;
      if (this[_options].retrieveRendered) {
        url = url + '/rendered';
      }
      return (url);
    }

    /*
     * Define custom tile loader function, which is required because the
     * WADO-RS response message has content type "multipart/related".
     */
    const tileLoadFunction = async (tile, src) => {
      const img = tile.getImage();
      if (src !== null) {
        const studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(src);
        const seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(src);
        const sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(src);
        const frameNumbers = DICOMwebClient.utils.getFrameNumbersFromUri(src);

        if (this[_retrieveRendered]) {  
          const mediaType = 'image/png';
          let transferSyntaxUID = '';
          const retrieveOptions = {
            studyInstanceUID,
            seriesInstanceUID,
            sopInstanceUID,
            frameNumbers,
            mediaTypes: [
              { mediaType, transferSyntaxUID }
            ]
          };
          if (this[_includeIccProfile]) {
            retrieveOptions['queryParams'] = {
              iccprofile: 'yes',
            }
          }

          this[_options].client.retrieveInstanceFramesRendered(retrieveOptions).then(
            (renderedFrame) => {
              const blob = new Blob([renderedFrame], {type: mediaType});
              img.src = window.URL.createObjectURL(blob);
            }
          );
        } else {
          let mediaType = 'image/jpeg';
          let transferSyntaxUID = '1.2.840.10008.1.2.4.50';
          const retrieveOptions = {
            studyInstanceUID,
            seriesInstanceUID,
            sopInstanceUID,
            frameNumbers,
            mediaTypes: [
              { mediaType, transferSyntaxUID }
            ]
          };
          this[_options].client.retrieveInstanceFrames(retrieveOptions).then(
            (rawFrames) => {
              const blob = new Blob(rawFrames, {type: mediaType});
              img.src = window.URL.createObjectURL(blob);
            }
          );
        }
      } else {
        console.warn('could not load tile');
      }
    }

    this[_colorImage].rasterSource = new TileImage({
      crossOrigin: 'Anonymous',
      tileGrid: this[_tileGrid],
      projection: this[_projection],
      wrapX: false,
      transition: 0,
    });

    this[_colorImage].rasterSource.setTileUrlFunction(tileUrlFunction);
    this[_colorImage].rasterSource.setTileLoadFunction(tileLoadFunction);

    // Create OpenLayer renderer object
    this[_colorImage].tileLayer = new TileLayer({
      extent: this[_tileGrid].getExtent(),
      source: this[_colorImage].rasterSource,
      projection: this[_projection],
    });
  }

  /** Gets the channel or color image given an id 
   * @param {string} opticalPathID - opticalPath of the channel
   * @return {Object} _Channel
   */
   getOpticalPath(opticalPathID) {
    if (this[_channels].length === 0 && this[_colorImage].OpticalPathIdentifier === '') {
      throw new Error('No channels or colorImage found.');
    }
    const channel = this[_channels].find
      (channel => channel.blendingInformation.opticalPathIdentifier === opticalPathID);
    const colorImage = this[_colorImage].OpticalPathIdentifier === opticalPathID ?
      this[_colorImage] : undefined;
    if (!channel && !colorImage) {
      throw new Error('No OpticalPath with ID ' + opticalPathID + ' has been found.');
    }

    return channel;
  }

  /** Gets the channel or color image metadata given an id
   * @param {string} opticalPathID - opticalPath of the channel
   * @return {metadata[]} array with all the instances metadata of the channel
   */
   getOpticalPathMetadata(opticalPathID) {
    const image = this.getOpticalPath(opticalPathID)
    return image.metadata;
  }

  /** Sets the channel visualization/presentation parameters given an id
   * @param {object} BlendingInformation
   * @param {string} BlendingInformation.opticalPathIdentifier - channel ID
   * @param {number[]} BlendingInformation.color - channel rgb color
   * @param {number} BlendingInformation.opacity - channel opacity
   * @param {number[]} BlendingInformation.thresholdValues - channel clipping values
   * @param {boolean} BlendingInformation.visible - channel visibility
   */
  setBlendingInformation(blendingInformation) {
    const {
      opticalPathID,
    } = blendingInformation;

    const channel = this.getOpticalPath(opticalPathID)
    const tilesCoordRanges = this._transformViewCoordinatesInTilesCoordinates();
    
    if (channel.setBlendingInformation(blendingInformation, tilesCoordRanges)) {
      this[_map].render();
    }
  }

  /** Returns if the channel is being rendered
   * @returns {number[]} array with tiles X and Y coordinates ranges and zoom level.
   */
  _transformViewCoordinatesInTilesCoordinates() {
    const viewSize = this[_map].getView().calculateExtent(this[_map].getSize());
    // viewSize: x1, y1, x2, y2
    const zoomLevel = this[_map].getView().getZoom();
    const resolution = this[_map].getView().values_.resolution;
    const tilesCoordinates = [];
    tilesCoordinates.push(this[_tileGrid].getTileCoordForCoordAndResolution
      ([viewSize[0], viewSize[1]], resolution));
    tilesCoordinates.push(this[_tileGrid].getTileCoordForCoordAndResolution
      ([viewSize[0], viewSize[3]], resolution));
    tilesCoordinates.push(this[_tileGrid].getTileCoordForCoordAndResolution
      ([viewSize[2], viewSize[1]], resolution));
    tilesCoordinates.push(this[_tileGrid].getTileCoordForCoordAndResolution
      ([viewSize[2], viewSize[3]], resolution));

    const tileCoordXRange = {
      min : Number.MAX_SAFE_INTEGER,
      max : Number.MIN_SAFE_INTEGER
    };
    const tileCoordYRange = {
      min : Number.MAX_SAFE_INTEGER,
      max : Number.MIN_SAFE_INTEGER
    };
    for (let i = 0; i < tilesCoordinates.length; i++) {
      // X coordinates
      if (tilesCoordinates[i][2] < tileCoordXRange.min) {
        tileCoordXRange.min = tilesCoordinates[i][2];
      }
      if (tilesCoordinates[i][2] > tileCoordXRange.max) {
        tileCoordXRange.max = tilesCoordinates[i][2];
      }
      // Y coordinates
      if (tilesCoordinates[i][1] < tileCoordYRange.min) {
        tileCoordYRange.min = tilesCoordinates[i][1];
      }
      if (tilesCoordinates[i][1] > tileCoordYRange.max) {
        tileCoordYRange.max = tilesCoordinates[i][1];
      }
    }

    return [tileCoordXRange, tileCoordYRange, zoomLevel]; 
  }

  /** Gets the channel visualization/presentation parameters given an id
   * @param {string} opticalPathID - opticalPath of the channel
   * @return {object} BlendingInformation
   */
  getBlendingInformation(opticalPathID) {
    const channel = this.getOpticalPath(opticalPathID)
    return channel.getBlendingInformation();
  }

  /** Adds the channel to the OpenLayer Map given an id
   * @param {string} opticalPathID - opticalPath of the channel
   */
  activateOpticalPath(opticalPathID) {
    const channel = this.getOpticalPath(opticalPathID)
    if (this._isOpticalPathActive(channel)) {
      throw new Error('OpticalPath ' + opticalPathIdentifier + ' already activated');
    }

    // _drawingLayer has to be the last layer 
    this[_map].removeLayer(this[_drawingLayer])
    this[_map].addLayer(channel.tileLayer)
    this[_map].addLayer(this[_drawingLayer])
  }

  /** Removes the channel to the OpenLayer Map given an id
   * @param {string} opticalPathID - opticalPath of the channel
   */
  deactivateOpticalPath(opticalPathID) {
    const channel = this.getOpticalPath(opticalPathID)
    if (!this._isOpticalPathActive(channel)) {
      throw new Error('OpticalPath ' + opticalPathIdentifier + ' already deactivated');
    }

    this[_map].removeLayer(channel.tileLayer)
  }

  /** Set the visibility of the channel to true
   * @param {string} opticalPathID - opticalPath of the channel
   */
  showOpticalPath(opticalPathID) {
    const blendingInformation = {
      visible : true,
      opticalPathID : opticalPathID,
    };
    this.setBlendingInformation(blendingInformation);
  }

  /** Set the visibility of the channel to false
   * @param {string} opticalPathID - opticalPath of the channel
   */
  hideOpticalPath(opticalPathID) {
    const blendingInformation = {
      visible : false,
      opticalPathID : opticalPathID,
    };
    this.setBlendingInformation(blendingInformation);
  }

  /** Returns if the channel is being rendered
   * @param {object} channel
   * @return {boolean} visible
   */
  _isOpticalPathActive(channel) {
    if (channel === null) {
      return false;
    }

    return this[_map].getLayers().getArray().find(layer => layer === channel.tileLayer) ? true : false;
  }

  /** Resizes the viewer to fit the viewport. */
  resize() {
    this[_map].updateSize();
  }

  /** Gets the size of the viewport.
   *
   * @return {number[]}
   */
  get size() {
    return this[_map].getSize();
  }

  /** Renders the images in the specified viewport container.
   * @param {object} options - Rendering options.
   * @param {(string|HTMLElement)} options.container - HTML Element in which the viewer should be injected.
   */
  render(options) {
    if (!('container' in options)) {
      console.error('container must be provided for rendering images')
    }
    this[_map].setTarget(options.container);

    // Style scale element (overriding default Openlayers CSS "ol-scale-line")
    let scaleElement = this[_controls]['scale'].element;
    scaleElement.style.position = 'absolute';
    scaleElement.style.right = '.5em';
    scaleElement.style.bottom = '.5em';
    scaleElement.style.left = 'auto';
    scaleElement.style.padding = '2px';
    scaleElement.style.backgroundColor = 'rgba(255,255,255,.5)';
    scaleElement.style.borderRadius = '4px';
    scaleElement.style.margin = '1px';

    let scaleInnerElement = this[_controls]['scale'].innerElement_;
    scaleInnerElement.style.color = 'black';
    scaleInnerElement.style.fontWeight = '600';
    scaleInnerElement.style.fontSize = '10px';
    scaleInnerElement.style.textAlign = 'center';
    scaleInnerElement.style.borderWidth = '1.5px';
    scaleInnerElement.style.borderStyle = 'solid';
    scaleInnerElement.style.borderTop = 'none';
    scaleInnerElement.style.borderRightColor = 'black';
    scaleInnerElement.style.borderLeftColor = 'black';
    scaleInnerElement.style.borderBottomColor = 'black';
    scaleInnerElement.style.margin = '1px';
    scaleInnerElement.style.willChange = 'contents,width';

    const container = this[_map].getTargetElement();

    this[_drawingSource].on(VectorEventType.ADDFEATURE, (e) => {
      publish(container, EVENT.ROI_ADDED, _getROIFromFeature(e.feature, this[_pyramidMetadata]));
    });

    this[_drawingSource].on(VectorEventType.CHANGEFEATURE, (e) => {
      if (e.feature !== undefined || e.feature !== null) {
        const geometry = e.feature.getGeometry();
        const type = geometry.getType();
        // The first and last point of a polygon must be identical. The last point
        // is an implmentation detail and is hidden from the user in the graphical
        // interface. However, we must update the last point in case the first
        // piont has been modified by the user.
        if (type === 'Polygon') {
          // NOTE: Polyon in GeoJSON format contains an array of geometries,
          // where the first element represents the coordinates of the outer ring
          // and the second element represents the coordinates of the inner ring
          // (in our case the inner ring should not be present).
          const layout = geometry.getLayout();
          const coordinates = geometry.getCoordinates();
          const firstPoint = coordinates[0][0];
          const lastPoint = coordinates[0][coordinates[0].length - 1];
          if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
            coordinates[0][coordinates[0].length - 1] = firstPoint;
            geometry.setCoordinates(coordinates, layout);
            e.feature.setGeometry(geometry);
          }
        }
      }
      publish(container, EVENT.ROI_MODIFIED, _getROIFromFeature(e.feature, this[_pyramidMetadata]));
    });

    this[_drawingSource].on(VectorEventType.REMOVEFEATURE, (e) => {
      publish(container, EVENT.ROI_REMOVED, _getROIFromFeature(e.feature, this[_pyramidMetadata]));
    });
  }

  /** Activates the draw interaction for graphic annotation of regions of interest.
   * @param {object} options - Drawing options
   * @param {string} options.geometryType - Name of the geometry type (point, circle, box, polygon, freehandPolygon, line, freehandLine)
   * @param {object} options.strokeStyle - Style of the geometry stroke (keys: "color", "width")
   * @param {object} options.fillStyle - Style of the geometry body (keys: "color")
   */
  activateDrawInteraction(options) {
    this.deactivateDrawInteraction();
    console.info('activate "draw" interaction')

    const customOptionsMapping = {
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
        geometryFunction: createRegularPolygon(4),
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
      },
      freehandline: {
        type: 'LineString',
        geometryName: 'FreeHandLine',
        freehand: true,
      },
    };
    if (!('geometryType' in options)) {
      console.error('geometry type must be specified for drawing interaction')
    }
    if (!(options.geometryType in customOptionsMapping)) {
      console.error(`unsupported geometry type "${options.geometryType}"`)
    }

    const defaultDrawOptions = { source: this[_drawingSource] };
    const customDrawOptions = customOptionsMapping[options.geometryType];
    const allDrawOptions = Object.assign(defaultDrawOptions, customDrawOptions);
    this[_interactions].draw = new Draw(allDrawOptions);

    const container = this[_map].getTargetElement();

    //attaching openlayers events handling
    this[_interactions].draw.on('drawend', (e) => {
      e.feature.setId(generateUID());
      publish(container, EVENT.ROI_DRAWN, _getROIFromFeature(e.feature, this[_pyramidMetadata]));
    });

    this[_map].addInteraction(this[_interactions].draw);

  }

  /** Deactivates draw interaction. */
  deactivateDrawInteraction() {
    console.info('deactivate "draw" interaction')
    if (this[_interactions].draw !== undefined) {
      this[_map].removeInteraction(this[_interactions].draw);
      this[_interactions].draw = undefined;
    }
  }

  /** Whether draw interaction is active
   *
   * @return {boolean}
   */
  get isDrawInteractionActive() {
    return this[_interactions].draw !== undefined;
  }

  /* Activates select interaction.
   *
   * @param {object} options - Selection options.
   */
  activateSelectInteraction(options = {}) {
    this.deactivateSelectInteraction();
    console.info('activate "select" interaction')
    this[_interactions].select = new Select({
      layers: [this[_drawingLayer]]
    });

    const container = this[_map].getTargetElement();

    this[_interactions].select.on('select', (e) => {
      publish(container, EVENT.ROI_SELECTED, _getROIFromFeature(e.selected[0], this[_pyramidMetadata]));
    });

    this[_map].addInteraction(this[_interactions].select);
  }

  /** Deactivates select interaction. */
  deactivateSelectInteraction() {
    console.info('deactivate "select" interaction')
    if (this[_interactions].select) {
      this[_map].removeInteraction(this[_interactions].select);
      this[_interactions].select = undefined;
    }
  }

  /** Whether select interaction is active.
   *
   * @return {boolean}
   */
  get isSelectInteractionActive() {
    return this[_interactions].select !== undefined;
  }

  /** Activates modify interaction.
   *
   * @param {object} options - Modification options.
   */
  activateModifyInteraction(options = {}) {
    this.deactivateModifyInteraction();
    console.info('activate "modify" interaction')
    this[_interactions].modify = new Modify({
      features: this[_features],  // TODO: or source, i.e. "drawings"???
    });
    this[_map].addInteraction(this[_interactions].modify);
  }

  /** Deactivates modify interaction. */
  deactivateModifyInteraction() {
    console.info('deactivate "modify" interaction')
    if (this[_interactions].modify) {
      this[_map].removeInteraction(this[_interactions].modify);
      this[_interactions].modify = undefined;
    }
  }

  /** Whether modify interaction is active.
   *
   * @return {boolean}
   */
  get isModifyInteractionActive() {
    return this[_interactions].modify !== undefined;
  }

  /** Gets all annotated regions of interest.
   *
   * @returns {ROI[]} Array of regions of interest.
   */
  getAllROIs() {
    console.info('get all ROIs')
    let rois = [];
    this[_features].forEach((item) => {
      rois.push(this.getROI(item.getId()));
    });
    return rois;
  }

  /** Number of annotated regions of interest.
   *
   * @return {number}
   */
  get numberOfROIs() {
    return this[_features].getLength();
  }

  /** Gets an individual annotated regions of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @returns {ROI} Regions of interest.
   */
  getROI(uid) {
    console.info(`get ROI ${uid}`)
    const feature = this[_drawingSource].getFeatureById(uid);
    return _getROIFromFeature(feature, this[_pyramidMetadata]);
  }

  /** Adds a measurement to a region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @param {object} item - NUM content item representing a measurement
   */
  addROIMeasurement(uid, item) {
    const meaning = item.ConceptNameCodeSequence[0].CodeMeaning
    console.info(`add measurement "${meaning}" to ROI ${uid}`)
    this[_features].forEach(feature => {
      const id = feature.getId();
      if (id === uid) {
        const properties = feature.getProperties();
        if (!('measurements' in properties)) {
          properties['measurements'] = [item]
        } else {
          properties['measurements'].push(item);
        }
        feature.setProperties(properties, true);
      }
    })
  }

  /** Adds a qualitative evaluation to a region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @param {object} item - CODE content item representing a qualitative evaluation
   */
  addROIEvaluation(uid, item) {
    const meaning = item.ConceptNameCodeSequence[0].CodeMeaning
    console.info(`add qualitative evaluation "${meaning}" to ROI ${uid}`)
    this[_features].forEach(feature => {
      const id = feature.getId();
      if (id === uid) {
        const properties = feature.getProperties();
        if (!('evaluations' in properties)) {
          properties['evaluations'] = [item]
        } else {
          properties['evaluations'].push(item);
        }
        feature.setProperties(properties, true);
      }
    })
  }

  /** Pops the most recently annotated regions of interest.
   *
   * @returns {ROI} Regions of interest.
   */
  popROI() {
    console.info('pop ROI')
    const feature = this[_features].pop();
    return _getROIFromFeature(feature, this[_pyramidMetadata]);
  }

  /** Adds a regions of interest.
   *
   * @param {ROI} item - Regions of interest
   * @param {object} styleOptions - Style options
   * @param {object} styleOptions.stroke - Style options for the outline of the geometry
   * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
   * @param {number} styleOptions.stroke.width - Width of the outline
   * @param {object} styleOptions.fill - Style options for body the geometry
   * @param {number[]} styleOptions.fill.color - RGBA color of the body
   *
   */
  addROI(item, styleOptions) {
    console.info(`add ROI ${item.uid}`)
    const geometry = _scoord3d2Geometry(item.scoord3d, this[_pyramidMetadata]);
    const feature = new Feature(geometry);
    feature.setProperties(item.properties, true);
    feature.setId(item.uid);
    _setFeatureStyle(feature, styleOptions)
    this[_features].push(feature);
  }

  /** Sets the style of a region of interest.
   *
   * @param {string} uid - Unique identifier of the regions of interest
   * @param {object} styleOptions - Style options
   * @param {object} styleOptions.stroke - Style options for the outline of the geometry
   * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
   * @param {number} styleOptions.stroke.width - Width of the outline
   * @param {object} styleOptions.fill - Style options for body the geometry
   * @param {number[]} styleOptions.fill.color - RGBA color of the body
   *
   */
  setROIStyle(uid, styleOptions) {
    this[_features].forEach(feature => {
      const id = feature.getId();
      if (id === uid) {
        _setFeatureStyle(feature, styleOptions)
      }
    })
  }

  /** Adds a new viewport overlay.
   *
   * @param {object} options Overlay options
   * @param {object} options.element The custom overlay html element
   * @param {object} options.className Class to style the OpenLayer's overlay container
   */
  addViewportOverlay({ element, className }) {
    this[_map].addOverlay(new Overlay({ element, className }));
  }

  /** Removes an individual regions of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   */
  removeROI(uid) {
    console.info(`remove ROI ${uid}`)
    const feature = this[_drawingSource].getFeatureById(uid);
    this[_features].remove(feature);
  }

  /** Removes all annotated regions of interest. */
  removeAllROIs() {
    console.info('remove all ROIs')
    this[_features].clear();
  }

  /** Hides annotated regions of interest such that they are no longer
   *  visible on the viewport.
   */
  hideROIs() {
    console.info('hide ROIs')
    this[_drawingLayer].setVisible(false);
  }

  /** Shows annotated regions of interest such that they become visible
   *  on the viewport ontop of the images.
   */
  showROIs() {
    console.info('show ROIs')
    this[_drawingLayer].setVisible(true);
  }

  /** Whether annotated regions of interest are currently visible.
   *
   * @return {boolean}
   */
  get areROIsVisible() {
    return this[_drawingLayer].getVisible();
  }

  /** DICOM metadata for each VL Whole Slide Microscopy Image instance.
   *
   * @return {VLWholeSlideMicroscopyImage[]}
   */
  get imageMetadata() {
    return this[_pyramidMetadata];
  }

}


/** Static viewer for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type other than VOLUME.
 *
 * @class
 * @private
 */
class _NonVolumeImageViewer {

  /** Creates a viewer instance for displaying non-VOLUME images.
   *
   * @param {object} options
   * @param {object} options.client - A DICOMwebClient instance for interacting with an origin server over HTTP.
   * @param {object} options.metadata - DICOM JSON metadata object for a VL Whole Slide Microscopy Image instance.
   * @param {string} options.orientation - Orientation of the slide (vertical: label on top, or horizontal: label on right side).
   * @param {number} [options.resizeFactor=1] - To which extent image should be reduced in size (fraction).
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile should be included for correction of image colors.
   */
  constructor(options) {
    this[_metadata] = new VLWholeSlideMicroscopyImage({
      metadata: options.metadata
    });
    if (this[_metadata].ImageType[2] === 'VOLUME') {
      throw new Error('Viewer cannot render images of type VOLUME.')
    }

    const resizeFactor = options.resizeFactor ? options.resizeFactor : 1;
    const height = this[_metadata].TotalPixelMatrixRows * resizeFactor;
    const width = this[_metadata].TotalPixelMatrixColumns * resizeFactor;
    const extent = [
      0,              // min X
      -(height + 1),  // min Y
      width,          // max X
      -1              // max Y
    ];

    const imageLoadFunction = (image, src) => {
      console.info('load image')
      const studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(src);
      const seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(src);
      const sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(src);
      const mediaType = 'image/png';
      const queryParams = {
        viewport: [
          this[_metadata].TotalPixelMatrixRows,
          this[_metadata].TotalPixelMatrixColumns
        ].join(',')
      };
      // We make this optional because a) not all archives currently support
      // this query parameter and b) because ICC Profiles can be large and
      // their inclusion can result in significant overhead.
      if (options.includeIccProfile) {
        queryParams['iccprofile'] = 'yes';
      }
      const retrieveOptions = {
        studyInstanceUID: this[_metadata].StudyInstanceUID,
        seriesInstanceUID: this[_metadata].SeriesInstanceUID,
        sopInstanceUID: this[_metadata].SOPInstanceUID,
        mediaTypes: [{ mediaType }],
        queryParams: queryParams
      };
      options.client.retrieveInstanceRendered(retrieveOptions).then((thumbnail) => {
        const blob = new Blob([thumbnail], { type: mediaType });
        image.getImage().src = window.URL.createObjectURL(blob);
      });
    }

    const projection = new Projection({
      code: 'DICOM',
      units: 'metric',
      extent: extent,
      getPointResolution: (pixelRes, point) => {
        /** DICOM Pixel Spacing has millimeter unit while the projection has
         * has meter unit.
         */
        const mmSpacing = _getPixelSpacing(this[_metadata])[0];
        const spacing = (mmSpacing / resizeFactor) / 10 ** 3;
        return pixelRes * spacing;
      }
    });

    const rasterSource = new Static({
      crossOrigin: 'Anonymous',
      imageExtent: extent,
      projection: projection,
      imageLoadFunction: imageLoadFunction,
      url: ''  // will be set by imageLoadFunction()
    });

    this[_imageLayer] = new ImageLayer({
      source: rasterSource,
    });

    // The default rotation is 'horizontal' with the slide label on the right
    var rotation = _getRotation(this[_metadata]);
    if (options.orientation === 'vertical') {
      // Rotate counterclockwise by 90 degrees to have slide label at the top
      rotation -= 90 * (Math.PI / 180);
    }

    const view = new View({
      center: getCenter(extent),
      rotation: rotation,
      projection: projection
    });

    // Creates the map with the defined layers and view and renders it.
    this[_map] = new Map({
      layers: [this[_imageLayer]],
      view: view,
      controls: [],
      keyboardEventTarget: document,
    });
    this[_map].getView().fit(extent);
  }

  /** Renders the image in the specified viewport container.
   * @param {object} options - Rendering options.
   * @param {(string|HTMLElement)} options.container - HTML Element in which the viewer should be injected.
   */
  render(options) {
    if (!('container' in options)) {
      console.error('container must be provided for rendering images')
    }
    this[_map].setTarget(options.container);

    this[_map].getInteractions().forEach(interaction => {
      this[_map].removeInteraction(interaction);
    });
  }

  /** DICOM metadata for the displayed VL Whole Slide Microscopy Image instance.
   *
   * @return {VLWholeSlideMicroscopyImage}
   */
  get imageMetadata() {
    return this[_metadata];
  }

  /** Resizes the viewer to fit the viewport. */
  resize() {
    this[_map].updateSize();
  }

  /** Gets the size of the viewport.
   *
   * @return {number[]}
   */
  get size() {
    return this[_map].getSize();
  }

}

/** Static viewer for DICOM VL Whole Slide Microscopy Image instances
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
  constructor(options) {
    if (options.orientation === undefined) {
      options.orientation = 'horizontal';
    }
    super(options)
  }
}

/** Static viewer for DICOM VL Whole Slide Microscopy Image instances
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
  constructor(options) {
    if (options.orientation === undefined) {
      options.orientation = 'vertical';
    }
    super(options)
  }
}

export { LabelImageViewer, OverviewImageViewer, VolumeImageViewer };
