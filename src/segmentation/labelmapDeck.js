/**
 * LABELMAP segmentations drawn with deck.gl.
 *
 * One deck.gl layer per tiled LABELMAP instance (series) draws the raw label
 * values of its tiles through a color lookup texture: label N maps to the
 * color of segment N with its opacity as alpha, and to alpha 0 when the
 * segment is hidden, absent or background. Showing, hiding or restyling a
 * segment only rewrites that lookup texture; tiles are fetched, decoded and
 * uploaded once per instance, whatever the number of segments shown.
 *
 * The layers are drawn by the viewer's shared deck.gl overlay (see
 * deckOverlay.js), under bulk annotations. The slide image stays on
 * OpenLayers.
 *
 * Tile selection mirrors OpenLayers: the level comes from
 * `tileGrid.getZForResolution`, the tiles from the view extent clipped to the
 * instance extent, and a tile still loading is stood in for by the nearest
 * loaded ancestor, cropped to the tile's footprint.
 */

import {
  intersects as extentsIntersect,
  getIntersection,
  isEmpty,
} from 'ol/extent'

import { importLazyChunk } from '../bulkAnnotations/lazyImport.js'
import { rotationModelMatrix } from '../bulkAnnotations/viewState.js'
import { DECK_SOURCE_ORDER } from '../deckOverlay.js'

/** Tiles loading at once, over all instances */
const MAX_LOADING = 24
/** Label tiles kept on the GPU, over all instances */
const MAX_TEXTURES = 768

const uniformBlock = `\
uniform labelmapUniforms {
  vec4 bounds;
  vec4 uvRect;
} labelmap;
`

const labelmapUniforms = {
  name: 'labelmap',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    bounds: 'vec4<f32>',
    uvRect: 'vec4<f32>',
  },
}

/**
 * A quad per draw, its corners from gl_VertexID (no vertex buffers).
 * `bounds` is the tile footprint [minX, minY, maxX, maxY] in map units and
 * `uvRect` the part of the label texture drawn on it (row 0 at maxY).
 */
const vs = `\
#version 300 es
#define SHADER_NAME labelmap-tiles-vertex-shader

out vec2 vUv;

void main(void) {
  int i = gl_VertexID;
  vec2 corner = vec2(
    (i == 1 || i == 4 || i == 5) ? 1.0 : 0.0,
    (i == 2 || i == 3 || i == 5) ? 1.0 : 0.0
  );
  vec3 position = vec3(
    mix(labelmap.bounds.x, labelmap.bounds.z, corner.x),
    mix(labelmap.bounds.w, labelmap.bounds.y, corner.y),
    0.0
  );
  geometry.worldPosition = position;
  geometry.uv = corner;
  gl_Position = project_position_to_clipspace(
    position, vec3(0.0), vec3(0.0), geometry.position
  );
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vUv = mix(labelmap.uvRect.xy, labelmap.uvRect.zw, corner);
}
`

/**
 * Raw labels are read with texelFetch (nearest, never interpolated) and
 * looked up in a 256-wide RGBA table: row = label >> 8, column = label & 255.
 * Both are integer textures: samplers of different types left on the same
 * texture unit fail gl.validateProgram, which luma.gl treats as a link error.
 */
const fs = `\
#version 300 es
#define SHADER_NAME labelmap-tiles-fragment-shader

precision highp float;
precision highp int;
precision highp usampler2D;

uniform usampler2D labelTexture;
uniform usampler2D lutTexture;

in vec2 vUv;
out vec4 fragColor;

void main(void) {
  ivec2 size = textureSize(labelTexture, 0);
  ivec2 texel = clamp(ivec2(vUv * vec2(size)), ivec2(0), size - 1);
  uint label = texelFetch(labelTexture, texel, 0).r;
  vec4 color =
    vec4(texelFetch(lutTexture, ivec2(int(label & 255u), int(label >> 8u)), 0)) / 255.0;
  if (color.a == 0.0) {
    discard;
  }
  fragColor = color;
  geometry.uv = vUv;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`

/**
 * Label rows padded to a multiple of 4 bytes. WebGL reads uploaded rows
 * at its default 4-byte alignment, so a tile whose rows are not (an
 * 82-pixel-wide 8-bit tile, say) failed to upload and drew nothing.
 *
 * @param {Uint8Array|Uint16Array} labels - width x height values
 * @param {number} width
 * @param {number} height
 * @returns {Uint8Array|Uint16Array} `labels` itself when no padding is needed
 */
export function padRowsForUpload(labels, width, height) {
  const bytesPerValue = labels.BYTES_PER_ELEMENT
  const rowBytes = width * bytesPerValue
  const strideBytes = Math.ceil(rowBytes / 4) * 4
  if (strideBytes === rowBytes) {
    return labels
  }
  const stride = strideBytes / bytesPerValue
  const padded = new labels.constructor(stride * height)
  for (let row = 0; row < height; row++) {
    padded.set(labels.subarray(row * width, (row + 1) * width), row * stride)
  }
  return padded
}

let deckModulesPromise = null

/**
 * Load deck.gl and luma.gl lazily, as bulk annotations do (keeps them out
 * of the viewer's import graph for jsdom tests), and define the layer class
 * once they are there.
 *
 * @returns {Promise<Object>}
 * @private
 */
function loadDeckModules() {
  if (deckModulesPromise == null) {
    deckModulesPromise = Promise.all([
      importLazyChunk(() => import('@deck.gl/core')),
      importLazyChunk(() => import('@luma.gl/engine')),
    ]).then(([core, engine]) => {
      const { Layer: DeckLayer, project32 } = core
      const { Model } = engine

      /** Draws the given tiles of one LABELMAP instance */
      class LabelmapTilesLayer extends DeckLayer {
        getShaders() {
          return super.getShaders({
            vs,
            fs,
            modules: [project32, labelmapUniforms],
          })
        }

        initializeState() {
          this.setState({ model: this._getModel() })
        }

        _getModel() {
          return new Model(this.context.device, {
            ...this.getShaders(),
            id: this.props.id,
            bufferLayout: [],
            topology: 'triangle-list',
            vertexCount: 6,
            isInstanced: false,
          })
        }

        draw() {
          const { model } = this.state
          const { tiles, lutTexture } = this.props
          if (model == null || lutTexture == null) {
            return
          }
          for (const tile of tiles) {
            model.shaderInputs.setProps({
              labelmap: { bounds: tile.bounds, uvRect: tile.uvRect },
            })
            model.setBindings({ labelTexture: tile.texture, lutTexture })
            model.draw(this.context.renderPass)
          }
        }
      }
      LabelmapTilesLayer.layerName = 'LabelmapTilesLayer'
      LabelmapTilesLayer.defaultProps = {
        tiles: { type: 'object', value: [], compare: false },
        lutTexture: { type: 'object', value: null, compare: false },
      }

      return { core, LabelmapTilesLayer }
    })
  }
  return deckModulesPromise
}

/**
 * The LABELMAP instances of a viewer, drawn as a layer source of its shared
 * deck.gl overlay.
 */
export class LabelmapDeckLayers {
  /**
   * @param {Object} options
   * @param {import('ol/Map').default} options.map
   * @param {import('../deckOverlay.js').SharedDeckOverlay} options.overlay
   */
  constructor({ map, overlay }) {
    this.map = map
    this.overlay = overlay
    /** @type {Map<string, Object>} */
    this.instances = new Map()
    this.device = null
    this.modules = null
    this.loading = 0
    this.queue = []
    /** @type {Map<string, Object>} key -> tile with a texture, LRU order */
    this.textures = new Map()
    this.frameStats = { tiles: 0, layers: 0 }

    overlay.addLayerSource('labelmap-segments', {
      order: DECK_SOURCE_ORDER.segmentations,
      getLayers: (frameState) => this.getLayers(frameState),
    })
    overlay.ensureReady().catch((error) => {
      console.error('[labelmapDeck] deck overlay failed', error)
    })
    overlay.onDeviceInitialized((device) => {
      this.device = device
      for (const instance of this.instances.values()) {
        this._uploadLut(instance)
      }
      this._changed()
    })
    loadDeckModules().then(
      (modules) => {
        this.modules = modules
        this._changed()
      },
      (error) => {
        console.error('[labelmapDeck] failed to load deck.gl', error)
      },
    )
  }

  /** Redraw the overlay on the next frame */
  _changed() {
    this.overlay.changed()
    this.map.render()
  }

  /**
   * Register a LABELMAP instance.
   *
   * @param {string} key - Unique per instance, e.g. the series UID
   * @param {Object} options
   * @param {import('ol/tilegrid/TileGrid').default} options.tileGrid
   * @param {number[]} options.extent - Where the instance has frames
   * @param {function(number, number, number): Promise<Object>} options.loader
   *   Resolves `{labels, width, height, isEmpty}` for (z, column, row)
   * @param {number} [options.minResolution] - Hidden below this resolution
   * @param {number} [options.bitsAllocated] - 8 or 16
   * @returns {Object} instance
   */
  addInstance(
    key,
    {
      tileGrid,
      extent,
      loader,
      minResolution,
      bitsAllocated = 8,
      binary = false,
    },
  ) {
    const rows = bitsAllocated > 8 ? 256 : 1
    const instance = {
      key,
      tileGrid,
      extent,
      loader,
      minResolution,
      lut: new Uint8Array(256 * rows * 4),
      lutRows: rows,
      binary,
      lutTexture: null,
      lutDirty: true,
      /** label -> {visible, color: [r, g, b], opacity} */
      labels: new Map(),
      visibleCount: 0,
      tiles: new Map(),
    }
    this.instances.set(key, instance)
    if (this.device != null) {
      this._uploadLut(instance)
    }
    return instance
  }

  /**
   * Set how a label of an instance is drawn and redraw.
   *
   * @param {Object} instance
   * @param {number} label
   * @param {Object} state
   * @param {boolean} [state.visible]
   * @param {number[]} [state.color] - RGB, 0-255
   * @param {number} [state.opacity] - 0-1
   */
  setLabel(instance, label, state) {
    const previous = instance.labels.get(label) ?? {
      visible: false,
      color: [0, 0, 0],
      opacity: 1,
    }
    const next = { ...previous, ...state }
    instance.labels.set(label, next)
    if (previous.visible !== next.visible) {
      instance.visibleCount += next.visible ? 1 : -1
    }
    const alpha = next.visible
      ? Math.round(Math.max(0, Math.min(1, next.opacity)) * 255)
      : 0
    /**
     * A BINARY segment's frames hold 1 (or 255, depending on how they are
     * decoded) where the segment is: every value but 0 is the segment
     */
    const [first, last] = instance.binary
      ? [1, instance.lut.length / 4 - 1]
      : [label, label]
    for (let entry = first; entry <= last; entry++) {
      const offset = entry * 4
      if (offset + 3 >= instance.lut.length) {
        break
      }
      instance.lut[offset] = next.color[0]
      instance.lut[offset + 1] = next.color[1]
      instance.lut[offset + 2] = next.color[2]
      instance.lut[offset + 3] = alpha
    }
    instance.lutDirty = true
    this._changed()
  }

  getLabel(instance, label) {
    return instance.labels.get(label)
  }

  _uploadLut(instance) {
    if (this.device == null) {
      return
    }
    /** A 256 x rows RGBA texture is small: recreate rather than update */
    if (instance.lutTexture != null) {
      instance.lutTexture.destroy()
    }
    instance.lutTexture = this.device.createTexture({
      id: `labelmap-lut-${instance.key}`,
      format: 'rgba8uint',
      width: 256,
      height: instance.lutRows,
      data: instance.lut,
      mipmaps: false,
      sampler: {
        minFilter: 'nearest',
        magFilter: 'nearest',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
      },
    })
    instance.lutDirty = false
  }

  /**
   * The tile at (z, x, y) of an instance, starting its load when new.
   *
   * @private
   */
  _getTile(instance, z, x, y, request) {
    const key = `${z}/${x}/${y}`
    let tile = instance.tiles.get(key)
    if (tile === undefined) {
      if (!request) {
        return undefined
      }
      tile = {
        key: `${instance.key}|${key}`,
        tileKey: key,
        z,
        x,
        y,
        instance,
        state: 'queued',
        texture: null,
      }
      instance.tiles.set(key, tile)
      this.queue.push(tile)
    } else if ((tile.state === 'idle' || tile.state === 'queued') && request) {
      /** The queue is rebuilt every frame from the tiles still in view */
      tile.state = 'queued'
      this.queue.push(tile)
    }
    return tile
  }

  _pump() {
    while (this.loading < MAX_LOADING && this.queue.length > 0) {
      const tile = this.queue.shift()
      if (tile.state !== 'queued') {
        continue
      }
      if (tile.wanted !== this.frameId) {
        /** No longer in view: load again when asked */
        tile.state = 'idle'
        continue
      }
      this.loading += 1
      tile.state = 'loading'
      tile.instance
        .loader(tile.z, tile.x, tile.y)
        .then(
          (result) => this._onTileLoaded(tile, result),
          (error) => {
            tile.state = 'error'
            console.warn('[labelmapDeck] tile failed', tile.key, error)
          },
        )
        .finally(() => {
          this.loading -= 1
          /**
           * Start the next tile still in view now rather than on the next
           * frame: frames can be slow (software WebGL), loads should not be
           */
          this._pump()
          this._changed()
        })
    }
  }

  _onTileLoaded(tile, result) {
    if (result == null || result.isEmpty) {
      tile.state = 'empty'
      return
    }
    tile.labels = result.labels
    tile.width = result.width
    tile.height = result.height
    tile.state = 'loaded'
  }

  /** Upload a loaded tile's labels, evicting the least recently used */
  _ensureTexture(tile) {
    if (tile.texture != null) {
      this.textures.delete(tile.key)
      this.textures.set(tile.key, tile)
      return tile.texture
    }
    const is16 = tile.labels.BYTES_PER_ELEMENT === 2
    tile.texture = this.device.createTexture({
      id: `labelmap-tile-${tile.key}`,
      format: is16 ? 'r16uint' : 'r8uint',
      width: tile.width,
      height: tile.height,
      data: padRowsForUpload(tile.labels, tile.width, tile.height),
      mipmaps: false,
      sampler: { minFilter: 'nearest', magFilter: 'nearest' },
    })
    this.textures.set(tile.key, tile)
    while (this.textures.size > MAX_TEXTURES) {
      const [oldestKey, oldest] = this.textures.entries().next().value
      if (oldest.usedFrame === this.frameId) {
        break
      }
      this.textures.delete(oldestKey)
      oldest.texture.destroy()
      oldest.texture = null
    }
    return tile.texture
  }

  /**
   * Tiles of one instance to draw this frame: the tiles of the view's level
   * that are loaded, and for those still loading, their nearest loaded
   * ancestor cropped to their footprint.
   *
   * @private
   */
  _collectTiles(instance, frameState) {
    const { viewState, extent: viewExtent } = frameState
    const resolution = viewState.resolution
    if (instance.minResolution != null && resolution < instance.minResolution) {
      return []
    }
    if (!extentsIntersect(viewExtent, instance.extent)) {
      return []
    }
    const extent = getIntersection(viewExtent, instance.extent)
    if (isEmpty(extent)) {
      return []
    }
    const { tileGrid } = instance
    const z = tileGrid.getZForResolution(resolution, 0)
    const range = tileGrid.getTileRangeForExtentAndZ(extent, z)
    const drawn = []
    const stand = []
    for (let x = range.minX; x <= range.maxX; x++) {
      for (let y = range.minY; y <= range.maxY; y++) {
        const tile = this._getTile(instance, z, x, y, true)
        tile.wanted = this.frameId
        const bounds = tileGrid.getTileCoordExtent([z, x, y])
        if (tile.state === 'loaded') {
          drawn.push({ tile, bounds, uvRect: [0, 0, 1, 1] })
          continue
        }
        if (tile.state === 'empty') {
          continue
        }
        /** Stand in with the nearest loaded ancestor, cropped */
        for (let pz = z - 1; pz >= tileGrid.getMinZoom(); pz--) {
          const parentRange = tileGrid.getTileRangeForExtentAndZ(
            [
              (bounds[0] + bounds[2]) / 2,
              (bounds[1] + bounds[3]) / 2,
              (bounds[0] + bounds[2]) / 2,
              (bounds[1] + bounds[3]) / 2,
            ],
            pz,
          )
          const parent = this._getTile(
            instance,
            pz,
            parentRange.minX,
            parentRange.minY,
            false,
          )
          if (parent?.state === 'empty') {
            break
          }
          if (parent?.state === 'loaded') {
            const pb = tileGrid.getTileCoordExtent([
              pz,
              parentRange.minX,
              parentRange.minY,
            ])
            const w = pb[2] - pb[0]
            const h = pb[3] - pb[1]
            stand.push({
              tile: parent,
              bounds,
              uvRect: [
                (bounds[0] - pb[0]) / w,
                (pb[3] - bounds[3]) / h,
                (bounds[2] - pb[0]) / w,
                (pb[3] - bounds[1]) / h,
              ],
            })
            break
          }
        }
      }
    }
    const result = []
    for (const item of [...stand, ...drawn]) {
      item.tile.usedFrame = this.frameId
      result.push({
        bounds: item.bounds,
        uvRect: item.uvRect,
        texture: this._ensureTexture(item.tile),
      })
    }
    return result
  }

  /**
   * The deck.gl layers of this frame, one per instance with visible
   * segments and tiles in view.
   *
   * @param {Object} frameState - OpenLayers frame state
   * @returns {Array}
   */
  getLayers(frameState) {
    if (this.device == null || this.modules == null) {
      return []
    }
    this.frameId = (this.frameId ?? 0) + 1
    /** Newest requests first: the view the user is looking at now */
    this.queue = []
    const { LabelmapTilesLayer } = this.modules
    const modelMatrix = rotationModelMatrix(frameState.viewState.rotation)
    const layers = []
    let tileCount = 0
    for (const instance of this.instances.values()) {
      if (instance.visibleCount === 0) {
        continue
      }
      if (instance.lutDirty || instance.lutTexture == null) {
        this._uploadLut(instance)
      }
      const tiles = this._collectTiles(instance, frameState)
      if (tiles.length === 0) {
        continue
      }
      tileCount += tiles.length
      layers.push(
        new LabelmapTilesLayer({
          id: `labelmap-${instance.key}`,
          tiles,
          lutTexture: instance.lutTexture,
          modelMatrix,
          /** Redraw whenever OpenLayers renders: tiles are not diffed */
          updateTriggers: { tiles: this.frameId },
        }),
      )
    }
    this.frameStats = { tiles: tileCount, layers: layers.length }
    this._pump()
    return layers
  }

  dispose() {
    this.overlay.removeLayerSource('labelmap-segments')
    for (const tile of this.textures.values()) {
      tile.texture?.destroy()
    }
    this.textures.clear()
    for (const instance of this.instances.values()) {
      instance.lutTexture?.destroy()
    }
    this.instances.clear()
  }
}

/**
 * Stand-in for a segment's OpenLayers layer, so the viewer's segment code
 * keeps working while the pixels are drawn by the deck.gl overlay.
 *
 * @param {LabelmapDeckLayers} overlay
 * @param {Object} instance
 * @param {number} label
 * @param {Object} options
 * @param {number} options.opacity
 * @param {number[]} options.color
 * @returns {Object}
 */
export function createLabelProxyLayer(overlay, instance, label, options) {
  overlay.setLabel(instance, label, {
    visible: false,
    opacity: options.opacity,
    color: options.color,
  })
  return {
    isLabelmapDeckProxy: true,
    getVisible: () => overlay.getLabel(instance, label)?.visible === true,
    setVisible: (visible) =>
      overlay.setLabel(instance, label, { visible: visible === true }),
    getOpacity: () => overlay.getLabel(instance, label)?.opacity ?? 1,
    setOpacity: (opacity) => overlay.setLabel(instance, label, { opacity }),
    setColor: (color) => overlay.setLabel(instance, label, { color }),
    setStyle: () => {},
    getSource: () => null,
    setSource: () => {},
    getExtent: () => instance.extent,
    on: () => {},
    un: () => {},
    changed: () => overlay.map.render(),
    dispose: () => overlay.setLabel(instance, label, { visible: false }),
  }
}
