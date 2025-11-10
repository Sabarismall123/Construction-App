import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Building2, Eye, EyeOff, HardHat, Wrench, Hammer } from 'lucide-react';
import ConstructionAnimations from '@/components/ConstructionAnimations';

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Construction Animations */}
      <ConstructionAnimations type="login" />
      
      {/* Construction-themed animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {/* Animated construction crane */}
        <div className="absolute top-10 right-10 animate-bounce-slow">
          <HardHat className="h-16 w-16 text-orange-600 opacity-20" />
        </div>
        
        {/* Animated tools */}
        <div className="absolute bottom-20 left-10 animate-float">
          <Wrench className="h-12 w-12 text-amber-600 opacity-15" />
        </div>
        
        <div className="absolute top-1/3 left-20 animate-float-delayed">
          <Hammer className="h-10 w-10 text-yellow-600 opacity-15" />
        </div>
        
        <div className="absolute bottom-40 right-1/4 animate-bounce-slow-delayed">
          <HardHat className="h-14 w-14 text-orange-500 opacity-15" />
        </div>

        {/* Construction grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(90deg, #000 1px, transparent 1px),
              linear-gradient(180deg, #000 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Concrete texture overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center animate-fade-in">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow" style={{
              boxShadow: '0 10px 15px -3px rgba(234, 88, 12, 0.4), 0 4px 6px -2px rgba(217, 119, 6, 0.3)'
            }}>
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="mt-6 text-3xl md:text-4xl font-bold text-gray-900 drop-shadow-sm">
              Construction Management
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-700 font-medium">
              Sign in to your account
            </p>
          </div>

          <div className="backdrop-blur-sm py-8 px-6 shadow-2xl rounded-xl border-2 animate-slide-up" style={{
            background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(255, 248, 235, 0.95) 100%)',
            borderColor: 'rgba(217, 119, 6, 0.2)',
            boxShadow: '0 20px 25px -5px rgba(217, 119, 6, 0.2), 0 10px 10px -5px rgba(217, 119, 6, 0.15)'
          }}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="w-full">
                <label htmlFor="email" className="label block text-left text-gray-700 font-medium">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="w-full">
                <label htmlFor="password" className="label block text-left text-gray-700 font-medium">
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center z-10 touch-manipulation w-8 h-8 hover:text-orange-600 transition-colors"
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
                  className="w-full text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #ea580c 0%, #d97706 50%, #b45309 100%)',
                    boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.3), 0 2px 4px -1px rgba(217, 119, 6, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(234, 88, 12, 0.4), 0 4px 6px -2px rgba(217, 119, 6, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ea580c 0%, #d97706 50%, #b45309 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(234, 88, 12, 0.3), 0 2px 4px -1px rgba(217, 119, 6, 0.2)';
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes bounce-slow-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        
        .animate-bounce-slow-delayed {
          animation: bounce-slow-delayed 5s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
