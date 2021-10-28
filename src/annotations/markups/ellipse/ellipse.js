import Enums from "../../../enums";
import { distance } from "../bidirectional/mathUtils";
import annotationInterface from "../../annotationInterface";
import { getEllipseHandlesId, getEllipseId } from "./id";
import onSetFeatureStyle from "./onSetFeatureStyle";
import getMeasurements from "./getMeasurements";
import updateMarkup from "./updateMarkup";
import getEllipsePolygonFromMovingLine from "./getEllipsePolygonFromMovingLine";
import createAndAddEllipseFeature from "./createAndAddEllipseFeature";
import createAndAddEllipseHandlesFeature from "./createAndAddEllipseHandlesFeature";
import removeFeature from "./removeFeature";

const isDrawingEllipse = (drawingOptions) =>
  drawingOptions.geometryType === Enums.GeometryType.Ellipse;

const getFeatureById = (features, id) => {
  return features.getArray().find((f) => f.getId() === id);
};

const drawEllipse = (
  feature,
  fixedPoint,
  movingPoint,
  currentPoint,
  viewerProperties
) => {
  const { features } = viewerProperties;

  const ellipseId = getEllipseId(feature);
  const ellipseFeature = getFeatureById(features, ellipseId);

  const ellipsePolygon = getEllipsePolygonFromMovingLine(
    fixedPoint,
    movingPoint,
    currentPoint
  );

  if (!ellipseFeature) {
    createAndAddEllipseFeature(feature, ellipsePolygon, viewerProperties);
  } else {
    const geometry = ellipseFeature.getGeometry();
    geometry.setCoordinates(ellipsePolygon.getCoordinates());
  }
};

/**
 * This is used to avoid changing features while
 * dragging because of getClosestFeatureToCoordinate call
 */
let draggedFeature = null;
let draggedHandle = null;

const resetEventState = () => {
  draggedFeature = null;
  draggedHandle = null;
};

const global = {};

const onPointerDragHandler = (event) => {
  const { viewerProperties } = global;
  const { drawingSource } = viewerProperties;

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
  const draggedGeomCoords = draggedFeatureGeometry.getCoordinates();

  /** Disable dragging handle line */
  if (
    handleCoordinate[0] !== draggedGeomCoords[0][0] &&
    handleCoordinate[1] !== draggedGeomCoords[0][1] &&
    handleCoordinate[0] !== draggedGeomCoords[1][0] &&
    handleCoordinate[1] !== draggedGeomCoords[1][1]
  ) {
    return;
  }

  if (draggedHandle === null) {
    const start = { x: draggedGeomCoords[0][0], y: draggedGeomCoords[0][1] };
    const end = { x: draggedGeomCoords[1][0], y: draggedGeomCoords[1][1] };
    const distanceStart = distance(handle, start);
    const distanceEnd = distance(handle, end);
    draggedHandle = distanceStart < distanceEnd ? "start" : "end";
  }

  if (draggedHandle === "start") {
    drawEllipse(
      draggedFeature,
      draggedGeomCoords[0],
      draggedGeomCoords[1],
      handleCoordinate,
      viewerProperties
    );
    return;
  }

  if (draggedHandle === "end") {
    drawEllipse(
      draggedFeature,
      draggedGeomCoords[1],
      draggedGeomCoords[0],
      handleCoordinate,
      viewerProperties
    );
    return;
  }
};

const attachChangeEvents = (ellipseHandlesFeature, viewerProperties) => {
  ellipseHandlesFeature.setProperties({ isEllipseHandles: true }, true);

  const ellipseHandlesGeometry = ellipseHandlesFeature.getGeometry();

  const onEllipseHandlesGeometryChange = () => {
    const [first, last] = ellipseHandlesGeometry.getCoordinates();
    drawEllipse(ellipseHandlesFeature, first, last, last, viewerProperties);
    /** We use a different format than markup manager builtin change event. */
    updateMarkup(ellipseHandlesFeature, viewerProperties);
  };

  ellipseHandlesGeometry.on(
    Enums.FeatureGeometryEvents.CHANGE,
    onEllipseHandlesGeometryChange
  );
};

const attachPointerEvents = (viewerProperties) => {
  const { map } = viewerProperties;
  global.viewerProperties = viewerProperties;
  map.on(Enums.MapEvents.POINTER_UP, resetEventState);
  map.on(Enums.MapEvents.POINTER_DRAG, onPointerDragHandler);
};

const ellipse = Object.assign({}, annotationInterface, {
  onAdd: (feature, viewerProperties) => {
    const { measurements, isEllipseShape, isEllipseHandles } =
      feature.getProperties();

    /** TODO: Remove area code check. */
    const isEllipseROIFeature =
      measurements &&
      JSON.stringify(measurements).includes("G-D7FE") &&
      !isEllipseShape &&
      !isEllipseHandles;

    if (isEllipseROIFeature) {
      const ellipseROIFeature = feature;
      removeFeature(ellipseROIFeature, viewerProperties);

      attachPointerEvents(viewerProperties);
      const ellipseHandlesFeature = createAndAddEllipseHandlesFeature(
        ellipseROIFeature,
        viewerProperties
      );
      attachChangeEvents(ellipseHandlesFeature, viewerProperties);

      const originalROIGeometry = ellipseROIFeature.getGeometry();
      createAndAddEllipseFeature(
        ellipseHandlesFeature,
        originalROIGeometry,
        viewerProperties,
        ellipseROIFeature
      );
    }
  },
  getNormalizedFeature: (feature, viewerProperties) => {
    const { features } = viewerProperties;
    const { isEllipseHandles, isEllipseShape } = feature.getProperties();

    if (isEllipseHandles) {
      const ellipseFeatureId = getEllipseId(feature);
      const ellipseFeature = getFeatureById(features, ellipseFeatureId);
      if (ellipseFeature) {
        const ellipseFeatureClone = ellipseFeature.clone();
        ellipseFeatureClone.setId(feature.getId());
        return ellipseFeatureClone;
      }
    }

    if (isEllipseShape) {
      const ellipseFeatureClone = feature.clone();
      ellipseFeatureClone.setId(getEllipseHandlesId(feature));
      return ellipseFeatureClone;
    }
  },
  onDrawEnd: (event, viewerProperties) => {
    global.viewerProperties = viewerProperties;
    attachPointerEvents(viewerProperties);
  },
  onDrawStart: (event, viewerProperties) => {
    const { drawingOptions } = viewerProperties;
    if (isDrawingEllipse(drawingOptions)) {
      const ellipseHandlesFeature = event.feature;
      attachChangeEvents(ellipseHandlesFeature, viewerProperties);
    }
  },
  onRemove: (feature, viewerProperties) => {
    const { markupManager, features } = viewerProperties;
    const { isEllipseHandles, isEllipseShape } = feature.getProperties();
    if (isEllipseHandles) {
      const ellipseFeatureId = getEllipseId(feature);
      const ellipseFeature = getFeatureById(features, ellipseFeatureId);
      if (ellipseFeature) {
        markupManager.remove(ellipseFeature.getId());
        removeFeature(ellipseFeature, viewerProperties);
      }
    }

    if (isEllipseShape) {
      const ellipseHandlesFeatureId = getEllipseHandlesId(feature);
      const ellipseHandlesFeature = getFeatureById(
        features,
        ellipseHandlesFeatureId
      );
      if (ellipseHandlesFeature) {
        markupManager.remove(feature.getId());
        removeFeature(ellipseHandlesFeature, viewerProperties);
      }
    }
  },
  getMeasurements,
  onSetFeatureStyle,
});

export default ellipse;

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
