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
  setupFiles: ['jest-canvas-mock']
}
