const { _slimMetadataForWorker, _frameTransferList } = require('./decode.js')

describe('_slimMetadataForWorker', () => {
  it('keeps only fields the worker ColorTransformer needs', () => {
    const slim = _slimMetadataForWorker([
      {
        SOPInstanceUID: '1.2.3',
        Columns: 256,
        Rows: 128,
        BitsAllocated: 8,
        SamplesPerPixel: 3,
        PlanarConfiguration: 0,
        PerFrameFunctionalGroupsSequence: [{ huge: true }],
        SharedFunctionalGroupsSequence: [{ alsoHuge: true }],
      },
    ])

    expect(slim).toEqual([
      {
        SOPInstanceUID: '1.2.3',
        Columns: 256,
        Rows: 128,
        BitsAllocated: 8,
        SamplesPerPixel: 3,
        PlanarConfiguration: 0,
      },
    ])
  })

  it('passes through non-arrays unchanged', () => {
    expect(_slimMetadataForWorker(null)).toBe(null)
    expect(_slimMetadataForWorker(undefined)).toBe(undefined)
  })

  it('tolerates null metadata entries without throwing', () => {
    expect(() => _slimMetadataForWorker([null])).not.toThrow()
    expect(_slimMetadataForWorker([null])[0].SOPInstanceUID).toBeUndefined()
  })
})

describe('_frameTransferList', () => {
  it('transfers whole ArrayBuffers and views that own the buffer', () => {
    const buffer = new ArrayBuffer(8)
    expect(_frameTransferList(buffer)).toEqual([buffer])
    const view = new Uint8Array(buffer)
    expect(_frameTransferList(view)).toEqual([buffer])
  })

  it('does not transfer partial views into a larger buffer', () => {
    const buffer = new ArrayBuffer(16)
    const slice = new Uint8Array(buffer, 4, 8)
    expect(_frameTransferList(slice)).toBeUndefined()
  })
})
