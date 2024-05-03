import Enums from '../../enums'
import { _getUnitSuffix } from '../../utils'
import {
  _getFeatureArea,
  _getFeatureLength
} from '../../scoord3dUtils.js'

/**
 * Format measure output.
 *
 * @param {Feature} feature feature
 * @param {string} units units
 *
 * @return {string} The formatted measure of this feature
 *
 * @private
 */
export const _format = (feature, units, pyramid, affine) => {
  const area = _getFeatureArea(feature, pyramid, affine)
  const length = _getFeatureLength(feature, pyramid, affine)
  const value = length || area || 0
  return length
    ? `${value.toFixed(2)} ${units}`
    : `${value.toFixed(2)} ${units}²`
}

/**
 * Checks if feature has measurement markup properties.
 *
 * @param {object} feature
 *
 * @returns {boolean} true if feature has measurement markup properties
 *
 * @private
 */
const _isMeasurement = (feature) =>
  Enums.Markup.Measurement === feature.get(Enums.InternalProperties.Markup)

/**
 * Measurement markup definition.
 *
 * @param {object} dependencies - Shared dependencies
 * @param {object} dependencies.map - Viewer's map instance
 * @param {object} dependencies.pyramid - Pyramid metadata
 * @param {number[][]} dependencies.affine - 3x3 affine transformation matrix
 * @param {object} dependencies.markupManager - MarkupManager shared instance
 *
 * @private
 */
const MeasurementMarkup = ({ map, pyramid, affine, markupManager }) => {
  return {
    onAdd: (feature) => {
      if (_isMeasurement(feature)) {
        const view = map.getView()
        const unitSuffix = _getUnitSuffix(view)
        markupManager.create({
          feature,
          value: _format(feature, unitSuffix, pyramid, affine)
        })
      }
    },
    onFailure: (uid) => {
      if (uid) {
        markupManager.remove(uid)
      }
    },
    onRemove: (feature) => {
      const featureId = feature.getId()
      markupManager.remove(featureId)
    },
    onDrawStart: ({ feature }) => {
      if (_isMeasurement(feature)) {
        const view = map.getView()
        const unitSuffix = _getUnitSuffix(view)
        markupManager.create({
          feature,
          value: _format(feature, unitSuffix, pyramid, affine)
        })
      }
    },
    onUpdate: (feature) => {},
    onDrawEnd: ({ feature }) => {},
    onDrawAbort: ({ feature }) => {}
  }
}

export default MeasurementMarkup
