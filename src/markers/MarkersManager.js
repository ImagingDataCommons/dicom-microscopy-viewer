
import { MarkerManager } from './index';
import { Marker } from './enums';
import {
  ArrowMarker,
  LengthMarker,
  FreeTextMarker
} from './definitions';

const {
  Length,
  FreeText,
  Arrow
} = Marker;

class MarkersManager {
  constructor({ map, source, controls } = {}) {
    this.props = { map, source, controls };

    this[Length] = LengthMarker(this.props);
    this[Arrow] = ArrowMarker(this.props);
    this[FreeText] = FreeTextMarker(this.props);

    this.props.markerManager = new MarkerManager({
      map,
      source,
      geometries: [Length, Arrow],
      unlinkGeometries: [FreeText],
      undraggableGeometries: [FreeText],
      formatters: {
        [Length]: this[Length].format,
        [Arrow]: this[Arrow].format,
        [FreeText]: this[FreeText].format
      },
    });
  }

  onInteractionsChange(interactions) {
    this[Length].onInteractionsChange(interactions);
    this[Arrow].onInteractionsChange(interactions);
    this[FreeText].onInteractionsChange(interactions);
  }

  onAdd(feature, properties) {
    this[Arrow].onAdd(feature, properties);
    this[Length].onAdd(feature, properties);
    this[FreeText].onAdd(feature, properties);
  }

  onRemove(feature) {
    this[Length].onRemove(feature);
    this[Arrow].onRemove(feature);
    this[FreeText].onRemove(feature);
  }

  onUpdate(feature) {
    this[Arrow].onUpdate(feature);
    this[Length].onUpdate(feature);
    this[FreeText].onUpdate(feature);
  }

  onDrawEnd(feature) {
    this[Arrow].onDrawEnd(feature);
    this[Length].onDrawEnd(feature);
    this[FreeText].onDrawEnd(feature);
  }

  getROIProperties(feature, properties = {}) {
    return {
      ...properties,
      ...this[Arrow].getROIProperties(feature, properties),
      ...this[Length].getROIProperties(feature, properties),
      ...this[FreeText].getROIProperties(feature, properties)
    };
  }

  getMarkerOptions(marker, options = {}) {
    if (!this[marker]) {
      console.warn(`Invalid marker for ${options.geometryName}`);
      return options;
    }

    return this[marker].getDefinition(options);
  }

  insertVertexCondition(feature) {
    return !this[Length].isLength(feature) && !this[Arrow].isArrow(feature);
  }
}

export default MarkersManager;