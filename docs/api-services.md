# Documentação dos Serviços de API

Este documento descreve os serviços de API implementados no Sistema de Badges, bem como os padrões de comunicação utilizados para interagir com a API backend.

## Arquitetura de Comunicação

A comunicação com a API segue uma arquitetura em camadas:

```
┌─────────────────────────────────────────────┐
│            Componentes React                │
│  (RuleForm, RulesList, ...)                 │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│               Hooks React                   │
│  (useRules, useRule, useRuleForm, ...)      │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│             Serviços de API                 │
│        (rulesApi, badgesApi, ...)           │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│     Cliente HTTP Centralizado (Axios)       │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
             API C# (Backend)
```

### Fluxo de Dados

1. **Componentes React** consomem hooks personalizados para interagir com a API
2. **Hooks React** encapsulam a lógica de estado e operações usando o React Query
3. **Serviços de API** implementam operações específicas para cada recurso (ex: rules, badges)
4. **Cliente HTTP centralizado** gerencia as requisições, autenticação e tratamento de erros

## Cliente HTTP Centralizado (Axios)

O arquivo `src/lib/api.ts` configura um cliente Axios centralizado com várias otimizações:

### Características

- **URL Base**: Configurada através de variável de ambiente `NEXT_PUBLIC_API_URL`
- **Headers Padrão**: Content-Type definido como application/json
- **Timeout**: 30 segundos por padrão
- **Interceptadores**:
  - **Request**: Adiciona token de autenticação JWT automaticanente
  - **Response**: Padroniza o formato de erros retornados

### Funções Auxiliares

O cliente expõe funções wrapper que simplificam as chamadas à API:

| Função | Descrição |
|--------|-----------|
| `apiGet<T>` | Executa uma requisição GET com suporte a parâmetros de consulta |
| `apiPost<T>` | Executa uma requisição POST com corpo JSON |
| `apiPatch<T>` | Executa uma requisição PATCH com corpo JSON |
| `apiDelete<T>` | Executa uma requisição DELETE |
| `apiPut<T>` | Executa uma requisição PUT com corpo JSON |

### Tratamento de Erros

- Erros de rede são capturados e formatados
- Erros de autenticação (401) disparam lógica para redirecionamento ao login
- Em ambiente de desenvolvimento, erros são logados no console para depuração

## Serviço de Regras (rulesApi)

O serviço `rulesApi` implementa operações específicas para o recurso de Regras:

### Endpoint Base

```
/v1/rules
```

### Operações

| Método | Função | Descrição |
|--------|--------|-----------|
| GET | `getRules(params)` | Lista regras com suporte a paginação e filtros |
| GET | `getRule(uid)` | Obtém detalhes de uma regra específica |
| POST | `createRule(data)` | Cria uma nova regra |
| PATCH | `updateRule(uid, data)` | Atualiza uma regra existente parcialmente |
| DELETE | `deleteRule(uid)` | Remove uma regra |

### Parâmetros de Paginação (getRules)

| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `page` | `number` | Número da página atual | `1` |
| `pageSize` | `number` | Itens por página | `10` |
| `search` | `string` | Termo de busca | `undefined` |
| `sortBy` | `string` | Campo para ordenação | `undefined` |
| `sortOrder` | `'asc' \| 'desc'` | Direção da ordenação | `undefined` |
| `filter` | `object` | Filtros adicionais | `undefined` |

### Formato de Resposta

```typescript
interface ApiResponse<T> {
  items?: T[];          // Lista de itens (para endpoints que retornam coleções)
  item?: T;             // Item único (para endpoints que retornam um registro)
  totalCount?: number;  // Total de registros (para paginação)
  page?: number;        // Página atual
  pageSize?: number;    // Itens por página
  message?: string;     // Mensagem opcional
  success: boolean;     // Indicador de sucesso da operação
}
```

### Funções de Transformação

O serviço implementa funções para transformar dados entre os formatos da API e do frontend:

| Função | Descrição |
|--------|-----------|
| `transformFormToApiInput(formData)` | Converte dados do formulário para o formato esperado pela API |
| `transformApiToFormData(apiData)` | Converte dados da API para o formato esperado pelo formulário |

### Exemplo de Transformação

Para regras do tipo "points", a transformação ocorre da seguinte forma:

```javascript
// Formulário para API
const apiData = {
  name: formData.name,
  description: formData.description,
  type: "points",
  configuration: {
    minPoints: formData.points.minPoints,
    events: formData.points.events
  },
  context: formData.context,
  status: formData.status || 'active'
};

// API para Formulário
const formData = {
  uid: apiData.uid,
  name: apiData.name,
  description: apiData.description,
  type: apiData.type,
  points: {
    minPoints: apiData.configuration.minPoints || 0,
    events: apiData.configuration.events || []
  },
  context: apiData.context,
  status: apiData.status
};
```

## Padrões de API e Melhores Práticas

### Formato de URL

A API segue o padrão RESTful com URLs previsíveis:

- **Listagem/Criação**: `/v1/{resource}`
- **Detalhes/Atualização/Exclusão**: `/v1/{resource}/{uid}`
- **Operações Aninhadas**: `/v1/{resource}/{uid}/{subresource}`

Exemplo:
- `/v1/rules` (listagem de regras)
- `/v1/rules/123` (detalhes da regra 123)
- `/v1/badges/456/assign` (atribuir badge 456)

### Tratamento de Requisições GET

Para requisições GET, parâmetros de consulta são usados para:

1. **Paginação**: `page` e `pageSize`
2. **Filtragem**: `filter` (objeto serializado) ou parâmetros específicos
3. **Ordenação**: `sortBy` e `sortOrder`
4. **Busca**: `search` para termos de busca genéricos

### Manipulação de Erros

Erros da API são formatados consistentemente:

```typescript
interface ApiError {
  status: number;        // Código HTTP
  message: string;       // Mensagem de erro legível
  data?: any;            // Dados adicionais (ex: erros de validação)
}
```

Para erros de validação, o formato esperado é:

```json
{
  "validationErrors": {
    "name": ["O nome é obrigatório"],
    "points.minPoints": ["Deve ser maior que zero"]
  }
}
```

### Autenticação

A autenticação é feita via token JWT:

1. O token é armazenado no `localStorage` após login
2. O interceptador de requisições Axios adiciona o token ao header `Authorization`
3. Para endpoints que não requerem autenticação, o token não é enviado

## Extensão para Novos Recursos

Para adicionar suporte a um novo recurso da API:

1. **Criar Tipos**: Defina interfaces TypeScript para o recurso no arquivo `types.ts`
2. **Implementar Serviço**: Crie um arquivo de serviço seguindo o padrão existente
3. **Criar Hooks**: Implemente hooks React Query para operações comuns
4. **Integrar com Componentes**: Utilize os hooks nos componentes React

### Template para Novo Serviço

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { ResourceType, ApiResponse, PaginationParams } from '../types';

// Base URL para endpoints do recurso
const ENDPOINT = '/v1/resource-name';

export const resourceApi = {
  // Obter lista paginada
  async getResources(params: PaginationParams = {}): Promise<ApiResponse<ResourceType>> {
    return apiGet<ApiResponse<ResourceType>>(ENDPOINT, params);
  },

  // Obter um item específico
  async getResource(uid: string): Promise<ResourceType> {
    const response = await apiGet<ApiResponse<ResourceType>>(`${ENDPOINT}/${uid}`);
    if (!response.item) {
      throw new Error('Recurso não encontrado');
    }
    return response.item;
  },

  // Criar novo item
  async createResource(data: any): Promise<ResourceType> {
    const response = await apiPost<ApiResponse<ResourceType>>(ENDPOINT, data);
    if (!response.item) {
      throw new Error('Falha ao criar recurso');
    }
    return response.item;
  },

  // Atualizar item existente
  async updateResource(uid: string, data: any): Promise<ResourceType> {
    const response = await apiPatch<ApiResponse<ResourceType>>(`${ENDPOINT}/${uid}`, data);
    if (!response.item) {
      throw new Error('Falha ao atualizar recurso');
    }
    return response.item;
  },

  // Remover item
  async deleteResource(uid: string): Promise<boolean> {
    const response = await apiDelete<ApiResponse<null>>(`${ENDPOINT}/${uid}`);
    return response.success;
  }
};
```

## Considerações de Segurança

- **Sanitização de Entradas**: Todos os dados enviados para a API devem ser validados no cliente
- **Autenticação**: Tokens JWT são armazenados no localStorage e enviados apenas para endpoints seguros
- **CSRF**: A API C# deve implementar proteção contra CSRF, não sendo necessário no cliente
- **Tratamento de Erros**: Erros sensíveis não devem ser expostos ao usuário final

## Ambientes e Configuração

A API pode ser configurada para diferentes ambientes usando variáveis de ambiente:

### Desenvolvimento

```
NEXT_PUBLIC_API_URL=http://localhost:7071
```

### Produção

```
NEXT_PUBLIC_API_URL=https://api.sistema-educacional.com
```

## Futuras Melhorias

- **Memoização de Transformadores**: Implementar memoização para funções de transformação de dados
- **Invalidação Seletiva de Cache**: Otimizar a invalidação de cache do React Query
- **Retry Configurável**: Configuração mais granular para retry de requisições por endpoint
- **Cancelamento de Requisições**: Implementar cancelamento de requisições quando componentes são desmontados
- **Mock de API para Desenvolvimento**: Implementar MSW (Mock Service Worker) para desenvolvimento sem backend
- **Validação com Zod**: Adicionar validação de esquema com Zod para dados de entrada e saída
- **Logs Aprimorados**: Sistema de logging mais completo para depuração e monitoramento
- **Métricas de Performance**: Coletar métricas de performance das chamadas à API

## Integração com Módulo de Badges

Para o módulo de Badges, a implementação seguirá o mesmo padrão usado para Regras:

### Endpoints de Badges

- `GET /v1/badges` - Lista de badges com paginação
- `GET /v1/badges/{uid}` - Detalhes de uma badge específica
- `POST /v1/badges` - Criação de nova badge
- `PATCH /v1/badges/{uid}` - Atualização de badge existente
- `DELETE /v1/badges/{uid}` - Remoção de badge
- `POST /v1/badges/{uid}/assign` - Atribuição de badge a um usuário
- `DELETE /v1/badges/{uid}/users/{userUid}` - Remoção de badge de um usuário
- `GET /v1/badges/users/{userUid}` - Badges de um usuário específico

### Tipos Específicos para Badges

```typescript
export interface Badge {
  uid: string;
  name: string;
  description: string;
  imageUrl?: string;
  isEnabled: boolean;
  isHidden: boolean;
  registerConfig: BadgeRegisterConfig;
  // Outros campos específicos...
}

export interface BadgeCreateInput {
  name: string;
  description: string;
  imageUrl?: string;
  isEnabled?: boolean;
  isHidden?: boolean;
  // Outros campos específicos...
}
```

### Implementação Futura do Serviço de Badges

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Badge, BadgeCreateInput, BadgeUpdateInput, ApiResponse, PaginationParams } from '../types';

const ENDPOINT = '/v1/badges';

export const badgesApi = {
  // Obter lista paginada de badges
  async getBadges(params: PaginationParams = {}): Promise<ApiResponse<Badge>> {
    return apiGet<ApiResponse<Badge>>(ENDPOINT, params);
  },

  // Obter badge específica
  async getBadge(uid: string): Promise<Badge> {
    const response = await apiGet<ApiResponse<Badge>>(`${ENDPOINT}/${uid}`);
    if (!response.item) {
      throw new Error('Badge não encontrada');
    }
    return response.item;
  },

  // Criar nova badge
  async createBadge(data: BadgeCreateInput): Promise<Badge> {
    const response = await apiPost<ApiResponse<Badge>>(ENDPOINT, data);
    if (!response.item) {
      throw new Error('Falha ao criar badge');
    }
    return response.item;
  },

  // Atualizar badge existente
  async updateBadge(uid: string, data: BadgeUpdateInput): Promise<Badge> {
    const response = await apiPatch<ApiResponse<Badge>>(`${ENDPOINT}/${uid}`, data);
    if (!response.item) {
      throw new Error('Falha ao atualizar badge');
    }
    return response.item;
  },

  // Remover badge
  async deleteBadge(uid: string): Promise<boolean> {
    const response = await apiDelete<ApiResponse<null>>(`${ENDPOINT}/${uid}`);
    return response.success;
  },

  // Atribuir badge a um usuário
  async assignBadge(badgeUid: string, userUid: string): Promise<void> {
    await apiPost<ApiResponse<null>>(`${ENDPOINT}/${badgeUid}/assign`, { userUid });
  },

  // Remover badge de um usuário
  async revokeBadge(badgeUid: string, userUid: string): Promise<void> {
    await apiDelete<ApiResponse<null>>(`${ENDPOINT}/${badgeUid}/users/${userUid}`);
  },

  // Obter badges de um usuário
  async getUserBadges(userUid: string, params: PaginationParams = {}): Promise<ApiResponse<Badge>> {
    return apiGet<ApiResponse<Badge>>(`${ENDPOINT}/users/${userUid}`, params);
  }
};
```

## Conclusão

A implementação dos serviços de API segue uma arquitetura bem estruturada com foco em:

- **Reutilização de Código**: Através de funções auxiliares e padrões consistentes
- **Tipagem Forte**: Através de TypeScript para garantir integridade dos dados
- **Separação de Responsabilidades**: Serviços específicos para cada recurso
- **Gestão de Estado**: Através do React Query para cache e revalidação
- **Experiência do Usuário**: Feedback apropriado através de estados de loading e notificações toast

Esta arquitetura fornece uma base sólida para a integração de novos recursos conforme o sistema evolui, mantendo a consistência e a qualidade do código.
