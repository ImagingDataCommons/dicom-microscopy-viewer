/**
 * PathTesselator scratch neutralization — verify the factory attaches
 * `positions: null` without importing deck.gl (jsdom lacks TextDecoder).
 */

jest.mock('@deck.gl/layers', () => ({
  PathLayer: class PathLayer {
    constructor(props) {
      this.props = props
    }
  },
}))

jest.mock('@deck.gl/extensions', () => ({
  DataFilterExtension: class DataFilterExtension {
    constructor(opts) {
      this.opts = opts
    }
  },
}))

const { createPathLayer } = require('./pathLayer.js')

describe('createPathLayer', () => {
  test('binary data includes inert positions: null attribute', () => {
    const positions = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0])
    const startIndices = new Uint32Array([0, 4])
    const layer = createPathLayer({
      id: 'test-path',
      positions,
      startIndices,
      length: 1,
      color: [0, 255, 0, 220],
      widthPixels: 2.5,
    })
    const props = layer.props
    expect(props.data.attributes.positions).toBeNull()
    expect(props.data.attributes.getPath.value).toBe(positions)
    expect(props.data.startIndices.length).toBe(2)
    expect(props.pickable).toBe(false)
    expect(props._pathType).toBe('open')
    expect(props.positionFormat).toBe('XY')
  })
})
