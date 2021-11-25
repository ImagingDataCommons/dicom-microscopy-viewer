const SHORT_AXIS_ID_PREFIX = "short-axis-";

export const getShortAxisId = (longAxisFeature) => {
  return SHORT_AXIS_ID_PREFIX + longAxisFeature.getId();
};

export const getLongAxisId = (shortAxisFeature) => {
  return shortAxisFeature.getId().split(SHORT_AXIS_ID_PREFIX)[1];
};
