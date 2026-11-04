/**
 * Type declarations of dicom-microscopy-viewer.
 *
 * The APIs for other renderers (`pyramid`, `viv`), the view API of
 * `viewer.VolumeImageViewer`, `events` and `errors` are typed exactly. The
 * other namespaces are declared with loose types so that every export can be
 * used from TypeScript; they will get exact types over time.
 */

/** Minimal interface of the dicomweb-client `DICOMwebClient` used by readers */
export interface DicomWebClient {
  retrieveSeriesMetadata(options: {
    studyInstanceUID: string
    seriesInstanceUID: string
    request?: object
  }): Promise<object[]>
  retrieveInstanceFrames(options: object): Promise<ArrayBuffer[]>
  [key: string]: any
}

/** Typed array of decoded pixel data */
export type PixelArray =
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Float32Array
  | Float64Array

/** Configure logging once at application startup. */
export function setLogLevel(
  levelOrOptions:
    | 'DEBUG'
    | 'LOG'
    | 'WARN'
    | 'ERROR'
    | 'NONE'
    | {
        level?: 'DEBUG' | 'LOG' | 'WARN' | 'ERROR' | 'NONE'
        enableInProduction?: boolean
        enableInDevelopment?: boolean
      },
): void

export namespace errors {
  /** Broad category of a CustomError */
  const errorTypes: {
    readonly VISUALIZATION: 'Visualization'
    readonly ENCODINGANDDECODING: 'EncodingDecoding'
  }
  type ErrorType = (typeof errorTypes)[keyof typeof errorTypes]

  /**
   * Stable codes of errors about images. New codes may be added; existing
   * codes keep their meaning.
   */
  const errorCodes: {
    readonly NO_IMAGES: 'NO_IMAGES'
    readonly UNSUPPORTED_OPTICAL_PATHS: 'UNSUPPORTED_OPTICAL_PATHS'
    readonly INCONSISTENT_PYRAMIDS: 'INCONSISTENT_PYRAMIDS'
    readonly UNSUPPORTED_PIXEL_DATA: 'UNSUPPORTED_PIXEL_DATA'
    readonly UNSUPPORTED_TILE_SIZE: 'UNSUPPORTED_TILE_SIZE'
  }
  type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes]

  /**
   * Error about the images. Invalid arguments throw a TypeError or
   * RangeError instead, and cancelled operations reject with the abort
   * reason (a DOMException named "AbortError" by default).
   */
  class CustomError extends Error {
    constructor(type: ErrorType, message: string, code?: ErrorCode)
    readonly type: ErrorType
    /** Set where a stable code is available */
    readonly code?: ErrorCode
  }
}

export namespace opticalPath {
  class OpticalPath {
    constructor(options: object)
    readonly identifier: string
    readonly description: string | undefined
    readonly illuminationType: object
    readonly illuminationColor: object | undefined
    readonly illuminationWaveLength: number | undefined
    readonly studyInstanceUID: string
    readonly seriesInstanceUID: string
    readonly sopInstanceUIDs: string[]
    readonly paletteColorLookupTableUID: string | undefined
    readonly isMonochromatic: boolean
    readonly isColorable: boolean
  }
}

export namespace metadata {
  /** Metadata of a VL Whole Slide Microscopy Image instance */
  class VLWholeSlideMicroscopyImage {
    constructor(options: { metadata: object })
    readonly SOPInstanceUID: string
    readonly StudyInstanceUID: string
    readonly SeriesInstanceUID: string
    readonly ImageType: string[]
    readonly TotalPixelMatrixColumns: number
    readonly TotalPixelMatrixRows: number
    readonly Columns: number
    readonly Rows: number
    readonly SamplesPerPixel: number
    readonly BitsAllocated: number
    readonly PhotometricInterpretation: string
    [attribute: string]: any
  }
  class Comprehensive3DSR {
    constructor(options: { metadata: object })
    [attribute: string]: any
  }
  class MicroscopyBulkSimpleAnnotations {
    constructor(options: { metadata: object })
    [attribute: string]: any
  }
  class ParametricMap {
    constructor(options: { metadata: object })
    [attribute: string]: any
  }
  class Segmentation {
    constructor(options: { metadata: object })
    [attribute: string]: any
  }
  function formatMetadata(metadata: object): object
  function groupMonochromeInstances(
    metadata: VLWholeSlideMicroscopyImage[],
  ): Record<string, VLWholeSlideMicroscopyImage[]>
  function groupColorInstances(
    metadata: VLWholeSlideMicroscopyImage[],
  ): Record<string, VLWholeSlideMicroscopyImage[]>
}

export namespace pyramid {
  /** Level of an image pyramid; level 0 has the highest resolution */
  interface Level {
    /** Position in `VolumeImageReader#levels` */
    readonly index: number
    readonly totalPixelMatrixColumns: number
    readonly totalPixelMatrixRows: number
    readonly tileColumns: number
    readonly tileRows: number
    readonly gridColumns: number
    readonly gridRows: number
    /** Row and column spacing in millimeter */
    readonly pixelSpacing: readonly [number, number]
    /** Relative to level 0, which has 1; not necessarily a power of 2 */
    readonly downsampleFactor: number
    readonly imageFlavor: 'VOLUME' | 'THUMBNAIL'
  }

  type ArrayType =
    | 'Uint8Array'
    | 'Int8Array'
    | 'Uint16Array'
    | 'Int16Array'
    | 'Float32Array'
    | 'Float64Array'

  interface PixelInfo {
    readonly samplesPerPixel: number
    readonly bitsAllocated: number
    readonly pixelRepresentation: number
    /** Of the decoded pixels: "RGB" for color images */
    readonly photometricInterpretation: string
    /** Of the stored images, e.g. "YBR_FULL_422" */
    readonly storedPhotometricInterpretation: string
    /** Name of the TypedArray constructor of `Tile#pixelArray` */
    readonly arrayType: ArrayType
  }

  interface Tile {
    /** Stored pixel values, row by row, samples of a pixel interleaved */
    pixelArray: PixelArray
    columns: number
    rows: number
    samplesPerPixel: number
    /** Columns and rows that hold image data (edge tiles are padded) */
    validColumns: number
    validRows: number
    /** The frame is absent from a TILED_SPARSE image */
    isEmpty: boolean
  }

  interface VolumeImageReaderOptions {
    client: DicomWebClient
    /** VOLUME and THUMBNAIL images of one series */
    metadata: Array<metadata.VLWholeSlideMicroscopyImage | object>
    /** Default: true, as in the viewer */
    iccProfilesEnabled?: boolean
    /** Default: "srgb" */
    iccOutputType?: 'srgb' | 'display-p3'
    /** Default: false */
    skipThumbnails?: boolean
  }

  interface FromSeriesOptions
    extends Omit<VolumeImageReaderOptions, 'metadata'> {
    studyInstanceUID: string
    seriesInstanceUID: string
    /** Cancels the metadata request */
    signal?: AbortSignal
  }

  interface GetTileOptions {
    opticalPathIdentifier: string
    /** Index into `VolumeImageReader#levels` (0 is the highest resolution) */
    level: number
    column: number
    row: number
    /** Cancels the request and the decoding */
    signal?: AbortSignal
    /** Remove the padding of edge tiles. Default: false */
    crop?: boolean
  }

  /**
   * Reader for the tiles of VL Whole Slide Microscopy VOLUME images, without
   * rendering. Call `destroy()` when done.
   */
  class VolumeImageReader {
    constructor(options: VolumeImageReaderOptions)
    static fromSeries(options: FromSeriesOptions): Promise<VolumeImageReader>
    /** The position of an optical path is a stable channel index */
    readonly opticalPaths: readonly opticalPath.OpticalPath[]
    /** From highest to lowest resolution */
    readonly levels: readonly Level[]
    /** Level 0 pixel (column, row) to slide coordinates (millimeter) */
    readonly affine: readonly (readonly number[])[]
    readonly affineInverse: readonly (readonly number[])[]
    readonly frameOfReferenceUID: string
    getPixelInfo(opticalPathIdentifier: string): PixelInfo
    /** One image per level, in the order of `levels` */
    getOpticalPathMetadata(
      opticalPathIdentifier: string,
    ): metadata.VLWholeSlideMicroscopyImage[]
    getTile(options: GetTileOptions): Promise<Tile>
    /** Cancel tiles in flight and release the decoding web workers */
    destroy(): void
  }
}

export namespace viv {
  type Dtype = 'Uint8' | 'Int8' | 'Uint16' | 'Int16' | 'Float32' | 'Float64'

  interface PixelData {
    data: PixelArray
    width: number
    height: number
  }

  interface TileRequest {
    x: number
    y: number
    selection: { c?: number; [dimension: string]: number | undefined }
    signal?: AbortSignal
  }

  /** Viv's `PixelSource` interface */
  interface PixelSource {
    readonly shape: number[]
    readonly labels: string[]
    readonly dtype: Dtype
    readonly tileSize: number
    readonly meta: {
      physicalSizes: Record<'x' | 'y', { size: number; unit: string }>
      photometricInterpretation?: number
    }
    getTile(request: TileRequest): Promise<PixelData>
    /** Absent for levels of more than 16 tiles */
    getRaster?: (request: Omit<TileRequest, 'x' | 'y'>) => Promise<PixelData>
    onTileError(error: unknown): void
  }

  interface CreatePixelSourcesOptions {
    reader: pyramid.VolumeImageReader
    /** Default: 2 */
    maxSyntheticLevels?: number
    /** Bytes of decoded tiles kept in memory; 0 disables. Default: 64 MiB */
    cacheSize?: number
  }

  interface LoadDicomWebOptions
    extends Omit<CreatePixelSourcesOptions, 'reader'> {
    client: DicomWebClient
    studyInstanceUID: string
    seriesInstanceUID: string
    signal?: AbortSignal
    /** Default: true */
    iccProfilesEnabled?: boolean
    /** Default: "srgb" */
    iccOutputType?: 'srgb' | 'display-p3'
  }

  interface LoadDicomWebResult {
    /** From highest to lowest resolution, for Viv's MultiscaleImageLayer */
    data: PixelSource[]
    metadata: {
      reader: pyramid.VolumeImageReader
      /** Channel `c` is `opticalPaths[c]` */
      opticalPaths: readonly opticalPath.OpticalPath[]
    }
    /** Cancel requests, drop cached tiles and release the web workers */
    destroy(): void
  }

  /** The caller keeps owning (and destroys) the reader */
  function createPixelSources(options: CreatePixelSourcesOptions): PixelSource[]
  function loadDicomWeb(options: LoadDicomWebOptions): Promise<LoadDicomWebResult>
}

export namespace events {
  const EVENTS: {
    readonly ROI_ADDED: 'dicommicroscopyviewer_roi_added'
    readonly ROI_REMOVED: 'dicommicroscopyviewer_roi_removed'
    readonly ROI_DRAWN: 'dicommicroscopyviewer_roi_drawn'
    readonly ROI_SELECTED: 'dicommicroscopyviewer_roi_selected'
    readonly VIEWPORT_CLICKED: 'dicommicroscopyviewer_viewport_clicked'
    readonly ROI_DOUBLE_CLICKED: 'dicommicroscopyviewer_roi_double_clicked'
    readonly POINTER_MOVE: 'dicommicroscopyviewer_pointer_move'
    readonly ROI_MODIFIED: 'dicommicroscopyviewer_roi_modified'
    readonly MOVE_STARTED: 'dicommicroscopyviewer_move_started'
    readonly MOVE_ENDED: 'dicommicroscopyviewer_move_ended'
    readonly VIEW_CHANGED: 'dicommicroscopyviewer_view_changed'
    readonly LOADING_STARTED: 'dicommicroscopyviewer_loading_started'
    readonly LOADING_ENDED: 'dicommicroscopyviewer_loading_ended'
    readonly LOADING_ERROR: 'dicommicroscopyviewer_loading_error'
    readonly FRAME_LOADING_STARTED: 'dicommicroscopyviewer_frame_loading_started'
    readonly FRAME_LOADING_ENDED: 'dicommicroscopyviewer_frame_loading_ended'
    readonly FRAME_LOADING_ERROR: 'dicommicroscopyviewer_frame_loading_error'
    readonly SEGMENT_VISIBILITY_CHANGED: 'dicommicroscopyviewer_segment_visibility_changed'
    readonly PARAMETER_MAPPING_VISIBILITY_CHANGED: 'dicommicroscopyviewer_parameter_mapping_visibility_changed'
  }

  /** `event.detail` of the events, which are DOM CustomEvents */
  interface EventDetail<Payload> {
    payload: Payload
    time: Date
  }

  interface ViewChangedPayload {
    viewState: viewer.ViewState
  }

  interface MovePayload {
    viewState: viewer.ViewState
    /** @deprecated The OpenLayers event */
    event: unknown
  }

  interface PointerMovePayload {
    features: unknown[]
    clientX: number | undefined
    clientY: number | undefined
    /** Slide coordinates (x, y) in millimeter */
    coordinates: [number, number] | undefined
    /** @deprecated The OpenLayers event */
    event: unknown
  }
}

export namespace viewer {
  /**
   * State of the view in physical units, so that it means the same for every
   * slide and renderer.
   */
  interface ViewState {
    /** Slide coordinates (x, y) in millimeter at the center of the viewport */
    center: [number, number] | undefined
    /** Size of a screen pixel in millimeter */
    resolution: number | undefined
    /**
     * Clockwise rotation of the image on screen in radians, relative to the
     * default orientation of the slide, in the range (-π, π]
     */
    rotation: number
  }

  interface ViewStateChange {
    center?: readonly [number, number] | readonly number[]
    resolution?: number
    rotation?: number
  }

  interface VolumeImageViewerOptions {
    client?: DicomWebClient
    clientMapping?: Record<string, DicomWebClient>
    metadata: Array<metadata.VLWholeSlideMicroscopyImage | object>
    [option: string]: any
  }

  class VolumeImageViewer {
    constructor(options: VolumeImageViewerOptions)
    render(options: { container: HTMLElement | string }): void
    cleanup(): void
    getAllOpticalPaths(): opticalPath.OpticalPath[]
    getViewState(): ViewState
    /** Properties that are not given or that equal the current ones keep their value */
    setViewState(state: ViewStateChange): void
    /** Two opposite corners (x, y) in slide coordinates (millimeter) */
    fitBounds(
      bounds: readonly [readonly number[], readonly number[]],
      options?: { padding?: [number, number, number, number] },
    ): void
    /**
     * 4 x 5 color matrix, row by row, like an SVG feColorMatrix; null or
     * undefined to remove it
     */
    setImageColorMatrix(
      matrix: readonly number[] | null | undefined,
      options?: { colorSpace?: 'srgb' | 'linear-srgb' },
    ): void
    /** @deprecated Use the view API and events instead of the OpenLayers map */
    getMap(): any
    /** Methods that are not typed exactly yet */
    [member: string]: any
  }

  class OverviewImageViewer {
    constructor(options: object)
    [member: string]: any
  }

  class LabelImageViewer {
    constructor(options: object)
    [member: string]: any
  }
}

/** Untyped namespaces; they will get exact types over time */
export namespace annotation {
  class AnnotationGroup {
    constructor(options: object)
    [member: string]: any
  }
  const fetchGraphicData: (...args: any[]) => any
  const fetchGraphicIndex: (...args: any[]) => any
  const getCommonZCoordinate: (...args: any[]) => any
  const getCoordinateDimensionality: (...args: any[]) => any
}

export namespace api {
  /** @deprecated Use viewer.VolumeImageViewer */
  const VLWholeSlideMicroscopyImageViewer: typeof viewer.VolumeImageViewer
}

export namespace bulkSimpleAnnotations {
  const getFeaturesFromBulkAnnotations: (...args: any[]) => any
  const getPointFeature: (...args: any[]) => any
  const getPolygonFeature: (...args: any[]) => any
  const getCircleFeature: (...args: any[]) => any
  const getEllipseFeature: (...args: any[]) => any
  const getRectangleFeature: (...args: any[]) => any
  const getViewportBoundingBox: (...args: any[]) => any
  const isCoordinateInsideBoundingBox: (...args: any[]) => any
}

export namespace color {
  const ColormapNames: Record<string, string>
  class PaletteColorLookupTable {
    constructor(options: object)
    [member: string]: any
  }
  const createColormap: (...args: any[]) => any
  const createDistinctColormap: (...args: any[]) => any
  const buildPaletteColorLookupTable: (...args: any[]) => any
}

export namespace mapping {
  class ParameterMapping {
    constructor(options: object)
    [member: string]: any
  }
}

export namespace roi {
  class ROI {
    constructor(options: object)
    [member: string]: any
  }
}

export namespace scoord3d {
  class Point {
    constructor(options: object)
    [member: string]: any
  }
  class Multipoint {
    constructor(options: object)
    [member: string]: any
  }
  class Polyline {
    constructor(options: object)
    [member: string]: any
  }
  class Polygon {
    constructor(options: object)
    [member: string]: any
  }
  class Ellipsoid {
    constructor(options: object)
    [member: string]: any
  }
  class Ellipse {
    constructor(options: object)
    [member: string]: any
  }
}

export namespace segment {
  class Segment {
    constructor(options: object)
    [member: string]: any
  }
}

export namespace utils {
  const applyInverseTransform: (options: {
    coordinate: readonly number[]
    affine: readonly (readonly number[])[]
  }) => number[]
  const applyTransform: (options: {
    coordinate: readonly number[]
    affine: readonly (readonly number[])[]
  }) => number[]
  const buildInverseTransform: (...args: any[]) => number[][]
  const buildTransform: (...args: any[]) => number[][]
  const computeRotation: (...args: any[]) => number
  const mapSlideCoordToPixelCoord: (...args: any[]) => number[]
  const mapPixelCoordToSlideCoord: (...args: any[]) => number[]
}
