const nextJest = require('next/jest');

// Add this debugging output
console.log('Configuring Jest for Next.js project');

const createJestConfig = nextJest({
  // Caminho para o diretório da aplicação Next.js
  dir: './',
});

// Configuração personalizada do Jest
const customJestConfig = {
  // Arquivos de configuração a serem executados antes de cada teste
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Ambiente de teste para operações DOM
  testEnvironment: 'jest-environment-jsdom',
  // Padrões de arquivos de teste
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  // Mapeamentos de nome de módulo
  moduleNameMapper: {
    // Lidar com aliases de módulo
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  // Diretórios a serem ignorados
  coveragePathIgnorePatterns: ['/node_modules/', '/.next/'],
};

// Exportar a configuração mesclada
module.exports = createJestConfig(customJestConfig);
