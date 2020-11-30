
import { Annotation, MarkerManager } from './index';
import {
  ArrowAnnotation,
  LengthAnnotation,
  FreeTextAnnotation
} from './definitions';

class AnnotationManager {
  constructor({ map, source, controls } = {}) {
    this.api = { map, source, controls };

    this.length = LengthAnnotation(this.api);
    this.arrow = ArrowAnnotation(this.api);
    this.freeText = FreeTextAnnotation(this.api);

    this.api.markerManager = new MarkerManager({
      map,
      source,
      geometries: [Annotation.Length, Annotation.Arrow],
      unlinkGeometries: [Annotation.FreeText],
      undraggableGeometries: [Annotation.FreeText],
      formatters: {
        [Annotation.Length]: this.length.format,
        [Annotation.Arrow]: this.arrow.format,
        [Annotation.FreeText]: this.freeText.format
      },
    });
  }

  onInteractionsChange(interactions) {
    this.length.onInteractionsChange(interactions);
    this.arrow.onInteractionsChange(interactions);
    this.freeText.onInteractionsChange(interactions);
  }

  onAdd(feature, properties) {
    this.arrow.onAdd(feature, properties);
    this.length.onAdd(feature, properties);
    this.freeText.onAdd(feature, properties);
  }

  onRemove(feature) {
    this.length.onRemove(feature);
    this.arrow.onRemove(feature);
    this.freeText.onRemove(feature);
  }

  onUpdate(feature) {
    this.arrow.onUpdate(feature);
    this.length.onUpdate(feature);
    this.freeText.onUpdate(feature);
  }

  onDrawEnd(feature) {
    this.arrow.onDrawEnd(feature);
    this.length.onDrawEnd(feature);
    this.freeText.onDrawEnd(feature);
  }

  getROIProperties(feature, properties = {}) {
    return {
      ...properties,
      ...this.arrow.getROIProperties(feature, properties),
      ...this.length.getROIProperties(feature, properties),
      ...this.freeText.getROIProperties(feature, properties)
    };
  }

  getDefinitions(options) {
    return {
      ...this.length.getDefinition(options),
      ...this.arrow.getDefinition(options),
      ...this.freeText.getDefinition(options),
    }
  }

  insertVertexCondition(feature) {
    return !this.length.isLength(feature) && !this.arrow.isArrow(feature);
  }
}

export default AnnotationManager;