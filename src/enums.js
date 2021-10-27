export const InternalProperties = {
  StyleOptions: "styleOptions",
  Markup: "markup",
  Marker: "marker",
  Label: "label",
  Measurements: "measurements",
  Evaluations: "evaluations",
  PresentationState: "presentationState",
  Bidirectional: "bidirectional",
  Ellipse: "isEllipse",
  ReadOnly: "isReadOnly",
  IsSilentFeature: "isSilent",
  CantBeTranslated: "cantBeTranslated",
  VertexEnabled: "vertexEnabled"
};

export const Bidirectional = {
  IsShortAxis: "isShortAxis",
  IsLongAxis: "isLongAxis",
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
  Circle: "circle",
  Ellipse: "ellipse",
};

export const FeatureEvents = {
  PROPERTY_CHANGE: "propertychange",
};

export const MapEvents = {
  POINTER_MOVE: "pointermove",
  POINTER_UP: "pointerup",
  POINTER_DOWN: "pointerdown",
  POINTER_DRAG: "pointerdrag",
  MOVE_START: "movestart",
  MOVE_END: "moveend"
};

export const HTMLElementEvents = {
  MOUSE_DOWN: "mousedown",
  MOUSE_UP: "mouseup",
  MOUSE_MOVE: "mousemove",
};

export const InteractionEvents = {
  DRAW_START: "drawstart",
  DRAW_END: "drawend",
  DRAW_ABORT: "drawabort",
  TRANSLATE_START: "translatestart",
  MODIFY_START: "modifystart",
  MODIFY_END: "modifyend",
  TRANSLATING: "translating",
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
  GeometryType,
  Bidirectional
};
