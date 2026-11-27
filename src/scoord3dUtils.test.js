import Feature from 'ol/Feature'
import Circle from 'ol/geom/Circle'
import LineString from 'ol/geom/LineString'
import Polygon from 'ol/geom/Polygon'

import { _format } from './annotations/markups/measurement'
import { _getFeatureArea, _getFeatureLength } from './scoord3dUtils'
import { buildTransform } from './utils'

describe('scoord3dUtils measurements', () => {
  /** 0.5 μm/px (0.0005 mm/px) slide matching standard 20x WSI metadata */
  const spacing = [0.0005, 0.0005]
  const affine = buildTransform({
    offset: [0, 0],
    orientation: [1, 0, 0, 0, 1, 0],
    spacing,
  })
  const pyramid = [{}]

  it('returns line length in millimeters and formats mm and μm labels', () => {
    /** 200 px at 0.0005 mm/px = 0.1 mm = 100 μm */
    const feature = new Feature({
      geometry: new LineString([
        [0.5, -1.5],
        [200.5, -1.5],
      ]),
    })

    expect(_getFeatureLength(feature, pyramid, affine)).toBeCloseTo(0.1, 6)
    expect(_format(feature, 'mm', pyramid, affine)).toBe('0.10 mm')
    expect(_format(feature, 'μm', pyramid, affine)).toBe('100.00 μm')
  })

  it('returns polygon area in square millimeters and formats mm² and μm² labels', () => {
    /** 200 x 200 px square at 0.0005 mm/px = 0.01 mm² = 10000 μm² */
    const feature = new Feature({
      geometry: new Polygon([
        [
          [0.5, -1.5],
          [200.5, -1.5],
          [200.5, -201.5],
          [0.5, -201.5],
          [0.5, -1.5],
        ],
      ]),
    })

    expect(_getFeatureArea(feature, pyramid, affine)).toBeCloseTo(0.01, 6)
    expect(_format(feature, 'mm', pyramid, affine)).toBe('0.01 mm²')
    expect(_format(feature, 'μm', pyramid, affine)).toBe('10000.00 μm²')
  })

  it('returns circle area in square millimeters', () => {
    /** Radius 200 px at 0.0005 mm/px = 0.1 mm -> area ≈ π * 0.01 mm² */
    const feature = new Feature({
      geometry: new Circle([200, -201], 200),
    })

    const area = _getFeatureArea(feature, pyramid, affine)
    expect(area).toBeCloseTo(Math.PI * 0.01, 3)
  })
})
