import dcmjs from "dcmjs";

import _MarkupManager from "./markups/_MarkupManager";
import MeasurementMarkup from "./markups/measurement";
import ArrowMarker from "./markers/arrow";
import FreeTextMarkup from "./markups/freeText";
import Enums from "../enums";
import { getUnitsSuffix } from "./markups/utils";

const { Marker, Markup, FeatureEvents } = Enums;

const RelationshipTypes = {
  HAS_OBS_CONTEXT: "HAS OBS CONTEXT",
};

class _AnnotationManager {
  constructor({ map, source, controls, getROI } = {}) {
    this.props = { map, source, controls, getROI };

    /** Markups */
    this[Markup.Measurement] = MeasurementMarkup(this.props);
    this[Markup.FreeTextEvaluation] = FreeTextMarkup(this.props);

    /** Markers */
    this[Marker.Arrow] = ArrowMarker(this.props);

    this.props.markupManager = new _MarkupManager({
      map,
      source,
      formatters: {
        [Marker.Arrow]: this[Marker.Arrow].format,
        [Markup.Measurement]: this[Markup.Measurement].format,
        [Markup.FreeTextEvaluation]: this[Markup.FreeTextEvaluation].format,
      },
      onDrawStart: this.onDrawStart.bind(this),
      onDrawEnd: this.onDrawEnd.bind(this),
    });
  }

  /**
   * Gets the code meaning of a given measurement or evaluation content item.
   *
   * @param {NumContentItem} contentItem The measurement or evaluation content item
   */
  getContentItemCodeMeaning(measurement) {
    const { ConceptNameCodeSequence } = measurement;
    return ConceptNameCodeSequence.length
      ? ConceptNameCodeSequence[0].CodeMeaning
      : ConceptNameCodeSequence.CodeMeaning;
  }

  /**
   * Add or update a ROI measurement.
   *
   * @param {Feature} feature The feature
   */
  addOrUpdateMeasurement(feature, measurement, codeMeaning) {
    const measurements = feature.get("measurements") || [];

    const index = measurements.findIndex((measurement) => {
      const meaning = this.getContentItemCodeMeaning(measurement);
      return meaning === codeMeaning;
    });

    if (index > -1) {
      measurements[index] = measurement;
    } else {
      measurements.push(measurement);
    }

    feature.set("measurements", measurements);
    console.debug("Current ROI Measurements", measurements);
  }

  /**
   * Add or update a ROI evaluation.
   *
   * @param {Feature} feature The feature
   */
  addOrUpdateEvaluation(feature, evaluation, codeMeaning) {
    const evaluations = feature.get("evaluations") || [];

    const index = evaluations.findIndex((evaluation) => {
      const meaning = this.getContentItemCodeMeaning(evaluation);
      return meaning === codeMeaning;
    });

    if (index > -1) {
      evaluations[index] = evaluation;
    } else {
      evaluations.push(evaluation);
    }

    feature.set("evaluations", evaluations);
    console.debug("Current ROI Evaluations", evaluations);
  }

  /**
   * Add or update ROI measurements and evaluations based on markup related properties.
   *
   * @param {Feature} feature The feature
   */
  _updateMeasurementsAndEvaluations(feature) {
    const view = this.props.map.getView();
    const unitsSuffix = getUnitsSuffix(view);
    const properties = feature.getProperties();

    if (properties.label) {
      const evaluation = new dcmjs.sr.valueTypes.TextContentItem({
        name: new dcmjs.sr.coding.CodedConcept({
          value: "112039",
          meaning: "Tracking Identifier",
          schemeDesignator: "DCM",
        }),
        value: properties.label,
        relationshipType: RelationshipTypes.HAS_OBS_CONTEXT,
      });
      this.addOrUpdateEvaluation(feature, evaluation, "Tracking Identifier");
    }

    if (properties.area) {
      const measurement = new dcmjs.sr.valueTypes.NumContentItem({
        name: new dcmjs.sr.coding.CodedConcept({
          value: "42798000",
          meaning: "Area",
          schemeDesignator: "DCM",
        }),
        value: properties.area,
        unit: unitsSuffix,
      });
      this.addOrUpdateMeasurement(feature, measurement, "Area");
    }

    if (properties.length) {
      const measurement = new dcmjs.sr.valueTypes.NumContentItem({
        name: new dcmjs.sr.coding.CodedConcept({
          value: "410668003",
          meaning: "Length",
          schemeDesignator: "DCM",
        }),
        value: properties.length,
        unit: unitsSuffix,
      });
      this.addOrUpdateMeasurement(feature, measurement, "Length");
    }
  }

  /**
   * Add markup properties based on ROI measurements and evaluations.
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
          feature.set("markup", "measurement");
        }
      });
    }

    if (evaluations && evaluations.length) {
      return evaluations.some((evaluation) => {
        const SUPPORTED_EVALUATIONS = ["Tracking Identifier"];
        let codeMeaning = this.getContentItemCodeMeaning(evaluation);
        if (SUPPORTED_EVALUATIONS.includes(codeMeaning)) {
          feature.set("markup", "freetext");
        }
      });
    }
  }

  onInteractionsChange(interactions) {
    this.props.markupManager.onInteractionsChange(interactions);
  }

  onAdd(feature) {
    /**
     * Add properties to ROI feature before triggering
     * markup and markers callbacks to keep UI in sync with them.
     */
    this._addMeasurementsAndEvaluationsProperties(feature);

    this[Marker.Arrow].onAdd(feature);
    this[Markup.Measurement].onAdd(feature);
    this[Markup.FreeTextEvaluation].onAdd(feature);

    /**
     * Generate and update ROI measurements and evaluations.
     */
    this._updateMeasurementsAndEvaluations(feature);
    feature.on(FeatureEvents.PROPERTY_CHANGE, () =>
      this._updateMeasurementsAndEvaluations(feature)
    );
  }

  onRemove(feature) {
    this[Marker.Arrow].onRemove(feature);
    this[Markup.Measurement].onRemove(feature);
    this[Markup.FreeTextEvaluation].onRemove(feature);
  }

  onUpdate(feature) {
    this[Marker.Arrow].onUpdate(feature);
    this[Markup.Measurement].onUpdate(feature);
    this[Markup.FreeTextEvaluation].onUpdate(feature);
  }

  onDrawStart(event) {
    this[Marker.Arrow].onDrawStart(event);
    this[Markup.Measurement].onDrawStart(event);
    this[Markup.FreeTextEvaluation].onDrawStart(event);
  }

  onDrawEnd(event) {
    this[Marker.Arrow].onDrawEnd(event);
    this[Markup.Measurement].onDrawEnd(event);
    this[Markup.FreeTextEvaluation].onDrawEnd(event);
  }
}

export default _AnnotationManager;
