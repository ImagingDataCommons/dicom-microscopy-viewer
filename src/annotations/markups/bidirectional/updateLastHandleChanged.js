import { distance } from "./mathUtils";

const updateLastHandleChanged = (feature, handle) => {
  const coords = feature.getGeometry().getCoordinates();

  const start = {
    x: coords[0][0],
    y: coords[0][1],
  };
  const end = {
    x: coords[1][0],
    y: coords[1][1],
  };

  const distanceStart = distance(handle, start);
  const distanceEnd = distance(handle, end);

  feature.setProperties(
    {
      axisHandle: distanceStart < distanceEnd ? "start" : "end",
    },
    true
  );
};

export default updateLastHandleChanged;
