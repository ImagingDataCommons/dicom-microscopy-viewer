import { Feature } from "ol";
import { getEllipseStyle } from "./styles";
import { getEllipseId } from "./id";
import Enums from "../../../enums";
import updateMarkup from "./updateMarkup";

const createAndAddEllipseFeature = (
  ellipseHandlesFeature,
  ellipseGeometry,
  viewerProperties
) => {
  const { drawingSource, markupManager } = viewerProperties;

  const ellipseId = getEllipseId(ellipseHandlesFeature);

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
  ellipseFeature.setStyle(getEllipseStyle());

  /** Remove markup from handles to add a new one to ellipse */
  markupManager.remove(ellipseHandlesFeature.getId());
  markupManager.create({
    feature: ellipseFeature,
    style: ellipseHandlesFeature.get(Enums.InternalProperties.StyleOptions),
  });

  drawingSource.addFeature(ellipseFeature);
};

export default createAndAddEllipseFeature;
