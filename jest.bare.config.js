module.exports = {
  // Extremely minimal configuration
  testEnvironment: 'node', // Use Node.js environment instead of jsdom
  testMatch: ['**/bare-test.js'],
  verbose: true,
  maxWorkers: 1, // Run tests in a single process
  forceExit: true,
  testTimeout: 10000,
  bail: true,
  // Disable any preprocessors, transformers, or module mapping
  transform: {},
  moduleNameMapper: {},
  setupFilesAfterEnv: []
};
