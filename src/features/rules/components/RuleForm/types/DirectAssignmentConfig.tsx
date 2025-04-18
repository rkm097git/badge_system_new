/**
 * Componente para configuração de regras baseadas em atribuição direta.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip } from "../../ui/Tooltip";
import { RuleFormData } from "../../../types";

interface DirectAssignmentConfigProps {
  data: RuleFormData["directAssignment"];
  error?: string;
  errors?: Record<string, string>;
  onChange: (data: RuleFormData["directAssignment"]) => void;
}

export function DirectAssignmentConfig({ data, error, errors, onChange }: DirectAssignmentConfigProps) {
  // Identificação dos erros específicos
  const profilesError = errors?.directAssignmentProfiles || error;
  const limitError = errors?.directAssignmentLimit;
  const assignerProfiles = [
    { value: "professor", label: "Professor" },
    { value: "coordinator", label: "Coordenador" },
    { value: "supervisor", label: "Supervisor" }
  ];

  const handleProfileToggle = (profile: string) => {
    const newProfiles = data.assignerProfiles.includes(profile)
      ? data.assignerProfiles.filter(p => p !== profile)
      : [...data.assignerProfiles, profile];

    onChange({
      ...data,
      assignerProfiles: newProfiles
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label>Perfis que Podem Atribuir</Label>
          <Tooltip content="Selecione quais perfis de usuário podem atribuir este badge manualmente" />
        </div>
        <div className="space-y-2">
          {assignerProfiles.map(profile => (
            <div key={profile.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`profile-${profile.value}`}
                checked={data.assignerProfiles.includes(profile.value)}
                onChange={() => handleProfileToggle(profile.value)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label
                htmlFor={`profile-${profile.value}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>{profile.label}</span>
                <span className="text-sm text-muted-foreground">
                  {profile.value === "professor" && "(Professores das disciplinas)"}
                  {profile.value === "coordinator" && "(Coordenadores de curso)"}
                  {profile.value === "supervisor" && "(Supervisores de departamento)"}
                </span>
              </Label>
            </div>
          ))}
        </div>
        {profilesError && (
          <p className="text-sm text-red-500">{profilesError}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="assignmentLimit">Limite de Atribuições por Atribuidor</Label>
          <Tooltip content="Número máximo de vezes que cada atribuidor pode conceder este badge" />
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="assignmentLimit"
            type="number"
            value={data.assignmentLimit}
            onChange={(e) => onChange({
              ...data,
              assignmentLimit: parseInt(e.target.value) || 0
            })}
            min="0"
            className={`w-24 ${limitError ? "border-red-500" : ""}`}
          />
          <span className="text-sm text-muted-foreground">
            badges por atribuidor
          </span>
        </div>
        {limitError ? (
          <p className="text-sm text-red-500">{limitError}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Use 0 para permitir atribuições ilimitadas
          </p>
        )}
      </div>
    </div>
  );
}
