/** Offscreen render for coloring tile frames
 *
 * @class
 * @memberof renderingEngine
 */

class RenderingEngine {
/**
 * Create a rendering engine instance.
 * This class only colors a frame (i.e. applies thresholding, 
 * opacity transparence and change the pixels' color).
 * The actual blending is perfomed in OpenLayer using the canvas2D api: 
 * 1) the OpenLayer canvas globalCompositeOperation value is updated 
 * using the OpenLayer events 'prerender' and 'postrender' (see initChannel in channel.js);
 * 2) the blending is perfomed with the globalCompositeOperation 'lighter'.
 */
  constructor(){
    this.renderCanvas = document.createElement('canvas');
    this.gl = null;
    this.texCoordBuffer;
    this.positionBuffer;
    this.isWebGLInitialized = false;

    this.definitions =
    `precision mediump float;
    uniform sampler2D u_image;
    uniform float ww;
    uniform float wc;
    uniform float minT;
    uniform float maxT;
    uniform vec3 color;
    uniform float opacity;
    varying vec2 v_texCoord;`;
  
    this.windowAndReturnRGBA =
    `// Apply window settings
      float center0 = wc - 0.5;
      float width0 = max(ww, 1.0);
      float intensity = 0.;
      if (pixelValue > minT && pixelValue < maxT) {
        intensity = (pixelValue - center0) / width0 + 0.5;
      }
  
      // Clamp intensity
      intensity = clamp(intensity, 0.0, 1.0);
      vec3 scaledColor = color * intensity;
    
      // RGBA output
      gl_FragColor = vec4(scaledColor.r, scaledColor.g, scaledColor.b, opacity);
    `;
  
    this.vertexShader = 'attribute vec2 a_position;' +
    'attribute vec2 a_texCoord;' +
    'uniform vec2 u_resolution;' +
    'varying vec2 v_texCoord;' +
    'void main() {' +
      'vec2 zeroToOne = a_position / u_resolution;' +
      'vec2 zeroToTwo = zeroToOne * 2.0;' +
      'vec2 clipSpace = zeroToTwo - 1.0;' +
      'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);' +
      'v_texCoord = a_texCoord;' +
    '}';

    this.shaders = {
      int8: this._buildShader(
      `float pixelValue = packedPixelValue.r*256.;
        if (packedPixelValue.a == 0.0)
        pixelValue = -pixelValue;`),
      int16: this._buildShader(
      `float pixelValue = packedPixelValue.r*256.0 + packedPixelValue.g*65536.0;
        if (packedPixelValue.b == 0.0)
        pixelValue = -pixelValue;`),
      uint8: this._buildShader('float pixelValue = packedPixelValue.r*256.0;'),
      uint16: this._buildShader('float pixelValue = packedPixelValue.r*256.0 + packedPixelValue.a*65536.0;'),
    }

    this.dataUtilities = {
      int8: {
        storedPixelDataToPackedData: (pixelData, width, height) => {
          // Transfer image data to alpha channel of WebGL texture
          // Store data in Uint8Array
          const numberOfChannels = 2;
          const data = new Uint8Array(width * height * numberOfChannels);
          let offset = 0;
    
          for (let i = 0; i < pixelData.length; i++) {
            data[offset++] = pixelData[i];
            data[offset++] = pixelData[i] < 0 ? 0 : 1; // 0 For negative, 1 for positive
          }
    
          return data;
        }
      },
      int16: {
        storedPixelDataToPackedData: (pixelData, width, height) => {
          // Pack int16 into three uint8 channels (r, g, b)
          const numberOfChannels = 3;
          const data = new Uint8Array(width * height * numberOfChannels);
          let offset = 0;
    
          for (let i = 0; i < pixelData.length; i++) {
            const val = Math.abs(pixelData[i]);
    
            data[offset++] = val & 0xFF;
            data[offset++] = val >> 8;
            data[offset++] = pixelData[i] < 0 ? 0 : 1; // 0 For negative, 1 for positive
          }
    
          return data;
        }
      },
      uint8: {
        storedPixelDataToPackedData: (pixelData, width, height) => {
          // Transfer image data to alpha channel of WebGL texture
          return pixelData;
        }
      },
      uint16: {
        storedPixelDataToPackedData: (pixelData, width, height) => {
          // Pack uint16 into two uint8 channels (r and a)
          const numberOfChannels = 2;
          const data = new Uint8Array(width * height * numberOfChannels);
          let offset = 0;
    
          for (let i = 0; i < pixelData.length; i++) {
            const val = pixelData[i];
    
            data[offset++] = val & 0xFF;
            data[offset++] = val >> 8;
          }
    
          return data;
        }
      }
    }  
    
    this.initRenderer();
  }

  /** Checks WebGL capabilities
   * @returns {boolean} 
   */
  isWebGLAvailable() {
    // Adapted from
    // http://stackoverflow.com/questions/9899807/three-js-detect-webgl-support-and-fallback-to-regular-canvas
  
    const options = {
      failIfMajorPerformanceCaveat: true
    };
  
    try {
      const canvas = document.createElement('canvas');
      return Boolean(window.WebGLRenderingContext) &&
        (canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options));
    } catch (e) {
      return false;
    }
  }

  /** Initializes the offscreen renders. 
   */
  initRenderer() {
    if (this.isWebGLInitialized === true) {
      return;
    }
  
    if (this._initWebGL(this.renderCanvas)) {
      this._initBuffers();
      if (!this._initShaders()) {
        throw new Error('Error in shaders linking');
      }
  
      this.isWebGLInitialized = true;
    }
  }

  /** Runs the offscreen render applying the channel visualization/presentation parameters.
   * The image is returned as dataUrl (i.e. the data are recompressed). 
   * The returned image type is image/png (lossless).
   * NOTE: The actual render time is < respect to the recompression of the data (toDataURL).
   *       Using lossy compression (jpeg), would improve the compression step. 
   *       However, the images are originally stored in the server as lossy jpeg and
   *       we would have lossy re-compression issues
   *       (al least for IDC data, https://imaging.datacommons.cancer.gov/).
   * @param {object} FrameData - interface to pass the frame data to the offscreen render 
   * @param {number[]} FrameData.pixelData - image array 
   * @param {number} FrameDataimage.bitsAllocated - bits per pixel
   * @param {number[]} FrameData.thresholdValues - clipping values
   * @param {number[]} FrameData.color - rgb color
   * @param {number} FrameData.opacity - opacity
   * @param {number} FrameData.width - horizontal image size
   * @param {number} FrameData.height - vertical image size
   * 
   * @returns {string} dataUrl of the generated image.
   */
  colorImageFrame(frameData) {
    const renderedCanvas = this._render(
      frameData.pixelData, 
      frameData.columns, 
      frameData.rows, 
      frameData.color, 
      frameData.opacity, 
      frameData.thresholdValues, 
      frameData.bitsAllocated
    );

    return renderedCanvas.toDataURL('image/png');

    // NOTE: ToBlob is async and provides smaller images,
    // but here teh renderingEngine is sequential (one object, one gl context, etc..)
  }

  /** Builds coloring shader
   *
   * @param {string} intensityComputationString - intensity computation on the the input image data type
   * @returns {string} shaderStr
   * @private
   */
  _buildShader(intensityComputationString) {
    const shader = {};
    shader.fragSource = `
    ${this.definitions}
  
    void main() {
      // Get texture
      vec4 packedPixelValue = texture2D(u_image, v_texCoord);
      
      // Calculate luminance from packed texture
      ${intensityComputationString}
      
      ${this.windowAndReturnRGBA}
    }`;
  
    return shader
  }

  /** Initializes WebGL
   *
   * @param {obecjt} canvas
   * @returns {obecjt} webgl context
   * @private
   */
  _initWebGL(canvas) {
    this.gl = null;
    try {
      // Try to grab the standard context. If it fails, fallback to experimental.
      const options = {
        preserveDrawingBuffer: true // Preserve buffer so we can copy to display canvas element
      };
  
      this.gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
  
      // Set up event listeners for context lost / context restored
      canvas.removeEventListener('webglcontextlost', this._handleLostContext, false);
      canvas.addEventListener('webglcontextlost', this._handleLostContext, false);
  
      canvas.removeEventListener('webglcontextrestored', this._handleRestoredContext, false);
      canvas.addEventListener('webglcontextrestored', this._handleRestoredContext, false);
  
    } catch (error) {
      throw new Error('Error creating WebGL context');
    }
  
    // If we don't have a GL context, give up now
    if (!this.gl) {
      console.error('Unable to initialize WebGL. Your browser may not support it.');
      this.gl = null;
    }
  
    return this.gl;
  }

  /** Notifies webgl context lost
   *
   * @param event - 'webglcontextlost' event
   * @private
   */
  _handleLostContext(event) {
    event.preventDefault();
    console.warn('WebGL Context Lost!');
  }

  /** Reinitializes webgl context
   *
   * @param event - 'webglcontextrestored' event
   * @private
   */
  _handleRestoredContext(event) {
    event.preventDefault();
    this.isWebGLInitialized = false;
  
    this.initRenderer();
  }

  /** Initializes buffers
   *
   * @private
   */
  _initBuffers() {
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      1, 1,
      0, 1,
      1, 0,
      0, 0
    ]), this.gl.STATIC_DRAW);
  
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      1.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      0.0, 0.0
    ]), this.gl.STATIC_DRAW);
  }

  /** Initializes shaders
   *
   * @returns {boolean} success
   * @private
   */
  _initShaders() {
    let ext = this.gl.getExtension('KHR_parallel_shader_compile');
    for (const id in this.shaders) {
      const shader = this.shaders[id];
      shader.vertexSource = this.vertexShader
  
      shader.attributes = {};
      shader.uniforms = {};
  
      shader.program = this._createProgramFromString(this.gl, shader);

      if (ext) {
        if (this.gl.getProgramParameter(shader.program, ext.COMPLETION_STATUS_KHR)) {
          if (!this._shadersLinked(this.gl, shader.program, shader.compiledVertexShader, shader.compiledFragShader)) {
            return false;
          }
        }
      } else {
        if (!this._shadersLinked(this.gl, shader.program, shader.compiledVertexShader, shader.compiledFragShader)) {
          return false;
        }
      }

      this._cleanShaders(this.gl, shader.program, shader.compiledVertexShader, shader.compiledFragShader);
  
      shader.attributes.texCoordLocation = this.gl.getAttribLocation(shader.program, 'a_texCoord');
      this.gl.enableVertexAttribArray(shader.attributes.texCoordLocation);
  
      shader.attributes.positionLocation = this.gl.getAttribLocation(shader.program, 'a_position');
      this.gl.enableVertexAttribArray(shader.attributes.positionLocation);
  
      shader.uniforms.resolutionLocation = this.gl.getUniformLocation(shader.program, 'u_resolution');
    }

    return true;
  }

  /** Checks is shaders have been linked successfully
   *
   * @param {object} gl - webgl context
   * @param {object} program - webgl program
   * @param {object} vertexShader - vertex shader 
   * @param {object} fragmentShader - fragment shader
   * @returns {boolean} success
   * @private
   */
  _shadersLinked(gl, program, vertexShader, fragmentShader) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
      console.error('Link failed: ' + gl.getProgramInfoLog(program));
      console.error('Vertex Shader info-log: ' + gl.getShaderInfoLog(vertexShader));
      console.error('Frag Shader info-log: ' + gl.getShaderInfoLog(fragmentShader));
      return false;
    }

    return true;
  }

  /** Claens compiled shaders
   *
   * @param {object} gl - webgl context
   * @param {object} program - webgl program
   * @param {object} vertexShader - vertex shader 
   * @param {object} fragmentShader - fragment shader
   * @returns {boolean} success
   * @private
   */
  _cleanShaders(gl, program, vertexShader, fragmentShader) {
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }

  /** Creates a webgl program
   *
   * @param {object} gl - webgl context 
   * @param {object} shader - object containing the vertexSource and fragSource strings
   * @returns {object} webgl program
   * @private
   */
  _createProgramFromString(gl, shader) {
    shader.compiledVertexShader = this._compileShader(gl, shader.vertexSource, gl.VERTEX_SHADER);
    shader.compiledFragShader = this._compileShader(gl, shader.fragSource, gl.FRAGMENT_SHADER);
    return this._createProgram(gl, shader.compiledVertexShader, shader.compiledFragShader);
  }

  /** Compiles a shader
   *
   * @param {object} gl - webgl context
   * @param {string} shaderSource - shader source
   * @param {number} shaderType - shader type
   * @returns compiled shader
   * @private
   */
  _compileShader(gl, shaderSource, shaderType) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    return shader;
  }

  /** Creates a webgl program
   *
   * @param {object} gl - webgl context 
   * @param {object} vertexShader - vertex shader 
   * @param {object} fragmentShader - fragment shader
   * @returns {object} webgl program
   * @private
   */
  _createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    return program;
  }

  /** Renders the image
   *
   * @param {number[]} pixelData - image array
   * @param {number} width - horizontal dimension of the image 
   * @param {number} height - vertical dimension of the image 
   * @param {number[]} color - rgb color
   * @param {number} opacity - opacity
   * @param {number[]} thresholdValues - clipping values
   * @param {number} bitsAllocated - image bits per pixel
  
   * @returns {object} canvas
   * @private
   */
  _render(pixelData, width, height, color, opacity, thresholdValues, bitsAllocated) {
    // Resize the canvas
    this.renderCanvas.width = width;
    this.renderCanvas.height = height;
  
    // Render the current image
    const shader = this._getShaderProgram(pixelData);
    const texture = this._generateTexture(pixelData, width, height);
  
    const clippingRange = [...thresholdValues];
    const colorFunctionRange = [0, 255];
    if (bitsAllocated === 16) {
      // 8 bit [0,255]
      // 16 bit [0,65536+255]
      const convertFactor = (65793.) / 255.;
      clippingRange[0] *= convertFactor;
      clippingRange[1] *= convertFactor;
      colorFunctionRange[0] *= convertFactor;
      colorFunctionRange[1] *= convertFactor;
    }
  
    const windowCenter = (colorFunctionRange[0] + colorFunctionRange[1]) * 0.5;
    const windowWidth = colorFunctionRange[1] - colorFunctionRange[0];
  
    const parameters = {
      u_resolution: { type: '2f',
        value: [width, height] },
      wc: { type: 'f',
        value: windowCenter },
      ww: { type: 'f',
        value: windowWidth },
      minT: { type: 'f',
        value: clippingRange[0] },
      maxT: { type: 'f',
        value: clippingRange[1] },
      opacity: { type: 'f',
        value: opacity },
      color: { type: '3f',
        value: color },
    };
  
    this._renderQuad(shader, parameters, texture.texture, width, height);
  
    return this.renderCanvas;
  }

  /** Gets shader
   *
   * @param {number[]} pixelData - image array
   * @returns {object} shaders
   * @private
   */
  _getShaderProgram(pixelData) {
    const datatype = this._getImageDataType(pixelData);
    if (this.shaders.hasOwnProperty(datatype)) {
      return this.shaders[datatype];
    }
  
    return this.shaders.rgb;
  }

  /** Generates texture
   *
   * @param {number[]} pixelData - image array
   * @param {number} width - horizontal dimension of the image 
   * @param {number} height - vertical dimension of the image 
   * @returns {object} texture, {number} size in bytes
   * @private
   */
  _generateTexture(pixelData, width, height) {
    const TEXTURE_FORMAT = {
      uint8: this.gl.LUMINANCE,
      int8: this.gl.LUMINANCE_ALPHA,
      uint16: this.gl.LUMINANCE_ALPHA,
      int16: this.gl.RGB,
    };
  
    const TEXTURE_BYTES = {
      int8: 1, // Luminance
      uint16: 2, // Luminance + Alpha
      int16: 3, // RGB
    };
  
    const imageDataType = this._getImageDataType(pixelData);
    const format = TEXTURE_FORMAT[imageDataType];
  
    // GL texture configuration
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
  
    const imageData = this.dataUtilities[imageDataType].storedPixelDataToPackedData(pixelData, width, height);
  
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, format, width, height, 0, format, this.gl.UNSIGNED_BYTE, imageData);
  
    // Calculate the size in bytes of this image in memory
    const sizeInBytes = width * height * TEXTURE_BYTES[imageDataType];
  
    return {
      texture,
      sizeInBytes
    };
  }

  /** Returns the image type
   *
   * @param {number[]} pixelData - image array
   * @returns {string} image type
   * @private
   */
  _getImageDataType(pixelData) {
    if (pixelData instanceof Int16Array) {
      return 'int16';
    } else if (pixelData instanceof Uint16Array) {
      return 'uint16';
    } else if (pixelData instanceof Int8Array) {
      return 'int8';
    }
  
    return 'uint8';
  }

  /** Renders the image
   *
   * @param {object} shader
   * @param {object} parameters - shader input parameters
   * @param {object} texture
   * @param {number} width - horizontal dimension of the image 
   * @param {number} height - vertical dimension of the image 
   * @private
   */
  _renderQuad(shader, parameters, texture, width, height) {
    this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
    this.gl.viewport(0, 0, width, height);
  
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.useProgram(shader.program);
  
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.vertexAttribPointer(shader.attributes.texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
  
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.vertexAttribPointer(shader.attributes.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  
    for (const key in parameters) {
      const uniformLocation = this.gl.getUniformLocation(shader.program, key);
      const uniform = parameters[key];
  
      const type = uniform.type;
      const value = uniform.value;
  
      if (type === 'i') {
        this.gl.uniform1i(uniformLocation, value);
      } else if (type === 'f') {
        this.gl.uniform1f(uniformLocation, value);
      } else if (type === '2f') {
        this.gl.uniform2f(uniformLocation, value[0], value[1]);
      } else if (type === '3f') {
        this.gl.uniform3f(uniformLocation, value[0], value[1], value[2]);
      }
    }
  
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      width, height,
      0, height,
      width, 0,
      0, 0]), this.gl.STATIC_DRAW);
  
    this.gl.activeTexture(this.gl.TEXTURE0);
  
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}

export {
  RenderingEngine,
};
