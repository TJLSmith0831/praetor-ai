// src/components/HeroSection.jsx
import React from 'react';

const HeroSection = (props) => {
  const { handleScroll } = props;
  return (
    <section
      id="hero"
      className="bg-primary shadow-lg p-8 bg-gradient-to-r from-primary-dark to-primary-light text-text-primary py-24"
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 flex justify-center mb-8 md:mb-0">
          <img
            src="/assets/project_completed.svg"
            alt="Completed Tasks"
            className="max-w-md"
          />
        </div>
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-extrabold mb-6 tracking-wide">
            Divide. Conquer. Complete.
          </h1>
          <p className="text-xl mb-8 text-text-primary max-w-lg">
            AI-Driven Task Atomization to turn your ideas into actionable steps
            and help you achieve your goals faster
          </p>
          <div className="flex justify-center md:justify-start space-x-4">
            <button
              onClick={() => handleScroll('pricing')}
              className="bg-accent text-background-default px-8 py-3 rounded-lg shadow-lg hover:bg-accent-light transition-transform transform hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => handleScroll('functionality')}
              className="bg-background-card text-text-primary px-8 py-3 rounded-lg shadow-lg hover:bg-background-default transition-transform transform hover:scale-105"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
