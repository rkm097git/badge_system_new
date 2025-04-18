# Guia de Implementação - Fase 1: Reestruturação de Arquitetura e Componentização

Este guia detalha as etapas e exemplos práticos para a implementação da Fase 1 do plano de refatoração do Sistema de Badges. A fase foca na reestruturação da arquitetura e melhoria da componentização, visando aumentar a manutenibilidade e legibilidade do código.

## 1. Nova Estrutura de Diretórios ✅

Recomendamos a seguinte estrutura baseada em features/módulos:

```
src/
├── app/                  # Páginas do Next.js App Router
├── components/           # Componentes compartilhados
│   └── ui/               # Componentes básicos de UI (botões, inputs, etc.)
├── features/             # Módulos funcionais da aplicação
│   ├── badges/           # Feature de badges
│   ├── rules/            # Feature de regras
│   └── users/            # Feature de usuários
├── hooks/                # Hooks compartilhados
├── lib/                  # Utilidades e funções auxiliares
└── services/             # Serviços compartilhados (API, auth, etc.)
```

Para cada feature, sugerimos a estrutura:

```
features/rules/
├── components/           # Componentes específicos da feature
│   └── RuleForm/         # Componentes compostos por subcomponentes
│       ├── index.tsx     # Exportação principal
│       ├── RuleBasicInfo.tsx
│       ├── RuleTypeConfig.tsx
│       └── ...
├── hooks/                # Hooks específicos da feature
│   └── useRuleForm.ts    # Lógica extraída do componente
├── services/             # Serviços específicos da feature
│   └── rulesApi.ts       # Chamadas de API relacionadas a regras
├── types.ts              # Tipos e interfaces da feature
└── utils.ts              # Utilitários específicos da feature
```

**Status: Implementado ✅** - A estrutura de diretórios foi criada conforme recomendado, com a feature `rules` completamente estruturada.

## 2. Refatoração do Componente RulesForm ✅

Abaixo detalhamos como refatorar o componente RulesForm, dividindo-o em componentes menores e mais gerenciáveis.

### 2.1. Componente Principal ✅

O componente principal passa a agir como um orquestrador, importando e compondo os subcomponentes:

```tsx
// src/features/rules/components/RuleForm/index.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRuleForm } from "../../hooks/useRuleForm";
import { RuleBasicInfo } from "./RuleBasicInfo";
import { RuleTypeSelection } from "./RuleTypeSelection";
import { RuleContextSelection } from "./RuleContextSelection";
import { RuleTypeConfig } from "./RuleTypeConfig";

export function RuleForm() {
  const { 
    formData, 
    errors, 
    handleInputChange,
    handleSubmit,
    validateForm
  } = useRuleForm();

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Nova Regra de Atribuição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações básicas */}
          <RuleBasicInfo 
            formData={formData} 
            errors={errors} 
            onChange={handleInputChange} 
          />

          {/* Contexto de aplicação */}
          <RuleContextSelection
            context={formData.context}
            error={errors.context}
            onChange={(context) => handleInputChange("context", context)}
          />
          
          {/* Separação mais destacada */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-6 pt-6">
            <h3 className="text-lg font-medium mb-4">Configuração da Regra</h3>
          
            {/* Seleção de tipo de regra */}
            <RuleTypeSelection 
              value={formData.type} 
              error={errors.type}
              onChange={(type) => handleInputChange("type", type)} 
            />

            {/* Configuração específica baseada no tipo */}
            {formData.type && (
              <RuleTypeConfig 
                type={formData.type}
                formData={formData}
                errors={errors}
                onChange={handleInputChange}
              />
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
```

**Status: Implementado ✅** - O componente principal foi implementado conforme recomendado, atuando como orquestrador dos subcomponentes. **Atualização:** Reorganizada a ordem dos campos para melhor contextualização, com o campo "Contexto de Aplicação" posicionado antes da configuração da regra e adicionada separação visual.

### 2.2. Extraindo a Lógica para um Hook ✅

A lógica do formulário é extraída para um hook personalizado:

```tsx
// src/features/rules/hooks/useRuleForm.ts
import { useState } from "react";
import { RuleFormData, RuleFormErrors } from "../types";

const initialFormData: RuleFormData = {
  name: "",
  description: "",
  type: "",
  // ... restante do estado inicial
};

export function useRuleForm() {
  const [formData, setFormData] = useState<RuleFormData>(initialFormData);
  const [errors, setErrors] = useState<RuleFormErrors>({});

  const validateForm = () => {
    const newErrors: RuleFormErrors = {};
    
    // Lógica de validação do formulário
    // ...

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    // Atualiza o estado do formulário
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Se existir um erro para este campo, limpa o erro
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Trata casos especiais para campos aninhados
    if (field === 'type') {
      setErrors(prev => {
        const newErrors = { ...prev };
        // Limpa erros específicos de tipos
        delete newErrors.points;
        delete newErrors.directAssignment;
        delete newErrors.eventCount;
        delete newErrors.ranking;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Lógica de envio do formulário
      console.log("Dados do formulário:", formData);
    } catch (error) {
      console.error("Erro ao salvar a regra:", error);
    }
  };

  return {
    formData,
    errors,
    handleInputChange,
    validateForm,
    handleSubmit
  };
}
```

**Status: Implementado ✅** - A lógica foi extraída para um hook personalizado, separando a lógica de negócio da apresentação. **Atualização:** Implementado feedback imediato na validação, removendo mensagens de erro assim que o usuário corrige os campos.

### 2.3. Componentes de Seleção ✅

Os componentes de seleção foram implementados com foco na usabilidade e consistencia visual:

```tsx
// src/features/rules/components/RuleForm/RuleTypeSelection.tsx
export function RuleTypeSelection({ value, error, onChange }: RuleTypeSelectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label htmlFor="type">Tipo de Regra</Label>
        <Tooltip content="Selecione como esta regra irá atribuir badges" />
      </div>
      <Select
        value={value}
        onValueChange={(value: "" | "points" | "direct" | "events" | "ranking") => 
          onChange(value)
        }
      >
        <SelectTrigger className={`bg-white dark:bg-gray-800 text-left ${error ? "border-red-500" : ""}`}>
          <SelectValue placeholder="Selecione o tipo de regra">
            {value && (() => {
              const typeLabels = {
                points: "Pontuação",
                direct: "Atribuição Direta",
                events: "Contagem de Eventos",
                ranking: "Posição em Ranking"
              };
              return typeLabels[value as keyof typeof typeLabels];
            })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800">
          <SelectItem value="points">
            <div className="flex flex-col">
              <span>Pontuação</span>
              <span className="text-sm text-muted-foreground">Atribui com base em pontos acumulados</span>
            </div>
          </SelectItem>
          {/* Outros itens */}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

**Status: Implementado ✅** - Os componentes de seleção foram implementados com atenção especial à consistência visual, melhorando a interface do usuário com backgrounds adequados para os seletores e exibição simplificada de valores selecionados.

## 2.4. Exemplo de Subcomponente de Informações Básicas ✅

Cada parte do formulário se torna um componente independente:

```tsx
// src/features/rules/components/RuleForm/RuleBasicInfo.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RuleFormData, RuleFormErrors } from "../../types";
import { Tooltip } from "../ui/Tooltip";

interface RuleBasicInfoProps {
  formData: RuleFormData;
  errors: RuleFormErrors;
  onChange: (field: string, value: any) => void;
}

export function RuleBasicInfo({ formData, errors, onChange }: RuleBasicInfoProps) {
  return (
    <div className="space-y-4">
      {/* Nome da Regra */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="name">Nome da Regra</Label>
          <Tooltip content="Nome único que identifica esta regra" />
        </div>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Digite um nome para a regra..."
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Descrição da Regra */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="description">Descrição da Regra</Label>
          <Tooltip content="Descreva o objetivo e funcionamento desta regra" />
        </div>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Descreva o propósito desta regra..."
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>
    </div>
  );
}
```

**Status: Implementado ✅** - Todos os subcomponentes foram implementados, incluindo os específicos para cada tipo de regra.

### 2.5. Componente de Configuração Específica por Tipo ✅

Um componente que muda seu comportamento com base no tipo de regra selecionado, com espaçamento adequado em relação ao seletor de tipo:

```tsx
// src/features/rules/components/RuleForm/RuleTypeConfig.tsx
import { RuleFormData, RuleFormErrors } from "../../types";
import { PointsRuleConfig } from "./types/PointsRuleConfig";
import { DirectAssignmentConfig } from "./types/DirectAssignmentConfig";
import { EventCountConfig } from "./types/EventCountConfig";
import { RankingConfig } from "./types/RankingConfig";

interface RuleTypeConfigProps {
  type: string;
  formData: RuleFormData;
  errors: RuleFormErrors;
  onChange: (field: string, value: any) => void;
}

export function RuleTypeConfig({ type, formData, errors, onChange }: RuleTypeConfigProps) {
  // O wrapper div adiciona o espaçamento vertical (mt-6) entre o seletor de tipo e a configuração
  return (
    <div className="mt-6">
      {(() => {
        switch (type) {
          case "points":
            return (
              <PointsRuleConfig
                data={formData.points}
                error={errors.points}
                onChange={(value) => onChange("points", value)}
              />
            );
          case "direct":
            return (
              <DirectAssignmentConfig
                data={formData.directAssignment}
                error={errors.directAssignment}
                onChange={(value) => onChange("directAssignment", value)}
              />
            );
          case "events":
            return (
              <EventCountConfig
                data={formData.eventCount}
                error={errors.eventCount}
                onChange={(value) => onChange("eventCount", value)}
              />
            );
          case "ranking":
            return (
              <RankingConfig
                data={formData.ranking}
                error={errors.ranking}
                onChange={(value) => onChange("ranking", value)}
              />
            );
          default:
            return null;
        }
      })()}
    </div>
  );
}
```

**Status: Implementado ✅** - O componente de configuração por tipo foi implementado com todos os subcomponentes necessários e espaçamento vertical adequado em relação ao seletor de tipo.

## 3. Centralização de Tipos e Interfaces ✅

Os tipos são centralizados em um arquivo para facilitar reutilização:

```tsx
// src/features/rules/types.ts
export interface RuleEvent {
  type: string;
  weight: number;
}

export interface RuleFormData {
  name: string;
  description: string;
  type: "" | "points" | "direct" | "events" | "ranking";
  points: {
    minPoints: number;
    events: RuleEvent[];
  };
  directAssignment: {
    assignerProfiles: string[];
    assignmentLimit: number;
  };
  eventCount: {
    eventType: string;
    minOccurrences: number;
    periodType: "day" | "week" | "month";
    periodValue: number;
    requiredStreak: number;
  };
  ranking: {
    rankingId: string;
    requiredPosition: number;
  };
  context: {
    type: "" | "course" | "department" | "campus";
    items: string[];
  };
}

export interface RuleFormErrors {
  [key: string]: string;
}
```

**Status: Implementado ✅** - Todos os tipos e interfaces foram centralizados em um único arquivo.

## 4. Abstração de Chamadas à API ✅

As chamadas à API são encapsuladas em um serviço dedicado:

```tsx
// src/features/rules/services/rulesApi.ts
import { RuleFormData } from "../types";

const API_BASE_URL = "/api";

export const rulesApi = {
  async createRule(data: RuleFormData) {
    const response = await fetch(`${API_BASE_URL}/rules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar regra");
    }

    return response.json();
  },

  async getRules() {
    const response = await fetch(`${API_BASE_URL}/rules`);

    if (!response.ok) {
      throw new Error("Falha ao obter regras");
    }

    return response.json();
  },

  // Outros métodos da API...
};
```

**Status: Implementado ✅** - Um serviço de API foi criado para encapsular as chamadas HTTP.

## 5. Implementação de Padrões e Convenções ✅

### 5.1. Padrões de Nomenclatura ✅

Recomendamos seguir estes padrões de nomenclatura:

- **Componentes**: PascalCase (ex: `RuleForm`)
- **Hooks**: camelCase com prefixo "use" (ex: `useRuleForm`)
- **Funções**: camelCase (ex: `handleSubmit`)
- **Tipos/Interfaces**: PascalCase (ex: `RuleFormData`)
- **Arquivos de componentes**: PascalCase, mesmo nome do componente (ex: `RuleForm.tsx`)
- **Arquivos de hooks e utilitários**: camelCase (ex: `useRuleForm.ts`)

**Status: Implementado ✅** - Os padrões de nomenclatura foram seguidos em toda a implementação.

### 5.2. Organização de Imports ✅

Recomendamos a seguinte ordem para imports:

1. Bibliotecas externas
2. Componentes/hooks/utils internos da aplicação
3. Componentes/hooks/utils específicos do módulo
4. Estilos

**Status: Implementado ✅** - Os imports foram organizados seguindo o padrão recomendado.

## 6. Configuração de Linting e Formatação ✅

### 6.1. ESLint ✅

Recomendamos a seguinte configuração para o ESLint:

```js
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling", "index"]
        ],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always"
      }
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
}
```

**Status: Implementado ✅** - A configuração do ESLint foi atualizada conforme recomendado.

### 6.2. Prettier ✅

Para formatação consistente, recomendamos o Prettier:

```js
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

**Status: Implementado ✅** - A configuração do Prettier foi adicionada conforme recomendado.

## 7. Documentação de Código ✅

Recomendamos documentar componentes e funções usando JSDoc:

```tsx
/**
 * Componente para exibir e editar as informações básicas de uma regra.
 * 
 * @param {RuleFormData} formData - Dados atuais do formulário
 * @param {RuleFormErrors} errors - Erros de validação
 * @param {Function} onChange - Função chamada quando um campo é alterado
 */
export function RuleBasicInfo({ formData, errors, onChange }: RuleBasicInfoProps) {
  // ...
}
```

**Status: Implementado ✅** - Documentação JSDoc foi adicionada aos componentes e funções principais.

## 8. Próximos Passos

Após implementar as mudanças desta fase, recomendamos:

1. Realizar uma revisão de código completa
2. Testar a aplicação para garantir que todas as funcionalidades continuam operando corretamente
3. Atualizar a documentação conforme necessário
4. Prosseguir para a Fase 2: Otimização de Performance e Gerenciamento de Estado

## 9. Checklist de Implementação ✅

Use este checklist para acompanhar o progresso da implementação:

- [x] Criar nova estrutura de diretórios
- [x] Mover e adaptar arquivos existentes para a nova estrutura
- [x] Refatorar RulesForm em componentes menores
- [x] Extrair lógica para hooks customizados
- [x] Centralizar tipos e interfaces
- [x] Criar serviços para abstração de API
- [x] Configurar linting e formatação
- [x] Adicionar documentação JSDoc
- [x] Realizar testes de regressão
- [x] Atualizar documentação do projeto

## 10. Exemplos de Refatoração

### 10.1. Antes da Refatoração

```tsx
// Componente monolítico de 700+ linhas
export function RulesForm() {
  const [formData, setFormData] = useState({...});
  const [errors, setErrors] = useState({});
  
  // Muitas funções e handlers
  
  // JSX extenso com muitas condicionais e lógica embutida
  return (
    <form>
      {/* Centenas de linhas de JSX */}
    </form>
  );
}
```

### 10.2. Após a Refatoração

```tsx
// Componente principal simplificado
export function RuleForm() {
  const { formData, errors, handleInputChange, handleSubmit } = useRuleForm();
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Nova Regra de Atribuição</CardTitle>
        </CardHeader>
        <CardContent>
          <RuleBasicInfo 
            formData={formData} 
            errors={errors} 
            onChange={handleInputChange} 
          />
          
          <RuleTypeSelection 
            value={formData.type} 
            error={errors.type}
            onChange={(type) => handleInputChange("type", type)} 
          />
          
          {formData.type && (
            <RuleTypeConfig 
              type={formData.type}
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
          )}
          
          <RuleContextSelection
            context={formData.context}
            error={errors.context}
            onChange={(context) => handleInputChange("context", context)}
          />
          
          <FormActions onCancel={() => {}} />
        </CardContent>
      </Card>
    </form>
  );
}
```

## 11. Resultados Alcançados

A implementação da Fase 1 do plano de refatoração resultou nas seguintes melhorias:

1. **Redução de Complexidade**: O componente principal foi reduzido de 700+ linhas para menos de 70 linhas.

2. **Melhor Separação de Responsabilidades**: Cada componente agora tem uma responsabilidade bem definida.

3. **Maior Facilidade de Manutenção**: Alterações em um tipo específico de regra afetam apenas o componente correspondente.

4. **Código mais Legível**: A estrutura mais modular facilita o entendimento do fluxo da aplicação.

5. **Reutilização de Código**: Componentes como `Tooltip` agora podem ser reutilizados em toda a aplicação.

6. **Melhoria na Estrutura de Projeto**: A organização baseada em features facilita a escalabilidade.

7. **Padrões Consistentes**: Nomenclatura, estrutura e organização de código seguem padrões claros.

8. **Melhor Experiência do Usuário**: 
   - Implementado feedback imediato na validação de formulários, onde mensagens de erro e highlighting são removidos automaticamente quando o usuário corrige os campos.
   - Reorganizada a disposição dos campos para melhor contextualização, com o "Contexto de Aplicação" posicionado antes da configuração da regra.
   - Adicionado agrupamento visual mais claro das seções do formulário.
   - Melhorado o estilo visual dos seletores com fundo branco (ou escuro no tema dark) para destaque.
   - Aprimorada a apresentação de itens selecionados, exibindo apenas o título sem a descrição e com alinhamento à esquerda.
   - Aplicado estilo consistente em todos os seletores do formulário.
   - Ajustado o espaçamento vertical entre o seletor "Tipo de Regra" e os campos de configuração, melhorando a organização visual do formulário.

Estas melhorias estabelecem uma base sólida para as próximas fases da refatoração, especialmente para a otimização de performance e gerenciamento de estado.
