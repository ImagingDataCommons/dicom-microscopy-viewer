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

function createVolumeViewer(options = {}) {
  return new dmv.viewer.VolumeImageViewer({
    client: {},
    metadata: [
      new dmv.metadata.VLWholeSlideMicroscopyImage({
        metadata: testCase1.images[0],
      }),
    ],
    ...options,
  })
}

describe('isICCProfilesEnabled', () => {
  beforeEach(() => {
    jest.spyOn(console, 'debug').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('starts enabled', () => {
    expect(createVolumeViewer().isICCProfilesEnabled()).toBe(true)
  })

  it('changes once the tile loaders were swapped', async () => {
    const viewer = createVolumeViewer()
    let swap
    jest.spyOn(viewer, 'configureDataLoaders').mockImplementation(
      () =>
        new Promise((resolve) => {
          swap = resolve
        }),
    )

    const toggle = viewer.toggleICCProfiles()
    expect(viewer.configureDataLoaders).toHaveBeenCalledWith(false)
    expect(viewer.isICCProfilesEnabled()).toBe(true)

    swap()
    await toggle
    expect(viewer.isICCProfilesEnabled()).toBe(false)

    viewer.configureDataLoaders.mockResolvedValue(undefined)
    await viewer.toggleICCProfiles()
    expect(viewer.configureDataLoaders).toHaveBeenLastCalledWith(true)
    expect(viewer.isICCProfilesEnabled()).toBe(true)
  })

  it('keeps its value when a toggle fails', async () => {
    const errorInterceptor = jest.fn()
    const viewer = createVolumeViewer({ errorInterceptor })
    jest
      .spyOn(viewer, 'configureDataLoaders')
      .mockRejectedValue(new Error('decoder failed'))

    await expect(viewer.toggleICCProfiles()).resolves.toBeUndefined()
    expect(viewer.isICCProfilesEnabled()).toBe(true)
    expect(errorInterceptor).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Failed to toggle ICC profiles' }),
    )
  })

  it('agrees with the loaders when two toggles overlap', async () => {
    const viewer = createVolumeViewer()
    jest.spyOn(viewer, 'configureDataLoaders').mockResolvedValue(undefined)

    await Promise.all([viewer.toggleICCProfiles(), viewer.toggleICCProfiles()])

    expect(viewer.configureDataLoaders).toHaveBeenNthCalledWith(1, false)
    expect(viewer.configureDataLoaders).toHaveBeenNthCalledWith(2, false)
    expect(viewer.isICCProfilesEnabled()).toBe(false)
  })
})
