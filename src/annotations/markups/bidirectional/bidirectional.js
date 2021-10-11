import LineString from "ol/geom/LineString";
import Modify from "ol/interaction/Modify";
import Draw from "ol/interaction/Draw";
import Feature from "ol/Feature";

import Enums from "../../../enums";
import moveBidirectionalHandles from "./moveBidirectionalHandles";
import getShortAxis from "./getShortAxis";
import { distance } from "./mathUtils";
import { getFeatureScoord3dLength } from "../../../scoord3dUtils.js";

const SHORT_AXIS_ID_PREFIX = "short-axis-";

const bidirectional = {
  onDrawStart: (
    event,
    {
      features,
      drawingOptions,
      pyramid,
      markupManager,
      setFeatureStyle,
      drawingSource,
      map,
    }
  ) => {
    if (
      drawingOptions.geometryType === Enums.GeometryType.Line &&
      drawingOptions[Enums.InternalProperties.Bidirectional] === true
    ) {
      const longAxisFeature = event.feature;

      longAxisFeature.setProperties({ isLongAxis: true }, true);

      const interactions = map.getInteractions();

      const onFeatureChangeHandler = (event) => {
        const longAxisGeometry = event.target;

        const [startPoints, endPoints] = longAxisGeometry.getCoordinates();
        const start = { x: startPoints[0], y: startPoints[1] };
        const end = { x: endPoints[0], y: endPoints[1] };
        const shortAxis = getShortAxis({ start, end });

        const shortAxisCoordinates = [
          [shortAxis.start.x, shortAxis.start.y],
          [shortAxis.end.x, shortAxis.end.y],
        ];

        const id = SHORT_AXIS_ID_PREFIX + longAxisFeature.getId();
        const existentShortAxisFeature = features
          .getArray()
          .find((f) => f.getId() === id);

        if (existentShortAxisFeature) {
          const existentShortAxisGeometry =
            existentShortAxisFeature.getGeometry();
          existentShortAxisGeometry.setCoordinates(shortAxisCoordinates);

          const shortAxisLength = getFeatureScoord3dLength(
            existentShortAxisFeature,
            pyramid
          );
          const longAxisLength = getFeatureScoord3dLength(
            longAxisFeature,
            pyramid
          );
          const L = `L ${longAxisLength.toFixed(2)}`;
          const W = ` W ${shortAxisLength.toFixed(2)}`;
          const value = `${L}\n${W}`;
          markupManager.update({
            feature: longAxisFeature,
            value,
            coordinate: longAxisGeometry.getLastCoordinate(),
          });

          return;
        }

        const shortAxisGeometry = new LineString(shortAxisCoordinates);
        shortAxisGeometry.setCoordinates(shortAxisCoordinates);

        const shortAxisFeature = new Feature({ geometry: shortAxisGeometry });
        shortAxisFeature.setId(id);
        shortAxisFeature.setProperties({ isShortAxis: true }, true);

        shortAxisFeature.on(Enums.FeatureGeometryEvents.CHANGE, () => {
          const shortAxisLength = getFeatureScoord3dLength(
            shortAxisFeature,
            pyramid
          );
          const longAxisLength = getFeatureScoord3dLength(
            longAxisFeature,
            pyramid
          );
          const L = `L ${longAxisLength.toFixed(2)}`;
          const W = ` W ${shortAxisLength.toFixed(2)}`;
          const value = `${L}\n${W}`;
          markupManager.update({ feature: longAxisFeature, value });
        });

        setFeatureStyle(
          shortAxisFeature,
          drawingOptions[Enums.InternalProperties.StyleOptions]
        );

        features.push(shortAxisFeature);
      };

      longAxisFeature
        .getGeometry()
        .on(Enums.FeatureGeometryEvents.CHANGE, onFeatureChangeHandler);

      const draw = interactions.getArray().find((i) => i instanceof Draw);
      const onDrawEndHandler = () => {
        longAxisFeature
          .getGeometry()
          .un(Enums.FeatureGeometryEvents.CHANGE, onFeatureChangeHandler);
      };
      draw.on(Enums.InteractionEvents.DRAW_END, onDrawEndHandler);

      map.on(Enums.MapEvents.POINTER_DRAG, (event) => {
        const handleCoordinate = event.coordinate;
        const handle = { x: handleCoordinate[0], y: handleCoordinate[1] };

        const feature =
          drawingSource.getClosestFeatureToCoordinate(handleCoordinate);
        const { isLongAxis, isShortAxis } = feature.getProperties();
        const featureCoords = feature.getGeometry().getCoordinates();

        const start = {
          x: featureCoords[0][0],
          y: featureCoords[0][1],
        };
        const end = {
          x: featureCoords[1][0],
          y: featureCoords[1][1],
        };

        const distanceStart = distance(handle, start);
        const distanceEnd = distance(handle, end);
        feature.setProperties(
          {
            axisHandle: distanceStart < distanceEnd ? "start" : "end",
          },
          true
        );

        if (isLongAxis) {
          const shortAxisFeatureId = SHORT_AXIS_ID_PREFIX + feature.getId();
          const shortAxisFeature =
            drawingSource.getFeatureById(shortAxisFeatureId);
          moveBidirectionalHandles(handle, feature, shortAxisFeature, feature);
          return;
        }

        if (isShortAxis) {
          const longAxisFeatureId = feature
            .getId()
            .split(SHORT_AXIS_ID_PREFIX)[1];
          const longAxisFeature =
            drawingSource.getFeatureById(longAxisFeatureId);
          moveBidirectionalHandles(handle, longAxisFeature, feature, feature);
          return;
        }
      });
    }
  },
  onDrawEnd: () => {},
  onRemove: (feature, { drawingSource, features }) => {
    const { isLongAxis } = feature.getProperties();
    if (isLongAxis) {
      const shortAxisFeatureId = SHORT_AXIS_ID_PREFIX + feature.getId();
      const shortAxisFeature = drawingSource.getFeatureById(shortAxisFeatureId);
      features.remove(shortAxisFeature);
    }
  },
};

export default bidirectional;
