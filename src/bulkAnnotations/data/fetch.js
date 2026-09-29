/**
 * Fetch entry points for bulk annotation group data used by the deck.gl
 * bulk-annotation rewrite.
 *
 * `fetchGraphicDataForGroup` prefers the progressive streaming path
 * (`stream.js`) when a group is eligible, and transparently falls back to
 * the classic monolithic `dmv.annotation.fetchGraphicData` otherwise, so
 * behaviour never regresses for groups/servers that don't support it.
 *
 * `annotation.js` is imported as a namespace (rather than named imports) so
 * this module degrades gracefully — e.g. `fetchMeasurementsForGroup` returns
 * an empty array instead of throwing — if a given export ever moves or is
 * renamed there.
 */

import * as annotationModule from '../../annotation.js'
import {
  browserSupportsBulkStreaming,
  getStreamableBulkVrInfo,
  isMonotonicGraphicIndex,
  resolveStreamableGraphicDataReference,
  streamBulkGraphicData,
} from './stream.js'

const fetchGraphicData =
  annotationModule.fetchGraphicData ?? annotationModule._fetchGraphicData
const fetchGraphicIndex =
  annotationModule.fetchGraphicIndex ?? annotationModule._fetchGraphicIndex
const fetchMeasurements = annotationModule._fetchMeasurements

/**
 * Build a `retrieveBulkData` adapter around a DICOMweb client for the
 * streaming Range-retrieve path, or `undefined` when the client doesn't
 * support it (streaming then falls back to raw `fetch` + Range / full GET).
 *
 * @param {object} [client]
 * @returns {import('./stream.js').BulkDataRangeRetriever|undefined}
 */
function toRangeRetriever(client) {
  if (client == null || typeof client.retrieveBulkData !== 'function') {
    return undefined
  }
  return (retrieveOptions) => client.retrieveBulkData(retrieveOptions)
}

/**
 * Fetch the coordinate (graphic) data for an annotation group, preferring the
 * progressive streaming path when the group is eligible, and transparently
 * falling back to the classic monolithic `fetchGraphicData` otherwise.
 *
 * Streaming eligibility requires: a `BulkDataURI` reference (not inline
 * metadata), a streamable 4-byte VR (OF/OL), a `graphicIndex` that has
 * already been fetched and is monotonically non-decreasing, and browser
 * support for `fetch` + `ReadableStream` + `AbortController`.
 *
 * @param {object} options
 * @param {object} options.metadata - MicroscopyBulkSimpleAnnotations metadata
 * @param {number} options.annotationGroupIndex - Zero-based index into Annotation Group Sequence
 * @param {object} options.metadataItem - Metadata of Annotation Group Sequence item
 * @param {object} [options.bulkdataItem] - Bulkdata of Annotation Group Sequence item
 * @param {object} options.client - DICOMweb client
 * @param {Int32Array} [options.graphicIndex] - Already-fetched graphicIndex (1-based offsets); required to stream
 * @param {number} [options.numberOfAnnotations] - Total number of annotations in the group; required to stream
 * @param {(info: import('./stream.js').BulkPrefixInfo) => void|Promise<void>} [options.onPrefix] - Progressive prefix callback
 * @param {(loadedBytes: number, totalBytes: number|null) => void} [options.onProgress] - Network progress callback
 * @param {AbortSignal} [options.signal] - Abort signal
 * @param {string} [options.baseUrl] - Base URL used to resolve a relative BulkDataURI
 * @param {Record<string, string>} [options.headers] - Extra headers for the raw fetch fallback routes
 * @returns {Promise<Int32Array|Float32Array|Float64Array>} Flat coordinate buffer
 */
export async function fetchGraphicDataForGroup(options) {
  const {
    metadata,
    annotationGroupIndex,
    metadataItem,
    bulkdataItem,
    client,
    graphicIndex,
    numberOfAnnotations,
    onPrefix,
    onProgress,
    signal,
    baseUrl,
    headers,
  } = options

  const canAttemptStreaming =
    graphicIndex != null &&
    numberOfAnnotations != null &&
    numberOfAnnotations > 0 &&
    browserSupportsBulkStreaming() &&
    isMonotonicGraphicIndex(graphicIndex, numberOfAnnotations)

  if (canAttemptStreaming) {
    const ref = resolveStreamableGraphicDataReference({
      metadataItem,
      bulkdataItem,
    })
    const vrInfo = ref?.vr != null ? getStreamableBulkVrInfo(ref.vr) : null
    if (ref?.BulkDataURI != null && vrInfo != null) {
      try {
        return await streamBulkGraphicData({
          url: ref.BulkDataURI,
          baseUrl,
          headers: headers ?? {},
          vr: ref.vr,
          graphicIndex,
          numberOfAnnotations,
          signal,
          retrieveBulkData: toRangeRetriever(client),
          onPrefix,
          onProgress,
        })
      } catch (error) {
        if (signal?.aborted === true) {
          throw error
        }
        console.warn(
          '[bulkAnnotations] streaming graphic data retrieve failed; falling back to monolithic fetch.',
          error,
        )
      }
    }
  }

  return await fetchGraphicData({
    metadataItem,
    bulkdataItem,
    annotationGroupIndex,
    metadata,
    client,
  })
}

/**
 * Fetch the graphic index (`LongPrimitivePointIndexList`) of an annotation
 * group. Thin wrapper around `fetchGraphicIndex` from `annotation.js`.
 *
 * @param {object} options
 * @param {object} options.metadataItem - Metadata of Annotation Group Sequence item
 * @param {object} [options.bulkdataItem] - Bulkdata of Annotation Group Sequence item
 * @param {object} options.metadata - MicroscopyBulkSimpleAnnotations metadata
 * @param {number} options.annotationGroupIndex - Zero-based index into Annotation Group Sequence
 * @param {object} options.client - DICOMweb client
 * @returns {Promise<Int32Array|null>} Graphic index, or `null` for graphic types that don't have one
 */
export async function fetchGraphicIndexForGroup({
  metadataItem,
  bulkdataItem,
  metadata,
  annotationGroupIndex,
  client,
}) {
  return await fetchGraphicIndex({
    metadataItem,
    bulkdataItem,
    metadata,
    annotationGroupIndex,
    client,
  })
}

/**
 * Fetch all measurements of an annotation group. Thin wrapper around
 * `_fetchMeasurements` from `annotation.js`; resolves to an empty array
 * instead of throwing if that export is ever unavailable, so a group without
 * measurements (or an unexpectedly renamed export) degrades gracefully.
 *
 * @param {object} options
 * @param {object} options.metadataItem - Metadata of Annotation Group Sequence item
 * @param {object} [options.bulkdataItem] - Bulkdata of Annotation Group Sequence item
 * @param {object} [options.metadata] - MicroscopyBulkSimpleAnnotations metadata
 * @param {number} [options.annotationGroupIndex] - Zero-based index into Annotation Group Sequence
 * @param {object} options.client - DICOMweb client
 * @returns {Promise<Array<{name: object, unit: object, values: Array, indices: Array|null}>>} Measurements
 */
export async function fetchMeasurementsForGroup({
  metadataItem,
  bulkdataItem,
  metadata,
  annotationGroupIndex,
  client,
}) {
  if (typeof fetchMeasurements !== 'function') {
    console.warn(
      '[bulkAnnotations] "_fetchMeasurements" is not exported by annotation.js; returning no measurements.',
    )
    return []
  }
  return await fetchMeasurements({
    metadataItem,
    bulkdataItem,
    metadata,
    annotationGroupIndex,
    client,
  })
}
