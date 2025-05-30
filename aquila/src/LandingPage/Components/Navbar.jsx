// src/components/Navbar.jsx
import React from 'react';

const Navbar = (props) => {
  const { setShowLogin, handleScroll, activeSection, showLogin } = props;

  return (
    <nav
      className={`bg-primary shadow-md p-4 bg-gradient-to-r from-primary-dark to-primary-light fixed top-0 left-0 w-full ${showLogin ? 'z-40' : 'z-50'}`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Logo Section */}
        <h1
          className="text-2xl font-bold text-text-primary cursor-pointer"
          onClick={() => handleScroll('hero')}
        >
          PraetorAI
        </h1>

        {/* Center Navigation Links as Glass Card */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bg-white bg-opacity-10 backdrop-blur-md rounded-full px-6 py-1 shadow-lg flex space-x-4">
          {['functionality', 'features', 'pricing'].map((section) => (
            <button
              key={section}
              onClick={() => handleScroll(section)}
              className={`text-text-primary px-3 py-1 rounded-md transition-all duration-200 cursor-pointer hover:text-accent-light ${
                activeSection === section ? 'text-accent underline' : ''
              }`}
            >
              {section
                .replace('-', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Right Section with Login and Get Started Buttons */}
        <div className="flex space-x-4">
          <li
            onClick={() => setShowLogin(true)}
            className="text-text-primary hover:bg-white hover:bg-opacity-10 hover:backdrop-blur-md hover:text-accent-light cursor-pointer list-none px-4 py-2 rounded-md transition-all flex items-center justify-center"
          >
            Login
          </li>
          <li
            onClick={() => handleScroll('pricing')}
            className="bg-accent text-background-default px-4 py-1 rounded-lg shadow-lg hover:bg-accent-light transition-transform transform hover:scale-105 cursor-pointer list-none flex items-center justify-center"
          >
            Get Started
          </li>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
