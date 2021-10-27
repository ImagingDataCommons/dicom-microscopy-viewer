import Draw from "ol/interaction/Draw";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";

import Enums from "../../../enums";
import moveBidirectionalHandles from "./moveBidirectionalHandles";
import getShortAxisCoords from "./getShortAxisCoords";
import createAndAddShortAxisFeature from "./createAndAddShortAxisFeature";
import updateMarkup from "./updateMarkup";
import { getShortAxisId, getLongAxisId } from "./id";
import getDraggedHandleIndex from "./getDraggedHandleIndex";
import { distance } from "./mathUtils";

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

const bidirectional = {
  onAdd: () => {},
  onInit: (viewerProperties) => {
    const { drawingSource, map } = viewerProperties;

    /**
     * This is used to avoid changing features while
     * dragging because of getClosestFeatureToCoordinate call
     */
    let draggedFeature = null;
    let draggedHandleIndex = null;
    let isValidDistance = null;
    let lastClickedCoord = null;
    let lastTranslatedCoord = null;
    map.on("pointerup", () => {
      draggedFeature = null;
      draggedHandleIndex = null;
      isValidDistance = null;
      lastClickedCoord = null;
      lastTranslatedCoord = null;
    });
    map.on("pointerdown", ({ coordinate }) => {
      lastClickedCoord = coordinate;
      lastTranslatedCoord = coordinate;
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

      const { isLongAxis, isShortAxis } = draggedFeature.getProperties();

      const isBidirectional = isLongAxis || isShortAxis;

      if (!isBidirectional) {
        return;
      }

      if (isValidDistance === null) {
        const [start, end] = draggedFeature.getGeometry().getCoordinates();
        const distanceStart = distance(
          { x: lastClickedCoord[0], y: lastClickedCoord[1] },
          { x: start[0], y: start[1] }
        );
        const distanceEnd = distance(
          { x: lastClickedCoord[0], y: lastClickedCoord[1] },
          { x: end[0], y: end[1] }
        );
        isValidDistance = Math.min(distanceStart, distanceEnd) <= 30;
      }

      if (isValidDistance === false) {
        event.stopPropagation();

        const { subFeatures } = draggedFeature.getProperties();
        if (subFeatures && subFeatures.length > 0) {
          subFeatures.forEach(subFeature => {
            const geometry = subFeature.getGeometry();
            const coords = lastTranslatedCoord;

            const deltaX = handleCoordinate[0] - coords[0];
            const deltaY = handleCoordinate[1] - coords[1];

            geometry.translate(deltaX, deltaY);
            draggedFeature.getGeometry().translate(deltaX, deltaY);

            lastTranslatedCoord = event.coordinate;
          });
        }

        return;
      }

      if (isBidirectional && draggedHandleIndex === null) {
        draggedHandleIndex = getDraggedHandleIndex(draggedFeature, handle);
      }

      if (isLongAxis) {
        const shortAxisFeatureId = getShortAxisId(draggedFeature);
        const shortAxisFeature =
          drawingSource.getFeatureById(shortAxisFeatureId);

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
    });
  },
  onInteractionsChange: (interactions, viewerProperties) => {},
  onDrawStart: (event, viewerProperties) => {
    const { drawingOptions, drawingSource, map } = viewerProperties;

    if (isDrawingBidirectional(drawingOptions)) {
      const longAxisFeature = event.feature;

      longAxisFeature.setProperties({ isLongAxis: true }, true);

      const interactions = map.getInteractions();

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
          getAxisStyle(drawingOptions[Enums.InternalProperties.StyleOptions])
        );
      };

      longAxisFeature
        .getGeometry()
        .on(
          Enums.FeatureGeometryEvents.CHANGE,
          onLongAxisFeatureGeometryChange
        );

      const draw = interactions.getArray().find((i) => i instanceof Draw);
      const onDrawEndHandler = () => {
        longAxisFeature
          .getGeometry()
          .un(
            Enums.FeatureGeometryEvents.CHANGE,
            onLongAxisFeatureGeometryChange
          );
      };
      draw.on(Enums.InteractionEvents.DRAW_END, onDrawEndHandler);
    }
  },
  onDrawEnd: () => {},
  onRemove: (feature, { drawingSource }) => {
    const { isLongAxis } = feature.getProperties();
    if (isLongAxis) {
      const shortAxisFeatureId = getShortAxisId(feature);
      const shortAxisFeature = drawingSource.getFeatureById(shortAxisFeatureId);
      drawingSource.removeFeature(shortAxisFeature);
    }
  },
  onSetFeatureStyle: (feature, styleOptions, viewerProperties) => {
    const { drawingSource } = viewerProperties;
    const { isLongAxis, isShortAxis } = feature.getProperties();

    const isBidirectional = isLongAxis || isShortAxis;
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
  },
};

export default bidirectional;
