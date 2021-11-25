import { distance } from "./mathUtils";

const getDraggedHandleIndex = (feature, handle) => {
  const { isShortAxis, isLongAxis } = feature.getProperties();
  const coords = feature.getGeometry().getCoordinates();

  const start = { x: coords[0][0], y: coords[0][1] };
  const end = { x: coords[1][0], y: coords[1][1] };

  const distanceStart = distance(handle, start);
  const distanceEnd = distance(handle, end);

  const axisHandle = distanceStart < distanceEnd ? "start" : "end";

  if (isShortAxis === true && axisHandle === "start") {
    return 1;
  } else if (isShortAxis === true && axisHandle === "end") {
    return 2;
  } else if (isLongAxis === true && axisHandle === "start") {
    return 3;
  } else if (isLongAxis === true && axisHandle === "end") {
    return 4;
  } else {
    return -1;
  }
};

export default getDraggedHandleIndex;
