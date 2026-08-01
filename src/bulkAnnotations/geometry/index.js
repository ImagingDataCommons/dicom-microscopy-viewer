/**
 * Re-exports for the bulk annotation geometry module.
 */

export { computePolygonCentroid } from './centroids.js'
export {
  affineForReferencedPyramidLevel,
  buildPixelToSlideAffine,
  bulkVertexToOlMapFast,
  bulkVertexToOlMapFastWrite,
  coeffsFromAffine3x3,
  composeAffinesToCoeffs,
  isFiniteVertexXY,
  readTripleFromGraphicBuffer,
} from './coords.js'

export { decodeGraphicGroup } from './decode.js'

export {
  bucketAnnotations,
  buildTileSubviews,
  mortonCode,
} from './spatialTiles.js'
