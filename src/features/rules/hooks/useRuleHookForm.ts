'use client';

import { useForm, useWatch, FormProvider, UseFormReturn } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { useRule } from './useRules';
import { rulesApi, useCreateRule } from '../services/rulesApi';
import { useToast } from '@/components/ui/use-toast';
import { Rule, RuleFormData } from '../types';

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

interface UseRuleHookFormOptions {
  uid?: string;
  onSuccess?: (rule: Rule) => void;
}

export function useRuleHookForm(options: UseRuleHookFormOptions = {}) {
  const { uid, onSuccess } = options;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Usar react-hook-form para gerenciar o estado do formulário
  const methods = useForm<RuleFormData>({
    defaultValues: initialFormData,
    mode: 'onChange', // Validação em tempo real
  });
  
  const { 
    handleSubmit, 
    control, 
    reset, 
    formState: { errors, isDirty, isValid },
    setValue, 
    getValues,
    watch
  } = methods;
  
  // Observar o tipo selecionado para otimizar a renderização condicional
  const selectedType = useWatch({
    control,
    name: 'type',
  });
  
  // Se um UID for fornecido, carregamos os dados da regra para edição
  const { rule, isLoading, updateRule, isUpdating } = useRule(uid || "");
  
  // API para criar regra (usando o hook exportado)
  const { createRule, isCreating } = useCreateRule();
  
  // Carregar dados para edição
  useEffect(() => {
    if (uid && rule) {
      // Converter dados da API para o formato do formulário
      const formattedData = rulesApi.transformApiToFormData(rule);
      
      // Resetar o formulário com os dados carregados
      reset(formattedData);
    }
  }, [uid, rule, reset]);
  
  // Função para lidar com a submissão do formulário
  const onSubmit = useCallback(async (data: RuleFormData) => {
    setIsSubmitting(true);
    
    try {
      // Transformar os dados do formulário para o formato da API
      const apiData = rulesApi.transformFormToApiInput(data);
      
      let result;
      if (uid) {
        // Atualizar regra existente
        result = await updateRule(apiData);
        
        toast({
          title: 'Regra atualizada',
          description: 'A regra foi atualizada com sucesso.',
        });
      } else {
        // Criar nova regra
        result = await createRule(apiData);
        
        toast({
          title: 'Regra criada',
          description: 'A regra foi criada com sucesso.',
        });
        
        // Limpar o formulário
        reset(initialFormData);
      }
      
      // Callback de sucesso
      if (onSuccess && result) {
        onSuccess(result);
      }
    } catch (error) {
      console.error(`Erro ao ${uid ? 'atualizar' : 'criar'} a regra:`, error);
      
      toast({
        title: `Erro ao ${uid ? 'atualizar' : 'criar'} regra`,
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
      
      // Tratar erros de validação da API
      if (error.data?.validationErrors) {
        const apiErrors = error.data.validationErrors;
        
        // Mapear erros da API para os campos do formulário
        Object.entries(apiErrors).forEach(([key, value]) => {
          setValue(key as any, getValues(key as any), {
            shouldValidate: true,
            shouldDirty: true,
            shouldError: true,
          });
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [uid, updateRule, createRule, reset, toast, onSuccess, setValue, getValues]);
  
  return {
    // Dados do formulário através do react-hook-form
    formMethods: methods as UseFormReturn<RuleFormData>,
    // Estados
    isLoading,
    isSubmitting: isSubmitting || isCreating || isUpdating,
    // Ações
    onSubmit: handleSubmit(onSubmit),
    // Valores observados para otimização
    selectedType,
    // Erros do formulário
    errors,
    // Estados do formulário
    isDirty,
    isValid,
  };
}
