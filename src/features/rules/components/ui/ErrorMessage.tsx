/**
 * ErrorMessage - Componente para exibição padronizada de mensagens de erro
 * Utilizado em todos os campos de formulário para manter consistência visual
 * 
 * @component
 */
import React from "react";

interface ErrorMessageProps {
  /** Mensagem de erro a ser exibida */
  message?: string;
  /** Flag para controlar se o erro deve ser exibido */
  show?: boolean;
}

export function ErrorMessage({ message, show = true }: ErrorMessageProps) {
  if (!message || !show) return null;
  
  return (
    <p className="text-sm text-red-500 mt-1 font-medium">
      {message}
    </p>
  );
}
