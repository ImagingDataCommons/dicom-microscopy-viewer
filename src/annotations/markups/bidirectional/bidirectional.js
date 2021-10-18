import Draw from "ol/interaction/Draw";

import Enums from "../../../enums";
import moveBidirectionalHandles from "./moveBidirectionalHandles";
import getShortAxisCoords from "./getShortAxisCoords";
import createAndAddShortAxisFeature from "./createAndAddShortAxisFeature";
import updateMarkup from "./updateMarkup";
import { getShortAxisId, getLongAxisId } from "./id";
import getDraggedHandleIndex from "./getDraggedHandleIndex";

const isDrawingBidirectional = (drawingOptions) =>
  drawingOptions.geometryType === Enums.GeometryType.Line &&
  drawingOptions[Enums.InternalProperties.Bidirectional] === true;

const bidirectional = {
  onInit: (viewerProperties) => {
    const { drawingSource, map } = viewerProperties;

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

      if (draggedHandleIndex === null) {
        draggedHandleIndex = getDraggedHandleIndex(draggedFeature, handle);
      }

      const { isLongAxis, isShortAxis } = draggedFeature.getProperties();

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

        createAndAddShortAxisFeature(longAxisFeature, viewerProperties);
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
  onRemove: (feature, { drawingSource, features }) => {
    const { isLongAxis } = feature.getProperties();
    if (isLongAxis) {
      const shortAxisFeatureId = getShortAxisId(feature);
      const shortAxisFeature = drawingSource.getFeatureById(shortAxisFeatureId);
      features.remove(shortAxisFeature);
    }
  },
  getSubFeatures: (feature, viewerProperties) => {
    const { drawingSource } = viewerProperties; 
    let subFeatures = [];
    const { isLongAxis } = feature.getProperties();
    if (isLongAxis) {
      const shortAxisFeatureId = getShortAxisId(feature);
      const shortAxisFeature = drawingSource.getFeatureById(shortAxisFeatureId);
      subFeatures.push(shortAxisFeature);
    }
    subFeatures;
  },
};

export default bidirectional;
