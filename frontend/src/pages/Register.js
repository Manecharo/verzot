import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const { t } = useTranslation();
  const { register: registerUser, user, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    
    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = t('auth.firstNameRequired') || 'First name is required';
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = t('auth.lastNameRequired') || 'Last name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = t('auth.emailRequired') || 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = t('auth.invalidEmail') || 'Please enter a valid email';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = t('auth.passwordRequired') || 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = t('auth.passwordLength') || 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.passwordsMustMatch') || 'Passwords do not match';
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
        setFeedbackMessage('Creating your account...');
        
        // Prepare user data for API
        const userData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          preferredLanguage: navigator.language.split('-')[0] || 'en',
          birthDate: new Date().toISOString()
        };
        
        const success = await registerUser(userData);
        
        if (success) {
          setFeedbackMessage('Account created successfully! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      } catch (err) {
        setFeedbackMessage('');
        console.error('Registration error:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>{t('auth.registerTitle')}</h2>
        
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
          {/* First Name Field */}
          <div className="form-group">
            <label htmlFor="firstName">
              {t('auth.firstName') || 'First Name'}
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={formErrors.firstName && submitAttempted ? 'input-error' : ''}
              disabled={isProcessing}
              placeholder="Enter your first name"
              autoComplete="given-name"
              required
            />
            {formErrors.firstName && submitAttempted && (
              <span className="error-message">{formErrors.firstName}</span>
            )}
          </div>
          
          {/* Last Name Field */}
          <div className="form-group">
            <label htmlFor="lastName">
              {t('auth.lastName') || 'Last Name'}
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={formErrors.lastName && submitAttempted ? 'input-error' : ''}
              disabled={isProcessing}
              placeholder="Enter your last name"
              autoComplete="family-name"
              required
            />
            {formErrors.lastName && submitAttempted && (
              <span className="error-message">{formErrors.lastName}</span>
            )}
          </div>
          
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
              autoComplete="new-password"
              required
              minLength="8"
            />
            {formErrors.password && submitAttempted && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>
          
          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={formErrors.confirmPassword && submitAttempted ? 'input-error' : ''}
              disabled={isProcessing}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
            />
            {formErrors.confirmPassword && submitAttempted && (
              <span className="error-message">{formErrors.confirmPassword}</span>
            )}
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className={`auth-button ${isProcessing ? 'loading' : ''}`} 
            disabled={isProcessing}
            aria-busy={isProcessing}
          >
            {isProcessing ? '' : t('auth.register')}
          </button>
        </form>
        
        {/* Links */}
        <div className="auth-links">
          <p>
            {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.login')}</Link>
          </p>
          <p>
            <Link to="/">{t('nav.home')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 