import React from 'react';
import './ErrorAlert.css';

/**
 * A reusable error alert component
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {function} props.onRetry - Optional retry handler
 * @returns {JSX.Element} Error alert component
 */
const ErrorAlert = ({ message, onRetry }) => {
  return (
    <div className="error-alert">
      <div className="error-icon">⚠</div>
      <p className="error-message">{message || 'An error occurred. Please try again.'}</p>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorAlert; 