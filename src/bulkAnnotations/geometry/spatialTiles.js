/**
 * Morton-order spatial tiling of decoded bulk annotations.
 *
 * Annotations are bucketed into fixed-size world-space tiles so that
 * per-tile deck.gl layers can be toggled `visible` from the viewport
 * without re-uploading buffers (the GPU still pays the vertex-shader
 * cost for offscreen geometry, so tile-level visibility culling is
 * required, not optional).
 */

/**
 * Spread the bits of a 16-bit unsigned integer so each original bit `i`
 * ends up at bit position `2 * i`, leaving the interleaved positions
 * free for a second coordinate's bits.
 *
 * @param {number} v - Unsigned 16-bit integer
 * @returns {number} Bit-spread value
 * @private
 */
function spreadBits16(v) {
  let x = v & 0xffff
  x = (x | (x << 8)) & 0x00ff00ff
  x = (x | (x << 4)) & 0x0f0f0f0f
  x = (x | (x << 2)) & 0x33333333
  x = (x | (x << 1)) & 0x55555555
  return x
}

/**
 * Compute the 32-bit Morton (Z-order) code interleaving two 16-bit
 * unsigned integer coordinates.
 *
 * @param {number} x - Unsigned 16-bit tile X coordinate
 * @param {number} y - Unsigned 16-bit tile Y coordinate
 * @returns {number} Interleaved Morton code
 */
export function mortonCode(x, y) {
  return ((spreadBits16(y) << 1) | spreadBits16(x)) >>> 0
}

/**
 * Bucket annotations into fixed-size world-space tiles based on their
 * centroid, ordering tiles by Morton code for spatial locality.
 *
 * @param {Object} options
 * @param {Float32Array} options.centroids - Flat XY centroid buffer, length `numberOfAnnotations * 2`
 * @param {number} options.numberOfAnnotations - Number of annotations (N)
 * @param {number} options.tileSizeWorld - Tile edge length in world (OL map) units
 * @returns {{
 *   tileKeys: string[],
 *   tileAnnotationIndices: Map<string, Uint32Array>,
 *   tileBounds: Map<string, [number, number, number, number]>,
 * }}
 */
export function bucketAnnotations({
  centroids,
  numberOfAnnotations,
  tileSizeWorld,
}) {
  if (!(tileSizeWorld > 0)) {
    throw new Error('Option "tileSizeWorld" must be a positive number.')
  }

  const bucketsByKey = new Map()

  for (let i = 0; i < numberOfAnnotations; i++) {
    const x = centroids[i * 2]
    const y = centroids[i * 2 + 1]
    const tileX = Math.floor(x / tileSizeWorld)
    const tileY = Math.floor(y / tileSizeWorld)
    const key = `${tileX}:${tileY}`

    let bucket = bucketsByKey.get(key)
    if (bucket == null) {
      bucket = { tileX, tileY, indices: [] }
      bucketsByKey.set(key, bucket)
    }
    bucket.indices.push(i)
  }

  const tileEntries = Array.from(bucketsByKey.entries()).sort((a, b) => {
    const codeA = mortonCode(a[1].tileX & 0xffff, a[1].tileY & 0xffff)
    const codeB = mortonCode(b[1].tileX & 0xffff, b[1].tileY & 0xffff)
    return codeA - codeB
  })

  const tileKeys = []
  const tileAnnotationIndices = new Map()
  const tileBounds = new Map()

  for (const [key, bucket] of tileEntries) {
    tileKeys.push(key)
    tileAnnotationIndices.set(key, Uint32Array.from(bucket.indices))
    const minX = bucket.tileX * tileSizeWorld
    const minY = bucket.tileY * tileSizeWorld
    tileBounds.set(key, [
      minX,
      minY,
      minX + tileSizeWorld,
      minY + tileSizeWorld,
    ])
  }

  return { tileKeys, tileAnnotationIndices, tileBounds }
}

/**
 * Build a contiguous per-tile `{positions, startIndices}` pair by
 * copying only the vertex data of the given annotation indices out of
 * the full concatenated group buffers.
 *
 * This copy is required because deck.gl's `PathLayer` needs a
 * contiguous vertex range per layer instance; the full-group buffers
 * remain the single source of truth and are not mutated.
 *
 * @param {Object} options
 * @param {Float32Array} options.positions - Flat XY vertex buffer for the whole group
 * @param {Uint32Array} options.startIndices - Vertex-count start offsets for the whole group, length N+1
 * @param {Uint32Array} options.annotationIndices - Annotation indices to include, in output order
 * @returns {{positions: Float32Array, startIndices: Uint32Array}}
 */
export function buildTileSubviews({
  positions,
  startIndices,
  annotationIndices,
}) {
  const tileStartIndices = new Uint32Array(annotationIndices.length + 1)

  let totalVertices = 0
  for (let t = 0; t < annotationIndices.length; t++) {
    const annotationIndex = annotationIndices[t]
    const count =
      startIndices[annotationIndex + 1] - startIndices[annotationIndex]
    tileStartIndices[t] = totalVertices
    totalVertices += count
  }
  tileStartIndices[annotationIndices.length] = totalVertices

  const tilePositions = new Float32Array(totalVertices * 2)
  for (let t = 0; t < annotationIndices.length; t++) {
    const annotationIndex = annotationIndices[t]
    const srcStart = startIndices[annotationIndex] * 2
    const count =
      startIndices[annotationIndex + 1] - startIndices[annotationIndex]
    const dstStart = tileStartIndices[t] * 2
    tilePositions.set(
      positions.subarray(srcStart, srcStart + count * 2),
      dstStart,
    )
  }

  return { positions: tilePositions, startIndices: tileStartIndices }
}
