// jest-runner-tsc doesn't run tests. It runs the tsc (typescript compiler) 
// on the typescript files.
module.exports = {
  runner: 'jest-runner-tsc',
  displayName: 'tsc',
  moduleFileExtensions: ['js', 'jsx','ts', 'tsx'],
  testMatch: ['<rootDir>/tests/*.tsx'],
};