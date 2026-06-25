import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state: any) => state.login);
  const isLoading = useAuthStore((state: any) => state.isLoading);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#171717] to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#B87D4C] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#B87D4C] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        {/* Card */}
        <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 mx-auto p-2 shadow-lg">
              <img src="/ab-creation-logo.png" alt="AB Creation" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h1>
            <p className="text-gray-300 text-center">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-gray-200 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">{React.createElement(FiMail as any, { size: 20 })}</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#B87D4C] focus:bg-white/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-200 text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-[#B87D4C] hover:text-[#B87D4C] text-sm font-medium">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">{React.createElement(FiLock as any, { size: 20 })}</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#B87D4C] focus:bg-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? React.createElement(FiEyeOff as any, { size: 20 }) : React.createElement(FiEye as any, { size: 20 })}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-white/30 bg-white/10 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-gray-300 text-sm cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-[#CBAA75] to-[#B87D4C] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  {React.createElement(FiArrowRight as any, { size: 20 })}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-300">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#B87D4C] hover:text-[#B87D4C] font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
