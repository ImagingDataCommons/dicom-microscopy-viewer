import { olViewStateToDeck } from './viewState.js'

describe('olViewStateToDeck', () => {
  test('maps OL center/resolution to OrthographicView target/zoom', () => {
    const vs = olViewStateToDeck(
      { center: [100, -200], resolution: 0.25, rotation: 0 },
      [800, 600],
    )
    expect(vs.target).toEqual([100, -200, 0])
    expect(vs.width).toBe(800)
    expect(vs.height).toBe(600)
    /** zoom = -log2(0.25) = 2 */
    expect(vs.zoom).toBeCloseTo(2)
  })
})
