module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/simplified-react-test.js'],
  setupFilesAfterEnv: ['./test-setup.js'],
  verbose: true,
  testTimeout: 10000
};
