import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, error, clearError, isAuthenticated, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any auth errors when component mounts
    clearError();
  }, [isAuthenticated, navigate, clearError]);

  // Calculate password strength when password changes
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    
    // Length check
    if (formData.password.length >= 8) strength += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
    
    // Normalize to 0-3 scale
    setPasswordStrength(Math.min(3, strength));
  }, [formData.password]);

  const getStrengthClass = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'strength-weak';
    if (passwordStrength === 2) return 'strength-medium';
    return 'strength-strong';
  };

  const validateForm = () => {
    let valid = true;
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    // Name validation
    if (!formData.name) {
      errors.name = t('auth.name_required');
      valid = false;
    }

    // Email validation
    if (!formData.email) {
      errors.email = t('auth.email_required');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('auth.email_invalid');
      valid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = t('auth.password_required');
      valid = false;
    } else if (formData.password.length < 8) {
      errors.password = t('auth.password_length');
      valid = false;
    } else if (passwordStrength < 2) {
      errors.password = t('auth.password_weak');
      valid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = t('auth.confirm_password_required');
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.passwords_not_match');
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { confirmPassword, ...userData } = formData;
      const success = await register(userData);
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h2>{t('auth.register_title')}</h2>
          <p>{t('auth.register_subtitle')}</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <Input 
            id="name"
            name="name"
            type="text"
            label={t('auth.name')}
            placeholder={t('auth.name_placeholder')}
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            required
          />
          
          <Input 
            id="email"
            name="email"
            type="email"
            label={t('auth.email')}
            placeholder={t('auth.email_placeholder')}
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
          />
          
          <Input 
            id="password"
            name="password"
            type="password"
            label={t('auth.password')}
            placeholder={t('auth.password_placeholder')}
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            required
          />
          
          {formData.password && (
            <div className="password-strength">
              <div className={`password-strength-bar ${getStrengthClass()}`}></div>
            </div>
          )}
          
          <Input 
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label={t('auth.confirm_password')}
            placeholder={t('auth.confirm_password_placeholder')}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            required
          />
          
          <div className="auth-actions">
            <Button 
              type="submit" 
              fullWidth 
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.register_button')}
            </Button>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>
            {t('auth.have_account')}{' '}
            <Link to="/login" className="auth-link">
              {t('auth.login_link')}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register; 