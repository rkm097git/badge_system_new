import React from 'react';

export const Button = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  );
};
