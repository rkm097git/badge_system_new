/**
 * Tests for validation utility functions
 * 
 * This file implements unit tests for the validation utility functions used in rule forms
 * and other components. It focuses on testing the validation logic without depending on
 * React components.
 */

// Import validation utilities
const { validateRuleName, validateRuleDescription, validateRuleType, 
        validateContextType, validateContextItems, validateMinPoints,
        validatePointsEvents, validateAssignerProfiles, validateEventType,
        validateRankingId } = require('../validationUtils');

describe('Validation Utilities', () => {
  // Tests for validateRuleName
  describe('validateRuleName', () => {
    test('returns error message for empty name', () => {
      expect(validateRuleName('')).toBe('Nome da regra é obrigatório');
    });

    test('returns error message for name with less than 3 characters', () => {
      expect(validateRuleName('AB')).toBe('Nome deve ter pelo menos 3 caracteres');
    });

    test('returns undefined for valid name', () => {
      expect(validateRuleName('Regra de Pontuação')).toBeUndefined();
    });
  });

  // Tests for validateRuleDescription
  describe('validateRuleDescription', () => {
    test('returns error message for empty description', () => {
      expect(validateRuleDescription('')).toBe('Descrição da regra é obrigatória');
    });

    test('returns error message for short description', () => {
      expect(validateRuleDescription('Curta')).toBe('Descrição deve ter pelo menos 10 caracteres');
    });

    test('returns undefined for valid description', () => {
      expect(validateRuleDescription('Esta é uma descrição válida para a regra.')).toBeUndefined();
    });
  });

  // Tests for validateRuleType
  describe('validateRuleType', () => {
    test('returns error message for empty type', () => {
      expect(validateRuleType('')).toBe('Tipo de regra é obrigatório');
    });

    test('returns error message for invalid type', () => {
      expect(validateRuleType('invalid_type')).toBe('Tipo de regra inválido');
    });

    test('returns undefined for valid types', () => {
      expect(validateRuleType('points')).toBeUndefined();
      expect(validateRuleType('direct')).toBeUndefined();
      expect(validateRuleType('events')).toBeUndefined();
      expect(validateRuleType('ranking')).toBeUndefined();
    });
  });

  // Tests for validateContextType
  describe('validateContextType', () => {
    test('returns error message for empty context type', () => {
      expect(validateContextType('')).toBe('Contexto de aplicação é obrigatório');
    });

    test('returns error message for invalid context type', () => {
      expect(validateContextType('invalid_context')).toBe('Contexto de aplicação inválido');
    });

    test('returns undefined for valid context types', () => {
      expect(validateContextType('course')).toBeUndefined();
      expect(validateContextType('department')).toBeUndefined();
      expect(validateContextType('campus')).toBeUndefined();
    });
  });

  // Tests for validateContextItems
  describe('validateContextItems', () => {
    test('returns error message for empty items', () => {
      expect(validateContextItems([])).toBe('Selecione pelo menos um item');
    });

    test('returns undefined for valid items list', () => {
      expect(validateContextItems(['1', '2'])).toBeUndefined();
    });
  });

  // Tests for validateMinPoints
  describe('validateMinPoints', () => {
    test('returns error message for negative points', () => {
      expect(validateMinPoints(-10)).toBe('Pontuação mínima deve ser maior que zero');
    });

    test('returns error message for zero points', () => {
      expect(validateMinPoints(0)).toBe('Pontuação mínima deve ser maior que zero');
    });

    test('returns undefined for valid points', () => {
      expect(validateMinPoints(100)).toBeUndefined();
    });
  });

  // Tests for validatePointsEvents
  describe('validatePointsEvents', () => {
    test('returns error message for empty events array', () => {
      expect(validatePointsEvents([])).toBe('Adicione pelo menos um tipo de evento');
    });

    test('returns error message for events with empty type', () => {
      expect(validatePointsEvents([
        { type: '', weight: 1 },
        { type: 'login', weight: 2 }
      ])).toBe('Todos os eventos devem ter um tipo');
    });

    test('returns error message for events with invalid weight', () => {
      expect(validatePointsEvents([
        { type: 'login', weight: 0 },
        { type: 'content_access', weight: 1 }
      ])).toBe('Todos os pesos devem ser maiores que zero');
    });

    test('returns undefined for valid events', () => {
      expect(validatePointsEvents([
        { type: 'login', weight: 1 },
        { type: 'content_access', weight: 2 }
      ])).toBeUndefined();
    });
  });

  // Tests for validateAssignerProfiles
  describe('validateAssignerProfiles', () => {
    test('returns error message for empty profiles array', () => {
      expect(validateAssignerProfiles([])).toBe('Selecione pelo menos um perfil');
    });

    test('returns undefined for valid profiles', () => {
      expect(validateAssignerProfiles(['professor', 'coordinator'])).toBeUndefined();
    });
  });

  // Tests for validateEventType
  describe('validateEventType', () => {
    test('returns error message for empty event type', () => {
      expect(validateEventType('')).toBe('Tipo de evento é obrigatório');
    });

    test('returns undefined for valid event type', () => {
      expect(validateEventType('login')).toBeUndefined();
    });
  });

  // Tests for validateRankingId
  describe('validateRankingId', () => {
    test('returns error message for empty ranking ID', () => {
      expect(validateRankingId('')).toBe('Selecione um ranking');
    });

    test('returns undefined for valid ranking ID', () => {
      expect(validateRankingId('1')).toBeUndefined();
    });
  });

  // Tests for multiple validations
  describe('Combined validations', () => {
    test('validates points rule configuration correctly', () => {
      const pointsConfig = {
        minPoints: 100,
        events: [
          { type: 'login', weight: 1 },
          { type: 'content_access', weight: 2 }
        ]
      };

      expect(validateMinPoints(pointsConfig.minPoints)).toBeUndefined();
      expect(validatePointsEvents(pointsConfig.events)).toBeUndefined();
    });

    test('validates direct assignment rule configuration correctly', () => {
      const directConfig = {
        assignerProfiles: ['professor', 'coordinator'],
        assignmentLimit: 5
      };

      expect(validateAssignerProfiles(directConfig.assignerProfiles)).toBeUndefined();
    });

    test('validates rule with basic fields and context', () => {
      // Arrange
      const ruleName = 'Regra de Teste';
      const ruleDescription = 'Esta é uma descrição para teste';
      const ruleType = 'points';
      const contextType = 'course';
      const contextItems = ['1', '2'];

      // Act & Assert
      expect(validateRuleName(ruleName)).toBeUndefined();
      expect(validateRuleDescription(ruleDescription)).toBeUndefined();
      expect(validateRuleType(ruleType)).toBeUndefined();
      expect(validateContextType(contextType)).toBeUndefined();
      expect(validateContextItems(contextItems)).toBeUndefined();
    });
  });
});
