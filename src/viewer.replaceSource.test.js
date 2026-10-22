import Collection from 'ol/Collection'

import { _replaceSourceKeepingTiles } from './viewer.js'

jest.mock('ol/webgl/Helper', () => jest.fn(() => null), { virtual: true })

/** Layer stand-in: only what the replacement reads and sets */
function fakeLayer(source) {
  return {
    source,
    visible: true,
    opacity: 0.5,
    getSource() {
      return this.source
    },
    setSource: jest.fn(function setSource(next) {
      this.source = next
    }),
    getVisible() {
      return this.visible
    },
    setVisible(visible) {
      this.visible = visible
    },
    getOpacity() {
      return this.opacity
    },
    setOpacity(opacity) {
      this.opacity = opacity
    },
    dispose: jest.fn(),
  }
}

function fakeSource() {
  return { clear: jest.fn(), dispose: jest.fn() }
}

function fakeMap(layers) {
  const listeners = {}
  return {
    getLayers: () => layers,
    once: (type, listener) => {
      listeners[type] = [...(listeners[type] ?? []), listener]
    },
    render: jest.fn(),
    emit: (type) => {
      const pending = listeners[type] ?? []
      listeners[type] = []
      for (const listener of pending) listener()
    },
  }
}

describe('_replaceSourceKeepingTiles', () => {
  it('draws the new source above the old one until the map has rendered it', () => {
    const oldSource = fakeSource()
    const oldLayer = fakeLayer(oldSource)
    const annotations = fakeLayer(fakeSource())
    const layers = new Collection([oldLayer, annotations])
    const map = fakeMap(layers)
    const newSource = fakeSource()
    const item = {
      layer: oldLayer,
      overviewLayer: fakeLayer(fakeSource()),
      createLayer: (source) => fakeLayer(source),
    }

    _replaceSourceKeepingTiles(map, item, newSource, () => false)

    const newLayer = item.layer
    expect(newLayer.getSource()).toBe(newSource)
    expect(newLayer.getOpacity()).toBe(0.5)
    expect(layers.getArray()).toEqual([oldLayer, newLayer, annotations])
    expect(oldLayer.setSource).not.toHaveBeenCalled()
    expect(oldSource.dispose).not.toHaveBeenCalled()

    map.emit('rendercomplete')

    expect(layers.getArray()).toEqual([newLayer, annotations])
    expect(oldLayer.dispose).toHaveBeenCalled()
    expect(oldSource.dispose).toHaveBeenCalled()
  })

  it('keeps the old source while the overview still draws from it', () => {
    const shared = fakeSource()
    const oldLayer = fakeLayer(shared)
    const map = fakeMap(new Collection([oldLayer]))
    const item = {
      layer: oldLayer,
      overviewLayer: fakeLayer(shared),
      createLayer: (source) => fakeLayer(source),
    }

    _replaceSourceKeepingTiles(map, item, fakeSource(), () => false)
    map.emit('rendercomplete')

    expect(oldLayer.dispose).toHaveBeenCalled()
    expect(shared.dispose).not.toHaveBeenCalled()
  })

  it('sets the source in place on a layer that is not on the map', () => {
    const oldSource = fakeSource()
    const oldLayer = fakeLayer(oldSource)
    const newSource = fakeSource()
    const item = { layer: oldLayer, createLayer: (source) => fakeLayer(source) }

    _replaceSourceKeepingTiles(
      fakeMap(new Collection([])),
      item,
      newSource,
      () => false,
    )

    expect(item.layer).toBe(oldLayer)
    expect(oldLayer.setSource).toHaveBeenCalledWith(newSource)
    expect(oldSource.dispose).toHaveBeenCalled()
  })

  it('leaves the layers alone once the viewer is cleaned up', () => {
    const oldLayer = fakeLayer(fakeSource())
    const layers = new Collection([oldLayer])
    const map = fakeMap(layers)
    let isCleanedUp = false
    const item = { layer: oldLayer, createLayer: (source) => fakeLayer(source) }

    _replaceSourceKeepingTiles(map, item, fakeSource(), () => isCleanedUp)
    isCleanedUp = true
    map.emit('rendercomplete')

    expect(oldLayer.dispose).not.toHaveBeenCalled()
  })
})
