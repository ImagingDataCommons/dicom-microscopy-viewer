import Enums from './enums';
import { Point, Polyline, Polygon, Ellipse } from './scoord3d.js';
import CircleGeometry from 'ol/geom/Circle';
import PolygonGeometry, { fromCircle } from 'ol/geom/Polygon';
import PointGeometry from 'ol/geom/Point';
import LineStringGeometry from 'ol/geom/LineString';

import { applyInverseTransform, applyTransform } from './utils.js';

/**
 * Converts a vector graphic from an OpenLayers Feature Geometry into a DICOM SCOORD3D
 * representation.
 *
 * @param {object} feature - OpenLayers Feature
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @param {number[][]} affine - 3x3 affine transformation matrix
 * @returns {Scoord3D} DICOM Microscopy Viewer Scoord3D
 * @private
 */
function _geometry2Scoord3d(feature, pyramid, affine) {
  const geometry = feature.getGeometry();
  const frameOfReferenceUID = pyramid[pyramid.length - 1].FrameOfReferenceUID;
  const type = geometry.getType();
  if (type === 'Point') {
    let coordinates = geometry.getCoordinates();
    coordinates = _geometryCoordinates2scoord3dCoordinates(
      coordinates,
      pyramid,
      affine
    );
    return new Point({ coordinates, frameOfReferenceUID });
  } else if (type === 'Polygon') {
    /*
     * The first linear ring of the array defines the outer-boundary (surface).
     * Each subsequent linear ring defines a hole in the surface.
     */
    const coordinates = geometry.getCoordinates()[0].map((c) => {
      return _geometryCoordinates2scoord3dCoordinates(c, pyramid, affine);
    });
    return new Polygon({ coordinates, frameOfReferenceUID });
  } else if (type === 'LineString') {
    const coordinates = geometry.getCoordinates().map((c) => {
      return _geometryCoordinates2scoord3dCoordinates(c, pyramid, affine);
    });
    return new Polyline({ coordinates, frameOfReferenceUID });
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
    coordinates = coordinates.map((c) => {
      return _geometryCoordinates2scoord3dCoordinates(c, pyramid, affine);
    });
    return new Ellipse({ coordinates, frameOfReferenceUID });
  } else {
    // TODO: Combine multiple points into MULTIPOINT.
    console.error(`unknown geometry type "${type}"`);
  }
}

/**
 * Converts a vector graphic from a DICOM SCOORD3D into an Openlayers Geometry
 * representation.
 *
 * @param {Scoord3D} scoord3d - DICOM Microscopy Viewer Scoord3D
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @param {number[][]} affine - 3x3 affine transformation matrix
 * @returns {object} Openlayers Geometry
 * @private
 */
function _scoord3d2Geometry(scoord3d, pyramid, affine) {
  const type = scoord3d.graphicType;
  const data = scoord3d.graphicData;

  if (type === 'POINT') {
    const coordinates = _scoord3dCoordinates2geometryCoordinates(
      data,
      pyramid,
      affine
    );
    return new PointGeometry(coordinates);
  } else if (type === 'POLYLINE') {
    const coordinates = data.map((d) => {
      return _scoord3dCoordinates2geometryCoordinates(d, pyramid, affine);
    });
    return new LineStringGeometry(coordinates);
  } else if (type === 'POLYGON') {
    const coordinates = data.map((d) => {
      return _scoord3dCoordinates2geometryCoordinates(d, pyramid, affine);
    });
    return new PolygonGeometry([coordinates]);
  } else if (type === 'ELLIPSE') {
    // TODO: ensure that the ellipse represents a circle, i.e. that
    // major and minor axis form a right angle and have the same length
    const majorAxisCoordinates = data.slice(0, 2);
    // const minorAxisCoordinates = data.slice(2, 4)
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
      return _scoord3dCoordinates2geometryCoordinates(d, pyramid, affine);
    });
    // to flat coordinates
    coordinates = [
      ...coordinates[0].slice(0, 2),
      ...coordinates[1].slice(0, 2),
    ];

    // flat coordinates in combination with opt_layout and no opt_radius are also accepted
    // and internally it calculates the Radius
    return new CircleGeometry(coordinates, null, 'XY');
  } else {
    console.error(`unsupported graphic type "${type}"`);
  }
}

/**
 * Get coordinate with offset.
 *
 * @param {object} feature feature
 * @param {number} offset offset
 * @returns {array} coordinates with offset
 * @private
 */
function coordinateWithOffset(feature, offset = 70) {
  const geometry = feature.getGeometry();
  const coordinates = geometry.getLastCoordinate();
  const [x, y] = coordinates;
  return !feature.get(Enums.InternalProperties.Marker) &&
    feature.get(Enums.InternalProperties.Markup) === Enums.Markup.TextEvaluation
    ? coordinates
    : [x - offset, y - offset];
}

/**
 * Extracts value of Pixel Spacing attribute from metadata.
 *
 * @param {object} metadata - Metadata of a DICOM VL Whole Slide Microscopy Image instance
 * @returns {number[]} Spacing between pixel columns and rows in millimeter
 * @private
 */
function getPixelSpacing(metadata) {
  const functionalGroup = metadata.SharedFunctionalGroupsSequence[0];
  const pixelMeasures = functionalGroup.PixelMeasuresSequence[0];
  return [
    Number(pixelMeasures.PixelSpacing[0]),
    Number(pixelMeasures.PixelSpacing[1]),
  ];
}

/**
 * Map OpenLayers geometry coordinates into SCOORD3D coordinates.
 *
 * @param {array} coordinates - Array of Openlayers map coordinates
 * @param {object} pyramid - Metadata of images in the pyramid
 * @param {number[][]} affine - 3x3 affine transformation matrix
 * @returns {array} Array of slide coordinates
 * @private
 */
function _geometryCoordinates2scoord3dCoordinates(
  coordinates,
  pyramid,
  affine
) {
  let transform = false;
  if (!Array.isArray(coordinates[0])) {
    coordinates = [coordinates];
    transform = true;
  }
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

/**
 * Map SCOORD3D coordinates into OpenLayers geometry coordinates.
 *
 * @param {array} coordinates - Array of slide coordinates
 * @param {object} pyramid - Metadata of images in the pyramid
 * @param {number[][]} affine - 3x3 affine transformation matrix
 * @returns {array} Array of Openlayers map coordinates
 * @private
 */
function _scoord3dCoordinates2geometryCoordinates(
  coordinates,
  pyramid,
  affine
) {
  let transform = false;
  if (!Array.isArray(coordinates[0])) {
    coordinates = [coordinates];
    transform = true;
  }
  let outOfFrame = false;
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
    console.warn(
      'found coordinates outside slide coordinate system 25 x 76 mm'
    );
  }
  return coordinates;
}

/**
 * Compute the area of a polygon.
 *
 * Return absolute value of half the sum.
 * (The value is halved as we are summing up triangles, not rectangles)
 *
 * @param {array} coordinates - Array of slide coordinates
 * @returns {number} Area
 * @private
 */
function _computeAreaOfPolygon(coordinates) {
  const n = coordinates.length;
  let area = 0.0;
  let j = n - 1;

  for (let i = 0; i < n; i++) {
    area +=
      (coordinates[j][0] + coordinates[i][0]) *
      (coordinates[j][1] - coordinates[i][1]);
    j = i; /** j is previous vertex to i */
  }

  return Math.abs(area / 2.0);
}

/**
 * Get the length of an OpenLayers feature's geometry based on SCOORD3D.
 *
 * @param {Feature} feature - Openlayers feature
 * @param {object} pyramid - Metadata of images in the pyramid
 * @param {number[][]} affine - 3x3 affine transformation matrix
 * @returns {number} Length in millimeter
 * @private
 */
function _getFeatureLength(feature, pyramid, affine) {
  const geometry = feature.getGeometry();
  const type = geometry.getType();

  if (type === 'LineString') {
    const coordinates = geometry.getCoordinates();
    if (coordinates && coordinates.length) {
      const scoord3dCoordinates = coordinates.map((c) =>
        _geometryCoordinates2scoord3dCoordinates(c, pyramid, affine)
      );
      let length = 0;
      for (let i = 0; i < scoord3dCoordinates.length - 1; i++) {
        const p1 = scoord3dCoordinates[i];
        const p2 = scoord3dCoordinates[i + 1];
        let xLen = p2[0] - p1[0];
        let yLen = p2[1] - p1[1];
        xLen *= xLen;
        yLen *= yLen;
        length += Math.sqrt(xLen + yLen) * 1000;
      }
      return length;
    } else {
      throw new Error('ROI does not have any coordinates.');
    }
  }
}

/**
 * Get the area of a OpenLayers feature's geometry based on SCOORD3D.
 *
 * @param {Feature} feature - Openlayers feature
 * @param {object} pyramid - Metadata of images in the pyramid
 * @param {number[][]} affine - 3x3 affine transformation matrix
 * @returns {number} Area in square millimeter
 * @private
 */
function _getFeatureArea(feature, pyramid, affine) {
  let geometry = feature.getGeometry();
  let type = geometry.getType();

  if (type === 'Circle') {
    geometry = fromCircle(geometry);
    type = geometry.getType();
  }

  if (type === 'Polygon') {
    const coordinates = geometry.getCoordinates();
    if (coordinates && coordinates.length) {
      const scoord3dCoordinates = geometry.getCoordinates()[0].map((c) => {
        return _geometryCoordinates2scoord3dCoordinates(c, pyramid, affine);
      });
      return _computeAreaOfPolygon(scoord3dCoordinates) * 1000;
    }
  }
}

export {
  coordinateWithOffset,
  getPixelSpacing,
  _getFeatureArea,
  _getFeatureLength,
  _scoord3d2Geometry,
  _geometryCoordinates2scoord3dCoordinates,
  _scoord3dCoordinates2geometryCoordinates,
  _geometry2Scoord3d,
};
