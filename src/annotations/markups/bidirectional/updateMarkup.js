import { getFeatureScoord3dLength } from "../../../scoord3dUtils.js";

const updateMarkup = (
  shortAxisFeature,
  longAxisFeature,
  { markupManager, pyramid }
) => {
  const longAxisGeometry = longAxisFeature.getGeometry();
  const shortAxisLength = getFeatureScoord3dLength(shortAxisFeature, pyramid);
  const longAxisLength = getFeatureScoord3dLength(longAxisFeature, pyramid);
  const L = `L ${longAxisLength.toFixed(2)}`;
  const W = ` W ${shortAxisLength.toFixed(2)}`;
  const value = `${L}\n${W}`;
  markupManager.update({
    feature: longAxisFeature,
    value,
    coordinate: longAxisGeometry.getLastCoordinate(),
  });
};

export default updateMarkup;
