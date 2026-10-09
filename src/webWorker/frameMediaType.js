const JPEG_XL_CONTAINER_SIGNATURE = [
  0x00, 0x00, 0x00, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a,
]

/**
 * Whether a frame is a JPEG XL code stream (starts with FF 0A) or a JPEG XL
 * container (starts with the "JXL " signature box).
 *
 * @param {Uint8Array} byteArray - Image array
 * @returns {boolean}
 */
function isJPEGXL(byteArray) {
  if (byteArray[0] === 0xff && byteArray[1] === 0x0a) {
    return true
  }
  return (
    byteArray.length >= JPEG_XL_CONTAINER_SIGNATURE.length &&
    JPEG_XL_CONTAINER_SIGNATURE.every((value, i) => byteArray[i] === value)
  )
}

/**
 * Whether a frame is a High-Throughput JPEG 2000 code stream. The code stream
 * starts with SOC (FF 4F) and SIZ (FF 51), and only HTJ2K has a CAP (FF 50)
 * marker segment in the main header, before the first SOT (FF 90).
 *
 * @param {Uint8Array} byteArray - Image array
 * @returns {boolean}
 */
function isHTJ2K(byteArray) {
  if (
    byteArray[0] !== 0xff ||
    byteArray[1] !== 0x4f ||
    byteArray[2] !== 0xff ||
    byteArray[3] !== 0x51
  ) {
    return false
  }
  let offset = 2
  while (offset + 4 <= byteArray.length && byteArray[offset] === 0xff) {
    const marker = byteArray[offset + 1]
    if (marker === 0x50) {
      return true
    }
    if (marker === 0x90 || marker === 0x93) {
      return false
    }
    const length = (byteArray[offset + 2] << 8) | byteArray[offset + 3]
    offset += 2 + length
  }
  return false
}

export { isHTJ2K, isJPEGXL }
