/**
 * Web worker task for computing annotation statistics (min/max values)
 * This moves expensive statistics computation off the main thread.
 *
 * @private
 */

/**
 * Task handler function for computing measurement statistics
 *
 * @param {object} data - Handler data
 * @param {Array} data.data.measurements - Array of measurement objects with values arrays
 * @param {function} doneCallback - Handler done callback
 *
 * @private
 */
function _handler (data, doneCallback) {
  const { measurements } = data.data

  if (!measurements || !Array.isArray(measurements)) {
    doneCallback({
      error: 'Invalid measurements data provided'
    })
    return
  }

  const properties = {}

  measurements.forEach((measurementItem, measurementIndex) => {
    if (!measurementItem || !measurementItem.values || !Array.isArray(measurementItem.values)) {
      return
    }

    const values = measurementItem.values

    if (values.length === 0) {
      properties[`measurementValue${measurementIndex.toString()}`] = {
        min: undefined,
        max: undefined
      }
      return
    }

    /*
     * Compute minimum and maximum values.
     * Ideally, we would compute quantiles, but that is an expensive
     * operation. For now, just compute minimum and maximum.
     */
    let min = Infinity
    let max = -Infinity

    for (let i = 0; i < values.length; i++) {
      const value = values[i]
      if (value != null && typeof value === 'number' && !isNaN(value)) {
        if (value < min) {
          min = value
        }
        if (value > max) {
          max = value
        }
      }
    }

    const key = `measurementValue${measurementIndex.toString()}`
    properties[key] = {
      min: min === Infinity ? undefined : min,
      max: max === -Infinity ? undefined : max
    }
  })

  doneCallback({ properties })
}

export default {
  taskType: 'annotationStatisticsTask',
  _handler
}
