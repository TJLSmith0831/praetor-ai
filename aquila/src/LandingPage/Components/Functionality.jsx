// src/components/Functionality.jsx
import React from 'react';

const Functionality = () => {
  const steps = [
    {
      id: 1,
      title: 'Step 1',
      description: 'Input your project details and set your goals',
    },
    {
      id: 2,
      title: 'Step 2',
      description: 'Let the AI atomize your project into actionable tasks',
    },
    {
      id: 3,
      title: 'Step 3',
      description:
        'Track progress with visual timelines and adapt in real time',
    },
  ];

  const benefits = [
    {
      id: 1,
      title: 'Time-Saving Automation',
      description:
        'Our AI breaks down complex projects into manageable tasks, saving you hours of planning',
    },
    {
      id: 2,
      title: 'Personalized Recommendations',
      description:
        "Receive milestone suggestions tailored to your project's unique needs.",
    },
    {
      id: 3,
      title: 'Progress Tracking',
      description:
        'Visualize your progress with dynamic timelines and keep your project on track',
    },
  ];

  return (
    <section className="bg-white py-16">
      <h2 className="text-4xl font-extrabold text-center mb-12 text-primary-dark">
        Functionality
      </h2>
      <h3 className="text-3xl font-bold text-center mb-12 text-primary-dark">
        How It Works
      </h3>
      <div className="container mx-auto flex flex-col items-start relative">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="bg-gray-100 p-8 rounded-md shadow-md hover:shadow-lg transition-shadow relative mb-8"
          >
            <h3 className="text-xl font-bold mb-2 text-primary-dark">
              {step.title}
            </h3>
            <p className="text-gray-600">{step.description}</p>
            {index < steps.length - 1 && (
              <div className="absolute left-1/3 top-full h-8 w-1 bg-primary-dark"></div>
            )}
          </div>
        ))}
      </div>

      <h3 className="text-3xl font-bold text-center mt-16 mb-12 text-primary-dark">
        Why It Works
      </h3>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className="bg-gray-100 p-8 rounded-md shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2 text-primary-dark">
              {benefit.title}
            </h3>
            <p className="text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Functionality;
