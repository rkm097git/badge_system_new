#!/bin/bash
# Script to complete the repair of testing infrastructure

echo "=== Testing Infrastructure Repair - Next Steps ==="
echo "This script will install necessary dependencies and create proper configurations."

echo -e "\n[1/5] Installing Babel and related dependencies..."
npm install --save-dev \
  @babel/core \
  @babel/preset-env \
  @babel/preset-react \
  @babel/preset-typescript \
  babel-jest \
  identity-obj-proxy

echo -e "\n[2/5] Creating proper Babel configuration..."
cat > babel.config.js << 'EOL'
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
};
EOL

echo -e "\n[3/5] Creating React test file..."
mkdir -p src/test-examples
cat > src/test-examples/Button.jsx << 'EOL'
import React from 'react';

export const Button = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  );
};
EOL

echo -e "\n[4/5] Creating test for React component..."
cat > src/test-examples/Button.test.jsx << 'EOL'
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button component', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
EOL

echo -e "\n[5/5] Creating Jest config for React tests..."
cat > jest.react-components.config.js << 'EOL'
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  testMatch: ['<rootDir>/src/test-examples/**/*.test.{js,jsx}'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  verbose: true,
};
EOL

echo -e "\nCreating test setup file..."
cat > test-setup.js << 'EOL'
import '@testing-library/jest-dom';
console.log('Test setup executed');
EOL

echo -e "\nAdding test scripts to package.json..."
# Use temporary file to avoid issues with quotes and sed
cat > update_scripts.js << 'EOL'
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Update scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "test:react": "jest -c jest.react-components.config.js",
  "test:simple": "jest -c jest.bare.config.js",
};

// Write updated package.json
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
EOL

node update_scripts.js
rm update_scripts.js

echo -e "\n=== Setup complete! ==="
echo "Run 'npm run test:react' to test React components"
echo "Run 'npm run test:simple' to run simple tests"
