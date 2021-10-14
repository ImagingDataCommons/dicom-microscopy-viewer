import Enums from "../../enums";

const isDrawingEllipse = (drawingOptions) =>
  drawingOptions.geometryType === Enums.GeometryType.Circle &&
  drawingOptions[Enums.InternalProperties.Ellipse] === true;

const ellipse = {
  onInit: (viewerProperties) => {},
  onDrawStart: (event, viewerProperties) => {
    const { drawingOptions, drawingSource, map } = viewerProperties;

    if (isDrawingEllipse(drawingOptions)) {
      console.debug('Drawing ellipse!');
    }
  },
  onDrawEnd: () => {},
  onRemove: (feature, { drawingSource, features }) => {},
};

export default ellipse;
