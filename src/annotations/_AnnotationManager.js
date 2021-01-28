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
      formatters: {
        [Marker.Arrow]: this[Marker.Arrow].format,
        [Markup.Measurement]: this[Markup.Measurement].format,
        [Markup.FreeTextEvaluation]: this[Markup.FreeTextEvaluation].format,
      },
      onDrawStart: this.onDrawStart.bind(this),
      onDrawEnd: this.onDrawEnd.bind(this),
    });
  }

  onInteractionsChange(interactions) {
    this.props.markupManager.onInteractionsChange(interactions);
  }

  onAdd(feature) {
    this[Marker.Arrow].onAdd(feature);
    this[Markup.Measurement].onAdd(feature);
    this[Markup.FreeTextEvaluation].onAdd(feature);
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
