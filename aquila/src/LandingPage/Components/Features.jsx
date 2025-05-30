// src/components/Features.jsx
import {
  AccountTree,
  AutoAwesome,
  PictureAsPdf,
  Timeline,
} from '@mui/icons-material';
import React from 'react';

const Features = () => {
  const features = [
    {
      icon: <AutoAwesome className="text-accent text-4xl mb-4" />,
      title: 'AI-Driven Task Atomization',
      description:
        'Transform project ideas into structured, actionable tasks with AI precision. Break down complex goals into achievable milestones instantly.',
    },
    {
      icon: <AccountTree className="text-accent text-4xl mb-4" />,
      title: 'Customizable Tree Diagram',
      description:
        'Visualize your projects as dynamic task trees that adapt to your workflow.',
    },
    {
      icon: <Timeline className="text-accent text-4xl mb-4" />,
      title: 'Progress Timeline',
      description:
        "Track your project's progress with an interactive timeline to stay on schedule.",
    },
    {
      icon: <PictureAsPdf className="text-accent text-4xl mb-4" />,
      title: 'Export to TXT/PDF',
      description:
        'Easily export your project plans to TXT or PDF for offline use.',
    },
  ];

  return (
    <section className="bg-gray-100 py-16">
      <h2 className="text-4xl font-bold text-center mb-12 text-primary-dark">
        Key Features
      </h2>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-md shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center"
          >
            {feature.icon}
            <h3 className="text-2xl font-bold mb-2 text-primary-dark">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
