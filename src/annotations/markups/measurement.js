import Enums from '../../enums'
import { _getFeatureArea, _getFeatureLength } from '../../scoord3dUtils.js'
import {
  _convertAreaFromMm,
  _convertLengthFromMm,
  _getUnitSuffix,
} from '../../utils'

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
  if (length) {
    const value = _convertLengthFromMm(length, units)
    return `${value.toFixed(2)} ${units}`
  }
  if (area) {
    const value = _convertAreaFromMm(area, units)
    return `${value.toFixed(2)} ${units}²`
  }
  return `0.00 ${units}`
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
 * @param {Function} [dependencies.getMeasurementUnit] - Preferred unit getter
 *
 * @private
 */
const MeasurementMarkup = ({
  map,
  pyramid,
  affine,
  markupManager,
  getMeasurementUnit,
}) => {
  const resolveUnit = () =>
    _getUnitSuffix(map.getView(), getMeasurementUnit?.())

  return {
    onAdd: (feature) => {
      if (_isMeasurement(feature)) {
        const unitSuffix = resolveUnit()
        markupManager.create({
          feature,
          value: _format(feature, unitSuffix, pyramid, affine),
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
        const unitSuffix = resolveUnit()
        markupManager.create({
          feature,
          value: _format(feature, unitSuffix, pyramid, affine),
        })
      }
    },
    onUpdate: (_feature) => {},
    onDrawEnd: ({ feature: _feature }) => {},
    onDrawAbort: ({ feature: _feature }) => {},
  }
}

export default MeasurementMarkup
