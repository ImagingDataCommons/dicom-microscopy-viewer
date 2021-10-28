import { generateUID } from "../../../utils";

const addFeature = (feature, viewerProperties) => {
  const { features, drawingSource } = viewerProperties;

  let featureId = feature.getId();
  if (!featureId) {
    featureId = generateUID();
  }

  const getFeatureById = (features, id) => {
    return features.getArray().find((f) => f.getId() === id);
  };

  const featureBeingAdded = drawingSource.getFeatureById(featureId);
  if (!featureBeingAdded) {
    drawingSource.addFeature(feature);
  }

  const featureBeingAddedInFeaturesCollection = getFeatureById(
    features,
    featureId
  );
  if (!featureBeingAddedInFeaturesCollection) {
    features.push(feature);
  }
};

export default addFeature;
