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
  CHANGE: "change",
  GEOMETRY_CHANGE: "change:geometry",
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
  DRAW_ABORT: "drawabort",
  TRANSLATE_START: "translatestart",
  TRANSLATE_END: "translateend",
  MODIFY_START: "modifystart",
  MODIFY_END: "modifyend",
};

export const FeatureGeometryEvents = {
  CHANGE: "change",
};

export const RelationshipTypes = {
  HAS_OBS_CONTEXT: "HAS OBS CONTEXT",
};

export const SOPClassUIDs = {
  COMPREHENSIVE_3D_SR: "1.2.840.10008.5.1.4.1.1.88.34",
  MICROSCOPY_BULK_SIMPLE_ANNOTATIONS: "1.2.840.10008.5.1.4.1.1.91.1",
  PARAMETRIC_MAP: "1.2.840.10008.5.1.4.1.1.30",
  SEGMENTATION: "1.2.840.10008.5.1.4.1.1.66.4",
  VL_WHOLE_SLIDE_MICROSCOPY_IMAGE: "1.2.840.10008.5.1.4.1.1.77.1.6",
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
  SOPClassUIDs,
};
