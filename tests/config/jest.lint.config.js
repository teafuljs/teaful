const path = require('path')

module.exports = {
  rootDir: path.join(__dirname, '../../'),
  runner: 'jest-runner-eslint',
  displayName: 'lint',
  testMatch: ['<rootDir>/tests/*.tsx'],
};
