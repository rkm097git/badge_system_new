/**
 * Componente para seleção do contexto de aplicação da regra.
 */
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip } from "../ui/Tooltip";
import { RuleFormData } from "../../types";

interface RuleContextSelectionProps {
  context: RuleFormData["context"];
  error?: string;
  onChange: (context: RuleFormData["context"]) => void;
}

export function RuleContextSelection({ context, error, onChange }: RuleContextSelectionProps) {
  // Opções para os selects
  const contextOptions = {
    course: [
      { id: "1", name: "Engenharia de Software" },
      { id: "2", name: "Ciência da Computação" },
      { id: "3", name: "Sistemas de Informação" }
    ],
    department: [
      { id: "1", name: "Departamento de Computação" },
      { id: "2", name: "Departamento de Engenharia" }
    ],
    campus: [
      { id: "1", name: "Campus Central" },
      { id: "2", name: "Campus Norte" },
      { id: "3", name: "Campus Sul" }
    ]
  };

  const handleContextItemToggle = (itemId: string) => {
    onChange({
      ...context,
      items: context.items.includes(itemId)
        ? context.items.filter(id => id !== itemId)
        : [...context.items, itemId]
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Label className="text-sm font-medium text-gray-700">Contexto de Aplicação</Label>
            <Tooltip content="Define em quais contextos esta regra será aplicada" />
          </div>
          {context.type && (
            <p className="text-sm text-blue-600 font-medium">
              {context.items.length} {context.type === "course" ? "curso(s)" : context.type === "department" ? "departamento(s)" : "campus"} selecionado(s)
            </p>
          )}
        </div>
        <Select
          value={context.type}
          onValueChange={(value: RuleFormData["context"]["type"]) => 
            onChange({
              type: value,
              items: []
            })
          }
        >
          <SelectTrigger className={`bg-white dark:bg-slate-800 text-left rounded-md shadow-sm transition-all duration-150 ${error ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`}>
            <SelectValue placeholder="Selecione o tipo de contexto">
              {context.type && (() => {
                const contextLabels = {
                  course: "Cursos",
                  department: "Departamentos",
                  campus: "Campus"
                };
                return contextLabels[context.type];
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800">
            <SelectItem value="course">
              <div className="flex flex-col">
                <span>Cursos</span>
                <span className="text-sm text-muted-foreground">Aplicar em cursos específicos</span>
              </div>
            </SelectItem>
            <SelectItem value="department">
              <div className="flex flex-col">
                <span>Departamentos</span>
                <span className="text-sm text-muted-foreground">Aplicar em departamentos específicos</span>
              </div>
            </SelectItem>
            <SelectItem value="campus">
              <div className="flex flex-col">
                <span>Campus</span>
                <span className="text-sm text-muted-foreground">Aplicar em campus específicos</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {context.type && (
        <div className="space-y-3 mt-4">
          <Label className="text-sm font-medium text-gray-700">Selecione os itens do contexto</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 w-full">
            {contextOptions[context.type]?.map(item => (
              <div
                key={item.id}
                className={`
                  flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-150 shadow-sm hover:shadow
                  ${context.items.includes(item.id)
                    ? "bg-blue-50 border-blue-300 shadow-inner"
                    : "bg-white hover:bg-gray-50 border-gray-200"}
                `}
                onClick={() => handleContextItemToggle(item.id)}
              >
                <div className={`w-5 h-5 flex items-center justify-center border rounded ${context.items.includes(item.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                  {context.items.includes(item.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
                <Label
                  htmlFor={`context-${item.id}`}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {item.name}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Se nenhum item for selecionado, a regra será aplicada a todos.
          </p>
        </div>
      )}
    </div>
  );
}
