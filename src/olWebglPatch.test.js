/**
 * Checks of DMV's patch to OpenLayers' WebGL rendering
 * (patches/ol@10.9.0.patch): each tile layer clears and composes only the
 * part of the canvas its extent covers, helpers drawing to one canvas share
 * one offscreen render target, and tile layers with the same shaders share
 * one linked program.
 */
import WebGLHelper from 'ol/webgl/Helper.js'
import { getExtentScissor } from 'ol/renderer/webgl/TileLayer.js'
import ContextEventType from 'ol/webgl/ContextEventType.js'
import {
  create as createTransform,
  compose as composeTransform,
} from 'ol/transform.js'

/**
 * A WebGL context stand-in that records every call; constants are unique
 * numbers and created objects are plain objects.
 */
function createFakeGl(canvas) {
  const calls = []
  const constants = {}
  let next = 1
  const target = {
    canvas,
    calls,
    drawingBufferWidth: 200,
    drawingBufferHeight: 100,
    getContextAttributes: () => ({ preserveDrawingBuffer: true }),
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getAttribLocation: () => 0,
    getUniformLocation: () => ({}),
    getParameter: () => 0,
    isContextLost: () => false,
    getExtension: () => ({ loseContext: () => {} }),
  }
  for (const name of [
    'createProgram',
    'createShader',
    'createTexture',
    'createFramebuffer',
    'createRenderbuffer',
    'createBuffer',
  ]) {
    target[name] = () => {
      const object = { id: next++, kind: name }
      calls.push([name, object])
      return object
    }
  }
  return new Proxy(target, {
    get(object, property) {
      if (property in object) {
        return object[property]
      }
      if (typeof property !== 'string') {
        return undefined
      }
      if (/^[A-Z0-9_]+$/.test(property)) {
        if (!(property in constants)) {
          constants[property] = 1000 + Object.keys(constants).length
        }
        return constants[property]
      }
      return (...args) => {
        calls.push([property, ...args])
      }
    },
  })
}

let getContextSpy

beforeEach(() => {
  getContextSpy = jest
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(function () {
      if (!this.fakeGl) {
        this.fakeGl = createFakeGl(this)
      }
      return this.fakeGl
    })
})

afterEach(() => {
  getContextSpy.mockRestore()
})

let keyCount = 0

/** A canvas cache key no other test uses, so contexts are not shared. */
function uniqueKey() {
  keyCount += 1
  return `test-canvas-${keyCount}`
}

function createFrameState({
  size = [100, 50],
  pixelRatio = 2,
  center = [0, 0],
  resolution = 1,
  rotation = 0,
} = {}) {
  /** Same composition as ol/Map for coordinateToPixelTransform */
  const coordinateToPixelTransform = composeTransform(
    createTransform(),
    size[0] / 2,
    size[1] / 2,
    1 / resolution,
    -1 / resolution,
    -rotation,
    -center[0],
    -center[1],
  )
  return {
    size,
    pixelRatio,
    coordinateToPixelTransform,
    renderTargets: {},
    layerStatesArray: [{ opacity: 1 }],
    layerIndex: 0,
  }
}

describe('getExtentScissor', () => {
  it('returns null without an extent', () => {
    expect(getExtentScissor(createFrameState(), undefined)).toBeNull()
    expect(
      getExtentScissor(createFrameState(), [
        -Infinity,
        -Infinity,
        Infinity,
        Infinity,
      ]),
    ).toBeNull()
  })

  it('returns null when the extent covers the whole canvas', () => {
    expect(
      getExtentScissor(createFrameState(), [-100, -100, 100, 100]),
    ).toBeNull()
  })

  it('gives the covered box in device pixels from the bottom left', () => {
    /**
     * View 100x50 CSS px at pixel ratio 2, center 0,0, resolution 1:
     * x 0..20 maps to CSS px 50..70, y 0..10 to CSS px 25..15.
     */
    const box = getExtentScissor(createFrameState(), [0, 0, 20, 10])
    /** Device px x 100..140, rows 30..50 from the top, one px margin */
    expect(box).toEqual([99, 100 - 51, 42, 22])
  })

  it('bounds the rotated extent', () => {
    const box = getExtentScissor(createFrameState({ rotation: Math.PI }), [
      0, 0, 20, 10,
    ])
    /** Rotated half a turn the extent lands left of and below the center */
    expect(box).toEqual([59, 100 - 71, 42, 22])
  })

  it('gives an empty box for an extent off screen', () => {
    const box = getExtentScissor(createFrameState(), [500, 500, 600, 600])
    expect(box[2] === 0 || box[3] === 0).toBe(true)
    expect(box[1]).toBeGreaterThanOrEqual(0)
  })
})

describe('shared default render target', () => {
  it('shares one pass between helpers on the same canvas', () => {
    const key = uniqueKey()
    const a = new WebGLHelper({ canvasCacheKey: key })
    const b = new WebGLHelper({ canvasCacheKey: key })
    expect(a.getGL()).toBe(b.getGL())
    expect(a.postProcessPasses_[0]).toBe(b.postProcessPasses_[0])
    expect(a.sharesDefaultPostProcess()).toBe(true)
    const textures = a
      .getGL()
      .calls.filter(([name]) => name === 'createTexture')
    expect(textures).toHaveLength(1)
    a.dispose()
    b.dispose()
  })

  it('keeps separate passes on separate canvases', () => {
    const a = new WebGLHelper({ canvasCacheKey: uniqueKey() })
    const b = new WebGLHelper({ canvasCacheKey: uniqueKey() })
    expect(a.postProcessPasses_[0]).not.toBe(b.postProcessPasses_[0])
    a.dispose()
    b.dispose()
  })

  it('does not share custom post processes', () => {
    const key = uniqueKey()
    const a = new WebGLHelper({ canvasCacheKey: key })
    const b = new WebGLHelper({
      canvasCacheKey: key,
      postProcesses: [{}],
    })
    expect(b.postProcessPasses_[0]).not.toBe(a.postProcessPasses_[0])
    expect(b.sharesDefaultPostProcess()).toBe(false)
    a.dispose()
    b.dispose()
  })

  it('makes a new pass after the context is lost', () => {
    const key = uniqueKey()
    const a = new WebGLHelper({ canvasCacheKey: key })
    const lostPass = a.postProcessPasses_[0]
    a.getCanvas().dispatchEvent(
      new Event(ContextEventType.LOST, { cancelable: true }),
    )
    const b = new WebGLHelper({ canvasCacheKey: key })
    expect(b.postProcessPasses_[0]).not.toBe(lostPass)
    a.dispose()
    b.dispose()
  })
})

describe('scissored draw', () => {
  function drawOnce(helper, frameState) {
    const gl = helper.getGL()
    gl.calls.length = 0
    helper.prepareDraw(frameState)
    helper.drawElements(0, 6)
    helper.finalizeDraw(frameState)
    return gl.calls
  }

  function scissorStateAt(calls, gl, index) {
    let enabled = false
    for (let i = 0; i < index; i++) {
      const [name, capability] = calls[i]
      if (capability !== gl.SCISSOR_TEST) continue
      if (name === 'enable') enabled = true
      if (name === 'disable') enabled = false
    }
    return enabled
  }

  it('limits the clear and the composition to the box', () => {
    const helper = new WebGLHelper({ canvasCacheKey: uniqueKey() })
    const gl = helper.getGL()
    helper.setScissor([10, 20, 30, 40])
    const calls = drawOnce(helper, createFrameState())

    const scissors = calls.filter(([name]) => name === 'scissor')
    expect(scissors).toEqual([
      ['scissor', 10, 20, 30, 40],
      ['scissor', 10, 20, 30, 40],
    ])
    const clears = calls
      .map((call, index) => [call, index])
      .filter(([[name]]) => name === 'clear')
    /** The target clear is limited; the canvas clear before composing is not */
    expect(scissorStateAt(calls, gl, clears[0][1])).toBe(true)
    expect(scissorStateAt(calls, gl, clears[1][1])).toBe(false)
    const compose = calls.findIndex(([name]) => name === 'drawArrays')
    expect(scissorStateAt(calls, gl, compose)).toBe(true)
    expect(scissorStateAt(calls, gl, calls.length)).toBe(false)
    helper.dispose()
  })

  it('draws the whole canvas once the box is used', () => {
    const helper = new WebGLHelper({ canvasCacheKey: uniqueKey() })
    const gl = helper.getGL()
    helper.setScissor([10, 20, 30, 40])
    drawOnce(helper, createFrameState())
    const calls = drawOnce(helper, createFrameState())
    expect(calls.some(([name]) => name === 'scissor')).toBe(false)
    const clear = calls.findIndex(([name]) => name === 'clear')
    expect(scissorStateAt(calls, gl, clear)).toBe(false)
    helper.dispose()
  })

  it('ignores the box with custom post processes', () => {
    const helper = new WebGLHelper({
      canvasCacheKey: uniqueKey(),
      postProcesses: [{}],
    })
    helper.setScissor([10, 20, 30, 40])
    const calls = drawOnce(helper, createFrameState())
    expect(calls.some(([name]) => name === 'scissor')).toBe(false)
    helper.dispose()
  })

  it('turns the box off before drawing to another render target', () => {
    const helper = new WebGLHelper({ canvasCacheKey: uniqueKey() })
    const gl = helper.getGL()
    gl.calls.length = 0
    helper.prepareDrawToRenderTarget(createFrameState(), {
      getSize: () => [4, 4],
      getFramebuffer: () => ({}),
      getDepthbuffer: () => ({}),
      getTexture: () => ({}),
    })
    const clear = gl.calls.findIndex(([name]) => name === 'clear')
    expect(scissorStateAt(gl.calls, gl, clear)).toBe(false)
    expect(gl.calls[0]).toEqual(['disable', gl.SCISSOR_TEST])
    helper.dispose()
  })
})

describe('shared programs', () => {
  it('links one program per shader pair and context', () => {
    const key = uniqueKey()
    const a = new WebGLHelper({ canvasCacheKey: key })
    const b = new WebGLHelper({ canvasCacheKey: key })
    const gl = a.getGL()
    gl.calls.length = 0
    const first = a.getSharedProgram('fragment', 'vertex')
    const second = b.getSharedProgram('fragment', 'vertex')
    const other = b.getSharedProgram('other fragment', 'vertex')
    expect(second).toBe(first)
    expect(other).not.toBe(first)
    expect(gl.calls.filter(([name]) => name === 'linkProgram')).toHaveLength(
      2,
    )
    a.dispose()
    b.dispose()
  })

  it('deletes the program when its last user gives it back', () => {
    const key = uniqueKey()
    const a = new WebGLHelper({ canvasCacheKey: key })
    const b = new WebGLHelper({ canvasCacheKey: key })
    const gl = a.getGL()
    const program = a.getSharedProgram('fragment', 'vertex')
    b.getSharedProgram('fragment', 'vertex')
    gl.calls.length = 0
    a.releaseSharedProgram(program)
    expect(gl.calls.some(([name]) => name === 'deleteProgram')).toBe(false)
    b.releaseSharedProgram(program)
    expect(gl.calls).toContainEqual(['deleteProgram', program])
    /** A later user links a new one */
    expect(a.getSharedProgram('fragment', 'vertex')).not.toBe(program)
    a.dispose()
    b.dispose()
  })

  it('deletes a program that is not shared at once', () => {
    const helper = new WebGLHelper({ canvasCacheKey: uniqueKey() })
    const gl = helper.getGL()
    const program = helper.getProgram('fragment', 'vertex')
    helper.releaseSharedProgram(program)
    expect(gl.calls).toContainEqual(['deleteProgram', program])
    helper.releaseSharedProgram(undefined)
    helper.dispose()
  })

  it('links again after the context is lost', () => {
    const key = uniqueKey()
    const helper = new WebGLHelper({ canvasCacheKey: key })
    const program = helper.getSharedProgram('fragment', 'vertex')
    helper
      .getCanvas()
      .dispatchEvent(new Event(ContextEventType.LOST, { cancelable: true }))
    expect(helper.getSharedProgram('fragment', 'vertex')).not.toBe(program)
    helper.dispose()
  })
})
