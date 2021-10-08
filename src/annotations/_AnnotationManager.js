import dcmjs from "dcmjs";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Circle from "ol/geom/Circle";

import _MarkupManager from "./markups/_MarkupManager";

/** Enums */
import Enums from "../enums";

/** Markers */
import ArrowMarker, { format as arrowFormat } from "./markers/arrow";

/** Markups */
import MeasurementMarkup, {
  format as measurementFormat,
} from "./markups/measurement";
import TextEvaluationMarkup, {
  format as textFormat,
} from "./markups/textEvaluation";

/** Utils */
import {
  areCodedConceptsEqual,
  getContentItemNameCodedConcept,
} from "../utils";
import Modify from "ol/interaction/Modify";
import setHandlesPosition from "./setHandlesPosition";

const { Marker, Markup } = Enums;

class _AnnotationManager {
  constructor({ map, features, pyramid, drawingLayer, drawingSource } = {}) {
    const markupManager = new _MarkupManager({
      map,
      pyramid,
      formatters: {
        [Marker.Arrow]: arrowFormat,
        [Markup.Measurement]: measurementFormat,
        [Markup.TextEvaluation]: textFormat,
      },
    });

    this.props = {
      map,
      pyramid,
      markupManager,
    };

    /** Markups */
    this[Markup.Measurement] = MeasurementMarkup(this.props);
    this[Markup.TextEvaluation] = TextEvaluationMarkup(this.props);

    /** Markers */
    this[Marker.Arrow] = ArrowMarker(this.props);

    this.onDrawStart = this.onDrawStart.bind(this);

    this.features = features;
    this.map = map;
    this.drawingLayer = drawingLayer;
    this.drawingSource = drawingSource;
  }

  /**
   * Add markup properties based on ROI
   * measurements and evaluations.
   *
   * @param {Feature} feature The feature
   */
  _addMeasurementsAndEvaluationsProperties(feature) {
    const { measurements, evaluations } = feature.getProperties();

    if (measurements && measurements.length) {
      return measurements.some((measurement) => {
        // eslint-disable-line
        const SUPPORTED_MEASUREMENTS_CODED_CONCEPTS = [
          new dcmjs.sr.coding.CodedConcept({
            meaning: "Area",
            value: "42798000",
            schemeDesignator: "SCT",
          }),
          new dcmjs.sr.coding.CodedConcept({
            meaning: "Length",
            value: "410668003",
            schemeDesignator: "SCT",
          }),
        ];
        const measurementCodedConcept =
          getContentItemNameCodedConcept(measurement);
        if (
          SUPPORTED_MEASUREMENTS_CODED_CONCEPTS.some((codedConcept) =>
            areCodedConceptsEqual(measurementCodedConcept, codedConcept)
          )
        ) {
          feature.set(
            Enums.InternalProperties.Markup,
            Enums.Markup.Measurement
          );
        }
      });
    }

    if (evaluations && evaluations.length) {
      return evaluations.some((evaluation) => {
        // eslint-disable-line
        const SUPPORTED_EVALUATIONS_CODED_CONCEPTS = [
          new dcmjs.sr.coding.CodedConcept({
            value: "112039",
            meaning: "Tracking Identifier",
            schemeDesignator: "DCM",
          }),
        ];
        const evaluationCodedConcept =
          getContentItemNameCodedConcept(evaluation);
        if (
          SUPPORTED_EVALUATIONS_CODED_CONCEPTS.some((codedConcept) =>
            areCodedConceptsEqual(codedConcept, evaluationCodedConcept)
          )
        ) {
          feature.set(
            Enums.InternalProperties.Markup,
            Enums.Markup.TextEvaluation
          );
        }
      });
    }
  }

  /**
   * Sets annotations visibility.
   *
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    this.props.markupManager.setVisible(isVisible);
  }

  onAdd(feature) {
    /**
     * Add properties to ROI feature before triggering
     * markup and markers callbacks to keep UI in sync.
     */
    this._addMeasurementsAndEvaluationsProperties(feature);

    this[Marker.Arrow].onAdd(feature);
    this[Markup.Measurement].onAdd(feature);
    this[Markup.TextEvaluation].onAdd(feature);
  }

  onFailure(uid) {
    this[Marker.Arrow].onFailure(uid);
    this[Markup.Measurement].onFailure(uid);
    this[Markup.TextEvaluation].onFailure(uid);
  }

  onRemove(feature) {
    this[Marker.Arrow].onRemove(feature);
    this[Markup.Measurement].onRemove(feature);
    this[Markup.TextEvaluation].onRemove(feature);
  }

  onUpdate(feature) {
    this[Marker.Arrow].onUpdate(feature);
    this[Markup.Measurement].onUpdate(feature);
    this[Markup.TextEvaluation].onUpdate(feature);
  }

  onDrawStart(event, options, _setFeatureStyle) {
    this[Marker.Arrow].onDrawStart(event);
    this[Markup.Measurement].onDrawStart(event);
    this[Markup.TextEvaluation].onDrawStart(event);

    const features = this.features;

    if (options.geometryType === "line" && options.bidirectional === true) {
      const longAxisFeature = event.feature;

      longAxisFeature.setProperties({ isLongAxis: true }, true);

      const interactions = this.map.getInteractions();
      const modify = interactions.getArray().find(i => i instanceof Modify);
      const onModifyHandler = event => {
        const { coordinate } = event.mapBrowserEvent;
        const feature = this.drawingSource.getClosestFeatureToCoordinate(coordinate);
        const geometry = feature.getGeometry();
        const previousCoordinates = geometry.getCoordinates();
        geometry.setProperties({ previousCoordinates }, true);
      };
      modify.on('modifystart', onModifyHandler);
      modify.on('modifyend', onModifyHandler);

      this.map.on('pointerdrag', event => {
        const coordinate = event.coordinate;
        const feature = this.drawingSource.getClosestFeatureToCoordinate(coordinate);
        const { isLongAxis, isShortAxis } = feature.getProperties();

        if (isLongAxis) {
          const shortAxisFeatureId = `short-axis-${feature.getId()}`;
          const shortAxisFeature = this.drawingSource.getFeatureById(shortAxisFeatureId);
          setHandlesPosition({ x: 0, y: 0 }, event, feature, shortAxisFeature);
          return;
        }

        if (isShortAxis) {
          const longAxisFeatureId = feature.getId().split('short-axis-')[1];
          const longAxisFeature = this.drawingSource.getFeatureById(longAxisFeatureId);
          setHandlesPosition({ x: 0, y: 0 }, event, longAxisFeature, feature);
          return;
        }
      });

      longAxisFeature
        .getGeometry()
        .on(Enums.FeatureGeometryEvents.CHANGE, (event) => {
          const longAxisGeometry = event.target;

          const [startPoints, endPoints] = longAxisGeometry.getCoordinates();
          const start = { x: startPoints[0], y: startPoints[1] };
          const end = { x: endPoints[0], y: endPoints[1] };
          const perpendicularAxis = getPerpendicularAxis({ start, end });

          const shortAxisCoordinates = [
            [perpendicularAxis.start.x, perpendicularAxis.start.y],
            [perpendicularAxis.end.x, perpendicularAxis.end.y],
          ];

          const id = `short-axis-${longAxisFeature.getId()}`;
          const existentShortAxisFeature = features
            .getArray()
            .find((f) => f.getId() === id);

          if (existentShortAxisFeature) {
            // TODO: deal with existent short axis (avoid changing it every time, keep length and positions)
            const existentShortAxisGeometry = existentShortAxisFeature.getGeometry();
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

          _setFeatureStyle(
            shortAxisFeature,
            options[Enums.InternalProperties.StyleOptions]
          );

          features.push(shortAxisFeature);
        });
    }
  }

  setDraw(drawInteraction) {
    this.draw = drawInteraction;
  }

  onDrawEnd(event) {
    this[Marker.Arrow].onDrawEnd(event);
    this[Markup.Measurement].onDrawEnd(event);
    this[Markup.TextEvaluation].onDrawEnd(event);
    this.props.markupManager.onDrawEnd(event);
  }

  onDrawAbort(event) {
    this[Marker.Arrow].onDrawAbort(event);
    this[Markup.Measurement].onDrawAbort(event);
    this[Markup.TextEvaluation].onDrawAbort(event);
    this.props.markupManager.onDrawAbort(event);
  }
}

export default _AnnotationManager;

const getPerpendicularAxis = (line, imageMetadata = {}) => {
  // getPixelSpacing (metadata) from scoord utils (image metadata)
  const getLineVector = (
    columnPixelSpacing,
    rowPixelSpacing,
    startPoint,
    endPoint
  ) => {
    const dx = (startPoint.x - endPoint.x) * columnPixelSpacing;
    const dy = (startPoint.y - endPoint.y) * rowPixelSpacing;
    const length = Math.sqrt(dx * dx + dy * dy);
    const vectorX = dx / length;
    const vectorY = dy / length;

    return {
      x: vectorX,
      y: vectorY,
      length,
    };
  };

  let startX, startY, endX, endY;

  const { start, end } = line;
  const { columnPixelSpacing = 1, rowPixelSpacing = 1 } = imageMetadata;

  if (start.x === end.x && start.y === end.y) {
    startX = start.x;
    startY = start.y;
    endX = end.x;
    endY = end.y;
  } else {
    // Mid point of long-axis line
    const mid = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };

    // Inclination of the perpendicular line
    const vector = getLineVector(
      columnPixelSpacing,
      rowPixelSpacing,
      start,
      end
    );

    const perpendicularLineLength = vector.length / 2;
    const rowMultiplier = perpendicularLineLength / (2 * rowPixelSpacing);
    const columnMultiplier = perpendicularLineLength / (2 * columnPixelSpacing);

    startX = mid.x + columnMultiplier * vector.y;
    startY = mid.y - rowMultiplier * vector.x;
    endX = mid.x - columnMultiplier * vector.y;
    endY = mid.y + rowMultiplier * vector.x;
  }

  const perpendicular = { start: {}, end: {} };
  perpendicular.start.x = startX;
  perpendicular.start.y = startY;
  perpendicular.end.x = endX;
  perpendicular.end.y = endY;
  return perpendicular;
};
