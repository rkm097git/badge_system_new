# Parking Lot - Badge System

Este documento registra questões identificadas que precisam de atenção futura, mas que não são prioritárias no momento atual.

## Questões Pendentes

### 1. Erro de Hidratação React nos Componentes Radix UI

**Data de identificação:** 14/04/2025

**Descrição:** 
Erro no console relacionado ao atributo `aria-controls` dos componentes Radix UI:

```
Warning: Prop 'aria-controls' did not match. Server: "radix-:R9bjddd6pcq:" Client: "radix-:R15edllkr5j9:"
```

**Análise:**
Este é um problema de hidratação React conhecido que ocorre quando componentes com IDs gerados dinamicamente são renderizados de forma diferente no servidor (SSR - Server-Side Rendering) e no cliente. No caso do Badge System, isso acontece com o atributo `aria-controls` dos componentes do Radix UI, provavelmente nos componentes de Select ou Tooltip utilizados nos formulários.

O problema não afeta a funcionalidade da aplicação ou a experiência do usuário. É apenas um aviso de desenvolvimento indicando inconsistências na renderização entre servidor e cliente.

**Possíveis soluções:**

1. **Usar suppressHydrationWarning:**
   ```tsx
   <SelectTrigger 
     suppressHydrationWarning
     aria-controls="..."
     // outros props
   >
   ```

2. **Atualizar as dependências:**
   Verificar se há atualizações disponíveis para os pacotes @radix-ui que possam ter corrigido esse problema.

3. **Implementar useId() do React 18:**
   Utilizar o hook `useId()` para gerar IDs estáveis que sejam consistentes entre o servidor e o cliente.

**Componentes afetados:**
- SelectTrigger (usado em RuleTypeSelection, RuleContextSelection e PointsRuleConfig)
- TooltipTrigger (usado no componente Tooltip customizado)

**Prioridade:** Baixa - Não afeta a funcionalidade ou a experiência do usuário

**Responsável:** A definir

---

*Nota: Este documento serve como um registro centralizado de questões identificadas que não são urgentes para resolução imediata, mas que devem ser consideradas em iterações futuras do desenvolvimento.*
