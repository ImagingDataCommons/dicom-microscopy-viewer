import _MarkupManager from './_MarkupManager'

import Enums from '../../enums'

jest.mock('ol/source/Vector')
jest.mock('ol/geom/LineString')
jest.mock('ol/Collection', () =>
  jest.fn(() => ({ getArray: jest.fn(() => []), push: jest.fn() }))
)

const mockedMarkup = {
  id: 123,
  isDraggable: true,
  isLinkable: true
}

describe('_MarkupManager', () => {
  let _markupManager, map, featureProperties, geometry, feature

  beforeAll(() => {
    geometry = {
      on: jest.fn(),
      getExtent: jest.fn(() => []),
      getCoordinates: jest.fn(() => []),
      getLastCoordinate: jest.fn(() => []),
      getClosestPoint: jest.fn(() => [])
    }
    featureProperties = {}
    feature = {
      on: jest.fn(),
      getGeometry: jest.fn(() => geometry),
      getId: jest.fn(() => 123),
      getProperties: jest.fn(),
      set: jest.fn(),
      get: jest.fn()
    }
    map = {
      addOverlay: jest.fn(),
      addLayer: jest.fn(),
      getInteractions: jest.fn(() => []),
      on: jest.fn()
    }
    _markupManager = new _MarkupManager({ map })
  })

  it('initializes properly', () => {
    _markupManager = new _MarkupManager({ map })
    expect(_markupManager).toBeInstanceOf(_MarkupManager)
  })

  it('creates markups, wire events and draws link', () => {
    const markupsSetMock = jest.spyOn(_markupManager._markups, 'set')
    const drawLinkSpy = jest.spyOn(_markupManager, '_drawLink')
    const wireInternalEventsSpy = jest.spyOn(
      _markupManager,
      '_wireInternalEvents'
    )
    const result = _markupManager.create({
      feature,
      value: 'Testing',
      isLinkable: true,
      isDraggable: true,
      offset: [7, 7]
    })
    expect(map.addOverlay).toHaveBeenCalled()
    expect(markupsSetMock).toHaveBeenCalled()
    expect(wireInternalEventsSpy).toHaveBeenCalledWith(feature)
    expect(drawLinkSpy).toHaveBeenCalledWith(feature)
    expect(result).toEqual(expect.objectContaining(mockedMarkup))
  })

  it('wire correct events for feature', () => {
    const markup = { element: { addEventListener: jest.fn() } }
    const getSpy = jest.spyOn(_markupManager, 'get')
    getSpy.mockImplementationOnce(jest.fn(() => markup))
    _markupManager._wireInternalEvents(feature)
    expect(geometry.on.mock.calls[0][0]).toBe(
      Enums.FeatureGeometryEvents.CHANGE
    )
    expect(feature.on.mock.calls[0][0]).toBe(
      Enums.FeatureEvents.PROPERTY_CHANGE
    )
    expect(markup.element.addEventListener.mock.calls[0][0]).toBe(
      Enums.HTMLElementEvents.MOUSE_DOWN
    )
    expect(map.on.mock.calls[0][0]).toBe(Enums.MapEvents.POINTER_MOVE)
    expect(map.on.mock.calls[1][0]).toBe(Enums.MapEvents.POINTER_UP)
  })

  it('removes a markup', () => {})
})
