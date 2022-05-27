import webWorkerManager from './webWorker/webWorkerManager.js'
import dcmjs from 'dcmjs'

function _processDecodeAndTrasformTask (
  frame,
  bitsAllocated,
  pixelRepresentation,
  columns,
  rows,
  samplesPerPixel,
  sopInstanceUID,
  iccProfiles
) {
  const priority = undefined
  const transferList = undefined

  return webWorkerManager.addTask(
    'decodeAndTrasformTask',
    {
      frame,
      bitsAllocated,
      pixelRepresentation,
      columns,
      rows,
      samplesPerPixel,
      sopInstanceUID,
      iccProfiles
    },
    priority,
    transferList
  ).promise
}

async function _decodeAndTransformFrame ({
  frame,
  bitsAllocated,
  pixelRepresentation,
  columns,
  rows,
  samplesPerPixel,
  sopInstanceUID,
  metadata, // metadata of all images (different resolution levels)
  iccProfiles // ICC profiles for all images
}) {
  const result = await _processDecodeAndTrasformTask(
    frame,
    bitsAllocated,
    pixelRepresentation,
    columns,
    rows,
    samplesPerPixel,
    sopInstanceUID,
    metadata,
    iccProfiles
  )

  const signed = pixelRepresentation === 1
  let pixelArray
  switch (bitsAllocated) {
    case 1:
      pixelArray = dcmjs.data.BitArray.unpack(result.frameData) // Uint8Array
      break
    case 8:
      if (signed) {
        pixelArray = new Int8Array(result.frameData)
      } else {
        pixelArray = new Uint8Array(result.frameData)
      }
      break
    case 16:
      if (signed) {
        pixelArray = new Int16Array(
          result.frameData.buffer,
          result.frameData.byteOffset,
          result.frameData.byteLength / 2
        )
      } else {
        pixelArray = new Uint16Array(
          result.frameData.buffer,
          result.frameData.byteOffset,
          result.frameData.byteLength / 2
        )
      }
      break
    case 32:
      pixelArray = new Float32Array(
        result.frameData.buffer,
        result.frameData.byteOffset,
        result.frameData.byteLength / 4
      )
      break
    case 64:
      pixelArray = new Float64Array(
        result.frameData.buffer,
        result.frameData.byteOffset,
        result.frameData.byteLength / 8
      )
      break
    default:
      throw new Error(
        'The pixel bit depth ' + bitsAllocated +
        ' is not supported by the decoder.'
      )
  }
  return pixelArray
}

export {
  _decodeAndTransformFrame
}
