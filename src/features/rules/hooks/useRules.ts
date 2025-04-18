'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rulesApi } from '../services/rulesApi';
import { Rule, RuleCreateInput, RuleUpdateInput, PaginationParams, ApiResponse } from '../types';

/**
 * Hook para gerenciamento de regras usando React Query
 * Fornece operações CRUD e estados associados
 */
export function useRules(params: PaginationParams = {}) {
  const queryClient = useQueryClient();
  const queryKey = ['rules', params];
  
  // Query para listar regras
  const rulesQuery = useQuery({
    queryKey,
    queryFn: () => rulesApi.getRules(params),
  });
  
  // Mutation para criar regra
  const createRuleMutation = useMutation({
    mutationFn: (data: RuleCreateInput) => rulesApi.createRule(data),
    onSuccess: () => {
      // Invalidar cache para forçar atualização dos dados
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
  
  // Mutation para atualizar regra
  const updateRuleMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: RuleUpdateInput }) => 
      rulesApi.updateRule(uid, data),
    onSuccess: (updatedRule) => {
      // Atualizar cache com os dados atualizados
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['rule', updatedRule.uid] });
    },
  });
  
  // Mutation para excluir regra
  const deleteRuleMutation = useMutation({
    mutationFn: (uid: string) => rulesApi.deleteRule(uid),
    onSuccess: (_data, uid) => {
      // Remover regra do cache
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.removeQueries({ queryKey: ['rule', uid] });
    },
  });
  
  return {
    // Dados
    rules: rulesQuery.data?.items || [],
    totalCount: rulesQuery.data?.totalCount || 0,
    pagination: {
      page: rulesQuery.data?.page || 1,
      pageSize: rulesQuery.data?.pageSize || 10,
    },
    
    // Estados
    isLoading: rulesQuery.isLoading,
    isError: rulesQuery.isError,
    error: rulesQuery.error,
    
    // Mutações
    createRule: createRuleMutation.mutate,
    isCreating: createRuleMutation.isPending,
    updateRule: updateRuleMutation.mutate,
    isUpdating: updateRuleMutation.isPending,
    deleteRule: deleteRuleMutation.mutate,
    isDeleting: deleteRuleMutation.isPending,
    
    // Funções auxiliares
    refetch: rulesQuery.refetch,
  };
}

/**
 * Hook para gerenciar uma regra específica
 */
export function useRule(uid: string) {
  const queryClient = useQueryClient();
  const queryKey = ['rule', uid];
  
  // Query para obter regra específica
  const ruleQuery = useQuery({
    queryKey,
    queryFn: () => rulesApi.getRule(uid),
    enabled: !!uid, // Só executa se uid for fornecido
  });
  
  // Mutation para atualizar regra
  const updateRuleMutation = useMutation({
    mutationFn: (data: RuleUpdateInput) => rulesApi.updateRule(uid, data),
    onSuccess: (updatedRule) => {
      // Atualizar cache com os dados atualizados
      queryClient.setQueryData(queryKey, updatedRule);
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
  
  // Mutation para excluir regra
  const deleteRuleMutation = useMutation({
    mutationFn: () => rulesApi.deleteRule(uid),
    onSuccess: () => {
      // Remover regra do cache
      queryClient.removeQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
  
  return {
    rule: ruleQuery.data,
    isLoading: ruleQuery.isLoading,
    isError: ruleQuery.isError,
    error: ruleQuery.error,
    updateRule: updateRuleMutation.mutate,
    isUpdating: updateRuleMutation.isPending,
    deleteRule: deleteRuleMutation.mutate,
    isDeleting: deleteRuleMutation.isPending,
    refetch: ruleQuery.refetch,
  };
}
