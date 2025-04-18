# Documentação de Componentes UI - v1.9.0

Este documento fornece uma visão técnica detalhada dos componentes de interface do usuário utilizados no Sistema de Badges, incluindo diretrizes de responsividade (v1.9.0).

## Índice

- [Diretrizes de Responsividade](#diretrizes-de-responsividade)
  - [Breakpoints](#breakpoints)
  - [Classes Utilitárias](#classes-utilitárias)
  - [Componentes Responsivos](#componentes-responsivos)
  - [Posicionamento de Elementos](#posicionamento-de-elementos)
- [Componentes de Formulário](#componentes-de-formulário)
  - [PointsRuleConfig](#pointsruleconfig)
- [Toast](#toast)
  - [Visão Geral](#visão-geral)
  - [Dependências](#dependências)
  - [Variantes](#variantes)
  - [Subcomponentes](#subcomponentes)
  - [Hook useToast](#hook-usetoast)
  - [Exemplos de Uso](#exemplos-de-uso)

## Diretrizes de Responsividade

A versão 1.9.0 implementa um sistema de responsividade abrangente para garantir que a interface funcione bem em dispositivos de todos os tamanhos.

### Breakpoints

O sistema utiliza os seguintes breakpoints padrão do Tailwind CSS:

| Nome | Largura mínima |
|------|---------------|
| xs   | 0px           |
| sm   | 640px         |
| md   | 768px         |
| lg   | 1024px        |
| xl   | 1280px        |
| 2xl  | 1536px        |

### Classes Utilitárias

Para implementar interfaces responsivas, utilize estas classes utilitárias:

#### Layout de Containers

```tsx
<div className="container px-4 sm:px-6 lg:px-8">
  {/* Conteúdo responsivo */}
</div>
```

#### Larguras Responsivas

```tsx
{/* Elemento que usa toda a largura em dispositivos móveis, mas tem largura fixa em telas grandes */}
<div className="w-full sm:w-auto">...</div>

{/* Campo de input que ocupa largura total em mobile, mas tem tamanho controlado em desktop */}
<input className="w-full sm:w-24" />
```

#### Direção de Flex

```tsx
{/* Elementos empilhados verticalmente em mobile, lado a lado em desktop */}
<div className="flex flex-col sm:flex-row gap-3">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

#### Visibilidade Condicional

```tsx
{/* Mostrado apenas em tablets/desktop */}
<span className="hidden md:inline">Texto completo</span>

{/* Mostrado apenas em dispositivos móveis */}
<span className="md:hidden">Ícone</span>
```

### Componentes Responsivos

#### Tabelas Responsivas

Para tabelas, recomenda-se usar um padrão alternativo de visualização em dispositivos móveis:

```tsx
{/* Tabela para telas grandes */}
<div className="hidden md:block">
  <Table>...</Table>
</div>

{/* Cards para dispositivos móveis */}
<div className="grid grid-cols-1 gap-4 md:hidden">
  {items.map(item => (
    <div key={item.id} className="bg-white rounded-lg shadow p-4">
      {/* Conteúdo do card */}
    </div>
  ))}
</div>
```

#### Formulários Responsivos

Para formulários, recomenda-se:

- Usar `flex-col` em dispositivos móveis e `flex-row` em desktop para botões de ação
- Ajustar campos com largura fixa para usar largura completa em dispositivos móveis
- Garantir espaço adequado entre elementos em todos os breakpoints

```tsx
<div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6">
  <Button className="w-full sm:w-auto mb-2 sm:mb-0">Cancelar</Button>
  <Button className="w-full sm:w-auto">Salvar</Button>
</div>
```

### Posicionamento de Elementos

Para garantir uma interface consistente e acessível em todos os dispositivos, siga estas diretrizes de posicionamento:

#### Tooltips e Ícones de Ajuda

```tsx
{/* Correto: Ícone de tooltip próximo ao label */}
<div className="flex items-center">
  <Label>Nome do Campo</Label>
  <Tooltip content="Texto de ajuda sobre o campo" />
</div>

{/* Errado: Ícone de tooltip distante do label */}
<div className="flex items-center justify-between">
  <Label>Nome do Campo</Label>
  <Tooltip content="Texto de ajuda sobre o campo" />
</div>
```

#### Botões de Ação em Containers

Para botões de ação como "Excluir" ou "Remover" dentro de containers:

```tsx
{/* Correto: Botão de exclusão posicionado no canto superior direito */}
<div className="relative p-4 border rounded-lg">
  <Button
    variant="destructive"
    size="icon"
    className="absolute top-2 right-2"
    onClick={handleDelete}
  >
    <X className="h-4 w-4" />
  </Button>
  
  {/* Conteúdo com padding-top para evitar sobreposição */}
  <div className="pt-4">
    Conteúdo do container...
  </div>
</div>
```

#### Cabeçalhos de Seção Responsivos

```tsx
{/* Cabeçalho que se adapta a diferentes tamanhos de tela */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
  <div className="flex items-center">
    <h3 className="text-lg font-medium">Título da Seção</h3>
    <Tooltip content="Informação sobre a seção" />
  </div>
  <Button>Ação Principal</Button>
</div>
```

## Componentes de Formulário

### PointsRuleConfig

O componente `PointsRuleConfig` é utilizado para configurar regras baseadas em pontuação no sistema de badges.

#### Visão Geral

Este componente permite aos usuários definir:
- Uma pontuação mínima total necessária para receber o badge
- Vários tipos de eventos que contribuem para a pontuação, cada um com seu próprio peso

#### Props

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| data | `RuleFormData["points"]` | Dados da regra de pontuação |
| error | `string` | Mensagem de erro geral |
| errors | `RuleFormErrors` | Objeto com erros específicos |
| onChange | `(data: RuleFormData["points"]) => void` | Função para atualizar os dados |
| onValidate | `() => void` | Função para disparar validação |
| formSubmitted | `boolean` | Flag indicando se o formulário foi submetido |

#### Estrutura

O componente está estruturado em duas partes principais:

1. **Configuração de Pontuação Mínima**
   ```tsx
   <div className="space-y-2">
     <div className="flex items-center">
       <Label htmlFor="minPoints">Pontuação Mínima Total</Label>
       <Tooltip content="Quantidade mínima de pontos necessária..." />
     </div>
     <Input
       id="minPoints"
       type="number"
       value={data.minPoints}
       onChange={...}
     />
   </div>
   ```

2. **Configuração de Eventos**
   ```tsx
   <div className="space-y-2">
     {/* Cabeçalho com label e botão de adicionar */}
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
       <div className="flex items-center">
         <Label>Tipos de Eventos Considerados</Label>
         <Tooltip content="Eventos que contribuem para a pontuação total" />
       </div>
       <Button onClick={addEvent}>
         <Plus className="h-4 w-4 mr-1" />
         Adicionar Evento
       </Button>
     </div>
     
     {/* Lista de eventos */}
     <div className="space-y-2">
       {data.events.map((event, index) => (
         <div key={index} className="relative p-4 sm:p-5 border rounded-lg">
           {/* Botão de exclusão */}
           <Button
             onClick={() => removeEvent(index)}
             className="absolute top-2 right-2"
           >
             <X className="h-4 w-4" />
           </Button>
           
           {/* Campos do evento */}
           <div className="pt-4">
             {/* Tipo de evento e peso */}
           </div>
         </div>
       ))}
     </div>
   </div>
   ```

#### Responsividade

O componente implementa diversas estratégias para garantir responsividade:

1. **Layout Adaptativo**
   - Empilha elementos em telas pequenas e os posiciona lado a lado em telas maiores
   - Usa `flex-col sm:flex-row` para transição de layout

2. **Posicionamento de Botões**
   - Posiciona o botão de exclusão no canto superior direito usando posicionamento absoluto
   - Adiciona padding superior ao conteúdo para evitar sobreposição com o botão

3. **Campos Responsivos**
   - Usa `w-full sm:w-24` para campos numéricos, ocupando largura completa em dispositivos móveis
   - Implementa `flex-wrap` para acomodar texto descritivo ao lado dos campos

#### Exemplo de Uso

```tsx
<PointsRuleConfig
  data={formData.points}
  errors={formErrors}
  onChange={(pointsData) => handleInputChange("points", pointsData)}
  onValidate={validateForm}
  formSubmitted={submitted}
/>
```

## Toast

### Visão Geral

O componente Toast é utilizado para exibir notificações temporárias para o usuário. Estas notificações são exibidas brevemente e desaparecem automaticamente após um período definido, ou podem ser fechadas manualmente pelo usuário. Os toasts são utilizados para fornecer feedback sobre ações realizadas, como sucesso na criação/atualização de recursos, avisos ou erros encontrados.

### Dependências

O componente Toast é construído usando:

- **@radix-ui/react-toast**: Biblioteca acessível e sem estilo, fornecendo a funcionalidade base
- **class-variance-authority**: Utilizada para gerenciar variantes de estilo
- **Tailwind CSS**: Framework CSS utilitário para estilização
- **lucide-react**: Biblioteca de ícones para o botão de fechar

### Variantes

O componente Toast oferece três variantes com estilos visuais distintos:

1. **default**:
   - Estilo padrão com fundo e cores neutras
   - Classes: `border bg-background text-foreground`

2. **destructive**:
   - Utilizado para mensagens de erro ou ações destrutivas
   - Visual com cores vermelhas/destrutivas
   - Classes: `border-destructive bg-destructive text-destructive-foreground`

3. **success** (adicionado em 14/04/2025):
   - Utilizado para mensagens de sucesso ou confirmação
   - Visual com cores verdes
   - Classes: `border-green-500 bg-green-50 text-green-800`
   - Fundo verde claro (#f0fdf4) e texto verde escuro
   - Bordas verdes para destacar visualmente as mensagens

### Subcomponentes

O componente Toast é composto por vários subcomponentes:

#### ToastProvider

Provedor que deve envolver toda a aplicação para habilitar o sistema de toasts.

```tsx
<ToastProvider>
  {/* Conteúdo da aplicação */}
</ToastProvider>
```

#### ToastViewport

Define a área da tela onde os toasts serão exibidos.

```tsx
<ToastViewport 
  className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
/>
```

#### Toast

O componente principal que representa uma notificação toast.

**Props:**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| variant | `'default' \| 'destructive' \| 'success'` | Define o estilo visual do toast |
| open | `boolean` | Controla se o toast está visível |
| onOpenChange | `(open: boolean) => void` | Callback chamado quando o estado de abertura muda |
| ...props | `React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>` | Propriedades adicionais passadas para o componente raiz |

#### ToastTitle

Exibe o título do toast.

```tsx
<ToastTitle>Operação concluída</ToastTitle>
```

#### ToastDescription

Exibe a descrição ou mensagem principal do toast.

```tsx
<ToastDescription>Seus dados foram salvos com sucesso.</ToastDescription>
```

#### ToastAction

Botão opcional para uma ação relacionada ao toast.

```tsx
<ToastAction altText="Desfazer">Desfazer</ToastAction>
```

#### ToastClose

Botão para fechar manualmente o toast.

```tsx
<ToastClose />
```

### Hook useToast

O hook `useToast` fornece uma API para criar e gerenciar toasts.

```tsx
const { toast, dismiss } = useToast();
```

#### API do Hook

| Método | Parâmetros | Descrição |
|--------|------------|-----------|
| toast | `{ title?, description?, variant?, action? }` | Cria e exibe um novo toast |
| dismiss | `toastId?: string` | Fecha um toast específico ou todos se nenhum ID for fornecido |

#### Parâmetros do Método toast

| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| title | `React.ReactNode` | Título do toast | `undefined` |
| description | `React.ReactNode` | Conteúdo principal do toast | `undefined` |
| variant | `'default' \| 'destructive' \| 'success'` | Estilo visual a ser aplicado | `'default'` |
| action | `ToastActionElement` | Componente de ação opcional | `undefined` |

### Exemplos de Uso

#### Toast Padrão

```tsx
const { toast } = useToast();

const showToast = () => {
  toast({
    title: "Notificação",
    description: "Esta é uma notificação padrão",
  });
};
```

#### Toast de Erro

```tsx
const { toast } = useToast();

const showErrorToast = () => {
  toast({
    title: "Erro",
    description: "Não foi possível processar sua solicitação",
    variant: "destructive",
  });
};
```

#### Toast de Sucesso

```tsx
const { toast } = useToast();

const showSuccessToast = () => {
  toast({
    title: "Sucesso",
    description: "Regra criada com sucesso!",
    variant: "success",
  });
};
```

#### Toast com Ação

```tsx
const { toast } = useToast();

const showToastWithAction = () => {
  toast({
    title: "Item excluído",
    description: "O item foi removido da sua lista",
    action: <ToastAction altText="Desfazer">Desfazer</ToastAction>,
  });
};
```

#### Redirecionamento com Toast de Sucesso

Este exemplo mostra o padrão implementado em 14/04/2025 para redirecionar o usuário após salvar uma regra:

```tsx
const { toast } = useToast();
const router = useRouter();

const handleSuccess = async (data) => {
  toast({
    title: "Regra salva",
    description: "A regra foi salva com sucesso!",
    variant: "success"
  });
  
  // Redirecionamento para a página de lista de regras
  router.push("/admin/rules");
};
```

### Considerações Adicionais

- Os toasts são automaticamente fechados após 5 segundos (TOAST_REMOVE_DELAY = 5000).
- O número máximo de toasts exibidos simultaneamente é 5 (TOAST_LIMIT = 5).
- Os toasts são empilhados de baixo para cima em dispositivos desktop e de cima para baixo em dispositivos mobile.
- A estilização é totalmente personalizável através das classes do Tailwind CSS.
