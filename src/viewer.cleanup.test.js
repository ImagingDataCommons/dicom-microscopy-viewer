const testCase1 = require('../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json')
const dmv = require('./dicom-microscopy-viewer.js')

jest.mock(
  'ol/webgl/Helper',
  () => jest.fn(() => null),
  { virtual: true },
)

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }))

function createVolumeViewer() {
  return new dmv.viewer.VolumeImageViewer({
    client: {},
    metadata: [
      new dmv.metadata.VLWholeSlideMicroscopyImage({
        metadata: testCase1.images[0],
      }),
    ],
  })
}

describe('viewer cleanup lifecycle', () => {
  afterEach(() => {
    delete window.cleanup
    delete window.toggleICCProfiles
    delete window.getICCProfiles
    delete window.zoomToROI
    delete window.toggleSegmentationInterpolation
  })

  it('cleanup clears window debug hooks and can run twice', () => {
    const viewer = createVolumeViewer()
    const container = document.createElement('div')
    document.body.appendChild(container)
    viewer.render({ container })

    expect(typeof window.cleanup).toBe('function')
    expect(typeof window.toggleICCProfiles).toBe('function')

    expect(() => viewer.cleanup()).not.toThrow()
    expect(window.cleanup).toBeUndefined()
    expect(window.toggleICCProfiles).toBeUndefined()
    expect(window.getICCProfiles).toBeUndefined()
    expect(window.zoomToROI).toBeUndefined()
    expect(window.toggleSegmentationInterpolation).toBeUndefined()

    /** Second cleanup must not throw after listeners / view are gone */
    expect(() => viewer.cleanup()).not.toThrow()

    document.body.removeChild(container)
  })

  it('replacing render rebinds window hooks without leaking the old cleanup', () => {
    const viewer = createVolumeViewer()
    const container = document.createElement('div')
    document.body.appendChild(container)
    viewer.render({ container })
    const firstCleanup = window.cleanup
    viewer.render({ container })
    expect(window.cleanup).not.toBe(firstCleanup)
    expect(typeof window.cleanup).toBe('function')

    viewer.cleanup()
    expect(window.cleanup).toBeUndefined()
    document.body.removeChild(container)
  })

  it('addAnnotationGroups twice then cleanup does not throw', () => {
    const viewer = createVolumeViewer()
    const raw = testCase1.annotations?.[0]
    if (raw == null) {
      return
    }
    const metadata = new dmv.metadata.MicroscopyBulkSimpleAnnotations({
      metadata: raw,
    })
    expect(() => {
      viewer.addAnnotationGroups(metadata)
      viewer.addAnnotationGroups(metadata)
      viewer.cleanup()
      viewer.cleanup()
    }).not.toThrow()
  })
})
