import { VLWholeSlideMicroscopyImageViewer } from './api.js';
import { ROI } from './roi.js';
import {
  Point,
  Multipoint,
  Polyline,
  Polygon,
  Circle,
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
  Circle,
  Ellipse
};
let roi = {
  ROI,
}

export { api, scoord3d, roi };
