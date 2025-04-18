/**
 * Componente para configuração de regras baseadas em posição em ranking.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Tooltip } from "../../ui/Tooltip";
import { RuleFormData } from "../../../types";

interface RankingConfigProps {
  data: RuleFormData["ranking"];
  error?: string;
  onChange: (data: RuleFormData["ranking"]) => void;
}

export function RankingConfig({ data, error, onChange }: RankingConfigProps) {
  const availableRankings = [
    { id: "1", name: "Alunos mais assíduos" },
    { id: "2", name: "Melhores notas" },
    { id: "3", name: "Participação em fóruns" }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label>Ranking</Label>
          <Tooltip content="Selecione o ranking que será usado como base para atribuição" />
        </div>
        <Select
          value={data.rankingId}
          onValueChange={(value) => onChange({
            ...data,
            rankingId: value
          })}
        >
          <SelectTrigger className={`bg-white dark:bg-gray-800 text-left ${error ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Selecione o ranking">
              {data.rankingId && (() => {
                const rankingMap = {
                  "1": "Alunos mais assíduos",
                  "2": "Melhores notas",
                  "3": "Participação em fóruns"
                };
                return rankingMap[data.rankingId];
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800">
            {availableRankings.map(ranking => (
              <SelectItem key={ranking.id} value={ranking.id}>
                <div className="flex flex-col">
                  <span>{ranking.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {ranking.id === "1" && "Classifica alunos por frequência de acesso"}
                    {ranking.id === "2" && "Classifica alunos por desempenho acadêmico"}
                    {ranking.id === "3" && "Classifica alunos por engajamento em discussões"}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="requiredPosition">Posição Necessária</Label>
          <Tooltip content="Posição mínima no ranking para receber o badge" />
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="requiredPosition"
            type="number"
            value={data.requiredPosition}
            onChange={(e) => onChange({
              ...data,
              requiredPosition: parseInt(e.target.value) || 1
            })}
            min="1"
            className={`w-24 ${error ? "border-red-500" : ""}`}
          />
          <span className="text-sm text-muted-foreground">
            lugar ou melhor
          </span>
        </div>
      </div>

      {data.rankingId && data.requiredPosition > 0 && (
        <p className="text-sm text-muted-foreground">
          O badge será atribuído aos alunos que alcançarem a {data.requiredPosition}ª posição ou melhor no ranking de {availableRankings.find(r => r.id === data.rankingId)?.name.toLowerCase()}
        </p>
      )}
    </div>
  );
}
