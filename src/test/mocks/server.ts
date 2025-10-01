/**
 * Configuração do servidor MSW para testes
 * 
 * Define o servidor mock do MSW para interceptar e responder às requisições HTTP durante testes.
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configuração do servidor com os handlers
export const server = setupServer(...handlers);
