import init from './init';
import ArrowGeometry from './arrow';
import LengthGeometry from './length';
import FreeTextGeometry from './freeText';

export { default as ArrowGeometry } from './arrow';
export { default as LengthGeometry } from './length';
export { default as FreeTextGeometry } from './freeText';
export { default as init } from './init';

export const CustomGeometry = {
  Length: 'Length',
  Arrow: 'Arrow',
  FreeText: 'FreeText'
};

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
  CustomGeometry,
  ArrowGeometry,
  LengthGeometry
};