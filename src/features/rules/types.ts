/**
 * Tipos relacionados às regras de atribuição de badges.
 */

/**
 * Representa uma regra no sistema.
 */
export interface Rule {
  uid: string;
  name: string;
  description?: string;
  type: 'points' | 'direct' | 'events' | 'ranking';
  status: 'active' | 'draft' | 'inactive';
  context?: {
    type: 'course' | 'department' | 'campus';
    id?: string;
  };
  // Campos específicos por tipo de regra
  points?: {
    minPoints: number;
    events: {
      type: string;
      points: number;
    }[];
  };
  direct?: {
    limit: number;
  };
  events?: {
    count: number;
    eventType: string;
  };
  ranking?: {
    position: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Parâmetros para requisições paginadas.
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Resposta paginada da API.
 */
export interface ApiResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Dados para criação de uma regra.
 */
export type RuleCreateInput = Omit<Rule, 'uid' | 'createdAt' | 'updatedAt'>;

/**
 * Dados para atualização de uma regra.
 */
export type RuleUpdateInput = Partial<Omit<Rule, 'uid' | 'createdAt' | 'updatedAt'>>;

/**
 * Representa os dados do formulário de regras.
 */
export interface RuleFormData {
  uid?: string;
  name: string;
  description: string;
  type: 'points' | 'direct' | 'events' | 'ranking' | '';
  status: 'active' | 'draft' | 'inactive';
  context: {
    type: 'course' | 'department' | 'campus' | '';
    id?: string;
  };
  // Campos específicos por tipo
  points: {
    minPoints: number;
    events: {
      type: string;
      points: number;
    }[];
  };
  direct: {
    limit: number;
  };
  events: {
    count: number;
    eventType: string;
  };
  ranking: {
    position: number;
  };
}

/**
 * Erros de validação do formulário de regras.
 */
export interface RuleFormErrors {
  name?: string;
  description?: string;
  type?: string;
  'context.type'?: string;
  'points.minPoints'?: string;
  'points.events'?: string;
  'points.events.*.type'?: string;
  'points.events.*.points'?: string;
  'direct.limit'?: string;
  'events.count'?: string;
  'events.eventType'?: string;
  'ranking.position'?: string;
  [key: string]: string | undefined;
}
