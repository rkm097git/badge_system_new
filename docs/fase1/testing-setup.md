# Testing Infrastructure Setup

## Overview

Este documento descreve a configuração da infraestrutura de testes para o projeto Badge System, com foco na implementação de testes unitários e de integração como parte da Fase 1 do plano de refatoração.

## Stack de Testes

A infraestrutura de testes utiliza as seguintes ferramentas:

- **Jest**: Framework principal de testes
- **React Testing Library**: Para testar componentes React de forma centrada no usuário
- **jest-environment-jsdom**: Ambiente JSDOM para Jest simular o ambiente do navegador
- **@testing-library/user-event**: Para simular interações do usuário
- **msw**: Para mockar requisições de API durante os testes

## Instalação

Para instalar todas as dependências necessárias, execute:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom msw
```

## Configuração

### Configuração do Jest

A configuração do Jest é definida no arquivo `jest.config.js` na raiz do projeto:

```javascript
// jest.config.js
const nextJest = require('next/jest');

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
```

### Arquivo de Configuração do Jest

O arquivo de configuração inclui as configurações globais aplicadas antes de cada teste:

```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Estender o expect do Jest com utilitários de teste DOM
import { expect } from '@jest/globals';
```

### Atualização de Scripts

Atualização da seção de scripts do `package.json` para incluir comandos de teste:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## Estrutura de Testes

Os testes são organizados por feature e componente, espelhando a estrutura do projeto:

```
src/
└── features/
    └── rules/
        └── components/
            └── __tests__/
                ├── RuleForm.test.tsx
                ├── RuleBasicInfo.test.tsx
                └── ...
```

## Padrões de Teste

### Padrão de Teste de Componente

```typescript
// Exemplo de estrutura de teste de componente
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  // Configuração do teste - renderiza o componente com props necessárias
  const setup = (props = {}) => {
    const defaultProps = {
      // Props padrão aqui
    };
    
    return render(
      <ComponentName {...defaultProps} {...props} />
    );
  };

  // Testar renderização e funcionalidade básica
  it('renderiza corretamente', () => {
    setup();
    expect(screen.getByText('Texto Esperado')).toBeInTheDocument();
  });

  // Testar interações do usuário
  it('lida com interação do usuário', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    setup({ onChange: handleChange });
    
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(handleChange).toHaveBeenCalled();
  });

  // Testar renderização condicional
  it('mostra mensagem de erro quando a prop error é fornecida', () => {
    setup({ error: 'Mensagem de erro' });
    expect(screen.getByText('Mensagem de erro')).toBeInTheDocument();
  });
});
```

### Mock de API com MSW

Para testes envolvendo requisições de API, o MSW (Mock Service Worker) será usado:

```typescript
// Exemplo de configuração de mock de API
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Definir mocks de API
const server = setupServer(
  rest.get('/api/rules', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Regra 1' },
        { id: '2', name: 'Regra 2' }
      ])
    );
  }),
  
  rest.post('/api/rules', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: '3', ...req.body })
    );
  })
);

// Iniciar servidor antes de todos os testes
beforeAll(() => server.listen());

// Resetar handlers após cada teste
afterEach(() => server.resetHandlers());

// Fechar servidor após todos os testes
afterAll(() => server.close());
```

## Metas de Cobertura de Código

A estratégia de testes visa as seguintes metas de cobertura de código:

- **Declarações**: 80%
- **Ramificações**: 75%
- **Funções**: 85%
- **Linhas**: 80%

## Próximos Passos

1. Criar arquivos de teste base para todos os componentes refatorados
2. Implementar testes para lógica de validação
3. Criar testes de integração para fluxo completo do formulário
4. Configurar pipeline de CI para testes automatizados
