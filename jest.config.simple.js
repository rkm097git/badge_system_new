module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.simple.js'],
  testMatch: ['**/minimal.test.js'],
  verbose: true
};
