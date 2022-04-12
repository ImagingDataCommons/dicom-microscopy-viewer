import webWorkerManager from './webWorker/webWorkerManager.js'

function processDecodeAndTrasformTask(
  frame,
  bitsAllocated,
  pixelRepresentation,
  columns,
  rows,
  samplesPerPixel,
  sopInstanceUID,
  ICCProfiles
) {
  const priority = undefined;
  const transferList = undefined;

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
      ICCProfiles
    },
    priority,
    transferList,
  ).promise;
}

async function decodeAndTransformFrame({
  frame,
  bitsAllocated,
  pixelRepresentation,
  columns,
  rows,
  samplesPerPixel,
  sopInstanceUID,
  ICCProfiles
}) {
  const result = await processDecodeAndTrasformTask(
    frame,
    bitsAllocated,
    pixelRepresentation,
    columns,
    rows,
    samplesPerPixel,
    sopInstanceUID,
    ICCProfiles);
    
  const signed = pixelRepresentation === 1
  let pixelArray
  let bitsPerSample
  switch (bitsAllocated) {
    case 1:
      pixelArray = dcmjs.data.BitArray.unpack(result.pixelData) // Uint8Array
      bitsPerSample = 8 // unpacked to 8-bit
      break
    case 8:
      if (signed) {
        pixelArray = new Int8Array(result.pixelData)
      } else {
        pixelArray = new Uint8Array(result.pixelData)
      }
      bitsPerSample = 8
      break
    case 16:
      if (pixelRepresentation === 1) {
        pixelArray = new Int16Array(
          result.pixelData.buffer,
          result.pixelData.byteOffset,
          result.pixelData.byteLength / 2
        )
      } else {
        pixelArray = new Uint16Array(
          result.pixelData.buffer,
          result.pixelData.byteOffset,
          result.pixelData.byteLength / 2
        )
      }
      bitsPerSample = 16
      break
    case 32:
      pixelArray = new Float32Array(
        result.pixelData.buffer,
        result.pixelData.byteOffset,
        result.pixelData.byteLength / 4
      )
      bitsPerSample = 32
      break
    case 64:
      pixelArray = new Float64Array(
        result.pixelData.buffer,
        result.pixelData.byteOffset,
        result.pixelData.byteLength / 8
      )
      bitsPerSample = 64
      break
    default:
      throw new Error(
        'The pixel bit depth ' + bitsAllocated +
        ' is not supported by the rendering.'
      );
    }
  return pixelArray; 
}

export {
  decodeAndTransformFrame
}
