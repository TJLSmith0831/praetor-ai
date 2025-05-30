import {
  Button,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { Eye, EyeOff, Lock, Mail, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../API/apiService';

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    try {
      const message = await apiService.login(formData);
      console.log('Login successful:', message);
      navigate('/taskmanager');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      backdrop="blur"
      placement="center"
      hideCloseButton={true}
    >
      <ModalContent className="bg-gray-900 border border-gray-800 text-white w-[400px] shadow-lg rounded-lg relative">
        {(onClose) => (
          <>
            {/* Close Icon */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <ModalHeader className="flex flex-col gap-2 items-center mt-4">
              <Lock className="text-yellow-500" size={40} />
              <h2 className="text-xl font-bold">Sign in to PraetorAI</h2>
              <p className="text-gray-400 text-sm">
                Access your projects and manage tasks efficiently.
              </p>
            </ModalHeader>

            {/* Modal Body */}
            <ModalBody className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  classNames={{ input: ['bg-transparent', 'text-white'] }}
                />
                <Mail
                  className="absolute right-3 top-3 text-gray-400"
                  size={18}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  classNames={{ input: ['bg-transparent', 'text-white'] }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  className="text-yellow-500 text-sm hover:text-yellow-400"
                  href="#"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </ModalBody>

            {/* Modal Footer */}
            <ModalFooter className="flex justify-between mb-4">
              <Button
                color="danger"
                variant="flat"
                className="px-4 py-2 rounded-lg"
                onPress={onClose}
              >
                Close
              </Button>
              <Button
                color="primary"
                className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-400"
                onPress={handleLogin}
              >
                Login
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
