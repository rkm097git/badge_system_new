'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { RuleFormData, RuleFormErrors, Rule } from "../types";
import { useRules, useRule } from "./useRules";
import { rulesApi } from "../services/rulesApi";
import { useToast } from "@/components/ui/use-toast";

const initialFormData: RuleFormData = {
  name: "",
  description: "",
  type: "",
  points: {
    minPoints: 0,
    events: []
  },
  directAssignment: {
    assignerProfiles: [],
    assignmentLimit: 0
  },
  eventCount: {
    eventType: "",
    minOccurrences: 0,
    periodType: "day",
    periodValue: 1,
    requiredStreak: 0
  },
  ranking: {
    rankingId: "",
    requiredPosition: 1
  },
  context: {
    type: "",
    items: []
  },
  status: "active"
};

interface UseRuleFormOptions {
  uid?: string;
  onSuccess?: (rule: Rule) => void;
}

/**
 * Hook personalizado para gerenciar o estado e validação do formulário de regras.
 * Separa a lógica de estado e validação da apresentação do componente.
 * Integrado com a API através do serviço rulesApi.
 */
export function useRuleForm(options: UseRuleFormOptions = {}) {
  const { uid, onSuccess } = options;
  const [formData, setFormData] = useState<RuleFormData>(initialFormData);
  const [errors, setErrors] = useState<RuleFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Usamos os hooks criados para operações CRUD
  const { createRule, isCreating } = useRules();
  
  // Se um UID for fornecido, carregamos os dados da regra para edição
  const { rule, isLoading, updateRule, isUpdating } = useRule(uid || "");
  
  // Carrega os dados da regra para edição
  useEffect(() => {
    if (uid && rule) {
      // Converte os dados da API para o formato do formulário
      const formattedData = rulesApi.transformApiToFormData(rule);
      setFormData(formattedData);
    }
  }, [uid, rule]);

  // Validação - Memoizada para evitar recálculos desnecessários
  const validateForm = useCallback(() => {
    const newErrors: RuleFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "O nome da regra é obrigatório";
    }

    if (!formData.description.trim()) {
      newErrors.description = "A descrição da regra é obrigatória";
    }

    if (!formData.type) {
      newErrors.type = "O tipo de regra é obrigatório";
    }

    // Validações específicas por tipo
    switch (formData.type) {
      case "points":
        // Verifica primeiro se a pontuação mínima é válida
        if (formData.points?.minPoints <= 0) {
          newErrors.pointsMinPoints = "A pontuação mínima deve ser maior que zero";
        }
        
        // Verifica se há eventos
        if (!formData.points?.events || formData.points.events.length === 0) {
          newErrors.pointsEvents = "Adicione pelo menos um tipo de evento";
        } 
        else {
          // Verifica se todos os eventos têm tipo selecionado
          const hasEmptyEventType = formData.points.events.some(event => !event.type);
          if (hasEmptyEventType) {
            // NÃO definimos um erro geral para "points" aqui 
            // para evitar a mensagem no campo de pontuação mínima
            
            // Marcar todos os eventos sem tipo para validação visual
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

      case "direct":
        if (formData.directAssignment?.assignerProfiles.length === 0) {
          newErrors.directAssignmentProfiles = "Selecione pelo menos um perfil de atribuidor";
        }
        // Removemos a validação que verifica se assignmentLimit é menor ou igual a zero,
        // já que o valor 0 é permitido para indicar atribuições ilimitadas
        if (formData.directAssignment?.assignmentLimit < 0) {
          newErrors.directAssignmentLimit = "O limite de atribuições não pode ser negativo";
        }
        break;

      case "events":
        if (!formData.eventCount?.eventType) {
          newErrors.eventCount = "Selecione um tipo de evento";
        }
        if (formData.eventCount?.minOccurrences <= 0) {
          newErrors.eventCount = "O número mínimo de ocorrências deve ser maior que zero";
        }
        break;

      case "ranking":
        if (!formData.ranking?.rankingId) {
          newErrors.ranking = "Selecione um ranking";
        }
        if (formData.ranking?.requiredPosition <= 0) {
          newErrors.ranking = "A posição necessária deve ser maior que zero";
        }
        break;
    }

    // Validação de contexto
    if (formData.context?.type && formData.context.items.length === 0) {
      newErrors.context = "Selecione pelo menos um item do contexto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]); // Dependência apenas de formData

  // Handler para alterações genéricas no formulário - Memoizado para evitar recriação
  const handleInputChange = useCallback((field: string, value: any) => {
    // Atualiza o estado do formulário
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Se existir um erro para este campo, limpa o erro
    setErrors(prev => {
      // Se não há erros para este campo, retorna os erros sem modificação
      if (!prev[field]) return prev;
      
      // Caso contrário, cria uma nova cópia e remove o erro
      const newErrors = { ...prev };
      delete newErrors[field];
      
      // Casos especiais para limpeza de erros
      if (field === 'type') {
        // Limpa erros específicos de tipos quando o tipo muda
        delete newErrors.points;
        delete newErrors.directAssignment;
        delete newErrors.eventCount;
        delete newErrors.ranking;
      }
      
      // Se o campo é um objeto de configuração, limpa seus erros
      if (['points', 'directAssignment', 'eventCount', 'ranking', 'context'].includes(field)) {
        delete newErrors[field];
      }
      
      return newErrors;
    });
  }, []); // Sem dependências, já que usa setFormData e setErrors (funções estáveis do useState)

  // Handler de submit - Memoizado
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar que o formulário foi submetido para mostrar todos os erros
    setFormSubmitted(true);
    
    if (!validateForm()) {
      toast({
        title: "Formulário incompleto",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Transformar os dados do formulário para o formato da API
      const apiData = rulesApi.transformFormToApiInput(formData);
      
      let result;
      if (uid) {
        // Atualização
        result = await updateRule(apiData);
        
        // Mostrar feedback de sucesso
        toast({
          title: "Regra atualizada",
          description: "A regra foi atualizada com sucesso. Clique no link 'Lista de Regras' no topo da página para voltar.",
          variant: "success",
        });
      } else {
        // Criação
        result = await createRule(apiData);
        
        // Mostrar feedback de sucesso
        toast({
          title: "Regra criada",
          description: "A regra foi criada com sucesso. Clique no link 'Lista de Regras' no topo da página para voltar.",
          variant: "success",
        });
        
        // Limpar o formulário se for uma nova regra
        setFormData(initialFormData);
      }
      
      // Callback de sucesso se fornecido
      if (onSuccess && result) {
        console.log('[V1.5.0] Chamando callback onSuccess com resultado:', result);
        
        // Atualizado para loggar a conclusão bem sucedida
        console.log('[V1.5.0] Operação completada com sucesso, o usuário pode usar o link no topo para navegar');
        
        try {
          onSuccess(result);
        } catch (callbackError) {
          console.error('[V1.5.0] Erro ao executar callback onSuccess:', callbackError);
        }
      }
    } catch (error) {
      console.error(`Erro ao ${uid ? 'atualizar' : 'criar'} a regra:`, error);
      
      // Mostrar feedback de erro
      toast({
        title: `Erro ao ${uid ? 'atualizar' : 'criar'} regra`,
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      
      // Se o erro contiver informações de validação, podemos atualizá-las no estado
      if (error.data?.validationErrors) {
        const apiErrors = error.data.validationErrors;
        const formErrors: RuleFormErrors = {};
        
        // Mapear erros da API para os campos do formulário
        Object.keys(apiErrors).forEach(key => {
          formErrors[key] = apiErrors[key].join(', ');
        });
        
        setErrors(formErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, formData, uid, updateRule, createRule, toast, onSuccess]); // Dependências explícitas

  // Estado de submissão combinado - Memoizado para evitar recálculos
  const isSubmittingCombined = useMemo(() => 
    isCreating || isUpdating || isSubmitting, 
    [isCreating, isUpdating, isSubmitting]
  );

  // Retorno memoizado para garantir estabilidade de referência
  return {
    formData,
    errors,
    setFormData,
    handleInputChange,
    validateForm,
    handleSubmit,
    isLoading,
    isSubmitting: isSubmittingCombined,
    formSubmitted
  };
}
