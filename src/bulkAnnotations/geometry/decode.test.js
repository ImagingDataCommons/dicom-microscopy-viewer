import { coeffsFromAffine3x3 } from './coords.js'
import { decodeGraphicGroup } from './decode.js'

const IDENTITY_AFFINE_3X3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

describe('decode.decodeGraphicGroup', () => {
  it('decodes a POINT group into one vertex per annotation in OL map space', () => {
    const graphicData = new Float32Array([0, 0, 5, 10, -3, -3])
    const coeffs = coeffsFromAffine3x3(IDENTITY_AFFINE_3X3)

    const result = decodeGraphicGroup({
      graphicType: 'POINT',
      graphicData,
      numberOfAnnotations: 3,
      coordinateDimensionality: 2,
      coeffs,
    })

    expect(result.graphicType).toBe('POINT')
    expect(result.numberOfAnnotations).toBe(3)
    expect(Array.from(result.startIndices)).toEqual([0, 1, 2, 3])
    expect(result.vertexCount).toBe(3)
    expect(Array.from(result.positions)).toEqual([0, -1, 5, -11, -3, 2])

    // Centroid of a single-vertex annotation is the vertex itself.
    expect(Array.from(result.centroids)).toEqual([0, -1, 5, -11, -3, 2])

    // Bbox of a single-vertex annotation collapses to a point.
    expect(Array.from(result.bboxes)).toEqual([0, -1, 0, -1, 5, -11, 5, -11, -3, 2, -3, 2])
  })

  it('appends a closing vertex and computes an area-weighted centroid for a POLYGON', () => {
    // A right triangle (0,0) -> (4,0) -> (4,3), unclosed in the source data.
    const graphicData = new Float32Array([0, 0, 4, 0, 4, 3])
    const graphicIndex = [1]
    const coeffs = coeffsFromAffine3x3(IDENTITY_AFFINE_3X3)

    const result = decodeGraphicGroup({
      graphicType: 'POLYGON',
      graphicData,
      graphicIndex,
      numberOfAnnotations: 1,
      coordinateDimensionality: 2,
      coeffs,
    })

    expect(Array.from(result.startIndices)).toEqual([0, 4])
    expect(result.vertexCount).toBe(4)

    // OL map space: [column, -(row + 1)], so the closing vertex repeats the first one.
    expect(Array.from(result.positions)).toEqual([0, -1, 4, -1, 4, -4, 0, -1])

    const [cx, cy] = [result.centroids[0], result.centroids[1]]
    expect(cx).toBeCloseTo(8 / 3, 4)
    expect(cy).toBeCloseTo(-2, 4)

    expect(Array.from(result.bboxes)).toEqual([0, -4, 4, -1])
  })

  it('does not append a closing vertex for POLYLINE and keeps the path open', () => {
    const graphicData = new Float32Array([0, 0, 4, 0, 4, 3])
    const graphicIndex = [1]
    const coeffs = coeffsFromAffine3x3(IDENTITY_AFFINE_3X3)

    const result = decodeGraphicGroup({
      graphicType: 'POLYLINE',
      graphicData,
      graphicIndex,
      numberOfAnnotations: 1,
      coordinateDimensionality: 2,
      coeffs,
    })

    expect(Array.from(result.startIndices)).toEqual([0, 3])
    expect(result.vertexCount).toBe(3)
    expect(Array.from(result.positions)).toEqual([0, -1, 4, -1, 4, -4])
  })

  it('aborts with an AbortError when shouldContinue returns false', () => {
    const graphicData = new Float32Array([0, 0, 5, 10])
    const coeffs = coeffsFromAffine3x3(IDENTITY_AFFINE_3X3)

    expect(() => {
      decodeGraphicGroup({
        graphicType: 'POINT',
        graphicData,
        numberOfAnnotations: 2,
        coordinateDimensionality: 2,
        coeffs,
        shouldContinue: () => false,
      })
    }).toThrow()

    try {
      decodeGraphicGroup({
        graphicType: 'POINT',
        graphicData,
        numberOfAnnotations: 2,
        coordinateDimensionality: 2,
        coeffs,
        shouldContinue: () => false,
      })
    } catch (error) {
      expect(error.name).toBe('AbortError')
    }
  })
})
