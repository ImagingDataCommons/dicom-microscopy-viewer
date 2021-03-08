import dcmjs from "dcmjs";

import _MarkupManager from "./markups/_MarkupManager";

/** Enums */
import Enums from "../enums";

/** Utils */
import { isContentItemsEqual, getContentItemNameCodedConcept } from "../utils";

/** Markers */
import ArrowMarker, { format as arrowFormat } from "./markers/arrow";

/** Markups */
import MeasurementMarkup, {
  format as measurementFormat,
} from "./markups/measurement";
import TextEvaluationMarkup, { format as textFormat } from "./markups/text";

const { Marker, Markup, FeatureEvents } = Enums;

class _AnnotationManager {
  constructor({ map, source, controls, getROI } = {}) {
    const markupManager = new _MarkupManager({
      map,
      source,
      formatters: {
        [Marker.Arrow]: arrowFormat,
        [Markup.Measurement]: measurementFormat,
        [Markup.TextEvaluation]: textFormat,
      },
    });

    this.props = {
      map,
      source,
      controls,
      getROI,
      markupManager,
    };

    /** Markups */
    this[Markup.Measurement] = MeasurementMarkup(this.props);
    this[Markup.TextEvaluation] = TextEvaluationMarkup(this.props);

    /** Markers */
    this[Marker.Arrow] = ArrowMarker(this.props);
  }

  /**
   * Gets the code meaning of a given measurement
   * or evaluation content item
   *
   * @param {NumContentItem} contentItem The measurement or evaluation content item
   */
  getContentItemCodeMeaning(contentItem) {
    const { ConceptNameCodeSequence } = contentItem;
    return ConceptNameCodeSequence.length
      ? ConceptNameCodeSequence[0].CodeMeaning
      : ConceptNameCodeSequence.CodeMeaning;
  }

  /**
   * Add or update a ROI evaluation
   *
   * @param {Feature} feature The feature
   * @param {TextContentItem} newEvaluation The evaluation
   */
  addOrUpdateEvaluation(feature) {
    const evaluations = feature.get("evaluations") || [];

    const properties = feature.getProperties();
    if (!properties.label) return;

    const newEvaluation = new dcmjs.sr.valueTypes.TextContentItem({
      name: new dcmjs.sr.coding.CodedConcept({
        value: "112039",
        meaning: "Tracking Identifier",
        schemeDesignator: "DCM",
      }),
      value: properties.label,
      relationshipType: Enums.RelationshipTypes.HAS_OBS_CONTEXT,
    });

    const index = evaluations.findIndex((evaluation) => {
      return isContentItemsEqual(evaluation, newEvaluation);
    });

    if (index > -1) {
      evaluations[index] = newEvaluation;
    } else {
      evaluations.push(newEvaluation);
    }

    feature.set("evaluations", evaluations);
  }

  /**
   * Add markup properties based on ROI
   * measurements and evaluations
   *
   * @param {Feature} feature The feature
   */
  _addMeasurementsAndEvaluationsProperties(feature) {
    const { measurements, evaluations } = feature.getProperties();

    if (measurements && measurements.length) {
      return measurements.some((measurement) => {
        const SUPPORTED_MEASUREMENTS = ["Area", "Length"];
        let codeMeaning = this.getContentItemCodeMeaning(measurement);
        if (SUPPORTED_MEASUREMENTS.includes(codeMeaning)) {
          feature.set(
            Enums.InternalProperties.Markup,
            Enums.Markup.Measurement
          );
        }
      });
    }

    if (evaluations && evaluations.length) {
      return evaluations.some((evaluation) => {
        const SUPPORTED_EVALUATIONS = ["Tracking Identifier"];
        let codeMeaning = this.getContentItemCodeMeaning(evaluation);
        if (SUPPORTED_EVALUATIONS.includes(codeMeaning)) {
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
     * markup and markers callbacks to keep UI in sync
     */
    this._addMeasurementsAndEvaluationsProperties(feature);

    this[Marker.Arrow].onAdd(feature);
    this[Markup.Measurement].onAdd(feature);
    this[Markup.TextEvaluation].onAdd(feature);

    /**
     * Generate and update ROI evaluations
     */
    this.addOrUpdateEvaluation(feature);
    feature.on(FeatureEvents.PROPERTY_CHANGE, () =>
      this.addOrUpdateEvaluation(feature)
    );
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
}

export default _AnnotationManager;
