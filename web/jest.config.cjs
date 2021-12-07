module.exports = {
  name: 'unit',
  displayName: 'web',
  roots: [
    '<rootDir>'
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|js?|tsx?|ts?|mjs?)$',
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest'
  },
  moduleDirectories: ['node_modules'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '/node_modules/',
    'data.js'
  ],
  moduleFileExtensions: ['js', 'jsx', 'mjs'],
  setupFilesAfterEnv: [
    '<rootDir>/setupTests.js'
  ],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy'
  }
}
