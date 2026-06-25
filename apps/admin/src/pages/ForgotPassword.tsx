import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { renderIcon } from '../utils/iconRenderer';
import { FiMail, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword, validateResetCode, resetPassword } = useAuthStore();
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(email);
      setStep('code');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      await validateResetCode(email, code);
      setStep('password');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword({ email, otp: code, newPassword, confirmPassword });
      setStep('success');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
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
            <div className="w-16 h-16 bg-gradient-to-r from-[#CBAA75] to-[#B87D4C] rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl font-bold text-white">KT</span>
            </div>
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              {step === 'email' && 'Reset Password'}
              {step === 'code' && 'Enter Code'}
              {step === 'password' && 'New Password'}
              {step === 'success' && 'Success!'}
            </h1>
            <p className="text-gray-300 text-center text-sm">
              {step === 'email' && 'Enter your email to receive a reset code'}
              {step === 'code' && 'Enter the 6-digit code sent to your email'}
              {step === 'password' && 'Create your new password'}
              {step === 'success' && 'Your password has been reset successfully'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {['email', 'code', 'password', 'success'].map((s, i) => (
              <div
                key={s}
                className={`flex flex-col items-center ${
                  i > 0 ? 'flex-1 -ml-8' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    ['email', 'code', 'password', 'success'].indexOf(step) >= i
                      ? 'bg-[#B87D4C] text-white'
                      : 'bg-white/10 text-gray-400 border border-white/20'
                  }`}
                >
                  {i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-400">{React.createElement(FiMail as any, { size: 20 })}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#B87D4C] focus:bg-white/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-[#CBAA75] to-[#B87D4C] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Code
                    {React.createElement(FiArrowRight as any, { size: 20 })}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Code Step */}
          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-2">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#B87D4C] focus:bg-white/20 transition-all text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-gray-400 text-xs mt-2">Check your email for the code</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 py-3 px-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  {renderIcon(FiArrowLeft, { size: 20 })}
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#CBAA75] to-[#B87D4C] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  Verify
                  {renderIcon(FiArrowRight, { size: 20 })}
                </button>
              </div>
            </form>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#B87D4C] focus:bg-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-200 text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#B87D4C] focus:bg-white/20 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('code')}
                  className="flex-1 py-3 px-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  {renderIcon(FiArrowLeft, { size: 20 })}
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#CBAA75] to-[#B87D4C] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      Reset Password
                      {renderIcon(FiArrowRight, { size: 20 })}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                {React.createElement(FiCheckCircle as any, { size: 32, className: 'text-white' })}
              </div>
              <p className="text-gray-300">Your password has been successfully reset. You can now log in with your new password.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#CBAA75] to-[#B87D4C] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
              >
                Go to Login
                {React.createElement(FiArrowRight as any, { size: 20 })}
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          {step !== 'success' && (
            <p className="text-center text-gray-300 mt-6">
              Remember your password?{' '}
              <Link to="/login" className="text-[#B87D4C] hover:text-[#B87D4C] font-semibold">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
