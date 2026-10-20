import { unByKey } from 'ol/Observable'

import Enums from '../../enums'
import _MarkupManager from './_MarkupManager'

jest.mock('ol/Observable', () => {
  const actual = jest.requireActual('ol/Observable')
  return {
    __esModule: true,
    ...actual,
    unByKey: jest.fn(actual.unByKey),
  }
})

jest.mock('ol/source/Vector')
jest.mock('ol/geom/LineString')
jest.mock('ol/Collection', () =>
  jest.fn(() => {
    const items = []
    return {
      getArray: () => items,
      push: (item) => items.push(item),
      remove: (item) => {
        const index = items.indexOf(item)
        if (index >= 0) items.splice(index, 1)
      },
    }
  }),
)
jest.mock('ol/layer/Vector', () =>
  jest.fn().mockImplementation(() => ({
    setVisible: jest.fn(),
    getSource: () => ({ clear: jest.fn() }),
  })),
)
jest.mock('ol/Overlay', () =>
  jest.fn().mockImplementation((options) => {
    let position = options.position
    let map = null
    const props = { dragging: false }
    return {
      element: options.element,
      getPosition: () => position,
      setPosition: (value) => {
        position = value
      },
      getMap: () => map,
      setMap: (value) => {
        map = value
      },
      get: (key) => props[key],
      set: (key, value) => {
        props[key] = value
      },
    }
  }),
)
jest.mock('ol/Feature', () =>
  jest.fn().mockImplementation((options) => {
    let id
    let geometry = options.geometry
    let style
    return {
      setId: (value) => {
        id = value
      },
      getId: () => id,
      setGeometry: (value) => {
        geometry = value
      },
      getGeometry: () => geometry,
      setStyle: (value) => {
        style = value
      },
      getStyle: () => style,
    }
  }),
)
jest.mock('ol/style/Stroke', () =>
  jest.fn().mockImplementation((options) => {
    let color = options.color
    return {
      setColor: (value) => {
        color = value
      },
      getColor: () => color,
    }
  }),
)
jest.mock('ol/style/Style', () =>
  jest.fn().mockImplementation((options) => ({
    getStroke: () => options.stroke,
    setStroke: (stroke) => {
      options.stroke = stroke
    },
  })),
)

const measurementFormat = jest.fn(
  (_feature, unitSuffix) => `1.00 ${unitSuffix}`,
)

function createGeometry(type = 'LineString') {
  if (type === 'Point') {
    return {
      on: jest.fn(() => ({ type: 'geometryChange' })),
      getCoordinates: jest.fn(() => [10, 20]),
      getLastCoordinate: jest.fn(() => [10, 20]),
      getClosestPoint: jest.fn((p) => p),
    }
  }
  return {
    on: jest.fn(() => ({ type: 'geometryChange' })),
    getCoordinates: jest.fn(() => [
      [0, 0],
      [10, 0],
      [10, 10],
    ]),
    getLastCoordinate: jest.fn(() => [10, 10]),
    getClosestPoint: jest.fn((p) => p),
    getExtent: jest.fn(() => [0, 0, 10, 10]),
  }
}

function createFeature({
  id = 'roi-1',
  markupType = Enums.Markup.Measurement,
  geometryType = 'LineString',
  styleColor = '#d9453b',
} = {}) {
  const geometry = createGeometry(geometryType)
  const props = {
    [Enums.InternalProperties.Markup]: markupType,
    [Enums.InternalProperties.StyleOptions]: {
      stroke: { color: styleColor, width: 2 },
    },
  }
  return {
    on: jest.fn((type) => ({ type })),
    getGeometry: jest.fn(() => geometry),
    getId: jest.fn(() => id),
    get: jest.fn((key) => props[key]),
    set: jest.fn((key, value) => {
      props[key] = value
    }),
    geometry,
  }
}

function createMap() {
  const mapListeners = {}
  return {
    addOverlay: jest.fn((overlay) => {
      overlay.setMap?.({})
    }),
    removeOverlay: jest.fn((overlay) => {
      overlay.setMap?.(null)
    }),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    getInteractions: jest.fn(() => []),
    getView: jest.fn(() => ({
      getCenter: () => [0, 0],
      getProjection: () => ({}),
      getResolution: () => 0.000001,
    })),
    on: jest.fn((type, handler) => {
      mapListeners[type] = handler
      return { type }
    }),
    _listeners: mapListeners,
  }
}

function createManager(overrides = {}) {
  const map = createMap()
  const features = new Map()
  const drawingSource = {
    getFeatureById: (id) => features.get(id),
  }
  const manager = new _MarkupManager({
    map,
    pyramid: [{}],
    affine: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    drawingSource,
    formatters: {
      [Enums.Markup.Measurement]: measurementFormat,
    },
    ...overrides,
  })
  return { manager, map, features, drawingSource }
}

describe('_MarkupManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    measurementFormat.mockClear()
  })

  it('initializes with a single pair of map pointer listeners', () => {
    const { manager, map } = createManager()
    expect(manager).toBeInstanceOf(_MarkupManager)
    expect(map.on).toHaveBeenCalledWith(
      Enums.MapEvents.POINTER_MOVE,
      expect.any(Function),
    )
    expect(map.on).toHaveBeenCalledWith(
      Enums.MapEvents.POINTER_UP,
      expect.any(Function),
    )
    expect(map.on).toHaveBeenCalledTimes(2)
  })

  it('creates markups, wires feature events, and draws a link', () => {
    const { manager, map, features } = createManager()
    const feature = createFeature()
    features.set('roi-1', feature)

    const result = manager.create({
      feature,
      value: 'Testing',
      isLinkable: true,
      isDraggable: true,
    })

    expect(map.addOverlay).toHaveBeenCalled()
    expect(result).toEqual(
      expect.objectContaining({
        id: 'roi-1',
        isDraggable: true,
        isLinkable: true,
      }),
    )
    expect(result.element.classList.contains('markup-label--draggable')).toBe(
      true,
    )
    expect(result.element.id).toBe('')
    expect(manager._linksById.has('roi-1')).toBe(true)
    expect(feature.on).toHaveBeenCalledWith(
      Enums.FeatureEvents.CHANGE,
      expect.any(Function),
    )
  })

  it('does not register additional map pointer listeners when wiring a feature', () => {
    const { manager, map, features } = createManager()
    const feature = createFeature()
    features.set('roi-1', feature)
    map.on.mockClear()

    manager.create({ feature, value: '1.00 μm' })
    manager.create({ feature, value: '1.00 μm' })

    expect(map.on).not.toHaveBeenCalled()
  })

  it('unsubscribes feature listeners on remove', () => {
    const { manager, features } = createManager()
    const feature = createFeature()
    features.set('roi-1', feature)

    manager.create({ feature, value: '1.00 μm' })
    const entry = manager._listeners.get('roi-1')
    expect(entry).toBeDefined()

    manager.remove('roi-1')

    expect(unByKey).toHaveBeenCalledWith(entry.featureChange)
    expect(unByKey).toHaveBeenCalledWith(entry.propertyChange)
    expect(unByKey).toHaveBeenCalledWith(entry.geometryChange)
    expect(manager.has('roi-1')).toBe(false)
    expect(manager._linksById.has('roi-1')).toBe(false)
  })

  it('refreshes measurement label text when the unit changes', () => {
    const { manager, features } = createManager()
    const feature = createFeature()
    features.set('roi-1', feature)
    manager.create({ feature, value: '1.00 μm' })
    measurementFormat.mockClear()

    manager.setMeasurementUnit('mm')

    expect(measurementFormat).toHaveBeenCalled()
    expect(manager.get('roi-1').element.innerText).toBe('1.00 mm')
  })

  it('applies markup label color to the element and link stroke', () => {
    const { manager, features } = createManager()
    const feature = createFeature()
    features.set('roi-1', feature)
    manager.create({ feature, value: '1.00 μm' })

    manager.setMarkupLabelColor('#1f9d6b')

    /** jsdom normalizes assigned hex colors to rgb() */
    expect(manager.get('roi-1').element.style.color).toMatch(/31,\s*157,\s*107/)
    const link = manager._linksById.get('roi-1')
    expect(link.getStyle().getStroke().getColor()).toBe('#1f9d6b')
  })

  it('updates label color during draw when the feature is not on drawingSource yet', () => {
    const { manager } = createManager()
    const feature = createFeature({ id: 'sketch-1' })
    /** Sketch features live on the Draw overlay until drawend */
    manager.create({ feature, value: '0.00 μm' })

    manager.setMarkupLabelColor('#d9453b')

    expect(manager.get('sketch-1').element.style.color).toMatch(
      /217,\s*69,\s*59/,
    )
    expect(manager._linksById.get('sketch-1').getStyle().getStroke().getColor()).toBe(
      '#d9453b',
    )
  })

  it('defaults markup label font size to 13px and updates the shared style tag', () => {
    const { manager } = createManager()
    expect(manager.getMarkupLabelFontSize()).toBe(13)
    expect(manager._styleTag.innerHTML).toContain('font-size: 13px')

    manager.setMarkupLabelFontSize(16)
    expect(manager.getMarkupLabelFontSize()).toBe(16)
    expect(manager._styleTag.innerHTML).toContain('font-size: 16px')

    manager.setMarkupLabelFontSize(null)
    expect(manager.getMarkupLabelFontSize()).toBe(13)
    expect(manager._styleTag.innerHTML).toContain('font-size: 13px')
  })

  it('places the label using a resolution-scaled screen offset from the tip', () => {
    const Overlay = require('ol/Overlay')
    const { manager, map } = createManager()
    map.getView = jest.fn(() => ({
      getCenter: () => [0, 0],
      getProjection: () => ({}),
      getResolution: () => 2,
    }))
    const feature = createFeature()
    manager.create({ feature, value: '1.00 μm' })

    const lastCall = Overlay.mock.calls[Overlay.mock.calls.length - 1][0]
    /** 36px × resolution 2 → map offset 72 from tip [10, 10] */
    expect(lastCall.position).toEqual([10 - 72, 10 - 72])
  })

  it('keeps the offset on geometry updates until the user drags the label', () => {
    const { manager, map, features } = createManager()
    map.getView = jest.fn(() => ({
      getCenter: () => [0, 0],
      getProjection: () => ({}),
      getResolution: () => 1,
    }))
    manager.setMeasurementUnit('μm')
    const feature = createFeature()
    features.set('roi-1', feature)
    manager.create({ feature, value: '1.00 μm' })
    const markup = manager.get('roi-1')
    const setPosition = jest.spyOn(markup.overlay, 'setPosition')

    const changeHandler = feature.on.mock.calls.find(
      ([type]) => type === Enums.FeatureEvents.CHANGE,
    )?.[1]
    changeHandler({ target: feature })

    expect(setPosition).toHaveBeenCalledWith([10 - 36, 10 - 36])

    markup.userMoved = true
    setPosition.mockClear()
    changeHandler({ target: feature })
    expect(setPosition).not.toHaveBeenCalled()
  })

  it('hides and shows a single markup without throwing when the link is missing', () => {
    const { manager, map, features } = createManager()
    const feature = createFeature({ id: 'roi-2' })
    features.set('roi-2', feature)
    manager.create({
      feature,
      value: 'label',
      isLinkable: false,
    })

    expect(() => manager.setVisibility('roi-2', false)).not.toThrow()
    expect(map.removeOverlay).toHaveBeenCalled()
    expect(manager.get('roi-2').element.style.display).toBe('none')

    expect(() => manager.setVisibility('roi-2', true)).not.toThrow()
    expect(manager.get('roi-2').element.style.display).toBe('')
  })

  it('setVisible toggles every overlay without add-then-remove on hide', () => {
    const { manager, map, features } = createManager()
    const feature = createFeature()
    features.set('roi-1', feature)
    manager.create({ feature, value: '1.00 μm' })
    map.addOverlay.mockClear()
    map.removeOverlay.mockClear()

    manager.setVisible(false)
    expect(map.removeOverlay).toHaveBeenCalled()
    expect(map.addOverlay).not.toHaveBeenCalled()
    expect(manager.get('roi-1').element.style.display).toBe('none')

    manager.setVisible(true)
    expect(manager.get('roi-1').element.style.display).toBe('')
  })

  it('draws a link for Point geometries without throwing', () => {
    const { manager, features } = createManager()
    const feature = createFeature({ geometryType: 'Point' })
    features.set('roi-1', feature)

    expect(() =>
      manager.create({ feature, value: 'point', isLinkable: true }),
    ).not.toThrow()
    expect(manager._linksById.has('roi-1')).toBe(true)
  })

  it('allows clearing label text with an empty string', () => {
    const { manager, features } = createManager()
    const feature = createFeature()
    features.set('roi-1', feature)
    manager.create({ feature, value: '1.00 μm' })

    manager.update({ feature, value: '' })
    expect(manager.get('roi-1').element.innerText).toBe('')
  })

  it('destroy unsubscribes map listeners and clears markups', () => {
    const { manager, map, features } = createManager()
    const feature = createFeature()
    features.set('roi-1', feature)
    manager.create({ feature, value: '1.00 μm' })

    manager.destroy()

    expect(unByKey).toHaveBeenCalled()
    expect(map.removeLayer).toHaveBeenCalled()
    expect(manager.has('roi-1')).toBe(false)
    expect(manager.create({ feature, value: 'x' })).toBeUndefined()
  })
})
