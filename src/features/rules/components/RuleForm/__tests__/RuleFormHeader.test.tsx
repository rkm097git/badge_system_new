/**
 * Testes para o componente RuleFormHeader
 */
import { render, screen } from '@/test/test-utils';
import { RuleFormHeader } from '../RuleFormHeader';

describe('RuleFormHeader', () => {
  // Configuração básica do componente
  const defaultProps = {
    redirectUrl: '/admin/rules'
  };

  const setup = (props = {}) => {
    return render(
      <RuleFormHeader {...defaultProps} {...props} />
    );
  };

  it('renderiza corretamente o título para nova regra quando não há uid', () => {
    // Act
    setup();
    
    // Assert
    expect(screen.getByText('Nova Regra de Atribuição')).toBeInTheDocument();
  });

  it('renderiza corretamente o título para edição quando uid está presente', () => {
    // Act
    setup({ uid: '123' });
    
    // Assert
    expect(screen.getByText('Editar Regra de Atribuição')).toBeInTheDocument();
  });

  it('renderiza link para voltar para a lista de regras', () => {
    // Act
    setup();
    
    // Assert
    const backLink = screen.getByText('Lista de Regras');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/admin/rules');
  });

  it('utiliza a URL de redirecionamento fornecida no link de volta', () => {
    // Act
    setup({ redirectUrl: '/custom/redirect' });
    
    // Assert
    const backLink = screen.getByText('Lista de Regras');
    expect(backLink.closest('a')).toHaveAttribute('href', '/custom/redirect');
  });

  it('renderiza o ícone ChevronLeft no link de volta', () => {
    // Act
    setup();
    
    // Assert
    // Como o ícone é um componente SVG, podemos verificar se o link contém um svg
    const backLink = screen.getByText('Lista de Regras').closest('a');
    expect(backLink?.querySelector('svg')).toBeInTheDocument();
  });

  it('renderiza o componente SafeTitle para o título', () => {
    // Act
    const { container } = setup();
    
    // Assert
    // Verificar se o SafeTitle está sendo usado
    expect(container.querySelector('.text-xl.font-semibold')).toBeInTheDocument();
  });

  it('aplica as classes de estilo corretamente ao cabeçalho', () => {
    // Act
    const { container } = setup();
    
    // Assert
    const header = container.querySelector('div[class*="CardHeader"]');
    expect(header).toHaveClass('pb-3');
    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('border-gray-100');
  });

  it('aplica as classes de estilo corretas ao link de volta', () => {
    // Act
    setup();
    
    // Assert
    const backLink = screen.getByText('Lista de Regras').closest('a');
    expect(backLink).toHaveClass('text-blue-600');
    expect(backLink).toHaveClass('hover:text-blue-800');
    expect(backLink).toHaveClass('transition-colors');
  });

  it('utiliza componente CardTitle para o título', () => {
    // Act
    const { container } = setup();
    
    // Assert
    // Verificar se o CardTitle está sendo usado 
    expect(container.querySelector('div[class*="CardTitle"]')).toBeInTheDocument();
  });
});
