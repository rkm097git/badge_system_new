/**
 * Configuração do React Query para gerenciamento de estado e cache
 */
import { QueryClient } from '@tanstack/react-query';

// Instância do QueryClient com configurações padrão
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Não recarregar dados quando a janela recebe foco
      retry: 1,                    // Tentar novamente apenas uma vez em caso de falha
      staleTime: 5 * 60 * 1000,    // 5 minutos até os dados serem considerados obsoletos
      cacheTime: 10 * 60 * 1000,   // 10 minutos de cache antes da limpeza da memória
    },
  },
});
