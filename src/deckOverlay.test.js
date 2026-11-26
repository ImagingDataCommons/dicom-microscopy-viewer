import { DECK_SOURCE_ORDER, SharedDeckOverlay } from './deckOverlay.js'

function createOverlay() {
  return new SharedDeckOverlay({ getMap: () => null })
}

describe('SharedDeckOverlay', () => {
  it('draws derived data under annotations', () => {
    expect(DECK_SOURCE_ORDER.segmentations).toBeLessThan(
      DECK_SOURCE_ORDER.annotations,
    )
    expect(DECK_SOURCE_ORDER.parametricMaps).toBeLessThan(
      DECK_SOURCE_ORDER.annotations,
    )
  })

  it('collects the layers of all sources, lowest order first', () => {
    const overlay = createOverlay()
    overlay.addLayerSource('annotations', {
      order: DECK_SOURCE_ORDER.annotations,
      getLayers: () => ['annotation'],
    })
    overlay.addLayerSource('segmentations', {
      order: DECK_SOURCE_ORDER.segmentations,
      getLayers: (frameState) => [`segment@${frameState.id}`],
    })
    expect(overlay.collectLayers({ id: 7 })).toEqual([
      'segment@7',
      'annotation',
    ])
    overlay.removeLayerSource('segmentations')
    expect(overlay.collectLayers({ id: 8 })).toEqual(['annotation'])
  })

  it('keeps drawing the other sources when one fails', () => {
    const overlay = createOverlay()
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})
    overlay.addLayerSource('broken', {
      order: 1,
      getLayers: () => {
        throw new Error('boom')
      },
    })
    overlay.addLayerSource('ok', { order: 2, getLayers: () => ['layer'] })
    expect(overlay.collectLayers({})).toEqual(['layer'])
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('hands the device to callbacks registered before and after it exists', () => {
    const overlay = createOverlay()
    const early = jest.fn()
    overlay.onDeviceInitialized(early)
    expect(early).not.toHaveBeenCalled()
    const device = { info: { gpu: 'apple' } }
    /** What the Deck's onDeviceInitialized does */
    overlay.device = device
    for (const callback of overlay._deviceCallbacks) callback(device)
    expect(early).toHaveBeenCalledWith(device)
    const late = jest.fn()
    overlay.onDeviceInitialized(late)
    expect(late).toHaveBeenCalledWith(device)
  })
})
