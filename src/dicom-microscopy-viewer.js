import EVENTS from './events.js';
import { VLWholeSlideMicroscopyImage, formatMetadata } from './metadata.js';
import { ROI } from './roi.js';
import {
  Point,
  Multipoint,
  Polyline,
  Polygon,
  Ellipsoid,
  Ellipse,
} from './scoord3d.js';
import {
  mapSlideCoordToPixelCoord,
  mapPixelCoordToSlideCoord,
} from './utils.js';
import {
  LabelImageViewer,
  OverviewImageViewer,
  VolumeImageViewer
} from './viewer.js';


/** Namespace for the viewer.
 *
 * @namespace api
 * @deprecated use the viewer namespace instead
 */
const api = {
  VLWholeSlideMicroscopyImageViewer: VolumeImageViewer
};

/** Namespace for the viewer.
 *
 * @namespace viewer
 */
const viewer = {
  LabelImageViewer,
  OverviewImageViewer,
  VolumeImageViewer,
};

/** Namespace for working with DICOM Metadata.
 *
 * @namespace metadata
 */
const metadata = {
  formatMetadata,
  VLWholeSlideMicroscopyImage,
};

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
};

/** Namespace for regions of interest (ROI).
 *
 * @namespace roi
 */
const roi = {
  ROI,
}

/** Namespace for viewer events.
 *
 * @namespace events
 */
const events = {
  EVENTS,
};

/** Namespace for various utilities.
 *
 * @namespace utils
 */
const utils = {
  mapSlideCoordToPixelCoord,
  mapPixelCoordToSlideCoord,
};

export { api, events, metadata, roi, scoord3d, utils, viewer };
