/**
 * Testes para o componente RuleTypeSelection
 */
import { render, screen, waitFor } from '@/test/test-utils';
import { RuleTypeSelection } from '../RuleTypeSelection';
import { RuleType } from '../../../types/rule-form-types';

describe('RuleTypeSelection', () => {
  // Função mock para onChange
  const mockOnChange = jest.fn();
  
  // Função mock para onValidate
  const mockOnValidate = jest.fn();

  // Configuração básica do componente
  const setup = (props = {}) => {
    const defaultProps = {
      value: '' as RuleType,
      error: undefined,
      onChange: mockOnChange,
      onValidate: mockOnValidate
    };

    return render(
      <RuleTypeSelection {...defaultProps} {...props} />
    );
  };

  beforeEach(() => {
    // Limpar os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('renderiza corretamente com valor vazio', () => {
    // Act
    setup();
    
    // Assert
    expect(screen.getByText('Tipo de Regra')).toBeInTheDocument();
    expect(screen.getByText('Selecione o tipo de regra')).toBeInTheDocument();
  });

  it('renderiza com valor selecionado', () => {
    // Act
    setup({ value: 'points' as RuleType });
    
    // Assert
    expect(screen.getByText('Pontuação')).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando fornecida', () => {
    // Arrange
    const errorMessage = 'O tipo de regra é obrigatório';
    
    // Act
    setup({ error: errorMessage });
    
    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('adiciona atributos aria-invalid quando há erro', () => {
    // Arrange
    const errorMessage = 'O tipo de regra é obrigatório';
    
    // Act
    setup({ error: errorMessage });
    
    // Assert
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toHaveAttribute('aria-invalid', 'true');
    expect(selectTrigger).toHaveAttribute('aria-describedby', 'rule-type-error');
  });

  it('adiciona a classe de borda vermelha ao select quando há erro', () => {
    // Arrange
    const errorMessage = 'O tipo de regra é obrigatório';
    
    // Act
    setup({ error: errorMessage });
    
    // Assert
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toHaveClass('border-red-500');
  });

  it('chama onChange quando um novo tipo é selecionado', async () => {
    // Arrange
    const { user } = setup();
    
    // Act
    // Simular clique no trigger de seleção
    await user.click(screen.getByRole('combobox'));
    
    // Simular clique em uma opção
    // Observação: pode ser necessário ajustar o seletor dependendo de como o Radix UI renderiza as opções
    await waitFor(() => {
      expect(screen.getByText('Pontuação')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Pontuação'));
    
    // Assert
    expect(mockOnChange).toHaveBeenCalledWith('points');
  });

  it('chama onValidate quando um novo tipo é selecionado e há erro', async () => {
    // Arrange
    const errorMessage = 'O tipo de regra é obrigatório';
    const { user } = setup({ error: errorMessage });
    
    // Act
    // Simular clique no trigger de seleção
    await user.click(screen.getByRole('combobox'));
    
    // Simular clique em uma opção
    await waitFor(() => {
      expect(screen.getByText('Pontuação')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Pontuação'));
    
    // Assert
    // Verificar se onChange foi chamado
    expect(mockOnChange).toHaveBeenCalledWith('points');
    
    // Verificar se onValidate foi chamado após o setTimeout
    await waitFor(() => {
      expect(mockOnValidate).toHaveBeenCalled();
    });
  });

  it('exibe a descrição do tipo selecionado', () => {
    // Act
    setup({ value: 'points' as RuleType });
    
    // Assert
    expect(screen.getByText('Atribui com base em pontos acumulados')).toBeInTheDocument();
  });

  it('não exibe descrição quando nenhum tipo está selecionado', () => {
    // Act
    setup();
    
    // Assert
    expect(screen.queryByText('Atribui com base em pontos acumulados')).not.toBeInTheDocument();
    expect(screen.queryByText('Permite que perfis específicos atribuam manualmente')).not.toBeInTheDocument();
    expect(screen.queryByText('Atribui baseado na frequência de eventos')).not.toBeInTheDocument();
    expect(screen.queryByText('Atribui com base na posição em rankings')).not.toBeInTheDocument();
  });
});
