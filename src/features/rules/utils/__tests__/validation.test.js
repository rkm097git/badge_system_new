/**
 * Testes para o módulo de validação de regras
 * 
 * Este arquivo implementa testes unitários para as funções de validação,
 * garantindo que as validações funcionam corretamente para diferentes cenários.
 */

// Importações
const {
  validateRequiredField,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateNonEmptyArray,
  validatePointsRule,
  validateDirectAssignmentRule,
  validateEventCountRule,
  validateRankingRule,
  validateContext,
  validateRuleForm,
  isFormValid
} = require('../validation');

// Dados de teste para formulário completo
const validFormData = {
  name: 'Regra de Teste',
  description: 'Descrição da regra de teste',
  type: 'points',
  status: 'active',
  context: {
    type: 'course',
    items: ['1']
  },
  points: {
    minPoints: 100,
    events: [
      { type: 'login', weight: 1 }
    ]
  },
  directAssignment: {
    assignerProfiles: ['professor'],
    assignmentLimit: 0
  },
  eventCount: {
    eventType: 'login',
    minOccurrences: 10,
    periodType: 'week',
    periodValue: 1,
    requiredStreak: 0
  },
  ranking: {
    rankingId: 'ranking-1',
    requiredPosition: 3
  }
};

describe('Funções de validação básicas', () => {
  describe('validateRequiredField', () => {
    it('deve retornar undefined para campos preenchidos', () => {
      expect(validateRequiredField('Texto', 'Campo')).toBeUndefined();
    });
    
    it('deve retornar erro para campos vazios', () => {
      expect(validateRequiredField('', 'Campo')).toBe('Campo é obrigatório');
    });
    
    it('deve retornar erro para campos com apenas espaços', () => {
      expect(validateRequiredField('   ', 'Campo')).toBe('Campo é obrigatório');
    });
    
    it('deve retornar erro para campos nulos ou indefinidos', () => {
      expect(validateRequiredField(null, 'Campo')).toBe('Campo é obrigatório');
      expect(validateRequiredField(undefined, 'Campo')).toBe('Campo é obrigatório');
    });
  });
  
  describe('validatePositiveNumber', () => {
    it('deve retornar undefined para números positivos', () => {
      expect(validatePositiveNumber(1, 'Número')).toBeUndefined();
      expect(validatePositiveNumber(10, 'Número')).toBeUndefined();
      expect(validatePositiveNumber(0.1, 'Número')).toBeUndefined();
    });
    
    it('deve retornar erro para zero', () => {
      expect(validatePositiveNumber(0, 'Número')).toBe('Número deve ser maior que zero');
    });
    
    it('deve retornar erro para números negativos', () => {
      expect(validatePositiveNumber(-1, 'Número')).toBe('Número deve ser maior que zero');
      expect(validatePositiveNumber(-0.1, 'Número')).toBe('Número deve ser maior que zero');
    });
  });
  
  describe('validateNonNegativeNumber', () => {
    it('deve retornar undefined para números positivos', () => {
      expect(validateNonNegativeNumber(1, 'Número')).toBeUndefined();
      expect(validateNonNegativeNumber(10, 'Número')).toBeUndefined();
    });
    
    it('deve retornar undefined para zero', () => {
      expect(validateNonNegativeNumber(0, 'Número')).toBeUndefined();
    });
    
    it('deve retornar erro para números negativos', () => {
      expect(validateNonNegativeNumber(-1, 'Número')).toBe('Número não pode ser negativo');
      expect(validateNonNegativeNumber(-0.1, 'Número')).toBe('Número não pode ser negativo');
    });
  });
  
  describe('validateNonEmptyArray', () => {
    it('deve retornar undefined para arrays com itens', () => {
      expect(validateNonEmptyArray([1], 'Lista')).toBeUndefined();
      expect(validateNonEmptyArray(['item'], 'Lista')).toBeUndefined();
      expect(validateNonEmptyArray([{}], 'Lista')).toBeUndefined();
    });
    
    it('deve retornar erro para arrays vazios', () => {
      expect(validateNonEmptyArray([], 'Lista')).toBe('Lista deve conter pelo menos um item');
    });
    
    it('deve retornar erro para null ou undefined', () => {
      expect(validateNonEmptyArray(null, 'Lista')).toBe('Lista deve conter pelo menos um item');
      expect(validateNonEmptyArray(undefined, 'Lista')).toBe('Lista deve conter pelo menos um item');
    });
  });
});

describe('Validações específicas por tipo de regra', () => {
  describe('validatePointsRule', () => {
    it('deve validar regra de pontuação válida', () => {
      const pointsData = {
        minPoints: 100,
        events: [
          { type: 'login', weight: 1 }
        ]
      };
      
      expect(validatePointsRule(pointsData)).toEqual({});
    });
    
    it('deve detectar pontuação mínima inválida', () => {
      const pointsData = {
        minPoints: 0,
        events: [
          { type: 'login', weight: 1 }
        ]
      };
      
      const errors = validatePointsRule(pointsData);
      expect(errors).toHaveProperty('pointsMinPoints');
      expect(errors.pointsMinPoints).toBe('Pontuação mínima deve ser maior que zero');
    });
    
    it('deve detectar eventos vazios', () => {
      const pointsData = {
        minPoints: 100,
        events: []
      };
      
      const errors = validatePointsRule(pointsData);
      expect(errors).toHaveProperty('pointsEvents');
      expect(errors.pointsEvents).toBe('Adicione pelo menos um tipo de evento');
    });
    
    it('deve detectar evento sem tipo', () => {
      const pointsData = {
        minPoints: 100,
        events: [
          { type: '', weight: 1 }
        ]
      };
      
      const errors = validatePointsRule(pointsData);
      expect(errors).toHaveProperty('points.events.0.type');
      expect(errors['points.events.0.type']).toBe('Tipo de evento é obrigatório');
    });
  });
  
  describe('validateDirectAssignmentRule', () => {
    it('deve validar regra de atribuição direta válida', () => {
      const directData = {
        assignerProfiles: ['professor'],
        assignmentLimit: 0
      };
      
      expect(validateDirectAssignmentRule(directData)).toEqual({});
    });
    
    it('deve detectar perfis vazios', () => {
      const directData = {
        assignerProfiles: [],
        assignmentLimit: 0
      };
      
      const errors = validateDirectAssignmentRule(directData);
      expect(errors).toHaveProperty('directAssignmentProfiles');
      expect(errors.directAssignmentProfiles).toBe('Selecione pelo menos um perfil de atribuidor');
    });
    
    it('deve permitir limite zero (ilimitado)', () => {
      const directData = {
        assignerProfiles: ['professor'],
        assignmentLimit: 0
      };
      
      expect(validateDirectAssignmentRule(directData)).toEqual({});
    });
    
    it('deve detectar limite negativo', () => {
      const directData = {
        assignerProfiles: ['professor'],
        assignmentLimit: -1
      };
      
      const errors = validateDirectAssignmentRule(directData);
      expect(errors).toHaveProperty('directAssignmentLimit');
      expect(errors.directAssignmentLimit).toBe('Limite de atribuições não pode ser negativo');
    });
  });
  
  describe('validateEventCountRule', () => {
    it('deve validar regra de contagem de eventos válida', () => {
      const eventsData = {
        eventType: 'login',
        minOccurrences: 10,
        periodType: 'week',
        periodValue: 1,
        requiredStreak: 0
      };
      
      expect(validateEventCountRule(eventsData)).toEqual({});
    });
    
    it('deve detectar tipo de evento vazio', () => {
      const eventsData = {
        eventType: '',
        minOccurrences: 10,
        periodType: 'week',
        periodValue: 1,
        requiredStreak: 0
      };
      
      const errors = validateEventCountRule(eventsData);
      expect(errors).toHaveProperty('eventCount');
      expect(errors.eventCount).toBe('Selecione um tipo de evento');
    });
    
    it('deve detectar número mínimo de ocorrências inválido', () => {
      const eventsData = {
        eventType: 'login',
        minOccurrences: 0,
        periodType: 'week',
        periodValue: 1,
        requiredStreak: 0
      };
      
      const errors = validateEventCountRule(eventsData);
      expect(errors).toHaveProperty('eventCount');
      expect(errors.eventCount).toBe('Número mínimo de ocorrências deve ser maior que zero');
    });
  });
  
  describe('validateRankingRule', () => {
    it('deve validar regra de ranking válida', () => {
      const rankingData = {
        rankingId: 'ranking-1',
        requiredPosition: 3
      };
      
      expect(validateRankingRule(rankingData)).toEqual({});
    });
    
    it('deve detectar ranking ID vazio', () => {
      const rankingData = {
        rankingId: '',
        requiredPosition: 3
      };
      
      const errors = validateRankingRule(rankingData);
      expect(errors).toHaveProperty('ranking');
      expect(errors.ranking).toBe('Selecione um ranking');
    });
    
    it('deve detectar posição inválida', () => {
      const rankingData = {
        rankingId: 'ranking-1',
        requiredPosition: 0
      };
      
      const errors = validateRankingRule(rankingData);
      expect(errors).toHaveProperty('ranking');
      expect(errors.ranking).toBe('Posição necessária deve ser maior que zero');
    });
  });
  
  describe('validateContext', () => {
    it('deve validar contexto válido', () => {
      const context = {
        type: 'course',
        items: ['1']
      };
      
      expect(validateContext(context)).toEqual({});
    });
    
    it('deve permitir tipo vazio com itens vazios', () => {
      const context = {
        type: '',
        items: []
      };
      
      expect(validateContext(context)).toEqual({});
    });
    
    it('deve detectar tipo preenchido com itens vazios', () => {
      const context = {
        type: 'course',
        items: []
      };
      
      const errors = validateContext(context);
      expect(errors).toHaveProperty('context');
      expect(errors).toHaveProperty('context.items');
      expect(errors.context).toBe('Selecione pelo menos um item do contexto');
    });
  });
});

describe('validateRuleForm', () => {
  it('deve aceitar formulário válido', () => {
    expect(validateRuleForm(validFormData)).toEqual({});
  });
  
  it('deve detectar campos básicos vazios', () => {
    const formData = {
      ...validFormData,
      name: '',
      description: '',
      type: ''
    };
    
    const errors = validateRuleForm(formData);
    expect(errors).toHaveProperty('name');
    expect(errors).toHaveProperty('description');
    expect(errors).toHaveProperty('type');
  });
  
  it('deve validar campos específicos para tipo points', () => {
    const formData = {
      ...validFormData,
      type: 'points',
      points: {
        minPoints: 0,
        events: []
      }
    };
    
    const errors = validateRuleForm(formData);
    expect(errors).toHaveProperty('pointsMinPoints');
    expect(errors).toHaveProperty('pointsEvents');
  });
  
  it('deve validar campos específicos para tipo direct', () => {
    const formData = {
      ...validFormData,
      type: 'direct',
      directAssignment: {
        assignerProfiles: [],
        assignmentLimit: -1
      }
    };
    
    const errors = validateRuleForm(formData);
    expect(errors).toHaveProperty('directAssignmentProfiles');
    expect(errors).toHaveProperty('directAssignmentLimit');
  });
  
  it('deve validar campos específicos para tipo events', () => {
    const formData = {
      ...validFormData,
      type: 'events',
      eventCount: {
        eventType: '',
        minOccurrences: 0,
        periodType: 'week',
        periodValue: 1,
        requiredStreak: 0
      }
    };
    
    const errors = validateRuleForm(formData);
    expect(errors).toHaveProperty('eventCount');
  });
  
  it('deve validar campos específicos para tipo ranking', () => {
    const formData = {
      ...validFormData,
      type: 'ranking',
      ranking: {
        rankingId: '',
        requiredPosition: 0
      }
    };
    
    const errors = validateRuleForm(formData);
    expect(errors).toHaveProperty('ranking');
  });
});

describe('isFormValid', () => {
  it('deve retornar true para formulário válido', () => {
    expect(isFormValid(validFormData)).toBe(true);
  });
  
  it('deve retornar false para formulário inválido', () => {
    const formData = {
      ...validFormData,
      name: ''
    };
    
    expect(isFormValid(formData)).toBe(false);
  });
});
