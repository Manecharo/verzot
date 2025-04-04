import React from 'react';
import Header from './Header'; // We will create this next
import Footer from './Footer'; // We will create this next
import './Layout.css'; // We will create this for styling

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Header />
      <main className="main-content">
        {children} 
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 