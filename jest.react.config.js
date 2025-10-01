module.exports = {
  // Simple configuration for React testing
  testEnvironment: 'jsdom',
  testMatch: ['**/react-test.js'],
  verbose: true,
  maxWorkers: 1,
  forceExit: true,
  testTimeout: 10000,
  bail: true,
  // Setup React testing
  setupFilesAfterEnv: ['./jest.react.setup.js']
};
