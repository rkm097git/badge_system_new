# Implementação de Testes - Fase 1

## Visão Geral

Este documento descreve a implementação da infraestrutura de testes e os testes iniciais criados para o Sistema de Badges como parte da Fase 1 do plano de refatoração atualizado. O objetivo é estabelecer uma base sólida para testes automatizados que garantam a qualidade e estabilidade do código à medida que o projeto evolui.

## Infraestrutura Implementada

### Ferramentas de Teste

A infraestrutura de testes utiliza as seguintes ferramentas:

- **Jest**: Framework principal de testes
- **React Testing Library**: Para testar componentes React de forma centrada no usuário
- **jest-environment-jsdom**: Ambiente para simular o DOM durante os testes
- **@testing-library/user-event**: Para simular interações do usuário
- **MSW (Mock Service Worker)**: Para mockar requisições de API

### Arquivos de Configuração

Foram criados os seguintes arquivos de configuração:

1. **jest.config.js**: Configuração principal do Jest, incluindo:
   - Integração com Next.js
   - Configuração do ambiente JSDOM
   - Padrões de arquivos de teste
   - Mapeamento de módulos para aliases

2. **jest.setup.js**: Configuração de setup global para todos os testes:
   - Import de matchers adicionais para DOM
   - Mocks globais para APIs de navegador (fetch, matchMedia, ResizeObserver)
   - Supressão de erros de console durante testes

3. **package.json**: Scripts de teste adicionados:
   - `test`: Executa todos os testes
   - `test:watch`: Executa testes em modo de observação
   - `test:coverage`: Executa testes e gera relatório de cobertura

### Utilitários de Teste

Foram criados os seguintes utilitários para facilitar a escrita de testes:

1. **test-utils.tsx**: Utilitários para renderização de componentes:
   - Função de renderização customizada com providers (React Query)
   - Helper para criar mocks de funções onChange
   - Re-exportação de utilitários do React Testing Library

2. **mocks/server.ts e mocks/handlers.ts**: Configuração de MSW para simulação de API:
   - Handlers para todos os endpoints da API (/api/rules)
   - Dados mock para simular respostas de API
   - Validação básica para simular erros

## Testes Implementados

### Componentes Utilitários

#### ErrorMessage

Testes unitários para o componente ErrorMessage:
- Renderização correta de mensagens de erro
- Não renderização quando a mensagem é vazia
- Não renderização quando a prop `show` é false
- Verificação de classes CSS corretas

### Componentes de Formulário

#### RuleBasicInfo

Testes para o componente de informações básicas:
- Renderização inicial com dados fornecidos
- Chamada de onChange quando campos são alterados
- Exibição de mensagens de erro
- Aplicação de classes visuais para campos com erro
- Atributos de acessibilidade

#### RuleTypeSelection

Testes para o componente de seleção de tipo de regra:
- Renderização inicial com tipo padrão
- Interação de seleção de tipo de regra
- Exibição de mensagens de erro
- Chamada de callbacks apropriados

### Componentes de Configuração de Regras

#### RuleTypeConfig

Testes para o componente de roteamento de configuração:
- Renderização da mensagem padrão sem tipo selecionado
- Renderização do componente correto para cada tipo de regra
- Passagem correta de props para os componentes filhos
- Manipulação correta dos callbacks

#### PointsRuleConfig

Testes detalhados para o componente de configuração de regras de pontuação:
- Renderização inicial sem eventos
- Renderização com eventos pré-existentes
- Adição e remoção de eventos
- Atualização de tipo e peso de eventos
- Validação e exibição de erros
- Interações com o formulário principal

#### DirectAssignmentConfig

Testes para o componente de configuração de atribuição direta:
- Renderização inicial sem perfis selecionados
- Alternância de seleção de perfis
- Atualização de limite de atribuições
- Exibição e manipulação de erros
- Feedback visual para o usuário

#### EventCountConfig

Testes para o componente de configuração de contagem de eventos:
- Renderização com valores padrão
- Atualização de todos os campos (tipo de evento, ocorrências, streak, período)
- Validação de limites mínimos para valores numéricos
- Exibição do resumo da regra com dados completos
- Feedback visual para erros e validação

#### RankingConfig

Testes para o componente de configuração de regras de ranking:
- Renderização inicial com valores padrão
- Seleção de ranking e atualização de posição necessária
- Validação de limites mínimos para a posição
- Exibição do resumo da regra com nome correto do ranking
- Tratamento de casos extremos (sem rankings disponíveis)

#### RuleForm

Testes de integração para o formulário principal:
- Renderização do formulário de criação
- Carregamento de dados para o formulário de edição
- Indicador de carregamento
- Submissão do formulário e chamada à API
- Validação de campos obrigatórios
- Tratamento de erros da API
- Comportamento de cancelamento

## Estrutura de Diretórios

Os testes seguem uma estrutura espelhando a organização do código:

```
src/
├── features/
│   └── rules/
│       └── components/
│           ├── RuleForm/
│           │   └── __tests__/
│           │       ├── DirectAssignmentConfig.test.tsx
│           │       ├── EventCountConfig.test.tsx
│           │       ├── PointsRuleConfig.test.tsx
│           │       ├── RankingConfig.test.tsx
│           │       ├── RuleBasicInfo.test.tsx
│           │       ├── RuleForm.test.tsx
│           │       ├── RuleTypeConfig.test.tsx
│           │       └── RuleTypeSelection.test.tsx
│           └── ui/
│               └── __tests__/
│                   └── ErrorMessage.test.tsx
└── test/
    ├── test-utils.tsx
    └── mocks/
        ├── handlers.ts
        └── server.ts
```

## Padrões de Testes Aplicados

Os testes implementados seguem um conjunto de padrões consistentes:

1. **Padrão AAA (Arrange, Act, Assert)**:
   - Arrange: Configuração do ambiente e dados de teste
   - Act: Execução da ação a ser testada
   - Assert: Verificação dos resultados esperados

2. **Testes Isolados**:
   - Mocks de componentes filhos para testar componentes isoladamente
   - Uso de mocks para funções de callback e serviços externos

3. **Testes Orientados ao Usuário**:
   - Foco em como o usuário interage com os componentes
   - Teste de fluxos reais de interação com a interface

4. **Cobertura de Casos de Borda**:
   - Testes para validar comportamento com dados vazios ou inválidos
   - Verificação de casos extremos e tratamento de erros

## Próximos Passos

1. **Ampliar cobertura de testes**:
   - Desenvolver testes para hooks personalizados (useRuleForm, useRules)
   - Adicionar testes para serviços de API
   - Implementar testes para componentes compartilhados adicionais

2. **Testes de integração avançados**:
   - Criar testes end-to-end para fluxos completos
   - Testar interações entre múltiplos componentes em contextos reais de uso

3. **Automação**:
   - Configurar GitHub Actions para executar testes automaticamente
   - Implementar verificação de cobertura mínima
   - Adicionar relatórios de teste ao pipeline de CI

4. **Documentação**:
   - Expandir documentação de testes com exemplos e boas práticas
   - Criar guia para novos desenvolvedores
   - Documentar padrões de mock e teste para diferentes tipos de componentes

## Conclusão

A implementação da infraestrutura de testes e dos testes para componentes de configuração de regras estabelece uma base sólida para garantir a qualidade do código à medida que o projeto evolui. Os padrões e exemplos criados servem como guia para a expansão da cobertura de testes para todos os componentes do sistema.

Com a conclusão dos testes para os componentes de configuração de regras, o projeto agora possui uma cobertura significativa que permite refatorações seguras e detecção precoce de problemas. A abordagem de testes adotada prioriza a experiência do usuário, testando componentes da forma como são utilizados, o que ajuda a garantir que o sistema funcione conforme esperado do ponto de vista do usuário final.
