/**
 * Testes para o hook useRules
 * 
 * Este arquivo implementa testes unitários para o hook useRules, focando
 * na verificação das funcionalidades de consulta, filtragem, ordenação e paginação
 * de regras.
 */

// Importações
const { useRules } = require('../useRules');

// Mock do React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: jest.fn()
  }))
}));

// Mock do serviço de regras
jest.mock('../../services/rulesService', () => ({
  getRules: jest.fn()
}));

describe('useRules', () => {
  // Reset dos mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve chamar useQuery com os parâmetros corretos', () => {
    // Arrange
    const { useQuery } = require('@tanstack/react-query');
    
    // Act
    useRules();
    
    // Assert
    expect(useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(['rules']),
      expect.any(Function),
      expect.any(Object)
    );
  });

  test('deve passar os parâmetros de consulta corretamente para getRules', () => {
    // Arrange
    const { useQuery } = require('@tanstack/react-query');
    const queryFn = jest.fn();
    
    // Configurar o mock para capturar a função de consulta
    useQuery.mockImplementationOnce((queryKey, queryFn) => {
      // Armazenar a função para teste
      queryFn();
      return { data: [], isLoading: false, error: null };
    });
    
    const { getRules } = require('../../services/rulesService');
    
    // Act
    useRules({ search: 'test', page: 1, limit: 10 });
    
    // Assert
    expect(getRules).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'test',
        page: 1,
        limit: 10
      })
    );
  });

  test('deve retornar dados, estado de carregamento e erro do useQuery', () => {
    // Arrange
    const mockData = [
      { uid: '1', name: 'Rule 1' },
      { uid: '2', name: 'Rule 2' }
    ];
    
    const { useQuery } = require('@tanstack/react-query');
    useQuery.mockReturnValueOnce({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    });
    
    // Act
    const result = useRules();
    
    // Assert
    expect(result.data).toEqual(mockData);
    expect(result.isLoading).toBe(false);
    expect(result.error).toBeNull();
  });

  test('deve realizar refetch quando solicitado', () => {
    // Arrange
    const mockRefetch = jest.fn();
    
    const { useQuery } = require('@tanstack/react-query');
    useQuery.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });
    
    // Act
    const { refetch } = useRules();
    refetch();
    
    // Assert
    expect(mockRefetch).toHaveBeenCalled();
  });

  test('deve incluir parâmetros de ordenação quando especificados', () => {
    // Arrange
    const { useQuery } = require('@tanstack/react-query');
    const queryFn = jest.fn();
    
    // Configurar o mock para capturar a função de consulta
    useQuery.mockImplementationOnce((queryKey, queryFn) => {
      // Armazenar a função para teste
      queryFn();
      return { data: [], isLoading: false, error: null };
    });
    
    const { getRules } = require('../../services/rulesService');
    
    // Act
    useRules({
      search: '',
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortDirection: 'asc'
    });
    
    // Assert
    expect(getRules).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'name',
        sortDirection: 'asc'
      })
    );
  });

  test('deve incluir parâmetros de filtragem quando especificados', () => {
    // Arrange
    const { useQuery } = require('@tanstack/react-query');
    const queryFn = jest.fn();
    
    // Configurar o mock para capturar a função de consulta
    useQuery.mockImplementationOnce((queryKey, queryFn) => {
      // Armazenar a função para teste
      queryFn();
      return { data: [], isLoading: false, error: null };
    });
    
    const { getRules } = require('../../services/rulesService');
    
    // Act
    useRules({
      search: '',
      page: 1,
      limit: 10,
      filters: {
        type: 'points',
        status: 'active'
      }
    });
    
    // Assert
    expect(getRules).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          type: 'points',
          status: 'active'
        }
      })
    );
  });

  test('deve usar valores default para parâmetros de consulta omitidos', () => {
    // Arrange
    const { useQuery } = require('@tanstack/react-query');
    const queryFn = jest.fn();
    
    // Configurar o mock para capturar a função de consulta
    useQuery.mockImplementationOnce((queryKey, queryFn) => {
      // Armazenar a função para teste
      queryFn();
      return { data: [], isLoading: false, error: null };
    });
    
    const { getRules } = require('../../services/rulesService');
    
    // Act
    useRules();
    
    // Assert
    expect(getRules).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 10
      })
    );
  });

  test('deve incluir a chave de consulta correta para invalidação de cache', () => {
    // Arrange
    const { useQuery } = require('@tanstack/react-query');
    
    // Act
    useRules({
      search: 'test',
      type: 'points'
    });
    
    // Assert
    expect(useQuery).toHaveBeenCalledWith(
      // A chave deve conter 'rules' e os parâmetros de consulta
      expect.arrayContaining(['rules', expect.objectContaining({ search: 'test', type: 'points' })]),
      expect.any(Function),
      expect.any(Object)
    );
  });

  test('deve configurar opções de stale time e retry corretamente', () => {
    // Arrange
    const { useQuery } = require('@tanstack/react-query');
    
    // Act
    useRules();
    
    // Assert
    expect(useQuery).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        staleTime: expect.any(Number),
        retry: expect.any(Number)
      })
    );
  });
});
