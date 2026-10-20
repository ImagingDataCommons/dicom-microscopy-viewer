import dcmjs from 'dcmjs'
import webWorkerManager from './webWorker/webWorkerManager.js'

/**
 * Fields the worker ColorTransformer needs per pyramid level. Avoids
 * structured-cloning full SOP instances (often with huge PFGS) on every tile.
 *
 * @param {object[]} metadata
 * @returns {object[]}
 */
function _slimMetadataForWorker(metadata) {
  if (!Array.isArray(metadata)) {
    return metadata
  }
  return metadata.map((item) => ({
    SOPInstanceUID: item?.SOPInstanceUID,
    Columns: item?.Columns,
    Rows: item?.Rows,
    BitsAllocated: item?.BitsAllocated,
    SamplesPerPixel: item?.SamplesPerPixel,
    PlanarConfiguration: item?.PlanarConfiguration,
  }))
}

/**
 * Transferable buffer for the compressed frame, when the caller uniquely owns
 * the whole ArrayBuffer. Skip views into pooled/shared buffers (byteOffset or
 * partial length) — transferring those would detach unrelated data.
 *
 * @param {ArrayBuffer|TypedArray|*} frame
 * @returns {Transferable[]|undefined}
 */
function _frameTransferList(frame) {
  if (frame instanceof ArrayBuffer) {
    return [frame]
  }
  if (
    ArrayBuffer.isView(frame) &&
    frame.buffer instanceof ArrayBuffer &&
    frame.byteOffset === 0 &&
    frame.byteLength === frame.buffer.byteLength
  ) {
    return [frame.buffer]
  }
  return undefined
}

function _processDecodeAndTransformTask(
  frame,
  bitsAllocated,
  pixelRepresentation,
  columns,
  rows,
  samplesPerPixel,
  sopInstanceUID,
  metadata,
  iccProfiles,
  iccOutputType = 'srgb', // "srgb" or "display-p3"
) {
  const priority = undefined
  const transferList = _frameTransferList(frame)

  return webWorkerManager.addTask(
    'decodeAndTransformTask',
    {
      frame,
      bitsAllocated,
      pixelRepresentation,
      columns,
      rows,
      samplesPerPixel,
      sopInstanceUID,
      metadata: _slimMetadataForWorker(metadata),
      iccProfiles,
      iccOutputType,
    },
    priority,
    transferList,
  ).promise
}

async function _decodeAndTransformFrame({
  frame,
  bitsAllocated,
  pixelRepresentation,
  columns,
  rows,
  samplesPerPixel,
  sopInstanceUID,
  metadata, // metadata of all images (different resolution levels)
  iccProfiles, // ICC profiles for all images
  iccOutputType = 'srgb', // "srgb" or "display-p3"
}) {
  const result = await _processDecodeAndTransformTask(
    frame,
    bitsAllocated,
    pixelRepresentation,
    columns,
    rows,
    samplesPerPixel,
    sopInstanceUID,
    metadata,
    iccProfiles,
    iccOutputType,
  )

  const signed = pixelRepresentation === 1
  const byteArray = new Uint8Array(result.frameData)
  let pixelArray
  switch (bitsAllocated) {
    case 1:
      pixelArray = dcmjs.data.BitArray.unpack(result.frameData) // Uint8Array
      break
    case 8:
      if (signed) {
        pixelArray = new Int8Array(result.frameData)
      } else {
        pixelArray = byteArray
      }
      break
    case 16:
      if (signed) {
        pixelArray = new Int16Array(
          byteArray.buffer,
          byteArray.byteOffset,
          byteArray.byteLength / 2,
        )
      } else {
        pixelArray = new Uint16Array(
          byteArray.buffer,
          byteArray.byteOffset,
          byteArray.byteLength / 2,
        )
      }
      break
    case 32:
      pixelArray = new Float32Array(
        byteArray.buffer,
        byteArray.byteOffset,
        byteArray.byteLength / 4,
      )
      break
    case 64:
      pixelArray = new Float64Array(
        byteArray.buffer,
        byteArray.byteOffset,
        byteArray.byteLength / 8,
      )
      break
    default:
      throw new Error(
        'The pixel bit depth ' +
          bitsAllocated +
          ' is not supported by the decoder.',
      )
  }
  return pixelArray
}

export { _decodeAndTransformFrame, _frameTransferList, _slimMetadataForWorker }
