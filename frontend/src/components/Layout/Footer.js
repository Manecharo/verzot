import React from 'react';
import './Footer.css'; // Styles for the footer

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-links">
          {/* Add relevant links: About, Contact, Privacy Policy, Terms */}
          <a href="/about" className="footer-link">About Us</a>
          <a href="/contact" className="footer-link">Contact</a>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
        </div>
        <div className="footer-copyright">
          &copy; {currentYear} Verzot. All rights reserved.
        </div>
        <div className="footer-social">
          {/* Add social media icons/links here */}
        </div>
      </div>
    </footer>
  );
};

export default Footer; 