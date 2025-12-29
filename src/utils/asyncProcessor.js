/**
 * Utility for processing large datasets in chunks to avoid blocking the main thread
 *
 * @private
 */

/**
 * Process items in chunks with yielding to event loop
 *
 * @param {Array} items - Array of items to process
 * @param {function} processor - Function to process each item: (item, index) => result
 * @param {Object} options - Processing options
 * @param {number} [options.chunkSize=100] - Number of items to process per chunk
 * @param {number} [options.yieldInterval=0] - Milliseconds to yield between chunks (0 = use requestIdleCallback)
 * @param {function} [options.onProgress] - Progress callback: (processed, total) => void
 * @param {function} [options.onChunkComplete] - Called after each chunk: (results, startIndex, endIndex) => void
 * @returns {Promise<Array>} Promise that resolves with all processed results
 */
export function processInChunks (items, processor, options = {}) {
  const {
    chunkSize = 100,
    yieldInterval = 0,
    onProgress,
    onChunkComplete
  } = options

  return new Promise((resolve, reject) => {
    const results = []
    let currentIndex = 0
    const total = items.length

    if (total === 0) {
      resolve(results)
      return
    }

    function processChunk () {
      try {
        const endIndex = Math.min(currentIndex + chunkSize, total)
        const chunkResults = []

        for (let i = currentIndex; i < endIndex; i++) {
          const result = processor(items[i], i)
          if (result !== undefined) {
            chunkResults.push(result)
            results.push(result)
          }
        }

        if (onChunkComplete) {
          onChunkComplete(chunkResults, currentIndex, endIndex)
        }

        currentIndex = endIndex

        if (onProgress) {
          onProgress(currentIndex, total)
        }

        if (currentIndex >= total) {
          resolve(results)
          return
        }

        // Yield to event loop
        if (yieldInterval > 0) {
          setTimeout(processChunk, yieldInterval)
        } else if (typeof window !== 'undefined' && typeof window.requestIdleCallback !== 'undefined') {
          window.requestIdleCallback(processChunk, { timeout: 50 })
        } else {
          // Fallback to setTimeout if requestIdleCallback is not available
          setTimeout(processChunk, 0)
        }
      } catch (error) {
        reject(error)
      }
    }

    // Start processing
    if (yieldInterval > 0) {
      setTimeout(processChunk, 0)
    } else if (typeof window !== 'undefined' && typeof window.requestIdleCallback !== 'undefined') {
      window.requestIdleCallback(processChunk, { timeout: 50 })
    } else {
      setTimeout(processChunk, 0)
    }
  })
}

/**
 * Process items with a delay between each item to avoid blocking
 *
 * @param {Array} items - Array of items to process
 * @param {function} processor - Function to process each item: (item, index) => result
 * @param {Object} options - Processing options
 * @param {number} [options.delay=0] - Milliseconds to delay between items
 * @param {function} [options.onProgress] - Progress callback: (processed, total) => void
 * @returns {Promise<Array>} Promise that resolves with all processed results
 */
export function processWithDelay (items, processor, options = {}) {
  const { delay = 0, onProgress } = options

  return new Promise((resolve, reject) => {
    const results = []
    let currentIndex = 0
    const total = items.length

    if (total === 0) {
      resolve(results)
      return
    }

    function processNext () {
      try {
        if (currentIndex >= total) {
          resolve(results)
          return
        }

        const result = processor(items[currentIndex], currentIndex)
        if (result !== undefined) {
          results.push(result)
        }

        currentIndex++

        if (onProgress) {
          onProgress(currentIndex, total)
        }

        if (currentIndex < total) {
          if (delay > 0) {
            setTimeout(processNext, delay)
          } else {
            // Use requestAnimationFrame for minimal delay
            if (typeof window !== 'undefined' && typeof window.requestAnimationFrame !== 'undefined') {
              window.requestAnimationFrame(processNext)
            } else {
              setTimeout(processNext, 0)
            }
          }
        } else {
          resolve(results)
        }
      } catch (error) {
        reject(error)
      }
    }

    processNext()
  })
}

/**
 * Batch add items to a collection with debouncing
 *
 * @param {Array} items - Items to add
 * @param {function} addFunction - Function to add items: (items) => void
 * @param {Object} options - Options
 * @param {number} [options.batchSize=100] - Number of items per batch
 * @param {number} [options.debounceMs=16] - Debounce delay in milliseconds
 * @returns {Promise<void>} Promise that resolves when all items are added
 */
export function batchAdd (items, addFunction, options = {}) {
  const { batchSize = 100, debounceMs = 16 } = options

  return new Promise((resolve) => {
    let currentIndex = 0
    const total = items.length
    let timeoutId = null

    function addBatch () {
      if (currentIndex >= total) {
        resolve()
        return
      }

      const endIndex = Math.min(currentIndex + batchSize, total)
      const batch = items.slice(currentIndex, endIndex)

      addFunction(batch)

      currentIndex = endIndex

      if (currentIndex < total) {
        timeoutId = setTimeout(addBatch, debounceMs)
      } else {
        resolve()
      }
    }

    addBatch()

    // Return a cancel function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  })
}
