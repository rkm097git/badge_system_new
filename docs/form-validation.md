# Validação de Formulários - Sistema de Badges

Este documento detalha a implementação e os comportamentos esperados para a validação de formulários no Sistema de Badges, com foco especial no formulário de regras de atribuição.

## Visão Geral

O sistema de validação de formulários foi implementado visando:

1. Feedback visual imediato e claro para o usuário
2. Validação consistente em todos os tipos de regras
3. Prevenção de submissão de dados inválidos
4. Experiência de usuário aprimorada com mensagens de erro contextuais

## Componentes Principais

### 1. Hook useRuleForm

O hook `useRuleForm` centraliza a lógica de validação do formulário:

```typescript
// src/features/rules/hooks/useRuleForm.ts
export function useRuleForm(options: UseRuleFormOptions = {}) {
  // ...
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Validação centralizada
  const validateForm = useCallback(() => {
    const newErrors: RuleFormErrors = {};
    
    // Validações básicas para todos os tipos de regra
    if (!formData.name.trim()) {
      newErrors.name = "O nome da regra é obrigatório";
    }
    
    // ...
    
    // Validações específicas por tipo
    switch (formData.type) {
      case "points":
        if (formData.points?.minPoints <= 0) {
          newErrors.points = "A pontuação mínima deve ser maior que zero";
        }
        else if (formData.points?.events.length === 0) {
          newErrors.points = "Adicione pelo menos um tipo de evento";
        } 
        else {
          // Verifica se todos os eventos têm tipo selecionado
          const hasEmptyEventType = formData.points.events.some(event => !event.type);
          if (hasEmptyEventType) {
            newErrors.points = "Tipo de evento é obrigatório";
            
            // Marcar todos os eventos sem tipo para feedback visual
            if (formSubmitted) {
              formData.points.events.forEach((event, index) => {
                if (!event.type) {
                  newErrors[`points.events.${index}.type`] = "Tipo de evento é obrigatório";
                }
              });
            }
          }
        }
        break;
      
      // Outros tipos de regra...
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, formSubmitted]);
  
  // Submissão do formulário com verificação de validação
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ativa o feedback visual para todos os campos
    setFormSubmitted(true);
    
    if (!validateForm()) {
      toast({
        title: "Formulário incompleto",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    
    // Processamento do formulário válido...
  }, [validateForm, formData, /*...*/]);
  
  // ...
}
```

### 2. Componentes de Configuração de Regras

Os componentes específicos para cada tipo de regra implementam a apresentação visual da validação:

#### PointsRuleConfig

```typescript
// src/features/rules/components/RuleForm/types/PointsRuleConfig.tsx
export function PointsRuleConfig({ 
  data, 
  error, 
  errors, 
  onChange, 
  onValidate,
  formSubmitted 
}: PointsRuleConfigProps) {
  // ...
  
  return (
    <div className="space-y-4">
      {/* ... */}
      
      {data.events.map((event, index) => (
        <div key={index} className="flex items-start gap-2 p-4 border rounded-md bg-slate-100 dark:bg-slate-800">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select
                value={event.type}
                onValueChange={(value) => {
                  // Lógica de atualização...
                  
                  // Revalidação quando o valor muda de vazio para preenchido
                  if (!event.type && value && error && onValidate) {
                    setTimeout(() => onValidate(), 0);
                  }
                }}
              >
                <SelectTrigger 
                  className={`bg-white dark:bg-gray-800 text-left ${
                    (!event.type && error) || 
                    (errors && errors[`points.events.${index}.type`]) || 
                    (formSubmitted && !event.type) 
                      ? 'border-red-500 ring-red-500' 
                      : ''
                  }`}
                >
                  {/* ... */}
                </SelectTrigger>
                <SelectContent>
                  {/* ... */}
                </SelectContent>
              </Select>
              
              {/* Mensagem de erro condicional */}
              {((!event.type && error) || 
                (errors && errors[`points.events.${index}.type`]) ||
                (formSubmitted && !event.type)) && (
                <p className="text-sm text-red-500 mt-1">Tipo de evento é obrigatório</p>
              )}
            </div>
            
            {/* ... */}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Fluxo de Validação

### 1. Validação ao Submeter

Quando o usuário tenta submeter o formulário:

1. O estado `formSubmitted` é definido como `true`
2. A função `validateForm()` é chamada para verificar todos os campos
3. Para regras do tipo "pontuação", cada evento é verificado quanto ao tipo
4. Erros são registrados no objeto `errors` com chaves específicas
5. Feedback visual é aplicado a todos os campos inválidos
6. Se houver erros, a submissão é impedida e uma mensagem toast é exibida

### 2. Validação em Tempo Real

À medida que o usuário interage com o formulário:

1. Alterações nos valores dos campos são detectadas
2. Se um campo tinha erro e agora tem valor válido, o erro é limpo
3. Na seleção de "Tipo de Evento", quando um valor é selecionado, a validação completa é executada

## Comportamentos Esperados

1. **Campos Obrigatórios**: Todos os campos obrigatórios vazios são destacados em vermelho ao tentar submeter o formulário
2. **Tipo de Evento**: 
   - Cada evento adicionado deve ter um tipo selecionado
   - Eventos com tipo não selecionado são destacados em vermelho
   - Uma mensagem de erro é exibida abaixo de cada campo inválido
3. **Feedback Visual**:
   - Bordas vermelhas em campos inválidos
   - Mensagens de erro específicas abaixo de cada campo
   - Mensagem toast global para erros de formulário
4. **Prevenção de Submissão**: O formulário não pode ser submetido até que todos os campos obrigatórios estejam preenchidos

## Casos de Teste

1. **Básico**:
   - Tentar submeter formulário com campos vazios → Ver erros e feedback visual
   - Preencher todos os campos obrigatórios → Submissão bem-sucedida

2. **Tipo de Evento**:
   - Adicionar um evento sem selecionar tipo → Ver erro e feedback visual
   - Adicionar múltiplos eventos e deixar alguns sem tipo → Ver erros apenas nos campos vazios
   - Selecionar um tipo para um evento com erro → Erro deve desaparecer

3. **Troca de Tipo de Regra**:
   - Mudar tipo de regra após ver erros → Erros específicos do tipo anterior devem ser limpos

## Correções de Bugs de Validação

### Problema: Mensagem de erro no campo errado

Um problema foi identificado onde a mensagem de erro "Tipo de evento é obrigatório" estava sendo incorretamente exibida no campo "Pontuação Mínima" quando um evento não tinha tipo selecionado, mesmo quando o campo de pontuação mínima estava corretamente preenchido.

**Causa raiz:**
- A estrutura de erros usava a mesma chave (`newErrors.points`) tanto para erros de pontuação mínima quanto para erros de eventos
- Quando havia eventos sem tipo, o erro geral da seção era definido com a mensagem "Tipo de evento é obrigatório"
- Este erro geral era exibido no campo de pontuação mínima, causando confusão

**Solução:**
- Reestruturar as chaves de erro para separar claramente os diferentes campos:
  - `newErrors.pointsMinPoints` para erros de pontuação mínima
  - `newErrors[points.events.${index}.type]` para erros de tipos de eventos específicos
- Modificar o componente para usar as chaves corretas ao exibir mensagens de erro
- Evitar sobrescrever erros específicos com erros gerais

**Implementação:**
```typescript
// Antes
if (formData.points?.minPoints <= 0) {
  newErrors.points = "A pontuação mínima deve ser maior que zero";
}
else if (hasEmptyEventType) {
  newErrors.points = "Tipo de evento é obrigatório";
}

// Depois
if (formData.points?.minPoints <= 0) {
  newErrors.pointsMinPoints = "A pontuação mínima deve ser maior que zero";
}

// Validação separada para eventos
if (hasEmptyEventType) {
  formData.points.events.forEach((event, index) => {
    if (!event.type) {
      newErrors[`points.events.${index}.type`] = "Tipo de evento é obrigatório";
    }
  });
}
```

## Sumário de Implementação

1. **Estado Global de Validação**: `formSubmitted` para controlar quando mostrar feedback visual
2. **Validação Hierárquica**: Validação específica para eventos dentro de regras de pontuação
3. **Feedback Contextual**: Mensagens de erro específicas para cada tipo de validação
4. **Experiência de Usuário**: Feedback visual claro e imediato para guiar o preenchimento
5. **Estrutura de Erros Especializada**: Chaves de erro distintas para diferentes campos, evitando sobreposições

## Melhorias Futuras

1. **Validação no Servidor**: Implementar validação duplicada no servidor para garantir integridade de dados
2. **Schema Validation**: Integrar com biblioteca como Zod ou Yup para validação declarativa
3. **Testes Automatizados**: Adicionar testes para verificar o comportamento de validação
4. **Animações de Feedback**: Adicionar animações suaves para alertas de erro/sucesso
