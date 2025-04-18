# Sistema de Badges

Sistema para gerenciamento de badges educacionais com suporte a diferentes tipos de regras de atribuição. Construído com Next.js, TypeScript e Tailwind CSS.

## Visão Geral

O Sistema de Badges permite a criação e gerenciamento de badges que podem ser atribuídos a usuários com base em diferentes tipos de regras:

- **Pontuação**: Atribuição baseada em pontos acumulados por eventos
- **Atribuição Direta**: Permite que perfis específicos atribuam badges manualmente
- **Contagem de Eventos**: Atribuição baseada na frequência de eventos
- **Posição em Ranking**: Atribuição baseada na posição em rankings

## Tecnologias

- **Framework**: Next.js 13+
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: Componentes personalizados baseados em Radix UI
- **Gerenciamento de Estado**: React Query
- **Cliente HTTP**: Axios
- **Validação**: Zod (a ser implementado)
- **Internacionalização**: next-intl

## Estrutura do Projeto

O projeto segue uma arquitetura baseada em features/módulos:

```
src/
├── app/                  # Páginas do Next.js App Router
├── components/           # Componentes compartilhados
│   └── ui/               # Componentes básicos de UI
├── features/             # Módulos funcionais da aplicação
│   ├── badges/           # Feature de badges
│   ├── rules/            # Feature de regras
│   └── users/            # Feature de usuários
├── hooks/                # Hooks compartilhados
├── lib/                  # Utilidades e funções auxiliares
│   ├── api.ts            # Cliente Axios configurado
│   ├── react-query.ts    # Configuração do React Query
│   └── utils.ts          # Funções utilitárias
```

## Integração com API

O sistema se integra com uma API REST existente usando os seguintes componentes:

- **Cliente Axios**: Configurado em `src/lib/api.ts` com interceptadores para autenticação e tratamento de erros
- **React Query**: Gerenciamento de estado e cache de dados
- **Serviços de API**: Implementados por recurso (ex: `rulesApi.ts`, futuramente `badgesApi.ts`)
- **Hooks Personalizados**: Encapsulam a lógica de comunicação com a API (ex: `useRules`, `useRule`, `useRuleForm`)

### Fluxo de Dados

1. Os componentes React usam hooks personalizados (`useRules`, `useRule`, etc.)
2. Os hooks consomem serviços de API (`rulesApi`, `badgesApi`, etc.)
3. Os serviços de API utilizam o cliente Axios centralizado
4. O React Query gerencia o cache, revalidação e estados de carregamento

## Plano de Refatoração

Este projeto está passando por um processo de refatoração para melhorar:

- Performance
- Escalabilidade
- Usabilidade

O progresso atual da refatoração inclui:

- ✅ **Fase 1**: Reestruturação de Arquitetura e Componentização
- 🔄 **Fase 2**: Otimização de Performance e Gerenciamento de Estado (parcialmente implementada)
  - ✅ Configuração do React Query
  - ✅ Implementação de hooks que utilizam React Query
  - ✅ Integração com API via Axios
  - ⏳ Validação com Zod (pendente)

Consulte o [Plano de Refatoração](./docs/refactoring-plan.md) para detalhes completos.

## Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]

# Instale as dependências
npm install
# ou
yarn

# Inicie o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no arquivo `.env.local`:

```
NEXT_PUBLIC_API_URL=https://api.sistema-educacional.com
```

Em ambiente de desenvolvimento, você pode configurar:

```
NEXT_PUBLIC_API_URL=http://localhost:7071
```

### Scripts

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a versão de produção
- `npm run start` - Inicia o servidor de produção (após build)
- `npm run lint` - Executa verificação de linting

## Contribuição

1. Siga as convenções de código estabelecidas no projeto
2. Crie testes para novas funcionalidades
3. Atualize a documentação quando necessário
4. Use commits semânticos

## Testes

Os testes serão implementados em uma fase futura da refatoração (Fase 5).

## Próximos Passos

- Implementação completa da Fase 2 (Gerenciamento de Estado)
- Implementação dos serviços para Badges
- Validação de formulários com Zod
- Adição de testes automatizados
- Implementação de Internacionalização
