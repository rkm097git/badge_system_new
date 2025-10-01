/**
 * Testes para o componente RuleBasicInfo
 */
import { render, screen, fireEvent } from '@/test/test-utils';
import { RuleBasicInfo } from '../RuleBasicInfo';
import { RuleFormData } from '../../../types/rule-form-types';

describe('RuleBasicInfo', () => {
  // Dados de formulário padrão para testes
  const defaultFormData: Pick<RuleFormData, 'name' | 'description'> = {
    name: 'Regra de Teste',
    description: 'Descrição da regra de teste'
  };

  // Função mock para onChange
  const mockOnChange = jest.fn();

  // Configuração básica do componente
  const setup = (props = {}) => {
    const defaultProps = {
      formData: defaultFormData,
      errors: {},
      onChange: mockOnChange
    };

    return render(
      <RuleBasicInfo {...defaultProps} {...props} />
    );
  };

  beforeEach(() => {
    // Limpar os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('renderiza corretamente com dados iniciais', () => {
    // Act
    setup();
    
    // Assert
    expect(screen.getByLabelText(/Nome da Regra/i)).toHaveValue('Regra de Teste');
    expect(screen.getByLabelText(/Descrição da Regra/i)).toHaveValue('Descrição da regra de teste');
  });

  it('chama onChange quando o campo de nome é alterado', async () => {
    // Arrange
    const { user } = setup();
    const nameInput = screen.getByLabelText(/Nome da Regra/i);
    
    // Act
    await user.clear(nameInput);
    await user.type(nameInput, 'Nova Regra');
    
    // Assert
    expect(mockOnChange).toHaveBeenCalledWith('name', 'Nova Regra');
  });

  it('chama onChange quando o campo de descrição é alterado', async () => {
    // Arrange
    const { user } = setup();
    const descriptionInput = screen.getByLabelText(/Descrição da Regra/i);
    
    // Act
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Nova descrição');
    
    // Assert
    expect(mockOnChange).toHaveBeenCalledWith('description', 'Nova descrição');
  });

  it('exibe mensagem de erro para o campo nome quando fornecida', () => {
    // Arrange
    const errors = { name: 'Nome é obrigatório' };
    
    // Act
    setup({ errors });
    
    // Assert
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
  });

  it('exibe mensagem de erro para o campo descrição quando fornecida', () => {
    // Arrange
    const errors = { description: 'Descrição é obrigatória' };
    
    // Act
    setup({ errors });
    
    // Assert
    expect(screen.getByText('Descrição é obrigatória')).toBeInTheDocument();
  });

  it('adiciona a classe de borda vermelha ao input de nome quando há erro', () => {
    // Arrange
    const errors = { name: 'Nome é obrigatório' };
    
    // Act
    setup({ errors });
    
    // Assert
    const nameInput = screen.getByLabelText(/Nome da Regra/i);
    expect(nameInput).toHaveClass('border-red-500');
  });

  it('adiciona a classe de borda vermelha ao textarea de descrição quando há erro', () => {
    // Arrange
    const errors = { description: 'Descrição é obrigatória' };
    
    // Act
    setup({ errors });
    
    // Assert
    const descriptionInput = screen.getByLabelText(/Descrição da Regra/i);
    expect(descriptionInput).toHaveClass('border-red-500');
  });

  it('adiciona atributos de acessibilidade aria-invalid e aria-describedby quando há erro no nome', () => {
    // Arrange
    const errors = { name: 'Nome é obrigatório' };
    
    // Act
    setup({ errors });
    
    // Assert
    const nameInput = screen.getByLabelText(/Nome da Regra/i);
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    expect(nameInput).toHaveAttribute('aria-describedby');
  });

  it('adiciona atributos de acessibilidade aria-invalid e aria-describedby quando há erro na descrição', () => {
    // Arrange
    const errors = { description: 'Descrição é obrigatória' };
    
    // Act
    setup({ errors });
    
    // Assert
    const descriptionInput = screen.getByLabelText(/Descrição da Regra/i);
    expect(descriptionInput).toHaveAttribute('aria-invalid', 'true');
    expect(descriptionInput).toHaveAttribute('aria-describedby');
  });

  it('renderiza o tooltip para o campo de nome', () => {
    // Act
    setup();
    
    // Assert
    const tooltips = screen.getAllByRole('tooltip', { hidden: true });
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('renderiza o tooltip para o campo de descrição', () => {
    // Act
    setup();
    
    // Assert
    const tooltips = screen.getAllByRole('tooltip', { hidden: true });
    expect(tooltips.length).toBeGreaterThan(0);
  });
});
