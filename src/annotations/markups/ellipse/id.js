const ELLIPSE_ID_PREFIX = "ellipse-";

export const getEllipseId = (ellipseHandlesFeature) => {
  return ELLIPSE_ID_PREFIX + ellipseHandlesFeature.getId();
};

export const getEllipseHandlesId = (ellipseFeature) => {
  return ellipseFeature.getId().split(ELLIPSE_ID_PREFIX)[1];
};
