import EVENTS from './events.js'
import {
  Comprehensive3DSR,
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
  BlendingInformation
} from './channel.js'

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

/** Namespace for working with DICOM Metadata.
 *
 * @namespace metadata
 */
const metadata = {
  formatMetadata,
  groupMonochromeInstances,
  groupColorInstances,
  VLWholeSlideMicroscopyImage,
  Comprehensive3DSR,
  BlendingInformation
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

export { api, events, metadata, roi, scoord3d, utils, viewer }
