import React, { useEffect, useState } from 'react';
import './Toast.css';

/**
 * Toast component for displaying notification messages
 * @param {Object} props - Component props
 * @param {string} props.type - Toast type (success, error, info, warning)
 * @param {string} props.message - Message to display
 * @param {string} props.title - Optional title for the toast
 * @param {number} props.duration - Duration in ms to show (0 for no auto-dismiss)
 * @param {function} props.onClose - Function to call when toast is closed
 * @param {boolean} props.isVisible - Whether the toast is visible
 * @param {string} props.extraContent - Additional content to display (like match scores)
 */
const Toast = ({ 
  type = 'info', 
  message, 
  title, 
  duration = 5000, 
  onClose, 
  isVisible = true,
  extraContent
}) => {
  const [visible, setVisible] = useState(isVisible);

  // Get appropriate icon based on toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  // Handle auto-dismiss
  useEffect(() => {
    setVisible(isVisible);
    
    if (duration && isVisible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, onClose]);

  // Handle manual close
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div className={`toast toast-${type} ${visible ? 'visible' : ''}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-content">
        {title && <h4 className="toast-title">{title}</h4>}
        <p className="toast-message">{message}</p>
        {extraContent && (
          <div className="toast-extra-content">{extraContent}</div>
        )}
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Close">
        &times;
      </button>
    </div>
  );
};

export default Toast; 