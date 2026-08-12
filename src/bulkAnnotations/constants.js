/**
 * Shared constants for the deck.gl bulk-annotation renderer.
 */

/** Match OpenLayers cluster threshold: LOD applies above this count. */
export const BULK_LOD_MIN_ANNOTATIONS = 1000

/** Default pyramid levels from finest that show full paths (rest = centroids). */
export const BULK_LOD_DEFAULT_LEVELS_FROM_FINEST = 1

/** Physical centroid diameter in millimeters (~5 µm), matching viewer.js. */
export const BULK_CENTROID_DIAMETER_MM = 5e-3

/** Path stroke width in CSS pixels. */
export const BULK_PATH_STROKE_PX = 2.5
export const BULK_PATH_STROKE_MIN_PX = 1.25
export const BULK_PATH_STROKE_MAX_PX = 3.5

/** Centroid / point radius clamps in CSS pixels. */
export const BULK_POINT_RADIUS_MIN_PX = 1
export const BULK_POINT_RADIUS_MAX_PX = 3.5

/** Ellipse tessellation segment count. */
export const BULK_ELLIPSE_SEGMENTS = 64

/** Spatial tile size in OL map world units (finest-level pixels). */
export const BULK_SPATIAL_TILE_SIZE = 4096

/** Default alpha for path/point layers (0–255). */
export const BULK_DEFAULT_ALPHA = 220

/** Default fallback color (green). */
export const BULK_DEFAULT_COLOR = [0, 255, 0]

/** Whether closed graphic types are filled by default. */
export const BULK_DEFAULT_FILLED = false

/** Default fill opacity (0–1) when a closed graphic type is filled. */
export const BULK_DEFAULT_FILL_OPACITY = 0.35

/**
 * Below this count, fill is triangulated in one synchronous pass — cheap
 * enough that batching would just add overhead for no benefit.
 */
export const BULK_FILL_INSTANT_MAX = 1500

/**
 * Above `BULK_FILL_INSTANT_MAX`, fill is built this many annotations at a
 * time (see `BulkAnnotationManager#_buildFillLayersProgressively`), each
 * batch on its own animation frame. Unlike the stroke PathLayer,
 * SolidPolygonLayer triangulates every polygon on the CPU main thread when
 * a layer is built — synchronous, with no LOD fallback of its own — so an
 * unbatched fill of a dense tile (nuclei segmentation clears this easily)
 * can visibly hang the tab. Batching keeps each frame's triangulation work
 * bounded instead of skipping fill outright for large groups.
 */
export const BULK_FILL_BATCH_SIZE = 500

/** Graphic types rendered as closed paths. */
export const CLOSED_GRAPHIC_TYPES = new Set(['POLYGON', 'RECTANGLE', 'ELLIPSE'])

/** Graphic types that participate in path LOD. */
export const PATH_LOD_GRAPHIC_TYPES = new Set(['POLYGON', 'POLYLINE'])
