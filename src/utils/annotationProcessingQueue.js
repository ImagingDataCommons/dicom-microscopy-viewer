/**
 * Queue-based async processing system for annotation operations
 * Supports priority scheduling, progress tracking, and cancellation
 *
 * @private
 */

class AnnotationProcessingQueue {
  constructor () {
    this.queue = []
    this.processing = false
    this.cancelled = false
    this.currentTask = null
  }

  /**
   * Add a task to the queue
   * @param {Object} task - Task object
   * @param {function} task.processor - Async function that processes the task
   * @param {number} [task.priority=0] - Priority (higher = processed first)
   * @param {string} [task.id] - Optional task ID for cancellation
   * @param {function} [task.onProgress] - Progress callback
   * @param {function} [task.onComplete] - Completion callback
   * @param {function} [task.onError] - Error callback
   * @returns {Promise} Promise that resolves when task completes
   */
  async addTask (task) {
    return new Promise((resolve, reject) => {
      const taskWithCallbacks = {
        ...task,
        priority: task.priority || 0,
        resolve,
        reject,
        addedAt: Date.now()
      }

      // Insert task in priority order (higher priority first)
      const insertIndex = this.queue.findIndex(t => t.priority < taskWithCallbacks.priority)
      if (insertIndex === -1) {
        this.queue.push(taskWithCallbacks)
      } else {
        this.queue.splice(insertIndex, 0, taskWithCallbacks)
      }

      // Start processing if not already running
      if (!this.processing) {
        this._processQueue()
      }
    })
  }

  /**
   * Cancel a task by ID
   * @param {string} taskId - Task ID to cancel
   */
  cancelTask (taskId) {
    const taskIndex = this.queue.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      const task = this.queue[taskIndex]
      this.queue.splice(taskIndex, 1)
      task.reject(new Error(`Task ${taskId} was cancelled`))
    }

    if (this.currentTask && this.currentTask.id === taskId) {
      this.cancelled = true
    }
  }

  /**
   * Cancel all pending tasks
   */
  cancelAll () {
    this.queue.forEach(task => {
      task.reject(new Error('All tasks were cancelled'))
    })
    this.queue = []
    this.cancelled = true
  }

  /**
   * Get queue status
   * @returns {Object} Status object with queue length and processing state
   */
  getStatus () {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      currentTask: this.currentTask ? this.currentTask.id : null
    }
  }

  /**
   * Process the queue
   * @private
   */
  async _processQueue () {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true
    this.cancelled = false

    while (this.queue.length > 0 && !this.cancelled) {
      const task = this.queue.shift()
      this.currentTask = task

      try {
        const result = await task.processor()
        if (task.onComplete) {
          task.onComplete(result)
        }
        task.resolve(result)
      } catch (error) {
        // Retry logic for transient errors
        if (task.retries !== undefined && task.retries > 0 && this._isRetryableError(error)) {
          task.retries--
          // Re-queue with lower priority
          task.priority = task.priority - 1
          const insertIndex = this.queue.findIndex(t => t.priority < task.priority)
          if (insertIndex === -1) {
            this.queue.push(task)
          } else {
            this.queue.splice(insertIndex, 0, task)
          }
          console.warn(`Retrying task ${task.id || 'unknown'}, ${task.retries} retries remaining`)
        } else {
          if (task.onError) {
            task.onError(error)
          }
          task.reject(error)
        }
      } finally {
        this.currentTask = null
      }

      // Yield to event loop between tasks
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    this.processing = false
  }

  /**
   * Check if an error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} True if error is retryable
   * @private
   */
  _isRetryableError (error) {
    // Network errors, timeouts, and 5xx server errors are retryable
    if (error.message && (
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT')
    )) {
      return true
    }
    // Check for HTTP status codes
    if (error.status && error.status >= 500) {
      return true
    }
    return false
  }
}

// Singleton instance
let queueInstance = null

/**
 * Get the global annotation processing queue instance
 * @returns {AnnotationProcessingQueue} Queue instance
 */
export function getAnnotationProcessingQueue () {
  if (!queueInstance) {
    queueInstance = new AnnotationProcessingQueue()
  }
  return queueInstance
}

export default AnnotationProcessingQueue
