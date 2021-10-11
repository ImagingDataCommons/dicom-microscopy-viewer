export const InternalProperties = {
  StyleOptions: "styleOptions",
  Markup: "markup",
  Marker: "marker",
  Label: "label",
  Measurements: "measurements",
  Evaluations: "evaluations",
  PresentationState: "presentationState",
  Bidirectional: "bidirectional",
};

export const Marker = {
  Arrow: "arrow",
};

export const Markup = {
  Measurement: "measurement",
  TextEvaluation: "text",
};

export const GeometryType = {
  Line: "line",
};

export const FeatureEvents = {
  PROPERTY_CHANGE: "propertychange",
};

export const MapEvents = {
  POINTER_MOVE: "pointermove",
  POINTER_UP: "pointerup",
  POINTER_DRAG: "pointerdrag",
};

export const HTMLElementEvents = {
  MOUSE_DOWN: "mousedown",
};

export const InteractionEvents = {
  DRAW_START: "drawstart",
  DRAW_END: "drawend",
  DRAW_ABORT: "drawabort",
  TRANSLATE_START: "translatestart",
  MODIFY_START: "modifystart",
  MODIFY_END: "modifyend",
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
  GeometryType
};
