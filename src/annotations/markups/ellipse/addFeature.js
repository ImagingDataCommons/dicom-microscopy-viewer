import { generateUID } from "../../../utils";

const addFeature = (feature, viewerProperties) => {
  const { features, drawingSource } = viewerProperties;

  let featureId = feature.getId();
  if (!featureId) {
    featureId = generateUID();
  }

  const getFeatureById = (features, id) =>
    features.getArray().find((f) => f.getId() === id);

  const featureFromDrawingSource = drawingSource.getFeatureById(featureId);
  if (!featureFromDrawingSource) {
    drawingSource.addFeature(feature);
  }

  const featuresFromFeatures = getFeatureById(features, featureId);
  if (!featuresFromFeatures) {
    features.push(feature);
  }
};

export default addFeature;
