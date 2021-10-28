import Enums from "../../../enums";
import { distance } from "../bidirectional/mathUtils";
import annotationInterface from "../../annotationInterface";
import { getEllipseHandlesId, getEllipseId } from "./id";
import onSetFeatureStyle from "./onSetFeatureStyle";
import getMeasurements from "./getMeasurements";
import updateMarkup from "./updateMarkup";
import getEllipsePolygonFromMovingLine from "./getEllipsePolygonFromMovingLine";
import createAndAddEllipseFeature from "./createAndAddEllipseFeature";

const isDrawingEllipse = (drawingOptions) =>
  drawingOptions.geometryType === Enums.GeometryType.Ellipse;

const drawEllipse = (
  feature,
  fixedPoint,
  movingPoint,
  currentPoint,
  viewerProperties
) => {
  const { drawingSource } = viewerProperties;

  const ellipseId = getEllipseId(feature);
  const ellipseFeature = drawingSource.getFeatureById(ellipseId);

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
  const { map, markupManager } = viewerProperties;

  ellipseHandlesFeature.setProperties(
    {
      isEllipseHandles: true,
      [Enums.InternalProperties.IsSilentFeature]: true,
    },
    true
  );

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

  // const interactions = map.getInteractions();
  // const draw = interactions.getArray().find((i) => i instanceof Draw);
  // if (draw) {
  //   const onDrawEndHandler = () => {
  //     ellipseHandlesGeometry.un(
  //       Enums.FeatureGeometryEvents.CHANGE,
  //       onEllipseHandlesGeometryChange
  //     );
  //     draw.un(Enums.InteractionEvents.DRAW_END, onDrawEndHandler);
  //   };
  //   draw.on(Enums.InteractionEvents.DRAW_END, onDrawEndHandler);
  // }
};

const attachPointerEvents = (viewerProperties) => {
  const { map } = viewerProperties;
  global.viewerProperties = viewerProperties;
  map.on(Enums.MapEvents.POINTER_UP, resetEventState);
  map.on(Enums.MapEvents.POINTER_DRAG, onPointerDragHandler);
};

const ellipse = Object.assign({}, annotationInterface, {
  onAdd: (feature, viewerProperties) => {
    // const { markupManager, drawingSource } = viewerProperties;
    // const { measurements, isEllipseShape, isEllipseHandles } =
    //   feature.getProperties();
    // if (isEllipseHandles) {
    //   markupManager.remove(feature.getId());
    // }
    // /** TODO: Remove area code check. */
    // if (
    //   measurements &&
    //   JSON.stringify(measurements).includes("G-D7FE") &&
    //   !isEllipseShape &&
    //   !isEllipseHandles
    // ) {
    //   const ellipseFeature = feature;
    //   const ellipseHandlesFeatureId = ellipseFeature.getId();
    //   const ellipseId = getEllipseId(ellipseFeature);
    //   ellipseFeature.setId(ellipseId);
    //   ellipseFeature.setProperties(
    //     {
    //       isEllipseShape: true,
    //       [Enums.InternalProperties.ReadOnly]: true,
    //     },
    //     true
    //   );
    //   const ellipseHandlesFeature = drawingSource.getFeatureById(
    //     ellipseHandlesFeatureId
    //   );
    //   if (!ellipseHandlesFeature) {
    //     const [coords] = ellipseFeature.getGeometry().getCoordinates();
    //     const middle = Math.round(coords.length / 2);
    //     const padding = 700; /** TODO: Calculate based on radius */
    //     const paddedStart = [coords[0][0] + padding, coords[0][1] + padding];
    //     const paddedEnd = [
    //       coords[middle][0] - padding,
    //       coords[middle][1] - padding,
    //     ];
    //     const handles = new LineString([paddedStart, paddedEnd]);
    //     const ellipseHandlesFeature = new Feature({ geometry: handles });
    //     ellipseHandlesFeature.setId(ellipseHandlesFeatureId);
    //     ellipseHandlesFeature.setProperties(
    //       {
    //         isEllipseHandles: true,
    //         [Enums.InternalProperties.IsSilentFeature]: true,
    //       },
    //       true
    //     );
    //     ellipseHandlesFeature.setStyle(ellipseHandlesStyleFunction);
    //     ellipseHandlesFeature.set(
    //       Enums.InternalProperties.StyleOptions,
    //       styles
    //     );
    //     ellipseFeature.setProperties(
    //       {
    //         subFeatures: [ellipseHandlesFeature],
    //       },
    //       true
    //     );
    //     drawingSource.addFeature(ellipseHandlesFeature);
    //     attachChangeEvents(ellipseHandlesFeature, viewerProperties);
    //     attachPointerEvents(viewerProperties);
    //   }
    // }
    // return true;
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
  onRemove: (feature, { drawingSource, markupManager }) => {
    const { isEllipseHandles, isEllipseShape } = feature.getProperties();
    if (isEllipseHandles) {
      const ellipseFeatureId = getEllipseId(feature);
      const ellipseFeature = drawingSource.getFeatureById(ellipseFeatureId);
      if (ellipseFeature) {
        drawingSource.removeFeature(ellipseFeature);
      }
    }

    if (isEllipseShape) {
      const ellipseHandlesFeatureId = getEllipseHandlesId(feature);
      const ellipseHandlesFeature = drawingSource.getFeatureById(
        ellipseHandlesFeatureId
      );
      if (ellipseHandlesFeature) {
        drawingSource.removeFeature(ellipseHandlesFeature);
        markupManager.remove(ellipseHandlesFeature.getId());
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
