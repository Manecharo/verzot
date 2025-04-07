import React from 'react';
import './ErrorAlert.css';

const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="error-alert">
      <div className="error-icon">❌</div>
      <div className="error-message">{message}</div>
      {onClose && (
        <button 
          className="error-close-btn" 
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorAlert; 