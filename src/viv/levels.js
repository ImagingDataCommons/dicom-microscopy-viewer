/**
 * Whether a number is a positive power of 2.
 *
 * @private
 */
const _isPowerOf2 = (value) =>
  Number.isInteger(value) && value > 0 && (value & (value - 1)) === 0

/**
 * Plan the pyramid levels of a Viv multiscale image.
 *
 * Viv expects the levels from highest to lowest resolution, each exactly half
 * the size of the previous one (rounded up), with one square power-of-2 tile
 * size for all levels. DICOM pyramids often step by other factors (e.g. 4).
 * Starting from the highest resolution level, each next level is the
 * existing DICOM level of the expected size (within 1 pixel) and tile size,
 * or otherwise a synthetic level that is computed from the previous one.
 * Planning stops at the first level that fits in one tile, or after
 * `maxSyntheticLevels` consecutive synthetic levels, which bounds the
 * number of tiles a synthetic tile is computed from (4 ^ maxSyntheticLevels).
 *
 * @param {Object[]} levels - Levels of a VolumeImageReader (lowest resolution first)
 * @param {number} maxSyntheticLevels - Maximum number of consecutive synthetic levels
 * @returns {Object} `tileSize` and `levels`, highest resolution first. Each
 * level has `width`, `height`, `pixelSpacing` (row and column spacing in
 * millimeter) and either `readerLevel` (index of the DICOM level) or
 * `isSynthetic`.
 * @private
 */
const _planDyadicLevels = (levels, maxSyntheticLevels) => {
  const finest = levels[levels.length - 1]
  const tileSize = finest.tileColumns
  if (finest.tileRows !== tileSize || !_isPowerOf2(tileSize)) {
    throw new Error(
      'Viv requires square tiles with a power-of-2 size, but the tiles of the ' +
        `highest resolution level are ${finest.tileColumns} x ` +
        `${finest.tileRows} pixels.`,
    )
  }
  const candidates = levels.filter(
    (level) =>
      level !== finest &&
      level.tileColumns === tileSize &&
      level.tileRows === tileSize,
  )
  const planned = [
    {
      readerLevel: finest.index,
      width: finest.totalPixelMatrixColumns,
      height: finest.totalPixelMatrixRows,
      pixelSpacing: finest.pixelSpacing.slice(0),
    },
  ]
  let syntheticRun = 0
  for (;;) {
    const previous = planned[planned.length - 1]
    if (previous.width <= tileSize && previous.height <= tileSize) {
      break
    }
    const width = Math.ceil(previous.width / 2)
    const height = Math.ceil(previous.height / 2)
    const existing = candidates.find(
      (level) =>
        Math.abs(level.totalPixelMatrixColumns - width) <= 1 &&
        Math.abs(level.totalPixelMatrixRows - height) <= 1,
    )
    if (existing !== undefined) {
      planned.push({
        readerLevel: existing.index,
        width: existing.totalPixelMatrixColumns,
        height: existing.totalPixelMatrixRows,
        pixelSpacing: existing.pixelSpacing.slice(0),
      })
      syntheticRun = 0
      continue
    }
    if (syntheticRun >= maxSyntheticLevels) {
      break
    }
    planned.push({
      isSynthetic: true,
      width,
      height,
      pixelSpacing: [
        (previous.pixelSpacing[0] * previous.height) / height,
        (previous.pixelSpacing[1] * previous.width) / width,
      ],
    })
    syntheticRun += 1
  }
  return { tileSize, levels: planned }
}

export { _planDyadicLevels }
