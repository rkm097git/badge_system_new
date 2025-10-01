/**
 * Utilitários para testes de componentes React
 * 
 * Este arquivo fornece funções e wrappers de teste para facilitar os testes de componentes React,
 * especialmente aqueles que dependem de contextos, providers ou hooks complexos.
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Tipo para os retornos das funções de testes
export interface TestRenderResult {
  user: ReturnType<typeof userEvent.setup>;
  [key: string]: any;
}

/**
 * Cria um QueryClient customizado para testes
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });
}

/**
 * Provider com os contextos necessários para os testes
 */
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

function AllProviders({ 
  children, 
  queryClient = createTestQueryClient() 
}: AllProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Função de renderização customizada que inclui os providers
 * @param ui - Componente React a ser renderizado
 * @param options - Opções de renderização
 * @returns Objeto com resultados da renderização e utilitários
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { 
    queryClient?: QueryClient,
    routePath?: string
  }
): TestRenderResult {
  const {
    queryClient,
    ...renderOptions
  } = options || {};

  // Configurar userEvent
  const user = userEvent.setup();

  return {
    user,
    ...render(ui, {
      wrapper: (props) => (
        <AllProviders queryClient={queryClient} {...props} />
      ),
      ...renderOptions,
    }),
  };
}

/**
 * Mock de uma função onChange para testes de componentes controlados
 * @returns Um objeto contendo a função mock e o último valor capturado
 */
function createControlledOnChange() {
  let lastValue: any = undefined;
  const onChange = jest.fn((value) => {
    lastValue = value;
  });

  return {
    onChange,
    getLastValue: () => lastValue,
  };
}

// Exportar funções e métodos úteis para testes
export * from '@testing-library/react';
export { customRender as render, createControlledOnChange };
