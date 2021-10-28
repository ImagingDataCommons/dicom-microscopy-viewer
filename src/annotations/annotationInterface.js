import dcmjs from "dcmjs";
import Feature from "ol/Feature";

import _MarkupManager from "./markups/_MarkupManager";

/** Enums */
import Enums from "../enums";

const annotationInterface = {
  onAdd(feature) {},
  onInit() {},
  onFailure(uid) {},
  onRemove(feature) {},
  onUpdate(feature) {},
  onDrawStart(event, drawingOptions) {},
  onDrawEnd(event, drawingOptions) {},
  onDrawAbort(event) {},
  onSetFeatureStyle(feature, styleOptions) {},
  getMeasurements() {
    return [];
  },
};

export default annotationInterface;
