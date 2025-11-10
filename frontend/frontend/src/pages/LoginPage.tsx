import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Building2, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@construction.com', password: 'password' },
    { role: 'Manager', email: 'manager@construction.com', password: 'password' },
    { role: 'Site Supervisor', email: 'supervisor@construction.com', password: 'password' },
    { role: 'Employee', email: 'employee@construction.com', password: 'password' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Construction Management
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="w-full">
              <label htmlFor="email" className="label block text-left">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input w-full"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="w-full">
              <label htmlFor="password" className="label block text-left">
                Password
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input w-full"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center z-10 touch-manipulation w-8 h-8"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
              </div>
            </div>

            <div className="w-full">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner h-5 w-5 mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 w-full">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 space-y-3 w-full">
              {demoCredentials.map((cred, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors w-full"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.password);
                  }}
                >
                  <div className="text-sm font-medium text-gray-900 text-left">{cred.role}</div>
                  <div className="text-xs text-gray-500 text-left">{cred.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center w-full">
          <p className="text-xs text-gray-500">
            Click on any demo account to auto-fill credentials
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
