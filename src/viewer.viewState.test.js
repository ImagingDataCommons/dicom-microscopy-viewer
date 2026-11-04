const testCase1 = require('../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json')
const MapEvent = require('ol/MapEvent').default
const MapBrowserEvent = require('ol/MapBrowserEvent').default
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
    expect(state.zoom).toBe(view.getZoom())
    expect(state.rotation).toBe(view.getRotation())
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
    const { center } = viewer.getViewState()
    const target = [center[0] + 0.5, center[1] - 0.25]
    viewer.setViewState({ center: target, resolution: 0.002, rotation: 0.3 })
    const state = viewer.getViewState()
    expect(state.center[0]).toBeCloseTo(target[0], 6)
    expect(state.center[1]).toBeCloseTo(target[1], 6)
    expect(state.resolution).toBeCloseTo(0.002, 9)
    expect(state.rotation).toBeCloseTo(0.3, 12)
  })

  it('sets the zoom unless a resolution is given', () => {
    viewer.setViewState({ zoom: 2 })
    expect(viewer.getViewState().zoom).toBeCloseTo(2, 6)
    viewer.setViewState({ zoom: 1, resolution: 0.004 })
    expect(viewer.getViewState().resolution).toBeCloseTo(0.004, 9)
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
    /** 1 mm across 800 pixels, 0.5 mm across 600 pixels */
    expect(state.resolution).toBeGreaterThanOrEqual(1 / 800 - 1e-9)
    expect(state.resolution).toBeLessThan(1 / 400)
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

  it('does not publish VIEW_CHANGED after cleanup', async () => {
    const listener = jest.fn()
    container.addEventListener(EVENTS.VIEW_CHANGED, listener)
    viewer.setViewState({ resolution: 0.003 })
    viewer.cleanup()
    await nextFrame()
    expect(listener).not.toHaveBeenCalled()
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

  it('applies the image filter to the image canvases', () => {
    const map = getInternalMap(viewer)
    const render = jest.spyOn(map, 'render')
    viewer.setImageFilter('brightness(1.5)')
    expect(render).toHaveBeenCalled()
    const canvases = []
    for (const layer of map.getLayers().getArray()) {
      if (layer.hasListener('precompose')) {
        const canvas = document.createElement('canvas')
        layer.dispatchEvent({ type: 'precompose', context: { canvas } })
        canvases.push(canvas)
      }
    }
    expect(canvases.length).toBeGreaterThan(0)
    for (const canvas of canvases) {
      expect(canvas.style.filter).toBe('brightness(1.5)')
    }
    viewer.setImageFilter()
    for (const layer of map.getLayers().getArray()) {
      if (layer.hasListener('precompose')) {
        layer.dispatchEvent({ type: 'precompose', context: canvases[0] && { canvas: canvases[0] } })
      }
    }
    expect(canvases[0].style.filter).toBe('')
  })

  it('reports the deprecation of getMap() once', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      expect(viewer.getMap()).toBe(getInternalMap(viewer))
      viewer.getMap()
      const reports = warn.mock.calls.filter(([message]) =>
        String(message).includes('getMap() is deprecated'),
      )
      expect(reports).toHaveLength(1)
    } finally {
      warn.mockRestore()
    }
  })
})
