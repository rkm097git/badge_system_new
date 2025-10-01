/**
 * Testes para o componente ErrorMessage
 */
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renderiza a mensagem de erro quando fornecida', () => {
    // Arrange
    const errorMessage = 'Mensagem de erro de teste';
    
    // Act
    render(<ErrorMessage message={errorMessage} />);
    
    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('não renderiza nada quando a mensagem é uma string vazia', () => {
    // Arrange
    const errorMessage = '';
    
    // Act
    const { container } = render(<ErrorMessage message={errorMessage} />);
    
    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('não renderiza nada quando a mensagem é undefined', () => {
    // Act
    const { container } = render(<ErrorMessage message={undefined} />);
    
    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('não renderiza nada quando show é false', () => {
    // Arrange
    const errorMessage = 'Mensagem de erro de teste';
    
    // Act
    const { container } = render(<ErrorMessage message={errorMessage} show={false} />);
    
    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('renderiza com a classe de estilo correta', () => {
    // Arrange
    const errorMessage = 'Mensagem de erro de teste';
    
    // Act
    render(<ErrorMessage message={errorMessage} />);
    
    // Assert
    const messageElement = screen.getByText(errorMessage);
    expect(messageElement).toHaveClass('text-sm');
    expect(messageElement).toHaveClass('text-red-500');
    expect(messageElement).toHaveClass('mt-1');
    expect(messageElement).toHaveClass('font-medium');
  });
});
