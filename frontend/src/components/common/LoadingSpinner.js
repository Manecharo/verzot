import React from 'react';
import './LoadingSpinner.css';

/**
 * A reusable loading spinner component
 * @returns {JSX.Element} Loading spinner component
 */
const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default LoadingSpinner; 