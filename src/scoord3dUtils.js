import Enums from './enums'
import { Point, Polyline, Polygon, Ellipse } from './scoord3d.js'
import { default as Circle, default as CircleGeometry } from 'ol/geom/Circle'// eslint-disable-line
import { default as PolygonGeometry, fromCircle } from 'ol/geom/Polygon'// eslint-disable-line
import { default as PointGeometry } from 'ol/geom/Point'// eslint-disable-line
import { default as LineStringGeometry } from 'ol/geom/LineString'// eslint-disable-line
import {
  applyInverseTransform,
  applyTransform,
  buildInverseTransform,
  buildTransform
} from './utils.js'

/**
 * Converts a vector graphic from an OpenLayers Feature Geometry into a DICOM SCOORD3D
 * representation.
 *
 * @param {object} feature - OpenLayers Feature
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @returns {Scoord3D} DICOM Microscopy Viewer Scoord3D
 * @private
 */
function geometry2Scoord3d (feature, pyramid) {
  const geometry = feature.getGeometry()
  console.info('map coordinates from pixel matrix to slide coordinate system')
  const frameOfReferenceUID = pyramid[pyramid.length - 1].FrameOfReferenceUID
  const type = geometry.getType()
  if (type === 'Point') {
    let coordinates = geometry.getCoordinates()
    coordinates = geometryCoordinates2scoord3dCoordinates(coordinates, pyramid)
    return new Point({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID
    })
  } else if (type === 'Polygon') {
    /*
     * The first linear ring of the array defines the outer-boundary (surface).
     * Each subsequent linear ring defines a hole in the surface.
     */
    const coordinates = geometry.getCoordinates()[0].map((c) => {
      return geometryCoordinates2scoord3dCoordinates(c, pyramid)
    })
    return new Polygon({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID
    })
  } else if (type === 'LineString') {
    const coordinates = geometry.getCoordinates().map((c) => {
      const result = geometryCoordinates2scoord3dCoordinates(c, pyramid)
      return result
    })
    return new Polyline({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID
    })
  } else if (type === 'Circle') {
    const center = geometry.getCenter()
    const radius = geometry.getRadius()
    // Endpoints of major and  minor axis of the ellipse.
    let coordinates = [
      [center[0] - radius, center[1], 0],
      [center[0] + radius, center[1], 0],
      [center[0], center[1] - radius, 0],
      [center[0], center[1] + radius, 0]
    ]
    coordinates = coordinates.map((c) => {
      return geometryCoordinates2scoord3dCoordinates(c, pyramid)
    })
    return new Ellipse({
      coordinates,
      frameOfReferenceUID: frameOfReferenceUID
    })
  } else {
    // TODO: Combine multiple points into MULTIPOINT.
    console.error(`unknown geometry type "${type}"`)
  }
}

/**
 * Converts a vector graphic from a DICOM SCOORD3D into an Openlayers Geometry
 * representation.
 *
 * @param {Scoord3D} scoord3d - DICOM Microscopy Viewer Scoord3D
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @returns {object} Openlayers Geometry
 * @private
 */
function scoord3d2Geometry (scoord3d, pyramid) {
  console.info('map coordinates from slide coordinate system to pixel matrix')
  const type = scoord3d.graphicType
  const data = scoord3d.graphicData

  if (type === 'POINT') {
    const coordinates = scoord3dCoordinates2geometryCoordinates(data, pyramid)
    return new PointGeometry(coordinates)
  } else if (type === 'POLYLINE') {
    const coordinates = data.map((d) => {
      return scoord3dCoordinates2geometryCoordinates(d, pyramid)
    })
    return new LineStringGeometry(coordinates)
  } else if (type === 'POLYGON') {
    const coordinates = data.map((d) => {
      return scoord3dCoordinates2geometryCoordinates(d, pyramid)
    })
    return new PolygonGeometry([coordinates])
  } else if (type === 'ELLIPSE') {
    // TODO: ensure that the ellipse represents a circle, i.e. that
    // major and minor axis form a right angle and have the same length
    const majorAxisCoordinates = data.slice(0, 2)
    // const minorAxisCoordinates = data.slice(2, 4)
    // Circle is defined by two points: the center point and a point on the
    // circumference.
    const point1 = majorAxisCoordinates[0]
    const point2 = majorAxisCoordinates[1]
    let coordinates = [
      [
        (point1[0] + point2[0]) / parseFloat(2),
        (point1[1] + point2[1]) / parseFloat(2),
        0
      ],
      point2
    ]
    coordinates = coordinates.map((d) => {
      return scoord3dCoordinates2geometryCoordinates(d, pyramid)
    })
    // to flat coordinates
    coordinates = [
      ...coordinates[0].slice(0, 2),
      ...coordinates[1].slice(0, 2)
    ]

    // flat coordinates in combination with opt_layout and no opt_radius are also accepted
    // and internally it calculates the Radius
    return new CircleGeometry(coordinates, null, 'XY')
  } else {
    console.error(`unsupported graphic type "${type}"`)
  }
}

/**
 * Translates coordinates of coordinates in Frame of Reference
 * (slide coordinate system) in millimeter unit into coordinates in
 * Total Pixel Matrix in pixel unit.
 *
 * @param {number[]|number[][]} coordinates - Coordinates in Frame of Reference
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @returns {number[]|number[][]} Coordinates in Total Pixel Matrix
 * @private
 */
function coordinateFormatScoord3d2Geometry (coordinates, pyramid) {
  let transform = false
  if (!Array.isArray(coordinates[0])) {
    coordinates = [coordinates]
    transform = true
  }
  const metadata = pyramid[pyramid.length - 1]
  const orientation = metadata.ImageOrientationSlide
  const spacing = getPixelSpacing(metadata)
  const origin = metadata.TotalPixelMatrixOriginSequence[0]
  const offset = [
    Number(origin.XOffsetInSlideCoordinateSystem),
    Number(origin.YOffsetInSlideCoordinateSystem)
  ]

  let outOfFrame = false
  const affine = buildInverseTransform({
    offset,
    orientation,
    spacing
  })
  coordinates = coordinates.map((c) => {
    if (c[0] > 25 || c[1] > 76) {
      outOfFrame = true
    }
    const slideCoord = [c[0], c[1]]
    const pixelCoord = applyInverseTransform({
      coordinate: slideCoord,
      affine
    })
    return [pixelCoord[0], -(pixelCoord[1] + 1), 0]
  })
  if (transform) {
    return coordinates[0]
  }
  if (outOfFrame) {
    console.warning(
      'found coordinates outside slide coordinate system 25 x 76 mm'
    )
  }
  return coordinates
}

/**
 * Get coordinate with offset.
 *
 * @param {object} feature feature
 * @param {number} offset offset
 * @param {object} map map
 * @returns {array} coordinates with offset
 * @private
 */
function coordinateWithOffset (feature, offset, map) {
  const geometry = feature.getGeometry()
  const coordinates = geometry.getLastCoordinate()
  const [x, y] = coordinates

  const view = map.getView()
  const resolution = view.getResolution()
  const realOffset = offset * resolution

  return !feature.get(Enums.InternalProperties.Marker) &&
    feature.get(Enums.InternalProperties.Markup) === Enums.Markup.TextEvaluation
    ? coordinates
    : [x - realOffset, y - realOffset]
}

/**
 * Gets feature's geometry area.
 *
 * @param {Feature} feature
 * @returns {number} geometry area
 * @private
 */
function getFeatureArea (feature) {
  const geometry = feature.getGeometry()
  if (geometry instanceof Circle) {
    return fromCircle(geometry).getArea()
  }
  return geometry.getArea && geometry.getArea()
}

/**
 * Extracts value of Pixel Spacing attribute from metadata.
 *
 * @param {object} metadata - Metadata of a DICOM VL Whole Slide Microscopy Image instance
 * @returns {number[]} Spacing between pixel columns and rows in millimeter
 * @private
 */
function getPixelSpacing (metadata) {
  if(!metadata.SharedFunctionalGroupsSequence ) return metadata.PixelSpacing;
  const functionalGroup = metadata.SharedFunctionalGroupsSequence[0];
  const pixelMeasures = functionalGroup.PixelMeasuresSequence[0];
  return pixelMeasures.PixelSpacing
}

/**
 * Gets feature's geometry length.
 *
 * @param {Feature} feature
 * @returns {number} geometry length
 * @private
 */
function getFeatureLength (feature) {
  const geometry = feature.getGeometry()
  return geometry.getLength && geometry.getLength()
}

/**
 * Translates coordinates of Total Pixel Matrix in pixel unit into coordinates
 * in Frame of Reference (slide coordinate system) in millimeter unit.
 *
 * @param {number[]|number[][]} coordinates - Coordinates in Total Pixel Matrix
 * @param {Object[]} pyramid - Metadata for resolution levels of image pyramid
 * @returns {number[]|number[][]} Coordinates in Frame of Reference
 * @private
 */
function coordinateFormatGeometry2Scoord3d (coordinates, pyramid) {
  let transform = false
  if (!Array.isArray(coordinates[0])) {
    coordinates = [coordinates]
    transform = true
  }
  const metadata = pyramid[pyramid.length - 1]
  const origin = metadata.TotalPixelMatrixOriginSequence[0]
  const orientation = metadata.ImageOrientationSlide
  const spacing = getPixelSpacing(metadata)
  const offset = [
    Number(origin.XOffsetInSlideCoordinateSystem),
    Number(origin.YOffsetInSlideCoordinateSystem)
  ]

  const affine = buildTransform({
    offset,
    orientation,
    spacing
  })
  coordinates = coordinates.map((c) => {
    const pixelCoord = [c[0], (c[1] + 1)]
    const slideCoord = applyTransform({ coordinate: pixelCoord, affine })
    return [slideCoord[0], slideCoord[1], 0]
  })
  if (transform) {
    return coordinates[0]
  }
  return coordinates
}

/**
 * Converts openlayers geometry coordinates into scoord3d coordinates.
 *
 * @param {array} coordinates - Array of Openlayers map coordinates
 * @param {object} pyramid - Metadata of images in the pyramid
 * @returns {array} Array of slide coordinates
 * @private
 */
function geometryCoordinates2scoord3dCoordinates (coordinates, pyramid) {
  return coordinateFormatGeometry2Scoord3d(
    [coordinates[0], coordinates[1], coordinates[2] || 0],
    pyramid
  )
}

/**
 * Converts scoord3d coordinates into openlayers geometry coordinates.
 *
 * @param {array} coordinates - Array of slide coordinates
 * @param {object} pyramid - Metadata of images in the pyramid
 * @returns {array} Array of Openlayers map coordinates
 * @private
 */
function scoord3dCoordinates2geometryCoordinates (coordinates, pyramid) {
  return coordinateFormatScoord3d2Geometry(
    [coordinates[0], coordinates[1], coordinates[2]],
    pyramid
  )
}

/**
 * Get area of polygon using shoelace algorithm.
 * Return absolute value of half the sum.
 * (The value is halved as we are summing up triangles, not rectangles)
 *
 * @param {array} coordinates - Array of slide coordinates
 * @returns {number} Area
 * @private
 */
function areaOfPolygon (coordinates) {
  const n = coordinates.length
  let area = 0.0
  let j = n - 1

  for (let i = 0; i < n; i++) {
    area +=
      (coordinates[j][0] + coordinates[i][0]) *
      (coordinates[j][1] - coordinates[i][1])
    j = i /** j is previous vertex to i */
  }

  return Math.abs(area / 2.0)
}

/**
 * Get feature's geometry scoord3d length
 *
 * @param {Feature} feature - Openlayers feature
 * @param {object} pyramid - Metadata of images in the pyramid
 * @returns {number} Length
 * @private
 */
function getFeatureScoord3dLength (feature, pyramid) {
  const geometry = feature.getGeometry()
  const type = geometry.getType()

  if (type === 'LineString') {
    const coordinates = geometry.getCoordinates()
    if (coordinates && coordinates.length) {
      const scoord3dCoordinates = coordinates.map((c) =>
        geometryCoordinates2scoord3dCoordinates(c, pyramid)
      )
      let length = 0
      for (let i = 0; i < (scoord3dCoordinates.length - 1); i++) {
        const p1 = scoord3dCoordinates[i]
        const p2 = scoord3dCoordinates[i + 1]
        let xLen = p2[0] - p1[0]
        let yLen = p2[1] - p1[1]
        xLen *= xLen
        yLen *= yLen
        length += Math.sqrt(xLen + yLen) * 1000
      }
      return length
    } else {
      throw new Error('ROI does not have any coordinates.')
    }
  }
}

/**
 * Get feature's geometry scoord3d area
 *
 * @param {Feature} feature - Openlayers feature
 * @param {object} pyramid - Metadata of images in the pyramid
 * @returns {number} Area
 * @private
 */
function getFeatureScoord3dArea (feature, pyramid) {
  let geometry = feature.getGeometry()
  let type = geometry.getType()

  if (type === 'Circle') {
    geometry = fromCircle(geometry)
    type = geometry.getType()
  }

  if (type === 'Polygon') {
    const coordinates = geometry.getCoordinates()
    if (coordinates && coordinates.length) {
      const scoord3dCoordinates = geometry
        .getCoordinates()[0]
        .map((c) => geometryCoordinates2scoord3dCoordinates(c, pyramid))
      return areaOfPolygon(scoord3dCoordinates) * 1000
    }
  }
}

export {
  areaOfPolygon,
  getFeatureScoord3dArea,
  getFeatureScoord3dLength,
  scoord3d2Geometry,
  getPixelSpacing,
  coordinateFormatScoord3d2Geometry,
  geometryCoordinates2scoord3dCoordinates,
  scoord3dCoordinates2geometryCoordinates,
  coordinateFormatGeometry2Scoord3d,
  coordinateWithOffset,
  getFeatureArea,
  getFeatureLength,
  geometry2Scoord3d
}
