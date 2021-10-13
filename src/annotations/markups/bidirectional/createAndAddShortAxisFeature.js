import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";

import Enums from "../../../enums";
import updateMarkup from "./updateMarkup";
import { getShortAxisId } from "./id";
import getShortAxisCoords from "./getShortAxisCoords";

const createAndAddShortAxisFeature = (longAxisFeature, viewerProperties) => {
  const { setFeatureStyle, drawingSource, drawingOptions } =
    viewerProperties;
  const id = getShortAxisId(longAxisFeature);

  const shortAxisCoords = getShortAxisCoords(longAxisFeature);

  const geometry = new LineString(shortAxisCoords);
  const feature = new Feature({ geometry });
  feature.setId(id);
  feature.setProperties({ isShortAxis: true }, true);

  feature.on(Enums.FeatureGeometryEvents.CHANGE, () =>
    updateMarkup(feature, longAxisFeature, viewerProperties)
  );

  setFeatureStyle(
    feature,
    drawingOptions[Enums.InternalProperties.StyleOptions]
  );

  drawingSource.addFeature(feature);
};

export default createAndAddShortAxisFeature;
