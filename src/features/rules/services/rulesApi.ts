/**
 * Serviço para interação com a API de regras.
 * Centraliza todas as chamadas relacionadas a regras.
 */
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Rule, RuleCreateInput, RuleUpdateInput, ApiResponse, PaginationParams } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Base URL para endpoints de regras
const ENDPOINT = '/v1/rules';

// Função para criar regra
const createRuleAPI = async (data: RuleCreateInput): Promise<Rule> => {
  const response = await apiPost<ApiResponse<Rule>>(ENDPOINT, data);
  if (!response.item) {
    throw new Error('Falha ao criar regra');
  }
  return response.item;
};

// Hook React Query para criar regras (separado para evitar problemas com 'this')
export const useCreateRule = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: createRuleAPI,
    onSuccess: () => {
      // Invalidar cache para forçar atualização dos dados
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
  
  return {
    createRule: mutation.mutate,
    isCreating: mutation.isPending,
    createRuleError: mutation.error,
  };
};

export const rulesApi = {
  /**
   * Obtém a lista paginada de regras.
   * @param params Parâmetros de paginação e filtros
   * @returns Resposta da API com dados paginados
   */
  async getRules(params: PaginationParams = {}): Promise<ApiResponse<Rule>> {
    return apiGet<ApiResponse<Rule>>(ENDPOINT, params);
  },

  /**
   * Obtém uma regra específica pelo UID.
   * @param uid Identificador único da regra
   * @returns Detalhes da regra
   */
  async getRule(uid: string): Promise<Rule> {
    const response = await apiGet<ApiResponse<Rule>>(`${ENDPOINT}/${uid}`);
    if (!response.item) {
      throw new Error('Regra não encontrada');
    }
    return response.item;
  },

  /**
   * Cria uma nova regra.
   * @param data Dados da regra a ser criada
   * @returns A regra criada
   */
  createRule: createRuleAPI,

  /**
   * Hook para criar regras usando React Query
   */
  useCreateRule,

  /**
   * Atualiza uma regra existente.
   * @param uid Identificador único da regra
   * @param data Dados atualizados
   * @returns A regra atualizada
   */
  async updateRule(uid: string, data: RuleUpdateInput): Promise<Rule> {
    const response = await apiPatch<ApiResponse<Rule>>(`${ENDPOINT}/${uid}`, data);
    if (!response.item) {
      throw new Error('Falha ao atualizar regra');
    }
    return response.item;
  },

  /**
   * Remove uma regra.
   * @param uid Identificador único da regra a ser removida
   * @returns Sucesso da operação
   */
  async deleteRule(uid: string): Promise<boolean> {
    const response = await apiDelete<ApiResponse<null>>(`${ENDPOINT}/${uid}`);
    return response.success;
  },

  /**
   * Transforma dados do formulário para o formato aceito pela API
   * @param formData Dados do formulário
   * @returns Dados formatados para a API
   */
  transformFormToApiInput(formData: any): RuleCreateInput | RuleUpdateInput {
    // Determinar o tipo de configuração baseado no tipo de regra
    let configuration;
    
    switch (formData.type) {
      case 'points':
        configuration = {
          minPoints: formData.points.minPoints,
          events: formData.points.events
        };
        break;
      case 'direct':
        configuration = {
          assignerProfiles: formData.directAssignment.assignerProfiles,
          assignmentLimit: formData.directAssignment.assignmentLimit
        };
        break;
      case 'events':
        configuration = {
          eventType: formData.eventCount.eventType,
          minOccurrences: formData.eventCount.minOccurrences,
          periodType: formData.eventCount.periodType,
          periodValue: formData.eventCount.periodValue,
          requiredStreak: formData.eventCount.requiredStreak
        };
        break;
      case 'ranking':
        configuration = {
          rankingId: formData.ranking.rankingId,
          requiredPosition: formData.ranking.requiredPosition
        };
        break;
      default:
        configuration = {};
    }

    // Construir o objeto para a API
    return {
      name: formData.name,
      description: formData.description,
      type: formData.type as any,
      configuration,
      context: formData.context,
      status: formData.status || 'active'
    };
  },

  /**
   * Transforma dados da API para o formato do formulário
   * @param apiData Dados da API
   * @returns Dados formatados para o formulário
   */
  transformApiToFormData(apiData: Rule): any {
    const formData: any = {
      uid: apiData.uid,
      name: apiData.name,
      description: apiData.description,
      type: apiData.type,
      context: apiData.context,
      status: apiData.status
    };

    // Configuração específica por tipo
    const config = apiData.configuration || {};

    switch (apiData.type) {
      case 'points':
        formData.points = {
          minPoints: config.minPoints || 0,
          events: config.events || []
        };
        break;
      case 'direct':
        formData.directAssignment = {
          assignerProfiles: config.assignerProfiles || [],
          assignmentLimit: config.assignmentLimit || 0
        };
        break;
      case 'events':
        formData.eventCount = {
          eventType: config.eventType || '',
          minOccurrences: config.minOccurrences || 0,
          periodType: config.periodType || 'day',
          periodValue: config.periodValue || 1,
          requiredStreak: config.requiredStreak || 0
        };
        break;
      case 'ranking':
        formData.ranking = {
          rankingId: config.rankingId || '',
          requiredPosition: config.requiredPosition || 1
        };
        break;
    }

    return formData;
  }
};
