import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // We will create this for styling

// Import images
import heroBgImage from '../assets/images/pexels-mikkel-kvist-2722911-15949232.jpg';
import featureBgImage from '../assets/images/pexels-maumascaro-1311619.jpg';
import ctaBgImage from '../assets/images/pexels-myatezhny39-4038906.jpg';

const Home = () => {
  // Create style objects for sections with background images
  const heroStyle = {
    backgroundImage: `url(${heroBgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const featuresSectionBeforeStyle = {
    backgroundImage: `url(${featureBgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  const ctaSectionStyle = {
    backgroundImage: `url(${ctaBgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" style={heroStyle}>
        <div className="hero-content">
          <h1 className="hero-headline">Organize & Compete Like a Pro</h1>
          <p className="hero-subheadline">
            Verzot is your ultimate platform for creating, managing, and participating in amateur sports tournaments and leagues.
          </p>
          <div className="hero-cta-buttons">
            <Link to="/tournaments" className="cta-button primary">Find Tournaments</Link>
            <Link to="/register" className="cta-button secondary">Get Started</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div style={featuresSectionBeforeStyle} className="features-section-bg"></div>
        <h2 className="section-title">Why Choose Verzot?</h2>
        <div className="features-grid">
          <div className="feature-item">
            {/* <IconComponent name="schedule" />  Placeholder for icon */}
            <h3>Easy Scheduling</h3>
            <p>Generate balanced match schedules automatically.</p>
          </div>
          <div className="feature-item">
            {/* <IconComponent name="teams" /> Placeholder for icon */}
            <h3>Team Management</h3>
            <p>Invite players, manage rosters, and track stats.</p>
          </div>
          <div className="feature-item">
            {/* <IconComponent name="live" /> Placeholder for icon */}
            <h3>Live Updates</h3>
            <p>Follow scores and standings in real-time.</p>
          </div>
          <div className="feature-item">
            {/* <IconComponent name="community" /> Placeholder for icon */}
            <h3>Community Hub</h3>
            <p>Connect with other players, teams, and organizers.</p>
          </div>
        </div>
      </section>

      {/* Additional Sections (Optional) */}
      {/* e.g., Testimonials, How it Works, Call to Action */}
      <section className="cta-section" style={ctaSectionStyle}>
         <h2>Ready to Elevate Your Game?</h2>
         <Link to="/register" className="cta-button primary large">Create Your Account</Link>
      </section>

    </div>
  );
};

export default Home; 