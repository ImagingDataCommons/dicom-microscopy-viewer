const testCase1 = require('../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json')

const dmv = require('./dicom-microscopy-viewer.js')
const {
  _buildPerFrameImagePyramid,
  _computeImagePyramid,
  _computeSegmentBoundingBox,
  _findClosestResolutionIndex,
  _fitImagePyramid,
  _isSparseTileMissing,
  _overviewStampExtent,
  _paletteBandToDataUrl,
  _paletteIndex,
  PER_FRAME_OVERVIEW_HANDOFF_PX,
  PER_FRAME_OVERVIEW_HANDOFF_RATIO,
  PER_FRAME_OVERVIEW_MIN_PX,
} = require('./pyramid.js')

describe('_computeImagePyramid', () => {
  /*
   * TCGA-LUAD contains one THUMBNAIL level (803 columns) plus three VOLUME
   * levels. The thumbnail is not an exact fraction of the base level: its zoom
   * factor is ~57.70. Rounding it to 58 (the previous behaviour) misaligns the
   * level by ~0.5% and causes annotations to appear misplaced while zooming.
   * See https://github.com/ImagingDataCommons/slim/issues/318
   */
  const buildMetadata = () =>
    testCase1.images.map(
      (metadata) => new dmv.metadata.VLWholeSlideMicroscopyImage({ metadata }),
    )

  it('keeps all pyramid levels including the THUMBNAIL', () => {
    const pyramid = _computeImagePyramid({ metadata: buildMetadata() })
    expect(pyramid.resolutions).toHaveLength(4)
    expect(pyramid.metadata).toHaveLength(4)
  })

  it('computes exact, non-rounded resolutions for every level', () => {
    const pyramid = _computeImagePyramid({ metadata: buildMetadata() })
    const baseMetadata = pyramid.metadata[pyramid.metadata.length - 1]
    const baseColumns = baseMetadata.TotalPixelMatrixColumns

    pyramid.metadata.forEach((image, index) => {
      const expectedResolution = baseColumns / image.TotalPixelMatrixColumns
      expect(pyramid.resolutions[index]).toBeCloseTo(expectedResolution, 6)
    })
  })

  it('does not round the THUMBNAIL zoom factor (regression for slim#318)', () => {
    const pyramid = _computeImagePyramid({ metadata: buildMetadata() })
    // The coarsest level (largest resolution) corresponds to the THUMBNAIL.
    const coarsestResolution = pyramid.resolutions[0]
    expect(coarsestResolution).toBeGreaterThan(57.7)
    expect(coarsestResolution).toBeLessThan(57.71)
    expect(Number.isInteger(coarsestResolution)).toBe(false)
  })

  it('produces unique, strictly descending resolutions (OpenLayers requirement)', () => {
    const pyramid = _computeImagePyramid({ metadata: buildMetadata() })
    for (let i = 1; i < pyramid.resolutions.length; i++) {
      expect(pyramid.resolutions[i]).toBeLessThan(pyramid.resolutions[i - 1])
    }
  })
})

describe('_buildPerFrameImagePyramid', () => {
  it('builds a single-level pyramid matching the frame extent', () => {
    const placement = {
      frameNumber: 1,
      extent: [10, -100, 50, -20],
      origin: [10, -20],
      tileSize: [280, 280],
    }
    const { pyramid, nativeSize } = _buildPerFrameImagePyramid({
      placement,
      fitResolution: 1.1904,
      segmentation: { SOPInstanceUID: '1.2.3' },
      channelId: 1,
    })
    expect(pyramid.resolutions).toEqual([1.1904])
    expect(nativeSize).toEqual([280, 280])
    expect(pyramid.extent).toEqual(placement.extent)
    expect(pyramid.frameMappings[0]['1-1-1']).toBe('1.2.3/frames/1')
  })
})

describe('_paletteIndex', () => {
  it('keeps binary background transparent when window width is 1', () => {
    /** createWindow(0, 1) — the live BINARY SEG window. */
    expect(_paletteIndex(0, 0.5, 1, 1)).toBe(0)
    expect(_paletteIndex(1, 0.5, 1, 1)).toBe(1)
  })

  it('clamps fractional VOI samples into the colormap', () => {
    expect(_paletteIndex(0, 0.5, 2, 1)).toBe(1)
    expect(_paletteIndex(1, 0.5, 2, 1)).toBe(1)
  })
})

describe('_overviewStampExtent', () => {
  /** ~280×280 patch at fitResolution 1.19 → map extent width/height ≈ 333 */
  const frame = [7000, -45333, 7333, -45000]
  const nativeSize = [280, 280]

  it('grows a sub-pixel frame to the minimum stamp around its center', () => {
    const resolution = 390
    const stamp = _overviewStampExtent(frame, resolution, nativeSize)
    const side = PER_FRAME_OVERVIEW_MIN_PX * resolution
    expect(stamp[2] - stamp[0]).toBeCloseTo(side)
    expect(stamp[3] - stamp[1]).toBeCloseTo(side)
    expect((stamp[0] + stamp[2]) / 2).toBeCloseTo((frame[0] + frame[2]) / 2)
    expect((stamp[1] + stamp[3]) / 2).toBeCloseTo((frame[1] + frame[3]) / 2)
  })

  it('keeps the frame extent through mid-zoom where the mask is still empty', () => {
    /**
     * At ~128 CSS px (old handoff) nearest-neighbor nuclei vanish. Native-aware
     * handoff (~0.9×280) must still show a stamp here.
     */
    expect(_overviewStampExtent(frame, 2.6, nativeSize)).toEqual(frame)
    expect(PER_FRAME_OVERVIEW_HANDOFF_RATIO).toBeGreaterThan(0.5)
  })

  it('drops the stamp once the frame is near native on-screen size', () => {
    expect(_overviewStampExtent(frame, 1.19, nativeSize)).toBeNull()
  })

  it('falls back to the fixed handoff when native size is unknown', () => {
    const atFallback = 333 / PER_FRAME_OVERVIEW_HANDOFF_PX
    expect(_overviewStampExtent(frame, atFallback * 0.99)).toBeNull()
    expect(_overviewStampExtent(frame, atFallback * 1.1)).toEqual(frame)
  })

  it('returns null for an invalid resolution', () => {
    expect(_overviewStampExtent(frame, 0, nativeSize)).toBeNull()
  })
})

describe('_paletteBandToDataUrl', () => {
  it('maps nonzero labels to an opaque PNG data URL', () => {
    const data = new Float32Array([0, 1, 0, 1])
    const url = _paletteBandToDataUrl(
      data,
      2,
      2,
      [
        [0, 0, 0, 0],
        [255, 0, 0, 1],
      ],
      0.5,
      2,
    )
    expect(url.startsWith('data:image/png')).toBe(true)
  })
})

describe('_computeSegmentBoundingBox', () => {
  const level = (size, tile = 10) => ({
    TotalPixelMatrixColumns: size,
    TotalPixelMatrixRows: size,
    Columns: tile,
    Rows: tile,
  })

  it('bounds the tiles of the requested segment only', () => {
    const pyramid = {
      metadata: [level(100)],
      frameMappings: [{ '2-3-1': 'a', '4-5-1': 'b', '9-9-2': 'c' }],
    }
    expect(_computeSegmentBoundingBox(pyramid, 1)).toEqual([20, -41, 50, -11])
  })

  it('applies scale factor and origin offset', () => {
    const pyramid = {
      metadata: [level(100)],
      frameMappings: [{ '1-1-1': 'a' }],
    }
    expect(_computeSegmentBoundingBox(pyramid, 1, 2, [5, 7])).toEqual([
      5, -28, 25, -8,
    ])
  })

  it('uses the finest level of a multi-level pyramid', () => {
    const pyramid = {
      metadata: [level(50), level(100)],
      frameMappings: [{ '1-1-1': 'a' }, { '2-2-1': 'b' }],
    }
    expect(_computeSegmentBoundingBox(pyramid, 1)).toEqual([10, -21, 20, -11])
  })

  it('scales a coarser level when the finest level lacks the segment', () => {
    const pyramid = {
      metadata: [level(50), level(100)],
      frameMappings: [{ '1-1-1': 'a' }, { '2-2-2': 'b' }],
    }
    expect(_computeSegmentBoundingBox(pyramid, 1)).toEqual([0, -21, 20, -1])
  })

  it('returns null when no level has frames for the segment', () => {
    const pyramid = {
      metadata: [level(100)],
      frameMappings: [{ '1-1-2': 'a' }],
    }
    expect(_computeSegmentBoundingBox(pyramid, 1)).toBeNull()
  })
})

describe('_findClosestResolutionIndex', () => {
  /**
   * Used by `_fitImagePyramid` when a SEG/PM has no matching base levels
   * (e.g. TILED_SPARSE at spacing ~1.19× base). Click-to-zoom must target the
   * closest base zoom, not the full 0..n-1 range (slim#371).
   */
  const resolutions = [64, 32, 16, 8, 4, 2, 1]

  it('returns the index of an exact match', () => {
    expect(_findClosestResolutionIndex(resolutions, 8)).toBe(3)
    expect(_findClosestResolutionIndex(resolutions, 1)).toBe(6)
  })

  it('maps a non-matching fitted resolution to the closest base zoom', () => {
    expect(_findClosestResolutionIndex(resolutions, 1.19)).toBe(6)
    expect(_findClosestResolutionIndex(resolutions, 3.1)).toBe(4)
  })

  it('returns 0 for an empty resolutions array', () => {
    expect(_findClosestResolutionIndex([], 1.19)).toBe(0)
  })
})

describe('_isSparseTileMissing', () => {
  /** Frame mapping keys are `row-column-channel` (1-based) */
  const pyramid = {
    dimensionOrganizationTypes: ['TILED_SPARSE'],
    frameMappings: [{ '3-5-1': 'seg/frames/1' }],
  }

  it('keeps tiles that have a frame (OL x = column, y = row)', () => {
    expect(_isSparseTileMissing(pyramid, 1, 0, 4, 2)).toBe(false)
  })

  it('flags grid cells without a frame', () => {
    expect(_isSparseTileMissing(pyramid, 1, 0, 2, 4)).toBe(true)
    expect(_isSparseTileMissing(pyramid, 2, 0, 4, 2)).toBe(true)
  })

  it('never skips tiles of non-sparse levels', () => {
    const full = { ...pyramid, dimensionOrganizationTypes: ['TILED_FULL'] }
    expect(_isSparseTileMissing(full, 1, 0, 2, 4)).toBe(false)
  })

  it('never skips tiles when the organization type is unknown', () => {
    const unknown = { frameMappings: pyramid.frameMappings }
    expect(_isSparseTileMissing(unknown, 1, 0, 2, 4)).toBe(false)
  })

  it('keeps LABELMAP frames, which are mapped under every segment number', () => {
    const labelmap = {
      dimensionOrganizationTypes: ['TILED_SPARSE'],
      frameMappings: [{ '1-1-1': 'seg/frames/1', '1-1-2': 'seg/frames/1' }],
    }
    expect(_isSparseTileMissing(labelmap, 2, 0, 0, 0)).toBe(false)
  })
})

describe('_fitImagePyramid zoom indices', () => {
  /**
   * Regression: matching pyramids must keep exact-equality min/max zoom
   * (standard TILED_FULL SEG/PM). Non-matching must map to closest base
   * indices instead of defaulting to 0..n-1 (slim#371).
   *
   * Uses lightweight pyramid stubs — full DICOM JSON fixtures are covered
   * by viewer integration tests.
   */
  const stubLevel = ({ spacing, resolution, sop = '1.2.3' }) => ({
    origins: [[0, -1]],
    resolutions: [resolution],
    gridSizes: [[4, 4]],
    tileSizes: [[256, 256]],
    pixelSpacings: [spacing],
    extent: [0, -1025, 1024, -1],
    frameMappings: [{}],
    metadata: [
      {
        SOPInstanceUID: sop,
        Rows: 256,
        Columns: 256,
        TotalPixelMatrixRows: 1024,
        TotalPixelMatrixColumns: 1024,
        TotalPixelMatrixOriginSequence: [
          {
            XOffsetInSlideCoordinateSystem: 0,
            YOffsetInSlideCoordinateSystem: 0,
          },
        ],
        ImageOrientationSlide: [0, -1, 0, -1, 0, 0],
        SharedFunctionalGroupsSequence: [
          {
            PixelMeasuresSequence: [
              {
                PixelSpacing: spacing,
              },
            ],
          },
        ],
        PerFrameFunctionalGroupsSequence: [],
      },
    ],
  })

  it('keeps exact matching min/max zoom for shared pyramid levels', () => {
    const refPyramid = {
      extent: [0, -2049, 2048, -1],
      origins: [
        [0, -1],
        [0, -1],
      ],
      resolutions: [2, 1],
      gridSizes: [
        [4, 4],
        [8, 8],
      ],
      tileSizes: [
        [256, 256],
        [256, 256],
      ],
      pixelSpacings: [
        [0.001, 0.001],
        [0.0005, 0.0005],
      ],
      frameMappings: [{}, {}],
      metadata: [
        {
          SOPInstanceUID: 'base.1',
          Rows: 256,
          Columns: 256,
          TotalPixelMatrixRows: 1024,
          TotalPixelMatrixColumns: 1024,
          TotalPixelMatrixOriginSequence: [
            {
              XOffsetInSlideCoordinateSystem: 0,
              YOffsetInSlideCoordinateSystem: 0,
            },
          ],
          ImageOrientationSlide: [0, -1, 0, -1, 0, 0],
        },
        {
          SOPInstanceUID: 'base.2',
          Rows: 256,
          Columns: 256,
          TotalPixelMatrixRows: 2048,
          TotalPixelMatrixColumns: 2048,
          TotalPixelMatrixOriginSequence: [
            {
              XOffsetInSlideCoordinateSystem: 0,
              YOffsetInSlideCoordinateSystem: 0,
            },
          ],
          ImageOrientationSlide: [0, -1, 0, -1, 0, 0],
        },
      ],
    }
    const segPyramid = stubLevel({
      spacing: [0.0005, 0.0005],
      resolution: 1,
      sop: 'seg.1',
    })
    /** Align SEG origin/spacing with finest base level so matching succeeds */
    segPyramid.origins = [[0, -1]]
    segPyramid.metadata[0].TotalPixelMatrixRows = 2048
    segPyramid.metadata[0].TotalPixelMatrixColumns = 2048

    const [, minZoom, maxZoom, hasMatchingLevels] = _fitImagePyramid(
      segPyramid,
      refPyramid,
    )

    expect(hasMatchingLevels).toBe(true)
    expect(minZoom).toBe(1)
    expect(maxZoom).toBe(1)
  })

  it('maps non-matching fitted resolution to closest base zoom', () => {
    const refPyramid = {
      extent: [0, -2049, 2048, -1],
      origins: [
        [0, -1],
        [0, -1],
      ],
      resolutions: [2, 1],
      gridSizes: [
        [4, 4],
        [8, 8],
      ],
      tileSizes: [
        [256, 256],
        [256, 256],
      ],
      pixelSpacings: [
        [0.001, 0.001],
        [0.0005, 0.0005],
      ],
      frameMappings: [{}, {}],
      metadata: [
        {
          SOPInstanceUID: 'base.a',
          Rows: 256,
          Columns: 256,
          TotalPixelMatrixRows: 1024,
          TotalPixelMatrixColumns: 1024,
          TotalPixelMatrixOriginSequence: [
            {
              XOffsetInSlideCoordinateSystem: 0,
              YOffsetInSlideCoordinateSystem: 0,
            },
          ],
          ImageOrientationSlide: [0, -1, 0, -1, 0, 0],
          SharedFunctionalGroupsSequence: [
            {
              PixelMeasuresSequence: [{ PixelSpacing: [0.001, 0.001] }],
            },
          ],
        },
        {
          SOPInstanceUID: 'base.b',
          Rows: 256,
          Columns: 256,
          TotalPixelMatrixRows: 2048,
          TotalPixelMatrixColumns: 2048,
          TotalPixelMatrixOriginSequence: [
            {
              XOffsetInSlideCoordinateSystem: 0,
              YOffsetInSlideCoordinateSystem: 0,
            },
          ],
          ImageOrientationSlide: [0, -1, 0, -1, 0, 0],
          SharedFunctionalGroupsSequence: [
            {
              PixelMeasuresSequence: [{ PixelSpacing: [0.0005, 0.0005] }],
            },
          ],
        },
      ],
    }
    /** Spacing ~1.2× finest base → no exact match */
    const segPyramid = stubLevel({
      spacing: [0.0006, 0.0006],
      resolution: 1.2,
      sop: 'seg.sparse',
    })

    const [, minZoom, maxZoom, hasMatchingLevels] = _fitImagePyramid(
      segPyramid,
      refPyramid,
    )

    expect(hasMatchingLevels).toBe(false)
    expect(minZoom).toBe(maxZoom)
    expect(minZoom).toBe(
      _findClosestResolutionIndex(refPyramid.resolutions, 0.0006 / 0.0005),
    )
    /** Must not fall back to the full base range 0..n-1 */
    expect(minZoom).not.toBe(0)
  })
})
