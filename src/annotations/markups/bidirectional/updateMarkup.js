import { getFeatureScoord3dLength } from "../../../scoord3dUtils.js";
import { getUnitSuffix } from "../../../utils.js";

const updateMarkup = (
  shortAxisFeature,
  longAxisFeature,
  { markupManager, map, pyramid }
) => {
  const view = map.getView();
  const unitSuffix = getUnitSuffix(view);
  const longAxisGeometry = longAxisFeature.getGeometry();
  const shortAxisLength = getFeatureScoord3dLength(shortAxisFeature, pyramid);
  const longAxisLength = getFeatureScoord3dLength(longAxisFeature, pyramid);
  const L = `L ${longAxisLength.toFixed(2)} ${unitSuffix}`;
  const W = ` W ${shortAxisLength.toFixed(2)} ${unitSuffix}`;
  const value = `${L}\n${W}`;
  markupManager.update({
    feature: longAxisFeature,
    value,
    coordinate: longAxisGeometry.getLastCoordinate(),
  });
  longAxisFeature.setProperties({ shortAxisLength: shortAxisLength.toFixed(2) }, true);
};

export default updateMarkup;
