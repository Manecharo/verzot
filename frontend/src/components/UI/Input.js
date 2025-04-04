import React from 'react';
import './Input.css';

const Input = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  const inputClasses = `form-input ${error ? 'input-error' : ''} ${className}`;
  
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Input; 