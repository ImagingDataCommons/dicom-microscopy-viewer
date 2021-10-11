import LineString from "ol/geom/LineString";
import Modify from "ol/interaction/Modify";
import Draw from "ol/interaction/Draw";
import Feature from "ol/Feature";

import Enums from '../../../enums'
import moveBidirectionalHandles from "./moveBidirectionalHandles";
import getShortAxis from "./getShortAxis";
import { distance } from "./mathUtils";

const bidirectional = {
  onDrawStart: (event, { features, drawingOptions, setFeatureStyle, drawingSource, map }) => {
    if (drawingOptions.geometryType === "line" && drawingOptions.bidirectional === true) {
      const longAxisFeature = event.feature;

      longAxisFeature.setProperties({ isLongAxis: true }, true);

      const interactions = map.getInteractions();
      const modify = interactions.getArray().find((i) => i instanceof Modify);
      const onModifyHandler = (event) => {
        const { coordinate } = event.mapBrowserEvent;
        const feature = drawingSource.getClosestFeatureToCoordinate(coordinate);
        const geometry = feature.getGeometry();
        const prevCoords = geometry.getCoordinates();
        geometry.setProperties({ prevCoords }, true);
      };
      modify.on("modifystart", onModifyHandler);
      modify.on("modifyend", onModifyHandler);

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

        const id = `short-axis-${longAxisFeature.getId()}`;
        const existentShortAxisFeature = features
          .getArray()
          .find((f) => f.getId() === id);

        if (existentShortAxisFeature) {
          const existentShortAxisGeometry =
            existentShortAxisFeature.getGeometry();
          const prevCoords = existentShortAxisGeometry.getCoordinates();
          existentShortAxisGeometry.setProperties({ prevCoords }, true);
          existentShortAxisGeometry.setCoordinates(shortAxisCoordinates);
          return;
        }

        const shortAxisGeometry = new LineString(shortAxisCoordinates);
        shortAxisGeometry.setCoordinates(shortAxisCoordinates);

        const shortAxisFeature = new Feature({
          geometry: shortAxisGeometry,
          name: "Line",
        });
        shortAxisFeature.setId(id);
        shortAxisFeature.setProperties({ isShortAxis: true }, true);

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
      const onDrawEndHandler = (event) => {
        longAxisFeature
          .getGeometry()
          .un(Enums.FeatureGeometryEvents.CHANGE, onFeatureChangeHandler);
      };
      draw.on("drawend", onDrawEndHandler);

      map.on("pointerdrag", (event) => {
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
          const shortAxisFeatureId = `short-axis-${feature.getId()}`;
          const shortAxisFeature =
            drawingSource.getFeatureById(shortAxisFeatureId);
          moveBidirectionalHandles(handle, feature, shortAxisFeature, feature);
          return;
        }

        if (isShortAxis) {
          const longAxisFeatureId = feature.getId().split("short-axis-")[1];
          const longAxisFeature =
            drawingSource.getFeatureById(longAxisFeatureId);
          moveBidirectionalHandles(handle, longAxisFeature, feature, feature);
          return;
        }
      });
    }
  },
};

export default bidirectional;