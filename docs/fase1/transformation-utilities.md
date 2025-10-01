# Transformation Utilities

## Visão Geral

Este documento descreve os utilitários de transformação de dados implementados para o Sistema de Badges. Esses utilitários são responsáveis por converter dados entre o formato do formulário e o formato da API, garantindo a integridade dos dados durante as operações CRUD.

## Implementação

Os utilitários de transformação foram implementados no arquivo `src/features/rules/utils/transformers.ts` e seguem uma estrutura modular que permite a fácil manutenção e extensão para diferentes tipos de regras.

### Principais Funções

#### `transformFormToApiData`

Esta função transforma dados do formulário para o formato da API:

```typescript
export const transformFormToApiData = (formData: any): RuleCreateInput | RuleUpdateInput => {
  // ...implementação...
};
```

Características:
- Identifica o tipo de regra e aplica a transformação específica
- Preserva os campos básicos comuns a todas as regras
- Gera a configuração específica para cada tipo de regra
- Trata valores nulos e indefinidos com valores padrão

#### `transformApiToFormData`

Esta função transforma dados da API para o formato do formulário:

```typescript
export const transformApiToFormData = (apiData: Rule | null): any => {
  // ...implementação...
};
```

Características:
- Garante que a estrutura completa do formulário seja sempre inicializada
- Preenche todas as configurações de tipos de regra para evitar erros de referência nula
- Identifica o tipo de regra e aplica a transformação específica
- Trata valores nulos e indefinidos com valores padrão

### Transformadores Específicos por Tipo

Para cada tipo de regra, foi implementado um conjunto de funções de transformação:

#### Points Rule
```typescript
export const transformPointsRuleData = {
  toApi: (data: any = {}) => ({
    minPoints: data?.minPoints || 0,
    events: data?.events || []
  }),
  toForm: (data: any = null) => ({
    minPoints: data?.minPoints || 0,
    events: data?.events || []
  })
};
```

#### Direct Assignment Rule
```typescript
export const transformDirectAssignmentData = {
  toApi: (data: any = {}) => ({
    assignerProfiles: data?.assignerProfiles || [],
    assignmentLimit: data?.assignmentLimit || 0
  }),
  toForm: (data: any = null) => ({
    assignerProfiles: data?.assignerProfiles || [],
    assignmentLimit: data?.assignmentLimit || 0
  })
};
```

#### Event Count Rule
```typescript
export const transformEventCountData = {
  toApi: (data: any = {}) => ({
    eventType: data?.eventType || '',
    minOccurrences: data?.minOccurrences || 1,
    periodType: data?.periodType || 'week',
    periodValue: data?.periodValue || 1,
    requiredStreak: data?.requiredStreak || 0
  }),
  toForm: (data: any = null) => ({
    eventType: data?.eventType || '',
    minOccurrences: data?.minOccurrences || 1,
    periodType: data?.periodType || 'week',
    periodValue: data?.periodValue || 1,
    requiredStreak: data?.requiredStreak || 0
  })
};
```

#### Ranking Rule
```typescript
export const transformRankingData = {
  toApi: (data: any = {}) => ({
    rankingId: data?.rankingId || '',
    requiredPosition: data?.requiredPosition || 1
  }),
  toForm: (data: any = null) => ({
    rankingId: data?.rankingId || '',
    requiredPosition: data?.requiredPosition || 1
  })
};
```

## Testes

Foram implementados testes abrangentes para os utilitários de transformação em dois arquivos:

1. `src/features/rules/utils/__tests__/transformers.test.js` - Testes básicos de funcionalidade
2. `src/features/rules/utils/__tests__/transformers.extended.test.js` - Testes avançados cobrindo casos de borda

### Cenários de Teste Implementados

#### Testes Básicos
- Transformação de campos básicos
- Transformação específica para cada tipo de regra
- Tratamento de valores vazios ou nulos
- Inicialização de todas as configurações de tipo

#### Testes Avançados
- Tratamento de valores nulos em objetos aninhados
- Tratamento de propriedades de configuração ausentes
- Preservação de zero como valor válido (não aplicando valores padrão)
- Preservação de arrays vazios como valores válidos
- Tratamento de caracteres especiais em strings
- Tratamento de caracteres não-ASCII (internacionalização)
- Tratamento de arrays e objetos profundamente aninhados
- Verificação de integridade em transformações completas de ida e volta
- Preservação de metadados durante transformações
- Casos de borda específicos para cada tipo de regra

## Padrões Implementados

Os utilitários de transformação seguem os seguintes padrões:

1. **Tratamento Defensivo de Dados**: Utilização de operadores de encadeamento opcional (`?.`) e valores padrão para lidar com dados incompletos ou nulos.

2. **Separação de Responsabilidades**: Cada tipo de regra possui seu próprio conjunto de funções de transformação.

3. **Interface Consistente**: Todas as funções de transformação específicas por tipo seguem a mesma interface `toApi` e `toForm`.

4. **Imutabilidade**: As funções não modificam os dados de entrada, sempre retornando novos objetos.

5. **Valores Padrão Sensíveis**: Os valores padrão são definidos de forma a minimizar erros em caso de dados ausentes.

## Integração com o Sistema

Os utilitários de transformação são utilizados principalmente em:

1. **Serviços de API**: Para preparar dados para envio à API e processar respostas.
2. **Hooks de Formulário**: Para inicialização e submissão de formulários.
3. **Componentes de Regra**: Para exibição e manipulação de dados específicos por tipo.

## Extensão Futura

O sistema foi projetado para facilitar a adição de novos tipos de regra. Para adicionar um novo tipo, siga os seguintes passos:

1. Defina o tipo na enumeração `RuleType` em `types.ts`
2. Crie as interfaces para o novo tipo em `types.ts`
3. Implemente as funções de transformação seguindo o padrão existente
4. Atualize as funções principais para incluir o novo tipo
5. Adicione testes para o novo tipo

## Melhorias Futuras

1. **Tipagem Mais Forte**: Reduzir o uso de `any` em favor de interfaces mais específicas.
2. **Validação Integrada**: Integrar validação durante a transformação para garantir integridade dos dados.
3. **Transformação de Campos Adicionais**: Suporte para campos como metadados e configurações avançadas.
4. **Performance**: Otimização para grandes conjuntos de dados ou transformações frequentes.
5. **Logging e Telemetria**: Adicionar capacidade de registrar problemas encontrados durante transformações.
