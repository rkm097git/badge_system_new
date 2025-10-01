/**
 * Tipos relacionados ao formulário de regras
 * 
 * Centraliza todas as definições de tipos e interfaces específicas do formulário
 * para facilitar a manutenção e evitar circularidade de imports
 */

import { Rule } from '../types';

/**
 * Representa os dados do formulário de regras com tipagem fortemente definida.
 * @interface
 */
export interface RuleFormData {
  /** ID único da regra (presente apenas na edição) */
  uid?: string;
  
  /** Nome da regra */
  name: string;
  
  /** Descrição da regra */
  description: string;
  
  /** Tipo da regra */
  type: RuleType;
  
  /** Status da regra */
  status: RuleStatus;
  
  /** Contexto de aplicação da regra */
  context: RuleContext;
  
  /** Configuração específica para regras de pontuação */
  points: PointsRuleConfig;
  
  /** Configuração específica para regras de atribuição direta */
  directAssignment: DirectAssignmentConfig;
  
  /** Configuração específica para regras de contagem de eventos */
  eventCount: EventCountConfig;
  
  /** Configuração específica para regras de ranking */
  ranking: RankingConfig;
}

/**
 * Tipos possíveis de regras
 * @type
 */
export type RuleType = 'points' | 'direct' | 'events' | 'ranking' | '';

/**
 * Status possíveis de regras
 * @type
 */
export type RuleStatus = 'active' | 'draft' | 'inactive';

/**
 * Tipos possíveis de contexto
 * @type
 */
export type ContextType = 'course' | 'department' | 'campus' | '';

/**
 * Contexto de aplicação da regra
 * @interface
 */
export interface RuleContext {
  /** Tipo de contexto */
  type: ContextType;
  
  /** IDs dos itens de contexto selecionados */
  items: string[];
}

/**
 * Configuração para regras de pontuação
 * @interface
 */
export interface PointsRuleConfig {
  /** Pontuação mínima necessária */
  minPoints: number;
  
  /** Eventos que contribuem para a pontuação */
  events: PointsRuleEvent[];
}

/**
 * Evento para regras de pontuação
 * @interface
 */
export interface PointsRuleEvent {
  /** Tipo do evento */
  type: string;
  
  /** Peso/pontos do evento */
  weight: number;
}

/**
 * Configuração para regras de atribuição direta
 * @interface
 */
export interface DirectAssignmentConfig {
  /** Perfis que podem atribuir o badge */
  assignerProfiles: string[];
  
  /** Limite de atribuições (0 = ilimitado) */
  assignmentLimit: number;
}

/**
 * Configuração para regras de contagem de eventos
 * @interface
 */
export interface EventCountConfig {
  /** Tipo do evento a ser contado */
  eventType: string;
  
  /** Número mínimo de ocorrências */
  minOccurrences: number;
  
  /** Tipo de período (dia, semana, mês, etc.) */
  periodType: 'day' | 'week' | 'month' | 'year';
  
  /** Valor do período */
  periodValue: number;
  
  /** Streak necessário (sequência) */
  requiredStreak: number;
}

/**
 * Configuração para regras de ranking
 * @interface
 */
export interface RankingConfig {
  /** ID do ranking usado como referência */
  rankingId: string;
  
  /** Posição mínima necessária no ranking */
  requiredPosition: number;
}

/**
 * Representação de erros de validação do formulário de regras.
 * Chaves dinâmicas para permitir erros em subcampos específicos.
 * @interface
 */
export interface RuleFormErrors {
  /** Erro no nome */
  name?: string;
  
  /** Erro na descrição */
  description?: string;
  
  /** Erro no tipo */
  type?: string;
  
  /** Erro no contexto */
  context?: string;
  
  /** Erro no tipo de contexto */
  'context.type'?: string;
  
  /** Erro nos itens de contexto */
  'context.items'?: string;
  
  /** Erro na pontuação mínima (regras de pontuação) */
  pointsMinPoints?: string;
  
  /** Erro geral nos eventos (regras de pontuação) */
  pointsEvents?: string;
  
  /** Erro nos perfis de atribuidor (regras de atribuição direta) */
  directAssignmentProfiles?: string;
  
  /** Erro no limite de atribuições (regras de atribuição direta) */
  directAssignmentLimit?: string;
  
  /** Erro geral nas regras de contagem de eventos */
  eventCount?: string;
  
  /** Erro geral nas regras de ranking */
  ranking?: string;
  
  /** Erro em um campo específico (dinâmico) */
  [key: string]: string | undefined;
}

/**
 * Props para componentes de configuração específicos por tipo
 * @interface
 */
export interface RuleTypeConfigComponentProps<T> {
  /** Dados da configuração específica */
  data: T;
  
  /** Erro geral (legado) */
  error?: string;
  
  /** Mapa de erros específicos */
  errors?: RuleFormErrors;
  
  /** Função de callback para alterações */
  onChange: (data: T) => void;
  
  /** Função de validação (opcional) */
  onValidate?: () => void;
  
  /** Flag indicando se o formulário foi submetido */
  formSubmitted?: boolean;
}
