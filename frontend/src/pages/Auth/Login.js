import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, error, clearError, isAuthenticated, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any auth errors when component mounts
    clearError();
  }, [isAuthenticated, navigate, clearError]);

  const validateForm = () => {
    let valid = true;
    const errors = {
      email: '',
      password: ''
    };

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
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h2>{t('auth.login_title')}</h2>
          <p>{t('auth.login_subtitle')}</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
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
          
          <div className="auth-actions">
            <Button 
              type="submit" 
              fullWidth 
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.login_button')}
            </Button>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>
            {t('auth.no_account')}{' '}
            <Link to="/register" className="auth-link">
              {t('auth.register_link')}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login; 