const removeFeature = (feature, viewerProperties) => {
  const { features, drawingSource } = viewerProperties;

  const featureId = feature.getId();
  if (!featureId) {
    return;
  }

  const getFeatureById = (features, id) => {
    return features.getArray().find((f) => f.getId() === id);
  };

  const featureFromDrawingSource = drawingSource.getFeatureById(featureId);
  if (featureFromDrawingSource) {
    drawingSource.removeFeature(feature);
  }

  const featureFromFeatures = getFeatureById(features, featureId);
  if (featureFromFeatures) {
    features.remove(feature);
  }
};

export default removeFeature;
