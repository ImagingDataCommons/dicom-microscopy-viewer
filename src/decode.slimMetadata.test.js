const { _slimMetadataForWorker } = require('./decode.js')

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
})
