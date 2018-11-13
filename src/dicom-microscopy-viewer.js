import { VLWholeSlideMicroscopyImageViewer } from './api.js';
import { ROI } from './roi.js';
import {
  Point,
  Multipoint,
  Polyline,
  Circle,
  Ellipse,
} from './scoord.js';

let api = {
  VLWholeSlideMicroscopyImageViewer,
};
let scoord = {
  Point,
  Multipoint,
  Polyline,
  Circle,
  Ellipse
};
let roi = {
  ROI,
}

export { api, scoord, roi };
