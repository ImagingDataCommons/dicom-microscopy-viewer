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
    '^.+\\.js$': 'babel-jest',
    '\\.(css|less|sass|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(wasm)$': "<rootDir>/src/__mocks__/fileMock.js"
  },
  transformIgnorePatterns: [
    'node_modules/(?!(ol|@cornerstonejs)/)', // <- exclude the OL lib
  ],
  testMatch: [
    '<rootDir>/src/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules'
  ]
}
