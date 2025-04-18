'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';

/**
 * Provedor global de dependências da aplicação
 * Encapsula todos os providers necessários (React Query, etc.)
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
