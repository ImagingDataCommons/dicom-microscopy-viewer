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
import { _overviewStampExtent } from '../pyramid.js'

/** Tiles loading at once, over all instances */
const MAX_LOADING = 24
/** Label tiles kept on the GPU, over all instances */
const MAX_TEXTURES = 768

const uniformBlock = `\
uniform labelmapUniforms {
  vec4 bounds;
  vec4 uvRect;
  float interpolate;
  float windowMin;
  float windowMax;
  float paletteSize;
} labelmap;
`

const labelmapUniforms = {
  name: 'labelmap',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    bounds: 'vec4<f32>',
    uvRect: 'vec4<f32>',
    interpolate: 'f32',
    windowMin: 'f32',
    windowMax: 'f32',
    paletteSize: 'f32',
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
 * Raw values are read with texelFetch and looked up in a 256-wide RGBA
 * table: row = value >> 8, column = value & 255. Labels are never
 * interpolated; with `interpolate` (fractional segments), the four nearest
 * values are blended bilinearly before the lookup, as OpenLayers filters a
 * tile's values before applying its palette.
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

uint valueAt(ivec2 texel, ivec2 size) {
  return texelFetch(labelTexture, clamp(texel, ivec2(0), size - 1), 0).r;
}

void main(void) {
  ivec2 size = textureSize(labelTexture, 0);
  uint label;
  if (labelmap.interpolate > 0.5) {
    vec2 position = vUv * vec2(size) - 0.5;
    ivec2 base = ivec2(floor(position));
    vec2 t = fract(position);
    float a = float(valueAt(base, size));
    float b = float(valueAt(base + ivec2(1, 0), size));
    float c = float(valueAt(base + ivec2(0, 1), size));
    float d = float(valueAt(base + ivec2(1, 1), size));
    label = uint(floor(mix(mix(a, b, t.x), mix(c, d, t.x), t.y) + 0.5));
  } else {
    label = valueAt(ivec2(vUv * vec2(size)), size);
  }
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
 * Float values (parametric maps) are read with texelFetch, blended
 * bilinearly with `interpolate`, and mapped through the window to a palette
 * entry as the OpenLayers parametric map style does: the index is rounded
 * and clamped to the palette. Both samplers are float ones, so they can
 * share a texture unit at program validation.
 */
const floatFs = `\
#version 300 es
#define SHADER_NAME float-map-tiles-fragment-shader

precision highp float;
precision highp int;

uniform sampler2D valueTexture;
uniform sampler2D paletteTexture;

in vec2 vUv;
out vec4 fragColor;

float valueAt(ivec2 texel, ivec2 size) {
  return texelFetch(valueTexture, clamp(texel, ivec2(0), size - 1), 0).r;
}

void main(void) {
  ivec2 size = textureSize(valueTexture, 0);
  float value;
  if (labelmap.interpolate > 0.5) {
    vec2 position = vUv * vec2(size) - 0.5;
    ivec2 base = ivec2(floor(position));
    vec2 t = fract(position);
    float a = valueAt(base, size);
    float b = valueAt(base + ivec2(1, 0), size);
    float c = valueAt(base + ivec2(0, 1), size);
    float d = valueAt(base + ivec2(1, 1), size);
    value = mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
  } else {
    value = valueAt(ivec2(vUv * vec2(size)), size);
  }
  float maxIndex = labelmap.paletteSize - 1.0;
  float position =
    (value - labelmap.windowMin) / (labelmap.windowMax - labelmap.windowMin);
  float index = clamp(floor(position * maxIndex + 0.5), 0.0, maxIndex);
  vec4 color = texelFetch(paletteTexture, ivec2(int(index), 0), 0);
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

/**
 * The RGBA each stored value 0-255 is drawn in through a palette: the entry
 * the value maps to through the window, as the OpenLayers palette style
 * computes it (`palette` rounds the index), with the entry's alpha (0-1,
 * 1 when absent).
 *
 * @param {Object} options
 * @param {number[][]} options.colormap - [r, g, b] or [r, g, b, a] entries
 * @param {number} options.windowCenter
 * @param {number} options.windowWidth
 * @returns {Uint8Array} 256 x 4 RGBA
 */
export function paletteValueTable({ colormap, windowCenter, windowWidth }) {
  const maxIndex = colormap.length - 1
  const table = new Uint8Array(256 * 4)
  for (let value = 0; value < 256; value++) {
    const position = (value - (windowCenter - 0.5)) / (windowWidth - 1) + 0.5
    const index = Math.min(
      maxIndex,
      Math.max(0, Math.round(position * maxIndex)),
    )
    const entry = colormap[index]
    table[value * 4] = entry[0]
    table[value * 4 + 1] = entry[1]
    table[value * 4 + 2] = entry[2]
    table[value * 4 + 3] = Math.round((entry[3] ?? 1) * 255)
  }
  return table
}

/**
 * The labels other than 0 that occur in a frame, ascending.
 *
 * @param {Uint8Array|Uint16Array} labels
 * @returns {number[]}
 */
export function presentLabels(labels) {
  const seen = new Uint8Array(labels.BYTES_PER_ELEMENT > 1 ? 65536 : 256)
  for (let i = 0; i < labels.length; i++) {
    seen[labels[i]] = 1
  }
  const present = []
  for (let label = 1; label < seen.length; label++) {
    if (seen[label] === 1) {
      present.push(label)
    }
  }
  return present
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
          const { tiles, lutTexture, interpolate } = this.props
          if (model == null || lutTexture == null) {
            return
          }
          for (const tile of tiles) {
            model.shaderInputs.setProps({
              labelmap: {
                bounds: tile.bounds,
                uvRect: tile.uvRect,
                interpolate: interpolate ? 1 : 0,
              },
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
        interpolate: false,
      }

      /** Draws the given float tiles of one parametric map */
      class FloatMapTilesLayer extends LabelmapTilesLayer {
        getShaders() {
          return DeckLayer.prototype.getShaders.call(this, {
            vs,
            fs: floatFs,
            modules: [project32, labelmapUniforms],
          })
        }

        draw() {
          const { model } = this.state
          const {
            tiles,
            lutTexture,
            interpolate,
            windowMin,
            windowMax,
            paletteSize,
          } = this.props
          if (model == null || lutTexture == null) {
            return
          }
          for (const tile of tiles) {
            model.shaderInputs.setProps({
              labelmap: {
                bounds: tile.bounds,
                uvRect: tile.uvRect,
                interpolate: interpolate ? 1 : 0,
                windowMin,
                windowMax,
                paletteSize,
              },
            })
            model.setBindings({
              valueTexture: tile.texture,
              paletteTexture: lutTexture,
            })
            model.draw(this.context.renderPass)
          }
        }
      }
      FloatMapTilesLayer.layerName = 'FloatMapTilesLayer'
      FloatMapTilesLayer.defaultProps = {
        ...LabelmapTilesLayer.defaultProps,
        windowMin: 0,
        windowMax: 1,
        paletteSize: 256,
      }

      return { core, LabelmapTilesLayer, FloatMapTilesLayer }
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
   * @param {Array<{extent: number[], nativeSize: number[], loader: function(): Promise<Object>}>} [options.frames]
   *   Frames placed one by one instead of a tile grid (per-frame
   *   segmentations); `loader` resolves like the tile loader
   * @param {number} [options.frameMaxResolution] - Frames are drawn below
   *   this resolution; above it, and while a frame is small on screen, a
   *   stamp of its color marks it
   * @param {boolean} [options.labelsPerFrame] - Stamp a frame with each label
   *   it holds (LABELMAP); otherwise with `stampValue`
   * @param {number} [options.stampValue] - Value a frame's stamp is drawn
   *   with when its labels are not tracked
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
      interpolate = false,
      float = false,
      frames,
      frameMaxResolution = Infinity,
      labelsPerFrame = false,
      stampValue = 1,
    },
  ) {
    const rows = bitsAllocated > 8 && !float ? 256 : 1
    const instance = {
      key,
      tileGrid,
      extent,
      loader,
      minResolution,
      lut: new Uint8Array(256 * rows * 4),
      lutRows: rows,
      binary,
      interpolate,
      /** Float values through a palette (parametric maps), not labels */
      float,
      frames,
      frameMaxResolution,
      labelsPerFrame,
      stampValue,
      paletteSize: 256,
      windowMin: 0,
      windowMax: 1,
      lutTexture: null,
      lutDirty: true,
      /** label -> {visible, color: [r, g, b], opacity} */
      labels: new Map(),
      visibleCount: 0,
      tiles: new Map(),
    }
    if (frames != null) {
      /** A frame is a tile of its own: (0, index, 0) */
      instance.loader = (_z, index) => frames[index].loader()
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

  /**
   * Replace the whole lookup table of an instance whose values are not
   * labels (fractional segments): `table` maps each value to RGBA, and
   * its alpha is scaled by `opacity`, or 0 when not `visible`.
   *
   * @param {Object} instance
   * @param {Object} state
   * @param {Uint8Array} [state.table] - 256 x 4 RGBA
   * @param {boolean} [state.visible]
   * @param {number} [state.opacity] - 0-1
   */
  setValueTable(instance, state) {
    const previous = instance.valueTable ?? {
      table: new Uint8Array(instance.lut.length),
      visible: false,
      opacity: 1,
    }
    const next = { ...previous, ...state }
    instance.valueTable = next
    if (previous.visible !== next.visible) {
      instance.visibleCount += next.visible ? 1 : -1
    }
    const scale = next.visible ? Math.max(0, Math.min(1, next.opacity)) : 0
    const length = Math.min(next.table.length, instance.lut.length)
    for (let i = 0; i < length; i += 4) {
      instance.lut[i] = next.table[i]
      instance.lut[i + 1] = next.table[i + 1]
      instance.lut[i + 2] = next.table[i + 2]
      instance.lut[i + 3] = Math.round(next.table[i + 3] * scale)
    }
    instance.lutDirty = true
    this._changed()
  }

  /**
   * Style of a float instance (a parametric map): its palette, the value
   * window mapped onto it, its opacity and whether it is shown.
   *
   * @param {Object} instance
   * @param {Object} state
   * @param {number[][]} [state.palette] - [r, g, b] or [r, g, b, a] entries
   * @param {number[]} [state.window] - [min, max] value mapped to the
   *   first and last entry
   * @param {number} [state.opacity] - 0-1
   * @param {boolean} [state.visible]
   */
  setFloatStyle(instance, state) {
    const previous = instance.floatStyle ?? {
      palette: [[0, 0, 0]],
      window: [0, 1],
      opacity: 1,
      visible: false,
    }
    const next = { ...previous, ...state }
    instance.floatStyle = next
    if (previous.visible !== next.visible) {
      instance.visibleCount += next.visible ? 1 : -1
    }
    instance.windowMin = next.window[0]
    instance.windowMax = next.window[1]
    instance.paletteSize = next.palette.length
    const scale = Math.max(0, Math.min(1, next.opacity))
    if (instance.lut.length !== next.palette.length * 4) {
      instance.lut = new Uint8Array(next.palette.length * 4)
    }
    next.palette.forEach((entry, index) => {
      instance.lut[index * 4] = entry[0]
      instance.lut[index * 4 + 1] = entry[1]
      instance.lut[index * 4 + 2] = entry[2]
      instance.lut[index * 4 + 3] = Math.round((entry[3] ?? 1) * scale * 255)
    })
    instance.lutDirty = true
    this._changed()
  }

  /**
   * @param {Object} instance
   * @param {boolean} interpolate - Blend values bilinearly before the lookup
   */
  setInterpolate(instance, interpolate) {
    instance.interpolate = interpolate === true
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
      format: instance.float ? 'rgba8unorm' : 'rgba8uint',
      width: instance.float ? instance.lut.length / 4 : 256,
      height: instance.float ? 1 : instance.lutRows,
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
    tile.labels = result.labels ?? result.values
    tile.width = result.width
    tile.height = result.height
    if (tile.instance.labelsPerFrame) {
      tile.present = presentLabels(tile.labels)
    }
    tile.state = 'loaded'
  }

  /** Upload a loaded tile's labels, evicting the least recently used */
  _ensureTexture(tile) {
    if (tile.texture != null) {
      this.textures.delete(tile.key)
      this.textures.set(tile.key, tile)
      return tile.texture
    }
    const isFloat = tile.labels instanceof Float32Array
    const is16 = tile.labels.BYTES_PER_ELEMENT === 2
    tile.texture = this.device.createTexture({
      id: `labelmap-tile-${tile.key}`,
      format: isFloat ? 'r32float' : is16 ? 'r16uint' : 'r8uint',
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
   * Frames of a per-frame instance to draw this frame: the loaded frames
   * in view below the raster resolution, then a stamp over each frame that
   * is small on screen (as the OpenLayers overview stamps), drawn with the
   * frame's labels or the instance's stamp value through its table.
   *
   * @private
   */
  _collectFrames(instance, frameState) {
    const { viewState, extent: viewExtent } = frameState
    const resolution = viewState.resolution
    const drawsRasters = resolution < instance.frameMaxResolution
    const rasters = []
    const stamps = []
    instance.frames.forEach((frame, index) => {
      const stampExtent = _overviewStampExtent(
        frame.extent,
        resolution,
        frame.nativeSize,
      )
      if (!extentsIntersect(viewExtent, stampExtent ?? frame.extent)) {
        return
      }
      const tile = this._getTile(instance, 0, index, 0, drawsRasters)
      if (tile != null && drawsRasters) {
        tile.wanted = this.frameId
      }
      if (drawsRasters && tile?.state === 'loaded') {
        rasters.push({ tile, bounds: frame.extent, uvRect: [0, 0, 1, 1] })
      }
      if (stampExtent == null) {
        return
      }
      const values = instance.labelsPerFrame
        ? (tile?.present ?? [])
        : [instance.stampValue]
      for (const value of values) {
        stamps.push({
          bounds: stampExtent,
          uvRect: [0, 0, 1, 1],
          texture: this._valueTexture(value, instance),
        })
      }
    })
    const result = []
    for (const item of rasters) {
      item.tile.usedFrame = this.frameId
      result.push({
        bounds: item.bounds,
        uvRect: item.uvRect,
        texture: this._ensureTexture(item.tile),
      })
    }
    return [...result, ...stamps]
  }

  /**
   * A 1 x 1 texture holding `value`, to draw a stamp through a table.
   *
   * @private
   */
  _valueTexture(value, instance) {
    const is16 = instance.lutRows > 1
    const key = `${is16 ? 16 : 8}:${value}`
    if (this.valueTextures == null) {
      this.valueTextures = new Map()
    }
    let texture = this.valueTextures.get(key)
    if (texture == null) {
      const data = is16 ? Uint16Array.of(value) : Uint8Array.of(value)
      texture = this.device.createTexture({
        id: `labelmap-value-${key}`,
        format: is16 ? 'r16uint' : 'r8uint',
        width: 1,
        height: 1,
        data: padRowsForUpload(data, 1, 1),
        mipmaps: false,
        sampler: { minFilter: 'nearest', magFilter: 'nearest' },
      })
      this.valueTextures.set(key, texture)
    }
    return texture
  }

  /**
   * Tiles of one instance to draw this frame: the tiles of the view's level
   * that are loaded, and for those still loading, their nearest loaded
   * ancestor cropped to their footprint.
   *
   * @private
   */
  _collectTiles(instance, frameState) {
    if (instance.frames != null) {
      return this._collectFrames(instance, frameState)
    }
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
    const { LabelmapTilesLayer, FloatMapTilesLayer } = this.modules
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
      const TilesLayer = instance.float
        ? FloatMapTilesLayer
        : LabelmapTilesLayer
      layers.push(
        new TilesLayer({
          id: `labelmap-${instance.key}`,
          tiles,
          lutTexture: instance.lutTexture,
          interpolate: instance.interpolate,
          windowMin: instance.windowMin,
          windowMax: instance.windowMax,
          paletteSize: instance.paletteSize,
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
    for (const texture of this.valueTextures?.values() ?? []) {
      texture.destroy()
    }
    this.valueTextures?.clear()
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

/**
 * Stand-in for the OpenLayers layer of a segment whose values are colored
 * through a table of their own (a fractional segment).
 *
 * @param {LabelmapDeckLayers} overlay
 * @param {Object} instance
 * @param {Object} options
 * @param {number} options.opacity
 * @param {Uint8Array} options.table - 256 x 4 RGBA
 * @returns {Object}
 */
export function createValueTableProxyLayer(overlay, instance, options) {
  overlay.setValueTable(instance, {
    visible: false,
    opacity: options.opacity,
    table: options.table,
  })
  return {
    isLabelmapDeckProxy: true,
    getVisible: () => instance.valueTable?.visible === true,
    setVisible: (visible) =>
      overlay.setValueTable(instance, { visible: visible === true }),
    getOpacity: () => instance.valueTable?.opacity ?? 1,
    setOpacity: (opacity) => overlay.setValueTable(instance, { opacity }),
    setValueTable: (table) => overlay.setValueTable(instance, { table }),
    setInterpolate: (interpolate) =>
      overlay.setInterpolate(instance, interpolate),
    setStyle: () => {},
    getSource: () => null,
    setSource: () => {},
    getExtent: () => instance.extent,
    on: () => {},
    un: () => {},
    changed: () => overlay.map.render(),
    dispose: () => overlay.setValueTable(instance, { visible: false }),
  }
}

/**
 * Stand-in for the OpenLayers layer of a parametric map drawn with deck.gl.
 *
 * @param {LabelmapDeckLayers} overlay
 * @param {Object} instance - A float instance
 * @param {Object} style - See LabelmapDeckLayers#setFloatStyle
 * @returns {Object}
 */
export function createFloatMapProxyLayer(overlay, instance, style) {
  overlay.setFloatStyle(instance, { ...style, visible: false })
  return {
    isLabelmapDeckProxy: true,
    getVisible: () => instance.floatStyle?.visible === true,
    setVisible: (visible) =>
      overlay.setFloatStyle(instance, { visible: visible === true }),
    getOpacity: () => instance.floatStyle?.opacity ?? 1,
    setOpacity: (opacity) => overlay.setFloatStyle(instance, { opacity }),
    setFloatStyle: (state) => overlay.setFloatStyle(instance, state),
    setInterpolate: (interpolate) =>
      overlay.setInterpolate(instance, interpolate),
    setStyle: () => {},
    updateStyleVariables: () => {},
    getSource: () => null,
    setSource: () => {},
    getExtent: () => instance.extent,
    on: () => {},
    un: () => {},
    changed: () => overlay.map.render(),
    dispose: () => overlay.setFloatStyle(instance, { visible: false }),
  }
}
