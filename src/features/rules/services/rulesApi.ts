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
    // Null safety check
    if (!formData) {
      formData = {};
    }

    // Determinar o tipo de configuração baseado no tipo de regra
    let configuration;
    
    switch (formData.type) {
      case 'points':
        const pointsData = formData.points || {};
        configuration = {
          minPoints: pointsData.minPoints,
          events: pointsData.events
        };
        break;
      case 'direct':
        const directData = formData.directAssignment || {};
        configuration = {
          assignerProfiles: directData.assignerProfiles,
          assignmentLimit: directData.assignmentLimit
        };
        break;
      case 'events':
        const eventsData = formData.eventCount || {};
        configuration = {
          eventType: eventsData.eventType,
          minOccurrences: eventsData.minOccurrences,
          periodType: eventsData.periodType,
          periodValue: eventsData.periodValue,
          requiredStreak: eventsData.requiredStreak
        };
        break;
      case 'ranking':
        const rankingData = formData.ranking || {};
        configuration = {
          rankingId: rankingData.rankingId,
          requiredPosition: rankingData.requiredPosition
        };
        break;
      default:
        // Preserve original configuration for unknown types
        configuration = formData.configuration || {};
    }

    // Construir o objeto para a API - preserving all fields including uid and metadata
    const result: any = {
      name: formData.name,
      description: formData.description,
      type: formData.type as any,
      configuration,
      context: formData.context,
      status: formData.status || 'active'
    };

    // Preserve uid for updates
    if (formData.uid) {
      result.uid = formData.uid;
    }

    // Preserve additional metadata fields
    const metadataFields = ['createdAt', 'updatedAt', 'createdBy', 'metadata', 'assignedBadges'];
    metadataFields.forEach(field => {
      if (formData[field] !== undefined) {
        result[field] = formData[field];
      }
    });

    return result;
  },

  /**
   * Transforma dados da API para o formato do formulário
   * @param apiData Dados da API
   * @returns Dados formatados para o formulário
   */
  transformApiToFormData(apiData: Rule): any {
    // Null safety check
    if (!apiData) {
      return {};
    }

    const formData: any = {
      uid: apiData.uid,
      name: apiData.name,
      description: apiData.description,
      type: apiData.type,
      context: apiData.context,
      status: apiData.status
    };

    // Preserve additional metadata fields
    const metadataFields = ['createdAt', 'updatedAt', 'createdBy', 'metadata', 'assignedBadges'];
    metadataFields.forEach(field => {
      if ((apiData as any)[field] !== undefined) {
        formData[field] = (apiData as any)[field];
      }
    });

    // Configuração específica por tipo
    const config = apiData.configuration || {};

    switch (apiData.type) {
      case 'points':
        formData.points = {
          minPoints: config.minPoints || 0,
          events: config.events || [],
          // Preserve additional configuration fields for points
          ...Object.keys(config).reduce((acc, key) => {
            if (key !== 'minPoints' && key !== 'events') {
              acc[key] = config[key];
            }
            return acc;
          }, {} as any)
        };
        break;
      case 'direct':
        formData.directAssignment = {
          assignerProfiles: config.assignerProfiles || [],
          assignmentLimit: config.assignmentLimit || 0,
          // Preserve additional configuration fields for direct
          ...Object.keys(config).reduce((acc, key) => {
            if (key !== 'assignerProfiles' && key !== 'assignmentLimit') {
              acc[key] = config[key];
            }
            return acc;
          }, {} as any)
        };
        break;
      case 'events':
        formData.eventCount = {
          eventType: config.eventType || '',
          minOccurrences: config.minOccurrences || 0,
          periodType: config.periodType || 'day',
          periodValue: config.periodValue || 0, // Fixed: default to 0 instead of 1
          requiredStreak: config.requiredStreak || 0,
          // Preserve additional configuration fields for events
          ...Object.keys(config).reduce((acc, key) => {
            if (!['eventType', 'minOccurrences', 'periodType', 'periodValue', 'requiredStreak'].includes(key)) {
              acc[key] = config[key];
            }
            return acc;
          }, {} as any)
        };
        break;
      case 'ranking':
        formData.ranking = {
          rankingId: config.rankingId || '',
          requiredPosition: config.requiredPosition || 1,
          // Preserve additional configuration fields for ranking
          ...Object.keys(config).reduce((acc, key) => {
            if (key !== 'rankingId' && key !== 'requiredPosition') {
              acc[key] = config[key];
            }
            return acc;
          }, {} as any)
        };
        break;
      default:
        // For unknown types, preserve the entire configuration
        if (config && Object.keys(config).length > 0) {
          formData.configuration = config;
        }
        break;
    }

    return formData;
  }
};
