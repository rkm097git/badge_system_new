/**
 * EventCountConfig - Componente para configuração de regras baseadas em contagem de eventos.
 * 
 * Permite configurar regras que atribuem badges com base na frequência de ocorrência de eventos,
 * incluindo configurações de período, streak e quantidade mínima.
 * 
 * @component
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
import { ErrorMessage } from "../../ui/ErrorMessage";
import { 
  EventCountConfig as EventCountConfigType,
  RuleTypeConfigComponentProps
} from "../../../../types/rule-form-types";

/**
 * Lista de tipos de eventos disponíveis para contagem
 */
const EVENT_TYPES = [
  { value: "login", label: "Login na Plataforma", description: "Registra cada acesso à plataforma" },
  { value: "content_access", label: "Acesso a Conteúdo", description: "Registra visualizações de conteúdo" },
  { value: "forum_post", label: "Postagem em Fórum", description: "Registra participações em fóruns" },
  { value: "quiz_completion", label: "Conclusão de Quiz", description: "Registra conclusões de questionários" }
];

/**
 * Mapeamento de rótulos para tipos de período 
 * Usado para exibição das unidades de tempo em linguagem natural
 */
const PERIOD_LABELS = {
  day: { singular: "dia", plural: "dias" },
  week: { singular: "semana", plural: "semanas" },
  month: { singular: "mês", plural: "meses" },
  year: { singular: "ano", plural: "anos" }
};

/**
 * Componente de configuração para regras de contagem de eventos
 * 
 * @param data - Dados da configuração
 * @param error - Mensagem de erro (legacy)
 * @param errors - Mapa de erros específicos
 * @param onChange - Função para atualizar os dados
 * @param onValidate - Função para validar o formulário
 */
export function EventCountConfig({ 
  data, 
  error, 
  errors, 
  onChange,
  onValidate
}: RuleTypeConfigComponentProps<EventCountConfigType>) {
  /**
   * Atualiza o tipo de evento selecionado
   * @param value - Novo valor do tipo de evento
   */
  const handleEventTypeChange = (value: string) => {
    onChange({
      ...data,
      eventType: value
    });
    
    // Se a validação for fornecida e houver correção de um erro, validar
    if (onValidate && error && value) {
      setTimeout(() => onValidate(), 0);
    }
  };
  
  /**
   * Atualiza o número mínimo de ocorrências
   * @param value - Novo valor de ocorrências mínimas
   */
  const handleMinOccurrencesChange = (value: string) => {
    const minOccurrences = parseInt(value) || 1;
    onChange({
      ...data,
      minOccurrences: minOccurrences < 1 ? 1 : minOccurrences
    });
    
    if (onValidate && error) {
      setTimeout(() => onValidate(), 0);
    }
  };
  
  /**
   * Atualiza o streak necessário
   * @param value - Novo valor de streak
   */
  const handleStreakChange = (value: string) => {
    const streak = parseInt(value) || 0;
    onChange({
      ...data,
      requiredStreak: streak < 0 ? 0 : streak
    });
  };
  
  /**
   * Atualiza o tipo de período
   * @param value - Novo tipo de período
   */
  const handlePeriodTypeChange = (value: "day" | "week" | "month" | "year") => {
    onChange({
      ...data,
      periodType: value
    });
  };
  
  /**
   * Atualiza a quantidade de períodos
   * @param value - Novo valor de quantidade de períodos
   */
  const handlePeriodValueChange = (value: string) => {
    const periodValue = parseInt(value) || 1;
    onChange({
      ...data,
      periodValue: periodValue < 1 ? 1 : periodValue
    });
  };

  /**
   * Gera uma descrição em linguagem natural da regra configurada
   * @returns String com a descrição da regra ou null se não houver dados suficientes
   */
  const getRuleDescription = () => {
    if (!data.eventType || !data.periodType) return null;
    
    const eventCount = `${data.minOccurrences} ${data.minOccurrences === 1 ? "vez" : "vezes"}`;
    const periodLabel = PERIOD_LABELS[data.periodType];
    const periodCount = `${data.periodValue} ${data.periodValue === 1 ? periodLabel.singular : periodLabel.plural}`;
    const isConsecutive = data.requiredStreak > 0;
    const consecutiveLabel = data.periodValue === 1 
      ? ` consecutivo${data.periodType === "week" ? "a" : ""}`
      : ` consecutivo${data.periodType === "week" ? "as" : "s"}`;
    const streakInfo = isConsecutive ? ` (streak de ${data.requiredStreak})` : "";
    
    return (
      `O badge será atribuído quando o evento ocorrer pelo menos ${eventCount} em ${periodCount}` +
      `${isConsecutive ? consecutiveLabel : ""}${streakInfo}`
    );
  };

  // Obter descrição da regra para exibição
  const ruleDescription = getRuleDescription();

  return (
    <div className="space-y-4">
      {/* Seção de Tipo de Evento */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label id="event-type-label" className="text-sm font-medium text-gray-700">
            Tipo de Evento
          </Label>
          <Tooltip content="Selecione qual tipo de evento será monitorado" />
        </div>
        <Select
          value={data.eventType}
          onValueChange={handleEventTypeChange}
          aria-labelledby="event-type-label"
          aria-invalid={!!error}
          aria-describedby={error ? "event-type-error" : undefined}
        >
          <SelectTrigger className={`bg-white dark:bg-slate-800 text-left rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${
            error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
          }`}>
            <SelectValue placeholder="Selecione o tipo de evento">
              {data.eventType && EVENT_TYPES.find(t => t.value === data.eventType)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800 p-2">
            {EVENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value} className="rounded-md p-3 focus:bg-blue-50 cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{type.label}</span>
                  <span className="text-sm text-gray-500 mt-1">{type.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ErrorMessage message={error} id="event-type-error" />
      </div>

      {/* Seção de Ocorrências e Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Número Mínimo de Ocorrências */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label 
              htmlFor="minOccurrences"
              className="text-sm font-medium text-gray-700"
            >
              Número Mínimo de Ocorrências
            </Label>
            <Tooltip content="Quantidade mínima de vezes que o evento deve ocorrer" />
          </div>
          <Input
            id="minOccurrences"
            type="number"
            value={data.minOccurrences}
            onChange={(e) => handleMinOccurrencesChange(e.target.value)}
            min="1"
            className={`rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${
              error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
            }`}
            aria-invalid={!!error}
          />
        </div>

        {/* Streak Necessário */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label 
              htmlFor="requiredStreak"
              className="text-sm font-medium text-gray-700"
            >
              Streak Necessário
            </Label>
            <Tooltip content="Número de ocorrências consecutivas necessárias (0 para ignorar)" />
          </div>
          <Input
            id="requiredStreak"
            type="number"
            value={data.requiredStreak}
            onChange={(e) => handleStreakChange(e.target.value)}
            min="0"
            className={`rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${
              error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
            }`}
            aria-invalid={!!error}
          />
          <p className="text-xs text-gray-500">
            Use 0 para não exigir ocorrências consecutivas
          </p>
        </div>
      </div>

      {/* Seção de Configuração de Período */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tipo de Período */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label 
              id="period-type-label"
              className="text-sm font-medium text-gray-700"
            >
              Tipo de Período
            </Label>
            <Tooltip content="Intervalo de tempo para contagem dos eventos" />
          </div>
          <Select
            value={data.periodType}
            onValueChange={handlePeriodTypeChange}
            aria-labelledby="period-type-label"
            aria-invalid={!!error}
          >
            <SelectTrigger className={`bg-white dark:bg-slate-800 text-left rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${
              error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
            }`}>
              <SelectValue placeholder="Selecione o período">
                {data.periodType === "day" && "Diário"}
                {data.periodType === "week" && "Semanal"}
                {data.periodType === "month" && "Mensal"}
                {data.periodType === "year" && "Anual"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 p-2">
              <SelectItem value="day" className="rounded-md cursor-pointer">Diário</SelectItem>
              <SelectItem value="week" className="rounded-md cursor-pointer">Semanal</SelectItem>
              <SelectItem value="month" className="rounded-md cursor-pointer">Mensal</SelectItem>
              <SelectItem value="year" className="rounded-md cursor-pointer">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quantidade de Períodos */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label 
              htmlFor="periodValue"
              className="text-sm font-medium text-gray-700"
            >
              Quantidade de Períodos
            </Label>
            <Tooltip content="Número de períodos consecutivos para contagem" />
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="periodValue"
              type="number"
              value={data.periodValue}
              onChange={(e) => handlePeriodValueChange(e.target.value)}
              min="1"
              className={`w-24 rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${
                error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
              }`}
              aria-invalid={!!error}
            />
            <span className="text-sm text-gray-500 font-medium">
              {data.periodType === "day" && (data.periodValue === 1 ? "dia" : "dias")}
              {data.periodType === "week" && (data.periodValue === 1 ? "semana" : "semanas")}
              {data.periodType === "month" && (data.periodValue === 1 ? "mês" : "meses")}
              {data.periodType === "year" && (data.periodValue === 1 ? "ano" : "anos")}
            </span>
          </div>
        </div>
      </div>

      {/* Resumo da Regra */}
      {ruleDescription && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-md mt-4">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Resumo da Regra:</h4>
          <p className="text-sm text-blue-700">
            {ruleDescription}
          </p>
        </div>
      )}
    </div>
  );
}
