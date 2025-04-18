import React from 'react';

interface DescenderTextProps {
  children: React.ReactNode;
  className?: string;
}

export const DescenderText: React.FC<DescenderTextProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <span 
      className={`text-with-descenders ${className}`}
      style={{
        display: 'inline-block',
        lineHeight: '3',
        paddingBottom: '1.5rem',
        overflow: 'visible',
        position: 'relative'
      }}
    >
      {children}
    </span>
  );
};