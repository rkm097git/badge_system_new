/**
 * Testes para o componente RuleContextSelection
 */
import { render, screen, waitFor } from '@/test/test-utils';
import { RuleContextSelection } from '../RuleContextSelection';
import { RuleContext } from '../../../types/rule-form-types';

describe('RuleContextSelection', () => {
  // Dados default para testes
  const defaultContext: RuleContext = {
    type: 'course',
    items: ['1']
  };

  // Mock para onChange
  const mockOnChange = jest.fn();
  
  // Mock para onValidate
  const mockOnValidate = jest.fn();

  // Função auxiliar para render com props padrão
  const setup = (props = {}) => {
    const defaultProps = {
      context: defaultContext,
      onChange: mockOnChange,
      onValidate: mockOnValidate,
      error: undefined
    };

    return render(
      <RuleContextSelection {...defaultProps} {...props} />
    );
  };

  // Limpar mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza o componente corretamente com contexto de curso', () => {
    // Act
    setup();
    
    // Assert
    expect(screen.getByText('Contexto de Aplicação')).toBeInTheDocument();
    expect(screen.getByText('Cursos')).toBeInTheDocument();
    expect(screen.getByText('Selecione os itens do contexto')).toBeInTheDocument();
    expect(screen.getByText('Engenharia de Software')).toBeInTheDocument();
    expect(screen.getByText('Ciência da Computação')).toBeInTheDocument();
    expect(screen.getByText('Sistemas de Informação')).toBeInTheDocument();
  });

  it('exibe mensagem informativa sobre itens não selecionados', () => {
    // Act
    setup();
    
    // Assert
    expect(screen.getByText('Se nenhum item for selecionado, a regra será aplicada a todos.')).toBeInTheDocument();
  });

  it('exibe o contador de itens selecionados', () => {
    // Act
    setup();
    
    // Assert
    expect(screen.getByText('1 curso selecionado(s)')).toBeInTheDocument();
  });

  it('exibe o contador com texto correto para múltiplos itens', () => {
    // Arrange
    const contextWithMultipleItems: RuleContext = {
      type: 'course',
      items: ['1', '2']
    };
    
    // Act
    setup({ context: contextWithMultipleItems });
    
    // Assert
    expect(screen.getByText('2 curso(s) selecionado(s)')).toBeInTheDocument();
  });

  it('marca os itens selecionados com a classe correta', () => {
    // Act
    const { container } = setup();
    
    // Assert
    // O item com id '1' (Engenharia de Software) deve estar marcado
    const selectedItem = screen.getByText('Engenharia de Software').closest('div[role="checkbox"]');
    expect(selectedItem).toHaveAttribute('aria-checked', 'true');
    expect(selectedItem).toHaveClass('bg-blue-50');
    expect(selectedItem).toHaveClass('border-blue-300');
  });

  it('chama onChange quando um tipo de contexto diferente é selecionado', async () => {
    // Arrange
    const { user } = setup();
    
    // Act
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Departamentos'));
    
    // Assert
    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'department',
      items: []
    });
  });

  it('chama onValidate quando um tipo de contexto é selecionado e existe erro', async () => {
    // Arrange
    const { user } = setup({ error: 'O tipo de contexto é obrigatório' });
    
    // Act
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Departamentos'));
    
    // Assert
    await waitFor(() => {
      expect(mockOnValidate).toHaveBeenCalled();
    });
  });

  it('chama onChange quando um item de contexto é selecionado/desmarcado', async () => {
    // Arrange
    const { user } = setup();
    
    // Act - Clicar em um item não selecionado (Ciência da Computação)
    await user.click(screen.getByText('Ciência da Computação'));
    
    // Assert - Deve adicionar o item à lista
    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'course',
      items: ['1', '2'] // Adiciona id '2' (Ciência da Computação)
    });
    
    // Act - Clicar em um item já selecionado (Engenharia de Software)
    mockOnChange.mockClear();
    await user.click(screen.getByText('Engenharia de Software'));
    
    // Assert - Deve remover o item da lista
    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'course',
      items: [] // Remove id '1' (Engenharia de Software)
    });
  });

  it('permite navegar usando teclado para selecionar itens', async () => {
    // Arrange
    const { user } = setup();
    
    // Act - Pressionar Enter em um item não selecionado
    const cienciaItem = screen.getByText('Ciência da Computação').closest('div[role="checkbox"]');
    cienciaItem?.focus();
    await user.keyboard('{Enter}');
    
    // Assert
    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'course',
      items: ['1', '2']
    });
  });

  it('exibe mensagem de erro quando fornecida', () => {
    // Arrange
    const errorMessage = 'O tipo de contexto é obrigatório';
    
    // Act
    setup({ error: errorMessage });
    
    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('adiciona atributos de acessibilidade quando há erro', () => {
    // Arrange
    const errorMessage = 'O tipo de contexto é obrigatório';
    
    // Act
    setup({ error: errorMessage });
    
    // Assert
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toHaveAttribute('aria-invalid', 'true');
    expect(selectTrigger).toHaveAttribute('aria-describedby', 'context-error');
  });

  it('adiciona classe de erro na borda do select quando há erro', () => {
    // Arrange
    const errorMessage = 'O tipo de contexto é obrigatório';
    
    // Act
    setup({ error: errorMessage });
    
    // Assert
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toHaveClass('border-red-500');
  });

  it('renderiza tooltip informativo para contexto de aplicação', () => {
    // Act
    setup();
    
    // Assert
    // Assume que o tooltip tem um conteúdo específico
    expect(screen.getByRole('tooltip', { hidden: true })).toBeInTheDocument();
  });

  it('atualiza as opções disponíveis quando o tipo de contexto muda', async () => {
    // Arrange
    const departmentContext: RuleContext = {
      type: 'department',
      items: []
    };
    
    // Act
    const { rerender } = setup();
    
    // Rerender com contexto de departamento
    rerender(
      <RuleContextSelection
        context={departmentContext}
        onChange={mockOnChange}
        onValidate={mockOnValidate}
      />
    );
    
    // Assert - Deve exibir opções de departamento
    expect(screen.getByText('Departamento de Computação')).toBeInTheDocument();
    expect(screen.getByText('Departamento de Engenharia')).toBeInTheDocument();
    
    // E não deve exibir opções de curso
    expect(screen.queryByText('Engenharia de Software')).not.toBeInTheDocument();
  });

  it('exibe mensagem quando não há opções disponíveis', () => {
    // Arrange
    // Criamos um contexto com um tipo que não existe para forçar opções vazias
    const invalidContext: RuleContext = {
      type: 'invalidType' as any,
      items: []
    };
    
    // Act
    const { rerender } = setup();
    
    // Rerender com contexto inválido
    rerender(
      <RuleContextSelection
        context={invalidContext}
        onChange={mockOnChange}
        onValidate={mockOnValidate}
      />
    );
    
    // Assert
    expect(screen.getByText('Nenhuma opção disponível para este tipo de contexto.')).toBeInTheDocument();
  });
});
