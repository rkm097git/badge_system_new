/**
 * RuleTypeConfig - Componente que seleciona o subcomponente de configuração correto com base no tipo de regra.
 * 
 * Atua como um router de componentes, carregando a configuração específica para cada
 * tipo de regra selecionado.
 * 
 * @component
 */
import { RuleFormData, RuleFormErrors, RuleType } from "../../types/rule-form-types";
import { PointsRuleConfig } from "./types/PointsRuleConfig";
import { DirectAssignmentConfig } from "./types/DirectAssignmentConfig";
import { EventCountConfig } from "./types/EventCountConfig";
import { RankingConfig } from "./types/RankingConfig";

interface RuleTypeConfigProps {
  /** Tipo da regra selecionado */
  type: RuleType;
  
  /** Dados completos do formulário */
  formData: RuleFormData;
  
  /** Mapa de erros do formulário */
  errors: RuleFormErrors;
  
  /** Função para atualizar campos do formulário */
  onChange: (field: string, value: any) => void;
  
  /** Função para validar o formulário */
  validateForm?: () => void;
  
  /** Flag indicando se o formulário foi submetido */
  formSubmitted?: boolean;
}

/**
 * Renderiza o componente de configuração específico com base no tipo de regra selecionado
 */
export function RuleTypeConfig({ 
  type, 
  formData, 
  errors, 
  onChange, 
  validateForm,
  formSubmitted 
}: RuleTypeConfigProps) {
  // O wrapper div foi simplificado já que o espaçamento é tratado pelo componente pai
  return (
    <div>
      {(() => {
        switch (type) {
          case "points":
            return (
              <PointsRuleConfig
                data={formData.points}
                error={errors.points}
                errors={errors}
                onChange={(value) => onChange("points", value)}
                onValidate={validateForm}
                formSubmitted={formSubmitted}
              />
            );
          case "direct":
            return (
              <DirectAssignmentConfig
                data={formData.directAssignment}
                error={errors.directAssignment}
                errors={errors}
                onChange={(value) => onChange("directAssignment", value)}
              />
            );
          case "events":
            return (
              <EventCountConfig
                data={formData.eventCount}
                error={errors.eventCount}
                errors={errors}
                onChange={(value) => onChange("eventCount", value)}
              />
            );
          case "ranking":
            return (
              <RankingConfig
                data={formData.ranking}
                error={errors.ranking}
                errors={errors}
                onChange={(value) => onChange("ranking", value)}
              />
            );
          default:
            return (
              <div className="p-6 border-2 border-dashed rounded-lg text-center">
                <p className="text-gray-500">Selecione um tipo de regra para ver as opções de configuração</p>
              </div>
            );
        }
      })()}
    </div>
  );
}
