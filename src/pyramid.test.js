const testCase1 = require('../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json')

const dmv = require('./dicom-microscopy-viewer.js')
const { _computeImagePyramid } = require('./pyramid.js')

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
