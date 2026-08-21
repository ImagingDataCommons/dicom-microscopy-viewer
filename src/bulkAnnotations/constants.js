/**
 * Shared constants for the deck.gl bulk-annotation renderer.
 */

/**
 * LOD thresholds: LOD (showing centroids instead of full paths at low zoom)
 * activates when EITHER threshold is exceeded.
 *
 * - BULK_LOD_MIN_VERTICES: Primary metric. Vertex count directly correlates
 *   with GPU rendering cost (tessellation, memory, draw calls). 100k vertices
 *   is a reasonable threshold where full-detail rendering at all zoom levels
 *   starts to impact performance.
 *
 * - BULK_LOD_MIN_ANNOTATIONS: Fallback for sparse shapes (e.g., simple
 *   polylines with few vertices). Even with low vertex count, thousands of
 *   separate annotations can impact picking/interaction performance.
 *
 * The OR logic ensures:
 * - 500 complex polygons (200 vertices each = 100k total) → triggers LOD
 * - 5000 simple lines (10 vertices each = 50k total) → triggers LOD
 * - 100 large polygons (1000 vertices each = 100k total) → triggers LOD
 * - 50 simple rectangles (4 vertices each = 200 total) → NO LOD (always full detail)
 */
export const BULK_LOD_MIN_VERTICES = 100_000
export const BULK_LOD_MIN_ANNOTATIONS = 5000

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
 * time (see `BulkAnnotationManager#_buildTileFillLayersProgressively` and
 * `#_buildWholeGroupFillProgressively`), each batch on its own animation
 * frame. Unlike the stroke PathLayer,
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

/**
 * Maximum number of tiles to keep in the tile data cache per group.
 * LRU eviction kicks in when this limit is exceeded.
 */
export const BULK_TILE_CACHE_MAX_SIZE = 64

/**
 * Debounce delay (ms) for batching rapid style changes.
 * Multiple style updates within this window are coalesced into one render.
 */
export const BULK_STYLE_DEBOUNCE_MS = 16 // ~1 frame at 60fps
