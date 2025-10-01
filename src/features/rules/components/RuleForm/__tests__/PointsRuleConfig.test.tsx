/**
 * Testes para o componente PointsRuleConfig
 */
import { render, screen, waitFor } from '@/test/test-utils';
import { PointsRuleConfig } from '../types/PointsRuleConfig';
import userEvent from '@testing-library/user-event';

describe('PointsRuleConfig', () => {
  // Dados padrão do componente para testes
  const defaultData = {
    minPoints: 100,
    events: []
  };
  
  // Mock de função onChange para verificar chamadas
  const onChangeMock = jest.fn();

  // Mock de função onValidate para verificar chamadas
  const onValidateMock = jest.fn();

  // Função auxiliar para renderizar o componente com opções customizáveis
  const renderComponent = (props = {}) => {
    return render(
      <PointsRuleConfig
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

  it('renderiza corretamente sem eventos', () => {
    // Act
    renderComponent();
    
    // Assert
    expect(screen.getByLabelText(/Pontuação Mínima Total/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pontuação Mínima Total/i)).toHaveValue(100);
    expect(screen.getByText(/Tipos de Eventos Considerados/i)).toBeInTheDocument();
    expect(screen.getByText(/Adicionar Evento/i)).toBeInTheDocument();
    expect(screen.getByText(/Nenhum evento configurado/i)).toBeInTheDocument();
  });

  it('renderiza corretamente com eventos existentes', () => {
    // Arrange
    const dataWithEvents = {
      ...defaultData,
      events: [
        { type: 'login', weight: 1 },
        { type: 'content_access', weight: 2 }
      ]
    };
    
    // Act
    renderComponent({ data: dataWithEvents });
    
    // Assert
    expect(screen.getByLabelText(/Pontuação Mínima Total/i)).toHaveValue(100);
    expect(screen.getAllByRole('button', { name: /Remover evento/i })).toHaveLength(2);
    expect(screen.queryByText(/Nenhum evento configurado/i)).not.toBeInTheDocument();
  });

  it('chama onChange ao alterar a pontuação mínima', async () => {
    // Arrange
    const { user } = renderComponent();
    const input = screen.getByLabelText(/Pontuação Mínima Total/i);
    
    // Act
    await user.clear(input);
    await user.type(input, '200');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      minPoints: 200
    });
  });

  it('adiciona um novo evento ao clicar no botão "Adicionar Evento"', async () => {
    // Arrange
    const { user } = renderComponent();
    const addButton = screen.getByRole('button', { name: /Adicionar Evento/i });
    
    // Act
    await user.click(addButton);
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      events: [{ type: '', weight: 1 }]
    });
  });

  it('remove um evento ao clicar no botão de remoção', async () => {
    // Arrange
    const dataWithEvents = {
      ...defaultData,
      events: [
        { type: 'login', weight: 1 },
        { type: 'content_access', weight: 2 }
      ]
    };
    
    const { user } = renderComponent({ data: dataWithEvents });
    const removeButtons = screen.getAllByRole('button', { name: /Remover evento/i });
    
    // Act
    await user.click(removeButtons[0]);
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...dataWithEvents,
      events: [{ type: 'content_access', weight: 2 }]
    });
  });

  it('atualiza o tipo de evento ao selecionar uma opção', async () => {
    // Arrange
    const dataWithEvents = {
      ...defaultData,
      events: [{ type: '', weight: 1 }]
    };
    
    const { user } = renderComponent({ data: dataWithEvents });
    const trigger = screen.getByText(/Selecione o tipo de evento/i);
    
    // Act
    await user.click(trigger);
    const option = await screen.findByText(/Login na Plataforma/i);
    await user.click(option);
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...dataWithEvents,
      events: [{ type: 'login', weight: 1 }]
    });
  });

  it('atualiza o peso do evento ao alterar o valor', async () => {
    // Arrange
    const dataWithEvents = {
      ...defaultData,
      events: [{ type: 'login', weight: 1 }]
    };
    
    const { user } = renderComponent({ data: dataWithEvents });
    const weightInput = screen.getByRole('spinbutton', { name: /Peso do evento/i });
    
    // Act
    await user.clear(weightInput);
    await user.type(weightInput, '2.5');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...dataWithEvents,
      events: [{ type: 'login', weight: 2.5 }]
    });
  });

  it('exibe mensagem de erro para tipo de evento quando há erro', () => {
    // Arrange
    const dataWithEvents = {
      ...defaultData,
      events: [{ type: '', weight: 1 }]
    };
    
    // Act
    renderComponent({ 
      data: dataWithEvents, 
      error: 'Tipo de evento é obrigatório',
      formSubmitted: true
    });
    
    // Assert
    expect(screen.getByText(/Tipo de evento é obrigatório/i)).toBeInTheDocument();
  });

  it('aplica classe de erro para o campo com erro', () => {
    // Arrange
    const dataWithEvents = {
      ...defaultData,
      events: [{ type: '', weight: 1 }]
    };
    
    // Act
    renderComponent({ 
      data: dataWithEvents, 
      error: 'Tipo de evento é obrigatório',
      formSubmitted: true,
      errors: {
        'points.events.0.type': 'Tipo de evento é obrigatório'
      }
    });
    
    // Assert
    const selectTrigger = screen.getByText(/Selecione o tipo de evento/i).closest('button');
    expect(selectTrigger).toHaveClass('border-red-500');
  });

  it('chama onValidate quando o erro muda', async () => {
    // Arrange
    const dataWithEvents = {
      ...defaultData,
      events: [{ type: '', weight: 1 }]
    };
    
    const { rerender } = renderComponent({ 
      data: dataWithEvents
    });
    
    // Act
    rerender(
      <PointsRuleConfig
        data={dataWithEvents}
        onChange={onChangeMock}
        onValidate={onValidateMock}
        error="Tipo de evento é obrigatório"
      />
    );
    
    // Assert
    await waitFor(() => {
      expect(onValidateMock).toHaveBeenCalled();
    });
  });

  it('chama onValidate ao alterar um tipo de evento de vazio para um valor', async () => {
    // Arrange
    const dataWithEvents = {
      ...defaultData,
      events: [{ type: '', weight: 1 }]
    };
    
    const { user } = renderComponent({ 
      data: dataWithEvents,
      error: 'Tipo de evento é obrigatório'
    });
    
    const trigger = screen.getByText(/Selecione o tipo de evento/i);
    
    // Act
    await user.click(trigger);
    const option = await screen.findByText(/Login na Plataforma/i);
    await user.click(option);
    
    // Assert
    await waitFor(() => {
      expect(onValidateMock).toHaveBeenCalled();
    });
  });
});
