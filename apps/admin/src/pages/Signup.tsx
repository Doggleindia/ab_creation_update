import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const signup = useAuthStore((state: any) => state.signup);
  const isLoading = useAuthStore((state: any) => state.isLoading);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const passwordStrength = formData.password.length > 0 ? 
    Math.min(100, (formData.password.length / 12) * 100) : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await signup(formData);
      navigate('/login');
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#171717] to-slate-900 flex items-center justify-center p-4 py-12">
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
            <h1 className="text-3xl font-bold text-white text-center mb-2">Create Account</h1>
            <p className="text-gray-300 text-center">Join us today and get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-gray-200 text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">{React.createElement(FiUser as any, { size: 20 })}</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#B87D4C] focus:bg-white/20 transition-all"
                />
              </div>
            </div>

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
              <label className="block text-gray-200 text-sm font-medium mb-2">Password</label>
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
              {/* Password Strength */}
              <div className="mt-2">
                <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength < 33 ? 'bg-red-500' :
                      passwordStrength < 66 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {passwordStrength < 33 ? 'Weak' : passwordStrength < 66 ? 'Medium' : 'Strong'} password
                </p>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-gray-200 text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">{React.createElement(FiLock as any, { size: 20 })}</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#B87D4C] focus:bg-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? React.createElement(FiEyeOff as any, { size: 20 }) : React.createElement(FiEye as any, { size: 20 })}
                </button>
              </div>
              {formData.password && formData.confirmPassword && (
                <div className={`mt-2 flex items-center gap-2 text-sm ${
                  formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formData.password === formData.confirmPassword ? (
                    <>
                      {React.createElement(FiCheck as any, { size: 16 })}
                      Passwords match
                    </>
                  ) : (
                    <>
                      <span>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/10 cursor-pointer mt-1"
              />
              <label htmlFor="terms" className="text-gray-300 text-sm cursor-pointer">
                I agree to the{' '}
                <button type="button" className="text-[#B87D4C] hover:text-[#B87D4C] font-medium bg-transparent border-none p-0 cursor-pointer">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="text-[#B87D4C] hover:text-[#B87D4C] font-medium bg-transparent border-none p-0 cursor-pointer">
                  Privacy Policy
                </button>
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  {React.createElement(FiArrowRight as any, { size: 20 })}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-300 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#B87D4C] hover:text-[#B87D4C] font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
