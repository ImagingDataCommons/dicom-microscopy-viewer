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
  getNormalizedFeature() {
    return null;
  },
};

export default annotationInterface;
