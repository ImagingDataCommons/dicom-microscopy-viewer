module.exports = {
  verbose: true,
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '\\.(css|less|sass|scss)$': '<rootDir>/src/__mocks__/styleMock.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(ol)/)' // <- exclude the OL lib
  ],
  testMatch: ['<rootDir>/src/**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['js']
}
