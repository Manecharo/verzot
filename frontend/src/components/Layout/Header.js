import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSafeTranslation } from '../../utils/safeTranslation';
import { useAuth } from '../../context/AuthContext';
import NotificationBadge from '../Notifications/NotificationBadge';
import './Header.css';

const Header = () => {
  const { t } = useSafeTranslation();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="brand-logo">
          VERZOT {/* Or an SVG logo later */}
        </Link>
        
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          <span className="menu-icon"></span>
        </button>
        
        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink 
            to="/tournaments" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('tournaments')}
          </NavLink>
          <NavLink 
            to="/teams" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('teams')}
          </NavLink>
          <NavLink 
            to="/players" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('players')}
          </NavLink>
          
          {isAuthenticated && (
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('dashboard')}
            </NavLink>
          )}
        </nav>
        
        <div className={`auth-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {isAuthenticated ? (
            <>
              <NotificationBadge />
              
              <NavLink 
                to="/profile" 
                className={({ isActive }) => isActive ? 'auth-link profile-link active' : 'auth-link profile-link'}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('profile')}
              </NavLink>
              <button onClick={handleLogout} className="auth-link logout-button">
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-link login-link" onClick={() => setMobileMenuOpen(false)}>
                {t('login')}
              </Link>
              <Link to="/register" className="auth-link register-button" onClick={() => setMobileMenuOpen(false)}>
                {t('register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 