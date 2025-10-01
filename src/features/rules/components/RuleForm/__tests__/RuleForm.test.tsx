/**
 * Testes para o componente RuleForm
 */
import { render, screen, waitFor } from '@/test/test-utils';
import { RuleForm } from '../index';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock do router do Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn()
  })
}));

describe('RuleForm', () => {
  // Antes de todos os testes, iniciamos o servidor MSW
  beforeAll(() => server.listen());
  
  // Depois de cada teste, resetamos os handlers
  afterEach(() => server.resetHandlers());
  
  // Depois de todos os testes, fechamos o servidor
  afterAll(() => server.close());

  it('renderiza o formulário de criação corretamente', async () => {
    // Act
    render(<RuleForm />);
    
    // Assert
    expect(screen.getByText(/Nova Regra de Atribuição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome da Regra/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição da Regra/i)).toBeInTheDocument();
    expect(screen.getByText(/Tipo de Regra/i)).toBeInTheDocument();
    expect(screen.getByText(/Contexto de Aplicação/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('renderiza o formulário de edição e carrega os dados', async () => {
    // Arrange - Configurar o servidor para responder à requisição GET
    server.use(
      http.get('/api/rules/1', () => {
        return HttpResponse.json({
          uid: '1',
          name: 'Regra de Teste',
          description: 'Descrição da regra de teste',
          type: 'points',
          status: 'active',
          context: {
            type: 'course',
            items: ['1']
          },
          points: {
            minPoints: 100,
            events: [
              { type: 'login', weight: 1 }
            ]
          }
        });
      })
    );
    
    // Act
    render(<RuleForm uid="1" />);
    
    // Assert - Verificar se os dados foram carregados
    await waitFor(() => {
      expect(screen.getByText(/Editar Regra de Atribuição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome da Regra/i)).toHaveValue('Regra de Teste');
      expect(screen.getByLabelText(/Descrição da Regra/i)).toHaveValue('Descrição da regra de teste');
    });
  });

  it('exibe indicador de carregamento durante o carregamento dos dados', () => {
    // Act
    render(<RuleForm uid="1" />);
    
    // Assert
    expect(screen.getByText(/Carregando dados da regra/i)).toBeInTheDocument();
  });

  it('submete o formulário e chama a API ao clicar em Salvar', async () => {
    // Arrange
    const { user } = render(<RuleForm />);
    
    // Preencher o formulário
    const nameInput = screen.getByLabelText(/Nome da Regra/i);
    const descriptionInput = screen.getByLabelText(/Descrição da Regra/i);
    const submitButton = screen.getByRole('button', { name: /Salvar/i });
    
    // Act - Interagir com o formulário
    await user.type(nameInput, 'Nova Regra de Teste');
    await user.type(descriptionInput, 'Descrição da nova regra de teste');
    
    // Selecionar tipo de regra
    const typeSelect = screen.getByLabelText(/Tipo de Regra/i);
    await user.click(typeSelect);
    const pointsOption = await screen.findByText('Pontuação');
    await user.click(pointsOption);
    
    // Submit
    await user.click(submitButton);
    
    // Assert - Verificar se o toast de sucesso aparece
    await waitFor(() => {
      expect(screen.getByText(/salvando/i, { exact: false })).toBeInTheDocument();
    });
  });

  it('exibe mensagens de erro quando a validação falha', async () => {
    // Arrange
    const { user } = render(<RuleForm />);
    const submitButton = screen.getByRole('button', { name: /Salvar/i });
    
    // Act - Submeter sem preencher campos obrigatórios
    await user.click(submitButton);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText(/nome.*obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/descrição.*obrigatória/i)).toBeInTheDocument();
      expect(screen.getByText(/tipo.*obrigatório/i)).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro da API quando a requisição falha', async () => {
    // Arrange - Override do comportamento da API para simular erro
    server.use(
      http.post('/api/rules', () => {
        return HttpResponse.json(
          { message: 'Erro ao salvar regra', error: 'Erro de servidor' },
          { status: 500 }
        );
      })
    );
    
    const { user } = render(<RuleForm />);
    
    // Preencher o formulário
    const nameInput = screen.getByLabelText(/Nome da Regra/i);
    const descriptionInput = screen.getByLabelText(/Descrição da Regra/i);
    const submitButton = screen.getByRole('button', { name: /Salvar/i });
    
    // Act
    await user.type(nameInput, 'Nova Regra de Teste');
    await user.type(descriptionInput, 'Descrição da nova regra de teste');
    
    // Selecionar tipo de regra
    const typeSelect = screen.getByLabelText(/Tipo de Regra/i);
    await user.click(typeSelect);
    const pointsOption = await screen.findByText('Pontuação');
    await user.click(pointsOption);
    
    // Submit
    await user.click(submitButton);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Erro ao salvar regra/i)).toBeInTheDocument();
    });
  });

  it('exibe mensagem de confirmação ao tentar cancelar com alterações', async () => {
    // Mock do window.confirm
    window.confirm = jest.fn(() => false);
    
    // Arrange
    const { user } = render(<RuleForm />);
    const nameInput = screen.getByLabelText(/Nome da Regra/i);
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    
    // Act
    await user.type(nameInput, 'Nova Regra de Teste');
    await user.click(cancelButton);
    
    // Assert
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Tem certeza')
    );
  });
});
