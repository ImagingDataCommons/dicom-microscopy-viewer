import { VLWholeSlideMicroscopyImageViewer } from './api.js';
import { ROI } from './roi.js';
import {
  Point,
  Multipoint,
  Polyline,
  Polygon,
  Ellipsoid,
  Ellipse,
} from './scoord3d.js';

let api = {
  VLWholeSlideMicroscopyImageViewer,
};
let scoord3d = {
  Point,
  Multipoint,
  Polyline,
  Polygon,
  Ellipsoid,
  Ellipse
};
let roi = {
  ROI,
}

export { api, scoord3d, roi };
