import dcmjs from "dcmjs";
import Feature from "ol/Feature";

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
import ellipse from "./markups/ellipse/ellipse";
import bidirectional from "./markups/bidirectional/bidirectional";

const { Marker, Markup } = Enums;

class _AnnotationManager {
  constructor({ map, pyramid, drawingSource, features } = {}) {
    const markupManager = new _MarkupManager({
      map,
      pyramid,
      drawingSource,
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
      drawingSource,
      features,
    };

    /** Markups */
    this[Markup.Measurement] = MeasurementMarkup(this.props);
    this[Markup.TextEvaluation] = TextEvaluationMarkup(this.props);

    /** Markers */
    this[Marker.Arrow] = ArrowMarker(this.props);

    /** Init */
    this.onInit();
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
          new dcmjs.sr.coding.CodedConcept({
            meaning: "Long Axis",
            value: "G-A185",
            schemeDesignator: "SRT",
          }),
          new dcmjs.sr.coding.CodedConcept({
            meaning: "Short Axis",
            value: "G-A186",
            schemeDesignator: "SRT",
          }),
          new dcmjs.sr.coding.CodedConcept({
            meaning: "AREA",
            value: "G-D7FE",
            schemeDesignator: "SRT",
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

  /**
   * Set markup visibility.
   *
   * @param {string} id The markup id
   * @param {boolean} isVisible The markup visibility
   */
  setMarkupVisibility(id, isVisible) {
    const feature = this.props.drawingSource.getFeatureById(id);
    if (feature) {
      this.props.markupManager.setVisibility(id, isVisible);
    }
  }

  getNormalizedFeature(feature) {
    return (
      bidirectional.getNormalizedFeature(feature, this.props) ||
      ellipse.getNormalizedFeature(feature, this.props)
    );
  }

  getNormalizedFeatureId(feature) {
    return (
      bidirectional.getNormalizedFeatureId(feature, this.props) ||
      ellipse.getNormalizedFeatureId(feature, this.props)
    );
  }
  
  getMeasurements(feature) {
    /** Annotations */
    return bidirectional
      .getMeasurements(feature, this.props)
      .concat(ellipse.getMeasurements(feature, this.props));
  }

  onAdd(feature) {
    /**
     * Add properties to ROI feature before triggering
     * markup and markers callbacks to keep UI in sync.
     */
    this._addMeasurementsAndEvaluationsProperties(feature);

    /** Markups & Markers */
    this[Marker.Arrow].onAdd(feature, this.props);
    this[Markup.Measurement].onAdd(feature, this.props);
    this[Markup.TextEvaluation].onAdd(feature, this.props);

    /** Annotations */
    bidirectional.onAdd(feature, this.props);
    ellipse.onAdd(feature, this.props);
  }

  onInit() {
    /** Markups & Markers */
    this[Marker.Arrow].onInit(this.props);
    this[Markup.Measurement].onInit(this.props);
    this[Markup.TextEvaluation].onInit(this.props);

    /** Annotations */
    bidirectional.onInit(this.props);
    ellipse.onInit(this.props);
  }

  onFailure(uid) {
    /** Markups & Markers */
    this[Marker.Arrow].onFailure(uid, this.props);
    this[Markup.Measurement].onFailure(uid, this.props);
    this[Markup.TextEvaluation].onFailure(uid, this.props);

    /** Annotations */
    bidirectional.onFailure(uid, this.props);
    ellipse.onFailure(uid, this.props);
  }

  onRemove(feature) {
    /** Markups & Markers */
    this[Marker.Arrow].onRemove(feature, this.props);
    this[Markup.Measurement].onRemove(feature, this.props);
    this[Markup.TextEvaluation].onRemove(feature, this.props);

    /** Annotations */
    bidirectional.onRemove(feature, this.props);
    ellipse.onRemove(feature, this.props);
  }

  onUpdate(feature) {
    /** Markups & Markers */
    this[Marker.Arrow].onUpdate(feature, this.props);
    this[Markup.Measurement].onUpdate(feature, this.props);
    this[Markup.TextEvaluation].onUpdate(feature, this.props);

    /** Annotations */
    bidirectional.onUpdate(feature, this.props);
    ellipse.onUpdate(feature, this.props);
  }

  onDrawStart(event, drawingOptions) {
    this.props.drawingOptions = drawingOptions;

    /** Markups & Markers */
    this[Marker.Arrow].onDrawStart(event, this.props);
    this[Markup.Measurement].onDrawStart(event, this.props);
    this[Markup.TextEvaluation].onDrawStart(event, this.props);

    /** Annotations */
    bidirectional.onDrawStart(event, this.props);
    ellipse.onDrawStart(event, this.props);
  }

  onDrawEnd(event, drawingOptions) {
    this.props.drawingOptions = drawingOptions;

    /** Markups & Markers */
    this[Marker.Arrow].onDrawEnd(event, this.props);
    this[Markup.Measurement].onDrawEnd(event, this.props);
    this[Markup.TextEvaluation].onDrawEnd(event, this.props);

    /** Annotations */
    bidirectional.onDrawEnd(event, this.props);
    ellipse.onDrawEnd(event, this.props);

    /** Managers */
    this.props.markupManager.onDrawEnd(event, this.props);
  }

  onDrawAbort(event) {
    /** Markups & Markers */
    this[Marker.Arrow].onDrawAbort(event, this.props);
    this[Markup.Measurement].onDrawAbort(event, this.props);
    this[Markup.TextEvaluation].onDrawAbort(event, this.props);

    /** Annotations */
    bidirectional.onDrawAbort(event, this.props);
    ellipse.onDrawAbort(event, this.props);

    /** Managers */
    this.props.markupManager.onDrawAbort(event, this.props);
  }

  onSetFeatureStyle(feature, styleOptions) {
    /** Markups & Markers */
    this[Marker.Arrow].onSetFeatureStyle(feature, styleOptions, this.props);
    this[Markup.Measurement].onSetFeatureStyle(
      feature,
      styleOptions,
      this.props
    );
    this[Markup.TextEvaluation].onSetFeatureStyle(
      feature,
      styleOptions,
      this.props
    );

    /** Annotations */
    bidirectional.onSetFeatureStyle(feature, styleOptions, this.props);
    ellipse.onSetFeatureStyle(feature, styleOptions, this.props);
  }
}

export default _AnnotationManager;
