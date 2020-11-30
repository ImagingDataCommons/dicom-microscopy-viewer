import init from './init';
import MarkerManager from './MarkerManager';
import Geometries from './definitions';

export { default as MarkerManager } from './MarkerManager';
export { default as Geometries } from './definitions';

export const CustomGeometry = {
  Length: 'Length',
  Arrow: 'Arrow',
  FreeText: 'FreeText'
};

const {
  LengthGeometry,
  ArrowGeometry,
  FreeTextGeometry
} = Geometries;

const commonAPI = {
  onInteractionsChange: interactions => {
    LengthGeometry.onInteractionsChange(interactions);
    ArrowGeometry.onInteractionsChange(interactions);
    FreeTextGeometry.onInteractionsChange(interactions);
  },
  onAdd: (feature, properties) => {
    ArrowGeometry.onAdd(feature, properties);
    LengthGeometry.onAdd(feature, properties);
    FreeTextGeometry.onAdd(feature, properties);
  },
  onRemove: feature => {
    LengthGeometry.onRemove(feature);
    ArrowGeometry.onRemove(feature);
    FreeTextGeometry.onRemove(feature);
  },
  onUpdate: feature => {
    ArrowGeometry.onUpdate(feature);
    LengthGeometry.onUpdate(feature);
    FreeTextGeometry.onUpdate(feature);
  },
  onDrawEnd: (feature) => {
    ArrowGeometry.onDrawEnd(feature);
    LengthGeometry.onDrawEnd(feature);
    FreeTextGeometry.onDrawEnd(feature);
  },
  getROIProperties: (feature, properties = {}) => {
    return {
      ...properties,
      ...ArrowGeometry.getROIProperties(feature, properties),
      ...LengthGeometry.getROIProperties(feature, properties),
      ...FreeTextGeometry.getROIProperties(feature, properties)
    };
  },
  getDefinitions: options => {
    return {
      ...LengthGeometry.getDefinition(options),
      ...ArrowGeometry.getDefinition(options),
      ...FreeTextGeometry.getDefinition(options),
    }
  },
  insertVertexCondition: feature => {
    return !LengthGeometry.isLength(feature) && !ArrowGeometry.isArrow(feature);
  }
};

export default {
  ...commonAPI,
  init,
  Geometries,
  CustomGeometry,
  MarkerManager
};