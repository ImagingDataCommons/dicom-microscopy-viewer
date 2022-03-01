import Enums from '../../enums'
import { getUnitSuffix } from '../../utils'
import {
  _getFeatureArea,
  _getFeatureLength
} from '../../scoord3dUtils.js'

/**
 * Format measure output.
 *
 * @param {Feature} feature feature
 * @param {string} units units
 * @return {string} The formatted measure of this feature
 */
export const format = (feature, units, pyramid) => {
  const area = _getFeatureArea(feature, pyramid)
  const length = _getFeatureLength(feature, pyramid)
  const value = length || area || 0
  return length
    ? `${value.toFixed(2)} ${units}`
    : `${value.toFixed(2)} ${units}²`
}

/**
 * Checks if feature has measurement markup properties.
 *
 * @param {object} feature
 * @returns {boolean} true if feature has measurement markup properties
 */
const _isMeasurement = (feature) =>
  Enums.Markup.Measurement === feature.get(Enums.InternalProperties.Markup)

/**
 * Measurement markup definition.
 *
 * @param {object} dependencies Shared dependencies
 * @param {object} dependencies.map Viewer's map instance
 * @param {object} dependencies.pyramid Pyramid metadata
 * @param {object} dependencies.markupManager MarkupManager shared instance
 */
const MeasurementMarkup = ({ map, pyramid, markupManager }) => {
  return {
    onAdd: (feature) => {
      if (_isMeasurement(feature)) {
        const view = map.getView()
        const unitSuffix = getUnitSuffix(view)
        markupManager.create({
          feature,
          value: format(feature, unitSuffix, pyramid)
        })
      }
    },
    onFailure: (uid) => {
      if (uid) {
        markupManager.remove(uid)
      }
    },
    onRemove: (feature) => {
      if (_isMeasurement(feature)) {
        const featureId = feature.getId()
        markupManager.remove(featureId)
      }
    },
    onDrawStart: ({ feature }) => {
      if (_isMeasurement(feature)) {
        markupManager.create({ feature })
      }
    },
    onUpdate: (feature) => {
      const view = map.getView()
      const unitSuffix = getUnitSuffix(view)
      const id = feature.getId()
      const markup = markupManager.get(id)
      markupManager.update({
        feature,
        value: format(feature, unitSuffix, pyramid),
        coordinate: markup.overlay.getPosition()
      })
    },
    onDrawEnd: ({ feature }) => {},
    onDrawAbort: ({ feature }) => {}
  }
}

export default MeasurementMarkup
