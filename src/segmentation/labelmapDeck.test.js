jest.mock('@deck.gl/core', () => ({ Layer: class {}, project32: {} }))
jest.mock('@luma.gl/engine', () => ({ Model: class {} }))

import TileGrid from 'ol/tilegrid/TileGrid'

import {
  createLabelProxyLayer,
  createValueTableProxyLayer,
  LabelmapDeckLayers,
  padRowsForUpload,
  paletteValueTable,
} from './labelmapDeck.js'

function createLayers() {
  const overlay = {
    addLayerSource: jest.fn(),
    removeLayerSource: jest.fn(),
    ensureReady: jest.fn(() => Promise.resolve(false)),
    onDeviceInitialized: jest.fn(),
    changed: jest.fn(),
  }
  const map = { render: jest.fn() }
  return { layers: new LabelmapDeckLayers({ map, overlay }), overlay, map }
}

function createInstance(layers, bitsAllocated = 8) {
  return layers.addInstance('series-1', {
    tileGrid: new TileGrid({
      extent: [0, -1024, 1024, 0],
      origin: [0, 0],
      resolutions: [4, 1],
      tileSize: 256,
    }),
    extent: [0, -1024, 1024, 0],
    loader: jest.fn(() => new Promise(() => {})),
    bitsAllocated,
  })
}

/** RGBA of a label in the lookup table */
function lut(instance, label) {
  return Array.from(instance.lut.slice(label * 4, label * 4 + 4))
}

describe('LabelmapDeckLayers', () => {
  it('registers as a segmentation source of the overlay', () => {
    const { layers, overlay } = createLayers()
    expect(overlay.addLayerSource).toHaveBeenCalledWith(
      'labelmap-segments',
      expect.objectContaining({ order: 100 }),
    )
    layers.dispose()
    expect(overlay.removeLayerSource).toHaveBeenCalledWith('labelmap-segments')
  })

  it('writes a segment color with its opacity as alpha when shown', () => {
    const { layers } = createLayers()
    const instance = createInstance(layers)
    expect(instance.lut.length).toBe(256 * 4)
    layers.setLabel(instance, 3, { color: [10, 20, 30], opacity: 0.5 })
    expect(lut(instance, 3)).toEqual([10, 20, 30, 0])
    layers.setLabel(instance, 3, { visible: true })
    expect(lut(instance, 3)).toEqual([10, 20, 30, 128])
    expect(instance.visibleCount).toBe(1)
    layers.setLabel(instance, 3, { visible: false })
    expect(lut(instance, 3)[3]).toBe(0)
    expect(instance.visibleCount).toBe(0)
    /** Label 0 (background) is never drawn */
    expect(lut(instance, 0)).toEqual([0, 0, 0, 0])
  })

  it('has a 256 x 256 table for 16-bit labels', () => {
    const { layers } = createLayers()
    const instance = createInstance(layers, 16)
    expect(instance.lut.length).toBe(256 * 256 * 4)
    layers.setLabel(instance, 300, { visible: true, color: [1, 2, 3] })
    expect(lut(instance, 300)).toEqual([1, 2, 3, 255])
  })

  it('draws every value but 0 of a BINARY instance as its segment', () => {
    const { layers } = createLayers()
    const instance = layers.addInstance('series-1:3', {
      tileGrid: new TileGrid({
        extent: [0, -1024, 1024, 0],
        origin: [0, 0],
        resolutions: [1],
        tileSize: 256,
      }),
      extent: [0, -1024, 1024, 0],
      loader: jest.fn(() => new Promise(() => {})),
      bitsAllocated: 1,
      binary: true,
    })
    layers.setLabel(instance, 1, {
      visible: true,
      color: [0, 128, 255],
      opacity: 1,
    })
    expect(lut(instance, 0)).toEqual([0, 0, 0, 0])
    expect(lut(instance, 1)).toEqual([0, 128, 255, 255])
    expect(lut(instance, 255)).toEqual([0, 128, 255, 255])
    layers.setLabel(instance, 1, { visible: false })
    expect(lut(instance, 255)[3]).toBe(0)
  })

  it('draws nothing before the deck device exists', () => {
    const { layers } = createLayers()
    const instance = createInstance(layers)
    layers.setLabel(instance, 1, { visible: true })
    expect(
      layers.getLayers({
        viewState: { resolution: 1, rotation: 0 },
        extent: [0, -1024, 1024, 0],
      }),
    ).toEqual([])
  })
})

describe('createLabelProxyLayer', () => {
  it('maps the OpenLayers layer calls of a segment to its table entry', () => {
    const { layers } = createLayers()
    const instance = createInstance(layers)
    const proxy = createLabelProxyLayer(layers, instance, 2, {
      opacity: 0.75,
      color: [255, 0, 0],
    })
    expect(proxy.isLabelmapDeckProxy).toBe(true)
    expect(proxy.getVisible()).toBe(false)
    expect(proxy.getSource()).toBeNull()
    proxy.setVisible(true)
    expect(proxy.getVisible()).toBe(true)
    expect(lut(instance, 2)).toEqual([255, 0, 0, 191])
    proxy.setOpacity(0.2)
    expect(proxy.getOpacity()).toBe(0.2)
    expect(lut(instance, 2)[3]).toBe(51)
    proxy.setColor([0, 0, 255])
    expect(lut(instance, 2)).toEqual([0, 0, 255, 51])
    proxy.dispose()
    expect(proxy.getVisible()).toBe(false)
    expect(lut(instance, 2)[3]).toBe(0)
  })
})

describe('padRowsForUpload', () => {
  it('pads 8-bit rows to 4 bytes', () => {
    const labels = Uint8Array.from([1, 2, 3, 4, 5, 6])
    const padded = padRowsForUpload(labels, 3, 2)
    expect(Array.from(padded)).toEqual([1, 2, 3, 0, 4, 5, 6, 0])
  })

  it('pads 16-bit rows to 4 bytes', () => {
    const labels = Uint16Array.from([1, 2, 3, 4, 5, 6])
    const padded = padRowsForUpload(labels, 3, 2)
    expect(padded).toBeInstanceOf(Uint16Array)
    expect(Array.from(padded)).toEqual([1, 2, 3, 0, 4, 5, 6, 0])
  })

  it('keeps rows that are already aligned', () => {
    const labels = new Uint8Array(256 * 2)
    expect(padRowsForUpload(labels, 256, 2)).toBe(labels)
  })
})

describe('paletteValueTable', () => {
  /** A 256-entry gray ramp whose first entry is transparent */
  const colormap = Array.from({ length: 256 }, (_, i) =>
    i === 0 ? [0, 0, 0, 0] : [i, i, i],
  )

  it('maps stored values 0-255 through a full window to the same entry', () => {
    const table = paletteValueTable({
      colormap,
      /** createWindow(0, 255) */
      windowCenter: 127.5,
      windowWidth: 255,
    })
    expect(Array.from(table.slice(0, 4))).toEqual([0, 0, 0, 0])
    expect(Array.from(table.slice(100 * 4, 100 * 4 + 4))).toEqual([
      100, 100, 100, 255,
    ])
    expect(Array.from(table.slice(255 * 4))).toEqual([255, 255, 255, 255])
  })

  it('clamps values outside a narrow window to its ends', () => {
    const table = paletteValueTable({
      colormap: [
        [0, 0, 0, 0],
        [255, 0, 0, 0.5],
      ],
      windowCenter: 100.5,
      windowWidth: 2,
    })
    expect(Array.from(table.slice(50 * 4, 50 * 4 + 4))).toEqual([0, 0, 0, 0])
    expect(Array.from(table.slice(200 * 4, 200 * 4 + 4))).toEqual([
      255, 0, 0, 128,
    ])
  })
})

describe('createValueTableProxyLayer', () => {
  it('scales the table alpha by opacity and clears it when hidden', () => {
    const { layers } = createLayers()
    const instance = createInstance(layers)
    const table = new Uint8Array(256 * 4)
    table.set([10, 20, 30, 200], 7 * 4)
    const proxy = createValueTableProxyLayer(layers, instance, {
      opacity: 0.5,
      table,
    })
    expect(proxy.getVisible()).toBe(false)
    expect(lut(instance, 7)[3]).toBe(0)
    proxy.setVisible(true)
    expect(lut(instance, 7)).toEqual([10, 20, 30, 100])
    expect(instance.visibleCount).toBe(1)
    proxy.setOpacity(1)
    expect(lut(instance, 7)[3]).toBe(200)
    proxy.setInterpolate(true)
    expect(instance.interpolate).toBe(true)
    proxy.dispose()
    expect(lut(instance, 7)[3]).toBe(0)
    expect(instance.visibleCount).toBe(0)
  })
})
