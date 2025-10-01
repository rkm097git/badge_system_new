/**
 * RuleContextSelection - Componente para seleção do contexto de aplicação da regra.
 * 
 * Permite selecionar o tipo de contexto (curso, departamento, campus) e os itens específicos
 * dentro desse contexto onde a regra será aplicada.
 * 
 * @component
 */
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip } from "../ui/Tooltip";
import { ErrorMessage } from "../ui/ErrorMessage";
import { RuleContext, ContextType } from "../../types/rule-form-types";

/**
 * Mapeamento de tipos de contexto para rótulos em português
 */
const CONTEXT_TYPE_LABELS: Record<string, string> = {
  course: "Cursos",
  department: "Departamentos",
  campus: "Campus"
};

/**
 * Mapeamento de tipos de contexto para nomes no singular
 * Usado para mensagens com contagem de itens
 */
const CONTEXT_TYPE_SINGULAR: Record<string, string> = {
  course: "curso",
  department: "departamento",
  campus: "campus"
};

/**
 * Opções de itens disponíveis para cada tipo de contexto
 */
const CONTEXT_OPTIONS = {
  course: [
    { id: "1", name: "Engenharia de Software" },
    { id: "2", name: "Ciência da Computação" },
    { id: "3", name: "Sistemas de Informação" }
  ],
  department: [
    { id: "1", name: "Departamento de Computação" },
    { id: "2", name: "Departamento de Engenharia" }
  ],
  campus: [
    { id: "1", name: "Campus Central" },
    { id: "2", name: "Campus Norte" },
    { id: "3", name: "Campus Sul" }
  ]
};

interface RuleContextSelectionProps {
  /** Dados do contexto atual */
  context: RuleContext;
  
  /** Mensagem de erro (se houver) */
  error?: string;
  
  /** Função para atualizar o contexto */
  onChange: (context: RuleContext) => void;
  
  /** Função para validar o formulário (opcional) */
  onValidate?: () => void;
}

/**
 * Componente para seleção do contexto de aplicação da regra
 */
export function RuleContextSelection({ 
  context, 
  error, 
  onChange, 
  onValidate 
}: RuleContextSelectionProps) {
  /**
   * Atualiza o tipo de contexto selecionado
   * @param value - Novo tipo de contexto
   */
  const handleContextTypeChange = (value: ContextType) => {
    onChange({
      type: value,
      items: []
    });
    
    // Se a validação for fornecida e houver correção de um erro, validar
    if (onValidate && error && value) {
      setTimeout(() => onValidate(), 0);
    }
  };

  /**
   * Alterna a seleção de um item específico do contexto
   * @param itemId - ID do item a ser alternado
   */
  const handleContextItemToggle = (itemId: string) => {
    const newItems = context.items.includes(itemId)
      ? context.items.filter(id => id !== itemId)
      : [...context.items, itemId];
      
    onChange({
      ...context,
      items: newItems
    });
    
    // Se a validação for fornecida e houver correção de um erro, validar
    if (onValidate && error) {
      setTimeout(() => onValidate(), 0);
    }
  };

  /**
   * Gera o texto de contagem de itens selecionados
   * @returns Texto formatado com a contagem
   */
  const getSelectionCountText = () => {
    if (!context.type) return null;
    
    return `${context.items.length} ${
      context.items.length === 1 
        ? CONTEXT_TYPE_SINGULAR[context.type] 
        : `${CONTEXT_TYPE_SINGULAR[context.type]}(s)`
    } selecionado(s)`;
  };

  // Obter o texto de contagem de itens selecionados
  const selectionCountText = getSelectionCountText();
  
  // Obter as opções de itens para o tipo de contexto atual
  const currentOptions = context.type ? CONTEXT_OPTIONS[context.type] : [];

  return (
    <div className="space-y-4">
      {/* Seção de Seleção de Tipo de Contexto */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Label 
              htmlFor="context-type" 
              className="text-sm font-medium text-gray-700"
            >
              Contexto de Aplicação
            </Label>
            <Tooltip content="Define em quais contextos esta regra será aplicada" />
          </div>
          
          {/* Contador de itens selecionados */}
          {selectionCountText && (
            <p className="text-sm text-blue-600 font-medium">
              {selectionCountText}
            </p>
          )}
        </div>
        
        {/* Seletor de tipo de contexto */}
        <Select
          value={context.type}
          onValueChange={handleContextTypeChange}
          name="context-type"
        >
          <SelectTrigger 
            id="context-type"
            className={`bg-white dark:bg-slate-800 text-left rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${
              error ? "border-red-500 focus:border-red-500" : "border-gray-200 hover:border-gray-300 focus:border-blue-500"
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? "context-error" : undefined}
          >
            <SelectValue placeholder="Selecione o tipo de contexto">
              {context.type && CONTEXT_TYPE_LABELS[context.type]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800">
            <SelectItem value="course">
              <div className="flex flex-col">
                <span>Cursos</span>
                <span className="text-sm text-muted-foreground">Aplicar em cursos específicos</span>
              </div>
            </SelectItem>
            <SelectItem value="department">
              <div className="flex flex-col">
                <span>Departamentos</span>
                <span className="text-sm text-muted-foreground">Aplicar em departamentos específicos</span>
              </div>
            </SelectItem>
            <SelectItem value="campus">
              <div className="flex flex-col">
                <span>Campus</span>
                <span className="text-sm text-muted-foreground">Aplicar em campus específicos</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {/* Mensagem de erro */}
        <ErrorMessage message={error} id="context-error" />
      </div>

      {/* Seção de Seleção de Itens do Contexto */}
      {context.type && (
        <div className="space-y-3 mt-4">
          <Label className="text-sm font-medium text-gray-700">
            Selecione os itens do contexto
          </Label>
          
          {/* Grid de itens selecionáveis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 w-full">
            {currentOptions.map(item => (
              <div
                key={item.id}
                role="checkbox"
                aria-checked={context.items.includes(item.id)}
                tabIndex={0}
                className={`
                  flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-150 shadow-sm hover:shadow
                  ${context.items.includes(item.id)
                    ? "bg-blue-50 border-blue-300 shadow-inner"
                    : "bg-white hover:bg-gray-50 border-gray-200"}
                `}
                onClick={() => handleContextItemToggle(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleContextItemToggle(item.id);
                  }
                }}
              >
                <div 
                  className={`w-5 h-5 flex items-center justify-center border rounded ${
                    context.items.includes(item.id) 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-400'
                  }`}
                  aria-hidden="true"
                >
                  {context.items.includes(item.id) && (
                    <svg 
                      className="w-3 h-3 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  )}
                </div>
                <Label
                  className="flex-1 cursor-pointer font-medium"
                >
                  {item.name}
                </Label>
              </div>
            ))}
          </div>
          
          {/* Mensagem informativa */}
          <p className="text-sm text-gray-500 mt-2">
            Se nenhum item for selecionado, a regra será aplicada a todos.
          </p>
          
          {/* Mensagem quando não há opções disponíveis */}
          {currentOptions.length === 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
              <p className="text-gray-500">Nenhuma opção disponível para este tipo de contexto.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
