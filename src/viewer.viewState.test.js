const testCase1 = require('../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json')
const MapEvent = require('ol/MapEvent').default
const MapBrowserEvent = require('ol/MapBrowserEvent').default
const math = require('mathjs')
const dmv = require('./dicom-microscopy-viewer.js')

jest.mock('ol/webgl/Helper', () => jest.fn(() => null), { virtual: true })

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }))

const { EVENTS } = dmv.events

/** Map of a viewer without the deprecation warning of getMap() */
const getInternalMap = (viewer) => viewer[Symbol.for('map')]

const createViewer = () => {
  const viewer = new dmv.viewer.VolumeImageViewer({
    client: { retrieveBulkData: () => Promise.resolve([]) },
    metadata: testCase1.images.map(
      (metadata) => new dmv.metadata.VLWholeSlideMicroscopyImage({ metadata }),
    ),
  })
  const container = document.createElement('div')
  document.body.appendChild(container)
  viewer.render({ container })
  const map = getInternalMap(viewer)
  /** jsdom has no WebGL, so frames are not drawn */
  map.renderFrame_ = () => {}
  /** jsdom has no layout, so give the map a size */
  map.setSize([800, 600])
  return { viewer, container }
}

const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 50))

/**
 * Screen pixel of a map coordinate, computed like OpenLayers'
 * coordinateToPixelTransform (jsdom renders no frame)
 */
const toPixel = (map, [x, y]) => {
  const view = map.getView()
  const [width, height] = map.getSize()
  const [centerX, centerY] = view.getCenter()
  const resolution = view.getResolution()
  const angle = -view.getRotation()
  const dx = x - centerX
  const dy = y - centerY
  const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle)
  const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle)
  return [width / 2 + rotatedX / resolution, height / 2 - rotatedY / resolution]
}

describe('VolumeImageViewer view API', () => {
  let viewer
  let container

  beforeEach(() => {
    ;({ viewer, container } = createViewer())
  })

  afterEach(() => {
    viewer.cleanup()
    container.remove()
  })

  it('reports the view in slide coordinates and millimeter', () => {
    const view = getInternalMap(viewer).getView()
    const state = viewer.getViewState()
    const levels = viewer.numLevels
    const spacing = viewer.getPixelSpacing(levels - 1)[0]
    expect(state.resolution).toBeCloseTo(view.getResolution() * spacing, 12)
    expect(state).not.toHaveProperty('zoom')
    /** Relative to the default orientation of the slide */
    expect(state.rotation).toBe(0)
    /** The center is inside the slide's bounding box */
    const [offset, size] = viewer.boundingBox
    expect(state.center).toHaveLength(2)
    for (let i = 0; i < 2; i++) {
      expect(state.center[i]).toBeGreaterThanOrEqual(
        Math.min(offset[i], offset[i] + size[i]) - 1e-6,
      )
      expect(state.center[i]).toBeLessThanOrEqual(
        Math.max(offset[i], offset[i] + size[i]) + 1e-6,
      )
    }
  })

  it('sets center, resolution and rotation', () => {
    const view = getInternalMap(viewer).getView()
    const defaultRotation = view.getRotation()
    const { center } = viewer.getViewState()
    const target = [center[0] + 0.512345, center[1] - 0.254321]
    viewer.setViewState({ center: target, resolution: 0.002, rotation: 0.3 })
    const state = viewer.getViewState()
    /** Slide coordinates are rounded to 0.1 micrometer */
    expect(Math.abs(state.center[0] - target[0])).toBeLessThan(1e-4)
    expect(Math.abs(state.center[1] - target[1])).toBeLessThan(1e-4)
    expect(state.resolution).toBeCloseTo(0.002, 9)
    expect(state.rotation).toBeCloseTo(0.3, 12)
    expect(view.getRotation()).toBeCloseTo(defaultRotation + 0.3, 12)
  })

  it('changes nothing when setting the current view state', () => {
    viewer.setViewState({ resolution: 0.0021, rotation: -2 })
    const view = getInternalMap(viewer).getView()
    const setters = ['setCenter', 'setResolution', 'setZoom', 'setRotation']
    const spies = setters.map((name) => jest.spyOn(view, name))
    viewer.setViewState(viewer.getViewState())
    for (const spy of spies) {
      expect(spy).not.toHaveBeenCalled()
    }
  })

  it('rejects invalid view states and bounds', () => {
    expect(() => viewer.setViewState({ center: [1] })).toThrow(TypeError)
    expect(() => viewer.setViewState({ center: [1, Number.NaN] })).toThrow(
      TypeError,
    )
    expect(() => viewer.setViewState({ zoom: 2 })).toThrow(TypeError)
    expect(() => viewer.setViewState({ resolution: 0 })).toThrow(RangeError)
    expect(() => viewer.setViewState({ rotation: Infinity })).toThrow(
      TypeError,
    )
    expect(() => viewer.fitBounds([[0, 0]])).toThrow(TypeError)
    expect(() => viewer.fitBounds()).toThrow(TypeError)
  })

  it('rotates the image clockwise on screen', () => {
    const map = getInternalMap(viewer)
    const view = map.getView()
    const base = view.getRotation()
    viewer.setViewState({ rotation: Math.PI / 2 })
    expect(view.getRotation()).toBeCloseTo(base + Math.PI / 2, 12)
    /** A point right of the center moves below it on screen */
    const [x, y] = view.getCenter()
    const [cx, cy] = toPixel(map, [x, y])
    /** Right of the center on screen before the rotation */
    const unrotated = [Math.cos(base), Math.sin(base)]
    const [px, py] = toPixel(map, [x + unrotated[0], y + unrotated[1]])
    expect(px - cx).toBeCloseTo(0, 6)
    expect(py - cy).toBeGreaterThan(0)
  })

  it('fits a region of the slide into the viewport', () => {
    const { center } = viewer.getViewState()
    const bounds = [
      [center[0] - 0.5, center[1] - 0.25],
      [center[0] + 0.5, center[1] + 0.25],
    ]
    viewer.fitBounds(bounds)
    const state = viewer.getViewState()
    expect(state.center[0]).toBeCloseTo(center[0], 3)
    expect(state.center[1]).toBeCloseTo(center[1], 3)
    /** Screen position of each corner of the region */
    const map = getInternalMap(viewer)
    const affineInverse = math.inv(viewer.getAffine())
    const corners = [
      [bounds[0][0], bounds[0][1]],
      [bounds[1][0], bounds[0][1]],
      [bounds[1][0], bounds[1][1]],
      [bounds[0][0], bounds[1][1]],
    ].map((corner) => {
      const [column, row] = dmv.utils.applyInverseTransform({
        coordinate: corner,
        affine: affineInverse,
      })
      return toPixel(map, [column, -(row + 1)])
    })
    const xs = corners.map(([x]) => x)
    const ys = corners.map(([, y]) => y)
    /** Inside the 800 x 600 viewport, touching two opposite edges */
    expect(Math.min(...xs)).toBeGreaterThan(-1)
    expect(Math.max(...xs)).toBeLessThan(801)
    expect(Math.min(...ys)).toBeGreaterThan(-1)
    expect(Math.max(...ys)).toBeLessThan(601)
    const touchesSides = Math.min(...xs) < 1 && Math.max(...xs) > 799
    const touchesTopAndBottom = Math.min(...ys) < 1 && Math.max(...ys) > 599
    expect(touchesSides || touchesTopAndBottom).toBe(true)
  })

  it('publishes VIEW_CHANGED once per frame with the view state', async () => {
    const listener = jest.fn()
    container.addEventListener(EVENTS.VIEW_CHANGED, listener)
    const { center } = viewer.getViewState()
    viewer.setViewState({ center: [center[0] + 0.1, center[1]] })
    viewer.setViewState({ resolution: 0.003, rotation: 0.1 })
    await nextFrame()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].detail.payload.viewState).toEqual(
      viewer.getViewState(),
    )
    container.removeEventListener(EVENTS.VIEW_CHANGED, listener)
  })

  it('does not publish a pending VIEW_CHANGED after cleanup', async () => {
    viewer.setViewState({ resolution: 0.003 })
    viewer.cleanup()
    /** Rendered again before the frame of the change */
    const next = document.createElement('div')
    document.body.appendChild(next)
    const listener = jest.fn()
    next.addEventListener(EVENTS.VIEW_CHANGED, listener)
    viewer.render({ container: next })
    getInternalMap(viewer).renderFrame_ = () => {}
    await nextFrame()
    expect(listener).not.toHaveBeenCalled()
    next.remove()
  })

  it('adds the view state to move events', () => {
    const listener = jest.fn()
    container.addEventListener(EVENTS.MOVE_ENDED, listener)
    const map = getInternalMap(viewer)
    map.dispatchEvent(new MapEvent('moveend', map))
    const { payload } = listener.mock.calls[0][0].detail
    expect(payload.viewState).toEqual(viewer.getViewState())
    expect(payload.event).toBeDefined()
  })

  it('adds client and slide coordinates to pointer move events', () => {
    const listener = jest.fn()
    container.addEventListener(EVENTS.POINTER_MOVE, listener)
    const map = getInternalMap(viewer)
    const view = map.getView()
    map.getCoordinateFromPixel = () => view.getCenter()
    map.getFeaturesAtPixel = () => []
    const originalEvent = new MouseEvent('pointermove', {
      clientX: 12,
      clientY: 34,
    })
    map.dispatchEvent(new MapBrowserEvent('pointermove', map, originalEvent))
    const { payload } = listener.mock.calls[0][0].detail
    expect(payload.clientX).toBe(12)
    expect(payload.clientY).toBe(34)
    const { center } = viewer.getViewState()
    expect(payload.coordinates[0]).toBeCloseTo(center[0], 9)
    expect(payload.coordinates[1]).toBeCloseTo(center[1], 9)
    expect(payload.features).toEqual([])
  })

  it('applies a color matrix to the image canvases', () => {
    const map = getInternalMap(viewer)
    const render = jest.spyOn(map, 'render')
    const precompose = () => {
      const canvases = []
      for (const layer of map.getLayers().getArray()) {
        if (layer.hasListener('precompose')) {
          const canvas = document.createElement('canvas')
          layer.dispatchEvent({ type: 'precompose', context: { canvas } })
          canvases.push(canvas)
        }
      }
      return canvases
    }
    /** Window [10, 200] of 8-bit values */
    const s = 255 / 190
    const o = -10 / 190
    const matrix = [s, 0, 0, 0, o, 0, s, 0, 0, o, 0, 0, s, 0, o, 0, 0, 0, 1, 0]
    viewer.setImageColorMatrix(matrix)
    expect(render).toHaveBeenCalled()
    const svg = map.getViewport().querySelector('svg[data-filter-id]')
    const filter = svg.querySelector('filter')
    expect(filter.getAttribute('color-interpolation-filters')).toBe('sRGB')
    expect(filter.querySelector('feColorMatrix').getAttribute('values')).toBe(
      matrix.join(' '),
    )
    const canvases = precompose()
    expect(canvases.length).toBeGreaterThan(0)
    for (const canvas of canvases) {
      expect(canvas.style.filter).toBe(`url("#${filter.id}")`)
    }

    viewer.setImageColorMatrix(matrix, { colorSpace: 'linear-srgb' })
    expect(filter.getAttribute('color-interpolation-filters')).toBe('linearRGB')
    expect(map.getViewport().querySelectorAll('svg[data-filter-id]')).toHaveLength(1)

    viewer.setImageColorMatrix(null)
    expect(map.getViewport().querySelector('svg[data-filter-id]')).toBeNull()
    for (const canvas of precompose()) {
      expect(canvas.style.filter).toBe('')
    }
  })

  it('keeps filters that applications set on the canvases', () => {
    const map = getInternalMap(viewer)
    const canvases = []
    for (const layer of map.getLayers().getArray()) {
      if (layer.hasListener('precompose')) {
        const canvas = document.createElement('canvas')
        /** Like Cornerstone3D on `.ol-layers canvas` */
        canvas.style.filter = 'brightness(2)'
        layer.dispatchEvent({ type: 'precompose', context: { canvas } })
        canvases.push(canvas)
      }
    }
    expect(canvases.length).toBeGreaterThan(0)
    for (const canvas of canvases) {
      expect(canvas.style.filter).toBe('brightness(2)')
    }
  })

  it('rejects invalid color matrices', () => {
    expect(() => viewer.setImageColorMatrix([1, 0, 0])).toThrow(TypeError)
    expect(() =>
      viewer.setImageColorMatrix(new Array(20).fill(Number.NaN)),
    ).toThrow(TypeError)
    expect(() =>
      viewer.setImageColorMatrix(new Array(20).fill(0), {
        colorSpace: 'display-p3',
      }),
    ).toThrow(RangeError)
  })

  it('still returns the map from the deprecated getMap()', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      expect(viewer.getMap()).toBe(getInternalMap(viewer))
      expect(warn).not.toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })
})
