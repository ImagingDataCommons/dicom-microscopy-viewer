const colorCase = require('../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json')

jest.mock('./decode.js', () => ({
  _decodeAndTransformFrame: jest.fn(async ({ columns, rows }) => {
    return new Uint8Array(columns * rows * 3)
  }),
}))
jest.mock('./webWorker/webWorkerManager.js', () => ({
  __esModule: true,
  default: { retain: jest.fn(), release: jest.fn() },
}))
jest.mock('./pyramid.js', () => ({
  ...jest.requireActual('./pyramid.js'),
  _getIccProfiles: jest.fn(() => Promise.reject(new Error('broken metadata'))),
}))

const { _decodeAndTransformFrame } = require('./decode.js')
const dmv = require('./dicom-microscopy-viewer.js')

describe('VolumeImageReader ICC profiles', () => {
  it('decodes without ICC profiles when fetching them fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const client = {
      wadoURL: 'https://dicomweb.example',
      retrieveInstanceFrames: jest.fn(() =>
        Promise.resolve([new ArrayBuffer(8)]),
      ),
    }
    const reader = new dmv.pyramid.VolumeImageReader({
      client,
      metadata: colorCase.images.map(
        (metadata) => new dmv.metadata.VLWholeSlideMicroscopyImage({ metadata }),
      ),
      iccProfilesEnabled: true,
    })
    const request = {
      opticalPathIdentifier: reader.opticalPaths[0].identifier,
      level: 0,
      column: 0,
      row: 0,
    }

    /** The failure is not cached as a rejection: every tile still loads */
    for (let i = 0; i < 2; i++) {
      const tile = await reader.getTile(request)
      expect(tile.isEmpty).toBe(false)
    }
    expect(client.retrieveInstanceFrames).toHaveBeenCalledTimes(2)
    expect(_decodeAndTransformFrame.mock.calls[0][0].iccProfiles).toBe(
      undefined,
    )
    reader.destroy()
  })
})
