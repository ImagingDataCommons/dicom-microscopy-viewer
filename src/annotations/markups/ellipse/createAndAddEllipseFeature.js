import { Feature } from "ol";
import styles, { getEllipseStyle } from "./styles";
import { getEllipseId } from "./id";
import Enums from "../../../enums";
import addFeature from "./addFeature";
import updateMarkup from "./updateMarkup";

const createAndAddEllipseFeature = (
  ellipseHandlesFeature,
  ellipseGeometry,
  viewerProperties,
  originalROIFeature
) => {
  const { markupManager } = viewerProperties;

  const ellipseId = getEllipseId(
    originalROIFeature ? originalROIFeature : ellipseHandlesFeature
  );

  const geometry = ellipseGeometry;
  const ellipseFeature = new Feature({ geometry });
  ellipseFeature.setId(ellipseId);
  ellipseFeature.setProperties(
    {
      isEllipseShape: true,
      [Enums.InternalProperties.IsSilentFeature]: true,
      [Enums.InternalProperties.ReadOnly]: true,
      subFeatures: [ellipseHandlesFeature],
    },
    true
  );
  ellipseFeature.setStyle(getEllipseStyle(ellipseFeature));

  /** Remove markup from handles to add a new one to ellipse */
  markupManager.remove(ellipseHandlesFeature.getId());
  markupManager.create({ feature: ellipseFeature, style: styles });

  addFeature(ellipseFeature, viewerProperties);

  /** Add feature then update the markup */
  updateMarkup(ellipseHandlesFeature, viewerProperties);
};

export default createAndAddEllipseFeature;
