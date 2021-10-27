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
import Fill from "ol/style/Fill";
import RegularShape from "ol/style/RegularShape";

const styles = {
  image: {
    radius: 7,
  },
  stroke: {
    color: "black",
    width: 3,
  },
};

const getEllipseStyle = () =>
  new Style({
    stroke: new Stroke({
      color: styles.stroke.color,
      width: styles.stroke.width,
    }),
  });

const getHandleStyle = (coords) =>
  new Style({
    geometry: new Point(coords),
    image: new CircleStyle({
      radius: styles.image.radius,
      stroke: new Stroke({
        color: styles.stroke.color,
        width: styles.stroke.width,
      }),
    }),
  });

function ellipseHandlesStyleFunction(feature) {
  const styles = [];
  const featureGeometry = feature.getGeometry();

  const type = featureGeometry.getType();
  if (type !== "LineString") {
    return styles;
  }

  const [start, end] = featureGeometry.getCoordinates();

  featureGeometry.forEachSegment((seg) => {
    if (
      seg[0] !== start[0] ||
      seg[0] !== start[1] ||
      seg[1] !== start[0] ||
      seg[1] !== start[1]
    ) {
      const hiddenPointStyle = new Style({
        geometry: new Point(seg),
        image: new RegularShape({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.5)",
          }),
          stroke: new Stroke({
            color: "red",
            width: 1,
          }),
          points: 4,
          radius: 8,
          angle: Math.PI / 4,
        }),
      });
      styles.push(hiddenPointStyle);
    }
  });

  styles.push(getHandleStyle(start));
  styles.push(getHandleStyle(end));

  return styles;
}

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

    let sum = 0;
    let count = 0;
    let sumSquared = 0;
    let min = 0;
    let max = 0;
    const pixels = ellipseGeometry.getCoordinates()[0].flat();
    for (let i = 0; i < pixels.length; i++) {
      sum += pixels[i];
      sumSquared += pixels[i] * pixels[i];
      min = Math.min(min, pixels[i]);
      max = Math.max(max, pixels[i]);
      count++;
    }

    const mean = sum / count;
    const variance = sumSquared / count - mean * mean;
    const stdDev = Math.sqrt(variance);

    const value1 = `Area: ${area.toFixed(2)} ${unitSuffix}`;
    const value2 = `Mean: ${mean.toFixed(2)} Std Dev:${stdDev.toFixed(2)}`;
    const value = `${value1}\n${value2}`;
    markupManager.update({
      feature: ellipseFeature,
      value,
      coordinate: ellipseGeometry.getLastCoordinate(),
    });
  }
};

const isDrawingEllipse = (drawingOptions) =>
  drawingOptions.geometryType === Enums.GeometryType.Ellipse;

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
    ellipseFeature.setProperties(
      {
        isEllipseShape: true,
        [Enums.InternalProperties.ReadOnly]: true,
        subFeatures: [feature],
      },
      true
    );
    feature.setProperties(
      {
        [Enums.InternalProperties.CantBeTranslated]: true,
      },
      true
    );
    ellipseFeature.setStyle(getEllipseStyle());

    /** Remove markup from handles to add a new one to ellipse */
    markupManager.remove(feature.getId());
    markupManager.create({
      feature: ellipseFeature,
      style: feature.get(Enums.InternalProperties.StyleOptions),
    });

    drawingSource.addFeature(ellipseFeature);
  } else {
    const geometry = ellipse.getGeometry();
    geometry.setCoordinates(polygon.getCoordinates());
  }
};

const getChangeEvent = (viewerProperties) => {
  const { map, drawingSource } = viewerProperties;
  /**
   * This is used to avoid changing features while
   * dragging because of getClosestFeatureToCoordinate call
   */
  let draggedFeature,
    draggedHandle = null;
  map.on("pointerup", () => {
    draggedFeature = null;
    draggedHandle = null;
  });

  return (event) => {
    const handleCoordinate = event.coordinate;
    const handle = { x: handleCoordinate[0], y: handleCoordinate[1] };

    if (draggedFeature === null) {
      draggedFeature =
        drawingSource.getClosestFeatureToCoordinate(handleCoordinate);
    }

    if (!draggedFeature) {
      return;
    }

    const { isEllipseHandles } = draggedFeature.getProperties();

    if (!isEllipseHandles) {
      return;
    }

    const draggedFeatureGeometry = draggedFeature.getGeometry();
    const coords = draggedFeatureGeometry.getCoordinates();

    /** Disable dragging handle line */
    if (
      handleCoordinate[0] !== coords[0][0] &&
      handleCoordinate[1] !== coords[0][1] &&
      handleCoordinate[0] !== coords[1][0] &&
      handleCoordinate[1] !== coords[1][1]
    ) {
      return;
    }

    if (draggedHandle === null) {
      const start = { x: coords[0][0], y: coords[0][1] };
      const end = { x: coords[1][0], y: coords[1][1] };
      const distanceStart = distance(handle, start);
      const distanceEnd = distance(handle, end);
      draggedHandle = distanceStart < distanceEnd ? "start" : "end";
    }

    if (draggedHandle === "start") {
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

    if (draggedHandle === "end") {
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
  };
};

const ellipse = {
  onAdd: (feature, viewerProperties) => {
    const { markupManager, drawingSource } = viewerProperties;
    const { isEllipseHandles } = feature.getProperties();
    if (isEllipseHandles) {
      /** Remove markup from handles to add a new one to ellipse */
      markupManager.remove(feature.getId());
      const ellipse = drawingSource.getFeatureById(
        `ellipse-${feature.getId()}`
      );
      if (ellipse) {
        markupManager.create({
          feature: ellipse,
          style: feature.get(Enums.InternalProperties.StyleOptions),
        });
      }
    }
  },
  onInit: (viewerProperties) => {
    const { map } = viewerProperties;
    map.on(Enums.MapEvents.POINTER_DRAG, getChangeEvent(viewerProperties));
  },
  onInteractionsChange: (interactions, viewerProperties) => {},
  onDrawEnd: (event, viewerProperties) => {},
  onDrawStart: (event, viewerProperties) => {
    const { drawingOptions, map } = viewerProperties;
    if (isDrawingEllipse(drawingOptions)) {
      const ellipseHandlesFeature = event.feature;

      ellipseHandlesFeature.setProperties(
        {
          isEllipseHandles: true,
          [Enums.InternalProperties.IsSilentFeature]: true,
        },
        true
      );

      // TODO: Add built in highlighting of features
      // let selected = null;
      // map.on('pointermove', function (e) {
      //   if (selected !== null) {
      //     selected.setStyle(undefined);
      //     selected = null;
      //   }

      //   map.forEachFeatureAtPixel(e.pixel, function (f) {
      //     selected = f;
      //     // add highlight
      //     // f.setStyle(highlightStyle);
      //     return true;
      //   });

      //   if (selected) {
      //     // add highlight
      //   } else {
      //     // remove highlight
      //   }
      // });

      ellipseHandlesFeature.getGeometry().on("change", (event) => {
        const geometry = event.target;
        const [first, last] = geometry.getCoordinates();
        drawEllipse(ellipseHandlesFeature, first, last, last, viewerProperties);
        updateMarkup(ellipseHandlesFeature, viewerProperties);
      });
    }
  },
  onRemove: (feature, { drawingSource, markupManager }) => {
    const { isEllipseHandles } = feature.getProperties();
    if (isEllipseHandles) {
      const ellipseFeatureId = `ellipse-${feature.getId()}`;
      const ellipseFeature = drawingSource.getFeatureById(ellipseFeatureId);
      drawingSource.removeFeature(ellipseFeature);
      markupManager.remove(ellipseFeature.getId());
    }
  },
  onSetFeatureStyle: (feature, styleOptions, viewerProperties) => {
    const { drawingSource } = viewerProperties;
    const { isEllipseHandles, isEllipse, isEllipseShape } =
      feature.getProperties();

    const isEllipseAnnotation = isEllipseHandles || isEllipse || isEllipseShape;

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

      const ellipseFeatureId = `ellipse-${feature.getId()}`;
      const ellipseFeature = drawingSource.getFeatureById(ellipseFeatureId);
      if (ellipseFeature) {
        ellipseFeature.setStyle(ellipseStyle);
        ellipseFeature.set(Enums.InternalProperties.StyleOptions, styles);
      }
    }

    if (isEllipseShape) {
      feature.setStyle(ellipseStyle);
      feature.set(Enums.InternalProperties.StyleOptions, styles);

      const ellipseHandlesFeatureId = feature.getId().split("ellipse-")[1];
      const ellipseHandlesFeature = drawingSource.getFeatureById(
        ellipseHandlesFeatureId
      );
      if (ellipseHandlesFeature) {
        ellipseHandlesFeature.setStyle(ellipseHandlesStyleFunction);
        ellipseHandlesFeature.set(
          Enums.InternalProperties.StyleOptions,
          styles
        );
      }
    }
  },
};

export default ellipse;
