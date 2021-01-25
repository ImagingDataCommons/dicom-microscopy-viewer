import _MarkerManager from "../markers/_MarkerManager";
import MeasurementMarkup from "./measurement";
import ArrowMarker from "../markers/arrow";
import FreeTextMarkup from "./freeText";
import Enums from "../enums";

const { Measurement, FreeTextEvaluation } = Enums.Markup;
const { Arrow } = Enums.Marker;

class _MarkupManager {
  constructor({ map, source, controls } = {}) {
    this.props = { map, source, controls };

    this[Measurement] = MeasurementMarkup(this.props);
    this[Arrow] = ArrowMarker(this.props);
    this[FreeTextEvaluation] = FreeTextMarkup(this.props);

    this.props.markerManager = new _MarkerManager({
      map,
      source,
      geometries: [Measurement, Arrow],
      unlinkGeometries: [FreeTextEvaluation],
      undraggableGeometries: [FreeTextEvaluation],
      formatters: {
        [Measurement]: this[Measurement].format,
        [Arrow]: this[Arrow].format,
        [FreeTextEvaluation]: this[FreeTextEvaluation].format,
      },
    });
  }

  onInteractionsChange(interactions) {
    this[Measurement].onInteractionsChange(interactions);
    this[Arrow].onInteractionsChange(interactions);
    this[FreeTextEvaluation].onInteractionsChange(interactions);
  }

  onAdd(feature, properties) {
    this[Arrow].onAdd(feature, properties);
    this[Measurement].onAdd(feature, properties);
    this[FreeTextEvaluation].onAdd(feature, properties);
  }

  onRemove(feature) {
    this[Measurement].onRemove(feature);
    this[Arrow].onRemove(feature);
    this[FreeTextEvaluation].onRemove(feature);
  }

  onUpdate(feature) {
    this[Arrow].onUpdate(feature);
    this[Measurement].onUpdate(feature);
    this[FreeTextEvaluation].onUpdate(feature);
  }

  onDrawEnd(feature) {
    this[Arrow].onDrawEnd(feature);
    this[Measurement].onDrawEnd(feature);
    this[FreeTextEvaluation].onDrawEnd(feature);
  }

  getMarkerOptions(marker, options = {}) {
    if (!this[marker]) {
      console.warn(`Invalid marker for ${options.geometryName}`);
      return options;
    }

    return this[marker].getDefinition(options);
  }

  insertVertexCondition(feature) {
    return (
      !this[Measurement].isMeasurement(feature) && !this[Arrow].isArrow(feature)
    );
  }
}

export default _MarkupManager;
