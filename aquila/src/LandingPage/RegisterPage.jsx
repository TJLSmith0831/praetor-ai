import { Button, Card, CardBody, CardHeader, Input } from '@heroui/react';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../API/apiService';

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
    buttonText: 'Register',
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
    buttonText: 'Register & Start Your 7-Day Free Trial',
  },
  {
    name: 'Premium',
    price: '$19.99',
    description: 'Ideal for growing teams',
    features: [
      'All Standard Features',
      'AI-Assisted Research',
      'Unlimited Saved Projects',
    ],
    buttonText: 'Register & Start Your 7-Day Free Trial',
  },
  {
    name: 'Educator/Student',
    price: '$4.99',
    description: 'Tailored for educational purposes and project planning',
    features: ['All Standard Features', 'For any valid .edu email'],
    buttonText: 'Register & Start Your 7-Day Free Trial',
  },
];

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialSelectedPlan = searchParams.get('plan') || 'Free';
  const [selectedPlan, setSelectedPlan] = useState(initialSelectedPlan);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handlePlanChange = (planName) => {
    setSelectedPlan(planName);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Prepare the registration data
    const registrationData = {
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      plan: selectedPlan, // Include the selected plan
    };

    try {
      // Call the register API
      await apiService.register(registrationData);

      console.log('Registration successful');
      navigate('/taskmanager');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-primary-dark overflow-hidden">
      <div className="flex h-[90vh] flex-col md:flex-row max-w-5xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Left Side - Registration Form */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          <h2 className="text-2xl font-bold text-primary">
            Welcome to PraetorAI!
          </h2>
          <p className="text-gray-600 mt-2">
            Revolutionize your task and project management with the power of AI.
          </p>

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">First Name</label>
                <Input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">Last Name</label>
                <Input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Email Address</label>
              <Input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <Input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            {/* Payment Details (Hidden for Free plan) */}
            {selectedPlan !== 'Free' && (
              <>
                <hr className="my-4" />
                <h4 className="text-lg font-bold">Payment Details</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="Card Number" required />
                  <Input placeholder="MM/YY" required />
                  <Input placeholder="CVV" required />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full mt-4 bg-primary text-white py-2"
            >
              {selectedPlan === 'Free'
                ? 'Register'
                : 'Register & Start Your 7-Day Free Trial'}
            </Button>

            {error && <p className="text-red-600 mt-2">{error}</p>}
          </form>
        </div>

        {/* Right Side - Pricing Cards */}
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto h-full">
          <h4 className="text-lg font-bold mb-4">Select Your Plan</h4>
          <div className="space-y-4">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`cursor-pointer border rounded-lg shadow-sm p-4 w-full text-left ${
                  selectedPlan === plan.name
                    ? 'border-primary shadow-md'
                    : 'border-gray-300'
                }`}
                isPressable
                onPress={() => handlePlanChange(plan.name)}
              >
                <CardHeader>
                  <h5 className="text-md font-bold">{plan.name}</h5>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600">{plan.description}</p>
                  <p className="text-lg font-bold text-primary">{plan.price}</p>
                  <ul className="list-disc pl-5 text-sm mt-2">
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
