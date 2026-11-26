import { Model } from '@luma.gl/engine'

/**
 * patches/@luma.gl__engine@9.1.10.patch: a model deletes the vertex arrays
 * it creates, when it is destroyed and when a new buffer layout replaces
 * one. Without it every deck.gl layer that was finalized (a hidden
 * annotation group, a spatial tile leaving the view) leaked two WebGL
 * vertex array objects.
 */
describe('@luma.gl/engine Model.destroy', () => {
  it('deletes the vertex array of the model', () => {
    const vertexArray = { destroy: jest.fn() }
    const model = {
      _destroyed: false,
      pipelineFactory: { release: jest.fn() },
      shaderFactory: { release: jest.fn() },
      pipeline: { vs: {}, fs: {} },
      _uniformStore: { destroy: jest.fn() },
      _gpuGeometry: null,
      vertexArray,
    }
    Model.prototype.destroy.call(model)
    expect(vertexArray.destroy).toHaveBeenCalledTimes(1)
    expect(model._destroyed).toBe(true)

    /** Destroying again does nothing */
    Model.prototype.destroy.call(model)
    expect(vertexArray.destroy).toHaveBeenCalledTimes(1)
  })

  it('deletes the vertex array that a new buffer layout replaces', () => {
    const oldVertexArray = { destroy: jest.fn() }
    const newVertexArray = { destroy: jest.fn() }
    const model = {
      bufferLayout: [],
      _gpuGeometry: null,
      vertexArray: oldVertexArray,
      device: { createVertexArray: jest.fn(() => newVertexArray) },
      _setPipelineNeedsUpdate: jest.fn(),
      _updatePipeline: jest.fn(() => ({})),
    }
    Model.prototype.setBufferLayout.call(model, [])
    expect(oldVertexArray.destroy).toHaveBeenCalledTimes(1)
    expect(model.vertexArray).toBe(newVertexArray)
    expect(newVertexArray.destroy).not.toHaveBeenCalled()
  })
})
