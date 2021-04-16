export const InternalProperties = {
  StyleOptions: "styleOptions",
  Markup: "markup",
  Marker: "marker",
  Label: "label",
  Measurements: "measurements",
  Evaluations: "evaluations",
};

export const Marker = {
  Arrow: "arrow",
};

export const Markup = {
  Measurement: "measurement",
  TextEvaluation: "text",
};

export const FeatureEvents = {
  PROPERTY_CHANGE: "propertychange",
};

export const MapEvents = {
  POINTER_MOVE: "pointermove",
  POINTER_UP: "pointerup",
};

export const HTMLElementEvents = {
  MOUSE_DOWN: "mousedown",
};

export const InteractionEvents = {
  DRAW_START: "drawstart",
  DRAW_END: "drawend",
  TRANSLATE_START: "translatestart",
  MODIFY_START: "modifystart",
};

export const FeatureGeometryEvents = {
  CHANGE: "change",
};

export const RelationshipTypes = {
  HAS_OBS_CONTEXT: "HAS OBS CONTEXT",
};

export default {
  Marker,
  Markup,
  FeatureEvents,
  FeatureGeometryEvents,
  RelationshipTypes,
  InteractionEvents,
  HTMLElementEvents,
  InternalProperties,
  MapEvents,
};
