import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const { t } = useTranslation();
  const { login: loginUser, user, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // Form validation and UI state
  const [formErrors, setFormErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Clear server errors when form values change
  useEffect(() => {
    if (error) {
      clearError();
    }
    if (feedbackMessage) {
      setFeedbackMessage('');
    }
  }, [formData, error, clearError, feedbackMessage]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = t('auth.emailRequired') || 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = t('auth.invalidEmail') || 'Please enter a valid email';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = t('auth.passwordRequired') || 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    if (validateForm()) {
      try {
        setIsProcessing(true);
        setFeedbackMessage('Signing in...');
        
        const success = await loginUser(formData.email.trim(), formData.password);
        
        if (success) {
          setFeedbackMessage('Login successful! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
      } catch (err) {
        setFeedbackMessage('');
        console.error('Login error:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>{t('auth.loginTitle')}</h2>
        
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        
        {feedbackMessage && (
          <div className="auth-feedback" role="status">
            {feedbackMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">
              {t('auth.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email && submitAttempted ? 'input-error' : ''}
              disabled={isProcessing}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
            {formErrors.email && submitAttempted && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>
          
          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">
              {t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={formErrors.password && submitAttempted ? 'input-error' : ''}
              disabled={isProcessing}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            {formErrors.password && submitAttempted && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className={`auth-button ${isProcessing ? 'loading' : ''}`} 
            disabled={isProcessing}
            aria-busy={isProcessing}
          >
            {isProcessing ? '' : t('auth.login')}
          </button>
        </form>
        
        {/* Links */}
        <div className="auth-links">
          <p>
            {t('auth.noAccount')} <Link to="/register">{t('auth.signUp')}</Link>
          </p>
          <p>
            <Link to="/">{t('nav.home')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 