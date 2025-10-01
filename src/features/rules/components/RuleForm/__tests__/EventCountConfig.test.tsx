/**
 * Testes para o componente EventCountConfig
 */
import { render, screen, waitFor } from '@/test/test-utils';
import { EventCountConfig } from '../types/EventCountConfig';
import userEvent from '@testing-library/user-event';

describe('EventCountConfig', () => {
  // Dados padrão do componente para testes
  const defaultData = {
    eventType: '',
    minOccurrences: 1,
    periodType: 'week' as const,
    periodValue: 1,
    requiredStreak: 0
  };
  
  // Mock de função onChange para verificar chamadas
  const onChangeMock = jest.fn();

  // Mock de função onValidate para verificar chamadas
  const onValidateMock = jest.fn();

  // Função auxiliar para renderizar o componente com opções customizáveis
  const renderComponent = (props = {}) => {
    return render(
      <EventCountConfig
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

  it('renderiza corretamente com os valores padrão', () => {
    // Act
    renderComponent();
    
    // Assert
    expect(screen.getByText(/Tipo de Evento/i)).toBeInTheDocument();
    expect(screen.getByText(/Número Mínimo de Ocorrências/i)).toBeInTheDocument();
    expect(screen.getByText(/Streak Necessário/i)).toBeInTheDocument();
    expect(screen.getByText(/Tipo de Período/i)).toBeInTheDocument();
    expect(screen.getByText(/Quantidade de Períodos/i)).toBeInTheDocument();
    
    // Verificar valores padrão
    expect(screen.getByRole('combobox', { name: /Tipo de Evento/i })).toHaveTextContent(/Selecione o tipo de evento/i);
    expect(screen.getByLabelText(/Número Mínimo de Ocorrências/i)).toHaveValue(1);
    expect(screen.getByLabelText(/Streak Necessário/i)).toHaveValue(0);
    expect(screen.getByRole('combobox', { name: /Tipo de Período/i })).toHaveTextContent(/Semanal/i);
    expect(screen.getByLabelText(/Quantidade de Períodos/i)).toHaveValue(1);
  });

  it('não exibe o resumo da regra quando não há tipo de evento selecionado', () => {
    // Act
    renderComponent();
    
    // Assert
    expect(screen.queryByText(/Resumo da Regra:/i)).not.toBeInTheDocument();
  });

  it('exibe o resumo da regra quando há dados completos', () => {
    // Arrange
    const completeData = {
      ...defaultData,
      eventType: 'login',
      minOccurrences: 5,
      periodType: 'week' as const,
      periodValue: 2,
      requiredStreak: 3
    };
    
    // Act
    renderComponent({ data: completeData });
    
    // Assert
    expect(screen.getByText(/Resumo da Regra:/i)).toBeInTheDocument();
    expect(screen.getByText(/O badge será atribuído quando o evento ocorrer pelo menos 5 vezes em 2 semanas consecutivas \(streak de 3\)/i)).toBeInTheDocument();
  });

  it('atualiza o tipo de evento ao selecionar uma opção', async () => {
    // Arrange
    const { user } = renderComponent();
    const eventTypeSelect = screen.getByRole('combobox', { name: /Tipo de Evento/i });
    
    // Act
    await user.click(eventTypeSelect);
    const option = await screen.findByText(/Login na Plataforma/i);
    await user.click(option);
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      eventType: 'login'
    });
  });

  it('atualiza o número mínimo de ocorrências ao digitar um valor', async () => {
    // Arrange
    const { user } = renderComponent();
    const minOccurrencesInput = screen.getByLabelText(/Número Mínimo de Ocorrências/i);
    
    // Act
    await user.clear(minOccurrencesInput);
    await user.type(minOccurrencesInput, '10');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      minOccurrences: 10
    });
  });

  it('não permite valores menores que 1 para o número mínimo de ocorrências', async () => {
    // Arrange
    const { user } = renderComponent();
    const minOccurrencesInput = screen.getByLabelText(/Número Mínimo de Ocorrências/i);
    
    // Act
    await user.clear(minOccurrencesInput);
    await user.type(minOccurrencesInput, '0');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      minOccurrences: 1
    });
  });

  it('atualiza o streak necessário ao digitar um valor', async () => {
    // Arrange
    const { user } = renderComponent();
    const streakInput = screen.getByLabelText(/Streak Necessário/i);
    
    // Act
    await user.clear(streakInput);
    await user.type(streakInput, '5');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      requiredStreak: 5
    });
  });

  it('não permite valores menores que 0 para o streak necessário', async () => {
    // Arrange
    const { user } = renderComponent();
    const streakInput = screen.getByLabelText(/Streak Necessário/i);
    
    // Act
    await user.clear(streakInput);
    await user.type(streakInput, '-1');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      requiredStreak: 0
    });
  });

  it('atualiza o tipo de período ao selecionar uma opção', async () => {
    // Arrange
    const { user } = renderComponent();
    const periodTypeSelect = screen.getByRole('combobox', { name: /Tipo de Período/i });
    
    // Act
    await user.click(periodTypeSelect);
    const option = await screen.findByText(/Mensal/i);
    await user.click(option);
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      periodType: 'month'
    });
  });

  it('atualiza a quantidade de períodos ao digitar um valor', async () => {
    // Arrange
    const { user } = renderComponent();
    const periodValueInput = screen.getByLabelText(/Quantidade de Períodos/i);
    
    // Act
    await user.clear(periodValueInput);
    await user.type(periodValueInput, '3');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      periodValue: 3
    });
  });

  it('não permite valores menores que 1 para a quantidade de períodos', async () => {
    // Arrange
    const { user } = renderComponent();
    const periodValueInput = screen.getByLabelText(/Quantidade de Períodos/i);
    
    // Act
    await user.clear(periodValueInput);
    await user.type(periodValueInput, '0');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      periodValue: 1
    });
  });

  it('exibe mensagem de erro quando há erro', () => {
    // Arrange & Act
    renderComponent({ 
      error: 'Selecione um tipo de evento'
    });
    
    // Assert
    expect(screen.getByText(/Selecione um tipo de evento/i)).toBeInTheDocument();
  });

  it('aplica classe de erro para o campo com erro', () => {
    // Arrange & Act
    renderComponent({ 
      error: 'Selecione um tipo de evento'
    });
    
    // Assert
    const eventTypeSelect = screen.getByRole('combobox', { name: /Tipo de Evento/i });
    expect(eventTypeSelect).toHaveClass('border-red-500');
  });

  it('chama onValidate ao selecionar tipo de evento quando há erro', async () => {
    // Arrange
    const { user } = renderComponent({ 
      error: 'Selecione um tipo de evento'
    });
    const eventTypeSelect = screen.getByRole('combobox', { name: /Tipo de Evento/i });
    
    // Act
    await user.click(eventTypeSelect);
    const option = await screen.findByText(/Login na Plataforma/i);
    await user.click(option);
    
    // Assert
    await waitFor(() => {
      expect(onValidateMock).toHaveBeenCalled();
    });
  });

  it('exibe o rótulo da unidade correto baseado no período selecionado', async () => {
    // Arrange - Para período semanal
    const dataWithWeek = {
      ...defaultData,
      periodType: 'week' as const,
      periodValue: 1
    };
    
    // Act
    const { rerender } = renderComponent({ data: dataWithWeek });
    
    // Assert
    expect(screen.getByText(/semana/i)).toBeInTheDocument();
    
    // Arrange - Para período mensal, múltiplos períodos
    const dataWithMonths = {
      ...defaultData,
      periodType: 'month' as const,
      periodValue: 3
    };
    
    // Act
    rerender(
      <EventCountConfig
        data={dataWithMonths}
        onChange={onChangeMock}
        onValidate={onValidateMock}
      />
    );
    
    // Assert
    expect(screen.getByText(/meses/i)).toBeInTheDocument();
  });

  it('mostra texto explicativo para o campo de streak', () => {
    // Act
    renderComponent();
    
    // Assert
    expect(screen.getByText(/Use 0 para não exigir ocorrências consecutivas/i)).toBeInTheDocument();
  });
});
