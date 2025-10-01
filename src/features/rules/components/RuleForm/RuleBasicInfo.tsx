/**
 * RuleBasicInfo - Componente para os campos básicos do formulário de regras (nome e descrição).
 * 
 * Responsável por renderizar e gerenciar os campos de nome e descrição da regra,
 * incluindo validação visual e mensagens de erro.
 * 
 * @component
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RuleFormData, RuleFormErrors } from "../../types/rule-form-types";
import { Tooltip } from "../ui/Tooltip";
import { ErrorMessage } from "../ui/ErrorMessage";

interface RuleBasicInfoProps {
  /** Dados completos do formulário */
  formData: RuleFormData;
  
  /** Mapa de erros do formulário */
  errors: RuleFormErrors;
  
  /** Função para atualizar campos específicos do formulário */
  onChange: (field: string, value: any) => void;
}

/**
 * Componente para campos básicos do formulário de regras
 */
export function RuleBasicInfo({ formData, errors, onChange }: RuleBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-5 w-full">
        {/* Nome da Regra */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nome da Regra
              {errors.name && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Tooltip content="Nome único que identifica esta regra" />
          </div>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Digite um nome para a regra..."
            style={{ fontSize: '14px' }}
            className={`rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${errors.name ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          <ErrorMessage 
            message={errors.name} 
            show={!!errors.name} 
          />
        </div>

        {/* Descrição da Regra */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descrição da Regra
              {errors.description && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Tooltip content="Descreva o objetivo e funcionamento desta regra" />
          </div>
          <div className="relative w-full shadow-sm rounded-md overflow-hidden">
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Digite uma descrição para a regra..."
              rows={3}
              style={{
                fontFamily: 'inherit', 
                fontSize: '14px',
                color: '#374151',
                resize: 'vertical'
              }}
              className={`flex w-full rounded-md border ${
                errors.description ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
              } bg-white px-3 py-2 transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
          </div>
          <ErrorMessage 
            message={errors.description} 
            show={!!errors.description} 
          />
        </div>
      </div>
    </div>
  );
}
