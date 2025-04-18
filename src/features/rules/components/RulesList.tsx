'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { PaginationParams } from '../types';
import Link from 'next/link';
import { Search, ChevronUp, ChevronDown, PlusCircle } from 'lucide-react';
import { useRulesContext, RulesProvider } from '../context/RulesContext';
import RuleItem from './RuleItem';
import { useDebounce } from '@/lib/hooks/useDebounce';

// Componente para ordenação de cabeçalhos
const SortableHeader = ({ 
  title, 
  field, 
  currentSort, 
  onSort 
}: { 
  title: string, 
  field: string, 
  currentSort: { field: string, direction: 'asc' | 'desc' }, 
  onSort: (field: string) => void 
}) => {
  const isActive = currentSort.field === field;
  
  return (
    <div 
      className="flex items-center gap-1 cursor-pointer group"
      onClick={() => onSort(field)}
    >
      <span>{title}</span>
      {isActive ? (
        currentSort.direction === 'asc' ? (
          <ChevronUp className="h-4 w-4 text-primary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-primary" />
        )
      ) : (
        <ChevronUp className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
};

// Componente interno que usa o contexto
function RulesListInner({ baseUrl = '/admin/rules' }: { baseUrl?: string }) {
  const { 
    rules, 
    totalCount,
    pagination, 
    isLoading, 
    isError,
    error,
    deleteRule,
    isDeleting,
    refetch,
    setPaginationParams,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    setSorting
  } = useRulesContext();

  const { toast } = useToast();
  
  // Implementação de busca com submit via Enter
  const [inputValue, setInputValue] = useState(searchTerm);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Função para lidar com a mudança no campo de busca
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Gerar sugestões baseadas no texto digitado
    if (value.trim() !== '') {
      // Filtrar sugestões baseadas nas regras existentes
      const newSuggestions = rules
        .filter(rule => {
          return (
            rule.name.toLowerCase().includes(value.toLowerCase()) ||
            rule.type.toLowerCase().includes(value.toLowerCase()) ||
            (rule.context?.type?.toLowerCase().includes(value.toLowerCase()) || false)
          );
        })
        .map(rule => rule.name)
        .slice(0, 5); // Limitar a 5 sugestões
      
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [rules]);
  
  // Função para submeter a busca quando Enter é pressionado
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(inputValue);
    setShowSuggestions(false);
  }, [inputValue, setSearchTerm]);
  
  // Função para selecionar uma sugestão
  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  }, [setSearchTerm]);
  
  // Função para limpar a busca
  const handleClearSearch = useCallback(() => {
    setInputValue('');
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, [setSearchTerm]);
  
  // Função para alternar ordenação
  const handleSort = useCallback((field: string) => {
    setSorting(field);
  }, [setSorting]);
  
  // Função para excluir regra
  const handleDelete = useCallback(async (uid: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a regra "${name}"?`)) {
      try {
        await deleteRule(uid);
        toast({
          title: 'Regra excluída',
          description: 'A regra foi excluída com sucesso.',
          variant: 'success',
        });
        refetch();
      } catch (error) {
        toast({
          title: 'Erro ao excluir regra',
          description: error.message || 'Ocorreu um erro ao excluir a regra.',
          variant: 'destructive',
        });
      }
    }
  }, [deleteRule, toast, refetch]);

  // Função para mudar a página
  const handlePageChange = useCallback((newPage: number) => {
    setPaginationParams({ page: newPage });
  }, [setPaginationParams]);
  
  // Estado para ordenação atual
  const currentSort = useMemo(() => ({
    field: sortField,
    direction: sortDirection
  }), [sortField, sortDirection]);
  
  // Se estiver carregando, mostra um indicador de carregamento
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando regras...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se ocorreu um erro, mostra uma mensagem de erro
  if (isError) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-500 font-semibold">Erro ao carregar regras</p>
            <p className="mt-2 text-muted-foreground">{error?.message || 'Ocorreu um erro inesperado.'}</p>
            <Button 
              onClick={() => refetch()} 
              className="mt-4"
              variant="outline"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderização normal com os dados carregados
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8">
        <div>
          <h2 className="text-lg font-semibold mb-3">Regras de Atribuição</h2>
          <p className="text-sm text-muted-foreground leading-loose mb-6">
            Gerencie as regras de atribuição de badges
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-600 font-medium shadow-md hover:shadow-lg transition-all duration-200">
          <Link href={`${baseUrl}/new`}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Regra
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Barra de pesquisa com sugestões e submit por Enter */}
        <form onSubmit={handleSearchSubmit} className="mb-2 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar regras... (pressione Enter)"
            value={inputValue}
            onChange={handleSearchChange}
            className="pl-8"
            autoComplete="off"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span className="sr-only">Limpar busca</span>
            </button>
          )}
          {/* Sugestões de auto-completar */}
          {showSuggestions && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </form>
        
        {/* Contador de exibição movido para cima */}
        {rules.length > 0 && (
          <div className="text-[10px] text-muted-foreground mb-3">
            Exibindo {(pagination.page - 1) * pagination.pageSize + 1}-
            {Math.min(pagination.page * pagination.pageSize, totalCount)} de {totalCount}
          </div>
        )}
        
        {rules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhuma regra encontrada para esta busca.' : 'Nenhuma regra encontrada.'}
            </p>
            {!searchTerm && (
              <Button
                asChild
                variant="outline"
                className="mt-4"
              >
                <Link href={`${baseUrl}/new`}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar primeira regra
                </Link>
              </Button>
            )}
            {searchTerm && (
            <Button
            variant="outline"
            className="mt-4"
            onClick={handleClearSearch}
            >
            Limpar busca
            </Button>
            )}
          </div>
        ) : (
          <>
            {/* Tabela para telas maiores */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>
                      <SortableHeader 
                        title="Nome" 
                        field="name" 
                        currentSort={currentSort} 
                        onSort={handleSort} 
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader 
                        title="Tipo" 
                        field="type" 
                        currentSort={currentSort} 
                        onSort={handleSort} 
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader 
                        title="Contexto" 
                        field="context.type" 
                        currentSort={currentSort} 
                        onSort={handleSort} 
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader 
                        title="Status" 
                        field="status" 
                        currentSort={currentSort} 
                        onSort={handleSort} 
                      />
                    </TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule, index) => (
                    <RuleItem 
                      key={rule.uid} 
                      rule={rule} 
                      index={(pagination.page - 1) * pagination.pageSize + index + 1}
                      onDelete={handleDelete}
                      isDeleting={isDeleting}
                      baseUrl={baseUrl}
                      isAlternate={index % 2 === 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Cards para dispositivos móveis */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {rules.map((rule, index) => (
                <div key={rule.uid} className={`rounded-lg shadow p-4 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs mr-2">
                        {(pagination.page - 1) * pagination.pageSize + index + 1}
                      </span>
                      <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${rule.status === 'active' ? 'bg-green-100 text-green-800' : 
                          rule.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}
                    >
                      {rule.status === 'active' && 'Ativo'}
                      {rule.status === 'draft' && 'Rascunho'}
                      {rule.status === 'inactive' && 'Inativo'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p>
                        {rule.type === 'points' && 'Pontuação'}
                        {rule.type === 'direct' && 'Atribuição Direta'}
                        {rule.type === 'events' && 'Contagem de Eventos'}
                        {rule.type === 'ranking' && 'Posição em Ranking'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contexto</p>
                      <p>
                        {rule.context?.type === 'course' && 'Curso'}
                        {rule.context?.type === 'department' && 'Departamento'}
                        {rule.context?.type === 'campus' && 'Campus'}
                        {!rule.context?.type && '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 justify-end border-t pt-3">
                    <Button variant="ghost" size="sm" asChild className="flex-1">
                      <Link href={`${baseUrl}/${rule.uid}`} className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          <path d="m15 5 4 4"/>
                        </svg>
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-100 flex items-center justify-center"
                      onClick={() => handleDelete(rule.uid, rule.name)}
                      disabled={isDeleting}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" x2="10" y1="11" y2="17"/>
                        <line x1="14" x2="14" y1="11" y2="17"/>
                      </svg>
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Paginação minimalista com ícones centralizada */}
            {rules.length > 0 && (
              <div className="flex items-center justify-center space-x-2 py-4 mt-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page <= 1}
                  className="h-8 w-8"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="11 17 6 12 11 7"></polyline>
                    <polyline points="18 17 13 12 18 7"></polyline>
                  </svg>
                  <span className="sr-only">Primeira página</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="h-8 w-8"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  <span className="sr-only">Página anterior</span>
                </Button>
                <span className="text-xs font-medium px-3 text-muted-foreground">
                  {pagination.page}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.pageSize >= totalCount}
                  className="h-8 w-8"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  <span className="sr-only">Próxima página</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange(Math.ceil(totalCount / pagination.pageSize))}
                  disabled={pagination.page * pagination.pageSize >= totalCount}
                  className="h-8 w-8"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="13 17 18 12 13 7"></polyline>
                    <polyline points="6 17 11 12 6 7"></polyline>
                  </svg>
                  <span className="sr-only">Última página</span>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Componente wrapper que fornece o contexto
export function RulesList(props: { baseUrl?: string }) {
  return (
    <RulesProvider>
      <RulesListInner {...props} />
    </RulesProvider>
  );
}

export default RulesList;
