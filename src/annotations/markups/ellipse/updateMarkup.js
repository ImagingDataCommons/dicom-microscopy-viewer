import { getFeatureScoord3dArea } from "../../../scoord3dUtils";
import { getUnitSuffix } from "../../../utils";
import { getEllipseId } from "./id";

const updateMarkup = (
  feature,
  { markupManager, drawingSource, map, pyramid }
) => {
  const ellipseFeatureId = getEllipseId(feature);
  const ellipseFeature = drawingSource.getFeatureById(ellipseFeatureId);
  if (ellipseFeature) {
    const view = map.getView();
    const unitSuffix = getUnitSuffix(view);
    const ellipseGeometry = ellipseFeature.getGeometry();
    const area = getFeatureScoord3dArea(ellipseFeature, pyramid);

    let sum = 0;
    let count = 0;
    let sumSquared = 0;
    let min = 0;
    let max = 0;
    const pixels = ellipseGeometry.getCoordinates()[0].flat();
    for (let i = 0; i < pixels.length; i++) {
      sum += pixels[i];
      sumSquared += pixels[i] * pixels[i];
      min = Math.min(min, pixels[i]);
      max = Math.max(max, pixels[i]);
      count++;
    }

    const mean = sum / count;
    const variance = sumSquared / count - mean * mean;
    const stdDev = Math.sqrt(variance);

    const value1 = `Area: ${area.toFixed(2)} ${unitSuffix}`;
    const value2 = `Mean: ${mean.toFixed(2)} Std Dev:${stdDev.toFixed(2)}`;
    const value = `${value1}\n${value2}`;
    markupManager.update({
      feature: ellipseFeature,
      value,
      coordinate: ellipseGeometry.getLastCoordinate(),
    });
  }
};

export default updateMarkup;
