import dcmjs from "dcmjs";

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
import { areCodedConceptsEqual, getContentItemNameCodedConcept } from "../utils";

const { Marker, Markup } = Enums;

class _AnnotationManager {
  constructor({ map, pyramid } = {}) {
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
        ];
        const measurementCodedConcept = getContentItemNameCodedConcept(
          measurement
        );
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
        const evaluationCodedConcept = getContentItemNameCodedConcept(
          evaluation
        );
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

  onDrawStart(event) {
    this[Marker.Arrow].onDrawStart(event);
    this[Markup.Measurement].onDrawStart(event);
    this[Markup.TextEvaluation].onDrawStart(event);
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
