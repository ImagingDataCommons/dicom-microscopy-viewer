import { fromCircle } from "ol/geom/Polygon";
import CircleGeometry from "ol/geom/Circle";

import Enums from "../../enums";
import { getCenter, getWidth } from "ol/extent";
import { getFeatureScoord3dArea } from "../../scoord3dUtils.js";
import { getUnitSuffix } from "../../utils";

const isDrawingEllipse = (drawingOptions) =>
  drawingOptions.geometryType === Enums.GeometryType.Ellipse;

const ellipse = {
  onInit: (viewerProperties) => {
    const { map, drawingSource, markupManager, pyramid } = viewerProperties;

    /**
     * This is used to avoid changing features while
     * dragging because of getClosestFeatureToCoordinate call
     */
    let draggedFeature = null;
    map.on("pointerup", () => (draggedFeature = null));

    map.on(Enums.MapEvents.POINTER_DRAG, (event) => {
      const handleCoordinate = event.coordinate;

      if (draggedFeature === null) {
        draggedFeature =
          drawingSource.getClosestFeatureToCoordinate(handleCoordinate);
      }

      if (!draggedFeature) {
        return;
      }

      let ellipseGeometry = draggedFeature.getGeometry();
      const fakeCenter = getCenter(ellipseGeometry.getExtent());
      const fakeRadius = getWidth(ellipseGeometry.getExtent()) / 2;
      ellipseGeometry = new CircleGeometry(fakeCenter, fakeRadius);

      const center = ellipseGeometry.getCenter();
      const last = handleCoordinate;
      const dx = center[0] - last[0];
      const dy = center[1] - last[1];
      const radius = Math.sqrt(dx * dx + dy * dy);
      const circle = new CircleGeometry(center, radius);
      const polygon = fromCircle(circle, 64);
      polygon.scale(dx / radius, dy / radius);

      const view = map.getView();
      const units = getUnitSuffix(view);
      const area = getFeatureScoord3dArea(draggedFeature, pyramid)
      const value = `${area.toFixed(2)} ${units}²`;
      markupManager.update({
        feature: draggedFeature,
        value,
        coordinate: polygon.getLastCoordinate(),
      });

      draggedFeature.setGeometry(polygon);
    });
  },
  onDrawEnd: (event, viewerProperties) => {},
  onDrawStart: () => {},
  onRemove: (feature, { drawingSource, features }) => {},
};

export default ellipse;
