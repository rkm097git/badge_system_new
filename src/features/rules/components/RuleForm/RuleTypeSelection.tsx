/**
 * Componente para seleção do tipo de regra.
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

interface RuleTypeSelectionProps {
  value: string;
  error?: string;
  onChange: (value: "" | "points" | "direct" | "events" | "ranking") => void;
}

export function RuleTypeSelection({ value, error, onChange }: RuleTypeSelectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label htmlFor="type" className="text-sm font-medium text-gray-700">Tipo de Regra</Label>
        <Tooltip content="Selecione como esta regra irá atribuir badges" />
      </div>
      <Select
        value={value}
        onValueChange={(value: "" | "points" | "direct" | "events" | "ranking") => 
          onChange(value)
        }
      >
        <SelectTrigger className={`bg-white dark:bg-slate-800 text-left rounded-md shadow-sm transition-all duration-150 ${error ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`}>
          <SelectValue placeholder="Selecione o tipo de regra">
            {value && (() => {
              const typeLabels = {
                points: "Pontuação",
                direct: "Atribuição Direta",
                events: "Contagem de Eventos",
                ranking: "Posição em Ranking"
              };
              return typeLabels[value as keyof typeof typeLabels];
            })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-800 p-2">
          <SelectItem value="points" className="rounded-md p-3 focus:bg-blue-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">Pontuação</span>
              <span className="text-sm text-gray-500 mt-1">Atribui com base em pontos acumulados</span>
            </div>
          </SelectItem>
          <SelectItem value="direct" className="rounded-md p-3 focus:bg-blue-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">Atribuição Direta</span>
              <span className="text-sm text-gray-500 mt-1">Permite que perfis específicos atribuam manualmente</span>
            </div>
          </SelectItem>
          <SelectItem value="events" className="rounded-md p-3 focus:bg-blue-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">Contagem de Eventos</span>
              <span className="text-sm text-gray-500 mt-1">Atribui baseado na frequência de eventos</span>
            </div>
          </SelectItem>
          <SelectItem value="ranking" className="rounded-md p-3 focus:bg-blue-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">Posição em Ranking</span>
              <span className="text-sm text-gray-500 mt-1">Atribui com base na posição em rankings</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
