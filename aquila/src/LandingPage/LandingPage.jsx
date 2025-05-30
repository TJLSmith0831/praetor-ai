// src/pages/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import LoginModal from '../UserModals/LoginModal';
import Features from './Components/Features';
import Footer from './Components/Footer';
import Functionality from './Components/Functionality';
import HeroSection from './Components/HeroSection';
import Navbar from './Components/Navbar';
import Pricing from './Components/Pricing';

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Function to handle scrolling and update active section
  const updateActiveSectionOnScroll = () => {
    const sections = ['hero', 'functionality', 'features', 'pricing'];
    sections.forEach((sectionId) => {
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) {
        const rect = sectionElement.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom > 150) {
          setActiveSection(sectionId);
        }
      }
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', updateActiveSectionOnScroll);
    return () =>
      window.removeEventListener('scroll', updateActiveSectionOnScroll);
  }, []);

  const handleScroll = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      const offset = 80;
      const topPosition = sectionElement.offsetTop - offset;
      window.scrollTo({ top: topPosition, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className={`bg-primary min-h-screen`}>
      <LoginModal onClose={() => setShowLogin(false)} isOpen={showLogin} />
      <Navbar
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        activeSection={activeSection}
        handleScroll={handleScroll}
      />
      <HeroSection handleScroll={handleScroll} />
      <section id="functionality">
        <Functionality />
      </section>
      <section id="features">
        <Features />
      </section>
      <section id="pricing">
        <Pricing />
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;
