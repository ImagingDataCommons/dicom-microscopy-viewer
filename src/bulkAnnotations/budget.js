/**
 * Per-frame draw budget for bulk annotations.
 *
 * deck.gl redraws every layer of a group on each frame the view changes.
 * On a GPU that is cheap even for half a million annotations, but a
 * software WebGL renderer (SwiftShader in headless browsers and CI, Mesa's
 * llvmpipe) rasterizes on the CPU: drawing 508k centroids took about 3 s per
 * frame and 1.3M path segments about 7 s, so a single zoom step took tens of
 * seconds. Under a software renderer the budget caps what one frame draws;
 * on a GPU it is unlimited and drawing is unchanged.
 */

import {
  BULK_SOFTWARE_MAX_PATH_VERTICES,
  BULK_SOFTWARE_MAX_POINTS,
} from './constants.js'

const SOFTWARE_RENDERER =
  /SwiftShader|llvmpipe|softpipe|Software Rasterizer|Basic Render Driver/i

/**
 * Whether a luma.gl device renders in software.
 *
 * @param {Object} [info] - `device.info` of a luma.gl device
 * @returns {boolean}
 */
export function isSoftwareRenderer(info) {
  if (info == null) {
    return false
  }
  if (info.gpu === 'software') {
    return true
  }
  return SOFTWARE_RENDERER.test(`${info.renderer ?? ''} ${info.vendor ?? ''}`)
}

/**
 * The draw budget of one frame.
 *
 * @param {boolean} isSoftware - Whether the renderer is a software one
 * @returns {{maxPoints: number, maxPathVertices: number}}
 */
export function getDrawBudget(isSoftware) {
  if (!isSoftware) {
    return { maxPoints: Infinity, maxPathVertices: Infinity }
  }
  return {
    maxPoints: BULK_SOFTWARE_MAX_POINTS,
    maxPathVertices: BULK_SOFTWARE_MAX_PATH_VERTICES,
  }
}

/**
 * Every how many annotations one is drawn so that at most `maxCount` are.
 *
 * @param {number} count
 * @param {number} maxCount
 * @returns {number} 1 when all fit
 */
export function decimationStride(count, maxCount) {
  if (!(maxCount > 0) || count <= maxCount) {
    return 1
  }
  return Math.ceil(count / maxCount)
}

/**
 * Every `stride`-th centroid, with its filter value when there is one.
 *
 * @param {Object} options
 * @param {Float32Array} options.centroids - Flat XY per annotation
 * @param {number} options.count - Number of annotations
 * @param {number} options.stride
 * @param {Float32Array} [options.filterValues] - Per annotation
 * @returns {{length: number, positions: Float32Array, filterValues: (Float32Array|undefined)}}
 */
export function decimateCentroids({ centroids, count, stride, filterValues }) {
  const length = Math.ceil(count / stride)
  const positions = new Float32Array(length * 2)
  const values = filterValues != null ? new Float32Array(length) : undefined
  for (let i = 0, j = 0; i < count; i += stride, j++) {
    positions[j * 2] = centroids[i * 2]
    positions[j * 2 + 1] = centroids[i * 2 + 1]
    if (values != null) {
      values[j] = filterValues[i]
    }
  }
  return { length, positions, filterValues: values }
}

/**
 * Number of path vertices of the given annotations.
 *
 * @param {Uint32Array|Int32Array|number[]} startIndices - Vertex offset per
 *   annotation, with the total vertex count as last entry
 * @param {Uint32Array|number[]} annotationIndices
 * @returns {number}
 */
export function countPathVertices(startIndices, annotationIndices) {
  let total = 0
  for (let i = 0; i < annotationIndices.length; i++) {
    const index = annotationIndices[i]
    total += startIndices[index + 1] - startIndices[index]
  }
  return total
}

/**
 * An extent grown by `fraction` of its size on every side, so a small pan
 * stays inside what was drawn.
 *
 * @param {number[]} extent - [minX, minY, maxX, maxY]
 * @param {number} fraction
 * @returns {number[]}
 */
export function padExtent(extent, fraction) {
  const dx = (extent[2] - extent[0]) * fraction
  const dy = (extent[3] - extent[1]) * fraction
  return [extent[0] - dx, extent[1] - dy, extent[2] + dx, extent[3] + dy]
}

/**
 * The annotations whose centroid lies in `extent`, when their paths fit the
 * vertex budget.
 *
 * @param {Object} options
 * @param {Float32Array} options.centroids - Flat XY per annotation
 * @param {Uint32Array|Int32Array|number[]} options.startIndices - Vertex
 *   offset per annotation, with the total vertex count as last entry
 * @param {Iterable<Uint32Array|number[]>} options.candidates - Annotation
 *   indices to test, e.g. those of the visible spatial tiles
 * @param {number[]} options.extent - [minX, minY, maxX, maxY]
 * @param {number} options.maxVertices
 * @returns {Uint32Array|null} `null` when the annotations in view have more
 *   vertices than the budget
 */
export function annotationsInExtent({
  centroids,
  startIndices,
  candidates,
  extent,
  maxVertices,
}) {
  const [minX, minY, maxX, maxY] = extent
  const indices = []
  let vertices = 0
  for (const tile of candidates) {
    for (let i = 0; i < tile.length; i++) {
      const index = tile[i]
      const x = centroids[index * 2]
      const y = centroids[index * 2 + 1]
      if (x < minX || x > maxX || y < minY || y > maxY) {
        continue
      }
      vertices += startIndices[index + 1] - startIndices[index]
      if (vertices > maxVertices) {
        return null
      }
      indices.push(index)
    }
  }
  return Uint32Array.from(indices)
}
