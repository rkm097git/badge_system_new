/**
 * Testes para o hook useRuleForm
 * 
 * Este arquivo implementa testes unitários para o hook useRuleForm, focando
 * na verificação da lógica de gerenciamento de estado e validação do formulário
 * de regras sem depender de componentes React.
 */

// Importações
const { act } = require('@testing-library/react');
const { useRuleForm } = require('../useRuleForm');

// Mock do React Hooks
jest.mock('react', () => ({
  useState: jest.fn((initialValue) => [initialValue, jest.fn()]),
  useCallback: jest.fn((fn) => fn),
  useEffect: jest.fn((fn) => fn()),
}));

// Dados iniciais para teste
const initialFormData = {
  name: '',
  description: '',
  type: '',
  status: 'active',
  context: {
    type: '',
    items: []
  },
  points: {
    minPoints: 0,
    events: []
  },
  directAssignment: {
    assignerProfiles: [],
    assignmentLimit: 0
  },
  eventCount: {
    eventType: '',
    minOccurrences: 1,
    periodType: 'week',
    periodValue: 1,
    requiredStreak: 0
  },
  ranking: {
    rankingId: '',
    requiredPosition: 1
  }
};

// Mock da função createRule
const mockCreateRule = jest.fn();
const mockUpdateRule = jest.fn();

// Mock do React Query hooks
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(({ mutationFn }) => ({
    mutate: mutationFn,
    isLoading: false,
    error: null
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn()
  }))
}));

// Mock do serviço de API
jest.mock('../../services/rulesService', () => ({
  createRule: (...args) => mockCreateRule(...args),
  updateRule: (...args) => mockUpdateRule(...args),
  getRule: jest.fn()
}));

describe('useRuleForm', () => {
  // Reset dos mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar React useState para simular o comportamento real
    require('react').useState.mockImplementation((initialValue) => {
      let value = initialValue;
      const setValue = jest.fn((newValue) => {
        if (typeof newValue === 'function') {
          value = newValue(value);
        } else {
          value = newValue;
        }
      });
      return [value, setValue];
    });
  });

  test('deve inicializar com dados padrão quando não houver UID', () => {
    // Arrange & Act
    const hook = useRuleForm();
    
    // Assert
    expect(hook.formData).toEqual(initialFormData);
  });

  test('deve validar campos obrigatórios', () => {
    // Arrange
    const hook = useRuleForm();
    
    // Act
    const errors = hook.validateForm();
    
    // Assert
    expect(errors.name).toBeTruthy();
    expect(errors.description).toBeTruthy();
    expect(errors.type).toBeTruthy();
    expect(errors['context.type']).toBeTruthy();
  });

  test('deve atualizar formData ao chamar setFormField', () => {
    // Arrange
    const hook = useRuleForm();
    const setStateMock = jest.fn();
    require('react').useState.mockReturnValueOnce([initialFormData, setStateMock]);
    
    // Act
    hook.setFormField('name', 'Nova Regra');
    
    // Assert
    expect(setStateMock).toHaveBeenCalled();
  });

  test('deve chamar createRule ao submeter formulário novo', async () => {
    // Arrange
    const hook = useRuleForm();
    
    // Substituir validateForm para retornar sem erros
    hook.validateForm = jest.fn(() => ({}));
    
    // Act
    await hook.handleSubmit({ preventDefault: jest.fn() });
    
    // Assert
    expect(mockCreateRule).toHaveBeenCalled();
  });

  test('deve chamar updateRule ao submeter formulário de edição', async () => {
    // Arrange
    const hook = useRuleForm('1');
    
    // Substituir validateForm para retornar sem erros
    hook.validateForm = jest.fn(() => ({}));
    
    // Act
    await hook.handleSubmit({ preventDefault: jest.fn() });
    
    // Assert
    expect(mockUpdateRule).toHaveBeenCalled();
  });

  test('não deve submeter formulário com erros', async () => {
    // Arrange
    const hook = useRuleForm();
    
    // Substituir validateForm para retornar erros
    hook.validateForm = jest.fn(() => ({ name: 'Nome é obrigatório' }));
    
    // Act
    await hook.handleSubmit({ preventDefault: jest.fn() });
    
    // Assert
    expect(mockCreateRule).not.toHaveBeenCalled();
    expect(mockUpdateRule).not.toHaveBeenCalled();
  });

  test('deve validar campos específicos para o tipo de regra "points"', () => {
    // Arrange
    const hook = useRuleForm();
    
    // Configurar um formulário com tipo 'points' mas sem eventos
    const formDataWithPointsType = {
      ...initialFormData,
      name: 'Regra de Pontuação',
      description: 'Descrição da regra',
      type: 'points',
      context: { type: 'course', items: ['1'] },
      points: { minPoints: 100, events: [] }
    };
    
    // Act
    const errors = hook.validateForm(formDataWithPointsType);
    
    // Assert
    expect(errors.pointsEvents).toBeTruthy();
  });

  test('deve validar campos específicos para o tipo de regra "direct"', () => {
    // Arrange
    const hook = useRuleForm();
    
    // Configurar um formulário com tipo 'direct' mas sem perfis
    const formDataWithDirectType = {
      ...initialFormData,
      name: 'Regra de Atribuição Direta',
      description: 'Descrição da regra',
      type: 'direct',
      context: { type: 'course', items: ['1'] },
      directAssignment: { assignerProfiles: [], assignmentLimit: 0 }
    };
    
    // Act
    const errors = hook.validateForm(formDataWithDirectType);
    
    // Assert
    expect(errors.directAssignmentProfiles).toBeTruthy();
  });

  test('deve validar campos específicos para o tipo de regra "events"', () => {
    // Arrange
    const hook = useRuleForm();
    
    // Configurar um formulário com tipo 'events' mas sem tipo de evento
    const formDataWithEventsType = {
      ...initialFormData,
      name: 'Regra de Contagem de Eventos',
      description: 'Descrição da regra',
      type: 'events',
      context: { type: 'course', items: ['1'] },
      eventCount: { eventType: '', minOccurrences: 1, periodType: 'week', periodValue: 1, requiredStreak: 0 }
    };
    
    // Act
    const errors = hook.validateForm(formDataWithEventsType);
    
    // Assert
    expect(errors.eventCount).toBeTruthy();
  });

  test('deve validar campos específicos para o tipo de regra "ranking"', () => {
    // Arrange
    const hook = useRuleForm();
    
    // Configurar um formulário com tipo 'ranking' mas sem rankingId
    const formDataWithRankingType = {
      ...initialFormData,
      name: 'Regra de Ranking',
      description: 'Descrição da regra',
      type: 'ranking',
      context: { type: 'course', items: ['1'] },
      ranking: { rankingId: '', requiredPosition: 1 }
    };
    
    // Act
    const errors = hook.validateForm(formDataWithRankingType);
    
    // Assert
    expect(errors.ranking).toBeTruthy();
  });
  
  test('deve atualizar tipo de regra e redefinir validação', () => {
    // Arrange
    const hook = useRuleForm();
    const setFormDataMock = jest.fn();
    require('react').useState.mockReturnValueOnce([initialFormData, setFormDataMock]);
    hook.setFormSubmitted = jest.fn();
    
    // Act
    hook.handleTypeChange('points');
    
    // Assert
    expect(setFormDataMock).toHaveBeenCalled();
    expect(hook.setFormSubmitted).toHaveBeenCalledWith(false);
  });
  
  test('deve atualizar campos aninhados corretamente', () => {
    // Arrange
    const hook = useRuleForm();
    const setFormDataMock = jest.fn();
    require('react').useState.mockReturnValueOnce([initialFormData, setFormDataMock]);
    
    // Act
    hook.setNestedField('points.minPoints', 200);
    
    // Assert
    expect(setFormDataMock).toHaveBeenCalled();
  });
  
  test('deve resetar o formulário', () => {
    // Arrange
    const hook = useRuleForm();
    const setFormDataMock = jest.fn();
    const setErrorsMock = jest.fn();
    const setFormSubmittedMock = jest.fn();
    require('react').useState.mockReturnValueOnce([{...initialFormData, name: 'Test'}, setFormDataMock]);
    require('react').useState.mockReturnValueOnce([{name: 'Error'}, setErrorsMock]);
    require('react').useState.mockReturnValueOnce([true, setFormSubmittedMock]);
    
    // Act
    hook.resetForm();
    
    // Assert
    expect(setFormDataMock).toHaveBeenCalledWith(initialFormData);
    expect(setErrorsMock).toHaveBeenCalledWith({});
    expect(setFormSubmittedMock).toHaveBeenCalledWith(false);
  });
  
  test('deve atualizar todos os campos de contexto', () => {
    // Arrange
    const hook = useRuleForm();
    const setFormDataMock = jest.fn();
    require('react').useState.mockReturnValueOnce([initialFormData, setFormDataMock]);
    
    // Act
    hook.setContextFields({ type: 'department', items: ['2', '3'] });
    
    // Assert
    expect(setFormDataMock).toHaveBeenCalled();
  });
  
  test('deve verificar se o formulário está sujo', () => {
    // Arrange
    const hook = useRuleForm();
    const originalData = {...initialFormData};
    const modifiedData = {...initialFormData, name: 'Modified'};
    
    // Act & Assert
    expect(hook.isFormDirty(originalData, originalData)).toBe(false);
    expect(hook.isFormDirty(originalData, modifiedData)).toBe(true);
  });
});
