import {
  getStreamableBulkVrInfo,
  isMonotonicGraphicIndex,
  resolveStreamableGraphicDataReference,
  validateGraphicIndex,
} from './stream.js'

describe('stream helpers', () => {
  test('getStreamableBulkVrInfo maps OF/OL only', () => {
    expect(getStreamableBulkVrInfo('OF')?.kind).toBe('float32')
    expect(getStreamableBulkVrInfo('OL')?.kind).toBe('int32')
    expect(getStreamableBulkVrInfo('OD')).toBeNull()
  })

  test('resolveStreamableGraphicDataReference infers OF when vr omitted', () => {
    const ref = resolveStreamableGraphicDataReference({
      metadataItem: {},
      bulkdataItem: {
        PointCoordinatesData: { BulkDataURI: 'https://example/bulk' },
      },
    })
    expect(ref.vr).toBe('OF')
    expect(ref.BulkDataURI).toBe('https://example/bulk')
  })

  test('validateGraphicIndex checks 1-based + monotonic + dim alignment', () => {
    const ok = validateGraphicIndex(new Int32Array([1, 5, 9]), 3, 2)
    expect(ok.ok).toBe(true)
    const bad = validateGraphicIndex(new Int32Array([0, 5]), 2, 2)
    expect(bad.ok).toBe(false)
  })

  test('isMonotonicGraphicIndex', () => {
    expect(isMonotonicGraphicIndex(new Int32Array([1, 3, 10]), 3)).toBe(true)
    expect(isMonotonicGraphicIndex(new Int32Array([1, 10, 3]), 3)).toBe(false)
  })
})
