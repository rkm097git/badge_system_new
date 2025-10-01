/**
 * Testes para o componente RankingConfig
 */
import { render, screen, waitFor } from '@/test/test-utils';
import { RankingConfig } from '../types/RankingConfig';
import userEvent from '@testing-library/user-event';

describe('RankingConfig', () => {
  // Dados padrão do componente para testes
  const defaultData = {
    rankingId: '',
    requiredPosition: 1
  };
  
  // Mock de função onChange para verificar chamadas
  const onChangeMock = jest.fn();

  // Mock de função onValidate para verificar chamadas
  const onValidateMock = jest.fn();

  // Função auxiliar para renderizar o componente com opções customizáveis
  const renderComponent = (props = {}) => {
    return render(
      <RankingConfig
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
    expect(screen.getByText(/Ranking/i)).toBeInTheDocument();
    expect(screen.getByText(/Posição Necessária/i)).toBeInTheDocument();
    
    // Verificar valores padrão
    expect(screen.getByRole('combobox', { name: /Ranking/i })).toHaveTextContent(/Selecione o ranking/i);
    expect(screen.getByLabelText(/Posição Necessária/i)).toHaveValue(1);
    expect(screen.getByText(/lugar ou melhor/i)).toBeInTheDocument();
    expect(screen.getByText(/Ex: Valor 3 significa que alunos em 1º, 2º ou 3º lugar receberão o badge/i)).toBeInTheDocument();
  });

  it('não exibe o resumo da regra quando não há ranking selecionado', () => {
    // Act
    renderComponent();
    
    // Assert
    expect(screen.queryByText(/Resumo da Regra:/i)).not.toBeInTheDocument();
  });

  it('exibe o resumo da regra quando há dados completos', () => {
    // Arrange
    const completeData = {
      ...defaultData,
      rankingId: '1',
      requiredPosition: 3
    };
    
    // Act
    renderComponent({ data: completeData });
    
    // Assert
    expect(screen.getByText(/Resumo da Regra:/i)).toBeInTheDocument();
    expect(screen.getByText(/O badge será atribuído aos alunos que alcançarem a 3ª posição ou melhor no ranking de alunos mais assíduos/i)).toBeInTheDocument();
  });

  it('atualiza o ranking ao selecionar uma opção', async () => {
    // Arrange
    const { user } = renderComponent();
    const rankingSelect = screen.getByRole('combobox', { name: /Ranking/i });
    
    // Act
    await user.click(rankingSelect);
    const option = await screen.findByText(/Alunos mais assíduos/i);
    await user.click(option);
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      rankingId: '1'
    });
  });

  it('atualiza a posição necessária ao digitar um valor', async () => {
    // Arrange
    const { user } = renderComponent();
    const positionInput = screen.getByLabelText(/Posição Necessária/i);
    
    // Act
    await user.clear(positionInput);
    await user.type(positionInput, '5');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      requiredPosition: 5
    });
  });

  it('não permite valores menores que 1 para a posição necessária', async () => {
    // Arrange
    const { user } = renderComponent();
    const positionInput = screen.getByLabelText(/Posição Necessária/i);
    
    // Act
    await user.clear(positionInput);
    await user.type(positionInput, '0');
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith({
      ...defaultData,
      requiredPosition: 1
    });
  });

  it('exibe mensagem de erro quando há erro', () => {
    // Arrange & Act
    renderComponent({ 
      error: 'Selecione um ranking'
    });
    
    // Assert
    expect(screen.getByText(/Selecione um ranking/i)).toBeInTheDocument();
  });

  it('aplica classe de erro para o campo com erro', () => {
    // Arrange & Act
    renderComponent({ 
      error: 'Selecione um ranking'
    });
    
    // Assert
    const rankingSelect = screen.getByRole('combobox', { name: /Ranking/i });
    expect(rankingSelect).toHaveClass('border-red-500');
  });

  it('chama onValidate ao selecionar ranking quando há erro', async () => {
    // Arrange
    const { user } = renderComponent({ 
      error: 'Selecione um ranking'
    });
    const rankingSelect = screen.getByRole('combobox', { name: /Ranking/i });
    
    // Act
    await user.click(rankingSelect);
    const option = await screen.findByText(/Alunos mais assíduos/i);
    await user.click(option);
    
    // Assert
    await waitFor(() => {
      expect(onValidateMock).toHaveBeenCalled();
    });
  });

  it('renderiza corretamente quando não existem rankings disponíveis', () => {
    // Mock do original
    const originalElement = RankingConfig['AVAILABLE_RANKINGS'];
    
    // Sobrescrever para testar
    jest.spyOn(RankingConfig, 'AVAILABLE_RANKINGS', 'get').mockReturnValue([]);
    
    // Act
    renderComponent();
    
    // Assert
    expect(screen.getByText(/Nenhum ranking disponível/i)).toBeInTheDocument();
    
    // Restaurar mock
    jest.spyOn(RankingConfig, 'AVAILABLE_RANKINGS', 'get').mockReturnValue(originalElement);
  });

  it('exibe descrição de cada ranking ao expandir o dropdown', async () => {
    // Arrange
    const { user } = renderComponent();
    const rankingSelect = screen.getByRole('combobox', { name: /Ranking/i });
    
    // Act
    await user.click(rankingSelect);
    
    // Assert
    expect(screen.getByText(/Classifica alunos por frequência de acesso/i)).toBeInTheDocument();
    expect(screen.getByText(/Classifica alunos por desempenho acadêmico/i)).toBeInTheDocument();
    expect(screen.getByText(/Classifica alunos por engajamento em discussões/i)).toBeInTheDocument();
  });

  it('exibe a explicação da regra com o nome correto do ranking', async () => {
    // Arrange
    const dataWithRanking1 = {
      ...defaultData,
      rankingId: '1',
      requiredPosition: 3
    };
    
    const { rerender } = renderComponent({ data: dataWithRanking1 });
    
    // Assert
    expect(screen.getByText(/ranking de alunos mais assíduos/i)).toBeInTheDocument();
    
    // Arrange - Mudar para outro ranking
    const dataWithRanking2 = {
      ...defaultData,
      rankingId: '2',
      requiredPosition: 3
    };
    
    // Act
    rerender(
      <RankingConfig
        data={dataWithRanking2}
        onChange={onChangeMock}
        onValidate={onValidateMock}
      />
    );
    
    // Assert
    expect(screen.getByText(/ranking de melhores notas/i)).toBeInTheDocument();
  });
});
