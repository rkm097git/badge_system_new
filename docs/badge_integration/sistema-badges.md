# Sistema de Badges - Documentação

## 1. Visão Geral

### 1.1 Propósito

O Sistema de Badges é um componente de gamificação educacional que permite atribuir reconhecimentos digitais (badges) a usuários com base em regras e conquistas específicas. Este sistema é integrado à plataforma educacional existente desenvolvida em C# e Azure Functions.

### 1.2 Escopo

Este documento detalha a arquitetura, componentes, fluxos principais e estratégia de integração do Sistema de Badges com a API C# existente. Serve como referência tanto para desenvolvedores quanto para futuras discussões.

### 1.3 Tecnologias Principais

- **Frontend**: React, Next.js, TypeScript, TailwindCSS
- **Estado e Cache**: React Query, Zustand
- **API Cliente**: Axios
- **Backend**: C# (existente), Azure Functions
- **Validação**: Zod, React Hook Form

## 2. Arquitetura

### 2.1 Arquitetura do Sistema Existente

A plataforma existente é baseada em uma arquitetura de microsserviços usando Azure Functions, com três entidades principais:

- **Diretório**: Nível mais alto de organização
- **Projeto**: Agrupamento menor de recursos dentro de um diretório
- **Conector**: Implementações de interfaces que abstraem fluxos de trabalho específicos

O sistema utiliza uma abordagem modular onde cada conector implementa interfaces específicas do sistema (definidas no projeto Interface Core) e podem ser usados por diferentes projetos conforme necessário.

### 2.2 Arquitetura do Sistema de Badges

O sistema de badges segue uma arquitetura em camadas:

1. **Camada de Apresentação**: Componentes React para visualização e interação
2. **Camada de Estado**: Hooks que encapsulam lógica de negócios e comunicação com a API
3. **Camada de Serviço**: Serviços que abstraem a comunicação com o backend
4. **Camada de Tipos**: Tipos TypeScript que mapeiam as interfaces C# da API existente

```
┌─────────────────────────────────────────────┐
│            Componentes React                │
│  (BadgesGrid, BadgeForm, BadgeRuleForm...)  │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│               Hooks React                   │
│   (useBadges, useBadge, useUserBadges...)   │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│             Serviços de API                 │
│         (badgesApi, contextsApi...)         │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│         API Cliente (axios config)          │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
             API C# Existente
```

## 3. Modelos e Interfaces

### 3.1 Modelo de Badge

O sistema utiliza o modelo `IBadge` definido na API C#, mapeado para interfaces TypeScript:

```typescript
// Principais modelos
export interface Badge {
  uid: string;
  name: string;
  description: string;
  isEnabled: boolean;
  isHidden: boolean;
  registerConfig: BadgeRegisterConfig;
  entities: BadgeEntity[];
  rules: BadgeRule[];
  userRegisters: BadgeUserRegister[];
  requiredForRegister: BadgeRegisterConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface BadgeRule {
  uid: string;
  minimumPoints?: number;
  limitation: BadRuleLimitation;
  conditions: BadgeCondition[];
  createdAt: string;
  updatedAt: string;
  parentUid: string;
}

export interface BadgeCondition {
  uid: string;
  referenceType: ObjectType;
  referenceUid?: string;
  conditionType: BadgeConditionType;
  createdAt: string;
  updatedAt: string;
  parentUid: string;
}
```

### 3.2 Enumerações Principais

```typescript
export enum BadgeRegisterType {
  ByUser = 1,      // Registro pelo próprio usuário
  ByManager = 2,   // Registro por um gerente/admin
  ByPoints = 4     // Registro automático por pontos
}

export enum BadRuleLimitation {
  None = 0,        // Sem limite de tempo
  Daily = 1,       // Limitação diária
  Weekly = 2,      // Limitação semanal
  Monthly = 3,     // Limitação mensal
  Yearly = 4       // Limitação anual
}

export enum BadgeConditionType {
  All = 0,         // Todas as condições devem ser satisfeitas (AND)
  Any = 1          // Qualquer condição pode ser satisfeita (OR)
}

export enum ObjectType {
  User = 0,        // Referência a um usuário
  Course = 1,      // Referência a um curso
  Project = 2,     // Referência a um projeto
  Directory = 3,   // Referência a um diretório
  Entity = 4       // Referência a uma entidade genérica
}
```

## 4. Componentes Principais

### 4.1 Serviços de API

#### 4.1.1 Cliente API Base

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.sistema-educacional.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Lógica de tratamento de erros
    // ...
  }
);

export default api;
```

#### 4.1.2 Serviço de Badges

```typescript
// src/features/badges/services/badgesApi.ts
import api from '@/services/api';
import { Badge, BadgeCreateInput, BadgeUpdateInput, BadgesResponse } from '../types';

export const badgesApi = {
  // Obtém lista paginada de badges
  async getBadges(params) { /* ... */ },

  // Obtém badge específica pelo ID
  async getBadge(uid) { /* ... */ },

  // Cria nova badge
  async createBadge(data) { /* ... */ },

  // Atualiza badge existente
  async updateBadge(uid, data) { /* ... */ },

  // Remove badge
  async deleteBadge(uid) { /* ... */ },

  // Atribui badge a um usuário
  async assignBadge(badgeUid, userUid) { /* ... */ },

  // Remove badge de um usuário
  async revokeBadge(badgeUid, userUid) { /* ... */ },

  // Adiciona pontos para um usuário
  async addUserPoints(userUid, data) { /* ... */ },

  // Obtém badges de um usuário
  async getUserBadges(userUid, params) { /* ... */ }
};
```

### 4.2 Hooks React

#### 4.2.1 useBadges

```typescript
// src/features/badges/hooks/useBadges.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { badgesApi } from '../services/badgesApi';

export function useBadges(options) {
  const queryClient = useQueryClient();
  
  // Query para listar badges
  const badgesQuery = useQuery(['badges', options], () => badgesApi.getBadges(options));
  
  // Mutation para criar badge
  const createBadgeMutation = useMutation(
    (data) => badgesApi.createBadge(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['badges']);
      },
    }
  );
  
  // Outras mutations e lógica...
  
  return {
    badges: badgesQuery.data?.items || [],
    totalCount: badgesQuery.data?.totalCount || 0,
    isLoading: badgesQuery.isLoading,
    createBadge: createBadgeMutation.mutate,
    // Outros retornos...
  };
}
```

#### 4.2.2 useBadge

```typescript
// src/features/badges/hooks/useBadge.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { badgesApi } from '../services/badgesApi';

export function useBadge(uid) {
  // Query para obter badge específica
  const badgeQuery = useQuery(['badge', uid], () => badgesApi.getBadge(uid), {
    enabled: !!uid,
  });
  
  // Mutations e lógica adicional...
  
  return {
    badge: badgeQuery.data,
    isLoading: badgeQuery.isLoading,
    // Outros retornos...
  };
}
```

### 4.3 Componentes de UI

#### 4.3.1 BadgesGrid

Componente para exibir uma grade de badges com:
- Estados de carregamento (loading)
- Mensagem para lista vazia
- Exibição visual de badges com indicação de status (habilitada, oculta)
- Navegação para detalhes de cada badge

#### 4.3.2 BadgeForm

Formulário para criação e edição de badges com:
- Validação com Zod
- Campos para todas as propriedades relevantes
- Gerenciamento de estado com React Hook Form
- Feedback visual de erros e sucesso

#### 4.3.3 BadgeRuleForm

Formulário específico para configuração de regras de badges:
- Configuração de pontuação mínima
- Adição/remoção de condições
- Configuração de limitações temporais

## 5. Fluxos Principais

### 5.1 Criação de Badge

1. Usuário acessa o formulário de criação de badge
2. Preenche os campos básicos (nome, descrição, configurações)
3. Adiciona regras para obtenção da badge
4. Define entidades relacionadas à badge (cursos, projetos, etc.)
5. Envia o formulário
6. Sistema valida os dados e envia à API
7. Badge é criada e usuário é redirecionado para a lista ou detalhes

### 5.2 Atribuição de Badge

1. Usuário administrador acessa a tela de detalhes da badge
2. Seleciona o usuário para atribuição
3. Confirma a atribuição
4. Sistema envia solicitação à API
5. Badge é atribuída ao usuário

### 5.3 Obtenção Automática de Badge

1. Usuário realiza atividades que geram pontos
2. Sistema registra pontos através da API
3. API verifica se o usuário atende aos critérios de alguma badge
4. Se os critérios são atendidos, a badge é automaticamente atribuída

## 6. Integração com API C# Existente

### 6.1 Autenticação e Autorização

O sistema utiliza a mesma autenticação JWT da plataforma principal:

1. Usuário faz login na plataforma principal
2. Token JWT é armazenado no localStorage
3. Todas as requisições ao backend incluem o token no header Authorization
4. API verifica as permissões do usuário para operações relacionadas a badges

### 6.2 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /v1/badges | Lista badges com paginação e filtros |
| GET | /v1/badges/{uid} | Obtém badge específica por ID |
| POST | /v1/badges | Cria nova badge |
| PATCH | /v1/badges/{uid} | Atualiza badge existente |
| DELETE | /v1/badges/{uid} | Remove badge |
| POST | /v1/badges/{uid}/assign | Atribui badge a um usuário |
| DELETE | /v1/badges/{uid}/users/{userUid} | Remove badge de um usuário |
| POST | /v1/badges/users/{userUid}/points | Adiciona pontos para um usuário |
| GET | /v1/badges/users/{userUid} | Lista badges de um usuário |

### 6.3 Mapeamento de Modelos

Os modelos TypeScript são mapeados diretamente para as interfaces C# correspondentes:

| Modelo TypeScript | Interface C# |
|-------------------|--------------|
| Badge | IBadge |
| BadgeRule | IBadgeRule |
| BadgeCondition | IBadgeCondition |
| BadgeEntity | IBadgeEntity |
| BadgeRegisterConfig | IBadgeRegisterConfig |
| BadgeUserRegister | IBadgeUserRegister |

## 7. Considerações Técnicas

### 7.1 Performance

- Paginação implementada para listas grandes
- Cache gerenciado pelo React Query para reduzir chamadas à API
- Prefetching estratégico para melhorar a experiência do usuário

### 7.2 Segurança

- Validação completa no cliente e servidor
- Tipos TypeScript para garantir conformidade com API
- Autenticação e autorização integradas com o sistema existente
- Sanitização de inputs para prevenir ataques

### 7.3 Acessibilidade

- Componentes desenvolvidos com foco em acessibilidade
- Suporte a navegação por teclado
- Estrutura semântica para leitores de tela
- Contraste adequado e mensagens de feedback

### 7.4 Internacionalização

- Preparado para suportar múltiplos idiomas
- Textos isolados para fácil tradução
- Formatação de datas e números conforme locale

## 8. Requisitos e Dependências

### 8.1 Dependências Principais

- **React** (^18.0.0): Biblioteca UI
- **Next.js** (^14.0.0): Framework React
- **TailwindCSS** (^3.3.0): Framework CSS
- **React Query** (^5.0.0): Gerenciamento de estado e dados da API
- **Axios** (^1.5.0): Cliente HTTP
- **React Hook Form** (^7.45.0): Gerenciamento de formulários
- **Zod** (^3.21.0): Validação de esquemas
- **Lucide React** (^0.260.0): Ícones

### 8.2 Requisitos de Sistema

- Node.js (>=18.17.0)
- Conexão com a API C# existente
- Variáveis de ambiente configuradas

## 9. Futuras Expansões e Melhorias

### 9.1 Melhorias Planejadas

- Dashboard de análise de performance de badges
- Visualização avançada para estatísticas de conquistas
- Exportação de relatórios de badges
- Configuração visual de badges (upload de imagens, cores personalizadas)

### 9.2 Integrações Futuras

- Integração com sistema de notificações
- Compartilhamento de badges em redes sociais
- Integração com APIs externas para verificação de badges

## 10. Referências e Recursos

### 10.1 Documentação Técnica

- [Documentação da API C# (interna)](/docs/csharp_interface_api)
- [Documentação do React Query](https://tanstack.com/query/latest/docs/react/overview)
- [Documentação do Next.js](https://nextjs.org/docs)

### 10.2 Padrões de Design

- [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit
- [Feature Folder Structure](https://redux.js.org/style-guide/style-guide#structure-files-as-feature-folders-with-single-file-logic) para organização de código
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) para componentização

---

**Versão**: 1.0.0  
**Data**: 08/04/2025  
**Contato**: Ricardo Kawasaki  
**Repositório**: [github.com/organization/badge-system](https://github.com/organization/badge-system)