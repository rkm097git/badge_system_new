import React from 'react';
import { DescenderText } from './descender-text';

interface SafeTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const SafeTitle: React.FC<SafeTitleProps> = ({ 
  children, 
  className = "", 
  ...props 
}) => {
  // Converter children para string para verificação
  const childrenStr = React.Children.toArray(children).map(child => 
    typeof child === 'string' ? child : ''
  ).join('');
  
  // Verificar se contém caracteres descendentes
  const hasDescenders = /[gjpqy]/i.test(childrenStr);
  
  // Se incluir a palavra "Badges", aplicar o tratamento especial
  const containsBadges = /badges/i.test(childrenStr);
  
  // Se contiver "Badges", dividir o texto e aplicar o componente especial
  if (containsBadges && typeof children === 'string') {
    const parts = children.split(/(badges)/i);
    return (
      <div 
        className="w-full title-text" 
        style={{ 
          overflow: 'visible', 
          position: 'relative', 
          minHeight: '2rem',
          marginBottom: '0.5rem'
        }}
        data-prevent-truncate="true"
      >
        <h1 
          className={`text-xl sm:text-2xl font-bold title-text ${className}`}
          style={{
            lineHeight: '1.5',
            paddingTop: '0.25rem',
            paddingBottom: '0.5rem',
            overflow: 'visible',
            position: 'relative',
            display: 'block'
          }}
          {...props}
        >
          {parts.map((part, i) => 
            /badges/i.test(part) ? (
              <DescenderText key={i}>{part}</DescenderText>
            ) : (
              part
            )
          )}
        </h1>
      </div>
    );
  }
  
  // Caso padrão - aplicar estilos robustos de qualquer forma
  return (
    <div 
      className="w-full title-text" 
      style={{ 
        overflow: 'visible', 
        position: 'relative', 
        minHeight: '2rem',
        marginBottom: '0.5rem'
      }}
      data-prevent-truncate="true"
    >
      <h1 
        className={`text-xl sm:text-2xl font-bold title-text ${className}`}
        style={{
          lineHeight: hasDescenders ? '1.5' : '1.3',
          paddingTop: '0.25rem',
          paddingBottom: hasDescenders ? '0.5rem' : '0.375rem',
          overflow: 'visible',
          position: 'relative',
          display: 'block',
          transform: hasDescenders ? 'translateY(-5px)' : 'none'
        }}
        data-has-descenders={hasDescenders.toString()}
        {...props}
      >
        {children}
      </h1>
    </div>
  );
};