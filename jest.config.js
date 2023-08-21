module.exports = {
  verbose: true,
  testEnvironment: 'jsdom',
  roots: [
    '<rootDir>',
    '<rootDir>/src'
  ],
  moduleDirectories: [
    'node_modules'
  ],
  moduleFileExtensions: ['js', 'wasm', 'json'],
  transform: {
    '^.+wasm.*\\.js$': '<rootDir>/src/__mocks__/emscriptenMock.js',
    '^.+\\.js$': 'babel-jest',
    '\\.(css|less|sass|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(wasm)$': '<rootDir>/src/__mocks__/wasmMock.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(ol|@cornerstonejs|dicomicc)/)' // <- transform libraries
  ],
  testMatch: [
    '<rootDir>/src/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules'
  ],
  setupFiles: ['jest-canvas-mock'],
  moduleNameMapper: {
    '@cornerstonejs/codec-libjpeg-turbo-8bit/decodewasmjs': '@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm_decode',
    '@cornerstonejs/codec-libjpeg-turbo-8bit/decodewasm': '@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm_decode.wasm',
    '@cornerstonejs/codec-charls/decodewasmjs': '@cornerstonejs/codec-charls/dist/charlswasm_decode.js',
    '@cornerstonejs/codec-charls/decodewasm': '@cornerstonejs/codec-charls/dist/charlswasm_decode.wasm',
    '@cornerstonejs/codec-openjpeg/decodewasmjs': '@cornerstonejs/codec-openjpeg/dist/openjpegwasm_decode.js',
    '@cornerstonejs/codec-openjpeg/decodewasm': '@cornerstonejs/codec-openjpeg/dist/openjpegwasm_decode.wasm'
  }
}
