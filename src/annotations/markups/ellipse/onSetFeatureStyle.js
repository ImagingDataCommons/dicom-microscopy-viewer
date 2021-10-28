import Enums from "../../../enums";
import { getEllipseHandlesId, getEllipseId } from "./id";
import styles, { ellipseHandlesStyleFunction, getEllipseStyle } from "./styles";

const onSetFeatureStyle = (feature, styleOptions, viewerProperties) => {
  const { drawingSource } = viewerProperties;
  const { isEllipseHandles, isEllipse, isEllipseShape } =
    feature.getProperties();

  const isEllipseAnnotation = isEllipseHandles || isEllipse || isEllipseShape;

  if (!isEllipseAnnotation) {
    return;
  }

  if (isEllipseAnnotation) {
    if (styleOptions.stroke) {
      styles.stroke = Object.assign(styles.stroke, styleOptions.stroke);
    }

    if (styleOptions.image) {
      styles.image = Object.assign(styles.image, styleOptions.image);
    }
  }

  const ellipseStyle = getEllipseStyle();

  if (isEllipseHandles || isEllipse) {
    feature.setStyle(ellipseHandlesStyleFunction);
    feature.set(Enums.InternalProperties.StyleOptions, styles);

    const ellipseFeatureId = getEllipseId(feature);
    const ellipseFeature = drawingSource.getFeatureById(ellipseFeatureId);
    if (ellipseFeature) {
      ellipseFeature.setStyle(ellipseStyle);
      ellipseFeature.set(Enums.InternalProperties.StyleOptions, styles);
    }
  }

  if (isEllipseShape) {
    feature.setStyle(ellipseStyle);
    feature.set(Enums.InternalProperties.StyleOptions, styles);

    const ellipseHandlesFeatureId = getEllipseHandlesId(feature);
    const ellipseHandlesFeature = drawingSource.getFeatureById(
      ellipseHandlesFeatureId
    );
    if (ellipseHandlesFeature) {
      ellipseHandlesFeature.setStyle(ellipseHandlesStyleFunction);
      ellipseHandlesFeature.set(Enums.InternalProperties.StyleOptions, styles);
    }
  }
};

export default onSetFeatureStyle;
