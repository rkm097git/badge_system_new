# Documentação dos Hooks da API

Este documento fornece uma referência detalhada dos hooks React personalizados implementados para integração com a API do Sistema de Badges.

## Hooks de Regras

### `useRules`

Hook para gerenciar uma lista de regras, com suporte a paginação, filtragem e operações CRUD.

#### Parâmetros

| Nome | Tipo | Descrição | Padrão |
|------|------|-----------|--------|
| `params` | `PaginationParams` | Parâmetros de paginação e filtragem | `{ page: 1, pageSize: a0 }` |

#### Retorno

| Nome | Tipo | Descrição |
|------|------|-----------|
| `rules` | `Rule[]` | Lista de regras carregadas |
| `totalCount` | `number` | Número total de regras disponíveis |
| `pagination` | `{ page: number, pageSize: number }` | Informações de paginação atual |
| `isLoading` | `boolean` | Indica se os dados estão sendo carregados |
| `isError` | `boolean` | Indica se ocorreu um erro |
| `error` | `Error` | Objeto de erro, se houver |
| `createRule` | `(data: RuleCreateInput) => Promise<Rule>` | Função para criar uma nova regra |
| `updateRule` | `(data: RuleUpdateInput) => Promise<Rule>` | Função para atualizar uma regra existente |
| `deleteRule` | `(uid: string) => Promise<boolean>` | Função para excluir uma regra |
| `isCreating` | `boolean` | Indica se uma operação de criação está em andamento |
| `isUpdating` | `boolean` | Indica se uma operação de atualização está em andamento |
| `isDeleting` | `boolean` | Indica se uma operação de exclusão está em andamento |
| `refetch` | `() => Promise<void>` | Função para recarregar os dados |

#### Exemplo de Uso

```tsx
function RulesPage() {
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
  });
  
  const { 
    rules, 
    totalCount, 
    isLoading, 
    isError,
    error,
    createRule 
  } = useRules(params);
  
  // Lógica de paginação
  const handlePageChange = (newPage) => {
    setParams(prev => ({ ...prev, page: newPage }));
  };
  
  // Lógica de criar regra
  const handleCreateRule = async (formData) => {
    try {
      await createRule(formData);
      // Sucesso
    } catch (error) {
      // Erro
    }
  };
  
  if (isLoading) return <p>Carregando...</p>;
  if (isError) return <p>Erro: {error.message}</p>;
  
  return (
    <div>
      <h1>Regras ({totalCount})</h1>
      <ul>
        {rules.map(rule => (
          <li key={rule.uid}>{rule.name}</li>
        ))}
      </ul>
      {/* Componentes de paginação */}
    </div>
  );
}
```

### `useRule`

Hook para gerenciar uma regra específica, incluindo carregamento, atualização e exclusão.

#### Parâmetros

| Nome | Tipo | Descrição |
|------|------|-----------|
| `uid` | `string` | Identificador único da regra |

#### Retorno

| Nome | Tipo | Descrição |
|------|------|-----------|
| `rule` | `Rule` | Dados da regra carregada |
| `isLoading` | `boolean` | Indica se os dados estão sendo carregados |
| `isError` | `boolean` | Indica se ocorreu um erro |
| `error` | `Error` | Objeto de erro, se houver |
| `updateRule` | `(data: RuleUpdateInput) => Promise<Rule>` | Função para atualizar a regra |
| `deleteRule` | `() => Promise<boolean>` | Função para excluir a regra |
| `isUpdating` | `boolean` | Indica se uma operação de atualização está em andamento |
| `isDeleting` | `boolean` | Indica se uma operação de exclusão está em andamento |
| `refetch` | `() => Promise<void>` | Função para recarregar os dados |

#### Exemplo de Uso

```tsx
function RuleDetailPage({ uid }) {
  const { 
    rule, 
    isLoading, 
    updateRule,
    deleteRule,
    isUpdating,
    isDeleting
  } = useRule(uid);
  
  const handleUpdate = async (formData) => {
    try {
      await updateRule(formData);
      // Sucesso
    } catch (error) {
      // Erro
    }
  };
  
  const handleDelete = async () => {
    if (confirm('Tem certeza?')) {
      try {
        await deleteRule();
        // Redirecionar após exclusão
      } catch (error) {
        // Erro
      }
    }
  };
  
  if (isLoading) return <p>Carregando...</p>;
  if (!rule) return <p>Regra não encontrada</p>;
  
  return (
    <div>
      <h1>{rule.name}</h1>
      <p>{rule.description}</p>
      <button onClick={handleUpdate} disabled={isUpdating}>
        {isUpdating ? 'Atualizando...' : 'Atualizar'}
      </button>
      <button onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? 'Excluindo...' : 'Excluir'}
      </button>
    </div>
  );
}
```

### `useRuleForm`

Hook para gerenciar o estado e a validação de um formulário de regras, com integração à API.

#### Parâmetros

| Nome | Tipo | Descrição | Padrão |
|------|------|-----------|--------|
| `options` | `UseRuleFormOptions` | Opções de configuração | `{}` |
| `options.uid` | `string` | ID da regra para edição | `undefined` |
| `options.onSuccess` | `(rule: Rule) => void` | Callback chamado após sucesso | `undefined` |

#### Retorno

| Nome | Tipo | Descrição |
|------|------|-----------|
| `formData` | `RuleFormData` | Estado atual do formulário |
| `errors` | `RuleFormErrors` | Erros de validação por campo |
| `setFormData` | `(data: RuleFormData) => void` | Atualiza o estado do formulário |
| `handleInputChange` | `(field: string, value: any) => void` | Manipulador para alterações de campo |
| `validateForm` | `() => boolean` | Função para validar o formulário |
| `handleSubmit` | `(e: React.FormEvent) => Promise<void>` | Manipulador para submissão do formulário |
| `isLoading` | `boolean` | Indica se os dados estão sendo carregados (para edição) |
| `isSubmitting` | `boolean` | Indica se o formulário está sendo enviado |

#### Exemplo de Uso

```tsx
function RuleFormPage({ uid }) {
  const router = useRouter();
  
  const handleSuccess = (rule) => {
    // Redirecionar após sucesso
    router.push(`/rules/${rule.uid}`);
  };
  
  const {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    isLoading,
    isSubmitting
  } = useRuleForm({
    uid,
    onSuccess: handleSuccess
  });
  
  if (uid && isLoading) return <p>Carregando...</p>;
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
      />
      {errors.name && <p className="error">{errors.name}</p>}
      
      <textarea
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
      />
      {errors.description && <p className="error">{errors.description}</p>}
      
      {/* Outros campos do formulário */}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
```

## Hooks Auxiliares

### `useToast`

Hook para exibição de mensagens toast (notificações temporárias).

#### Retorno

| Nome | Tipo | Descrição |
|------|------|-----------|
| `toast` | `(options: ToastOptions) => void` | Função para exibir um toast |
| `dismiss` | `(id?: string) => void` | Função para dispensar um toast |

#### Opções do Toast

| Nome | Tipo | Descrição | Padrão |
|------|------|-----------|--------|
| `title` | `string` | Título do toast | `undefined` |
| `description` | `string` | Descrição/conteúdo do toast | `undefined` |
| `variant` | `'default' \| 'destructive'` | Estilo do toast | `'default'` |
| `action` | `React.ReactNode` | Componente de ação personalizado | `undefined` |

#### Exemplo de Uso

```tsx
function SaveButton() {
  const { toast } = useToast();
  
  const handleSave = async () => {
    try {
      await saveData();
      toast({
        title: 'Salvo com sucesso',
        description: 'Seus dados foram salvos',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  return <button onClick={handleSave}>Salvar</button>;
}
```

## Considerações de Uso

### Invalidação de Cache

O React Query gerencia automaticamente o cache dos dados. Quando uma operação de mutação é realizada (criar, atualizar, excluir), o cache é invalidado automaticamente para os dados afetados.

### Otimização de Performance

- Os hooks são configurados para minimizar requisições desnecessárias à API
- Dados estáticos permanecem em cache por 5 minutos por padrão
- As requisições falhas são repetidas uma vez automaticamente

### Tratamento de Erros

Todos os hooks incluem tratamento adequado de erros:
- Erros de API são capturados e formatados consistentemente
- O estado de erro é exposto via `isError` e `error`
- Mensagens de erro são exibidas via componente Toast

### Estados de Carregamento

Os hooks fornecem estados de carregamento detalhados:
- `isLoading` para carregar dados
- `isCreating`, `isUpdating`, `isDeleting` para operações específicas
- Estes estados podem ser usados para mostrar indicadores visuais apropriados

## Extensibilidade

A arquitetura de hooks implementada é extensível. Para adicionar suporte a novos recursos da API:

1. Defina os tipos/interfaces necessários
2. Implemente um serviço de API para o recurso
3. Crie hooks personalizados usando React Query
4. Reutilize utilitários como Toast conforme necessário
