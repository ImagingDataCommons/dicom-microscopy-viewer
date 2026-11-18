const _maxBytes = Symbol('maxBytes')
const _bytes = Symbol('bytes')
const _entries = Symbol('entries')

/**
 * Least recently used cache of decoded tiles, bounded by the number of bytes
 * of their pixel data.
 *
 * @private
 */
class _TileCache {
  /**
   * @param {number} maxBytes - Largest total size of the cached pixel data
   */
  constructor(maxBytes) {
    this[_maxBytes] = maxBytes
    this[_bytes] = 0
    this[_entries] = new Map()
  }

  /**
   * Get a tile and mark it as recently used.
   *
   * @param {string} key - Key
   * @returns {Object|undefined} Tile (`data`, `width`, `height`)
   */
  get(key) {
    const tile = this[_entries].get(key)
    if (tile !== undefined) {
      this[_entries].delete(key)
      this[_entries].set(key, tile)
    }
    return tile
  }

  /**
   * Add a tile, evicting the least recently used ones when full. Tiles
   * larger than the cache are not added.
   *
   * @param {string} key - Key
   * @param {Object} tile - Tile (`data`, `width`, `height`)
   */
  set(key, tile) {
    const size = tile.data.byteLength
    if (size > this[_maxBytes]) {
      return
    }
    this.delete(key)
    this[_entries].set(key, tile)
    this[_bytes] += size
    for (const [oldestKey] of this[_entries]) {
      if (this[_bytes] <= this[_maxBytes]) {
        break
      }
      this.delete(oldestKey)
    }
  }

  /**
   * Remove a tile.
   *
   * @param {string} key - Key
   */
  delete(key) {
    const tile = this[_entries].get(key)
    if (tile !== undefined) {
      this[_entries].delete(key)
      this[_bytes] -= tile.data.byteLength
    }
  }

  /** Remove all tiles. */
  clear() {
    this[_entries].clear()
    this[_bytes] = 0
  }

  /**
   * Total size of the cached pixel data in bytes.
   *
   * @type {number}
   */
  get size() {
    return this[_bytes]
  }
}

export { _TileCache }
