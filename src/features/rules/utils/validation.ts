/**
 * Utilitários de validação para formulários de regras
 * 
 * Este módulo centraliza todas as funções de validação usadas no sistema de regras,
 * facilitando reutilização e testabilidade.
 */
import { RuleFormData, RuleFormErrors, RuleType } from "../types";

/**
 * Valida se um campo de texto está preenchido
 * @param value Valor do campo
 * @param fieldName Nome do campo para mensagem de erro
 * @returns Mensagem de erro ou undefined
 */
export const validateRequiredField = (value: string, fieldName: string): string | undefined => {
  if (!value || value.trim() === '') {
    return `${fieldName} é obrigatório`;
  }
  return undefined;
};

/**
 * Valida se um valor numérico é maior que zero
 * @param value Valor numérico
 * @param fieldName Nome do campo para mensagem de erro
 * @returns Mensagem de erro ou undefined
 */
export const validatePositiveNumber = (value: number, fieldName: string): string | undefined => {
  if (value <= 0) {
    return `${fieldName} deve ser maior que zero`;
  }
  return undefined;
};

/**
 * Valida se um valor numérico não é negativo
 * @param value Valor numérico
 * @param fieldName Nome do campo para mensagem de erro
 * @returns Mensagem de erro ou undefined
 */
export const validateNonNegativeNumber = (value: number, fieldName: string): string | undefined => {
  if (value < 0) {
    return `${fieldName} não pode ser negativo`;
  }
  return undefined;
};

/**
 * Valida se um array tem pelo menos um item
 * @param array Array a ser validado
 * @param fieldName Nome do campo para mensagem de erro
 * @returns Mensagem de erro ou undefined
 */
export const validateNonEmptyArray = (array: any[], fieldName: string): string | undefined => {
  if (!array || array.length === 0) {
    return `${fieldName} deve conter pelo menos um item`;
  }
  return undefined;
};

/**
 * Valida campos específicos de regras do tipo 'points'
 * @param pointsData Dados da regra de pontuação
 * @returns Objeto com erros encontrados
 */
export const validatePointsRule = (pointsData: RuleFormData['points']): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validar pontuação mínima
  const minPointsError = validatePositiveNumber(pointsData.minPoints, 'Pontuação mínima');
  if (minPointsError) {
    errors.pointsMinPoints = minPointsError;
  }
  
  // Validar eventos
  if (!pointsData.events || pointsData.events.length === 0) {
    errors.pointsEvents = 'Adicione pelo menos um tipo de evento';
  } else {
    // Verificar se todos os eventos têm tipo selecionado
    pointsData.events.forEach((event, index) => {
      if (!event.type) {
        errors[`points.events.${index}.type`] = 'Tipo de evento é obrigatório';
      }
    });
  }
  
  return errors;
};

/**
 * Valida campos específicos de regras do tipo 'direct'
 * @param directData Dados da regra de atribuição direta
 * @returns Objeto com erros encontrados
 */
export const validateDirectAssignmentRule = (directData: RuleFormData['directAssignment']): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validar perfis de atribuidor
  if (!directData.assignerProfiles || directData.assignerProfiles.length === 0) {
    errors.directAssignmentProfiles = 'Selecione pelo menos um perfil de atribuidor';
  }
  
  // Validar limite de atribuições (pode ser 0 para ilimitado)
  const limitError = validateNonNegativeNumber(directData.assignmentLimit, 'Limite de atribuições');
  if (limitError) {
    errors.directAssignmentLimit = limitError;
  }
  
  return errors;
};

/**
 * Valida campos específicos de regras do tipo 'events'
 * @param eventsData Dados da regra de contagem de eventos
 * @returns Objeto com erros encontrados
 */
export const validateEventCountRule = (eventsData: RuleFormData['eventCount']): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validar tipo de evento
  if (!eventsData.eventType) {
    errors.eventCount = 'Selecione um tipo de evento';
    return errors; // Retorna imediatamente para evitar validações adicionais
  }
  
  // Validar número mínimo de ocorrências
  const occurrencesError = validatePositiveNumber(eventsData.minOccurrences, 'Número mínimo de ocorrências');
  if (occurrencesError) {
    errors.eventCount = occurrencesError;
  }
  
  return errors;
};

/**
 * Valida campos específicos de regras do tipo 'ranking'
 * @param rankingData Dados da regra de ranking
 * @returns Objeto com erros encontrados
 */
export const validateRankingRule = (rankingData: RuleFormData['ranking']): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validar ID do ranking
  if (!rankingData.rankingId) {
    errors.ranking = 'Selecione um ranking';
    return errors; // Retorna imediatamente para evitar validações adicionais
  }
  
  // Validar posição necessária
  const positionError = validatePositiveNumber(rankingData.requiredPosition, 'Posição necessária');
  if (positionError) {
    errors.ranking = positionError;
  }
  
  return errors;
};

/**
 * Valida o contexto da regra
 * @param context Dados do contexto
 * @returns Objeto com erros encontrados
 */
export const validateContext = (context: RuleFormData['context']): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Se o tipo de contexto está selecionado, deve haver pelo menos um item
  if (context.type && context.items.length === 0) {
    errors['context.items'] = 'Selecione pelo menos um item do contexto';
    errors.context = 'Selecione pelo menos um item do contexto';
  }
  
  return errors;
};

/**
 * Função principal de validação para o formulário de regras
 * @param formData Dados completos do formulário
 * @returns Objeto com todos os erros encontrados
 */
export const validateRuleForm = (formData: RuleFormData): RuleFormErrors => {
  const errors: RuleFormErrors = {};
  
  // Validar campos básicos
  const nameError = validateRequiredField(formData.name, 'Nome da regra');
  if (nameError) errors.name = nameError;
  
  const descriptionError = validateRequiredField(formData.description, 'Descrição da regra');
  if (descriptionError) errors.description = descriptionError;
  
  const typeError = validateRequiredField(formData.type, 'Tipo de regra');
  if (typeError) errors.type = typeError;
  
  // Validar contexto
  const contextErrors = validateContext(formData.context);
  Object.assign(errors, contextErrors);
  
  // Validações específicas por tipo
  if (formData.type) {
    switch (formData.type as RuleType) {
      case 'points':
        const pointsErrors = validatePointsRule(formData.points);
        Object.assign(errors, pointsErrors);
        break;
        
      case 'direct':
        const directErrors = validateDirectAssignmentRule(formData.directAssignment);
        Object.assign(errors, directErrors);
        break;
        
      case 'events':
        const eventsErrors = validateEventCountRule(formData.eventCount);
        Object.assign(errors, eventsErrors);
        break;
        
      case 'ranking':
        const rankingErrors = validateRankingRule(formData.ranking);
        Object.assign(errors, rankingErrors);
        break;
    }
  }
  
  return errors;
};

/**
 * Verifica se o formulário é válido
 * @param formData Dados do formulário
 * @returns True se não houver erros
 */
export const isFormValid = (formData: RuleFormData): boolean => {
  const errors = validateRuleForm(formData);
  return Object.keys(errors).length === 0;
};
