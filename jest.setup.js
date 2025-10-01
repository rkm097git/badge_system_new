// Importar biblioteca de matchers adicionais para DOM
// Changing import style for debugging purposes
require('@testing-library/jest-dom');

console.log('Imported testing library');

// Define a implementação global de fetch para testes
global.fetch = jest.fn();

// Mock da função window.matchMedia para testes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock da função ResizeObserver para testes
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Temporarily enabling console errors and warnings for debugging
// jest.spyOn(console, 'error').mockImplementation(() => {});
// jest.spyOn(console, 'warn').mockImplementation(() => {});

// Log when tests are starting to help with debugging
console.log('Jest setup file executed - test environment initialized');

// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
