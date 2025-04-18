# Guia de Início Rápido para Desenvolvedores - Sistema de Badges

## Introdução

Bem-vindo ao Sistema de Badges! Este guia irá ajudá-lo a configurar o ambiente de desenvolvimento e começar a contribuir para o projeto rapidamente.

## 1. Visão Geral do Projeto

O Sistema de Badges é uma aplicação React/Next.js projetada para integração com uma API C# existente. Ele permite a criação, gerenciamento e atribuição de badges a usuários como parte de uma estratégia de gamificação em plataformas educacionais.

### Principais Tecnologias

- **Frontend**: React, Next.js, TypeScript
- **UI**: TailwindCSS, Shadcn UI
- **Estado**: React Query, Hooks
- **API**: Axios
- **Validação**: Zod, React Hook Form
- **Testes**: Jest, React Testing Library

## 2. Configuração do Ambiente

### 2.1 Requisitos

- Node.js 18.17.0 ou superior
- npm 9.6.0 ou superior
- Git

### 2.2 Configuração Inicial

Clone o repositório e instale as dependências:

```bash
# Clone o repositório
git clone https://github.com/organization/badge-system.git
cd badge-system

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

Edite o arquivo `.env.local` para configurar o acesso à API:

```
NEXT_PUBLIC_API_URL=http://localhost:7071  # URL da API local
```

### 2.3 Comandos Principais

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Executar testes
npm test

# Executar linting
npm run lint

# Gerar build de produção
npm run build

# Iniciar servidor de produção
npm start
```

## 3. Estrutura do Projeto

```
src/
├── app/                  # Páginas do Next.js App Router
├── components/           # Componentes compartilhados
│   └── ui/               # Componentes de UI reutilizáveis
├── features/             # Módulos funcionais da aplicação
│   └── badges/           # Feature de badges
│       ├── components/   # Componentes específicos de badges
│       ├── hooks/        # Hooks para gerenciamento de estado
│       ├── services/     # Serviços de API
│       └── types.ts      # Tipos e interfaces
├── hooks/                # Hooks compartilhados
├── lib/                  # Utilitários e funções auxiliares
└── services/             # Serviços compartilhados (API, auth, etc.)
```

### 3.1 Principais Arquivos

- `src/services/api.ts`: Configuração do cliente Axios
- `src/features/badges/types.ts`: Tipos e interfaces para badges
- `src/features/badges/services/badgesApi.ts`: Serviço para API de badges
- `src/features/badges/hooks/useBadges.ts`: Hook para gerenciamento de badges

## 4. Fluxo de Desenvolvimento

### 4.1 Branches e Commits

Seguimos o fluxo de trabalho [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow):

- `main`: Branch de produção, sempre estável
- `develop`: Branch de desenvolvimento, integrações contínuas
- `feature/*`: Para novas funcionalidades
- `bugfix/*`: Para correções de bugs
- `release/*`: Para preparação de releases

Nomeie as branches de feature como `feature/nome-da-feature`.

Para commits, seguimos a convenção [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adicionar formulário de criação de badges
fix: corrigir validação de pontos negativos
chore: atualizar dependências
docs: adicionar documentação para API
```

### 4.2 Pull Requests

- Crie PRs para a branch `develop`
- Preencha o template de PR completamente
- Garanta que todos os testes estejam passando
- Solicite revisão de pelo menos um desenvolvedor

## 5. Integração com a API

### 5.1 Autenticação

A API utiliza tokens JWT para autenticação. O cliente Axios está configurado para incluir o token automaticamente:

```typescript
// src/services/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 5.2 Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /v1/badges | Lista badges com paginação |
| GET | /v1/badges/{uid} | Obtém badge específica |
| POST | /v1/badges | Cria nova badge |
| PATCH | /v1/badges/{uid} | Atualiza badge existente |
| DELETE | /v1/badges/{uid} | Remove badge |
| POST | /v1/badges/{uid}/assign | Atribui badge a usuário |

### 5.3 Mocking de API para Desenvolvimento

Para desenvolvimento local sem acesso à API real, use o MSW (Mock Service Worker):

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('*/v1/badges', (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            uid: '123',
            name: 'Badge de Exemplo',
            description: 'Uma badge de exemplo',
            // ...outros campos
          }
        ],
        totalCount: 1,
        page: 1,
        pageSize: 10
      })
    );
  }),
  // Outros handlers...
];
```

Ative o MSW no ambiente de desenvolvimento:

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

## 6. Principais Hooks e Componentes

### 6.1 Hooks

#### useBadges

```typescript
// Uso básico
const { badges, isLoading, createBadge } = useBadges();

// Com paginação e filtros
const { badges, totalCount, page, pageSize } = useBadges({
  page: 1,
  pageSize: 20,
  search: 'exemplo',
  isEnabled: true
});
```

#### useBadge

```typescript
// Obter e gerenciar uma badge específica
const { badge, isLoading, updateBadge, deleteBadge } = useBadge('123');

// Atualizar a badge
updateBadge({ name: 'Novo Nome', description: 'Nova descrição' });
```

### 6.2 Componentes Principais

#### BadgesGrid

```jsx
// Exibir grade de badges
<BadgesGrid 
  badges={badges} 
  isLoading={isLoading} 
  emptyMessage="Nenhuma badge encontrada"
  onBadgeClick={(badge) => console.log('Badge clicada:', badge)}
/>
```

#### BadgeForm

```jsx
// Formulário de criação/edição de badge
<BadgeForm
  initialData={badge}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isSubmitting={isCreating || isUpdating}
/>
```

## 7. Validação e Tipos

Usamos Zod para validação de dados de formulário:

```typescript
// Validação de formulário de badge
const badgeFormSchema = z.object({
  name: z.string().min(1, "Nome da badge é obrigatório"),
  description: z.string(),
  isEnabled: z.boolean(),
  isHidden: z.boolean(),
  registerConfig: z.object({
    authorizeRegisterType: z.number(),
    requiredPoints: z.number().optional(),
    // Outros campos...
  }),
  // Regras e outras propriedades...
});

type BadgeFormValues = z.infer<typeof badgeFormSchema>;
```

## 8. Testes

### 8.1 Testes de Componentes

```typescript
// src/features/badges/components/BadgesGrid.test.tsx
import { render, screen } from '@testing-library/react';
import { BadgesGrid } from './BadgesGrid';

describe('BadgesGrid', () => {
  it('renders loading state correctly', () => {
    render(<BadgesGrid badges={[]} isLoading={true} />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    render(<BadgesGrid badges={[]} isLoading={false} emptyMessage="Teste vazio" />);
    
    expect(screen.getByText('Teste vazio')).toBeInTheDocument();
  });

  // Mais testes...
});
```

### 8.2 Testes de Hooks

```typescript
// src/features/badges/hooks/useBadges.test.tsx
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { QueryClientProvider, QueryClient } from 'react-query';
import { useBadges } from './useBadges';

// Configure o wrapper para o QueryClient
const createWrapper = () => {
  const