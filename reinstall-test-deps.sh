#!/bin/bash
# Script to reinstall testing dependencies

echo "Removing node_modules/@testing-library and jest-related packages..."
rm -rf node_modules/@testing-library
rm -rf node_modules/jest*

echo "Installing testing libraries..."
npm install --save-dev \
  jest@29.7.0 \
  jest-environment-jsdom@29.7.0 \
  @testing-library/jest-dom@6.5.0 \
  @testing-library/react@14.2.2 \
  @testing-library/user-event@14.5.2 \
  msw@2.2.6

echo "Creating a test jest.config.js file..."
cat > jest.config.simple.js << 'EOL'
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.simple.js'],
  testMatch: ['**/minimal.test.js'],
  verbose: true
};
EOL

echo "Creating a simplified jest.setup.js file..."
cat > jest.setup.simple.js << 'EOL'
require('@testing-library/jest-dom');
console.log('Jest setup executed');
EOL

echo "Creating a simple test file..."
mkdir -p src/__tests__
cat > src/__tests__/minimal.test.js << 'EOL'
describe('Basic test', () => {
  console.log('Starting test execution');
  
  it('adds 1 + 1 to equal 2', () => {
    console.log('Running addition test');
    expect(1 + 1).toBe(2);
  });
});
EOL

echo "Adding test script to package.json..."
# This is a simple approach - ideally we'd use a JSON parser
# but this works for a quick fix
sed -i '' 's/"test": "jest"/"test": "jest","test:minimal": "jest -c jest.config.simple.js"/' package.json

echo "Installation complete. Run 'npm run test:minimal' to test."
