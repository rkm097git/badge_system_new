/**
 * Mock de API para testes
 * Simula respostas da API para desenvolvimento e testes
 */
import { Rule, ApiResponse, PaginationParams } from '@/features/rules/types';

// Dados simulados para regras
const mockRules: Rule[] = [
  {
    uid: '1',
    name: 'Regra de Pontuação',
    description: 'Atribui badge com base em pontos acumulados',
    type: 'points',
    configuration: {
      minPoints: 100,
      events: [
        { type: 'completion', weight: 10 },
        { type: 'participation', weight: 5 }
      ]
    },
    context: {
      type: 'course',
      items: ['course-123', 'course-456']
    },
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-04-08T14:30:00Z',
    status: 'active'
  },
  {
    uid: '2',
    name: 'Regra de Atribuição Direta',
    description: 'Permite atribuição manual por tutores',
    type: 'direct',
    configuration: {
      assignerProfiles: ['tutor', 'admin'],
      assignmentLimit: 10
    },
    context: {
      type: 'department',
      items: ['dep-789']
    },
    createdAt: '2025-04-02T09:15:00Z',
    updatedAt: '2025-04-07T11:20:00Z',
    status: 'active'
  },
  {
    uid: '3',
    name: 'Regra de Eventos',
    description: 'Atribui por frequência de eventos',
    type: 'events',
    configuration: {
      eventType: 'login',
      minOccurrences: 30,
      periodType: 'month',
      periodValue: 1,
      requiredStreak: 5
    },
    context: {
      type: 'campus',
      items: ['campus-1']
    },
    createdAt: '2025-04-03T14:20:00Z',
    updatedAt: '2025-04-06T09:45:00Z',
    status: 'draft'
  }
];

// Função utilitária para filtrar e paginar regras
const filterAndPaginateRules = (rules: Rule[], params: PaginationParams): ApiResponse<Rule> => {
  let filtered = [...rules];
  
  // Aplicar filtro de busca
  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(rule => 
      rule.name.toLowerCase().includes(search) || 
      rule.description.toLowerCase().includes(search)
    );
  }
  
  // Aplicar filtros adicionais
  if (params.filter) {
    if (params.filter.type) {
      filtered = filtered.filter(rule => rule.type === params.filter.type);
    }
    if (params.filter.status) {
      filtered = filtered.filter(rule => rule.status === params.filter.status);
    }
    if (params.filter.contextType) {
      filtered = filtered.filter(rule => rule.context.type === params.filter.contextType);
    }
  }
  
  // Ordenação
  if (params.sortBy) {
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
    filtered.sort((a: any, b: any) => {
      if (a[params.sortBy] < b[params.sortBy]) return -1 * sortOrder;
      if (a[params.sortBy] > b[params.sortBy]) return 1 * sortOrder;
      return 0;
    });
  }
  
  // Paginação
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRules = filtered.slice(startIndex, endIndex);
  
  return {
    items: paginatedRules,
    totalCount: filtered.length,
    page,
    pageSize,
    success: true
  };
};

// Função para simular atrasos de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock do serviço de API de regras
export const mockRulesApi = {
  // Simula a obtenção de regras
  async getRules(params: PaginationParams = {}): Promise<ApiResponse<Rule>> {
    await delay(500); // Simula latência de rede
    return filterAndPaginateRules(mockRules, params);
  },
  
  // Simula a obtenção de uma regra específica
  async getRule(uid: string): Promise<Rule> {
    await delay(300);
    const rule = mockRules.find(r => r.uid === uid);
    if (!rule) {
      throw new Error('Regra não encontrada');
    }
    return rule;
  },
  
  // Simula a criação de uma regra
  async createRule(data: any): Promise<Rule> {
    await delay(700);
    const newRule: Rule = {
      uid: Date.now().toString(), // Gera ID único
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockRules.push(newRule);
    return newRule;
  },
  
  // Simula a atualização de uma regra
  async updateRule(uid: string, data: any): Promise<Rule> {
    await delay(500);
    const index = mockRules.findIndex(r => r.uid === uid);
    if (index === -1) {
      throw new Error('Regra não encontrada');
    }
    
    const updatedRule = {
      ...mockRules[index],
      ...data,
      uid,
      updatedAt: new Date().toISOString()
    };
    
    mockRules[index] = updatedRule;
    return updatedRule;
  },
  
  // Simula a exclusão de uma regra
  async deleteRule(uid: string): Promise<boolean> {
    await delay(400);
    const index = mockRules.findIndex(r => r.uid === uid);
    if (index === -1) {
      throw new Error('Regra não encontrada');
    }
    
    mockRules.splice(index, 1);
    return true;
  },
  
  // Funções de transformação (mesmas da implementação real)
  transformFormToApiInput(formData: any) {
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

    return {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      configuration,
      context: formData.context,
      status: formData.status || 'active'
    };
  },

  transformApiToFormData(apiData: Rule) {
    const formData: any = {
      uid: apiData.uid,
      name: apiData.name,
      description: apiData.description,
      type: apiData.type,
      context: apiData.context,
      status: apiData.status
    };

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
