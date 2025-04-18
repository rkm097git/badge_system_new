  );
};
```

## 8. Testes e Validação

### 8.1 Testes de Integração

Para garantir que a integração esteja funcionando corretamente, é importante implementar testes de integração:

```typescript
// Exemplo de teste de integração usando Jest e MSW
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { QueryClientProvider, QueryClient } from 'react-query';
import { useBadges } from './useBadges';

const server = setupServer(
  rest.get('*/v1/badges', (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            uid: '123',
            name: 'Test Badge',
            // Outros campos...
          }
        ],
        totalCount: 1,
        page: 1,
        pageSize: 10
      })
    );
  })
);

describe('useBadges hook', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should fetch badges successfully', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useBadges(), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(result.current.badges).toHaveLength(1);
    expect(result.current.badges[0].name).toBe('Test Badge');
  });
});
```

### 8.2 Validação de Tipos

Para garantir que os tipos TypeScript correspondam aos modelos C#, implemente validações de esquema usando Zod:

```typescript
import { z } from 'zod';

// Definição do esquema para Badge
const badgeSchema = z.object({
  uid: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string(),
  isEnabled: z.boolean(),
  isHidden: z.boolean(),
  registerConfig: z.object({
    authorizeRegisterType: z.number(),
    expireAfterAt: z.string().datetime().nullable(),
    expireAt: z.string().datetime().nullable(),
    maxUsers: z.number().nullable(),
    requiredPoints: z.number().nullable()
  }),
  // Outros campos...
});

// Uso do esquema para validação
function validateBadge(data: unknown): Badge {
  return badgeSchema.parse(data);
}
```

## 9. Conectores Personalizados

### 9.1 Criação de Conector de Badge

Para implementar funcionalidades específicas, pode ser necessário criar um conector personalizado no backend C#:

```csharp
public class BadgeConnector : SpecificationConnector, IConnectorBadge
{
    [Specification(Property = "badge_config", Description = "Configuração do sistema de badges", IsRequired = false)]
    public string BadgeConfig { get; set; }

    public async Task<IBadge> CreateBadge(IBadge badge)
    {
        // Implementação...
    }

    public async Task<List<IBadge>> GetUserBadges(Guid userUid)
    {
        // Implementação...
    }

    // Outros métodos...
}
```

### 9.2 Registro do Conector

O conector deve ser registrado no diretório ou projeto para ser utilizado:

```csharp
// Exemplo de registro de conector (pseudocódigo)
var connector = new ConnectorConfig
{
    Name = "Badge Connector",
    Description = "Conector para gerenciamento de badges",
    Type = typeof(BadgeConnector).AssemblyQualifiedName,
    Configuration = new Dictionary<string, string>
    {
        ["badge_config"] = JsonConvert.SerializeObject(badgeDefaultConfig)
    }
};

await directoryService.RegisterConnector(directoryUid, connector);
```

### 9.3 Uso do Conector no Frontend

O frontend pode precisar se adaptar conforme o conector disponível:

```typescript
// Verificar se o conector de badges está disponível
const checkBadgeConnector = async () => {
  try {
    const connectors = await api.get('/v1/connectors');
    const badgeConnector = connectors.data.find(
      c => c.type === 'BadgeConnector'
    );
    
    return !!badgeConnector;
  } catch (error) {
    console.error('Erro ao verificar conectores:', error);
    return false;
  }
};
```

## 10. Implantação e Configuração

### 10.1 Variáveis de Ambiente

O frontend deve ser configurado com as seguintes variáveis de ambiente:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.sistema-educacional.com
NEXT_PUBLIC_BADGE_FEATURE_ENABLED=true
```

### 10.2 Configuração para Diferentes Ambientes

Para suportar ambientes de desenvolvimento, homologação e produção:

```typescript
// src/config/environments.ts
type Environment = 'development' | 'staging' | 'production';

const env: Environment = (process.env.NEXT_PUBLIC_ENV as Environment) || 'development';

const configs = {
  development: {
    apiUrl: 'http://localhost:7071',
    badgeFeatureEnabled: true,
  },
  staging: {
    apiUrl: 'https://api-staging.sistema-educacional.com',
    badgeFeatureEnabled: true,
  },
  production: {
    apiUrl: 'https://api.sistema-educacional.com',
    badgeFeatureEnabled: process.env.NEXT_PUBLIC_BADGE_FEATURE_ENABLED === 'true',
  },
};

export default configs[env];
```

### 10.3 Monitoramento e Logs

Implemente monitoramento para detectar problemas na integração:

```typescript
// src/services/monitoring.ts
import * as Sentry from '@sentry/react';

export const initMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_ENV,
      tracesSampleRate: 0.5,
    });
  }
};

export const logApiError = (error: unknown, context?: Record<string, any>) => {
  console.error('API Error:', error);
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: { component: 'api' },
      extra: context,
    });
  }
};
```

## 11. Troubleshooting

### 11.1 Problemas Comuns

| Problema | Possível Causa | Solução |
|----------|----------------|---------|
| 401 Unauthorized | Token expirado ou inválido | Renovar token ou redirecionar para login |
| 403 Forbidden | Usuário sem permissão | Verificar permissões no diretório/projeto |
| Badge não aparece após criação | Cache desatualizado | Invalidar cache ou forçar refresh |
| Falha ao atribuir badge | Regra não satisfeita | Verificar requisitos da badge |

### 11.2 Depuração

Para facilitar a depuração da integração:

```typescript
// src/utils/debug.ts
export const enableApiDebug = () => {
  if (process.env.NODE_ENV !== 'production') {
    window.localStorage.setItem('debug_api', 'true');
  }
};

export const logApiRequest = (config: any) => {
  if (window.localStorage.getItem('debug_api') === 'true') {
    console.group(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    console.log('Headers:', config.headers);
    console.log('Params:', config.params);
    console.log('Data:', config.data);
    console.groupEnd();
  }
  return config;
};

// Ativar no interceptor
api.interceptors.request.use(logApiRequest);
```

## 12. Recursos Adicionais

### 12.1 Exemplos de Código

GitHub fornece exemplos práticos de integração:
- [Exemplo de Lista de Badges](https://github.com/example/badges-list)
- [Exemplo de Formulário de Badge](https://github.com/example/badge-form)

### 12.2 Documentação da API C#

A documentação completa da API está disponível em:
- Documentação interna: `/Users/ricardokawasaki/Desktop/csharp_interface_api/doc`

### 12.3 Ferramentas Úteis

- [Postman Collection](https://example.postman.com/badges-api) - Para testar endpoints
- [Swagger UI](https://api.sistema-educacional.com/swagger) - Documentação interativa
- [JWT Debugger](https://jwt.io) - Para inspecionar tokens JWT

---

**Autor**: Ricardo Kawasaki  
**Última Atualização**: 08/04/2025  
**Versão**: 1.0.0  
**Revisão**: 1
