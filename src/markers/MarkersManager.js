
import { MarkerManager } from './index';
import { Marker } from './enums';
import {
  ArrowMarker,
  MeasurementMarker,
  FreeTextMarker
} from './definitions';

const {
  Measurement,
  FreeText,
  Arrow
} = Marker;

class MarkersManager {
  constructor({ map, source, controls } = {}) {
    this.props = { map, source, controls };

    this[Measurement] = MeasurementMarker(this.props);
    this[Arrow] = ArrowMarker(this.props);
    this[FreeText] = FreeTextMarker(this.props);

    this.props.markerManager = new MarkerManager({
      map,
      source,
      geometries: [Measurement, Arrow],
      unlinkGeometries: [FreeText],
      undraggableGeometries: [FreeText],
      formatters: {
        [Measurement]: this[Measurement].format,
        [Arrow]: this[Arrow].format,
        [FreeText]: this[FreeText].format
      },
    });
  }

  onInteractionsChange(interactions) {
    this[Measurement].onInteractionsChange(interactions);
    this[Arrow].onInteractionsChange(interactions);
    this[FreeText].onInteractionsChange(interactions);
  }

  onAdd(feature, properties) {
    this[Arrow].onAdd(feature, properties);
    this[Measurement].onAdd(feature, properties);
    this[FreeText].onAdd(feature, properties);
  }

  onRemove(feature) {
    this[Measurement].onRemove(feature);
    this[Arrow].onRemove(feature);
    this[FreeText].onRemove(feature);
  }

  onUpdate(feature) {
    this[Arrow].onUpdate(feature);
    this[Measurement].onUpdate(feature);
    this[FreeText].onUpdate(feature);
  }

  onDrawEnd(feature) {
    this[Arrow].onDrawEnd(feature);
    this[Measurement].onDrawEnd(feature);
    this[FreeText].onDrawEnd(feature);
  }

  addMeasurementsAndEvaluations(feature, roi) {
    this[Arrow].addMeasurementsAndEvaluations(feature, roi),
    this[Measurement].addMeasurementsAndEvaluations(feature, roi),
    this[FreeText].addMeasurementsAndEvaluations(feature, roi)
  }

  getMarkerOptions(marker, options = {}) {
    if (!this[marker]) {
      console.warn(`Invalid marker for ${options.geometryName}`);
      return options;
    }

    return this[marker].getDefinition(options);
  }

  insertVertexCondition(feature) {
    return !this[Measurement].isMeasurement(feature) && !this[Arrow].isArrow(feature);
  }
}

export default MarkersManager;