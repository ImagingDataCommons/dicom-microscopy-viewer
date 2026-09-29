/**
 * Performance profiler for bulk annotation operations.
 *
 * Usage:
 *   import { profiler } from './profiler.js'
 *   profiler.enable()
 *   // ... do operations ...
 *   profiler.report()
 */

class BulkAnnotationProfiler {
  constructor() {
    this._enabled = false
    this._metrics = new Map()
    this._activeTimers = new Map()
  }

  /** Enable profiling and clear any existing metrics. */
  enable() {
    this._enabled = true
    this._metrics.clear()
    console.info('[BulkAnn Profiler] Enabled')
  }

  /** Disable profiling (metrics are preserved until `clear()` or `enable()`). */
  disable() {
    this._enabled = false
    console.info('[BulkAnn Profiler] Disabled')
  }

  /** @returns {boolean} Whether profiling is currently enabled. */
  isEnabled() {
    return this._enabled
  }

  /**
   * Start timing an operation.
   * @param {string} name - Operation name (e.g., 'rebuildLayers', 'styleChange')
   * @param {string} [id] - Optional unique ID for concurrent operations
   */
  start(name, id = 'default') {
    if (!this._enabled) return
    const key = `${name}:${id}`
    this._activeTimers.set(key, {
      name,
      id,
      startTime: performance.now(),
      startMemory: this._getHeapUsed(),
    })
  }

  /**
   * End timing an operation and record the result.
   * @param {string} name - Operation name
   * @param {string} [id] - Optional unique ID
   * @param {object} [extra] - Extra data to record
   */
  end(name, id = 'default', extra = {}) {
    if (!this._enabled) return
    const key = `${name}:${id}`
    const timer = this._activeTimers.get(key)
    if (!timer) return

    const endTime = performance.now()
    const endMemory = this._getHeapUsed()
    const duration = endTime - timer.startTime
    const memoryDelta = endMemory - timer.startMemory

    this._activeTimers.delete(key)

    if (!this._metrics.has(name)) {
      this._metrics.set(name, [])
    }
    this._metrics.get(name).push({
      duration,
      memoryDelta,
      timestamp: Date.now(),
      ...extra,
    })

    console.debug(
      `[BulkAnn Profiler] ${name}: ${duration.toFixed(2)}ms, ` +
        `mem: ${this._formatBytes(memoryDelta)}`,
      extra,
    )
  }

  /**
   * Record a single metric without timing.
   * @param {string} name - Metric name
   * @param {*} value - Value to record
   * @param {object} [extra] - Extra data to attach
   */
  record(name, value, extra = {}) {
    if (!this._enabled) return
    if (!this._metrics.has(name)) {
      this._metrics.set(name, [])
    }
    this._metrics.get(name).push({
      value,
      timestamp: Date.now(),
      ...extra,
    })
  }

  /**
   * Get current heap usage (if available).
   * Note: performance.memory is Chrome-only and non-standard.
   * Returns 0 in other browsers.
   */
  _getHeapUsed() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize
    }
    return 0
  }

  /**
   * Format a byte count as a human-readable string.
   * @param {number} bytes - Byte count (positive or negative)
   * @returns {string} Formatted string with sign and unit
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const sign = bytes < 0 ? '-' : '+'
    const abs = Math.abs(bytes)
    if (abs < 1024) return `${sign}${abs} B`
    if (abs < 1024 * 1024) return `${sign}${(abs / 1024).toFixed(1)} KB`
    return `${sign}${(abs / 1024 / 1024).toFixed(2)} MB`
  }

  /**
   * Generate a summary report.
   */
  report() {
    if (!this._enabled) {
      console.warn('[BulkAnn Profiler] Not enabled')
      return null
    }

    const summary = {}
    for (const [name, samples] of this._metrics) {
      const durations = samples
        .filter((s) => s.duration != null)
        .map((s) => s.duration)
      const memoryDeltas = samples
        .filter((s) => s.memoryDelta != null)
        .map((s) => s.memoryDelta)

      summary[name] = {
        count: samples.length,
        duration:
          durations.length > 0
            ? {
                min: Math.min(...durations).toFixed(2),
                max: Math.max(...durations).toFixed(2),
                avg: (
                  durations.reduce((a, b) => a + b, 0) / durations.length
                ).toFixed(2),
                total: durations.reduce((a, b) => a + b, 0).toFixed(2),
              }
            : null,
        memory:
          memoryDeltas.length > 0
            ? {
                min: this._formatBytes(Math.min(...memoryDeltas)),
                max: this._formatBytes(Math.max(...memoryDeltas)),
                total: this._formatBytes(
                  memoryDeltas.reduce((a, b) => a + b, 0),
                ),
              }
            : null,
        samples,
      }
    }

    console.info('[BulkAnn Profiler] Report:', summary)
    return summary
  }

  /**
   * Clear all recorded metrics.
   */
  clear() {
    this._metrics.clear()
    this._activeTimers.clear()
  }

  /**
   * Export metrics as JSON for analysis.
   */
  exportJSON() {
    const report = this.report()
    return JSON.stringify(report, null, 2)
  }
}

/** Singleton profiler instance. */
export const profiler = new BulkAnnotationProfiler()

/** Expose on window for console access. */
if (typeof window !== 'undefined') {
  window.__bulkAnnProfiler = profiler

  // Auto-enable if URL has ?bulkAnnProfile=1 or ?profile=1
  try {
    const urlParams = new URLSearchParams(window.location.search)
    if (
      urlParams.get('bulkAnnProfile') === '1' ||
      urlParams.get('profile') === '1'
    ) {
      profiler.enable()
      console.info('[BulkAnn Profiler] Auto-enabled via URL parameter')
    }
  } catch {
    // Ignore URL parsing errors
  }
}
