/**
 * Downsample four neighboring tiles of one level by a factor of 2 into one
 * tile of the next level.
 *
 * Each output pixel is the mean of the 2 x 2 input pixels it covers. Only
 * pixels inside the image are used, so pixels at the right and bottom
 * border are not blended with padding.
 *
 * @param {Object} options - Options
 * @param {Array<Object|undefined>} options.quadrants - Top left, top right,
 * bottom left and bottom right input tiles (`data`, `width`, `height`),
 * `undefined` where the input level has no tile
 * @param {number} options.tileSize - Tile size of the input level
 * @param {number} options.samplesPerPixel - Interleaved samples per pixel
 * @param {number} options.width - Width of the output tile
 * @param {number} options.height - Height of the output tile
 * @param {Function} options.ArrayType - TypedArray constructor of the output
 * @returns {TypedArray} Output pixels
 * @private
 */
const _downsampleQuadrants = ({
  quadrants,
  tileSize,
  samplesPerPixel,
  width,
  height,
  ArrayType,
}) => {
  const roundValues = ArrayType !== Float32Array && ArrayType !== Float64Array
  const output = new ArrayType(width * height * samplesPerPixel)
  const sums = new Float64Array(samplesPerPixel)
  for (let outputRow = 0; outputRow < height; outputRow++) {
    for (let outputColumn = 0; outputColumn < width; outputColumn++) {
      sums.fill(0)
      let count = 0
      for (let dy = 0; dy < 2; dy++) {
        const blockRow = 2 * outputRow + dy
        const quadrantRow = blockRow >= tileSize ? 1 : 0
        const row = blockRow - quadrantRow * tileSize
        for (let dx = 0; dx < 2; dx++) {
          const blockColumn = 2 * outputColumn + dx
          const quadrantColumn = blockColumn >= tileSize ? 1 : 0
          const column = blockColumn - quadrantColumn * tileSize
          const quadrant = quadrants[quadrantRow * 2 + quadrantColumn]
          if (
            quadrant === undefined ||
            column >= quadrant.width ||
            row >= quadrant.height
          ) {
            continue
          }
          const offset = (row * quadrant.width + column) * samplesPerPixel
          for (let sample = 0; sample < samplesPerPixel; sample++) {
            sums[sample] += quadrant.data[offset + sample]
          }
          count += 1
        }
      }
      if (count === 0) {
        continue
      }
      const offset = (outputRow * width + outputColumn) * samplesPerPixel
      for (let sample = 0; sample < samplesPerPixel; sample++) {
        const mean = sums[sample] / count
        output[offset + sample] = roundValues ? Math.round(mean) : mean
      }
    }
  }
  return output
}

export { _downsampleQuadrants }
