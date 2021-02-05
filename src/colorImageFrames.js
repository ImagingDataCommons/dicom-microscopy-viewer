
const renderCanvas = document.createElement('canvas');
var gl = null;
var texCoordBuffer;
var positionBuffer;
var isWebGLInitialized = false;

const definitions =
  `precision mediump float;
  uniform sampler2D u_image;
  uniform float ww;
  uniform float wc;
  varying vec2 v_texCoord;`;

const windowAndReturnRGBA =
  `// Apply window settings
    float center0 = wc - 0.5;
    float width0 = max(ww, 1.0);
    intensity = (intensity - center0) / width0 + 0.5;

    // Clamp intensity
    intensity = clamp(intensity, 0.0, 1.0);
  
    // TODO: Apply colorLUT from 0-1 grayscale to RGB
    // return as gl_FragColor = vec4(color.r, color.g, color.b, color.a);

    // RGBA output
    gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
  `;

function buildShader(intensityComputationString) {
  const shader = {};
  shader.frag = `
  ${definitions}

  void main() {
    // Get texture
    vec4 color = texture2D(u_image, v_texCoord);
    
    // Calculate luminance from packed texture
    ${intensityComputationString}
    
    ${windowAndReturnRGBA}
  }`;

  return shader
}

const shaders = {
  int8: buildShader(
  `float intensity = color.r*256.;
    if (color.a == 0.0)
      intensity = -intensity;`),
  int16: buildShader(
  `float intensity = color.r*256.0 + color.g*65536.0;
    if (color.b == 0.0)
      intensity = -intensity;`),
  uint8: buildShader('float intensity = color.r*256.0;'),
  uint16: buildShader('float intensity = color.r*256.0 + color.a*65536.0;'),
}

const vertexShader = 'attribute vec2 a_position;' +
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

const dataUtilities = {
  int8: {
    storedPixelDataToImageData: (pixelData, width, height) => {
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
    storedPixelDataToImageData: (pixelData, width, height) => {
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
    storedPixelDataToImageData: (pixelData, width, height) => {
      // Transfer image data to alpha channel of WebGL texture
      return pixelData;
    }
  },
  uint16: {
    storedPixelDataToImageData: (pixelData, width, height) => {
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

function isWebGLAvailable () {
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

function compileShader (gl, shaderSource, shaderType) {

  // Create the shader object
  const shader = gl.createShader(shaderType);

  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check if it compiled
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!success && !gl.isContextLost()) {
    // Something went wrong during compilation; get the error
    const infoLog = gl.getShaderInfoLog(shader);

    console.error(`Could not compile shader:\n${infoLog}`);
  }

  return shader;
}

function createProgram (gl, vertexShader, fragmentShader) {

  // Create a program.
  const program = gl.createProgram();

  // Attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program.
  gl.linkProgram(program);

  // Check if it linked.
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (!success && !gl.isContextLost()) {
    // Something went wrong with the link
    const infoLog = gl.getProgramInfoLog(program);

    console.error(`WebGL program filed to link:\n${infoLog}`);
  }

  return program;
}

function createProgramFromString (gl, vertexShaderSrc, fragShaderSrc) {
  const compiledVertexShader = compileShader(gl, vertexShaderSrc, gl.VERTEX_SHADER);
  const compiledFragShader = compileShader(gl, fragShaderSrc, gl.FRAGMENT_SHADER);
  return createProgram(gl, compiledVertexShader, compiledFragShader);
}

function initShaders () {
  for (const id in shaders) {
    const shader = shaders[id];
    shader.vertex = vertexShader

    shader.attributes = {};
    shader.uniforms = {};

    shader.program = createProgramFromString(gl, shader.vertex, shader.frag);

    shader.attributes.texCoordLocation = gl.getAttribLocation(shader.program, 'a_texCoord');
    gl.enableVertexAttribArray(shader.attributes.texCoordLocation);

    shader.attributes.positionLocation = gl.getAttribLocation(shader.program, 'a_position');
    gl.enableVertexAttribArray(shader.attributes.positionLocation);

    shader.uniforms.resolutionLocation = gl.getUniformLocation(shader.program, 'u_resolution');
  }
}

function initRenderer () {
  if (isWebGLInitialized === true) {
    return;
  }

  if (initWebGL(renderCanvas)) {
    initBuffers();
    initShaders();

    isWebGLInitialized = true;
  }
}

function updateRectangle (gl, width, height) {
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    width, height,
    0, height,
    width, 0,
    0, 0]), gl.STATIC_DRAW);
}

function handleLostContext (event) {
  event.preventDefault();
  console.warn('WebGL Context Lost!');
}

function handleRestoredContext (event) {
  event.preventDefault();
  isWebGLInitialized = false;

  initRenderer();
}

function initWebGL (canvas) {
  gl = null;
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    const options = {
      preserveDrawingBuffer: true // Preserve buffer so we can copy to display canvas element
    };

    gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);

    // Set up event listeners for context lost / context restored
    canvas.removeEventListener('webglcontextlost', handleLostContext, false);
    canvas.addEventListener('webglcontextlost', handleLostContext, false);

    canvas.removeEventListener('webglcontextrestored', handleRestoredContext, false);
    canvas.addEventListener('webglcontextrestored', handleRestoredContext, false);

  } catch (error) {
    throw new Error('Error creating WebGL context');
  }

  // If we don't have a GL context, give up now
  if (!gl) {
    console.error('Unable to initialize WebGL. Your browser may not support it.');
    gl = null;
  }

  return gl;
}

function getImageDataType (pixelData) {
  if (pixelData instanceof Int16Array) {
    return 'int16';
  } else if (pixelData instanceof Uint16Array) {
    return 'uint16';
  } else if (pixelData instanceof Int8Array) {
    return 'int8';
  }

  return 'uint8';
}

function getShaderProgram (pixelData) {
  const datatype = getImageDataType(pixelData);
  if (shaders.hasOwnProperty(datatype)) {
    return shaders[datatype];
  }

  return shaders.rgb;
}

function generateTexture (pixelData, width, height) {
  const TEXTURE_FORMAT = {
    uint8: gl.LUMINANCE,
    int8: gl.LUMINANCE_ALPHA,
    uint16: gl.LUMINANCE_ALPHA,
    int16: gl.RGB,
  };

  const TEXTURE_BYTES = {
    int8: 1, // Luminance
    uint16: 2, // Luminance + Alpha
    int16: 3, // RGB
  };

  const imageDataType = getImageDataType(pixelData);
  const format = TEXTURE_FORMAT[imageDataType];

  // GL texture configuration
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  const imageData = dataUtilities[imageDataType].storedPixelDataToImageData(pixelData, width, height);

  gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, imageData);

  // Calculate the size in bytes of this image in memory
  const sizeInBytes = width * height * TEXTURE_BYTES[imageDataType];

  return {
    texture,
    sizeInBytes
  };
}

function initBuffers () {
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1, 1,
    0, 1,
    1, 0,
    0, 0
  ]), gl.STATIC_DRAW);

  texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    0.0, 0.0
  ]), gl.STATIC_DRAW);
}

function renderQuad (shader, parameters, texture, width, height) {
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.viewport(0, 0, width, height);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shader.program);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(shader.attributes.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(shader.attributes.positionLocation, 2, gl.FLOAT, false, 0, 0);

  for (const key in parameters) {
    const uniformLocation = gl.getUniformLocation(shader.program, key);
    const uniform = parameters[key];

    const type = uniform.type;
    const value = uniform.value;

    if (type === 'i') {
      gl.uniform1i(uniformLocation, value);
    } else if (type === 'f') {
      gl.uniform1f(uniformLocation, value);
    } else if (type === '2f') {
      gl.uniform2f(uniformLocation, value[0], value[1]);
    }
  }

  updateRectangle(gl, width, height);

  gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function render (pixelData, width, height, color, windowCenter, windowWidth) {
  // Resize the canvas
  renderCanvas.width = width;
  renderCanvas.height = height;

  // Render the current image
  const shader = getShaderProgram(pixelData);
  const texture = generateTexture(pixelData, width, height);

  // To DO: add color parameter
  const parameters = {
    u_resolution: { type: '2f',
      value: [width, height] },
    wc: { type: 'f',
      value: windowCenter },
    ww: { type: 'f',
      value: windowWidth },
  };

  renderQuad(shader, parameters, texture.texture, width, height);

  return renderCanvas;
}

initRenderer();

function colorImageFrames(frameData) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  const range = frameData.contrastLimitsRange
  const windowCenter = ( range[0] + range[1] ) * 0.5
  const windowWidth = range[1] - range[0]

  const renderedCanvas = render(frameData.pixelData, frameData.width, frameData.height, frameData.color, windowWidth, windowCenter);
  context.drawImage(renderedCanvas, 0, 0);

  console.info("check2:", context.getImageData(0, 0, frameData.width, frameData.height).data)
  return canvas.toDataURL('image/png');
}

export {
  colorImageFrames,
};
