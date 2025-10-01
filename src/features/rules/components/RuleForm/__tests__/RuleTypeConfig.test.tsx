/**
 * Testes para o componente RuleTypeConfig
 */
import { render, screen } from '@/test/test-utils';
import { RuleTypeConfig } from '../RuleTypeConfig';
import { RuleFormData } from '../../../types/rule-form-types';

// Mocks para os componentes filhos
jest.mock('../types/PointsRuleConfig', () => ({
  PointsRuleConfig: jest.fn(() => <div data-testid="points-config">Points Config Mock</div>)
}));

jest.mock('../types/DirectAssignmentConfig', () => ({
  DirectAssignmentConfig: jest.fn(() => <div data-testid="direct-config">Direct Assignment Config Mock</div>)
}));

jest.mock('../types/EventCountConfig', () => ({
  EventCountConfig: jest.fn(() => <div data-testid="events-config">Event Count Config Mock</div>)
}));

jest.mock('../types/RankingConfig', () => ({
  RankingConfig: jest.fn(() => <div data-testid="ranking-config">Ranking Config Mock</div>)
}));

describe('RuleTypeConfig', () => {
  // Dados de formulário padrão para testes
  const defaultFormData: RuleFormData = {
    name: '',
    description: '',
    type: '',
    status: 'active',
    context: {
      type: '',
      items: []
    },
    points: {
      minPoints: 0,
      events: []
    },
    directAssignment: {
      assignerProfiles: [],
      assignmentLimit: 0
    },
    eventCount: {
      eventType: '',
      minOccurrences: 1,
      periodType: 'week',
      periodValue: 1,
      requiredStreak: 0
    },
    ranking: {
      rankingId: '',
      requiredPosition: 1
    }
  };
  
  // Mock de função onChange para verificar chamadas
  const onChangeMock = jest.fn();

  // Mock de função validateForm para verificar chamadas
  const validateFormMock = jest.fn();

  // Função auxiliar para renderizar o componente com opções customizáveis
  const renderComponent = (props = {}) => {
    return render(
      <RuleTypeConfig
        type=""
        formData={defaultFormData}
        errors={{}}
        onChange={onChangeMock}
        validateForm={validateFormMock}
        {...props}
      />
    );
  };

  // Resetar os mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza mensagem padrão quando nenhum tipo é selecionado', () => {
    // Act
    renderComponent();
    
    // Assert
    expect(screen.getByText(/Selecione um tipo de regra para ver as opções de configuração/i)).toBeInTheDocument();
  });

  it('renderiza o componente PointsRuleConfig quando o tipo é "points"', () => {
    // Act
    renderComponent({ type: 'points' });
    
    // Assert
    expect(screen.getByTestId('points-config')).toBeInTheDocument();
  });

  it('renderiza o componente DirectAssignmentConfig quando o tipo é "direct"', () => {
    // Act
    renderComponent({ type: 'direct' });
    
    // Assert
    expect(screen.getByTestId('direct-config')).toBeInTheDocument();
  });

  it('renderiza o componente EventCountConfig quando o tipo é "events"', () => {
    // Act
    renderComponent({ type: 'events' });
    
    // Assert
    expect(screen.getByTestId('events-config')).toBeInTheDocument();
  });

  it('renderiza o componente RankingConfig quando o tipo é "ranking"', () => {
    // Act
    renderComponent({ type: 'ranking' });
    
    // Assert
    expect(screen.getByTestId('ranking-config')).toBeInTheDocument();
  });

  it('passa os dados corretos para o componente PointsRuleConfig', () => {
    // Arrange
    const { PointsRuleConfig } = require('../types/PointsRuleConfig');
    
    // Act
    renderComponent({ type: 'points' });
    
    // Assert
    expect(PointsRuleConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        data: defaultFormData.points,
        onChange: expect.any(Function),
        onValidate: validateFormMock,
      }),
      expect.anything()
    );
  });

  it('passa os dados corretos para o componente DirectAssignmentConfig', () => {
    // Arrange
    const { DirectAssignmentConfig } = require('../types/DirectAssignmentConfig');
    
    // Act
    renderComponent({ type: 'direct' });
    
    // Assert
    expect(DirectAssignmentConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        data: defaultFormData.directAssignment,
        onChange: expect.any(Function)
      }),
      expect.anything()
    );
  });

  it('passa os dados corretos para o componente EventCountConfig', () => {
    // Arrange
    const { EventCountConfig } = require('../types/EventCountConfig');
    
    // Act
    renderComponent({ type: 'events' });
    
    // Assert
    expect(EventCountConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        data: defaultFormData.eventCount,
        onChange: expect.any(Function)
      }),
      expect.anything()
    );
  });

  it('passa os dados corretos para o componente RankingConfig', () => {
    // Arrange
    const { RankingConfig } = require('../types/RankingConfig');
    
    // Act
    renderComponent({ type: 'ranking' });
    
    // Assert
    expect(RankingConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        data: defaultFormData.ranking,
        onChange: expect.any(Function)
      }),
      expect.anything()
    );
  });

  it('chama onChange com o campo correto ao mudar dados de um subcomponente', () => {
    // Arrange
    const { PointsRuleConfig } = require('../types/PointsRuleConfig');
    renderComponent({ type: 'points' });
    
    // Act - Extrair a função onChange passada para o PointsRuleConfig
    const onChangeHandler = PointsRuleConfig.mock.calls[0][0].onChange;
    const newPointsData = { minPoints: 200, events: [] };
    onChangeHandler(newPointsData);
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledWith('points', newPointsData);
  });

  it('passa a flag formSubmitted para o componente de configuração', () => {
    // Arrange
    const { PointsRuleConfig } = require('../types/PointsRuleConfig');
    
    // Act
    renderComponent({ type: 'points', formSubmitted: true });
    
    // Assert
    expect(PointsRuleConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        formSubmitted: true
      }),
      expect.anything()
    );
  });
});
