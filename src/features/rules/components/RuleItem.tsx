'use client';

import React from 'react';
import { Rule } from '../types';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Trash2 } from 'lucide-react';

interface RuleItemProps {
  rule: Rule;
  index: number;
  onDelete: (uid: string, name: string) => Promise<void>;
  isDeleting: boolean;
  baseUrl: string;
  isAlternate?: boolean;
}

// Componente otimizado com React.memo para evitar re-renderizações desnecessárias
const RuleItem = React.memo(
  ({ rule, index, onDelete, isDeleting, baseUrl, isAlternate = false }: RuleItemProps) => {
    const { toast } = useToast();
    
    // Use useCallback para evitar recriação da função em cada renderização
    const handleDelete = React.useCallback(async () => {
      try {
        await onDelete(rule.uid, rule.name);
      } catch (error) {
        toast({
          title: 'Erro ao excluir regra',
          description: error.message || 'Ocorreu um erro ao excluir a regra.',
          variant: 'destructive',
        });
      }
    }, [rule.uid, rule.name, onDelete, toast]);
    
    return (
      <TableRow className={isAlternate ? 'bg-gray-50' : ''}>
        <TableCell className="text-center text-sm text-muted-foreground py-2">
          {index}
        </TableCell>
        <TableCell className="font-medium py-2">{rule.name}</TableCell>
        <TableCell className="py-2">
          {rule.type === 'points' && 'Pontuação'}
          {rule.type === 'direct' && 'Atribuição Direta'}
          {rule.type === 'events' && 'Contagem de Eventos'}
          {rule.type === 'ranking' && 'Posição em Ranking'}
        </TableCell>
        <TableCell className="py-2">
          {rule.context?.type === 'course' && 'Curso'}
          {rule.context?.type === 'department' && 'Departamento'}
          {rule.context?.type === 'campus' && 'Campus'}
          {!rule.context?.type && '-'}
        </TableCell>
        <TableCell className="py-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
              ${
                rule.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : rule.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
          >
            {rule.status === 'active' && 'Ativo'}
            {rule.status === 'draft' && 'Rascunho'}
            {rule.status === 'inactive' && 'Inativo'}
          </span>
        </TableCell>
        <TableCell className="text-center py-2">
          <div className="flex justify-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" asChild className="h-7 w-7">
              <Link href={`${baseUrl}/${rule.uid}`} aria-label="Editar">
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-100 h-7 w-7"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  },
  // Função de comparação personalizada para otimizar ainda mais o memo
  (prevProps, nextProps) => {
    // Só re-renderiza se alguma dessas propriedades mudarem
    return (
      prevProps.rule.uid === nextProps.rule.uid &&
      prevProps.rule.name === nextProps.rule.name &&
      prevProps.rule.type === nextProps.rule.type &&
      prevProps.rule.status === nextProps.rule.status &&
      prevProps.rule.context?.type === nextProps.rule.context?.type &&
      prevProps.isDeleting === nextProps.isDeleting &&
      prevProps.index === nextProps.index &&
      prevProps.isAlternate === nextProps.isAlternate
    );
  }
);

// Display name para ferramentas de desenvolvimento
RuleItem.displayName = 'RuleItem';

export default RuleItem;
