# Debugging da Infraestrutura de Testes

## Visão Geral

Este documento descreve o processo de diagnóstico e resolução de problemas encontrados na infraestrutura de testes do Sistema de Badges. Durante a implementação dos testes para os componentes de configuração de regras, identificamos problemas na execução dos testes que necessitaram de uma investigação detalhada.

## Problema Identificado

Durante a tentativa de executar os testes recém-criados para os componentes de configuração de regras, encontramos o seguinte comportamento:

- Os comandos de teste (`npm test`) ficavam travados sem retornar resultados ou erros
- Não havia saída de console ou logs de erros que ajudassem a identificar o problema
- Os testes não terminavam, mesmo após longos períodos de espera

Após uma investigação detalhada, identificamos a causa raiz do problema:

**O Jest estava referenciado no package.json mas não estava corretamente instalado no projeto.**

Evidências que confirmaram esse diagnóstico:
- O binário do Jest não estava presente no diretório `node_modules/.bin`
- O diretório `node_modules/jest` não existia
- Verificações com comandos como `which jest` não retornaram resultados

## Processo de Diagnóstico

O processo de diagnóstico seguiu estas etapas:

1. **Investigação Inicial**
   - Verificamos a configuração do Jest e Next.js nos arquivos `jest.config.js` e `jest.setup.js`
   - Removemos a supressão de logs de console para visualizar possíveis erros
   - Adicionamos logs explícitos para rastrear a execução dos testes

2. **Isolamento do Problema**
   - Criamos um arquivo de teste mínimo sem dependências complexas
   - Testamos diferentes formas de invocar o Jest, incluindo scripts npm e chamada direta do binário
   - Verificamos a estrutura de diretórios e presença de arquivos necessários

3. **Verificação de Instalação**
   - Inspecionamos o diretório `node_modules/.bin` para verificar a presença do binário Jest
   - Consultamos o diretório `node_modules/jest` para confirmar a instalação do pacote
   - Tentamos executar o Jest diretamente para verificar se estava disponível no sistema

4. **Identificação da Causa Raiz**
   - Confirmamos que o Jest estava referenciado no `package.json` mas não estava instalado corretamente
   - Verificamos que os scripts de teste tentavam executar um binário que não existia
   - Identificamos que a instalação parcial ou corrompida estava causando o problema

## Solução Implementada

Para resolver o problema, criamos uma abordagem sistemática que:

1. **Limpa as instalações existentes**
   ```bash
   rm -rf node_modules/@testing-library
   rm -rf node_modules/jest*
   ```

2. **Reinstala as dependências com versões específicas**
   ```bash
   npm install --save-dev \
     jest@29.7.0 \
     jest-environment-jsdom@29.7.0 \
     @testing-library/jest-dom@6.5.0 \
     @testing-library/react@14.2.2 \
     @testing-library/user-event@14.5.2 \
     msw@2.2.6
   ```

3. **Cria configurações minimalistas para isolamento do problema**
   - `jest.config.simple.js`: Configuração simplificada sem a integração Next.js
   - `jest.setup.simple.js`: Arquivo de setup sem mocks complexos
   - Teste minimal para verificar a funcionalidade básica

4. **Implementa uma abordagem incremental**
   - Começa com testes simples sem dependências
   - Adiciona gradualmente complexidade para identificar problemas específicos
   - Isola a integração Next.js para verificar possíveis conflitos

## Script de Recuperação

Criamos um script shell (`reinstall-test-deps.sh`) que automatiza o processo de recuperação:

```bash
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
sed -i '' 's/"test": "jest"/"test": "jest","test:minimal": "jest -c jest.config.simple.js"/' package.json

echo "Installation complete. Run 'npm run test:minimal' to test."
```

## Lições Aprendidas e Melhores Práticas

A partir desta experiência, recomendamos as seguintes práticas para evitar problemas semelhantes no futuro:

1. **Verificação de Instalação**
   - Confirmar que todas as dependências estão corretamente instaladas antes de executar testes
   - Verificar a presença de binários necessários em `node_modules/.bin`
   - Considerar o uso de `npm ci` em vez de `npm install` para garantir instalações consistentes

2. **Configuração Gradual**
   - Começar com configurações mínimas e adicionar complexidade incrementalmente
   - Isolar integrações complexas (como Next.js + Jest) para facilitar o diagnóstico
   - Manter testes simples que verifiquem a infraestrutura básica

3. **Logs e Depuração**
   - Evitar a supressão completa de logs durante testes
   - Adicionar logs explícitos em pontos-chave para rastrear a execução
   - Utilizar flags como `--verbose` e `--detectOpenHandles` para diagnóstico

4. **Dependências Explícitas**
   - Especificar versões exatas de dependências para evitar incompatibilidades
   - Documentar as versões testadas e compatíveis
   - Considerar o uso de ferramentas como Dependabot para manter dependências atualizadas

## Aplicação ao Badge System

Esta abordagem de debugging nos permitirá:

1. Restabelecer a infraestrutura de testes do projeto
2. Continuar a implementação dos testes para componentes de configuração de regras
3. Garantir que os testes possam ser executados e verificados consistentemente
4. Criar uma base sólida para a expansão da cobertura de testes no futuro

Após a correção da infraestrutura de testes, poderemos prosseguir com a implementação dos testes para os componentes restantes do sistema, conforme planejado na Fase 1 do plano de refatoração.
