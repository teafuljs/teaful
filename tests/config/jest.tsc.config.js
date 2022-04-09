const path = require('path')

// jest-runner-tsc doesn't run tests. It runs the tsc (typescript compiler) 
// on the typescript files. Then, it make sense to test that there aren't 
// TypeScript issues on the tests (tests are using the Teaful types).
module.exports = {
  rootDir: path.join(__dirname, '../../'),
  runner: 'jest-runner-tsc',
  displayName: 'tsc',
  moduleFileExtensions: ['js', 'jsx','ts', 'tsx'],
  testMatch: ['<rootDir>/tests/*.tsx'],
};
