/**
 * API Mock Handlers para testes
 * 
 * Define os handlers para o Mock Service Worker (MSW) simular respostas de API durante os testes.
 */
import { http, HttpResponse } from 'msw';

// Mock de dados para regras
const mockRules = [
  {
    uid: '1',
    name: 'Regra de Pontuação',
    description: 'Uma regra baseada em pontuação',
    type: 'points',
    status: 'active',
    context: {
      type: 'course',
      items: ['1', '2']
    },
    points: {
      minPoints: 100,
      events: [
        { type: 'login', weight: 1 },
        { type: 'content_access', weight: 2 }
      ]
    }
  },
  {
    uid: '2',
    name: 'Regra de Atribuição Direta',
    description: 'Uma regra baseada em atribuição direta',
    type: 'direct',
    status: 'active',
    context: {
      type: 'department',
      items: ['1']
    },
    directAssignment: {
      assignerProfiles: ['professor', 'coordinator'],
      assignmentLimit: 5
    }
  },
  {
    uid: '3',
    name: 'Regra de Eventos',
    description: 'Uma regra baseada em contagem de eventos',
    type: 'events',
    status: 'active',
    context: {
      type: 'campus',
      items: ['1', '2', '3']
    },
    eventCount: {
      eventType: 'login',
      minOccurrences: 10,
      periodType: 'week',
      periodValue: 2,
      requiredStreak: 0
    }
  }
];

// Handlers para mock de requisições API
export const handlers = [
  // Listar todas as regras
  http.get('/api/rules', () => {
    return HttpResponse.json(mockRules);
  }),

  // Obter uma regra específica pelo ID
  http.get('/api/rules/:uid', ({ params }) => {
    const { uid } = params;
    const rule = mockRules.find(r => r.uid === uid);
    
    if (!rule) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(rule);
  }),

  // Criar uma nova regra
  http.post('/api/rules', async ({ request }) => {
    const newRule = await request.json();
    
    // Validação básica
    if (!newRule.name || !newRule.type) {
      return new HttpResponse(
        JSON.stringify({ 
          message: 'Dados inválidos', 
          validationErrors: {
            name: !newRule.name ? ['Nome é obrigatório'] : [],
            type: !newRule.type ? ['Tipo é obrigatório'] : []
          }
        }),
        { status: 400 }
      );
    }
    
    // Adiciona um ID à nova regra
    const createdRule = {
      ...newRule,
      uid: `${mockRules.length + 1}`,
      status: newRule.status || 'active'
    };
    
    return HttpResponse.json(createdRule, { status: 201 });
  }),

  // Atualizar uma regra existente
  http.put('/api/rules/:uid', async ({ params, request }) => {
    const { uid } = params;
    const updateData = await request.json();
    
    // Verifica se a regra existe
    const existingRuleIndex = mockRules.findIndex(r => r.uid === uid);
    
    if (existingRuleIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // Validação básica
    if (updateData.name === '') {
      return new HttpResponse(
        JSON.stringify({ 
          message: 'Dados inválidos', 
          validationErrors: {
            name: ['Nome é obrigatório']
          }
        }),
        { status: 400 }
      );
    }
    
    // Atualiza a regra
    const updatedRule = {
      ...mockRules[existingRuleIndex],
      ...updateData,
      uid
    };
    
    return HttpResponse.json(updatedRule);
  }),

  // Excluir uma regra
  http.delete('/api/rules/:uid', ({ params }) => {
    const { uid } = params;
    const existingRuleIndex = mockRules.findIndex(r => r.uid === uid);
    
    if (existingRuleIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return new HttpResponse(null, { status: 204 });
  })
];
