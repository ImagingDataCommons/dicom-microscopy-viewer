/**
 * Shared progressive prefix-emission machinery for the bulk coordinate
 * streaming routes in `stream.js` (dicomweb-client Range, raw fetch Range,
 * and full GET).
 *
 * Each route owns its payload byte buffer; this helper tracks which
 * annotations are fully present (via the 1-based `graphicIndex`), throttles
 * `onPrefix` callbacks by bytes and by annotation count, and validates at end
 * of stream that the received bytes can actually contain every annotation the
 * index promises (throwing on shortfall so callers run their fallback path
 * instead of silently reporting a truncated group as complete).
 */

/**
 * @typedef {Int32Array | Float32Array} StreamableBulkGraphicArray
 */

/**
 * @typedef {object} BulkPrefixInfo
 * @property {StreamableBulkGraphicArray} graphicData - Element-aligned view of the coordinate prefix decoded so far
 * @property {number} completeThroughIndex - Inclusive index of the last annotation fully present in `graphicData` (-1 if none)
 * @property {number} availableElementCount - Coordinate elements available in `graphicData`
 * @property {number} loadedBytes - Total bytes received from the network so far (whole response, incl. envelope)
 * @property {number|null} totalBytes - `Content-Length` of the whole response if the server provided it
 * @property {boolean} done - True on the final callback, when `graphicData` is the complete buffer
 */

function debugLog(message, details) {
  console.debug(`[bulkAnnotations] ${message}`, details)
}

async function yieldToBrowser() {
  await new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
  await new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'function') {
      resolve()
      return
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

/**
 * Throw when a finished buffer is shorter than what `graphicIndex` requires,
 * so callers fall back instead of reporting a truncated group as complete.
 *
 * @param {object} options
 * @param {number} options.finalElementCount
 * @param {Int32Array} options.graphicIndex
 * @param {number} options.numberOfAnnotations
 * @param {string} options.route
 */
export function assertBulkStreamElementCount(options) {
  const { finalElementCount, graphicIndex, numberOfAnnotations, route } =
    options
  if (numberOfAnnotations <= 0 || graphicIndex.length < numberOfAnnotations) {
    return
  }
  const requiredMinElements = Number(graphicIndex[numberOfAnnotations - 1])
  if (
    !Number.isFinite(requiredMinElements) ||
    finalElementCount >= requiredMinElements
  ) {
    return
  }
  let completeAnnotations = 0
  for (let i = 0; i + 1 < numberOfAnnotations; i++) {
    if (Number(graphicIndex[i + 1]) - 1 <= finalElementCount) {
      completeAnnotations = i + 1
    } else {
      break
    }
  }
  console.warn(
    `[bulkAnnotations] bulk coordinate stream ended short: got ${finalElementCount} elements but graphicIndex requires at least ${requiredMinElements}; only ~${completeAnnotations}/${numberOfAnnotations} annotations are complete (route ${route}). Falling back instead of reporting a truncated group as complete.`,
  )
  throw new Error(
    `bulk stream truncated (route ${route}): ${finalElementCount} elements < ${requiredMinElements} required by graphicIndex`,
  )
}

/**
 * @typedef {object} BulkPrefixEmitter
 * @property {(done: boolean) => Promise<void>} drain - Emit throttled prefixes for annotations that became fully available since the last call. Pass `done: true` when the route believes the transfer has ended (mirrors the pre-refactor per-route drain semantics).
 * @property {(finalElementCount: number, opts?: {finalDrainDone?: boolean}) => Promise<StreamableBulkGraphicArray>} finish - End-of-stream: validate completeness against `graphicIndex`, run a final drain, emit the last `done` prefix if needed, and return the final element-aligned view of the payload buffer. Throws when the payload ended short of what the last `graphicIndex` entry implies, so the caller's fallback (full GET / monolithic DMV retrieve) runs instead of silently dropping annotations.
 * @property {() => void} resetByteBaseline - Reset the byte-throttle baseline. Call after restarting the payload buffer from offset 0 (e.g. a server ignored Range mid-stream and the route replaced the buffer with the full response body).
 */

/**
 * @param {object} options
 * @param {'int32'|'float32'} options.kind
 * @param {number} options.elementByteSize
 * @param {Int32Array} options.graphicIndex
 * @param {number} options.numberOfAnnotations
 * @param {number} options.prefixThrottleBytes
 * @param {number} options.prefixEmitAnnotationStep
 * @param {(info: BulkPrefixInfo) => void|Promise<void>} [options.onPrefix]
 * @param {() => ArrayBuffer} options.getPayloadBuffer - Current payload buffer (may be reallocated as the route grows it)
 * @param {() => number} options.getPayloadLength - Valid payload bytes currently in the buffer
 * @param {() => number} options.getLoadedBytes - Total network bytes received so far
 * @param {() => number|null} options.getTotalBytes - `Content-Length`-style total when the route knows it, else `null`
 * @param {number} [options.trailingGuardBytes] - Bytes at the end of the payload that may still belong to a multipart trailer
 * @param {string} options.route - Route label for debug logging
 * @returns {BulkPrefixEmitter}
 */
export function createBulkPrefixEmitter(options) {
  const {
    kind,
    elementByteSize,
    graphicIndex,
    numberOfAnnotations,
    prefixThrottleBytes,
    prefixEmitAnnotationStep,
    onPrefix,
    getPayloadBuffer,
    getPayloadLength,
    getLoadedBytes,
    getTotalBytes,
    route,
  } = options
  const trailingGuardBytes = options.trailingGuardBytes ?? 0

  let completeThroughIndex = -1
  let lastPrefixPayloadLen = 0
  let lastPrefixEmittedThrough = -1

  const makeView = (elementCount) =>
    kind === 'int32'
      ? new Int32Array(getPayloadBuffer(), 0, elementCount)
      : new Float32Array(getPayloadBuffer(), 0, elementCount)

  const elementsAvailable = () => {
    const usable = Math.max(0, getPayloadLength() - trailingGuardBytes)
    return Math.floor(usable / elementByteSize)
  }

  const advanceCompleteThrough = (availableElements, done) => {
    const n = numberOfAnnotations
    let i = completeThroughIndex
    while (i + 1 < n) {
      const next = i + 1
      const endElement =
        next + 1 < n
          ? Number(graphicIndex[next + 1]) - 1
          : done
            ? availableElements
            : Number.POSITIVE_INFINITY
      if (endElement <= availableElements) {
        i = next
      } else {
        break
      }
    }
    completeThroughIndex = i
    return i
  }

  const emitPrefixNow = async (done) => {
    if (onPrefix == null) {
      return
    }
    const availableElements = elementsAvailable()
    const throughIndex = advanceCompleteThrough(availableElements, done)
    if (!done && throughIndex < 0 && availableElements === 0) {
      return
    }
    const emitThrough = done
      ? throughIndex
      : Math.min(
          throughIndex,
          lastPrefixEmittedThrough + prefixEmitAnnotationStep,
        )
    if (!done && emitThrough <= lastPrefixEmittedThrough) {
      return
    }
    lastPrefixPayloadLen = getPayloadLength()
    const loadedBytes = getLoadedBytes()
    await onPrefix({
      graphicData: makeView(availableElements),
      completeThroughIndex: emitThrough,
      availableElementCount: availableElements,
      loadedBytes,
      totalBytes: getTotalBytes(),
      done,
    })
    lastPrefixEmittedThrough = Math.max(lastPrefixEmittedThrough, emitThrough)
    debugLog('bulkStream:progressive prefix', {
      route,
      annotationsThrough: emitThrough + 1,
      numberOfAnnotations,
      loadedMiB: Math.round((loadedBytes / (1024 * 1024)) * 10) / 10,
      done,
    })
    await yieldToBrowser()
  }

  const drain = async (done) => {
    if (onPrefix == null) {
      return
    }
    for (;;) {
      const availableElements = elementsAvailable()
      const beforeThrough = completeThroughIndex
      advanceCompleteThrough(availableElements, done)
      const byteDelta = getPayloadLength() - lastPrefixPayloadLen
      const firstAnnotationReady =
        lastPrefixEmittedThrough < 0 && completeThroughIndex >= 0
      const annotationsReady =
        completeThroughIndex - lastPrefixEmittedThrough >=
        prefixEmitAnnotationStep
      const shouldEmit =
        done ||
        firstAnnotationReady ||
        byteDelta >= prefixThrottleBytes ||
        annotationsReady
      if (!shouldEmit) {
        break
      }
      const emittedThroughBefore = lastPrefixEmittedThrough
      await emitPrefixNow(done)
      if (lastPrefixEmittedThrough === emittedThroughBefore) {
        break
      }
      if (
        !done &&
        completeThroughIndex === beforeThrough &&
        byteDelta < prefixThrottleBytes
      ) {
        break
      }
      if (done || lastPrefixEmittedThrough >= completeThroughIndex) {
        break
      }
    }
  }

  const finish = async (finalElementCount, opts) => {
    assertBulkStreamElementCount({
      finalElementCount,
      graphicIndex,
      numberOfAnnotations,
      route,
    })
    completeThroughIndex = numberOfAnnotations - 1
    await drain(opts?.finalDrainDone ?? true)
    const finalView = makeView(finalElementCount)
    if (onPrefix != null && lastPrefixEmittedThrough < completeThroughIndex) {
      await onPrefix({
        graphicData: finalView,
        completeThroughIndex,
        availableElementCount: finalElementCount,
        loadedBytes: getLoadedBytes(),
        totalBytes: getTotalBytes() ?? getLoadedBytes(),
        done: true,
      })
      lastPrefixEmittedThrough = completeThroughIndex
      await yieldToBrowser()
    }
    return finalView
  }

  return {
    drain,
    finish,
    resetByteBaseline: () => {
      lastPrefixPayloadLen = 0
    },
  }
}
