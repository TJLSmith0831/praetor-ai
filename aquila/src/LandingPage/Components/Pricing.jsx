// src/components/Pricing.jsx
import React from 'react';

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for individuals starting out',
    features: [
      'Task Atomization with OpenAI 3.5',
      'Customizable Tree View',
      '3 Saved Projects',
    ],
    buttonText: 'Start',
    buttonLink: '/register?plan=Free',
  },
  {
    name: 'Standard',
    price: '$9.99',
    description: 'Ideal for growing teams',
    features: [
      'All Basic Features with OpenAI 4o',
      'Export to TXT/PDF',
      '10 Saved Projects',
    ],
    buttonText: 'Start 7-Day Free Trial',
    buttonLink: '/register?plan=Standard',
  },
  {
    name: 'Premium',
    price: '$19.99',
    description: 'Ideal for growing teams.',
    features: [
      'All Standard Features',
      'AI-Assisted Research',
      'Unlimited Saved Projects',
    ],
    buttonText: 'Start 7-Day Free Trial',
    buttonLink: '/register?plan=Premium',
  },
  {
    name: 'Educational',
    price: '$4.99',
    description: 'Tailored for educational purposes and project planning',
    features: [
      'All Standard Features',
      'Export to TXT/PDF',
      'For any valid .edu email',
    ],
    buttonText: 'Start 7-Day Free Trial',
    buttonLink: '/register?plan=Educational',
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    description: 'Tailored for large organizations',
    features: [
      'All Premium Features',
      'Slack & Agile Integrations',
      'Faster Customer Assistance',
    ],
    buttonText: 'Get a Demo',
    buttonLink: '#',
  },
];

const Pricing = () => {
  return (
    <section className="bg-gray-100 py-16">
      <h2 className="text-4xl font-bold text-center mb-12 text-primary-dark">
        Pricing Plans
      </h2>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <div
            key={index}
            className={`p-8 rounded-md shadow-md transition-transform transform hover:scale-105 bg-white text-gray-700`}
          >
            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
            <p className="text-4xl font-bold mb-2">{plan.price}</p>
            <p className="mb-6">{plan.description}</p>
            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <span className="inline-block w-4 h-4 bg-accent rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={plan.buttonLink}
              className={`block text-center px-6 py-3 rounded-md font-bold shadow-md transition-transform transform hover:scale-105 bg-accent text-white hover:bg-accent-light`}
            >
              {plan.buttonText}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
