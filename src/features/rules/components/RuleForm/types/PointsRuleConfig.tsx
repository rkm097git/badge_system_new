/**
 * PointsRuleConfig - Componente para configuração de regras baseadas em pontuação.
 * 
 * Permite configurar regras que atribuem badges baseados em um sistema de pontos,
 * definindo pontuação mínima necessária e tipos de eventos que contribuem para essa pontuação.
 * 
 * @component
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Tooltip } from "../../ui/Tooltip";
import { ErrorMessage } from "../../ui/ErrorMessage";
import { 
  PointsRuleConfig as PointsRuleConfigType, 
  RuleFormErrors,
  RuleTypeConfigComponentProps
} from "../../../../types/rule-form-types";

// Lista de tipos de eventos disponíveis
const EVENT_TYPES = [
  { value: "login", label: "Login na Plataforma", description: "Registra cada acesso à plataforma" },
  { value: "content_access", label: "Acesso a Conteúdo", description: "Registra visualizações de conteúdo" },
  { value: "forum_post", label: "Postagem em Fórum", description: "Registra participações em fóruns" },
  { value: "quiz_completion", label: "Conclusão de Quiz", description: "Registra conclusões de questionários" }
];

/**
 * Componente de configuração para regras baseadas em pontuação
 */
export function PointsRuleConfig({ 
  data, 
  error, 
  errors, 
  onChange, 
  onValidate,
  formSubmitted 
}: RuleTypeConfigComponentProps<PointsRuleConfigType>) {
  // Efeito para validar quando o erro muda
  useEffect(() => {
    if (error && onValidate) {
      onValidate();
    }
  }, [error, onValidate]);

  // Handlers
  const addEvent = () => {
    onChange({
      ...data,
      events: [
        ...data.events,
        { type: "", weight: 1 }
      ]
    });
  };

  const removeEvent = (index: number) => {
    onChange({
      ...data,
      events: data.events.filter((_, i) => i !== index)
    });
  };

  const updateEventType = (index: number, type: string) => {
    const newEvents = [...data.events];
    newEvents[index] = { ...data.events[index], type };
    onChange({
      ...data,
      events: newEvents
    });
    
    // Se estiver mudando de vazio para um valor, e houver erro, revalidar
    if (!data.events[index].type && type && error && onValidate) {
      setTimeout(() => onValidate(), 0);
    }
  };

  const updateEventWeight = (index: number, weight: number) => {
    const newEvents = [...data.events];
    newEvents[index] = { ...data.events[index], weight };
    onChange({
      ...data,
      events: newEvents
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="minPoints">Pontuação Mínima Total</Label>
          <Tooltip content="Quantidade mínima de pontos necessária para receber o badge" />
        </div>
        <Input
          id="minPoints"
          type="number"
          value={data.minPoints}
          onChange={(e) => onChange({
            ...data,
            minPoints: parseInt(e.target.value) || 0
          })}
          className={`rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${errors?.pointsMinPoints ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
          aria-invalid={!!errors?.pointsMinPoints}
          aria-describedby={errors?.pointsMinPoints ? "minPoints-error" : undefined}
        />
        <ErrorMessage message={errors?.pointsMinPoints} />
      </div>

      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center">
            <Label>Tipos de Eventos Considerados</Label>
            <Tooltip content="Eventos que contribuem para a pontuação total" />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEvent}
            className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 shadow-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Evento
          </Button>
        </div>
        <div className="space-y-2">
          {data.events.map((event, index) => (
            <div key={index} className="relative p-4 sm:p-5 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200">
              {/* Botão de exclusão posicionado no canto superior direito */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeEvent(index)}
                className="absolute top-2 right-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 hover:text-red-600 transition-all duration-200"
                aria-label="Remover evento"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex-1 space-y-4 w-full pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tipo de Evento</Label>
                  <Select
                    value={event.type}
                    onValueChange={(value) => updateEventType(index, value)}
                  >
                    <SelectTrigger 
                      className={`bg-white dark:bg-gray-800 text-left rounded-md shadow-sm transition-all duration-150 ${
                        (!event.type && error) || 
                        (errors && errors[`points.events.${index}.type`]) || 
                        (formSubmitted && !event.type) 
                          ? 'border-red-500 ring-red-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      aria-invalid={!event.type && (!!error || formSubmitted)}
                      aria-describedby={!event.type && (!!error || formSubmitted) ? `event-${index}-type-error` : undefined}
                    >
                      <SelectValue placeholder="Selecione o tipo de evento">
                        {event.type && EVENT_TYPES.find(t => t.value === event.type)?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 p-2">
                      {EVENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value} className="rounded-md p-3 focus:bg-blue-50 cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{type.label}</span>
                            <span className="text-sm text-gray-500 mt-1">
                              {type.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {((!event.type && error) || 
                    (errors && errors[`points.events.${index}.type`]) ||
                    (formSubmitted && !event.type)) && (
                    <ErrorMessage
                      message="Tipo de evento é obrigatório"
                      show={true}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium text-gray-700">Peso do Evento</Label>
                    <Tooltip content="Multiplicador de pontos para este tipo de evento" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="number"
                      value={event.weight}
                      onChange={(e) => updateEventWeight(index, parseFloat(e.target.value) || 0)}
                      className="w-full sm:w-24 rounded-md shadow-sm transition-all duration-150 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300"
                      min="0.1"
                      step="0.1"
                      aria-label="Peso do evento"
                    />
                    <span className="text-sm text-gray-500 font-medium">
                      pontos por ocorrência
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {data.events.length === 0 && (
            <div className="text-center p-6 border-2 border-dashed rounded-lg text-gray-500 bg-gray-50 transition-all duration-200 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="font-medium">Nenhum evento configurado</p>
                <p className="text-sm text-gray-400">Clique em "Adicionar Evento" para começar</p>
              </div>
            </div>
          )}
          {errors?.pointsEvents && (
            <ErrorMessage message={errors.pointsEvents} />
          )}
        </div>
      </div>
    </div>
  );
}
