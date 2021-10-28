import dcmjs from "dcmjs";
import { getFeatureScoord3dArea } from "../../../scoord3dUtils";
import { getEllipseHandlesId, getEllipseId } from "./id";

const getMeasurements = (feature, viewerProperties) => {
  const { drawingSource, pyramid } = viewerProperties;

  const { isEllipseHandles, isEllipseShape } = feature.getProperties();
  const isEllipse = isEllipseHandles || isEllipseShape;

  if (isEllipse) {
    let ellipseHandlesFeature;
    let ellipseFeature;
    let points = [];
    let area = 0;

    const getEllipsePoints = (ellipseFeature) =>
      ellipseFeature
        .getGeometry()
        .getCoordinates()
        .map((coordinate) => ({
          x: coordinate[0],
          y: coordinate[1],
        }));

    if (isEllipseHandles) {
      ellipseHandlesFeature = feature;

      const ellipseFeatureId = getEllipseId(ellipseHandlesFeature);
      ellipseFeature = drawingSource.getFeatureById(ellipseFeatureId);

      if (ellipseFeature) {
        area = getFeatureScoord3dArea(ellipseFeature, pyramid);
        points = getEllipsePoints(ellipseFeature);
      }
    }

    if (isEllipseShape) {
      ellipseFeature = feature;

      const ellipseHandlesFeatureId = getEllipseHandlesId(ellipseFeature);
      ellipseHandlesFeature = drawingSource.getFeatureById(
        ellipseHandlesFeatureId
      );

      area = getFeatureScoord3dArea(ellipseFeature, pyramid);
      points = getEllipsePoints(ellipseFeature);
    }

    const ellipse = new dcmjs.utilities.TID300.Ellipse({
      area,
      points,
    });

    const contentItem = ellipse.contentItem();
    const numContentItems = contentItem.filter((ci) => ci.ValueType === "NUM");
    const measurements = numContentItems.map((measurement) => {
      /** Update format wrong in dcmjs */
      measurement.ConceptNameCodeSequence = [
        measurement.ConceptNameCodeSequence,
      ];
      return measurement;
    });

    if (ellipseFeature && ellipseHandlesFeature) {
      /** Set measurements here because main feature (handle) doesn't have measurement. */
      ellipseFeature.setProperties({ measurements }, true);
      ellipseHandlesFeature.setProperties({ measurements }, true);
    }

    return measurements;
  }
  return [];
};

export default getMeasurements;
