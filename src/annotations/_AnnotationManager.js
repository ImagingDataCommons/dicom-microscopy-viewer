import dcmjs from "dcmjs";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";

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
import Draw from "ol/interaction/Draw";
import moveBidirectionalHandles from "./moveBidirectionalHandles";
import getShortAxis from "./getShortAxis";

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
      const modify = interactions.getArray().find((i) => i instanceof Modify);
      const onModifyHandler = (event) => {
        const { coordinate } = event.mapBrowserEvent;
        const feature =
          this.drawingSource.getClosestFeatureToCoordinate(coordinate);
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

        _setFeatureStyle(
          shortAxisFeature,
          options[Enums.InternalProperties.StyleOptions]
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

      this.map.on("pointerdrag", (event) => {
        const handleCoordinate = event.coordinate;
        const handle = { x: handleCoordinate[0], y: handleCoordinate[1] };

        const feature =
          this.drawingSource.getClosestFeatureToCoordinate(handleCoordinate);
        const { isLongAxis, isShortAxis } = feature.getProperties();

        if (isLongAxis) {
          const shortAxisFeatureId = `short-axis-${feature.getId()}`;
          const shortAxisFeature =
            this.drawingSource.getFeatureById(shortAxisFeatureId);
          moveBidirectionalHandles(handle, feature, shortAxisFeature);
          return;
        }

        if (isShortAxis) {
          const longAxisFeatureId = feature.getId().split("short-axis-")[1];
          const longAxisFeature =
            this.drawingSource.getFeatureById(longAxisFeatureId);
          moveBidirectionalHandles(handle, longAxisFeature, feature);
          return;
        }
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
