import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // For navigation
import './Header.css'; // Styles for the header

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="brand-logo">
          VERZOT {/* Or an SVG logo later */}
        </Link>
        <nav className="main-nav">
          {/* Use NavLink for active styling */}
          <NavLink 
            to="/tournaments" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Tournaments
          </NavLink>
          <NavLink 
            to="/teams" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Teams
          </NavLink>
          {/* Add more links as needed: Dashboard, Profile etc. */}
        </nav>
        <div className="auth-links">
          {/* Conditional rendering based on auth status would go here */}
          <Link to="/login" className="auth-link login-link">Login</Link>
          <Link to="/register" className="auth-link register-button">Register</Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 