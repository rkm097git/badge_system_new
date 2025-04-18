/**
 * Componente que seleciona o subcomponente de configuração correto com base no tipo de regra.
 */
import { RuleFormData, RuleFormErrors } from "../../types";
import { PointsRuleConfig } from "./types/PointsRuleConfig";
import { DirectAssignmentConfig } from "./types/DirectAssignmentConfig";
import { EventCountConfig } from "./types/EventCountConfig";
import { RankingConfig } from "./types/RankingConfig";

interface RuleTypeConfigProps {
  type: string;
  formData: RuleFormData;
  errors: RuleFormErrors;
  onChange: (field: string, value: any) => void;
  validateForm?: () => void;
  formSubmitted?: boolean;
}

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
                onChange={(value) => onChange("eventCount", value)}
              />
            );
          case "ranking":
            return (
              <RankingConfig
                data={formData.ranking}
                error={errors.ranking}
                onChange={(value) => onChange("ranking", value)}
              />
            );
          default:
            return null;
        }
      })()}
    </div>
  );
}
