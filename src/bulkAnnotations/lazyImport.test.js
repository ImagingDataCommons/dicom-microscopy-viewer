import { getMicroscopyHref } from '../webWorker/webWorkerManager.js'
import { importLazyChunk } from './lazyImport.js'

function chunkLoadError() {
  const error = new Error('Loading chunk 1 failed.')
  error.name = 'ChunkLoadError'
  return error
}

describe('importLazyChunk', () => {
  afterEach(() => {
    delete globalThis.__webpack_public_path__
    jest.restoreAllMocks()
  })

  it('returns the module when it loads', async () => {
    const module = { value: 1 }
    await expect(importLazyChunk(() => Promise.resolve(module))).resolves.toBe(
      module,
    )
  })

  it('rethrows errors other than a failed chunk load', async () => {
    globalThis.__webpack_public_path__ = 'http://localhost/src/'
    const error = new Error('boom')
    const load = jest.fn(() => Promise.reject(error))
    await expect(importLazyChunk(load)).rejects.toBe(error)
    expect(load).toHaveBeenCalledTimes(1)
    expect(globalThis.__webpack_public_path__).toBe('http://localhost/src/')
  })

  it('rethrows a failed chunk load outside a webpack build', async () => {
    const error = chunkLoadError()
    const load = jest.fn(() => Promise.reject(error))
    await expect(importLazyChunk(load)).rejects.toBe(error)
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('loads a failed chunk again from the library path', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    globalThis.__webpack_public_path__ = 'http://localhost/src/'
    const module = { value: 2 }
    const load = jest
      .fn()
      .mockImplementationOnce(() => Promise.reject(chunkLoadError()))
      .mockImplementationOnce(() => Promise.resolve(module))
    await expect(importLazyChunk(load)).resolves.toBe(module)
    expect(load).toHaveBeenCalledTimes(2)
    expect(globalThis.__webpack_public_path__).toBe(getMicroscopyHref())
  })

  it('does not retry when the library path was already in use', async () => {
    globalThis.__webpack_public_path__ = getMicroscopyHref()
    const error = chunkLoadError()
    const load = jest.fn(() => Promise.reject(error))
    await expect(importLazyChunk(load)).rejects.toBe(error)
    expect(load).toHaveBeenCalledTimes(1)
  })
})
