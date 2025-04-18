/**
 * Componente para configuração de regras baseadas em contagem de eventos.
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

interface EventCountConfigProps {
  data: RuleFormData["eventCount"];
  error?: string;
  onChange: (data: RuleFormData["eventCount"]) => void;
}

export function EventCountConfig({ data, error, onChange }: EventCountConfigProps) {
  const eventTypes = [
    { value: "login", label: "Login na Plataforma" },
    { value: "content_access", label: "Acesso a Conteúdo" },
    { value: "forum_post", label: "Postagem em Fórum" },
    { value: "quiz_completion", label: "Conclusão de Quiz" }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label>Tipo de Evento</Label>
          <Tooltip content="Selecione qual tipo de evento será monitorado" />
        </div>
        <Select
          value={data.eventType}
          onValueChange={(value) => onChange({
            ...data,
            eventType: value
          })}
        >
          <SelectTrigger className={`bg-white dark:bg-slate-800 text-left ${error ? "border-destructive" : ""}`}>
            <SelectValue placeholder="Selecione o tipo de evento">
              {data.eventType && (() => {
                const eventLabels = {
                  login: "Login na Plataforma",
                  content_access: "Acesso a Conteúdo",
                  forum_post: "Postagem em Fórum",
                  quiz_completion: "Conclusão de Quiz"
                };
                return eventLabels[data.eventType];
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800">
            {eventTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex flex-col">
                  <span>{type.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {type.value === "login" && "Registra cada acesso à plataforma"}
                    {type.value === "content_access" && "Registra visualizações de conteúdo"}
                    {type.value === "forum_post" && "Registra participações em fóruns"}
                    {type.value === "quiz_completion" && "Registra conclusões de questionários"}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="minOccurrences">Número Mínimo de Ocorrências</Label>
            <Tooltip content="Quantidade mínima de vezes que o evento deve ocorrer" />
          </div>
          <Input
            id="minOccurrences"
            type="number"
            value={data.minOccurrences}
            onChange={(e) => onChange({
              ...data,
              minOccurrences: parseInt(e.target.value) || 0
            })}
            min="1"
            className={error ? "border-red-500" : ""}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="requiredStreak">Streak Necessário</Label>
            <Tooltip content="Número de ocorrências consecutivas necessárias (0 para ignorar)" />
          </div>
          <Input
            id="requiredStreak"
            type="number"
            value={data.requiredStreak}
            onChange={(e) => onChange({
              ...data,
              requiredStreak: parseInt(e.target.value) || 0
            })}
            min="0"
            className={error ? "border-red-500" : ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label>Tipo de Período</Label>
            <Tooltip content="Intervalo de tempo para contagem dos eventos" />
          </div>
          <Select
            value={data.periodType}
            onValueChange={(value: "day" | "week" | "month") => onChange({
              ...data,
              periodType: value
            })}
          >
            <SelectTrigger className={`bg-white dark:bg-slate-800 text-left ${error ? "border-destructive" : ""}`}>
              <SelectValue placeholder="Selecione o período">
                {data.periodType && (() => {
                  const periodLabels = {
                    day: "Diário",
                    week: "Semanal",
                    month: "Mensal"
                  };
                  return periodLabels[data.periodType];
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800">
              <SelectItem value="day">Diário</SelectItem>
              <SelectItem value="week">Semanal</SelectItem>
              <SelectItem value="month">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="periodValue">Quantidade de Períodos</Label>
            <Tooltip content="Número de períodos consecutivos para contagem" />
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="periodValue"
              type="number"
              value={data.periodValue}
              onChange={(e) => onChange({
                ...data,
                periodValue: parseInt(e.target.value) || 1
              })}
              min="1"
              className={`w-24 ${error ? "border-red-500" : ""}`}
            />
            <span className="text-sm text-muted-foreground">
              {data.periodType === "day" && "dias"}
              {data.periodType === "week" && "semanas"}
              {data.periodType === "month" && "meses"}
            </span>
          </div>
        </div>
      </div>

      {data.periodType && (
        <p className="text-sm text-muted-foreground">
          O badge será atribuído quando o evento ocorrer pelo menos{" "}
          {data.minOccurrences} {data.minOccurrences === 1 ? "vez" : "vezes"} em{" "}
          {data.periodValue}{" "}
          {data.periodType === "day" && (data.periodValue === 1 ? "dia" : "dias") + (data.requiredStreak > 0 ? (data.periodValue === 1 ? " consecutivo" : " consecutivos") : "")}
          {data.periodType === "week" && (data.periodValue === 1 ? "semana" : "semanas") + (data.requiredStreak > 0 ? (data.periodValue === 1 ? " consecutiva" : " consecutivas") : "")}
          {data.periodType === "month" && (data.periodValue === 1 ? "mês" : "meses") + (data.requiredStreak > 0 ? (data.periodValue === 1 ? " consecutivo" : " consecutivos") : "")}{" "}
          {data.requiredStreak > 0 && `(streak de ${data.requiredStreak})`}
        </p>
      )}
    </div>
  );
}
