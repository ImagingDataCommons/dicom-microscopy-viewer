/**
 * Performance monitoring utility for tracking annotation processing performance
 *
 * @private
 */

class PerformanceMonitor {
  constructor () {
    this.metrics = new Map()
    this.enabled = typeof window !== 'undefined' && window.performance && window.performance.mark
  }

  /**
   * Start timing an operation
   * @param {string} name - Operation name
   * @returns {void}
   */
  start (name) {
    if (!this.enabled) {
      return
    }

    const startTime = performance.now()
    this.metrics.set(name, { startTime, endTime: null, duration: null })

    if (performance.mark) {
      performance.mark(`${name}-start`)
    }
  }

  /**
   * End timing an operation
   * @param {string} name - Operation name
   * @returns {number|null} Duration in milliseconds
   */
  end (name) {
    if (!this.enabled) {
      return null
    }

    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`)
      return null
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    if (performance.mark) {
      performance.mark(`${name}-end`)
      try {
        performance.measure(name, `${name}-start`, `${name}-end`)
      } catch (e) {
        // Ignore if measure already exists
      }
    }

    return duration
  }

  /**
   * Get duration for an operation
   * @param {string} name - Operation name
   * @returns {number|null} Duration in milliseconds
   */
  getDuration (name) {
    const metric = this.metrics.get(name)
    return metric ? metric.duration : null
  }

  /**
   * Get all metrics
   * @returns {Map} Map of all metrics
   */
  getAllMetrics () {
    return new Map(this.metrics)
  }

  /**
   * Clear all metrics
   * @returns {void}
   */
  clear () {
    this.metrics.clear()
  }

  /**
   * Log performance summary
   * @param {string} [prefix=''] - Prefix for log messages
   * @returns {void}
   */
  logSummary (prefix = '') {
    if (!this.enabled || this.metrics.size === 0) {
      return
    }

    console.group(`${prefix}Performance Summary`)
    this.metrics.forEach((metric, name) => {
      if (metric.duration !== null) {
        console.log(`${name}: ${metric.duration.toFixed(2)}ms`)
      }
    })
    console.groupEnd()
  }

  /**
   * Get performance entries from Performance API
   * @param {string} [name] - Optional filter by name
   * @returns {Array} Performance entries
   */
  getPerformanceEntries (name) {
    if (!this.enabled || !performance.getEntriesByName) {
      return []
    }

    if (name) {
      return performance.getEntriesByName(name)
    }

    return performance.getEntriesByType('measure')
  }
}

// Singleton instance
let monitorInstance = null

/**
 * Get the global performance monitor instance
 * @returns {PerformanceMonitor} Monitor instance
 */
export function getPerformanceMonitor () {
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor()
  }
  return monitorInstance
}

export default PerformanceMonitor
