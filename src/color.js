import colormap from 'colormap'

const ColorMapNames = {
  VIRIDIS: 'VIRIDIS',
  INFERNO: 'INFERNO',
  MAGMA: 'MAGMA',
  BLUE: 'BLUE',
  RED: 'RED',
  BLUE_RED: 'BLUE_RED'
}

/** Create a color map.
 *
 * @param {object} options
 * @param {string} options.name - Name of the color map
 * @param {string} options.bins - Number of color bins
 *
 * @returns {number[][]} RGB triplet for each color
 */
function createColorMap ({ name, bins }) {
  const lut = {
    INFERNO: ['inferno', false],
    MAGMA: ['magma', false],
    VIRIDIS: ['viridis', false],
    BLUE: ['freesurface-blue', true],
    RED: ['freesurface-red', true],
    BLUE_RED: ['RdBu', false]
  }
  const params = lut[name]
  if (params === undefined) {
    throw new Error(`Unknown colormap "${name}".`)
  }

  const internalName = params[0]
  const reverse = params[1]
  const colors = colormap({
    colormap: internalName,
    nshades: bins,
    format: 'rgb'
  })
  if (reverse) {
    return colors.reverse()
  }
  return colors
}

/** Create a color table.
 *
 * @param {object} options
 * @param {number[][]} options.colormap - RGB triplet for each color
 * @param {number} options.min - Mininum value of the input data range
 * @param {number} options.max - Maximum value of the input data range
 *
 * @returns {number[][]} Interleaved values of the input data and RGB color triplets
 */
function createColorTable ({ colormap, min, max }) {
  const steps = colormap.length
  const delta = (max - min) / (steps - 1)
  const table = new Array(steps * 2)
  for (let i = 0; i < steps; i++) {
    table[i * 2] = min + i * delta
    table[i * 2 + 1] = colormap[i]
  }
  return table
}

export { ColorMapNames, createColorMap, createColorTable }
