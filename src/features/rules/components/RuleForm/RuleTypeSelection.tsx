/**
 * RuleTypeSelection - Componente para seleção do tipo de regra.
 * 
 * Permite ao usuário escolher entre os diferentes tipos de regras de atribuição
 * disponíveis no sistema, com descrições detalhadas de cada opção.
 * 
 * @component
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip } from "../ui/Tooltip";
import { ErrorMessage } from "../ui/ErrorMessage";
import { RuleType } from "../../types/rule-form-types";

/**
 * Lista de tipos de regras disponíveis
 * Extraída como constante para facilitar manutenção
 */
const RULE_TYPES = [
  { 
    value: "points", 
    label: "Pontuação",
    description: "Atribui com base em pontos acumulados"
  },
  { 
    value: "direct", 
    label: "Atribuição Direta",
    description: "Permite que perfis específicos atribuam manualmente"
  },
  { 
    value: "events", 
    label: "Contagem de Eventos",
    description: "Atribui baseado na frequência de eventos"
  },
  { 
    value: "ranking", 
    label: "Posição em Ranking",
    description: "Atribui com base na posição em rankings"
  }
];

interface RuleTypeSelectionProps {
  /** Valor selecionado atualmente */
  value: RuleType;
  
  /** Mensagem de erro (se houver) */
  error?: string;
  
  /** Função chamada quando o valor muda */
  onChange: (value: RuleType) => void;
  
  /** Função para validação do formulário (opcional) */
  onValidate?: () => void;
}

/**
 * Componente para seleção do tipo de regra
 * 
 * @param value - Tipo de regra atualmente selecionado
 * @param error - Mensagem de erro, se houver
 * @param onChange - Função para atualizar o tipo selecionado
 * @param onValidate - Função para validar o formulário (opcional)
 */
export function RuleTypeSelection({ 
  value, 
  error, 
  onChange,
  onValidate 
}: RuleTypeSelectionProps) {
  /**
   * Manipula a mudança de tipo de regra
   * @param newValue - Novo tipo de regra selecionado
   */
  const handleTypeChange = (newValue: RuleType) => {
    onChange(newValue);
    
    // Se a validação for fornecida e houver erro, validar
    if (onValidate && error) {
      setTimeout(() => onValidate(), 0);
    }
  };
  
  /**
   * Obtém o rótulo do tipo de regra pelo valor
   * @param value - Valor do tipo de regra
   * @returns Rótulo correspondente ou undefined se não encontrado
   */
  const getRuleTypeLabel = (value: RuleType) => {
    return RULE_TYPES.find(type => type.value === value)?.label;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label 
          htmlFor="rule-type" 
          id="rule-type-label"
          className="text-sm font-medium text-gray-700"
        >
          Tipo de Regra
        </Label>
        <Tooltip content="Selecione como esta regra irá atribuir badges" />
      </div>
      <Select
        value={value}
        onValueChange={handleTypeChange}
        aria-labelledby="rule-type-label"
        aria-invalid={!!error}
        aria-describedby={error ? "rule-type-error" : undefined}
      >
        <SelectTrigger 
          id="rule-type"
          className={`bg-white dark:bg-slate-800 text-left rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${
            error ? "border-red-500 focus:border-red-500" : "border-gray-200 hover:border-gray-300 focus:border-blue-500"
          }`}
        >
          <SelectValue placeholder="Selecione o tipo de regra">
            {value && getRuleTypeLabel(value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-800 p-2">
          {RULE_TYPES.map(type => (
            <SelectItem 
              key={type.value} 
              value={type.value} 
              className="rounded-md p-3 focus:bg-blue-50 cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{type.label}</span>
                <span className="text-sm text-gray-500 mt-1">{type.description}</span>
              </div>
            </SelectItem>
          ))}
          
          {/* Caso não existam tipos de regra disponíveis */}
          {RULE_TYPES.length === 0 && (
            <div className="p-3 text-center text-gray-500">
              Nenhum tipo de regra disponível
            </div>
          )}
        </SelectContent>
      </Select>
      <ErrorMessage message={error} id="rule-type-error" />
      
      {/* Descrição do tipo selecionado */}
      {value && (
        <div className="mt-2 text-sm text-gray-600">
          <p>
            {RULE_TYPES.find(type => type.value === value)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
