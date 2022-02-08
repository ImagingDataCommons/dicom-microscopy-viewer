import EVENTS from './events.js'
import { AnnotationGroup } from './annotation.js'
import { Mapping } from './mapping.js'
import {
  Comprehensive3DSR,
  MicroscopyBulkSimpleAnnotations,
  ParametricMap,
  Segmentation,
  VLWholeSlideMicroscopyImage,
  formatMetadata,
  groupMonochromeInstances,
  groupColorInstances
} from './metadata.js'
import { ROI } from './roi.js'
import {
  Point,
  Multipoint,
  Polyline,
  Polygon,
  Ellipsoid,
  Ellipse
} from './scoord3d.js'
import {
  applyInverseTransform,
  applyTransform,
  buildInverseTransform,
  buildTransform,
  computeRotation,
  mapSlideCoordToPixelCoord,
  mapPixelCoordToSlideCoord
} from './utils.js'
import {
  LabelImageViewer,
  OverviewImageViewer,
  VolumeImageViewer
} from './viewer.js'
import {
  OpticalPath
} from './opticalPath.js'
import {
  Segment
} from './segment.js'

/** Namespace for annotations.
 *
 * @namespace annotation
 */
const annotation = {
  AnnotationGroup
}

/** Namespace for the viewer.
 *
 * @namespace api
 * @deprecated use the viewer namespace instead
 */
const api = {
  VLWholeSlideMicroscopyImageViewer: VolumeImageViewer
}

/** Namespace for the viewer.
 *
 * @namespace viewer
 */
const viewer = {
  LabelImageViewer,
  OverviewImageViewer,
  VolumeImageViewer
}

/** Namespace for mapping.
 *
 * @namespace mapping
 */
const mapping = {
  Mapping
}

/** Namespace for working with DICOM Metadata.
 *
 * @namespace metadata
 */
const metadata = {
  formatMetadata,
  groupMonochromeInstances,
  groupColorInstances,
  MicroscopyBulkSimpleAnnotations,
  ParametricMap,
  Segmentation,
  VLWholeSlideMicroscopyImage,
  Comprehensive3DSR
}

/** Namespace for optical paths.
 *
 * @namespace opticalPath
 */
const opticalPath = {
  OpticalPath
}

/** Namespace for 3-dimensional spatial coordinates (SCOORD3D).
 *
 * @namespace scoord3d
 */
const scoord3d = {
  Point,
  Multipoint,
  Polyline,
  Polygon,
  Ellipsoid,
  Ellipse
}

/** Namespace for regions of interest (ROI).
 *
 * @namespace roi
 */
const roi = {
  ROI
}

/** Namespace for segments.
 *
 * @namespace segment
 */
const segment = {
  Segment
}

/** Namespace for viewer events.
 *
 * @namespace events
 */
const events = {
  EVENTS
}

/** Namespace for various utilities.
 *
 * @namespace utils
 */
const utils = {
  applyInverseTransform,
  applyTransform,
  buildInverseTransform,
  buildTransform,
  computeRotation,
  mapSlideCoordToPixelCoord,
  mapPixelCoordToSlideCoord
}

export {
  annotation,
  api,
  events,
  mapping,
  metadata,
  opticalPath,
  roi,
  scoord3d,
  segment,
  utils,
  viewer
}
