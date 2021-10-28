const getFeatureById = (id, viewerProperties) => {
  const { drawingSource, features } = viewerProperties;

  const featureFromFeatures = features.getArray().find((f) => f.getId() === id);
  if (featureFromFeatures) {
    return featureFromFeatures;
  }

  const featureFromDrawingSource = drawingSource.getFeatureById(id);
  if (featureFromDrawingSource) {
    return featureFromDrawingSource;
  }
};

export default getFeatureById;
