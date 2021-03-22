import "ol/ol.css";
import Collection from "ol/Collection";
import Draw, { createRegularPolygon } from "ol/interaction/Draw";
import EVENT from "./events";
import Feature from "ol/Feature";
import Fill from "ol/style/Fill";
import FullScreen from "ol/control/FullScreen";
import ImageLayer from "ol/layer/Image";
import Map from "ol/Map";
import Modify from "ol/interaction/Modify";
import MouseWheelZoom from "ol/interaction/MouseWheelZoom";
import OverviewMap from "ol/control/OverviewMap";
import Projection from "ol/proj/Projection";
import publish from "./eventPublisher";
import ScaleLine from "ol/control/ScaleLine";
import Select from "ol/interaction/Select";
import Snap from "ol/interaction/Snap";
import Translate from "ol/interaction/Translate";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Static from "ol/source/ImageStatic";
import Overlay from "ol/Overlay";
import TileLayer from "ol/layer/Tile";
import TileImage from "ol/source/TileImage";
import TileGrid from "ol/tilegrid/TileGrid";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import View from "ol/View";
import DragPan from "ol/interaction/DragPan";
import DragZoom from "ol/interaction/DragZoom";

import { getLength, getArea } from "ol/sphere";
import { default as PolygonGeometry, fromCircle } from "ol/geom/Polygon";
import { default as PointGeometry } from "ol/geom/Point";
import { default as LineStringGeometry } from "ol/geom/LineString";
import { default as CircleGeometry } from "ol/geom/Circle";
import { default as VectorEventType } from "ol/source/VectorEventType";

import { getCenter } from "ol/extent";

import * as DICOMwebClient from "dicomweb-client";

import { VLWholeSlideMicroscopyImage, getFrameMapping } from "./metadata.js";
import { ROI } from "./roi.js";
import {
  computeRotation,
  generateUID,
  applyInverseTransform,
  applyTransform,
  buildInverseTransform,
  buildTransform,
  getUnitSuffix,
  isContentItemsEqual,
  getMeasurementContentItem,
  getTextEvaluationContentItem,
} from "./utils.js";
import { Point, Polyline, Polygon, Ellipse } from "./scoord3d.js";
import Enums from "./enums";
import _AnnotationManager from "./annotations/_AnnotationManager";
import Icon from "ol/style/Icon";

function _getInteractionBindingCondition(bindings) {
  const BUTTONS = {
    left: 1,
    middle: 4,
    right: 2,
  };

  const { mouseButtons, modifierKey } = bindings;

  const _mouseButtonCondition = (event) => {
    /** No mouse button condition set. */
    if (!mouseButtons || !mouseButtons.length) {
      return true;
    }

    const button = event.pointerEvent
      ? event.pointerEvent.buttons
      : event.originalEvent.buttons;

    return mouseButtons.some((mb) => BUTTONS[mb] === button);
  };

  const _modifierKeyCondition = (event) => {
    const pointerEvent = event.pointerEvent
      ? event.pointerEvent
      : event.originalEvent;

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
      );
    }

    switch (modifierKey) {
      case "alt":
        return pointerEvent.altKey === true || pointerEvent.metaKey === true;
      case "shift":
        return pointerEvent.shiftKey === true;
      case "ctrl":
        return pointerEvent.ctrlKey === true;
      default:
        /** Invalid modifier key set (ignore requirement as if key not pressed). */
        return (
          !pointerEvent.altKey &&
          !pointerEvent.metaKey &&
          !pointerEvent.shiftKey &&
          !pointerEvent.ctrlKey
        );
    }
  };

  return (event) => {
    return _mouseButtonCondition(event) && _modifierKeyCondition(event);
  };
}

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
    orientation: metadata.ImageOrientationSlide,
  });
  // We want the slide oriented horizontally with the label on the right side
  const correction = 90 * (Math.PI / 180);
  return angle + correction;
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
  console.info("map coordinates from pixel matrix to slide coordinate system");
  const frameOfReferenceUID = pyramid[pyramid.length - 1].FrameOfReferenceUID;
  const type = geometry.getType();
  if (type === "Point") {
    let coordinates = geometry.getCoordinates();
    coordinates = _geometryCoordinates2scoord3dCoordinates(
      coordinates,
      pyramid
    );
    return new Point({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID,
    });
  } else if (type === "Polygon") {
    /*
     * The first linear ring of the array defines the outer-boundary (surface).
     * Each subsequent linear ring defines a hole in the surface.
     */
    let coordinates = geometry.getCoordinates()[0].map((c) => {
      return _geometryCoordinates2scoord3dCoordinates(c, pyramid);
    });
    return new Polygon({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID,
    });
  } else if (type === "LineString") {
    let coordinates = geometry.getCoordinates().map((c) => {
      const result = _geometryCoordinates2scoord3dCoordinates(c, pyramid);
      return result;
    });
    return new Polyline({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID,
    });
  } else if (type === "Circle") {
    const center = geometry.getCenter();
    const radius = geometry.getRadius();
    // Endpoints of major and  minor axis of the ellipse.
    let coordinates = [
      [center[0] - radius, center[1], 0],
      [center[0] + radius, center[1], 0],
      [center[0], center[1] - radius, 0],
      [center[0], center[1] + radius, 0],
    ];
    coordinates = coordinates.map((c) => {
      return _geometryCoordinates2scoord3dCoordinates(c, pyramid);
    });
    return new Ellipse({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID,
    });
  } else {
    // TODO: Combine multiple points into MULTIPOINT.
    console.error(`unknown geometry type "${type}"`);
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
  console.info("map coordinates from slide coordinate system to pixel matrix");
  const type = scoord3d.graphicType;
  const data = scoord3d.graphicData;

  if (type === "POINT") {
    let coordinates = _scoord3dCoordinates2geometryCoordinates(data, pyramid);
    return new PointGeometry(coordinates);
  } else if (type === "POLYLINE") {
    const coordinates = data.map((d) => {
      return _scoord3dCoordinates2geometryCoordinates(d, pyramid);
    });
    return new LineStringGeometry(coordinates);
  } else if (type === "POLYGON") {
    const coordinates = data.map((d) => {
      return _scoord3dCoordinates2geometryCoordinates(d, pyramid);
    });
    return new PolygonGeometry([coordinates]);
  } else if (type === "ELLIPSE") {
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
        0,
      ],
      point2,
    ];
    coordinates = coordinates.map((d) => {
      return _scoord3dCoordinates2geometryCoordinates(d, pyramid);
    });
    // to flat coordinates
    coordinates = [
      ...coordinates[0].slice(0, 2),
      ...coordinates[1].slice(0, 2),
    ];

    // flat coordinates in combination with opt_layout and no opt_radius are also accepted
    // and internally it calculates the Radius
    return new CircleGeometry(coordinates, null, "XY");
  } else {
    console.error(`unsupported graphic type "${type}"`);
  }
}

function _geometryCoordinates2scoord3dCoordinates(coordinates, pyramid) {
  return _coordinateFormatGeometry2Scoord3d(
    [coordinates[0], coordinates[1], coordinates[2]],
    pyramid
  );
}

function _scoord3dCoordinates2geometryCoordinates(coordinates, pyramid) {
  return _coordinateFormatScoord3d2Geometry(
    [coordinates[0], coordinates[1], coordinates[2]],
    pyramid
  );
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
  });
  coordinates = coordinates.map((c) => {
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

  let outOfFrame = false;
  const affine = buildInverseTransform({
    offset,
    orientation,
    spacing,
  });
  coordinates = coordinates.map((c) => {
    if (c[0] > 25 || c[1] > 76) {
      outOfFrame = true;
    }
    const slideCoord = [c[0], c[1]];
    const pixelCoord = applyInverseTransform({
      coordinate: slideCoord,
      affine,
    });
    return [pixelCoord[0], -(pixelCoord[1] + 1), 0];
  });
  if (transform) {
    return coordinates[0];
  }
  if (outOfFrame) {
    console.warning(
      "found coordinates outside slide coordinate system 25 x 76 mm"
    );
  }
  return coordinates;
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
function _getOpenLayersStyle(styleOptions) {
  const style = new Style();

  if ("stroke" in styleOptions) {
    const strokeOptions = {
      color: styleOptions.stroke.color,
      width: styleOptions.stroke.width,
    };
    const stroke = new Stroke(strokeOptions);
    style.setStroke(stroke);
  }

  if ("fill" in styleOptions) {
    const fillOptions = {
      color: styleOptions.fill.color,
    };
    const fill = new Fill(fillOptions);
    style.setFill(fill);
  }

  if ("image" in styleOptions) {
    const { image } = styleOptions;

    if (image.circle) {
      const options = {
        radius: image.circle.radius,
        stroke: new Stroke(image.circle.stroke),
        fill: new Fill(image.circle.fill),
      };
      const circle = new Circle(options);
      style.setImage(circle);
    }

    if (image.icon) {
      const icon = new Icon(image.icon);
      style.setImage(icon);
    }
  }

  return style;
}

/**
 * Add ROI properties to feature in a safe way
 *
 * @param {object} feature The feature instance that represents the ROI
 * @param {object} properties Valid ROI properties
 * @param {object} properties.measurements - ROI measurements
 * @param {object} properties.evaluations - ROI evaluations
 * @param {object} properties.label - ROI label
 * @param {object} properties.marker - ROI marker (this is used while we don't have presentation states)
 * @param {boolean} opt_silent Opt silent update
 */
function _addROIPropertiesToFeature(feature, properties, opt_silent) {
  const { Label, Measurements, Evaluations, Marker } = Enums.InternalProperties;

  if (properties[Label]) {
    feature.set(Label, properties[Label], opt_silent);
  }

  if (properties[Measurements]) {
    feature.set(Measurements, properties[Measurements], opt_silent);
  }

  if (properties[Evaluations]) {
    feature.set(Evaluations, properties[Evaluations], opt_silent);
  }

  if (properties[Marker]) {
    feature.set(Marker, properties[Marker], opt_silent);
  }
}

/**
 * Wire measurements and qualitative events to generate content items
 * based on feature properties and geometry changes
 *
 * @param {object} map The map instance
 * @param {object} feature The feature instance
 * @returns {void}
 */
function _wireMeasurementsAndQualitativeEvaluationsEvents(map, feature) {
  /**
   * Update feature measurement properties first and then measurements
   */
  _updateFeatureMeasurementProperties(map, feature);
  _updateFeatureMeasurements(map, feature);
  feature.getGeometry().on(Enums.FeatureGeometryEvents.CHANGE, () => {
    _updateFeatureMeasurementProperties(map, feature);
    _updateFeatureMeasurements(map, feature);
  });

  /**
   * Update feature evaluations
   */
  _updateFeatureEvaluations(feature);
  feature.on(Enums.FeatureEvents.PROPERTY_CHANGE, () =>
    _updateFeatureEvaluations(feature)
  );
}

/**
 * Update feature evaluations from its properties
 *
 * @param {Feature} feature The feature
 * @returns {void}
 */
function _updateFeatureEvaluations(feature) {
  const label = feature.get(Enums.InternalProperties.Label);
  const evaluations = feature.get(Enums.InternalProperties.Evaluations) || [];

  if (!label) return;

  const nameCodedConceptValue = "112039";
  const nameCodedConceptMeaning = "Tracking Identifier";
  const evaluation = getTextEvaluationContentItem(
    label,
    nameCodedConceptValue,
    nameCodedConceptMeaning
  );

  const index = evaluations.findIndex((e) =>
    isContentItemsEqual(e, evaluation)
  );

  if (index > -1) {
    evaluations[index] = evaluation;
  } else {
    evaluations.push(evaluation);
  }

  feature.set(Enums.InternalProperties.Evaluations, evaluations);
  console.debug(`Evaluations of feature (${feature.getId()}):`, evaluations);
}

/**
 * Updates feature measurement properties
 *
 * @param {object} map The map instance
 * @param {object} feature The feature instance
 * @returns {void}
 */
const _updateFeatureMeasurementProperties = (map, feature) => {
  /**
   * Open Layers side-effect: Geometry will be changed
   * inside the formCircle call which causes errors
   * if const variable is used for geometry
   */
  let geometry = feature.getGeometry().clone();
  if (geometry instanceof LineStringGeometry) {
    feature.set(Enums.FeatureMeasurement.Length, getLength(geometry));
  } else if (geometry instanceof CircleGeometry) {
    geometry = fromCircle(geometry);
    feature.set(Enums.FeatureMeasurement.Area, getArea(geometry));
  } else if (geometry instanceof PolygonGeometry) {
    feature.set(Enums.FeatureMeasurement.Area, getArea(geometry));
  }
};

/**
 * Generate feature measurements from its measurement properties
 *
 * @param {object} map The map instance
 * @param {object} feature The feature instance
 * @returns {void}
 */
function _updateFeatureMeasurements(map, feature) {
  const measurements = feature.get(Enums.InternalProperties.Measurements) || [];
  const area = feature.get(Enums.FeatureMeasurement.Area);
  const length = feature.get(Enums.FeatureMeasurement.Length);

  if (!area && !length) return;

  const unitSuffixToMeaningMap = {
    μm: "micrometer",
    mm: "millimeter",
    m: "meters",
    km: "kilometers",
  };

  let measurement;
  const view = map.getView();
  const unitSuffix = getUnitSuffix(view);
  const unitCodedConceptValue = unitSuffix;
  const unitCodedConceptMeaning = unitSuffixToMeaningMap[unitSuffix];

  if (area) {
    const nameCodedConceptValue = "Area";
    const nameCodedConceptMeaning = "42798000";
    measurement = getMeasurementContentItem(
      area,
      nameCodedConceptValue,
      nameCodedConceptMeaning,
      unitCodedConceptValue,
      unitCodedConceptMeaning
    );
  }

  if (length) {
    const nameCodedConceptValue = "Length";
    const nameCodedConceptMeaning = "410668003";
    measurement = getMeasurementContentItem(
      length,
      nameCodedConceptValue,
      nameCodedConceptMeaning,
      unitCodedConceptValue,
      unitCodedConceptMeaning
    );
  }

  const index = measurements.findIndex((m) =>
    isContentItemsEqual(m, measurement)
  );

  if (index > -1) {
    measurements[index] = measurement;
  } else {
    measurements.push(measurement);
  }

  feature.set(Enums.InternalProperties.Measurements, measurements);
  console.debug(`Measurements of feature (${feature.getId()}):`, measurements);
}

/** Updates the style of a feature.
 *
 * @param {object} styleOptions - Style options
 * @param {object} styleOptions.stroke - Style options for the outline of the geometry
 * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
 * @param {number} styleOptions.stroke.width - Width of the outline
 * @param {object} styleOptions.fill - Style options for body the geometry
 * @param {number[]} styleOptions.fill.color - RGBA color of the body
 * @param {object} styleOptions.image - Style options for image
 */
function _setFeatureStyle(feature, styleOptions) {
  if (styleOptions !== undefined) {
    const style = _getOpenLayersStyle(styleOptions);
    feature.setStyle(style);

    /**
     * styleOptions is used internally by internal styled components like markers.
     * This allows them to take priority over styling since OpenLayers swaps the styles
     * completely in case of a setStyle happens.
     */
    feature.set(Enums.InternalProperties.StyleOptions, styleOptions);
  }
}

const _client = Symbol("client");
const _controls = Symbol("controls");
const _drawingLayer = Symbol("drawingLayer");
const _drawingSource = Symbol("drawingSource");
const _features = Symbol("features");
const _imageLayer = Symbol("imageLayer");
const _interactions = Symbol("interactions");
const _map = Symbol("map");
const _metadata = Symbol("metadata");
const _pyramidMetadata = Symbol("pyramidMetadata");
const _pyramidFrameMappings = Symbol("pyramidFrameMappings");
const _pyramidBaseMetadata = Symbol("pyramidMetadataBase");
const _segmentations = Symbol("segmentations");
const _usewebgl = Symbol("usewebgl");
const _annotationManager = Symbol("annotationManager");
const _defaultStyleOptions = Symbol("defaultStyleOptions");
const _overviewMap = Symbol("overviewMap");

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
   * @param {Object[]} options.metadata - An array of DICOM JSON metadata objects, one for each VL Whole Slide Microscopy Image instance.
   * @param {object} options.styleOptions - Default style options for annotations
   * @param {string[]} [options.controls=[]] - Names of viewer control elements that should be included in the viewport.
   * @param {boolean} [options.retrieveRendered=true] - Whether image frames should be retrieved via DICOMweb prerendered by the server.
   * @param {boolean} [options.includeIccProfile=false] - Whether ICC Profile should be included for correction of image colors.
   * @param {boolean} [options.useWebGL=true] - Whether WebGL renderer should be used.
   */
  constructor(options) {
    if ("useWebGL" in options) {
      this[_usewebgl] = options.useWebGL;
    } else {
      this[_usewebgl] = true;
    }

    this[_client] = options.client;

    if (options.styleOptions) {
      this[_defaultStyleOptions] = options.styleOptions;
    }

    if (!("retrieveRendered" in options)) {
      options.retrieveRendered = true;
    }

    if (!("overview" in options)) {
      options.overview = {};
    }

    if (!("controls" in options)) {
      options.controls = [];
    }
    options.controls = new Set(options.controls);

    // Collection of Openlayers "VectorLayer" instances indexable by
    // DICOM Series Instance UID
    this[_segmentations] = {};

    // Collection of Openlayers "Feature" instances
    this[_features] = new Collection([], { unique: true });

    // Add unique identifier to each created "Feature" instance
    this[_features].on("add", (e) => {
      // The ID may have already been set when drawn. However, features could
      // have also been added without a draw event.
      if (e.element.getId() === undefined) {
        e.element.setId(generateUID());
      }

      this[_annotationManager].onAdd(e.element);
    });

    this[_features].on("remove", (e) => {
      this[_annotationManager].onRemove(feature);
    });

    /*
     * To visualize images accross multiple scales, we first need to
     * determine the image pyramid structure, i.e. the size and resolution
     * images at the different pyramid levels.
     */
    this[_metadata] = [];
    options.metadata.forEach((m) => {
      const image = new VLWholeSlideMicroscopyImage({ metadata: m });
      if (image.ImageType[2] === "VOLUME") {
        this[_metadata].push(image);
      }
    });

    if (this[_metadata].length === 0) {
      throw new Error("No VOLUME image provided.");
    }

    // Sort instances and optionally concatenation parts if present.
    this[_metadata].sort((a, b) => {
      const sizeDiff = a.TotalPixelMatrixColumns - b.TotalPixelMatrixColumns;
      if (sizeDiff === 0) {
        if (a.ConcatenationFrameOffsetNumber !== undefined) {
          return (
            a.ConcatenationFrameOffsetNumber - b.ConcatenationFrameOffsetNumber
          );
        }
        return sizeDiff;
      }
      return sizeDiff;
    });

    this[_pyramidMetadata] = [];
    this[_pyramidFrameMappings] = [];
    let frameMappings = this[_metadata].map((m) => getFrameMapping(m));
    for (let i = 0; i < this[_metadata].length; i++) {
      const cols = this[_metadata][i].TotalPixelMatrixColumns;
      const rows = this[_metadata][i].TotalPixelMatrixRows;
      const numberOfFrames = this[_metadata][i].NumberOfFrames;
      /*
       * Instances may be broken down into multiple concatenation parts.
       * Therefore, we have to re-assemble instance metadata.
       */
      let alreadyExists = false;
      let index = null;
      for (let j = 0; j < this[_pyramidMetadata].length; j++) {
        if (
          this[_pyramidMetadata][j].TotalPixelMatrixColumns === cols &&
          this[_pyramidMetadata][j].TotalPixelMatrixRows === rows
        ) {
          alreadyExists = true;
          index = j;
        }
      }
      if (alreadyExists) {
        // Update with information obtained from current concatenation part.
        Object.assign(this[_pyramidFrameMappings][index], frameMappings[i]);
        this[_pyramidMetadata][index].NumberOfFrames += numberOfFrames;
        if ("PerFrameFunctionalGroupsSequence" in this[_metadata][index]) {
          this[_pyramidMetadata][index].PerFrameFunctionalGroupsSequence.push(
            ...this[_metadata][i].PerFrameFunctionalGroupsSequence
          );
        }
        if (!"SOPInstanceUIDOfConcatenationSource" in this[_metadata][i]) {
          throw new Error(
            'Attribute "SOPInstanceUIDOfConcatenationSource" is required ' +
              "for concatenation parts."
          );
        }
        const sopInstanceUID = this[_metadata][i]
          .SOPInstanceUIDOfConcatenationSource;
        this[_pyramidMetadata][index].SOPInstanceUID = sopInstanceUID;
        delete this[_pyramidMetadata][index]
          .SOPInstanceUIDOfConcatenationSource;
        delete this[_pyramidMetadata][index].ConcatenationUID;
        delete this[_pyramidMetadata][index].InConcatenationNumber;
        delete this[_pyramidMetadata][index].ConcatenationFrameOffsetNumber;
      } else {
        this[_pyramidMetadata].push(this[_metadata][i]);
        this[_pyramidFrameMappings].push(frameMappings[i]);
      }
    }

    const nLevels = this[_pyramidMetadata].length;
    console.debug("Pyramid levels:", nLevels);
    if (nLevels === 0) {
      console.error("empty pyramid - no levels found");
    }

    this[_pyramidBaseMetadata] = this[_pyramidMetadata][nLevels - 1];

    /*
     * Collect relevant information from DICOM metadata for each pyramid
     * level to construct the Openlayers map.
     */
    const tileSizes = [];
    const tileGridSizes = [];
    const resolutions = [];
    const origins = [];
    const offset = [0, -1];
    const basePixelSpacing = _getPixelSpacing(this[_pyramidBaseMetadata]);
    const baseTotalPixelMatrixColumns = this[_pyramidBaseMetadata]
      .TotalPixelMatrixColumns;
    const baseTotalPixelMatrixRows = this[_pyramidBaseMetadata]
      .TotalPixelMatrixRows;
    const baseColumns = this[_pyramidBaseMetadata].Columns;
    const baseRows = this[_pyramidBaseMetadata].Rows;
    const baseNColumns = Math.ceil(baseTotalPixelMatrixColumns / baseColumns);
    const baseNRows = Math.ceil(baseTotalPixelMatrixRows / baseRows);

    for (let j = nLevels - 1; j >= 0; j--) {
      const columns = this[_pyramidMetadata][j].Columns;
      const rows = this[_pyramidMetadata][j].Rows;
      const totalPixelMatrixColumns = this[_pyramidMetadata][j]
        .TotalPixelMatrixColumns;
      const totalPixelMatrixRows = this[_pyramidMetadata][j]
        .TotalPixelMatrixRows;
      const pixelSpacing = _getPixelSpacing(this[_pyramidMetadata][j]);
      const nColumns = Math.ceil(totalPixelMatrixColumns / columns);
      const nRows = Math.ceil(totalPixelMatrixRows / rows);
      tileSizes.push([columns, rows]);
      tileGridSizes.push([nColumns, nRows]);

      /*
       * Compute the resolution at each pyramid level, since the zoom
       * factor may not be the same between adjacent pyramid levels.
       */
      let zoomFactor = baseTotalPixelMatrixColumns / totalPixelMatrixColumns;
      resolutions.push(zoomFactor);

      /*
       * TODO: One may have to adjust the offset slightly due to the
       * difference between extent of the image at a given resolution level
       * and the actual number of tiles (frames).
       */
      origins.push(offset);
    }
    resolutions.reverse();
    tileSizes.reverse();
    tileGridSizes.reverse();
    origins.reverse();

    // Functions won't be able to access "this"
    const pyramid = this[_pyramidMetadata];
    const pyramidFrameMappings = this[_pyramidFrameMappings];

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
      const z = tileCoord[0];
      console.debug("Pyramid level:", z);
      const y = tileCoord[1] + 1;
      const x = tileCoord[2] + 1;
      const index = x + "-" + y;
      const path = pyramidFrameMappings[z][index];
      if (path === undefined) {
        console.warn("tile " + index + " not found at level " + z);
        return null;
      }
      let url =
        options.client.wadoURL +
        "/studies/" +
        pyramid[z].StudyInstanceUID +
        "/series/" +
        pyramid[z].SeriesInstanceUID +
        "/instances/" +
        path;
      if (options.retrieveRendered) {
        url = url + "/rendered";
      }
      return url;
    };

    /*
     * Define custom tile loader function, which is required because the
     * WADO-RS response message has content type "multipart/related".
     */
    const tileLoadFunction = (tile, src) => {
      if (src !== null) {
        const studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(
          src
        );
        const seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(
          src
        );
        const sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(
          src
        );
        const frameNumbers = DICOMwebClient.utils.getFrameNumbersFromUri(src);
        const img = tile.getImage();
        if (options.retrieveRendered) {
          const mediaType = "image/png";
          const retrieveOptions = {
            studyInstanceUID,
            seriesInstanceUID,
            sopInstanceUID,
            frameNumbers,
            mediaTypes: [{ mediaType }],
          };
          if (options.includeIccProfile) {
            retrieveOptions["queryParams"] = {
              iccprofile: "yes",
            };
          }
          options.client
            .retrieveInstanceFramesRendered(retrieveOptions)
            .then((renderedFrame) => {
              const blob = new Blob([renderedFrame], { type: mediaType });
              img.src = window.URL.createObjectURL(blob);
            });
        } else {
          // TODO: support "image/jp2" and "image/jls"
          const mediaType = "image/jpeg";
          const retrieveOptions = {
            studyInstanceUID,
            seriesInstanceUID,
            sopInstanceUID,
            frameNumbers,
            mediaTypes: [
              { mediaType, transferSyntaxUID: "1.2.840.10008.1.2.4.50" },
            ],
          };
          options.client
            .retrieveInstanceFrames(retrieveOptions)
            .then((rawFrames) => {
              const blob = new Blob(rawFrames, { type: mediaType });
              img.src = window.URL.createObjectURL(blob);
            });
        }
      } else {
        console.warn("could not load tile");
      }
    };

    /** Frames may extend beyond the size of the total pixel matrix.
     * The excess pixels are empty, i.e. have only a padding value.
     * We set the extent to the size of the actual image without taken
     * excess pixels into account.
     * Note that the vertical axis is flipped in the used tile source,
     * i.e. values on the axis lie in the range [-n, -1], where n is the
     * number of rows in the total pixel matrix.
     */
    const extent = [
      0, // min X
      -(baseTotalPixelMatrixRows + 1), // min Y
      baseTotalPixelMatrixColumns, // max X
      -1, // max Y
    ];

    const rotation = _getRotation(this[_pyramidBaseMetadata]);

    /*
     * Specify projection to prevent default automatic projection
     * with the default Mercator projection.
     */
    const projection = new Projection({
      code: "DICOM",
      units: "metric",
      extent,
      getPointResolution: (pixelRes, point) => {
        /** DICOM Pixel Spacing has millimeter unit while the projection has
         * has meter unit.
         */
        const spacing = _getPixelSpacing(pyramid[nLevels - 1])[0] / 10 ** 3;
        return pixelRes * spacing;
      },
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
    const tileGrid = new TileGrid({
      extent,
      origins,
      resolutions,
      sizes: tileGridSizes,
      tileSizes,
    });

    /*
     * We use the existing TileImage source but customize it to retrieve
     * frames (load tiles) via DICOMweb WADO-RS.
     */
    const rasterSource = new TileImage({
      crossOrigin: "Anonymous",
      tileGrid,
      projection,
      wrapX: false,
    });
    rasterSource.setTileUrlFunction(tileUrlFunction);
    rasterSource.setTileLoadFunction(tileLoadFunction);

    this[_imageLayer] = new TileLayer({
      extent,
      source: rasterSource,
      preload: 0,
      projection,
    });

    this[_drawingSource] = new VectorSource({
      tileGrid,
      projection,
      features: this[_features],
      wrapX: false,
    });

    this[_drawingLayer] = new VectorLayer({
      extent,
      source: this[_drawingSource],
      projection,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    });

    const view = new View({
      center: getCenter(extent),
      extent,
      projection,
      resolutions,
      rotation,
    });

    this[_controls] = {
      scale: new ScaleLine({
        units: "metric",
        className: "",
      }),
    };

    if (options.controls.has("fullscreen")) {
      this[_controls].fullscreen = new FullScreen();
    }

    const overviewImageLayer = new TileLayer({
      extent,
      source: rasterSource,
      preload: 0,
      projection,
    });

    let overviewViewOptions = {
      rotation,
      projection,
      /** resolutions, with this property the zoom doesn't work */
      zoom: 28 /** Default max zoom */,
    };

    console.debug("View resolutions:", resolutions);

    const overviewView = new View(overviewViewOptions);

    this[_overviewMap] = new OverviewMap({
      view: overviewView,
      layers: [overviewImageLayer],
      collapsed: options.overview.hasOwnProperty("collapsed")
        ? options.overview.collapsed
        : false,
      collapsible: options.overview.hasOwnProperty("collapsible")
        ? options.overview.collapsible
        : false,
    });

    /** Creates the map with the defined layers and view and renders it. */
    this[_map] = new Map({
      layers: [this[_imageLayer], this[_drawingLayer]],
      view,
      controls: [],
      keyboardEventTarget: document,
    });

    /**
     * OpenLayer's map has default active interactions
     * https://openlayers.org/en/latest/apidoc/module-ol_interaction.html#.defaults
     *
     * We need to define them here to avoid duplications
     * of interactions that could cause bugs in the application
     */
    const defaultInteractions = this[_map].getInteractions().getArray();
    this[_interactions] = {
      draw: undefined,
      select: undefined,
      translate: undefined,
      modify: undefined,
      snap: undefined,
      dragPan: defaultInteractions.find((i) => i instanceof DragPan),
    };

    this[_map].addInteraction(new MouseWheelZoom());

    for (let control in this[_controls]) {
      this[_map].addControl(this[_controls][control]);
    }

    this[_map].getView().fit(extent);

    this[_annotationManager] = new _AnnotationManager({ map: this[_map] });
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
    if (!("container" in options)) {
      console.error("container must be provided for rendering images");
    }
    this[_map].setTarget(options.container);

    // Style scale element (overriding default Openlayers CSS "ol-scale-line")
    let scaleElement = this[_controls]["scale"].element;
    scaleElement.style.position = "absolute";
    scaleElement.style.right = ".5em";
    scaleElement.style.bottom = ".5em";
    scaleElement.style.left = "auto";
    scaleElement.style.padding = "2px";
    scaleElement.style.backgroundColor = "rgba(255,255,255,.5)";
    scaleElement.style.borderRadius = "4px";
    scaleElement.style.margin = "1px";

    let scaleInnerElement = this[_controls]["scale"].innerElement_;
    scaleInnerElement.style.color = "black";
    scaleInnerElement.style.fontWeight = "600";
    scaleInnerElement.style.fontSize = "10px";
    scaleInnerElement.style.textAlign = "center";
    scaleInnerElement.style.borderWidth = "1.5px";
    scaleInnerElement.style.borderStyle = "solid";
    scaleInnerElement.style.borderTop = "none";
    scaleInnerElement.style.borderRightColor = "black";
    scaleInnerElement.style.borderLeftColor = "black";
    scaleInnerElement.style.borderBottomColor = "black";
    scaleInnerElement.style.margin = "1px";
    scaleInnerElement.style.willChange = "contents,width";

    const container = this[_map].getTargetElement();

    this[_drawingSource].on(VectorEventType.ADDFEATURE, (e) => {
      publish(
        container,
        EVENT.ROI_ADDED,
        this._getROIFromFeature(e.feature, this[_pyramidMetadata])
      );
    });

    this[_drawingSource].on(VectorEventType.CHANGEFEATURE, (e) => {
      if (e.feature !== undefined || e.feature !== null) {
        const geometry = e.feature.getGeometry();
        const type = geometry.getType();
        // The first and last point of a polygon must be identical. The last point
        // is an implementation detail and is hidden from the user in the graphical
        // interface. However, we must update the last point in case the first
        // point has been modified by the user.
        if (type === "Polygon") {
          // NOTE: Polygon in GeoJSON format contains an array of geometries,
          // where the first element represents the coordinates of the outer ring
          // and the second element represents the coordinates of the inner ring
          // (in our case the inner ring should not be present).
          const layout = geometry.getLayout();
          const coordinates = geometry.getCoordinates();
          const firstPoint = coordinates[0][0];
          const lastPoint = coordinates[0][coordinates[0].length - 1];
          if (
            firstPoint[0] !== lastPoint[0] ||
            firstPoint[1] !== lastPoint[1]
          ) {
            coordinates[0][coordinates[0].length - 1] = firstPoint;
            geometry.setCoordinates(coordinates, layout);
            e.feature.setGeometry(geometry);
          }
        }
      }
      publish(
        container,
        EVENT.ROI_MODIFIED,
        this._getROIFromFeature(e.feature, this[_pyramidMetadata])
      );
    });

    this[_drawingSource].on(VectorEventType.REMOVEFEATURE, (e) => {
      publish(
        container,
        EVENT.ROI_REMOVED,
        this._getROIFromFeature(e.feature, this[_pyramidMetadata])
      );
    });
  }

  /** Activates the draw interaction for graphic annotation of regions of interest.
   * @param {object} options - Drawing options.
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
  activateDrawInteraction(options = {}) {
    this.deactivateDrawInteraction();
    console.info('activate "draw" interaction');

    const geometryOptionsMapping = {
      point: {
        type: "Point",
        geometryName: "Point",
      },
      circle: {
        type: "Circle",
        geometryName: "Circle",
      },
      box: {
        type: "Circle",
        geometryName: "Box",
        geometryFunction: createRegularPolygon(4),
      },
      polygon: {
        type: "Polygon",
        geometryName: "Polygon",
        freehand: false,
      },
      freehandpolygon: {
        type: "Polygon",
        geometryName: "FreeHandPolygon",
        freehand: true,
      },
      line: {
        type: "LineString",
        geometryName: "Line",
        freehand: false,
        maxPoints: options.maxPoints,
        minPoints: options.minPoints,
      },
      freehandline: {
        type: "LineString",
        geometryName: "FreeHandLine",
        freehand: true,
      },
    };

    if (!("geometryType" in options)) {
      console.error("geometry type must be specified for drawing interaction");
    }

    if (!(options.geometryType in geometryOptionsMapping)) {
      console.error(`unsupported geometry type "${options.geometryType}"`);
    }

    const internalDrawOptions = { source: this[_drawingSource] };
    const geometryDrawOptions = geometryOptionsMapping[options.geometryType];
    const builtInDrawOptions = {
      [Enums.InternalProperties.Marker]:
        options[Enums.InternalProperties.Marker],
      [Enums.InternalProperties.Markup]:
        options[Enums.InternalProperties.Markup],
      vertexEnabled: options.vertexEnabled,
      [Enums.InternalProperties.Label]: options[Enums.InternalProperties.Label],
    };
    const drawOptions = Object.assign(
      internalDrawOptions,
      geometryDrawOptions,
      builtInDrawOptions
    );

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
      drawOptions.condition = _getInteractionBindingCondition(options.bindings);
    }

    this[_interactions].draw = new Draw(drawOptions);
    const container = this[_map].getTargetElement();

    this[_interactions].draw.on(Enums.InteractionEvents.DRAW_START, (event) => {
      event.feature.setProperties(builtInDrawOptions, true);
      event.feature.setId(generateUID());

      /** Set external styles before calling internal annotation hooks */
      _setFeatureStyle(
        event.feature,
        options[Enums.InternalProperties.StyleOptions]
      );

      this[_annotationManager].onDrawStart(event);

      _wireMeasurementsAndQualitativeEvaluationsEvents(
        this[_map],
        event.feature
      );
    });

    this[_interactions].draw.on(Enums.InteractionEvents.DRAW_END, (event) => {
      this[_annotationManager].onDrawEnd(event);
      publish(
        container,
        EVENT.ROI_DRAWN,
        this._getROIFromFeature(event.feature, this[_pyramidMetadata])
      );
    });

    this[_map].addInteraction(this[_interactions].draw);
  }

  /** Deactivates draw interaction. */
  deactivateDrawInteraction() {
    console.info('deactivate "draw" interaction');
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

  /* Activates translate interaction.
   *
   * @param {Object} options - Translation options.
   */
  activateTranslateInteraction(options = {}) {
    this.deactivateTranslateInteraction();

    console.info('activate "translate" interaction');

    const translateOptions = { layers: [this[_drawingLayer]] };

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      translateOptions.condition = _getInteractionBindingCondition(
        options.bindings
      );
    }

    this[_interactions].translate = new Translate(translateOptions);

    this[_map].addInteraction(this[_interactions].translate);
  }

  /** Extracts and transforms the region of interest (ROI) from an Openlayers
   * Feature.
   *
   * @param {object} feature - Openlayers Feature
   * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
   * @param {Object} context - Context
   * @returns {ROI} Region of interest
   * @private
   */
  _getROIFromFeature(feature, pyramid) {
    if (feature !== undefined && feature !== null) {
      const geometry = feature.getGeometry();

      let scoord3d;
      try {
        scoord3d = _geometry2Scoord3d(geometry, pyramid);
      } catch (error) {
        const uid = feature.getId();
        this.removeROI(uid);
        throw error;
      }

      const properties = feature.getProperties();
      // Remove geometry from properties mapping
      const geometryName = feature.getGeometryName();
      delete properties[geometryName];
      const uid = feature.getId();
      const roi = new ROI({ scoord3d, properties, uid });
      return roi;
    }
    return;
  }

  /** Toggles overview map */
  toggleOverviewMap() {
    const controls = this[_map].getControls();
    const overview = controls.getArray().find((c) => c === this[_overviewMap]);
    if (overview) {
      this[_map].removeControl(this[_overviewMap]);
      return;
    }
    this[_map].addControl(this[_overviewMap]);
  }

  /** Deactivates translate interaction. */
  deactivateTranslateInteraction() {
    console.info('deactivate "translate" interaction');
    if (this[_interactions].translate) {
      this[_map].removeInteraction(this[_interactions].translate);
      this[_interactions].translate = undefined;
    }
  }

  /* Activates dragZoom interaction.
   *
   * @param {object} options - DragZoom options.
   */
  activateDragZoomInteraction(options = {}) {
    this.deactivateDragZoomInteraction();

    console.info('activate "dragZoom" interaction');

    const dragZoomOptions = { layers: [this[_drawingLayer]] };

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      dragZoomOptions.condition = _getInteractionBindingCondition(
        options.bindings
      );
    }

    this[_interactions].dragZoom = new DragZoom(dragZoomOptions);

    this[_map].addInteraction(this[_interactions].dragZoom);
  }

  /** Deactivates dragZoom interaction. */
  deactivateDragZoomInteraction() {
    console.info('deactivate "dragZoom" interaction');
    if (this[_interactions].dragZoom) {
      this[_map].removeInteraction(this[_interactions].dragZoom);
      this[_interactions].dragZoom = undefined;
    }
  }

  /* Activates select interaction.
   *
   * @param {object} options - Selection options.
   */
  activateSelectInteraction(options = {}) {
    this.deactivateSelectInteraction();

    console.info('activate "select" interaction');

    const selectOptions = { layers: [this[_drawingLayer]] };

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      selectOptions.condition = _getInteractionBindingCondition(
        options.bindings
      );
    }

    this[_interactions].select = new Select(selectOptions);

    const container = this[_map].getTargetElement();

    this[_interactions].select.on("select", (e) => {
      publish(
        container,
        EVENT.ROI_SELECTED,
        this._getROIFromFeature(e.selected[0], this[_pyramidMetadata])
      );
    });

    this[_map].addInteraction(this[_interactions].select);
  }

  /** Deactivates select interaction. */
  deactivateSelectInteraction() {
    console.info('deactivate "select" interaction');
    if (this[_interactions].select) {
      this[_map].removeInteraction(this[_interactions].select);
      this[_interactions].select = undefined;
    }
  }

  /** Activates dragpan interaction.
   *
   * @param {Object} options - DragPan options.
   */
  activateDragPanInteraction(options = {}) {
    this.deactivateDragPanInteraction();

    console.info('activate "drag pan" interaction');

    const dragPanOptions = {
      features: this[_features],
    };

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      dragPanOptions.condition = _getInteractionBindingCondition(
        options.bindings
      );
    }

    this[_interactions].dragPan = new DragPan(dragPanOptions);

    this[_map].addInteraction(this[_interactions].dragPan);
  }

  /** Deactivate dragpan interaction. */
  deactivateDragPanInteraction() {
    console.info('deactivate "drag pan" interaction');
    if (this[_interactions].dragPan) {
      this[_map].removeInteraction(this[_interactions].dragPan);
      this[_interactions].dragPan = undefined;
    }
  }

  /** Activates snap interaction.
   *
   * @param {Object} options - Snap options.
   */
  activateSnapInteraction(options = {}) {
    this.deactivateSnapInteraction();
    console.info('activate "snap" interaction');
    this[_interactions].snap = new Snap({
      source: this[_drawingSource],
    });

    this[_map].addInteraction(this[_interactions].snap);
  }

  /** Deactivates snap interaction. */
  deactivateSnapInteraction() {
    console.info('deactivate "snap" interaction');
    if (this[_interactions].snap) {
      this[_map].removeInteraction(this[_interactions].snap);
      this[_interactions].snap = undefined;
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

    console.info('activate "modify" interaction');

    const modifyOptions = {
      features: this[_features], // TODO: or source, i.e. 'drawings'???
      insertVertexCondition: ({ feature }) =>
        feature && feature.get("vertexEnabled") === true,
    };

    /**
     * Get conditional mouse bindings
     * See "options.binding" comment in activateDrawInteraction() definition.
     */
    if (options.bindings) {
      modifyOptions.condition = _getInteractionBindingCondition(
        options.bindings
      );
    }

    this[_interactions].modify = new Modify(modifyOptions);

    this[_map].addInteraction(this[_interactions].modify);
  }

  /** Deactivates modify interaction. */
  deactivateModifyInteraction() {
    console.info('deactivate "modify" interaction');
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
    console.info("get all ROIs");
    let rois = [];
    this[_features].forEach((item) => {
      rois.push(this.getROI(item.getId()));
    });
    return rois;
  }

  collapseOverviewMap() {
    this[_controls].overview.setCollapsed(true);
  }

  expandOverviewMap() {
    this[_controls].overview.setCollapsed(true);
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
    console.info(`get ROI ${uid}`);
    const feature = this[_drawingSource].getFeatureById(uid);
    return this._getROIFromFeature(feature, this[_pyramidMetadata]);
  }

  /** Adds a measurement to a region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @param {Object} item - NUM content item representing a measurement
   */
  addROIMeasurement(uid, item) {
    const meaning = item.ConceptNameCodeSequence[0].CodeMeaning;
    console.info(`add measurement "${meaning}" to ROI ${uid}`);
    this[_features].forEach((feature) => {
      const id = feature.getId();
      if (id === uid) {
        const properties = feature.getProperties();
        if (!(Enums.InternalProperties.Measurements in properties)) {
          properties[Enums.InternalProperties.Measurements] = [item];
        } else {
          properties[Enums.InternalProperties.Measurements].push(item);
        }
        feature.setProperties(properties, true);
      }
    });
  }

  /** Adds a qualitative evaluation to a region of interest.
   *
   * @param {string} uid - Unique identifier of the region of interest
   * @param {Object} item - CODE content item representing a qualitative evaluation
   */
  addROIEvaluation(uid, item) {
    const meaning = item.ConceptNameCodeSequence[0].CodeMeaning;
    console.info(`add qualitative evaluation "${meaning}" to ROI ${uid}`);
    this[_features].forEach((feature) => {
      const id = feature.getId();
      if (id === uid) {
        const properties = feature.getProperties();
        if (!(Enums.InternalProperties.Evaluations in properties)) {
          properties[Enums.InternalProperties.Evaluations] = [item];
        } else {
          properties[Enums.InternalProperties.Evaluations].push(item);
        }
        feature.setProperties(properties, true);
      }
    });
  }

  /** Pops the most recently annotated regions of interest.
   *
   * @returns {ROI} Regions of interest.
   */
  popROI() {
    console.info("pop ROI");
    const feature = this[_features].pop();
    return this._getROIFromFeature(feature, this[_pyramidMetadata]);
  }

  /** Adds a regions of interest.
   *
   * @param {ROI} roi - Regions of interest
   * @param {object} roi.properties - ROI properties
   * @param {object} roi.properties.measurements - ROI measurements
   * @param {object} roi.properties.evaluations - ROI evaluations
   * @param {object} roi.properties.label - ROI label
   * @param {object} roi.properties.marker - ROI marker (this is used while we don't have presentation states)
   * @param {object} styleOptions - Style options
   * @param {object} styleOptions.stroke - Style options for the outline of the geometry
   * @param {number[]} styleOptions.stroke.color - RGBA color of the outline
   * @param {number} styleOptions.stroke.width - Width of the outline
   * @param {object} styleOptions.fill - Style options for body the geometry
   * @param {number[]} styleOptions.fill.color - RGBA color of the body
   * @param {object} styleOptions.image - Style options for image
   *
   */
  addROI(roi, styleOptions) {
    console.info(`add ROI ${roi.uid}`);
    const geometry = _scoord3d2Geometry(roi.scoord3d, this[_pyramidMetadata]);
    const featureOptions = { geometry };

    const feature = new Feature(featureOptions);
    _addROIPropertiesToFeature(feature, roi.properties, true);
    feature.setId(roi.uid);

    _wireMeasurementsAndQualitativeEvaluationsEvents(this[_map], feature);

    this[_features].push(feature);

    _setFeatureStyle(feature, styleOptions);
  }

  /** Update properties of regions of interest.
   *
   * @param {object} roi - ROI to be updated
   * @param {string} roi.uid - Unique identifier of the region of interest
   * @param {object} roi.properties - ROI properties
   * @param {object} roi.properties.measurements - ROI measurements
   * @param {object} roi.properties.evaluations - ROI evaluations
   * @param {object} roi.properties.label - ROI label
   * @param {object} roi.properties.marker - ROI marker (this is used while we don't have presentation states)
   */
  updateROI({ uid, properties = {} }) {
    if (!uid) return;
    console.info(`update ROI ${uid}`);

    const feature = this[_drawingSource].getFeatureById(uid);

    _addROIPropertiesToFeature(feature, properties);

    this[_annotationManager].onUpdate(feature);
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
   * @param {object} styleOptions.image - Style options for image
   *
   */
  setROIStyle(uid, styleOptions) {
    this[_features].forEach((feature) => {
      const id = feature.getId();
      if (id === uid) {
        _setFeatureStyle(feature, styleOptions);
      }
    });
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
    console.info(`remove ROI ${uid}`);
    const feature = this[_drawingSource].getFeatureById(uid);

    if (feature) {
      this[_features].remove(feature);
      return;
    }

    /** 
     * If failed to draw/cache feature in drawing source, call onFailure
     * to avoid trash of broken annotations
     */
    this[_annotationManager].onFailure(uid);
  }

  /** Removes all annotated regions of interest. */
  removeAllROIs() {
    console.info("remove all ROIs");
    this[_features].clear();
  }

  /** Hides annotated regions of interest such that they are no longer
   *  visible on the viewport.
   */
  hideROIs() {
    console.info("hide ROIs");
    this[_drawingLayer].setVisible(false);
  }

  /** Shows annotated regions of interest such that they become visible
   *  on the viewport ontop of the images.
   */
  showROIs() {
    console.info("show ROIs");
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
      metadata: options.metadata,
    });

    if (this[_metadata].ImageType[2] === "VOLUME") {
      throw new Error("Viewer cannot render images of type VOLUME.");
    }

    const resizeFactor = options.resizeFactor ? options.resizeFactor : 1;
    const height = this[_metadata].TotalPixelMatrixRows * resizeFactor;
    const width = this[_metadata].TotalPixelMatrixColumns * resizeFactor;
    const extent = [
      0, // min X
      -(height + 1), // min Y
      width, // max X
      -1, // max Y
    ];

    const imageLoadFunction = (image, src) => {
      console.info("load image");
      const studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(
        src
      );
      const seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(
        src
      );
      const sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(src);
      const mediaType = "image/png";
      const queryParams = {
        viewport: [
          this[_metadata].TotalPixelMatrixRows,
          this[_metadata].TotalPixelMatrixColumns,
        ].join(","),
      };
      // We make this optional because a) not all archives currently support
      // this query parameter and b) because ICC Profiles can be large and
      // their inclusion can result in significant overhead.
      if (options.includeIccProfile) {
        queryParams["iccprofile"] = "yes";
      }
      const retrieveOptions = {
        studyInstanceUID: this[_metadata].StudyInstanceUID,
        seriesInstanceUID: this[_metadata].SeriesInstanceUID,
        sopInstanceUID: this[_metadata].SOPInstanceUID,
        mediaTypes: [{ mediaType }],
        queryParams: queryParams,
      };
      options.client
        .retrieveInstanceRendered(retrieveOptions)
        .then((thumbnail) => {
          const blob = new Blob([thumbnail], { type: mediaType });
          image.getImage().src = window.URL.createObjectURL(blob);
        });
    };

    const projection = new Projection({
      code: "DICOM",
      units: "metric",
      extent: extent,
      getPointResolution: (pixelRes, point) => {
        /** DICOM Pixel Spacing has millimeter unit while the projection has
         * has meter unit.
         */
        const mmSpacing = _getPixelSpacing(this[_metadata])[0];
        const spacing = mmSpacing / resizeFactor / 10 ** 3;
        return pixelRes * spacing;
      },
    });

    const rasterSource = new Static({
      crossOrigin: "Anonymous",
      imageExtent: extent,
      projection: projection,
      imageLoadFunction: imageLoadFunction,
      url: "", // will be set by imageLoadFunction()
    });

    this[_imageLayer] = new ImageLayer({ source: rasterSource });

    // The default rotation is 'horizontal' with the slide label on the right
    var rotation = _getRotation(this[_metadata]);
    if (options.orientation === "vertical") {
      // Rotate counterclockwise by 90 degrees to have slide label at the top
      rotation -= 90 * (Math.PI / 180);
    }

    const view = new View({
      center: getCenter(extent),
      rotation: rotation,
      projection: projection,
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
    if (!("container" in options)) {
      console.error("container must be provided for rendering images");
    }
    this[_map].setTarget(options.container);

    this[_map].getInteractions().forEach((interaction) => {
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
      options.orientation = "horizontal";
    }
    super(options);
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
      options.orientation = "vertical";
    }
    super(options);
  }
}

export { LabelImageViewer, OverviewImageViewer, VolumeImageViewer };
