import { Feature } from "ol";
import { getEllipseStyle } from "./styles";
import { getEllipseId } from "./id";
import Enums from "../../../enums";
import addFeature from "./addFeature";

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
      [Enums.InternalProperties.ReadOnly]: true,
      subFeatures: [ellipseHandlesFeature],
    },
    true
  );
  ellipseHandlesFeature.setProperties(
    {
      [Enums.InternalProperties.CantBeTranslated]: true,
    },
    true
  );
  ellipseFeature.setStyle(getEllipseStyle(ellipseFeature));

  /** Remove markup from handles to add a new one to ellipse */
  markupManager.remove(ellipseHandlesFeature.getId());
  markupManager.create({
    feature: ellipseFeature,
    style: ellipseHandlesFeature.get(Enums.InternalProperties.StyleOptions),
  });

  addFeature(ellipseFeature, viewerProperties);
};

export default createAndAddEllipseFeature;
