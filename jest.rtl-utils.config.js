module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/rtl-utils-test.js'],
  setupFilesAfterEnv: ['./test-setup.js'],
  verbose: true,
  testTimeout: 10000
};
