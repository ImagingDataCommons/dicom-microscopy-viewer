const testCase1 = require('../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json')

const dmv = require('./dicom-microscopy-viewer.js')
const {
  _computeImagePyramid,
  _findClosestResolutionIndex,
  _fitImagePyramid,
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
