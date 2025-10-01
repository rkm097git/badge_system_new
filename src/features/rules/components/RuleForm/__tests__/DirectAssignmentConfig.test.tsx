/**
 * Testes para o componente DirectAssignmentConfig
 */
import { render, screen, waitFor } from '@/test/test-utils';
import { DirectAssignmentConfig } from '../types/DirectAssignmentConfig';
import userEvent from '@testing-library/user-event';

describe('DirectAssignmentConfig', () => {
  // Dados padrão do componente para testes
  const defaultData = {
    assignerProfiles: [],
    assignmentLimit: 0
  };
  
  // Mock de função onChange para verificar chamadas
  const onChangeMock = jest.fn();

  // Mock de função onValidate para verificar chamadas
  const onValidateMock = jest.fn();

  // Função auxiliar para renderizar o componente com opções customizáveis
  const renderComponent = (props = {}) => {
    return render(
      <DirectAssignmentConfig
        data={defaultData}
        onChange={onChangeMock}
        onValidate={onValidateMock}
        {...props}
      />
    );
  };

  // Resetar os mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza corretamente sem perfis selecionados', () => {
    // Act
    renderComponent();
    
    // Assert
    expect(screen.getByText(/Perfis que Podem Atribuir/i)).toBeInTheDocument();
    expect(screen.getByText(/Limite de Atribuições por Atribuidor/i)).toBeInTheDocument();
    
    // Verificar checkboxes de perfis
    expect(screen.getByLabelText(/Professor/i)).not.toBeChecked();
    expect(screen.getByLabelText(/Coordenador/i)).not.toBeChecked();
    expect(screen.getByLabelText(/Supervisor/i)).not.toBeChecked();
    
    // Verificar valor limite
    expect(screen.getByLabelText(/Limite de Atribuições por Atribuidor/i)).toHaveValue(0);
    expect(screen.getByText(/Use 0 para permitir atribuições ilimitadas/i)).toBeInTheDocument();
  });

  it('renderiza corretamente com perfis selecionados', () => {
    // Arrange
    const dataWithProfiles = {
      ...defaultData,
      assignerProfiles: ['professor', 'coordinator']
    };
    
    // Act
    renderComponent({ data: dataWithProfiles });
    
    // Assert
    expect(screen.getByLabelText(/Professor/i)).toBeChecked();
    expect(screen.getByLabelText(/Coordenador/i)).toBeChecked();
    expect(screen.getByLabelText(/Supervisor/i)).not.toBeChecked();
  });

  it('alterna a seleção de perfil ao clicar no checkbox', async () => {
    // Arrange
    const { user } = renderComponent();
    const professorCheckbox = screen.getByLabelText(/Professor/i);
    
    // Act - Selecionando
    await user.click(professorCheckbox);
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      assignerProfiles: ['professor']
    });
    
    // Resetar mock
    onChangeMock.mockClear();
    
    // Arrange - com perfil já selecionado
    const dataWithProfile = {
      ...defaultData,
      assignerProfiles: ['professor']
    };
    
    renderComponent({ data: dataWithProfile });
    const professorCheckbox2 = screen.getByLabelText(/Professor/i);
    
    // Act - Desselecionando
    await user.click(professorCheckbox2);
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...dataWithProfile,
      assignerProfiles: []
    });
  });

  it('atualiza o limite de atribuições ao digitar no campo', async () => {
    // Arrange
    const { user } = renderComponent();
    const limitInput = screen.getByLabelText(/Limite de Atribuições por Atribuidor/i);
    
    // Act
    await user.clear(limitInput);
    await user.type(limitInput, '5');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      assignmentLimit: 5
    });
  });

  it('exibe mensagem de erro para perfis quando há erro', () => {
    // Arrange & Act
    renderComponent({ 
      error: 'Selecione pelo menos um perfil',
      errors: {
        directAssignmentProfiles: 'Selecione pelo menos um perfil'
      }
    });
    
    // Assert
    expect(screen.getByText(/Selecione pelo menos um perfil/i)).toBeInTheDocument();
  });

  it('exibe mensagem de erro para limite quando há erro específico', () => {
    // Arrange & Act
    renderComponent({ 
      errors: {
        directAssignmentLimit: 'Limite deve ser maior ou igual a zero'
      }
    });
    
    // Assert
    expect(screen.getByText(/Limite deve ser maior ou igual a zero/i)).toBeInTheDocument();
  });

  it('aplica classe de erro para o campo com erro', () => {
    // Arrange & Act
    renderComponent({ 
      errors: {
        directAssignmentLimit: 'Limite deve ser maior ou igual a zero'
      }
    });
    
    // Assert
    const limitInput = screen.getByLabelText(/Limite de Atribuições por Atribuidor/i);
    expect(limitInput).toHaveClass('border-red-500');
  });

  it('chama onValidate ao selecionar perfil quando tem erro', async () => {
    // Arrange
    const { user } = renderComponent({ 
      error: 'Selecione pelo menos um perfil'
    });
    const professorCheckbox = screen.getByLabelText(/Professor/i);
    
    // Act
    await user.click(professorCheckbox);
    
    // Assert
    await waitFor(() => {
      expect(onValidateMock).toHaveBeenCalled();
    });
  });

  it('chama onValidate ao alterar limite quando tem erro', async () => {
    // Arrange
    const { user } = renderComponent({ 
      errors: {
        directAssignmentLimit: 'Limite deve ser maior ou igual a zero'
      }
    });
    const limitInput = screen.getByLabelText(/Limite de Atribuições por Atribuidor/i);
    
    // Act
    await user.clear(limitInput);
    await user.type(limitInput, '5');
    
    // Assert
    await waitFor(() => {
      expect(onValidateMock).toHaveBeenCalled();
    });
  });

  it('mostra texto explicativo sobre atribuições ilimitadas quando não há erro', () => {
    // Arrange & Act
    renderComponent();
    
    // Assert
    expect(screen.getByText(/Use 0 para permitir atribuições ilimitadas/i)).toBeInTheDocument();
  });

  it('não mostra texto explicativo quando há erro no limite', () => {
    // Arrange & Act
    renderComponent({ 
      errors: {
        directAssignmentLimit: 'Limite deve ser maior ou igual a zero'
      }
    });
    
    // Assert
    expect(screen.queryByText(/Use 0 para permitir atribuições ilimitadas/i)).not.toBeInTheDocument();
  });
});
