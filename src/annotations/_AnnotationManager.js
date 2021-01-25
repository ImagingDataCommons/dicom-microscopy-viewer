import _MarkupManager from "./markups/_MarkupManager";
import MeasurementMarkup from "./markups/measurement";
import ArrowMarker from "./markers/arrow";
import FreeTextMarkup from "./markups/freeText";
import Enums from "../enums";

const { Marker, Markup } = Enums;

class _AnnotationManager {
  constructor({ map, source, controls } = {}) {
    this.props = { map, source, controls };

    /** Markups */
    this[Markup.Measurement] = MeasurementMarkup(this.props);
    this[Markup.FreeTextEvaluation] = FreeTextMarkup(this.props);

    /** Markers */
    this[Marker.Arrow] = ArrowMarker(this.props);

    this.props.markupManager = new _MarkupManager({
      map,
      source,
      geometries: [Markup.Measurement, Marker.Arrow],
      unlinkGeometries: [Markup.FreeTextEvaluation],
      undraggableGeometries: [Markup.FreeTextEvaluation],
      formatters: {
        [Marker.Arrow]: this[Marker.Arrow].format,
        [Markup.Measurement]: this[Markup.Measurement].format,
        [Markup.FreeTextEvaluation]: this[Markup.FreeTextEvaluation].format,
      },
    });
  }

  onInteractionsChange(interactions) {
    this[Marker.Arrow].onInteractionsChange(interactions);
    this[Markup.Measurement].onInteractionsChange(interactions);
    this[Markup.FreeTextEvaluation].onInteractionsChange(interactions);
  }

  onAdd(feature, properties) {
    this[Marker.Arrow].onAdd(feature, properties);
    this[Markup.Measurement].onAdd(feature, properties);
    this[Markup.FreeTextEvaluation].onAdd(feature, properties);
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

  onDrawEnd(feature) {
    this[Marker.Arrow].onDrawEnd(feature);
    this[Markup.Measurement].onDrawEnd(feature);
    this[Markup.FreeTextEvaluation].onDrawEnd(feature);
  }

  getDrawOptions(marker, options = {}) {
    if (!this[marker]) {
      console.warn(`Invalid marker for ${options.geometryName}`);
      return options;
    }

    return this[marker].getDefinition(options);
  }

  insertVertexCondition(feature) {
    return (
      !this[Markup.Measurement].isMeasurement(feature) &&
      !this[Marker.Arrow].isArrow(feature)
    );
  }
}

export default _AnnotationManager;
