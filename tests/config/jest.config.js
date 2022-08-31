const path = require('path')

module.exports = {
  rootDir: path.join(__dirname, '../../'),
  testEnvironment: 'jsdom',
  displayName: 'test',
  moduleFileExtensions: ['js', 'jsx','ts', 'tsx'],
  testMatch: ['<rootDir>/tests/*.tsx'],
}