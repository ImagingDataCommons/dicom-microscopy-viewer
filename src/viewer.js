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
  arraysEqual,
} from './utils.js';
import {
  Point,
  Multipoint,
  Polyline,
  Polygon,
  Ellipsoid,
  Ellipse
} from './scoord3d.js';

import * as DICOMwebClient from 'dicomweb-client';
import { colorImageFrames } from './colorImageFrames.js';

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
const _rotation = Symbol('rotation');
const _projection = Symbol('projection');
const _tileGrid = Symbol('tileGrid');
const _referenceOrigins = Symbol('referenceOrigins');
const _referenceResolutions = Symbol('referenceResolutions');
const _referenceGridSizes = Symbol('referenceGridSizes');
const _referenceTileSizes = Symbol('referenceTileSizes');
const _referencePixelSpacings = Symbol('referencePixelSpacings');

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
   * @param {object} options.client - A DICOMwebClient instance for interacting with an origin server over HTTP.
   * @param {object[]} options.instancesMetadata - An array of DICOM JSON metadata objects, 
   *        the array is full dicom metadata (all the instances) and the Library has to take care of determining which
   *        instances represent channels (optical paths) or focal planes and internally build a lookup table upon Library object construction
   * @param {object[]} options.channelInit - An array containing channels with the standard visualization parameters already setup by an external APPs 
   * @param {string[]} [options.controls=[]] - Names of viewer control elements that should be included in the viewport.
   * @param {boolean} [options.retrieveRendered=true] - Whether image frames should be retrieved via DICOMweb prerendered by the server.
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile should be included for correction of image colors.
   * @param {boolean} [options.useWebGL=true] - Whether WebGL renderer should be used.
   */
  constructor(options) {
    // TO DO: implement API to select focal plane in the case of 3D channels (channels with a bandwith)
    // TO DO: convert to typescript (e.g. channel should be a typescript interface)
    // TO DO: use DICOM attributes for loading/saving the channel parameters (i.e. load/save the 'state' in DICOM), for example:
      /*[x] Select area for display: http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.10.4.html 
        [x] Clipping pixel values: http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.11.33.html#table_C.11.33.1-1 
        [x] Select channels for display and specify the color of each channel: http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.11.34.html
        [x] Blending of images: http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.11.34.html http://dicom.nema.org/medical/dicom/current/output/chtml/part04/sect_N.2.6.html
      */
    // NOTE: channel coloring is allowed only for monochorme channels (i.e SamplesPerPixel === 1).
  
    if ('useWebGL' in options) {
      this[_usewebgl] = options.useWebGL;
    } else {
      this[_usewebgl] = true;
    }
    this[_client] = options.client;

    if (!('retrieveRendered' in options)) {
      options.retrieveRendered = true;
    }

    if (!('controls' in options)) {
      options.controls = [];
    }
    options.controls = new Set(options.controls);

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
      [1,0,0],
      [0,1,0],
      [0,0,1],
      [0.5, 0.5, 0],
      [0.5, 0, 0.5],
      [0, 0.5, 0.5],
    ] // TO DO: add more/better colors

    for (let i = 0; i < options.instancesMetadata.length; ++i) {
      if (options.instancesMetadata[i] === undefined) {
        continue;
      }
      let dimensionOrganizationType = 'TILED_FULL';
      // if dimensionOrganizationType metadata in undefined, assuming TILED_FULL
      if (options.instancesMetadata[i]["00209311"] !== undefined) {
        dimensionOrganizationType = options.instancesMetadata[i]["00209311"]["Value"][0];
      }
      if (dimensionOrganizationType === '3D' || dimensionOrganizationType === '3D_TEMPORAL') {
        // 3D data
        // TO DO: get some example data.
        console.warn('Volume Image Viewer does hot hanlde 3D data yet.')
        continue;
      } else if (dimensionOrganizationType === 'TILED_FULL') {
        let totalPixelMatrixFocalPlanes = 1 ;
        // if totalPixelMatrixFocalPlanes metadata in undefined, assuming 1
        if (options.instancesMetadata[i]["00480303"] !== undefined) {
          totalPixelMatrixFocalPlanes = options.instancesMetadata[i]["00480303"]["Value"][0];
        }
        if (totalPixelMatrixFocalPlanes !== 1) {
          continue;
        } else {
          const opticalPathIdentifier = options.instancesMetadata[i]["00480105"]["Value"][0]["00480106"]["Value"][0];
          let channel = this[_channels].find(channel => channel.opticalPathIdentifier === opticalPathIdentifier);
          if (channel) {
            channel.metadata.push(options.instancesMetadata[i])        
          } else {
            const newChannel = {
              opticalPathIdentifier: `${opticalPathIdentifier}`, 
              metadata: [options.instancesMetadata[i]],
            };
    
            const channelInit = options.channelInit !== undefined ? options.channelInit.find(channelInit => channelInit.opticalPathIdentifier === opticalPathIdentifier) : undefined;
            if (channelInit) {
              newChannel.color = [...channelInit.color];
              newChannel.opacity = channelInit.opacity;
              newChannel.contrastLimitsRange = [...channelInit.contrastLimitsRange];
              newChannel.visible = channelInit.visible;
            } else {
              newChannel.color = [...colors[i % colors.length]];
              newChannel.opacity = 1.0;
              newChannel.contrastLimitsRange = [0, 256];
              newChannel.visible = true;
            }
    
            this[_channels].push(newChannel)
          }
        }
      } else if (dimensionOrganizationType === 'TILED_SPARSE') {
        // the spatial location of each tile is explicitly encoded using information 
        // in the Per-Frame Functional Group Sequence, and the recipient shall not 
        // make any assumption about the spatial position or optical path or order of the encoded frames.
        // TO DO: get some example data.
        console.warn('Volume Image Viewer does hot hanlde TILED_SPARSE data yet.')
        continue;  
      }
    }

    // For blending we have to make some assumptions 
    // 1) all channels should have the same origins, resolutions, grid sizes, tile sizes and pixel spacings (i.e. same TileGrid).
    //    These are arrays with number of element equal to nlevel (levels of the pyramid). All channels should have the same nlevel value.
    // 2) given (1), we calculcate the tileGrid, projection and rotation objects using the metadata of the first channel and use them for all the channels.
    // 3) If the parameters in (1) are different, it means that we have to perfom regridding/reprojection over the data (i.e. registration).
    //    This, at the moment, is out of scope. 
    this._initUniqueOpenLayerObjects();

    // For each channel we build up the OpenLayer objects. 
    this[_channels].forEach((channel) => {  
      /*
      * To visualize images accross multiple scales, we first need to
      * determine the image pyramid structure, i.e. the size and resolution
      * images at the different pyramid levels.
      */
      channel.microscopyImages = [];
      channel.metadata.forEach(m => {
        const image = new VLWholeSlideMicroscopyImage({ metadata: m });
        if (image.ImageType[2] === 'VOLUME') {
          channel.microscopyImages.push(image);
        }
      });
      if (channel.microscopyImages.length === 0) {
        throw new Error('No VOLUME image provided.')
      }
      // Sort instances and optionally concatenation parts if present.
      channel.microscopyImages.sort((a, b) => {
        const sizeDiff = a.TotalPixelMatrixColumns - b.TotalPixelMatrixColumns;
        if (sizeDiff === 0) {
          if (a.ConcatenationFrameOffsetNumber !== undefined) {
            return a.ConcatenationFrameOffsetNumber - b.ConcatenationFrameOffsetNumber;
          }
          return sizeDiff;
        }
        return sizeDiff;
      });

      channel.pyramidMetadata = [];
      channel.pyramidFrameMappings = [];
      let frameMappings = channel.microscopyImages.map(m => getFrameMapping(m));
      for (let i = 0; i < channel.microscopyImages.length; i++) {
        const cols = channel.microscopyImages[i].TotalPixelMatrixColumns;
        const rows = channel.microscopyImages[i].TotalPixelMatrixRows;
        const numberOfFrames = channel.microscopyImages[i].NumberOfFrames;
        /*
         * Instances may be broken down into multiple concatentation parts.
         * Therefore, we have to re-assemble instance metadata.
        */
        let alreadyExists = false;
        let index = null;
        for (let j = 0; j < channel.pyramidMetadata.length; j++) {
          if (
            (channel.pyramidMetadata[j].TotalPixelMatrixColumns === cols) &&
            (channel.pyramidMetadata[j].TotalPixelMatrixRows === rows)
          ) {
            alreadyExists = true;
            index = j;
          }
        }
        if (alreadyExists) {
          // Update with information obtained from current concatentation part.
          Object.assign(channel.pyramidFrameMappings[index], frameMappings[i]);
          channel.pyramidMetadata[index].NumberOfFrames += numberOfFrames;
          if ("PerFrameFunctionalGroupsSequence" in channel.microscopyImages[index]) {
            channel.pyramidMetadata[index].PerFrameFunctionalGroupsSequence.push(
              ...channel.microscopyImages[i].PerFrameFunctionalGroupsSequence
            );
          }
          if (!"SOPInstanceUIDOfConcatenationSource" in channel.microscopyImages[i]) {
            throw new Error(
              'Attribute "SOPInstanceUIDOfConcatenationSource" is required ' +
              'for concatenation parts.'
            );
          }
          const sopInstanceUID = channel.microscopyImages[i].SOPInstanceUIDOfConcatenationSource;
          channel.pyramidMetadata[index].SOPInstanceUID = sopInstanceUID;
          delete channel.pyramidMetadata[index].SOPInstanceUIDOfConcatenationSource;
          delete channel.pyramidMetadata[index].ConcatenationUID;
          delete channel.pyramidMetadata[index].InConcatenationNumber;
          delete channel.pyramidMetadata[index].ConcatenationFrameOffsetNumber;
        } else {
          channel.pyramidMetadata.push(channel.microscopyImages[i]);
          channel.pyramidFrameMappings.push(frameMappings[i]);
        }
      }
      const nLevels = channel.pyramidMetadata.length;
      if (nLevels === 0) {
        console.error('empty pyramid - no levels found')
      }
      channel.pyramidBaseMetadata = channel.pyramidMetadata[nLevels - 1];

      /*
       * Collect relevant information from DICOM metadata for each pyramid
       * level to construct the Openlayers map.
      */
      const channelTileSizes = [];
      const channelGridSizes = [];
      const channelResolutions = [];
      const channelOrigins = [];
      const channelPixelSpacings = [];
      const offset = [0, -1];
      const basePixelSpacing = _getPixelSpacing(channel.pyramidBaseMetadata);
      const baseTotalPixelMatrixColumns = channel.pyramidBaseMetadata.TotalPixelMatrixColumns;
      const baseTotalPixelMatrixRows = channel.pyramidBaseMetadata.TotalPixelMatrixRows;
      const baseColumns = channel.pyramidBaseMetadata.Columns;
      const baseRows = channel.pyramidBaseMetadata.Rows;
      const baseNColumns = Math.ceil(baseTotalPixelMatrixColumns / baseColumns);
      const baseNRows = Math.ceil(baseTotalPixelMatrixRows / baseRows);
      for (let j = (nLevels - 1); j >= 0; j--) {
        const columns = channel.pyramidMetadata[j].Columns;
        const rows = channel.pyramidMetadata[j].Rows;
        const totalPixelMatrixColumns = channel.pyramidMetadata[j].TotalPixelMatrixColumns;
        const totalPixelMatrixRows = channel.pyramidMetadata[j].TotalPixelMatrixRows;
        const pixelSpacing = _getPixelSpacing(channel.pyramidMetadata[j]);
        const nColumns = Math.ceil(totalPixelMatrixColumns / columns);
        const nRows = Math.ceil(totalPixelMatrixRows / rows);
        channelTileSizes.push([
          columns,
          rows,
        ]);
        channelGridSizes.push([
          nColumns,
          nRows,
        ]);
        channelPixelSpacings.push(pixelSpacing);
       /*
         * Compute the resolution at each pyramid level, since the zoom
         * factor may not be the same between adjacent pyramid levels.
        */
        let zoomFactor = baseTotalPixelMatrixColumns / totalPixelMatrixColumns;
        channelResolutions.push(zoomFactor);
       /*
         * TODO: One may have to adjust the offset slightly due to the
         * difference between extent of the image at a given resolution level
         * and the actual number of tiles (frames).
        */
       channelOrigins.push(offset);
      }
      channelResolutions.reverse();
      channelTileSizes.reverse();
      channelGridSizes.reverse();
      channelOrigins.reverse();
      channelPixelSpacings.reverse();

      // Check that all the channels have the same pyramid parameters
      const channelExtent = [
        0,                                // min X
        -(baseTotalPixelMatrixRows + 1),  // min Y
        baseTotalPixelMatrixColumns,      // max X
        -1                                // max Y
      ];
      const referenceExtent = this[_tileGrid].getExtent();
      if (arraysEqual(channelExtent, referenceExtent) === false) {
        throw new Error(
          'Channels have different extent'
        );
      }
      if (arraysEqual(channelOrigins, this[_referenceOrigins]) === false) {
        throw new Error(
          'Channels have different origins'
        );
      }
      if (arraysEqual(channelResolutions, this[_referenceResolutions]) === false) {
        throw new Error(
          'Channels have different resolutions'
        );
      }
      if (arraysEqual(channelGridSizes, this[_referenceGridSizes]) === false) {
        throw new Error(
          'Channels have different grid sizes'
        );
      }
      if (arraysEqual(channelTileSizes, this[_referenceTileSizes]) === false) {
        throw new Error(
          'Channels have different tile sizes'
        );
      }
      if (arraysEqual(channelPixelSpacings, this[_referencePixelSpacings]) === false) {
        throw new Error(
          'Channels have different pixel spacings'
        );
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
        const index = x + "-" + y;

        const path = channel.pyramidFrameMappings[z][index];
        if (path === undefined) {
          console.warn("tile " + index + " not found at level " + z);
          return (null);
        }
        let url = options.client.wadoURL +
          "/studies/" + channel.pyramidMetadata[z].StudyInstanceUID +
          "/series/" + channel.pyramidMetadata[z].SeriesInstanceUID +
          '/instances/' + path;
        if (options.retrieveRendered) {
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

        const z = tile.tileCoord[0];
        const columns = channel.pyramidMetadata[z].Columns;
        const rows = channel.pyramidMetadata[z].Rows;
        const samplesPerPixel = channel.pyramidMetadata[z].SamplesPerPixel; // number of colors for pixel
        const BitsAllocated = channel.pyramidMetadata[z].BitsAllocated; // memory for pixel
        const PixelRepresentation = channel.pyramidMetadata[z].PixelRepresentation; // 0 unsigned, 1 signed

        const { contrastLimitsRange, color, opacity, rasterSource } = channel;

        if (src !== null) {
          const studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(src);
          const seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(src);
          const sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(src);
          const frameNumbers = DICOMwebClient.utils.getFrameNumbersFromUri(src);
        
          if (options.retrieveRendered) {
            // Figure out from the metadata if this is a color image dataset
            // if it is, use png mediatype and png transfer syntax to just get pngs
            // Otherwise, get the data as an octet-stream and use that
            // TO DO: should we get always png and decompress for monochorme channels (i.e. samplesPerPixel === 1)?
            // https://github.com/cornerstonejs/codecs
  
            let mediaType = 'application/octet-stream';
            let transferSyntaxUID = '1.2.840.10008.1.2.1';
            if (samplesPerPixel !== 1) {
              mediaType = 'image/png';
              transferSyntaxUID = '';
            }
            const retrieveOptions = {
              studyInstanceUID,
              seriesInstanceUID,
              sopInstanceUID,
              frameNumbers,
              mediaTypes: [
                { mediaType, transferSyntaxUID }
              ]
            };
            if (options.includeIccProfile) {
              retrieveOptions['queryParams'] = {
                iccprofile: 'yes'
              }
            }
            if (samplesPerPixel === 1) {
              options.client.retrieveInstanceFrames(retrieveOptions).then(
                (rawFrames) => {
                  let pixelData;
                  switch (BitsAllocated) {
                    case 8:
                      if (PixelRepresentation === 1) {
                        pixelData = new Int8Array(rawFrames[0])
                      } else {
                        pixelData = new Uint8Array(rawFrames[0])
                      }
                      break;
                    case 16:
                      if (PixelRepresentation === 1) {
                        pixelData = new Int16Array(rawFrames[0])
                      } else {
                        pixelData = new Uint16Array(rawFrames[0])
                      }
                      break;
                    default:
                      throw new Error(
                        'bit not supported'
                      );
                  }
                  const frameData = {
                    pixelData,
                    contrastLimitsRange,
                    BitsAllocated,
                    color,
                    opacity,
                    width: columns,
                    height: rows
                  };
                  img.src = colorImageFrames(frameData, 'image/jpeg', options.blendingImageQuality);
                }
              );
            } else {
              options.client.retrieveInstanceFramesRendered(retrieveOptions).then(
                (renderedFrame) => {
                  const blob = new Blob([renderedFrame], {type: mediaType});
                  img.src = window.URL.createObjectURL(blob);
                }
              );
            }
          } else {
            // TODO: support "image/jp2" and "image/jls"
  
            // Figure out from the metadata if this is a color image dataset
            // if it is, use jpeg mediatype and jpeg transfer syntax to just get jpegs
            // Otherwise, get the data as an octet-stream and use that
            // TO DO: should we get always jpeg and decompress for monochorme channels (i.e. samplesPerPixel === 1)?
            // https://github.com/cornerstonejs/codecs
            let mediaType = 'application/octet-stream';
            let transferSyntaxUID = '1.2.840.10008.1.2.1';
            if (samplesPerPixel !== 1) {
              mediaType = 'image/jpeg';
              transferSyntaxUID = '1.2.840.10008.1.2.4.50';
            }
            const retrieveOptions = {
              studyInstanceUID,
              seriesInstanceUID,
              sopInstanceUID,
              frameNumbers,
              mediaTypes: [
                { mediaType, transferSyntaxUID }
              ]
            };
            options.client.retrieveInstanceFrames(retrieveOptions).then(
              (rawFrames) => {
                if (samplesPerPixel === 1) {
                  let pixelData;
                  switch (BitsAllocated) {
                    case 8:
                      if (PixelRepresentation === 1) {
                        pixelData = new Int8Array(rawFrames[0])
                      } else {
                        pixelData = new Uint8Array(rawFrames[0])
                      }
                      break;
                    case 16:
                      if (PixelRepresentation === 1) {
                        pixelData = new Int16Array(rawFrames[0])
                      } else {
                        pixelData = new Uint16Array(rawFrames[0])
                      }
                      break;
                    default:
                      throw new Error(
                        'bit not supported'
                      );
                  }
                  const frameData = {
                    pixelData,
                    contrastLimitsRange,
                    BitsAllocated,
                    color,
                    opacity,
                    width: columns,
                    height: rows
                  }; 
                  img.src = colorImageFrames(frameData, 'image/jpeg', options.blendingImageQuality);
                } else {
                  const blob = new Blob(rawFrames, {type: mediaType});
                  img.src = window.URL.createObjectURL(blob);
                }
              }
            );
          }
        } else {
          console.warn('could not load tile');
        }
      }
      
      /*
       * We use the existing TileImage source but customize it to retrieve
       * frames (load tiles) via DICOMweb WADO-RS.
      */
      channel.rasterSource = new TileImage({
        crossOrigin: 'Anonymous',
        tileGrid: this[_tileGrid],
        projection: this[_projection],
        wrapX: false
      });

      channel.rasterSource.setTileUrlFunction(tileUrlFunction);
      channel.rasterSource.setTileLoadFunction(tileLoadFunction);
  
      // Create OpenLayer renderer object
      channel.tileLayer = new TileLayer({
        extent: this[_tileGrid].getExtent(),
        source: channel.rasterSource,
        preload: 0,
        projection: this[_projection]
      });

      channel.tileLayer.setVisible(channel.visible);

      // Set the composition type for the OpenLayer renderer object
      channel.tileLayer.on('prerender', function (event) {
        event.context.globalCompositeOperation = 'lighter';
      });
      
      channel.tileLayer.on('postrender', function (event) {
        event.context.globalCompositeOperation = 'source-over';
      });
    });

    if (this[_channels].length === 0) {
      throw new Error('Viewer did not find any channel')
    }

    this[_drawingSource] = new VectorSource({
      tileGrid: this[_tileGrid],
      projection: this[_projection],
      features: this[_features],
      wrapX: false
    });

    this[_drawingLayer] = new VectorLayer({
      extent: this[_tileGrid].getExtent(),
      source: this[_drawingSource],
      projection: this[_projection],
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    });

    const view = new View({
      center: getCenter(this[_tileGrid].getExtent()),
      extent: this[_tileGrid].getExtent(),
      projection: this[_projection],
      resolutions: this[_tileGrid].getResolutions(),
      rotation: this[_rotation]
    });

    this[_interactions] = {
      draw: undefined,
      select: undefined,
      modify: undefined
    };

    this[_controls] = {
      scale: new ScaleLine({
        units: 'metric',
        className: ''
      })
    }

    const layers = [];
    if (options.channelInit !== undefined) {
      options.channelInit.forEach((item) => {
        if (item.addToMap === true) {
          const channel = this.getChannelByID(item.opticalPathIdentifier);
          if (channel) {
            layers.push(channel.tileLayer)
          }
        }
      });
    } else {
      layers.push(this[_channels][0].tileLayer)  
    }

    layers.push(this[_drawingLayer]);

    if (options.controls.has('fullscreen')) {
      this[_controls].fullscreen = new FullScreen();
    }

    if (options.controls.has('overview')) {
      const overviewTileLayer = new TileLayer({
        extent: this[_tileGrid].getExtent(),
        source: this[_channels][0].rasterSource,
        preload: 0,
        projection: this[_projection]
      });

      const overviewView = new View({
        projection: this[_projection],
        resolutions: this[_tileGrid].getResolutions(),
        rotation: this[_rotation]
      });

      this[_controls].overview = new OverviewMap({
        view: overviewView,
        layers: [overviewTileLayer],
        collapsed: false,
        collapsible: false,
      });
    }

    /** Creates the map with the defined layers and view and renders it. */
    this[_map] = new Map({
      layers,
      view: view,
      controls: [],
      keyboardEventTarget: document,
    });

    this[_map].addInteraction(new MouseWheelZoom());

    for (let control in this[_controls]) {
      this[_map].addControl(this[_controls][control]);
    }
    this[_map].getView().fit(this[_tileGrid].getExtent());
  }

  /** init unique Open Layer objects
   */
  _initUniqueOpenLayerObjects() {
    if (this[_channels].length === 0) {
      throw new Error('No channels found.')
    }

    let channel = this[_channels][0];
    channel.microscopyImages = [];
    channel.metadata.forEach(m => {
      const image = new VLWholeSlideMicroscopyImage({ metadata: m });
      if (image.ImageType[2] === 'VOLUME') {
        channel.microscopyImages.push(image);
      }
    });
    if (channel.microscopyImages.length === 0) {
      throw new Error('No VOLUME image provided.')
    }
    // Sort instances and optionally concatenation parts if present.
    channel.microscopyImages.sort((a, b) => {
      const sizeDiff = a.TotalPixelMatrixColumns - b.TotalPixelMatrixColumns;
      if (sizeDiff === 0) {
        if (a.ConcatenationFrameOffsetNumber !== undefined) {
          return a.ConcatenationFrameOffsetNumber - b.ConcatenationFrameOffsetNumber;
        }
        return sizeDiff;
      }
      return sizeDiff;
    });

    channel.pyramidMetadata = [];
    channel.pyramidFrameMappings = [];
    let frameMappings = channel.microscopyImages.map(m => getFrameMapping(m));
    for (let i = 0; i < channel.microscopyImages.length; i++) {
      const cols = channel.microscopyImages[i].TotalPixelMatrixColumns;
      const rows = channel.microscopyImages[i].TotalPixelMatrixRows;
      const numberOfFrames = channel.microscopyImages[i].NumberOfFrames;
      /*
       * Instances may be broken down into multiple concatentation parts.
       * Therefore, we have to re-assemble instance metadata.
      */
      let alreadyExists = false;
      let index = null;
      for (let j = 0; j < channel.pyramidMetadata.length; j++) {
        if (
          (channel.pyramidMetadata[j].TotalPixelMatrixColumns === cols) &&
          (channel.pyramidMetadata[j].TotalPixelMatrixRows === rows)
        ) {
          alreadyExists = true;
          index = j;
        }
      }
      if (alreadyExists) {
        // Update with information obtained from current concatentation part.
        Object.assign(channel.pyramidFrameMappings[index], frameMappings[i]);
        channel.pyramidMetadata[index].NumberOfFrames += numberOfFrames;
        if ("PerFrameFunctionalGroupsSequence" in channel.microscopyImages[index]) {
          channel.pyramidMetadata[index].PerFrameFunctionalGroupsSequence.push(
            ...channel.microscopyImages[i].PerFrameFunctionalGroupsSequence
          );
        }
        if (!"SOPInstanceUIDOfConcatenationSource" in channel.microscopyImages[i]) {
          throw new Error(
            'Attribute "SOPInstanceUIDOfConcatenationSource" is required ' +
            'for concatenation parts.'
          );
        }
        const sopInstanceUID = channel.microscopyImages[i].SOPInstanceUIDOfConcatenationSource;
        channel.pyramidMetadata[index].SOPInstanceUID = sopInstanceUID;
        delete channel.pyramidMetadata[index].SOPInstanceUIDOfConcatenationSource;
        delete channel.pyramidMetadata[index].ConcatenationUID;
        delete channel.pyramidMetadata[index].InConcatenationNumber;
        delete channel.pyramidMetadata[index].ConcatenationFrameOffsetNumber;
      } else {
        channel.pyramidMetadata.push(channel.microscopyImages[i]);
        channel.pyramidFrameMappings.push(frameMappings[i]);
      }
    }
    const nLevels = channel.pyramidMetadata.length;
    if (nLevels === 0) {
      console.error('empty pyramid - no levels found')
    }
    channel.pyramidBaseMetadata = channel.pyramidMetadata[nLevels - 1];

    /*
     * Collect relevant information from DICOM metadata for each pyramid
     * level to construct the Openlayers map.
    */
    const channelTileSizes = [];
    const channelGridSizes = [];
    const channelResolutions = [];
    const channelOrigins = [];
    const channelPixelSpacings = [];
    const offset = [0, -1];
    const basePixelSpacing = _getPixelSpacing(channel.pyramidBaseMetadata);
    const baseTotalPixelMatrixColumns = channel.pyramidBaseMetadata.TotalPixelMatrixColumns;
    const baseTotalPixelMatrixRows = channel.pyramidBaseMetadata.TotalPixelMatrixRows;
    const baseColumns = channel.pyramidBaseMetadata.Columns;
    const baseRows = channel.pyramidBaseMetadata.Rows;
    const baseNColumns = Math.ceil(baseTotalPixelMatrixColumns / baseColumns);
    const baseNRows = Math.ceil(baseTotalPixelMatrixRows / baseRows);
    for (let j = (nLevels - 1); j >= 0; j--) {
      const columns = channel.pyramidMetadata[j].Columns;
      const rows = channel.pyramidMetadata[j].Rows;
      const totalPixelMatrixColumns = channel.pyramidMetadata[j].TotalPixelMatrixColumns;
      const totalPixelMatrixRows = channel.pyramidMetadata[j].TotalPixelMatrixRows;
      const pixelSpacing = _getPixelSpacing(channel.pyramidMetadata[j]);
      const nColumns = Math.ceil(totalPixelMatrixColumns / columns);
      const nRows = Math.ceil(totalPixelMatrixRows / rows);
      channelTileSizes.push([
        columns,
        rows,
      ]);
      channelGridSizes.push([
        nColumns,
        nRows,
      ]);
      channelPixelSpacings.push(pixelSpacing);
      /*
      * Compute the resolution at each pyramid level, since the zoom
      * factor may not be the same between adjacent pyramid levels.
      */
      let zoomFactor = baseTotalPixelMatrixColumns / totalPixelMatrixColumns;
      channelResolutions.push(zoomFactor);
      /*
      * TODO: One may have to adjust the offset slightly due to the
      * difference between extent of the image at a given resolution level
      * and the actual number of tiles (frames).
      */
      channelOrigins.push(offset);
    }
    channelResolutions.reverse();
    channelTileSizes.reverse();
    channelGridSizes.reverse();
    channelOrigins.reverse();
    channelPixelSpacings.reverse();

    // We assume the first channel as the reference one for all the pyramid parameters.
    // All the other channels have to have the same parameters.
    this[_pyramidMetadata] = channel.pyramidBaseMetadata;
    this[_metadata] = [...channel.microscopyImages];

    /** Frames may extend beyond the size of the total pixel matrix.
      * The excess pixels are empty, i.e. have only a padding value.
      * We set the extent to the size of the actual image without taken
      * excess pixels into account.
      * Note that the vertical axis is flipped in the used tile source,
      * i.e. values on the axis lie in the range [-n, -1], where n is the
      * number of rows in the total pixel matrix.
      */
    const extent = [
      0,                                // min X
      -(baseTotalPixelMatrixRows + 1),  // min Y
      baseTotalPixelMatrixColumns,      // max X
      -1                                // max Y
    ];

    this[_rotation] = _getRotation(channel.pyramidBaseMetadata);

    /*
    * Specify projection to prevent default automatic projection
    * with the default Mercator projection.
    */
    this[_projection] = new Projection({
      code: 'DICOM',
      units: 'metric',
      extent: extent,
      getPointResolution: (pixelRes, point) => {
        /** DICOM Pixel Spacing has millimeter unit while the projection has
          * has meter unit.
          */
        const spacing = _getPixelSpacing(channel.pyramidMetadata[nLevels - 1])[0] / 10 ** 3;
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
      extent: extent,
      origins: channelOrigins,
      resolutions: channelResolutions,
      sizes: channelGridSizes,
      tileSizes: channelTileSizes
    });

    this[_referenceOrigins] = [...channelOrigins];
    this[_referenceResolutions] = [...channelResolutions];
    this[_referenceGridSizes] = [...channelGridSizes];
    this[_referenceTileSizes] = [...channelTileSizes];
    this[_referencePixelSpacings] = [...channelPixelSpacings];
  }

  /** Gets the channel given an id
   * @param {string} id of the channel
   * @type {channel}
   */
  getChannelByID(id) {
    if (this[_channels].length === 0) {
      return null;
    }
    const channel = this[_channels].find(channel => channel.opticalPathIdentifier === id);
    if (channel === undefined) {
      console.warn("Channel with opticalPathIdentifier " + id + " not found");
      return null;
    }

    return channel;
  }

  /** Gets the channel given an index
   * @param {number} array index 
   * @type {channel}
   */
  getChannelByIndex(index) {
    if (this[_channels].length === 0 || 
      index < 0 || index > this[_channels].length) {
      console.warn("Channel with index " + id + " not found")  
      return null;
    }

    return this[_channels][index];
  }

  /** Gets the channel metadata given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   * @type {metadata[]} array with all the instances metadata of the channel
   */
  getChannelMetadataByID(id) {
    const channel = this.getChannelByID(id)
    return channel ? channel.metadata : null;
  }

  /** Gets the channel color given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   * @type {number[]} array with the color array
   */
  getChannelColorByID(id) {
    const channel = this.getChannelByID(id)
    if (channel === null) {
      return null;
    }

    if (channel.pyramidBaseMetadata.SamplesPerPixel !== 1) {
      console.warn("Channel with id: ", id, "is not a monochorme channel. Channel coloring is not available");
      return null;
    }

    return channel.color;
  }

  /** Sets the channel color given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   * @param {number[]} array with the color array
   */
  setChannelColorByID(id, color) {
    const channel = this.getChannelByID(id)
    if (channel === null) {
      return;
    }

    if (channel.pyramidBaseMetadata.SamplesPerPixel !== 1) {
      console.warn("Channel with id: ", id, "is not a monochorme channel. Channel coloring is not available");
      return;
    }

    channel.color = [...color];

    // need to rerun offscren render to color the layers already loaded
    channel.rasterSource.clear()
  }

  /** Gets the channel opacity given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   * @type {number} opacity value
   */
  getChannelOpacityByID(id) {
    const channel = this.getChannelByID(id)
    if (channel === null) {
      return null;
    }

    if (channel.pyramidBaseMetadata.SamplesPerPixel !== 1) {
      console.warn("Channel with id: ", id, "is not a monochorme channel. Channel coloring is not available");
      return null;
    }

    return channel.opacity;
  }

  /** Sets the channel opacity given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   * @param {number} opacity value
   */
  setChannelOpacityByID(id, opacity) {
    const channel = this.getChannelByID(id)
    if (channel === null) {
      return;
    }

    if (channel.pyramidBaseMetadata.SamplesPerPixel !== 1) {
      console.warn("Channel with id: ", id, "is not a monochorme channel. Channel coloring is not available");
      return;
    }

    channel.opacity = opacity;

    // need to rerun offscren render to color the layers already loaded
    channel.rasterSource.clear()
  }

  /** Gets the channel constrast limits range given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   * @type {number[]} range (min and max) values of the color function
   */
  getChannelConstrastLimitsRangeByID(id) {
    const channel = this.getChannelByID(id)
    if (channel === null) {
      return null;
    }

    if (channel.pyramidBaseMetadata.SamplesPerPixel !== 1) {
      console.warn("Channel with id: ", id, "is not a monochorme channel. Channel coloring is not available");
      return null;
    }

    return channel.contrastLimitsRange;
  }

  /** Sets the channel constrast limits range given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   * @param {number[]} array with the range (min and max) values of the color function
   */
  setChannelConstrastLimitsRangeByID(id, range) {
    const channel = this.getChannelByID(id)
    if (channel === null) {
      return;
    }

    if (channel.pyramidBaseMetadata.SamplesPerPixel !== 1) {
      console.warn("Channel with id: ", id, "is not a monochorme channel. Channel coloring is not available");
      return;
    }

    channel.contrastLimitsRange = [...range]; 

    // need to rerun offscren render to color the layers already loaded
    channel.rasterSource.clear()
  }

  /** Gets the channel visible given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   * @type {boolean} visible
   */
  getChannelVisibleByID(id) {
    const channel = this.getChannelByID(id)
    return channel ? channel.visible : null;
  }

  /** Sets the channel visible given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   * @param {boolean} visible
   */
  setChannelVisibleByID(id, visible) {
    const channel = this.getChannelByID(id)
    if (channel === null) {
      return;
    }
    channel.visible = visible;
    
    if (channel.tileLayer === null) { 
      return;
    }
    channel.tileLayer.setVisible(channel.visible);
  }

  /** Adds the channel to the OpenLayer Map given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   */
  addChannelToMapByID(id) {
    const channel = this.getChannelByID(id)
    if (channel === null) {
      return;
    }

    // NOTE: _drawingLayer has to be the last layer, otherwise the compistion will be broken
    this[_map].removeLayer(this[_drawingLayer])
    this[_map].addLayer(channel.tileLayer)
    this[_map].addLayer(this[_drawingLayer])
  }

  /** Removes the channel to the OpenLayer Map given an id
   * @param {string} id of the channel (opticalPathIdentifier)
   */
  removeChannelFromMapByID(id) {
    const channel = this.getChannelByID(id)
    if (channel === null) {
      return;
    }
    this[_map].removeLayer(channel.tileLayer)
  }

  /** Resizes the viewer to fit the viewport. */
  resize() {
    this[_map].updateSize();
  }

  /** Gets the size of the viewport.
   *
   * @type {number[]}
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
   * @param {object} options - Drawing options.
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
   * @type {boolean}
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
   * @type {boolean}
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
   * @type {boolean}
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
   * @type {number}
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
   * @param {Object} item - NUM content item representing a measurement
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
   * @param {Object} item - CODE content item representing a qualitative evaluation
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
   * @param {ROI} item - Regions of interest.
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
   * @param {string} uid - Unique identifier of the regions of interest.
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
   * @type {boolean}
   */
  get areROIsVisible() {
    return this[_drawingLayer].getVisible();
  }

  /** DICOM metadata for each VL Whole Slide Microscopy Image instance.
   *
   * @type {VLWholeSlideMicroscopyImage[]}
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
    this[_client] = options.client;

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
   * @type {VLWholeSlideMicroscopyImage}
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
   * @type {number[]}
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
   * @param {object} options.client - A DICOMwebClient instance for interacting with an origin server over HTTP.
   * @param {object} options.metadata - DICOM JSON metadata object for a VL Whole Slide Microscopy Image instance.
   * @param {string} [options.orientation='vertical'] - Orientation of the slide (vertical: label on top, or horizontal: label on right side).
   * @param {number} [options.resizeFactor=1] - To which extent image should be reduced in size (fraction).
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile should be included for correction of image colors.
   */
  constructor(options) {
    if (options.orientation === undefined) {
      options.orientation = 'vertical';
    }
    super(options)
  }
}

export { LabelImageViewer, OverviewImageViewer, VolumeImageViewer };
