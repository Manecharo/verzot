import React from 'react';
import './Button.css';

const Button = ({ 
  type = 'button', 
  onClick, 
  children, 
  className = '', 
  variant = 'primary', 
  disabled = false,
  fullWidth = false
}) => {
  const buttonClasses = `btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''} ${className}`;
  
  return (
    <button 
      type={type} 
      className={buttonClasses} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button; 