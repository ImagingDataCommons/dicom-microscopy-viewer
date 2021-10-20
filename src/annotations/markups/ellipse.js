import { fromCircle } from "ol/geom/Polygon";
import CircleGeometry from "ol/geom/Circle";

import Enums from "../../enums";
import { getCenter, getWidth } from "ol/extent";
import { getFeatureScoord3dArea } from "../../scoord3dUtils.js";
import { getUnitSuffix } from "../../utils";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { Feature } from "ol";
import Point from "ol/geom/Point";

const createEllipseHandle = (feature, index) => {
  const geometry = feature.getGeometry();
  const handleStyle = new Style({
    image: new CircleStyle({
      fill: new Fill({ color: "yellow" }),
      stroke: new Stroke({ color: "yellow", width: 2 }),
      radius: 5,
    }),
  });
  const handleFeature = new Feature({
    geometry: new Point(geometry.getFirstCoordinate()),
  });
  handleFeature.setStyle(handleStyle);
  handleFeature.setId(`${feature.getId()}-handle-${index}`);
  return handleFeature;
};

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

      const { isEllipse } = draggedFeature.getProperties();
      if (!isEllipse) {
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
      const polygon = fromCircle(circle);
      polygon.scale(dx / radius, dy / radius);

      const view = map.getView();
      const units = getUnitSuffix(view);
      const area = getFeatureScoord3dArea(draggedFeature, pyramid);
      markupManager.update({
        feature: draggedFeature,
        value: `${area.toFixed(2)} ${units}²`,
        coordinate: polygon.getLastCoordinate(),
      });

      draggedFeature.setGeometry(polygon);
    });
  },
  onDrawEnd: (event, viewerProperties) => {
    // const { drawingOptions, drawingSource } = viewerProperties;
    // if (isDrawingEllipse(drawingOptions)) {
    //   const ellipseFeature = event.feature;
    //   const endHandle = createEllipseHandle(ellipseFeature, 2);
    //   drawingSource.addFeature(endHandle);
    // }
  },
  onDrawStart: (event, viewerProperties) => {
    const { drawingOptions, drawingSource } = viewerProperties;
    if (isDrawingEllipse(drawingOptions)) {
      const ellipseFeature = event.feature;
      ellipseFeature.setProperties({ isEllipse: true }, true);
      // const startHandle = createEllipseHandle(ellipseFeature, 1);
      // drawingSource.addFeature(startHandle);
    }
  },
  onRemove: (feature, { drawingSource, features }) => {},
};

export default ellipse;
