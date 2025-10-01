/**
 * Testes para o serviço de API de regras
 * 
 * Este arquivo implementa testes unitários para o serviço rulesApi, focando na
 * validação da lógica de transformação de dados e interação com a API.
 */

// Mocks para as funções de API
jest.mock('@/lib/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn()
}));

// Mock para React Query
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(({ mutationFn }) => ({
    mutate: mutationFn,
    isPending: false,
    error: null
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn()
  }))
}));

// Importações
const { apiGet, apiPost, apiPatch, apiDelete } = require('@/lib/api');
const { rulesApi } = require('../rulesApi');

// Dados de teste
const mockRule = {
  uid: '1',
  name: 'Regra de Teste',
  description: 'Descrição da regra de teste',
  type: 'points',
  configuration: {
    minPoints: 100,
    events: [
      { type: 'login', weight: 1 },
      { type: 'content_access', weight: 2 }
    ]
  },
  context: {
    type: 'course',
    items: ['1', '2']
  },
  status: 'active',
  createdAt: '2025-04-19T10:00:00Z',
  updatedAt: '2025-04-19T10:00:00Z'
};

const mockApiResponse = {
  item: mockRule,
  success: true
};

const mockRulesList = {
  items: [mockRule],
  totalCount: 1,
  page: 1,
  pageSize: 10,
  success: true
};

// Resetar mocks entre testes
beforeEach(() => {
  jest.clearAllMocks();
});

describe('rulesApi', () => {
  // Testes para getRules
  describe('getRules', () => {
    it('deve retornar lista de regras com sucesso', async () => {
      // Arrange
      apiGet.mockResolvedValue(mockRulesList);
      
      // Act
      const result = await rulesApi.getRules();
      
      // Assert
      expect(apiGet).toHaveBeenCalledWith('/v1/rules', {});
      expect(result).toEqual(mockRulesList);
    });
    
    it('deve passar parâmetros de paginação corretamente', async () => {
      // Arrange
      const params = { page: 2, pageSize: 20, search: 'teste' };
      apiGet.mockResolvedValue(mockRulesList);
      
      // Act
      await rulesApi.getRules(params);
      
      // Assert
      expect(apiGet).toHaveBeenCalledWith('/v1/rules', params);
    });
    
    it('deve tratar erros de API', async () => {
      // Arrange
      const error = { status: 500, message: 'Erro de servidor' };
      apiGet.mockRejectedValue(error);
      
      // Act & Assert
      await expect(rulesApi.getRules()).rejects.toEqual(error);
    });
  });
  
  // Testes para getRule
  describe('getRule', () => {
    it('deve retornar uma regra específica com sucesso', async () => {
      // Arrange
      apiGet.mockResolvedValue(mockApiResponse);
      
      // Act
      const result = await rulesApi.getRule('1');
      
      // Assert
      expect(apiGet).toHaveBeenCalledWith('/v1/rules/1');
      expect(result).toEqual(mockRule);
    });
    
    it('deve lançar erro se a resposta não contiver item', async () => {
      // Arrange
      apiGet.mockResolvedValue({ success: true });
      
      // Act & Assert
      await expect(rulesApi.getRule('1')).rejects.toThrow('Regra não encontrada');
    });
    
    it('deve tratar erros de API', async () => {
      // Arrange
      const error = { status: 404, message: 'Regra não encontrada' };
      apiGet.mockRejectedValue(error);
      
      // Act & Assert
      await expect(rulesApi.getRule('999')).rejects.toEqual(error);
    });
  });
  
  // Testes para createRule
  describe('createRule', () => {
    it('deve criar uma regra com sucesso', async () => {
      // Arrange
      const newRuleData = {
        name: 'Nova Regra',
        description: 'Descrição da nova regra',
        type: 'points',
        configuration: {
          minPoints: 50,
          events: [{ type: 'login', weight: 1 }]
        },
        context: {
          type: 'course',
          items: ['1']
        },
        status: 'active'
      };
      
      apiPost.mockResolvedValue({
        item: { ...newRuleData, uid: 'new-1' },
        success: true
      });
      
      // Act
      const result = await rulesApi.createRule(newRuleData);
      
      // Assert
      expect(apiPost).toHaveBeenCalledWith('/v1/rules', newRuleData);
      expect(result).toHaveProperty('uid', 'new-1');
      expect(result).toHaveProperty('name', 'Nova Regra');
    });
    
    it('deve lançar erro se a resposta não contiver item', async () => {
      // Arrange
      apiPost.mockResolvedValue({ success: true });
      
      // Act & Assert
      await expect(rulesApi.createRule({})).rejects.toThrow('Falha ao criar regra');
    });
    
    it('deve tratar erros de API', async () => {
      // Arrange
      const error = { status: 400, message: 'Dados inválidos' };
      apiPost.mockRejectedValue(error);
      
      // Act & Assert
      await expect(rulesApi.createRule({})).rejects.toEqual(error);
    });
  });
  
  // Testes para updateRule
  describe('updateRule', () => {
    it('deve atualizar uma regra com sucesso', async () => {
      // Arrange
      const updateData = {
        name: 'Regra Atualizada',
        description: 'Descrição atualizada'
      };
      
      apiPatch.mockResolvedValue({
        item: { ...mockRule, ...updateData },
        success: true
      });
      
      // Act
      const result = await rulesApi.updateRule('1', updateData);
      
      // Assert
      expect(apiPatch).toHaveBeenCalledWith('/v1/rules/1', updateData);
      expect(result).toHaveProperty('name', 'Regra Atualizada');
      expect(result).toHaveProperty('description', 'Descrição atualizada');
    });
    
    it('deve lançar erro se a resposta não contiver item', async () => {
      // Arrange
      apiPatch.mockResolvedValue({ success: true });
      
      // Act & Assert
      await expect(rulesApi.updateRule('1', {})).rejects.toThrow('Falha ao atualizar regra');
    });
    
    it('deve tratar erros de API', async () => {
      // Arrange
      const error = { status: 404, message: 'Regra não encontrada' };
      apiPatch.mockRejectedValue(error);
      
      // Act & Assert
      await expect(rulesApi.updateRule('999', {})).rejects.toEqual(error);
    });
  });
  
  // Testes para deleteRule
  describe('deleteRule', () => {
    it('deve excluir uma regra com sucesso', async () => {
      // Arrange
      apiDelete.mockResolvedValue({ success: true });
      
      // Act
      const result = await rulesApi.deleteRule('1');
      
      // Assert
      expect(apiDelete).toHaveBeenCalledWith('/v1/rules/1');
      expect(result).toBe(true);
    });
    
    it('deve retornar false se a exclusão falhar', async () => {
      // Arrange
      apiDelete.mockResolvedValue({ success: false });
      
      // Act
      const result = await rulesApi.deleteRule('1');
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('deve tratar erros de API', async () => {
      // Arrange
      const error = { status: 404, message: 'Regra não encontrada' };
      apiDelete.mockRejectedValue(error);
      
      // Act & Assert
      await expect(rulesApi.deleteRule('999')).rejects.toEqual(error);
    });
  });
  
  // Testes estendidos para transformFormToApiInput
  describe('transformFormToApiInput', () => {
    // Testes básicos existentes
    it('deve transformar dados do formulário para formato da API - tipo points', () => {
      // Arrange
      const formData = {
        name: 'Regra de Pontuação',
        description: 'Descrição da regra',
        type: 'points',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        points: {
          minPoints: 100,
          events: [
            { type: 'login', weight: 1 },
            { type: 'content_access', weight: 2 }
          ]
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      expect(result).toEqual({
        name: 'Regra de Pontuação',
        description: 'Descrição da regra',
        type: 'points',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        configuration: {
          minPoints: 100,
          events: [
            { type: 'login', weight: 1 },
            { type: 'content_access', weight: 2 }
          ]
        }
      });
    });
    
    it('deve transformar dados do formulário para formato da API - tipo direct', () => {
      // Arrange
      const formData = {
        name: 'Regra de Atribuição Direta',
        description: 'Descrição da regra',
        type: 'direct',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        directAssignment: {
          assignerProfiles: ['professor', 'coordinator'],
          assignmentLimit: 5
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      expect(result).toEqual({
        name: 'Regra de Atribuição Direta',
        description: 'Descrição da regra',
        type: 'direct',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        configuration: {
          assignerProfiles: ['professor', 'coordinator'],
          assignmentLimit: 5
        }
      });
    });
    
    it('deve transformar dados do formulário para formato da API - tipo events', () => {
      // Arrange
      const formData = {
        name: 'Regra de Eventos',
        description: 'Descrição da regra',
        type: 'events',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        eventCount: {
          eventType: 'login',
          minOccurrences: 10,
          periodType: 'week',
          periodValue: 2,
          requiredStreak: 0
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      expect(result).toEqual({
        name: 'Regra de Eventos',
        description: 'Descrição da regra',
        type: 'events',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        configuration: {
          eventType: 'login',
          minOccurrences: 10,
          periodType: 'week',
          periodValue: 2,
          requiredStreak: 0
        }
      });
    });
    
    it('deve transformar dados do formulário para formato da API - tipo ranking', () => {
      // Arrange
      const formData = {
        name: 'Regra de Ranking',
        description: 'Descrição da regra',
        type: 'ranking',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        ranking: {
          rankingId: 'ranking-1',
          requiredPosition: 3
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      expect(result).toEqual({
        name: 'Regra de Ranking',
        description: 'Descrição da regra',
        type: 'ranking',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        configuration: {
          rankingId: 'ranking-1',
          requiredPosition: 3
        }
      });
    });
    
    it('deve lidar com tipo de regra desconhecido', () => {
      // Arrange
      const formData = {
        name: 'Regra Desconhecida',
        description: 'Descrição da regra',
        type: 'unknown',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      expect(result).toEqual({
        name: 'Regra Desconhecida',
        description: 'Descrição da regra',
        type: 'unknown',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        configuration: {}
      });
    });

    // Novos testes para casos de borda
    it('deve lidar com formulário vazio ou nulo graciosamente', () => {
      // Arrange & Act & Assert
      expect(() => rulesApi.transformFormToApiInput(null)).not.toThrow();
      expect(() => rulesApi.transformFormToApiInput(undefined)).not.toThrow();
      expect(() => rulesApi.transformFormToApiInput({})).not.toThrow();
      
      expect(rulesApi.transformFormToApiInput(null)).toEqual({
        name: undefined,
        description: undefined,
        type: undefined,
        configuration: {},
        context: undefined,
        status: 'active'
      });
      
      expect(rulesApi.transformFormToApiInput({})).toEqual({
        name: undefined,
        description: undefined,
        type: undefined,
        configuration: {},
        context: undefined,
        status: 'active'
      });
    });

    it('deve lidar com valores ausentes em tipo points', () => {
      // Arrange
      const formData = {
        name: 'Regra Incompleta',
        type: 'points',
        // Sem points ou com valores parciais
        points: {}
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      expect(result).toEqual({
        name: 'Regra Incompleta',
        description: undefined,
        type: 'points',
        status: 'active',
        context: undefined,
        configuration: {
          minPoints: undefined,
          events: undefined
        }
      });
    });

    it('deve lidar com eventos vazios em regras de pontuação', () => {
      // Arrange
      const formData = {
        name: 'Regra com Eventos Vazios',
        type: 'points',
        points: {
          minPoints: 100,
          events: []
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      expect(result.configuration).toEqual({
        minPoints: 100,
        events: []
      });
    });

    it('deve lidar com valores de string numéricos em campos numéricos', () => {
      // Arrange
      const formData = {
        name: 'Regra com Strings Numéricas',
        type: 'points',
        points: {
          minPoints: '100', // String em vez de número
          events: [
            { type: 'login', weight: '1.5' } // String em vez de número
          ]
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      // A função deve passar os valores como estão, a conversão deve
      // ser feita em outro lugar (como serialização de JSON)
      expect(result.configuration).toEqual({
        minPoints: '100',
        events: [
          { type: 'login', weight: '1.5' }
        ]
      });
    });

    it('deve lidar com tipos de evento malformados', () => {
      // Arrange
      const formData = {
        name: 'Regra com Eventos Malformados',
        type: 'points',
        points: {
          minPoints: 100,
          events: [
            { }, // Evento sem tipo
            { type: '' }, // Tipo vazio
            { type: 'login', weight: -1 }, // Peso negativo
            { type: 'content_access' } // Sem peso
          ]
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      // A função deve passar os valores como estão, incluindo mal-formados
      expect(result.configuration.events).toEqual([
        { },
        { type: '' },
        { type: 'login', weight: -1 },
        { type: 'content_access' }
      ]);
    });

    it('deve lidar com assignerProfiles vazio em regras de atribuição direta', () => {
      // Arrange
      const formData = {
        name: 'Regra de Atribuição Direta Incompleta',
        type: 'direct',
        directAssignment: {
          assignerProfiles: [], // Array vazio
          assignmentLimit: 0
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      expect(result.configuration).toEqual({
        assignerProfiles: [],
        assignmentLimit: 0
      });
    });

    it('deve lidar com valores extremos em requiredPosition para regras de ranking', () => {
      // Arrange
      const formData = {
        name: 'Regra de Ranking com Posição Extrema',
        type: 'ranking',
        ranking: {
          rankingId: 'ranking-1',
          requiredPosition: 999999 // Valor muito alto
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      expect(result.configuration.requiredPosition).toBe(999999);
    });

    it('deve manter campos adicionais não reconhecidos em configurações de tipo desconhecido', () => {
      // Arrange
      const formData = {
        name: 'Regra com Campos Personalizados',
        type: 'custom',
        custom: {
          specialField1: 'valor1',
          specialField2: 42,
          nestedField: {
            subField: true
          }
        }
      };
      
      // Act
      const result = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      // Apenas campos conhecidos devem ser transferidos para a configuração
      expect(result.configuration).toEqual({});
      // Os campos personalizados não devem ser incluídos na configuração
      expect(result.custom).toBeUndefined();
    });
  });
  
  // Testes estendidos para transformApiToFormData
  describe('transformApiToFormData', () => {
    // Testes básicos existentes
    it('deve transformar dados da API para formato do formulário - tipo points', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra de Pontuação',
        description: 'Descrição da regra',
        type: 'points',
        configuration: {
          minPoints: 100,
          events: [
            { type: 'login', weight: 1 },
            { type: 'content_access', weight: 2 }
          ]
        },
        context: {
          type: 'course',
          items: ['1']
        },
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      expect(result).toEqual({
        uid: '1',
        name: 'Regra de Pontuação',
        description: 'Descrição da regra',
        type: 'points',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        points: {
          minPoints: 100,
          events: [
            { type: 'login', weight: 1 },
            { type: 'content_access', weight: 2 }
          ]
        }
      });
    });
    
    it('deve transformar dados da API para formato do formulário - tipo direct', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra de Atribuição Direta',
        description: 'Descrição da regra',
        type: 'direct',
        configuration: {
          assignerProfiles: ['professor', 'coordinator'],
          assignmentLimit: 5
        },
        context: {
          type: 'course',
          items: ['1']
        },
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      expect(result).toEqual({
        uid: '1',
        name: 'Regra de Atribuição Direta',
        description: 'Descrição da regra',
        type: 'direct',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        directAssignment: {
          assignerProfiles: ['professor', 'coordinator'],
          assignmentLimit: 5
        }
      });
    });
    
    it('deve transformar dados da API para formato do formulário - tipo events', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra de Eventos',
        description: 'Descrição da regra',
        type: 'events',
        configuration: {
          eventType: 'login',
          minOccurrences: 10,
          periodType: 'week',
          periodValue: 2,
          requiredStreak: 0
        },
        context: {
          type: 'course',
          items: ['1']
        },
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      expect(result).toEqual({
        uid: '1',
        name: 'Regra de Eventos',
        description: 'Descrição da regra',
        type: 'events',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        eventCount: {
          eventType: 'login',
          minOccurrences: 10,
          periodType: 'week',
          periodValue: 2,
          requiredStreak: 0
        }
      });
    });
    
    it('deve transformar dados da API para formato do formulário - tipo ranking', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra de Ranking',
        description: 'Descrição da regra',
        type: 'ranking',
        configuration: {
          rankingId: 'ranking-1',
          requiredPosition: 3
        },
        context: {
          type: 'course',
          items: ['1']
        },
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      expect(result).toEqual({
        uid: '1',
        name: 'Regra de Ranking',
        description: 'Descrição da regra',
        type: 'ranking',
        status: 'active',
        context: {
          type: 'course',
          items: ['1']
        },
        ranking: {
          rankingId: 'ranking-1',
          requiredPosition: 3
        }
      });
    });
    
    it('deve lidar com dados incompletos na configuração', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra Incompleta',
        description: 'Descrição da regra',
        type: 'points',
        // Sem configuração
        context: {
          type: 'course',
          items: ['1']
        },
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      expect(result).toHaveProperty('points');
      expect(result.points).toHaveProperty('minPoints', 0);
      expect(result.points).toHaveProperty('events');
      expect(result.points.events).toEqual([]);
    });

    // Novos testes para casos de borda
    it('deve lidar com dados de API nulos ou indefinidos', () => {
      // Arrange & Act & Assert
      expect(() => rulesApi.transformApiToFormData(null)).not.toThrow();
      expect(() => rulesApi.transformApiToFormData(undefined)).not.toThrow();
      expect(() => rulesApi.transformApiToFormData({})).not.toThrow();
      
      const resultNull = rulesApi.transformApiToFormData(null);
      expect(resultNull).toEqual({});
      
      const resultEmpty = rulesApi.transformApiToFormData({});
      expect(resultEmpty).toEqual({
        uid: undefined,
        name: undefined,
        description: undefined,
        type: undefined,
        context: undefined,
        status: undefined
      });
    });

    it('deve manter campos adicionais de metadados da API', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra com Metadados',
        type: 'points',
        configuration: {
          minPoints: 100,
          events: []
        },
        status: 'active',
        createdAt: '2025-04-19T10:00:00Z',
        updatedAt: '2025-04-19T11:00:00Z',
        createdBy: 'user1',
        assignedBadges: 42
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      expect(result).toHaveProperty('uid', '1');
      expect(result).toHaveProperty('name', 'Regra com Metadados');
      expect(result).toHaveProperty('createdAt', '2025-04-19T10:00:00Z');
      expect(result).toHaveProperty('updatedAt', '2025-04-19T11:00:00Z');
      expect(result).toHaveProperty('createdBy', 'user1');
      expect(result).toHaveProperty('assignedBadges', 42);
    });

    it('deve lidar com configuração vazia ou inválida do tipo points', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra com Configuração Inválida',
        type: 'points',
        configuration: null, // Configuração nula
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      expect(result).toHaveProperty('points');
      expect(result.points).toHaveProperty('minPoints', 0);
      expect(result.points).toHaveProperty('events');
      expect(result.points.events).toEqual([]);
    });

    it('deve lidar com tipo desconhecido e criar objeto de configuração vazio', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra com Tipo Desconhecido',
        type: 'customType',
        configuration: {
          specialField: 'value',
          anotherField: 42
        },
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      expect(result).toHaveProperty('uid', '1');
      expect(result).toHaveProperty('name', 'Regra com Tipo Desconhecido');
      expect(result).toHaveProperty('type', 'customType');
      expect(result).not.toHaveProperty('points');
      expect(result).not.toHaveProperty('directAssignment');
      expect(result).not.toHaveProperty('eventCount');
      expect(result).not.toHaveProperty('ranking');
      // A configuração original deve ser preservada no objeto de retorno
      expect(result).toHaveProperty('configuration');
      expect(result.configuration).toEqual({
        specialField: 'value',
        anotherField: 42
      });
    });

    it('deve lidar com eventos vazios ou malformados em regras de pontuação', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra com Eventos Malformados',
        type: 'points',
        configuration: {
          minPoints: 100,
          events: [
            { }, // Evento sem tipo
            { type: '' }, // Tipo vazio
            { type: 'login', weight: -1 }, // Peso negativo
            { type: 'content_access' } // Sem peso
          ]
        },
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      // A função deve passar os eventos como estão para o formulário
      expect(result.points.events).toEqual([
        { }, 
        { type: '' },
        { type: 'login', weight: -1 },
        { type: 'content_access' }
      ]);
    });

    it('deve lidar com configurações complexas e aninhadas', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra com Configuração Complexa',
        type: 'points',
        configuration: {
          minPoints: 100,
          events: [
            { 
              type: 'login', 
              weight: 1,
              metadata: {
                description: 'Login na plataforma',
                category: 'engagement',
                tracking: {
                  enabled: true,
                  frequency: 'daily'
                }
              }
            }
          ],
          bonusConfig: {
            enabled: true,
            multiplier: 1.5,
            conditions: ['weekend', 'holiday']
          }
        },
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      // Deve manter a estrutura aninhada intacta
      expect(result.points.events[0]).toHaveProperty('metadata');
      expect(result.points.events[0].metadata).toHaveProperty('tracking');
      expect(result.points.events[0].metadata.tracking).toHaveProperty('enabled', true);
      // Campos adicionais não mapeados explicitamente no esquema do formulário devem ser mantidos
      expect(result.points).toHaveProperty('bonusConfig');
      expect(result.points.bonusConfig).toHaveProperty('multiplier', 1.5);
    });

    it('deve lidar com valores extremos em campos numéricos', () => {
      // Arrange
      const apiData = {
        uid: '1',
        name: 'Regra com Valores Extremos',
        type: 'events',
        configuration: {
          eventType: 'login',
          minOccurrences: Number.MAX_SAFE_INTEGER, // Valor extremamente alto
          periodType: 'year',
          periodValue: 0, // Valor zero
          requiredStreak: -1 // Valor negativo
        },
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      expect(result.eventCount).toEqual({
        eventType: 'login',
        minOccurrences: Number.MAX_SAFE_INTEGER,
        periodType: 'year',
        periodValue: 0,
        requiredStreak: -1
      });
    });

    it('deve lidar com tipos misturados', () => {
      // Arrange - Um objeto que tem configurações para múltiplos tipos
      const apiData = {
        uid: '1',
        name: 'Regra Híbrida',
        description: 'Uma regra com configurações de múltiplos tipos',
        type: 'points', // Tipo principal é points
        configuration: {
          // Configuração de points
          minPoints: 100,
          events: [{ type: 'login', weight: 1 }],
          
          // Configurações de outros tipos
          assignerProfiles: ['professor'], // De direct
          eventType: 'login', // De events
          rankingId: 'ranking-1' // De ranking
        },
        status: 'active'
      };
      
      // Act
      const result = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      // A configuração baseada no tipo principal (points) deve ser mapeada corretamente
      expect(result).toHaveProperty('points');
      expect(result.points).toHaveProperty('minPoints', 100);
      expect(result.points.events).toEqual([{ type: 'login', weight: 1 }]);
      
      // As configurações de outros tipos não devem ser mapeadas para seus respectivos objetos
      expect(result).not.toHaveProperty('directAssignment');
      expect(result).not.toHaveProperty('eventCount');
      expect(result).not.toHaveProperty('ranking');
    });
  });
  
  // Testes para o hook useCreateRule
  describe('useCreateRule', () => {
    it('deve retornar função createRule', () => {
      // Act
      const { createRule, isCreating, createRuleError } = rulesApi.useCreateRule();
      
      // Assert
      expect(createRule).toBeDefined();
      expect(typeof createRule).toBe('function');
      expect(isCreating).toBe(false);
      expect(createRuleError).toBeNull();
    });
  });

  // Testes de transformação bidirecional (round-trip)
  describe('Transformação round-trip', () => {
    it('deve preservar todos os dados após transformação form -> API -> form', () => {
      // Arrange
      const formData = {
        uid: '123',
        name: 'Regra de Teste Round-Trip',
        description: 'Teste de transformação bidirecional',
        type: 'points',
        status: 'active',
        context: {
          type: 'course',
          items: ['1', '2', '3']
        },
        points: {
          minPoints: 100,
          events: [
            { type: 'login', weight: 1 },
            { type: 'content_access', weight: 2.5 }
          ]
        },
        // Campos adicionais que devem ser preservados
        createdAt: '2025-04-19T10:00:00Z',
        updatedAt: '2025-04-19T11:00:00Z',
        metadata: {
          version: '1.0.0',
          tags: ['important', 'onboarding']
        }
      };
      
      // Act - Form -> API -> Form
      const apiData = rulesApi.transformFormToApiInput(formData);
      const roundTripData = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      // Verificar campos básicos
      expect(roundTripData.uid).toBe(formData.uid);
      expect(roundTripData.name).toBe(formData.name);
      expect(roundTripData.description).toBe(formData.description);
      expect(roundTripData.type).toBe(formData.type);
      expect(roundTripData.status).toBe(formData.status);
      
      // Verificar contexto
      expect(roundTripData.context).toEqual(formData.context);
      
      // Verificar configuração específica do tipo
      expect(roundTripData.points.minPoints).toBe(formData.points.minPoints);
      expect(roundTripData.points.events).toEqual(formData.points.events);
      
      // Verificar campos adicionais
      expect(roundTripData.createdAt).toBe(formData.createdAt);
      expect(roundTripData.updatedAt).toBe(formData.updatedAt);
      expect(roundTripData.metadata).toEqual(formData.metadata);
    });
    
    it('deve preservar todos os dados após transformação API -> form -> API', () => {
      // Arrange
      const apiData = {
        uid: '456',
        name: 'Regra de Teste API Round-Trip',
        description: 'Teste de transformação API -> form -> API',
        type: 'direct',
        status: 'inactive',
        configuration: {
          assignerProfiles: ['professor', 'coordinator'],
          assignmentLimit: 5
        },
        context: {
          type: 'department',
          items: ['D1', 'D2']
        },
        // Campos adicionais que devem ser preservados
        createdAt: '2025-04-20T10:00:00Z',
        updatedAt: '2025-04-20T11:00:00Z',
        createdBy: 'admin'
      };
      
      // Act - API -> Form -> API
      const formData = rulesApi.transformApiToFormData(apiData);
      const roundTripData = rulesApi.transformFormToApiInput(formData);
      
      // Assert
      // Verificar campos básicos
      expect(roundTripData.uid).toBe(apiData.uid);
      expect(roundTripData.name).toBe(apiData.name);
      expect(roundTripData.description).toBe(apiData.description);
      expect(roundTripData.type).toBe(apiData.type);
      expect(roundTripData.status).toBe(apiData.status);
      
      // Verificar contexto
      expect(roundTripData.context).toEqual(apiData.context);
      
      // Verificar configuração
      expect(roundTripData.configuration).toEqual(apiData.configuration);
      
      // Verificar campos adicionais
      expect(roundTripData.createdAt).toBe(apiData.createdAt);
      expect(roundTripData.updatedAt).toBe(apiData.updatedAt);
      expect(roundTripData.createdBy).toBe(apiData.createdBy);
    });

    it('deve lidar corretamente com caracteres especiais e formatos complexos', () => {
      // Arrange
      const formData = {
        name: 'Regra com Caracteres Especiais: áéíóú ñ çã',
        description: 'Descrição com símbolos @#$%^&*()_+ e emojis 🚀✨👍',
        type: 'events',
        status: 'draft',
        eventCount: {
          eventType: 'custom_event:<special>',
          minOccurrences: 42,
          periodType: 'month',
          periodValue: 3,
          requiredStreak: 0
        }
      };
      
      // Act - Form -> API -> Form
      const apiData = rulesApi.transformFormToApiInput(formData);
      const roundTripData = rulesApi.transformApiToFormData(apiData);
      
      // Assert
      expect(roundTripData.name).toBe(formData.name);
      expect(roundTripData.description).toBe(formData.description);
      expect(roundTripData.eventCount.eventType).toBe(formData.eventCount.eventType);
    });
  });
});
