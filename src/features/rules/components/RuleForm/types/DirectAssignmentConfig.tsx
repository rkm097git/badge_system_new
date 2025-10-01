/**
 * DirectAssignmentConfig - Componente para configuração de regras baseadas em atribuição direta.
 * 
 * Permite configurar quais perfis de usuário podem atribuir badges manualmente
 * e definir limites de atribuição por atribuidor.
 * 
 * @component
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip } from "../../ui/Tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorMessage } from "../../ui/ErrorMessage";
import { 
  DirectAssignmentConfig as DirectAssignmentConfigType,
  RuleTypeConfigComponentProps
} from "../../../../types/rule-form-types";

/**
 * Lista de perfis de atribuidor disponíveis
 * Extraído para constante para facilitar manutenção
 */
const ASSIGNER_PROFILES = [
  { 
    value: "professor", 
    label: "Professor",
    description: "Professores das disciplinas"
  },
  { 
    value: "coordinator", 
    label: "Coordenador",
    description: "Coordenadores de curso" 
  },
  { 
    value: "supervisor", 
    label: "Supervisor",
    description: "Supervisores de departamento" 
  }
];

/**
 * Componente de configuração para regras de atribuição direta
 * 
 * @param data - Dados da configuração
 * @param error - Mensagem de erro (legacy)
 * @param errors - Mapa de erros específicos
 * @param onChange - Função para atualizar os dados
 */
export function DirectAssignmentConfig({ 
  data, 
  error, 
  errors, 
  onChange,
  onValidate 
}: RuleTypeConfigComponentProps<DirectAssignmentConfigType>) {
  // Identificação dos erros específicos
  const profilesError = errors?.directAssignmentProfiles || error;
  const limitError = errors?.directAssignmentLimit;

  /**
   * Handler para alternar a seleção de um perfil
   * @param profile - Valor do perfil a ser alternado
   */
  const handleProfileToggle = (profile: string) => {
    const newProfiles = data.assignerProfiles.includes(profile)
      ? data.assignerProfiles.filter(p => p !== profile)
      : [...data.assignerProfiles, profile];

    onChange({
      ...data,
      assignerProfiles: newProfiles
    });
    
    // Se a validação for fornecida e houver correção de um erro, validar
    if (onValidate && profilesError && newProfiles.length > 0) {
      setTimeout(() => onValidate(), 0);
    }
  };

  /**
   * Handler para atualizar o limite de atribuições
   * @param value - Novo valor do limite
   */
  const handleLimitChange = (value: string) => {
    const limit = parseInt(value) || 0;
    
    onChange({
      ...data,
      assignmentLimit: limit
    });
    
    // Se a validação for fornecida e houver correção de um erro, validar
    if (onValidate && limitError && limit >= 0) {
      setTimeout(() => onValidate(), 0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seção de Perfis de Atribuidor */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label id="profiles-group" className="text-sm font-medium text-gray-700">
            Perfis que Podem Atribuir
          </Label>
          <Tooltip content="Selecione quais perfis de usuário podem atribuir este badge manualmente" />
        </div>
        
        {/* Lista de perfis com checkboxes */}
        <div 
          className="space-y-2"
          role="group" 
          aria-labelledby="profiles-group"
          aria-invalid={!!profilesError}
          aria-describedby={profilesError ? "profiles-error" : undefined}
        >
          {ASSIGNER_PROFILES.map(profile => (
            <div key={profile.value} className="flex items-center gap-2">
              <Checkbox
                id={`profile-${profile.value}`}
                checked={data.assignerProfiles.includes(profile.value)}
                onCheckedChange={() => handleProfileToggle(profile.value)}
                className="h-4 w-4 rounded border-gray-300"
                aria-labelledby={`label-${profile.value}`}
              />
              <div>
                <Label
                  htmlFor={`profile-${profile.value}`}
                  id={`label-${profile.value}`}
                  className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700"
                >
                  {profile.label}
                </Label>
                <p className="text-xs text-gray-500 mt-0.5">{profile.description}</p>
              </div>
            </div>
          ))}
          
          {/* Mensagem quando nenhum perfil está disponível (caso extremo) */}
          {ASSIGNER_PROFILES.length === 0 && (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="text-gray-500">Nenhum perfil de atribuidor disponível</p>
            </div>
          )}
        </div>
        
        {/* Mensagem de erro para perfis */}
        <ErrorMessage 
          message={profilesError}
          show={!!profilesError}
        />
      </div>

      {/* Seção de Limite de Atribuições */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label 
            htmlFor="assignmentLimit"
            className="text-sm font-medium text-gray-700"
          >
            Limite de Atribuições por Atribuidor
          </Label>
          <Tooltip content="Número máximo de vezes que cada atribuidor pode conceder este badge (0 = ilimitado)" />
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="assignmentLimit"
            type="number"
            value={data.assignmentLimit}
            onChange={(e) => handleLimitChange(e.target.value)}
            min="0"
            className={`w-24 rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${
              limitError ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
            }`}
            aria-invalid={!!limitError}
            aria-describedby={limitError ? "limit-error" : "limit-help"}
          />
          <span className="text-sm text-gray-500 font-medium">
            badges por atribuidor
          </span>
        </div>
        
        {/* Mensagem de erro ou ajuda para limite */}
        {limitError ? (
          <ErrorMessage message={limitError} />
        ) : (
          <p id="limit-help" className="text-xs text-gray-500 mt-1">
            Use 0 para permitir atribuições ilimitadas
          </p>
        )}
      </div>
    </div>
  );
}
