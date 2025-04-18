/**
 * Cliente de API centralizado usando Axios
 * Configura headers padrão, interceptores e tratamento de erros
 */
import axios, { AxiosError } from 'axios';
import { mockRulesApi } from './mockApi';

// Verificar se deve usar mock da API
const USE_MOCK_API = process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sistema-educacional.com';

// Criação da instância do Axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor para adicionar o token de autenticação em cada requisição
api.interceptors.request.use((config) => {
  // Recupera o token do localStorage (ou outro mecanismo de armazenamento)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor para tratamento padronizado de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorResponse = {
      status: error.response?.status,
      message: error.response?.data?.message || 'Ocorreu um erro na comunicação com o servidor',
      data: error.response?.data
    };
    
    // Log do erro (apenas em desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
    // Tratamento de erros específicos
    if (error.response?.status === 401) {
      // Lidar com erro de autenticação (ex: redirecionar para login)
      console.warn('Sessão expirada ou inválida');
      // Exemplo: Router.push('/login');
    }
    
    return Promise.reject(errorResponse);
  }
);

// Implementar seletor de API (real ou mock)
const isRulesEndpoint = (url: string) => url.startsWith('/v1/rules');

/**
 * Wrapper para fazer requisições GET com parâmetros de consulta padronizados
 */
export const apiGet = async <T>(url: string, params?: Record<string, any>): Promise<T> => {
  // Usar mock API se habilitado e for endpoint suportado
  if (USE_MOCK_API) {
    console.log(`[Mock API] GET ${url}`, params);
    
    // Roteamento para endpoints mockados
    if (isRulesEndpoint(url)) {
      const ruleId = url.match(/\/v1\/rules\/([^\/]+)/)?.[1];
      if (ruleId) {
        return mockRulesApi.getRule(ruleId) as any;
      } else {
        return mockRulesApi.getRules(params) as any;
      }
    }
  }
  
  // Caso contrário, usar API real
  const response = await api.get<T>(url, { params });
  return response.data;
};

/**
 * Wrapper para fazer requisições POST
 */
export const apiPost = async <T>(url: string, data?: any): Promise<T> => {
  // Usar mock API se habilitado e for endpoint suportado
  if (USE_MOCK_API) {
    console.log(`[Mock API] POST ${url}`, data);
    
    // Roteamento para endpoints mockados
    if (isRulesEndpoint(url)) {
      return mockRulesApi.createRule(data) as any;
    }
  }
  
  // Caso contrário, usar API real
  const response = await api.post<T>(url, data);
  return response.data;
};

/**
 * Wrapper para fazer requisições PUT
 */
export const apiPut = async <T>(url: string, data?: any): Promise<T> => {
  // Mock API não implementado para PUT
  
  // Usar API real
  const response = await api.put<T>(url, data);
  return response.data;
};

/**
 * Wrapper para fazer requisições PATCH
 */
export const apiPatch = async <T>(url: string, data?: any): Promise<T> => {
  // Usar mock API se habilitado e for endpoint suportado
  if (USE_MOCK_API) {
    console.log(`[Mock API] PATCH ${url}`, data);
    
    // Roteamento para endpoints mockados
    if (isRulesEndpoint(url)) {
      const ruleId = url.match(/\/v1\/rules\/([^\/]+)/)?.[1];
      if (ruleId) {
        return mockRulesApi.updateRule(ruleId, data) as any;
      }
    }
  }
  
  // Caso contrário, usar API real
  const response = await api.patch<T>(url, data);
  return response.data;
};

/**
 * Wrapper para fazer requisições DELETE
 */
export const apiDelete = async <T>(url: string): Promise<T> => {
  // Usar mock API se habilitado e for endpoint suportado
  if (USE_MOCK_API) {
    console.log(`[Mock API] DELETE ${url}`);
    
    // Roteamento para endpoints mockados
    if (isRulesEndpoint(url)) {
      const ruleId = url.match(/\/v1\/rules\/([^\/]+)/)?.[1];
      if (ruleId) {
        return mockRulesApi.deleteRule(ruleId) as any;
      }
    }
  }
  
  // Caso contrário, usar API real
  const response = await api.delete<T>(url);
  return response.data;
};

export default api;
