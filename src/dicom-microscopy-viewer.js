import { DICOMMicroscopyViewer } from './api.js';
import { Point, Multipoint, Polyline, Circle, Ellipse } from './scoord.js';

let api = {
  DICOMMicroscopyViewer,
};
let scoord = {
  Point,
  Multipoint,
  Polyline,
  Circle,
  Ellipse
};

export { api, scoord };
