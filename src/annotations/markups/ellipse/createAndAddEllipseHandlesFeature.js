import LineString from "ol/geom/LineString";
import { Feature } from "ol";
import styles, { ellipseHandlesStyleFunction } from "./styles";
import Enums from "../../../enums";
import addFeature from './addFeature';

const createAndAddEllipseHandlesFeature = (
  ellipseROIFeature,
  viewerProperties
) => {
  const [coords] = ellipseROIFeature.getGeometry().getCoordinates();
  const middle = Math.round(coords.length / 2);
  const padding = 700; /** TODO: Calculate based on radius */
  const paddedStart = [coords[0][0] + padding, coords[0][1] + padding];
  const paddedEnd = [coords[middle][0] - padding, coords[middle][1] - padding];
  const handles = new LineString([paddedStart, paddedEnd]);
  const ellipseHandlesFeature = new Feature({ geometry: handles });
  ellipseHandlesFeature.setProperties(
    {
      isEllipseHandles: true,
      [Enums.InternalProperties.IsSilentFeature]: true,
    },
    true
  );
  ellipseHandlesFeature.setStyle(ellipseHandlesStyleFunction);
  ellipseHandlesFeature.set(Enums.InternalProperties.StyleOptions, styles);
  ellipseHandlesFeature.setId(ellipseROIFeature.getId());

  addFeature(ellipseHandlesFeature, viewerProperties);

  return ellipseHandlesFeature;
};

export default createAndAddEllipseHandlesFeature;

// todo: try removing roi and adding roi 
// todo: try just using the same id