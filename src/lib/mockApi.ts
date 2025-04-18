/**
 * Mock da API para desenvolvimento local
 * Simula o comportamento da API real com dados de teste
 */
import { Rule, ApiResponse, RuleCreateInput, RuleUpdateInput } from '@/features/rules/types';

// Dados de teste para regras
const mockRules: Rule[] = [
  {
    uid: '1',
    name: 'Conclusão de Curso',
    description: 'Regra para conclusão de curso completo',
    type: 'points',
    configuration: {
      minPoints: 100,
      events: [
        { type: 'lesson_completed', weight: 5 },
        { type: 'quiz_completed', weight: 10 }
      ]
    },
    context: {
      type: 'course',
      items: ['curso-1', 'curso-2']
    },
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2025-03-15T10:00:00Z',
    status: 'active'
  },
  {
    uid: '2',
    name: 'Participação em Fórum',
    description: 'Regra para participação ativa em fóruns',
    type: 'events',
    configuration: {
      eventType: 'forum_post',
      minOccurrences: 5,
      periodType: 'week',
      periodValue: 1,
      requiredStreak: 0
    },
    context: {
      type: 'department',
      items: ['dept-1']
    },
    createdAt: '2025-03-20T14:30:00Z',
    updatedAt: '2025-03-20T14:30:00Z',
    status: 'active'
  },
  {
    uid: '3',
    name: 'Ranking Semestral',
    description: 'Regra para os top 3 alunos do semestre',
    type: 'ranking',
    configuration: {
      rankingId: 'ranking-1',
      requiredPosition: 3
    },
    context: {
      type: 'campus',
      items: ['campus-1']
    },
    createdAt: '2025-03-25T09:15:00Z',
    updatedAt: '2025-03-25T09:15:00Z',
    status: 'draft'
  }
];

/**
 * Implementação do mock da API de regras
 */
export const mockRulesApi = {
  /**
   * Obtém a lista paginada de regras
   */
  getRules: (params: any = {}): Promise<ApiResponse<Rule>> => {
    return new Promise((resolve) => {
      // Simular tempo de resposta da rede
      setTimeout(() => {
        const { page = 1, pageSize = 10, search = '' } = params;
        
        // Filtrar regras se houver termo de busca
        let filteredRules = mockRules;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredRules = mockRules.filter(rule => 
            rule.name.toLowerCase().includes(searchLower) || 
            rule.description.toLowerCase().includes(searchLower)
          );
        }
        
        // Paginação básica
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedRules = filteredRules.slice(startIndex, endIndex);
        
        resolve({
          items: paginatedRules,
          totalCount: filteredRules.length,
          page: page,
          pageSize: pageSize,
          success: true
        });
      }, 500); // 500ms de delay simulado
    });
  },
  
  /**
   * Obtém uma regra específica pelo UID
   */
  getRule: (uid: string): Promise<Rule> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const rule = mockRules.find(r => r.uid === uid);
        
        if (rule) {
          resolve(rule);
        } else {
          reject({ 
            status: 404, 
            message: 'Regra não encontrada',
            data: null
          });
        }
      }, 300);
    });
  },
  
  /**
   * Cria uma nova regra
   */
  createRule: (data: RuleCreateInput): Promise<Rule> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular criação de uma nova regra
        const newRule: Rule = {
          uid: `new-${Date.now()}`,
          name: data.name,
          description: data.description,
          type: data.type,
          configuration: data.configuration,
          context: data.context,
          status: data.status || 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Adicionar à lista de regras mock
        mockRules.push(newRule);
        
        resolve(newRule);
      }, 700);
    });
  },
  
  /**
   * Atualiza uma regra existente
   */
  updateRule: (uid: string, data: RuleUpdateInput): Promise<Rule> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockRules.findIndex(r => r.uid === uid);
        
        if (index !== -1) {
          // Atualizar a regra existente
          const updatedRule = {
            ...mockRules[index],
            ...data,
            updatedAt: new Date().toISOString()
          };
          
          mockRules[index] = updatedRule;
          resolve(updatedRule);
        } else {
          reject({ 
            status: 404, 
            message: 'Regra não encontrada',
            data: null
          });
        }
      }, 500);
    });
  },
  
  /**
   * Remove uma regra
   */
  deleteRule: (uid: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockRules.findIndex(r => r.uid === uid);
        
        if (index !== -1) {
          // Remover a regra
          mockRules.splice(index, 1);
          resolve(true);
        } else {
          reject({ 
            status: 404, 
            message: 'Regra não encontrada',
            data: null
          });
        }
      }, 400);
    });
  }
};

// Export funções úteis para outros mocks
export const createMockApiResponse = <T>(data: T, success = true): ApiResponse<T> => ({
  item: data,
  success
});

export const createMockApiListResponse = <T>(items: T[], totalCount?: number): ApiResponse<T> => ({
  items,
  totalCount: totalCount || items.length,
  page: 1,
  pageSize: items.length,
  success: true
});
