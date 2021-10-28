import Draw from "ol/interaction/Draw";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import dcmjs from "dcmjs";

import Enums from "../../../enums";
import moveBidirectionalHandles from "./moveBidirectionalHandles";
import getShortAxisCoords from "./getShortAxisCoords";
import createAndAddShortAxisFeature from "./createAndAddShortAxisFeature";
import updateMarkup from "./updateMarkup";
import { getShortAxisId, getLongAxisId } from "./id";
import getDraggedHandleIndex from "./getDraggedHandleIndex";
import { distance } from "./mathUtils";
import annotationInterface from "../../annotationInterface";
import { getFeatureScoord3dLength } from "../../../scoord3dUtils";

const styles = {
  stroke: {
    color: "black",
    width: 3,
  },
};

const getAxisStyle = (drawStyles) => {
  const stroke = (drawStyles ? drawStyles : styles).stroke;
  return new Style({
    stroke: new Stroke({
      color: stroke.color,
      width: stroke.width,
    }),
  });
};

const isDrawingBidirectional = (drawingOptions) =>
  drawingOptions.geometryType === Enums.GeometryType.Line &&
  drawingOptions[Enums.InternalProperties.Bidirectional] === true;

const attachChangeEvents = (longAxisFeature, viewerProperties) => {
  const { drawingSource, map, drawingOptions } = viewerProperties;

  longAxisFeature.setProperties({ isLongAxis: true }, true);

  const onLongAxisFeatureGeometryChange = () => {
    const shortAxisCoords = getShortAxisCoords(longAxisFeature);

    const id = getShortAxisId(longAxisFeature);
    const shortAxisFeature = drawingSource.getFeatureById(id);

    if (shortAxisFeature) {
      const shortAxisGeometry = shortAxisFeature.getGeometry();
      shortAxisGeometry.setCoordinates(shortAxisCoords);
      updateMarkup(shortAxisFeature, longAxisFeature, viewerProperties);
      return;
    }

    createAndAddShortAxisFeature(
      longAxisFeature,
      viewerProperties,
      drawingOptions
        ? getAxisStyle(drawingOptions[Enums.InternalProperties.StyleOptions])
        : getAxisStyle()
    );
  };

  const longAxisGeometry = longAxisFeature.getGeometry();

  longAxisGeometry.on(
    Enums.FeatureGeometryEvents.CHANGE,
    onLongAxisFeatureGeometryChange
  );

  const interactions = map.getInteractions();
  const draw = interactions.getArray().find((i) => i instanceof Draw);
  if (draw) {
    const onDrawEndHandler = () => {
      longAxisGeometry.un(
        Enums.FeatureGeometryEvents.CHANGE,
        onLongAxisFeatureGeometryChange
      );
      draw.un(Enums.InteractionEvents.DRAW_END, onDrawEndHandler);
    };
    draw.on(Enums.InteractionEvents.DRAW_END, onDrawEndHandler);
  }
};

/**
 * This is used to avoid changing features while
 * dragging because of getClosestFeatureToCoordinate call
 */
let draggedFeature = null;
let draggedHandleIndex = null;
let isClickingAHandle = null;
let pointDownCoordinate = null;
let lastTranslatedCoord = null;

const resetPointEventState = () => {
  draggedFeature = null;
  draggedHandleIndex = null;
  isClickingAHandle = null;
  pointDownCoordinate = null;
  lastTranslatedCoord = null;
};

const updatePointerEventState = ({ coordinate }) => {
  pointDownCoordinate = coordinate;
  lastTranslatedCoord = coordinate;
};

const onPointerDragHandler = (event) => {
  const viewerProperties = global.viewerProperties;
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

  const { isLongAxis, isShortAxis } = draggedFeature.getProperties();
  const isBidirectional = isLongAxis || isShortAxis;

  if (!isBidirectional) {
    return;
  }

  const draggedFeatureGeometry = draggedFeature.getGeometry();

  /** Check if clicking in the handles */
  if (isClickingAHandle === null) {
    const [start, end] = draggedFeatureGeometry.getCoordinates();
    const distanceStart = distance(
      { x: pointDownCoordinate[0], y: pointDownCoordinate[1] },
      { x: start[0], y: start[1] }
    );
    const distanceEnd = distance(
      { x: pointDownCoordinate[0], y: pointDownCoordinate[1] },
      { x: end[0], y: end[1] }
    );
    const resolution = map.getView().getResolution();
    const proximity = 5 * resolution;
    isClickingAHandle = Math.min(distanceStart, distanceEnd) <= proximity;
  }

  /** If clicking outside handles, just stop event and translate */
  if (isClickingAHandle === false) {
    const { subFeatures } = draggedFeature.getProperties();
    if (subFeatures && subFeatures.length > 0) {
      subFeatures.forEach((subFeature) => {
        const geometry = subFeature.getGeometry();
        const coords = lastTranslatedCoord;

        const deltaX = handleCoordinate[0] - coords[0];
        const deltaY = handleCoordinate[1] - coords[1];

        geometry.translate(deltaX, deltaY);
        draggedFeatureGeometry.translate(deltaX, deltaY);

        lastTranslatedCoord = event.coordinate;
      });
    }

    event.stopPropagation();
    return;
  }

  if (draggedHandleIndex === null) {
    draggedHandleIndex = getDraggedHandleIndex(draggedFeature, handle);
  }

  if (isLongAxis) {
    const shortAxisFeatureId = getShortAxisId(draggedFeature);
    const shortAxisFeature = drawingSource.getFeatureById(shortAxisFeatureId);

    updateMarkup(shortAxisFeature, draggedFeature, viewerProperties);
    moveBidirectionalHandles(
      handle,
      draggedFeature,
      viewerProperties,
      event,
      draggedHandleIndex
    );
    return;
  }

  if (isShortAxis) {
    const longAxisFeatureId = getLongAxisId(draggedFeature);
    const longAxisFeature = drawingSource.getFeatureById(longAxisFeatureId);

    updateMarkup(draggedFeature, longAxisFeature, viewerProperties);
    moveBidirectionalHandles(
      handle,
      draggedFeature,
      viewerProperties,
      event,
      draggedHandleIndex
    );
    return;
  }
};

const global = {};

const attachPointerEvents = (viewerProperties) => {
  const { map } = viewerProperties;
  global.viewerProperties = viewerProperties;

  map.on(Enums.MapEvents.POINTER_UP, resetPointEventState);
  map.on(Enums.MapEvents.POINTER_DOWN, updatePointerEventState);
  map.on(Enums.MapEvents.POINTER_DRAG, onPointerDragHandler);
};

const bidirectional = Object.assign({}, annotationInterface, {
  onAdd: (feature, viewerProperties) => {
    const { measurements } = feature.getProperties();

    /** TODO: Remove long axis check. */
    if (measurements && JSON.stringify(measurements).includes("Long Axis")) {
      attachChangeEvents(feature, viewerProperties);
      createAndAddShortAxisFeature(feature, viewerProperties, getAxisStyle());
      attachPointerEvents(viewerProperties);
    }
  },
  onDrawStart: (event, viewerProperties) => {
    const { drawingOptions } = viewerProperties;
    if (isDrawingBidirectional(drawingOptions)) {
      const longAxisFeature = event.feature;
      attachChangeEvents(longAxisFeature, viewerProperties);
    }
  },
  getMeasurements: (feature, viewerProperties) => {
    const { drawingSource, pyramid } = viewerProperties;

    const { isShortAxis, isLongAxis } = feature.getProperties();
    const isBidirectional = isShortAxis || isLongAxis;

    if (isBidirectional) {
      let longAxisFeature;
      let shortAxisFeature;
      let shortAxisLength = 0;
      let longAxisLength = 0;
      let longAxis = {
        point1: {
          x: 0,
          y: 0,
        },
        point2: {
          x: 0,
          y: 0,
        },
      };
      let shortAxis = {
        point1: {
          x: 0,
          y: 0,
        },
        point2: {
          x: 0,
          y: 0,
        },
      };

      if (isShortAxis) {
        shortAxisFeature = feature;
        shortAxisLength = getFeatureScoord3dLength(shortAxisFeature, pyramid);
        const shortAxisCoords = shortAxisFeature.getGeometry().getCoordinates();
        shortAxis.point1.x = shortAxisCoords[0][0];
        shortAxis.point1.y = shortAxisCoords[0][1];
        shortAxis.point2.x = shortAxisCoords[1][0];
        shortAxis.point2.y = shortAxisCoords[1][1];

        const longAxisFeatureId = getLongAxisId(shortAxisFeature);
        longAxisFeature = drawingSource.getFeatureById(longAxisFeatureId);

        if (longAxisFeature) {
          longAxisLength = getFeatureScoord3dLength(longAxisFeature, pyramid);
          const longAxisCoords = longAxisFeature.getGeometry().getCoordinates();
          longAxis.point1.x = longAxisCoords[0][0];
          longAxis.point1.y = longAxisCoords[0][1];
          longAxis.point2.x = longAxisCoords[1][0];
          longAxis.point2.y = longAxisCoords[1][1];
        }
      }

      if (isLongAxis) {
        longAxisFeature = feature;
        longAxisLength = getFeatureScoord3dLength(longAxisFeature, pyramid);
        const longAxisCoords = longAxisFeature.getGeometry().getCoordinates();
        longAxis.point1.x = longAxisCoords[0][0];
        longAxis.point1.y = longAxisCoords[0][1];
        longAxis.point2.x = longAxisCoords[1][0];
        longAxis.point2.y = longAxisCoords[1][1];

        const shortAxisFeatureId = getShortAxisId(longAxisFeature);
        shortAxisFeature = drawingSource.getFeatureById(shortAxisFeatureId);

        if (shortAxisFeature) {
          shortAxisLength = getFeatureScoord3dLength(shortAxisFeature, pyramid);
          const shortAxisCoords = shortAxisFeature
            .getGeometry()
            .getCoordinates();
          shortAxis.point1.x = shortAxisCoords[0][0];
          shortAxis.point1.y = shortAxisCoords[0][1];
          shortAxis.point2.x = shortAxisCoords[1][0];
          shortAxis.point2.y = shortAxisCoords[1][1];
        }
      }

      const bidirectional = new dcmjs.utilities.TID300.Bidirectional({
        longAxis,
        shortAxis,
        longAxisLength,
        shortAxisLength,
      });
      const contentItem = bidirectional.contentItem();
      const numContentItems = contentItem.filter(
        (ci) => ci.ValueType === "NUM"
      );
      return numContentItems.map((measurement) => {
        /** Update format wrong in dcmjs */
        measurement.ConceptNameCodeSequence = [
          measurement.ConceptNameCodeSequence,
        ];
        return measurement;
      });
    }
    return [];
  },
  onDrawEnd: (event, viewerProperties) => {
    const { isLongAxis, isShortAxis } = event.feature.getProperties();
    const isBidirectional = isLongAxis || isShortAxis;
    if (isBidirectional) {
      attachPointerEvents(viewerProperties);
    }
  },
  onRemove: (feature, { drawingSource }) => {
    const { isLongAxis } = feature.getProperties();
    if (isLongAxis) {
      /**
       * TODO: This generate error noise because short axis is invisible feature
       * and won't be available in the remove handlers elsewhere.
       */
      const shortAxisFeatureId = getShortAxisId(feature);
      const shortAxisFeature = drawingSource.getFeatureById(shortAxisFeatureId);
      drawingSource.removeFeature(shortAxisFeature);
    }
  },
  onSetFeatureStyle: (feature, styleOptions, viewerProperties) => {
    const { drawingSource } = viewerProperties;
    const { isLongAxis, isShortAxis } = feature.getProperties();

    const isBidirectional = isLongAxis || isShortAxis;

    if (!isBidirectional) {
      return;
    }

    if (isBidirectional) {
      if (styleOptions.stroke) {
        styles.stroke = Object.assign(styles.stroke, styleOptions.stroke);
      }
    }

    const axisStyle = getAxisStyle();

    if (isLongAxis) {
      feature.setStyle(axisStyle);
      feature.set(Enums.InternalProperties.StyleOptions, styles);

      const shortAxisFeatureId = getShortAxisId(feature);
      const shortAxisFeature = drawingSource.getFeatureById(shortAxisFeatureId);
      if (shortAxisFeature) {
        shortAxisFeature.setStyle(axisStyle);
        shortAxisFeature.set(Enums.InternalProperties.StyleOptions, styles);
      }
    }

    if (isShortAxis) {
      feature.setStyle(axisStyle);
      feature.set(Enums.InternalProperties.StyleOptions, styles);

      const longAxisFeatureId = getLongAxisId(draggedFeature);
      const longAxisFeature = drawingSource.getFeatureById(longAxisFeatureId);
      if (longAxisFeature) {
        longAxisFeature.setStyle(axisStyle);
        longAxisFeature.set(Enums.InternalProperties.StyleOptions, styles);
      }
    }
  }
})

export default bidirectional;
