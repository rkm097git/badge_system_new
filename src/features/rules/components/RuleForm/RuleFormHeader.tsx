/**
 * RuleFormHeader - Componente responsável por renderizar o cabeçalho do formulário de regras
 * Exibe o título apropriado baseado se estamos criando ou editando uma regra
 * 
 * @component
 */
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { SafeTitle } from "@/components/ui/safe-title";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface RuleFormHeaderProps {
  /** ID único da regra, presente apenas em modo de edição */
  uid?: string;
  /** URL para redirecionamento ao cancelar ou concluir */
  redirectUrl: string;
}

export function RuleFormHeader({ uid, redirectUrl }: RuleFormHeaderProps) {
  const title = uid ? 'Editar Regra de Atribuição' : 'Nova Regra de Atribuição';
  
  return (
    <CardHeader className="pb-3 border-b border-gray-100">
      <div className="flex items-center mb-4">
        <Link
          href={redirectUrl}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Lista de Regras
        </Link>
      </div>
      <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
        <div className="flex items-center justify-between w-full">
          <SafeTitle>{title}</SafeTitle>
        </div>
      </CardTitle>
    </CardHeader>
  );
}
