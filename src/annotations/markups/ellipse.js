import Enums from "../../enums";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { fromCircle } from "ol/geom/Polygon";
import CircleGeometry from "ol/geom/Circle";
import { distance } from "./bidirectional/mathUtils";
import { Feature } from "ol";
import CircleStyle from "ol/style/Circle";
import Point from "ol/geom/Point";
import { getFeatureScoord3dArea } from "../../scoord3dUtils";
import { getUnitSuffix } from "../../utils";

const updateMarkup = (
  feature,
  { markupManager, drawingSource, map, pyramid }
) => {
  const ellipseFeatureId = `ellipse-${feature.getId()}`;
  const ellipseFeature = drawingSource.getFeatureById(ellipseFeatureId);
  if (ellipseFeature) {
    const view = map.getView();
    const unitSuffix = getUnitSuffix(view);
    const ellipseGeometry = ellipseFeature.getGeometry();
    const area = getFeatureScoord3dArea(ellipseFeature, pyramid);
    const value = `Area ${area.toFixed(2)} ${unitSuffix}`;
    markupManager.update({
      feature: ellipseFeature,
      value,
      coordinate: ellipseGeometry.getLastCoordinate(),
    });
  }
};

const isDrawingEllipse = (drawingOptions) =>
  drawingOptions.geometryType === Enums.InternalProperties.Ellipse;

const drawEllipse = (
  feature,
  fixedPoint,
  movingPoint,
  currentPoint,
  viewerProperties
) => {
  const { drawingSource, markupManager } = viewerProperties;

  function midpoint(x1, x2, y1, y2) {
    return [(x1 + x2) / 2, (y1 + y2) / 2];
  }

  const mid = midpoint(
    fixedPoint[0],
    movingPoint[0],
    fixedPoint[1],
    movingPoint[1]
  );

  const ellipse = drawingSource.getFeatureById(`ellipse-${feature.getId()}`);

  const center = mid;
  const last = currentPoint;
  const dx = center[0] - last[0];
  const dy = center[1] - last[1];
  let radius = Math.sqrt(dx * dx + dy * dy);
  radius = radius > 0 ? radius : Number.MIN_SAFE_INTEGER;
  const circle = new CircleGeometry(center, radius);
  const polygon = fromCircle(circle);
  polygon.scale(dx / radius, dy / radius);

  if (!ellipse) {
    const geometry = polygon;
    const ellipseFeature = new Feature({ geometry });
    ellipseFeature.setId(`ellipse-${feature.getId()}`);
    ellipseFeature.setProperties({ isReadOnly: true }, true);
    ellipseFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: "yellow",
          width: 3,
        }),
      })
    );

    /** Remove markup from handles to add a new one to ellipse */
    markupManager.remove(feature.getId());
    markupManager.create({ feature: ellipseFeature });

    drawingSource.addFeature(ellipseFeature);
  } else {
    const geometry = ellipse.getGeometry();
    geometry.setCoordinates(polygon.getCoordinates());
  }
};

const ellipse = {
  onAdd: (feature, viewerProperties) => {
    const { markupManager, drawingSource } = viewerProperties;
    const { isEllipse } = feature.getProperties();
    if (isEllipse) {
      /** Remove markup from handles to add a new one to ellipse */
      markupManager.remove(feature.getId());
      const ellipse = drawingSource.getFeatureById(`ellipse-${feature.getId()}`);
      if (ellipse) {
        markupManager.create({ feature: ellipse });
      }
    }
  },
  onInit: (viewerProperties) => {
    const { map, drawingSource } = viewerProperties;
    /**
     * This is used to avoid changing features while
     * dragging because of getClosestFeatureToCoordinate call
     */
    let draggedFeature,
      draggedHandleIndex = null;
    map.on("pointerup", () => {
      draggedFeature = null;
      draggedHandleIndex = null;
    });

    map.on(Enums.MapEvents.POINTER_DRAG, (event) => {
      const handleCoordinate = event.coordinate;
      const handle = { x: handleCoordinate[0], y: handleCoordinate[1] };

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

      const draggedFeatureGeometry = draggedFeature.getGeometry();
      const coords = draggedFeatureGeometry.getCoordinates();

      let axisHandle;
      if (draggedHandleIndex === null) {
        const start = { x: coords[0][0], y: coords[0][1] };
        const end = { x: coords[1][0], y: coords[1][1] };
        const distanceStart = distance(handle, start);
        const distanceEnd = distance(handle, end);
        axisHandle = distanceStart < distanceEnd ? "start" : "end";
      }

      if (axisHandle === "start") {
        drawEllipse(
          draggedFeature,
          coords[0],
          coords[1],
          handleCoordinate,
          viewerProperties
        );
        updateMarkup(draggedFeature, viewerProperties);
        return;
      }

      if (axisHandle === "end") {
        drawEllipse(
          draggedFeature,
          coords[1],
          coords[0],
          handleCoordinate,
          viewerProperties
        );
        updateMarkup(draggedFeature, viewerProperties);
        return;
      }
    });
  },
  onDrawEnd: (event, viewerProperties) => {},
  onDrawStart: (event, viewerProperties) => {
    const { drawingOptions, markupManager } = viewerProperties;
    if (isDrawingEllipse(drawingOptions)) {
      const ellipseFeature = event.feature;
      ellipseFeature.setProperties({ isEllipse: true }, true);
      ellipseFeature.getGeometry().on("change", (event) => {
        const geometry = event.target;
        const [first, last] = geometry.getCoordinates();
        drawEllipse(ellipseFeature, first, last, last, viewerProperties);
        updateMarkup(ellipseFeature, viewerProperties);
      });

      function styleFunction(feature) {
        const styles = [];
        const featureGeometry = feature.getGeometry();

        const type = featureGeometry.getType();
        if (type !== "LineString") {
          return styles;
        }

        const [start, end] = featureGeometry.getCoordinates();

        const getHandleStyle = (coords) =>
          new Style({
            geometry: new Point(coords),
            image: new CircleStyle({
              radius: 7,
              stroke: new Stroke({
                color: "yellow",
                width: 2,
              }),
            }),
          });

        styles.push(getHandleStyle(start));
        styles.push(getHandleStyle(end));

        return styles;
      }

      ellipseFeature.setStyle(styleFunction);
    }
  },
  onRemove: (feature, { drawingSource, markupManager }) => {
    const { isEllipse } = feature.getProperties();
    if (isEllipse) {
      const ellipseFeatureId = `ellipse-${feature.getId()}`;
      const ellipseFeature = drawingSource.getFeatureById(ellipseFeatureId);
      drawingSource.removeFeature(ellipseFeature);
      markupManager.remove(ellipseFeature.getId());
    }
  },
};

export default ellipse;
