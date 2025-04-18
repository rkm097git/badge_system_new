'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRules } from '../hooks/useRules';
import { PaginationParams, Rule } from '../types';

// Definir o tipo do contexto
interface RulesContextType {
  // Estado
  rules: Rule[];
  totalCount: number;
  pagination: {
    page: number;
    pageSize: number;
  };
  
  // Estados de loading
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Operações
  createRule: (data: any) => Promise<Rule>;
  updateRule: (data: { uid: string; data: any }) => Promise<Rule>;
  deleteRule: (uid: string) => Promise<boolean>;
  
  // Estados das operações
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Outras funções
  refetch: () => Promise<void>;
  setPaginationParams: (params: Partial<PaginationParams>) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Ordenação
  sortField: string;
  sortDirection: 'asc' | 'desc';
  setSorting: (field: string) => void;
}

// Valor padrão para o contexto
const defaultContext: RulesContextType = {
  rules: [],
  totalCount: 0,
  pagination: {
    page: 1,
    pageSize: 10,
  },
  isLoading: false,
  isError: false,
  error: null,
  createRule: async () => ({ uid: '' } as Rule),
  updateRule: async () => ({ uid: '' } as Rule),
  deleteRule: async () => false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  refetch: async () => {},
  setPaginationParams: () => {},
  searchTerm: '',
  setSearchTerm: () => {},
  sortField: 'name',
  sortDirection: 'asc',
  setSorting: () => {},
};

// Criação do contexto
const RulesContext = createContext<RulesContextType>(defaultContext);

// Provider do contexto
export function RulesProvider({ children }: { children: ReactNode }) {
  const [paginationParams, setPaginationParams] = React.useState<PaginationParams>({
    page: 1,
    pageSize: 10,
  });
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  
  // Atualizar parâmetros de paginação
  const handleSetPaginationParams = React.useCallback((params: Partial<PaginationParams>) => {
    setPaginationParams(prev => ({ ...prev, ...params }));
  }, []);
  
  // Atualizar termo de busca
  const handleSetSearchTerm = React.useCallback((term: string) => {
    setSearchTerm(term);
    // Resetar página para 1 quando mudar a busca
    setPaginationParams(prev => ({ ...prev, page: 1, search: term }));
  }, []);
  
  // Função para definir campo de ordenação
  const handleSetSorting = React.useCallback((field: string) => {
    if (field === sortField) {
      // Se o mesmo campo, alternar direção
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Se campo diferente, definir novo campo e resetar para ascendente
      setSortField(field);
      setSortDirection('asc');
    }
    
    // Aplicar ordenação nos parâmetros de paginação
    setPaginationParams(prev => ({
      ...prev,
      sortBy: field,
      sortDirection: field === sortField && sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  }, [sortField, sortDirection]);
  
  // Usar o hook useRules com os parâmetros de paginação
  const {
    rules,
    totalCount,
    pagination,
    isLoading,
    isError,
    error,
    createRule,
    updateRule,
    deleteRule,
    isCreating,
    isUpdating,
    isDeleting,
    refetch,
  } = useRules({
    ...paginationParams,
    search: searchTerm,
    sortBy: sortField,
    sortDirection: sortDirection,
  });
  
  // Memoizar o valor do contexto para evitar re-renderizações desnecessárias
  const contextValue = React.useMemo(
    () => ({
      rules,
      totalCount,
      pagination,
      isLoading,
      isError,
      error,
      createRule,
      updateRule,
      deleteRule,
      isCreating,
      isUpdating,
      isDeleting,
      refetch,
      setPaginationParams: handleSetPaginationParams,
      searchTerm,
      setSearchTerm: handleSetSearchTerm,
      sortField,
      sortDirection,
      setSorting: handleSetSorting,
    }),
    [
      rules,
      totalCount,
      pagination,
      isLoading,
      isError,
      error,
      createRule,
      updateRule,
      deleteRule,
      isCreating,
      isUpdating,
      isDeleting,
      refetch,
      handleSetPaginationParams,
      searchTerm,
      handleSetSearchTerm,
      sortField,
      sortDirection,
      handleSetSorting,
    ]
  );
  
  return (
    <RulesContext.Provider value={contextValue}>
      {children}
    </RulesContext.Provider>
  );
}

// Hook personalizado para utilizar o contexto
export function useRulesContext() {
  const context = useContext(RulesContext);
  
  if (!context) {
    throw new Error('useRulesContext deve ser utilizado dentro de um RulesProvider');
  }
  
  return context;
}
