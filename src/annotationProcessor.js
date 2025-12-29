/**
 * AnnotationProcessor class for handling annotation processing operations
 * Separates annotation processing concerns from the main viewer class
 *
 * @private
 */

import {
  getFeaturesFromBulkAnnotations,
  getFeaturesFromBulkAnnotationsAsync
} from './bulkAnnotations/utils'
import webWorkerManager from './webWorker/webWorkerManager.js'
import { getAnnotationProcessingQueue } from './utils/annotationProcessingQueue'
import { _fetchGraphicData, _fetchGraphicIndex } from './annotation.js'
import { getCachedBulkAnnotations, cacheBulkAnnotations } from './bulkAnnotations/cache'

class AnnotationProcessor {
  constructor (options = {}) {
    this.errorInterceptor = options.errorInterceptor || ((error) => console.error(error))
    this.onProgress = options.onProgress || (() => {})
    this.queue = getAnnotationProcessingQueue()
  }

  /**
   * Process bulk annotations with async chunked processing
   * @param {Object} params - Processing parameters
   * @returns {Promise<Array>} Promise that resolves with processed features
   */
  async processBulkAnnotations (params) {
    const {
      graphicType,
      graphicData,
      graphicIndex,
      measurements,
      commonZCoordinate,
      coordinateDimensionality,
      numberOfAnnotations,
      annotationGroupUID,
      annotationGroup,
      metadataItem,
      pyramid,
      affine,
      affineInverse,
      view,
      featureFunction,
      isHighResolution,
      setProperties,
      addFeatures
    } = params

    // Compute statistics in web worker if measurements exist
    if (measurements && measurements.length > 0) {
      await this._computeStatistics(measurements, annotationGroupUID, setProperties)
    }

    // Determine chunk size and processing mode
    const chunkSize = numberOfAnnotations > 5000 ? 100 : numberOfAnnotations > 1000 ? 200 : 500
    const useAsync = numberOfAnnotations > 500

    if (useAsync) {
      return await this._processAsync({
        graphicType,
        graphicData,
        graphicIndex,
        measurements,
        commonZCoordinate,
        coordinateDimensionality,
        numberOfAnnotations,
        annotationGroupUID,
        annotationGroup,
        pyramid,
        affine,
        affineInverse,
        view,
        featureFunction,
        isHighResolution,
        chunkSize,
        addFeatures
      })
    } else {
      return this._processSync({
        graphicType,
        graphicData,
        graphicIndex,
        measurements,
        commonZCoordinate,
        coordinateDimensionality,
        numberOfAnnotations,
        annotationGroupUID,
        annotationGroup,
        metadataItem,
        pyramid,
        affine,
        affineInverse,
        view,
        featureFunction,
        isHighResolution,
        addFeatures
      })
    }
  }

  /**
   * Compute statistics using web worker
   * @private
   */
  async _computeStatistics (measurements, annotationGroupUID, setProperties) {
    console.info(
      'compute statistics for measurement values ' +
      `of annotation group "${annotationGroupUID}" (using web worker)`
    )

    try {
      const statsTask = webWorkerManager.addTask(
        'annotationStatisticsTask',
        { measurements },
        0 // Normal priority
      )

      const statsResult = await statsTask.promise
      if (statsResult && statsResult.properties) {
        setProperties(statsResult.properties, true)
      } else {
        console.warn('Failed to compute statistics in web worker, falling back to synchronous computation')
        this._computeStatisticsSync(measurements, setProperties)
      }
    } catch (error) {
      console.error('Error computing statistics in web worker:', error)
      this._computeStatisticsSync(measurements, setProperties)
    }
  }

  /**
   * Compute statistics synchronously (fallback)
   * @private
   */
  _computeStatisticsSync (measurements, setProperties) {
    const properties = {}
    measurements.forEach((measurementItem, measurementIndex) => {
      const min = measurementItem.values.reduce(
        (a, b) => Math.min(a, b),
        Infinity
      )
      const max = measurementItem.values.reduce(
        (a, b) => Math.max(a, b),
        -Infinity
      )
      const key = `measurementValue${measurementIndex.toString()}`
      properties[key] = { min, max }
    })
    setProperties(properties, true)
  }

  /**
   * Process annotations asynchronously with chunked processing
   * @private
   */
  async _processAsync (params) {
    const {
      graphicType,
      graphicData,
      graphicIndex,
      measurements,
      commonZCoordinate,
      coordinateDimensionality,
      numberOfAnnotations,
      annotationGroupUID,
      annotationGroup,
      pyramid,
      affine,
      affineInverse,
      view,
      featureFunction,
      isHighResolution,
      chunkSize,
      addFeatures
    } = params

    console.info(
      `processing ${numberOfAnnotations} annotations asynchronously ` +
      `(chunk size: ${chunkSize})`
    )

    // Track pending features for debounced addition
    let pendingFeatures = []
    let addFeaturesTimeout = null

    const features = await getFeaturesFromBulkAnnotationsAsync({
      graphicType,
      graphicData,
      graphicIndex,
      measurements,
      commonZCoordinate,
      coordinateDimensionality,
      numberOfAnnotations,
      annotationGroupUID,
      annotationGroup,
      pyramid,
      affine,
      affineInverse,
      view,
      featureFunction,
      isHighResolution,
      chunkSize,
      onProgress: (processed, total) => {
        if (processed % (chunkSize * 5) === 0 || processed === total) {
          console.debug(`processed ${processed}/${total} annotations`)
        }
        this.onProgress(annotationGroupUID, processed, total, Math.round((processed / total) * 100))
      },
      onChunkComplete: (chunkFeatures) => {
        // Add features incrementally as chunks complete with debouncing
        if (chunkFeatures.length > 0) {
          if (!pendingFeatures) {
            pendingFeatures = []
          }
          if (addFeaturesTimeout) {
            clearTimeout(addFeaturesTimeout)
          }
          pendingFeatures.push(...chunkFeatures)
          // Debounce the actual addition to batch multiple chunks
          addFeaturesTimeout = setTimeout(() => {
            if (pendingFeatures && pendingFeatures.length > 0) {
              const featuresToAdd = pendingFeatures
              pendingFeatures = []
              addFeaturesTimeout = null
              addFeatures(featuresToAdd)
            }
          }, 16) // ~60fps debounce (16ms = ~60fps)
        }
      }
    })

    console.info(
      `add n=${features.length} annotations ` +
      `for annotation group "${annotationGroupUID}"`
    )

    return features
  }

  /**
   * Process annotations synchronously
   * @private
   */
  _processSync (params) {
    const {
      graphicType,
      graphicData,
      graphicIndex,
      measurements,
      commonZCoordinate,
      coordinateDimensionality,
      numberOfAnnotations,
      annotationGroupUID,
      annotationGroup,
      metadataItem,
      pyramid,
      affine,
      affineInverse,
      view,
      featureFunction,
      isHighResolution,
      addFeatures
    } = params

    console.info(
      `processing ${numberOfAnnotations} annotations synchronously`
    )

    const features = getFeaturesFromBulkAnnotations({
      graphicType,
      graphicData,
      graphicIndex,
      measurements,
      commonZCoordinate,
      coordinateDimensionality,
      numberOfAnnotations,
      annotationGroupUID,
      annotationGroup,
      metadataItem,
      pyramid,
      affine,
      affineInverse,
      view,
      featureFunction,
      isHighResolution
    })

    console.info(
      `add n=${features.length} annotations ` +
      `for annotation group "${annotationGroupUID}"`
    )

    addFeatures(features)
    return features
  }

  /**
   * Load and process bulk annotations
   * @param {Object} params - Loading parameters
   * @returns {Promise} Promise that resolves when processing completes
   */
  async loadBulkAnnotations (params) {
    const {
      annotationGroupUID,
      metadata,
      annotationGroupIndex,
      metadataItem,
      bulkdataItem,
      client,
      success,
      failure
    } = params

    // Check cache first
    const cachedBulkAnnotations = getCachedBulkAnnotations(annotationGroupUID)
    if (cachedBulkAnnotations) {
      console.info('use cached bulk annotations')
      return this.queue.addTask({
        id: `process-cached-${annotationGroupUID}`,
        priority: 1, // Higher priority for cached data
        processor: async () => {
          return await this.processBulkAnnotations({
            ...params,
            retrievedBulkdata: cachedBulkAnnotations
          })
        },
        retries: 0,
        onError: (error) => {
          console.error('Failed to process cached bulk annotations', error)
          this.errorInterceptor(error)
          failure()
        }
      }).then(() => {
        success()
      }).catch(() => {
        failure()
      })
    }

    // Fetch and process
    return this.queue.addTask({
      id: `fetch-and-process-${annotationGroupUID}`,
      priority: 0,
      processor: async () => {
        // Fetch data with retry logic
        const fetchWithRetry = async (fetchFn, maxRetries = 2) => {
          let lastError
          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              return await fetchFn()
            } catch (error) {
              lastError = error
              if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
                console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error)
                await new Promise(resolve => setTimeout(resolve, delay))
              }
            }
          }
          throw lastError
        }

        // Fetch data
        const [graphicData, graphicIndex] = await Promise.all([
          fetchWithRetry(() => _fetchGraphicData({ metadata, annotationGroupIndex, metadataItem, bulkdataItem, client })),
          fetchWithRetry(() => _fetchGraphicIndex({ metadata, annotationGroupIndex, metadataItem, bulkdataItem, client }))
        ])

        const retrievedBulkdata = [graphicData, graphicIndex, []] // measurements placeholder

        console.info('retrieve and cache bulk annotations')
        cacheBulkAnnotations(annotationGroupUID, retrievedBulkdata)

        // Process the fetched data
        return await this.processBulkAnnotations({
          ...params,
          retrievedBulkdata
        })
      },
      retries: 1,
      onError: (error) => {
        console.error('Failed to retrieve and process bulk annotations', error)
        this.errorInterceptor(error)
        failure()
      }
    }).then(() => {
      success()
    }).catch(() => {
      failure()
    })
  }
}

export default AnnotationProcessor
