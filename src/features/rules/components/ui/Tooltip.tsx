/**
 * Componente reutilizável para tooltips com ícone de ajuda.
 * Encapsula o padrão de tooltip utilizado em toda a aplicação.
 */
import { HelpCircle } from "lucide-react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
}

export function Tooltip({ content }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="right"
            align="center"
            sideOffset={5}
            className="z-[100] overflow-hidden max-w-[250px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-current text-white dark:text-slate-800" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
