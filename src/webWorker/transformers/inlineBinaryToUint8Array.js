export const b64toUint8Array = (b64Data, sliceSize = 512) => {
  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  // Concatenate all Uint8Array parts into a single Uint8Array
  const totalLength = byteArrays.reduce((sum, arr) => sum + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of byteArrays) {
    result.set(arr, offset)
    offset += arr.length
  }

  return result
}

/**
 * Converts a value from various DICOMweb type data sources into a
 * Uint8Array if possible.
 */
export const inlineBinaryToUint8Array = (value) => {
  if (value instanceof Uint8Array) {
    return value
  }
  if (value.Value?.[0] instanceof Uint8Array) {
    return value.Value[0]
  }
  if (value.Value instanceof Uint8Array) {
    return value.Value
  }
  if (value.InlineBinary) {
    value.Value = [b64toUint8Array(value.InlineBinary)]
    return value.Value[0]
  }
}
