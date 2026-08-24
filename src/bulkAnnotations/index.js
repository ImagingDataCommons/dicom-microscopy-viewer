/**
 * Bulk Microscopy Simple Annotations — deck.gl renderer subsystem.
 */

export { default as getExtendedROI } from './getExtendedROI.js'
export { BulkAnnotationManager } from './manager.js'

/** Deprecated OL Feature builders — kept for public API / slim src/viv shims. */
export {
  getCircleFeature,
  getEllipseFeature,
  getFeaturesFromBulkAnnotations,
  getPointFeature,
  getPolygonFeature,
  getRectangleFeature,
  getViewportBoundingBox,
  isCoordinateInsideBoundingBox,
} from './utils.js'
