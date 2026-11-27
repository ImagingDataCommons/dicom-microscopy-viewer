import {
  annotationsInExtent,
  countPathVertices,
  decimateCentroids,
  decimationStride,
  getDrawBudget,
  isSoftwareRenderer,
  padExtent,
} from './budget.js'
import {
  BULK_SOFTWARE_MAX_PATH_VERTICES,
  BULK_SOFTWARE_MAX_POINTS,
} from './constants.js'

describe('isSoftwareRenderer', () => {
  it('detects software renderers', () => {
    expect(isSoftwareRenderer({ gpu: 'software' })).toBe(true)
    expect(
      isSoftwareRenderer({
        gpu: 'unknown',
        renderer:
          'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0)), SwiftShader driver)',
      }),
    ).toBe(true)
    expect(
      isSoftwareRenderer({ renderer: 'llvmpipe (LLVM 15.0.7, 256 bits)' }),
    ).toBe(true)
  })

  it('does not treat GPUs or a missing device as software', () => {
    expect(isSoftwareRenderer(undefined)).toBe(false)
    expect(
      isSoftwareRenderer({
        gpu: 'apple',
        renderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Pro)',
      }),
    ).toBe(false)
    expect(
      isSoftwareRenderer({ gpu: 'nvidia', renderer: 'NVIDIA GeForce RTX' }),
    ).toBe(false)
  })
})

describe('getDrawBudget', () => {
  it('is unlimited on a GPU', () => {
    expect(getDrawBudget(false)).toEqual({
      maxPoints: Infinity,
      maxPathVertices: Infinity,
    })
  })

  it('caps points and path vertices in software', () => {
    expect(getDrawBudget(true)).toEqual({
      maxPoints: BULK_SOFTWARE_MAX_POINTS,
      maxPathVertices: BULK_SOFTWARE_MAX_PATH_VERTICES,
    })
  })
})

describe('decimationStride', () => {
  it('draws everything that fits', () => {
    expect(decimationStride(10, 10)).toBe(1)
    expect(decimationStride(507871, Infinity)).toBe(1)
  })

  it('keeps the drawn count within the budget', () => {
    const stride = decimationStride(507871, 30000)
    expect(stride).toBe(17)
    expect(Math.ceil(507871 / stride)).toBeLessThanOrEqual(30000)
  })
})

describe('decimateCentroids', () => {
  it('keeps every stride-th centroid and its filter value', () => {
    const centroids = Float32Array.from([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])
    const filterValues = Float32Array.from([10, 11, 12, 13, 14])
    const result = decimateCentroids({
      centroids,
      count: 5,
      stride: 2,
      filterValues,
    })
    expect(result.length).toBe(3)
    expect(Array.from(result.positions)).toEqual([0, 0, 2, 2, 4, 4])
    expect(Array.from(result.filterValues)).toEqual([10, 12, 14])
  })

  it('has no filter values when the group has none', () => {
    const result = decimateCentroids({
      centroids: Float32Array.from([0, 0, 1, 1]),
      count: 2,
      stride: 1,
    })
    expect(result.length).toBe(2)
    expect(result.filterValues).toBeUndefined()
  })
})

describe('countPathVertices', () => {
  it('sums the vertices of the given annotations', () => {
    /** Three annotations with 4, 2 and 5 vertices */
    const startIndices = Uint32Array.from([0, 4, 6, 11])
    expect(countPathVertices(startIndices, [0, 2])).toBe(9)
    expect(countPathVertices(startIndices, Uint32Array.from([1]))).toBe(2)
    expect(countPathVertices(startIndices, [])).toBe(0)
  })
})

describe('padExtent', () => {
  it('grows the extent by a fraction of its size on every side', () => {
    expect(padExtent([0, 0, 100, 50], 0.25)).toEqual([-25, -12.5, 125, 62.5])
  })
})

describe('annotationsInExtent', () => {
  /** Annotations 0..3 at x = 0, 10, 20, 30 with 4, 2, 5, 3 vertices */
  const centroids = Float32Array.from([0, 0, 10, 0, 20, 0, 30, 0])
  const startIndices = Uint32Array.from([0, 4, 6, 11, 14])

  it('keeps the annotations whose centroid is in the extent', () => {
    const result = annotationsInExtent({
      centroids,
      startIndices,
      candidates: [Uint32Array.from([0, 1]), Uint32Array.from([2, 3])],
      extent: [5, -1, 25, 1],
      maxVertices: 100,
    })
    expect(Array.from(result)).toEqual([1, 2])
  })

  it('is null when the annotations in view exceed the vertex budget', () => {
    const result = annotationsInExtent({
      centroids,
      startIndices,
      candidates: [Uint32Array.from([0, 1, 2, 3])],
      extent: [-1, -1, 31, 1],
      maxVertices: 10,
    })
    expect(result).toBeNull()
  })
})
