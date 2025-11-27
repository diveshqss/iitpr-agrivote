import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { UserRole } from '../types';
import { Lock, Info, Sprout, Briefcase, Shield, Settings, User, Mail } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const { login, signup, isLoading, error } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>('farmer');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [expertId, setExpertId] = useState('');
  const [specialization, setSpecialization] = useState<string[]>([]);

  // Constants
  const domains = ['Crop Science', 'Soil Management', 'Pest Control', 'Irrigation', 'Fertilization', 'Sustainable Farming'];

  // Helper functions
  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'farmer': return 'green';
      case 'expert': return 'blue';
      case 'moderator': return 'purple';
      case 'admin': return 'orange';
      default: return 'gray';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'farmer': return Sprout;
      case 'expert': return Briefcase;
      case 'moderator': return Shield;
      case 'admin': return Settings;
      default: return User;
    }
  };

  const toggleSpecialization = (domain: string) => {
    setSpecialization(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const roleColor = getRoleColor(role);
  const RoleIcon = getRoleIcon(role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!name.trim()) {
          throw new Error('Name is required');
        }
        const signupData = {
          name: name.trim(),
          email: email.trim(),
          role,
          password,
        };

        await signup(signupData);
      }
      onLoginSuccess?.();
    } catch (err) {
      // Error is handled by the auth context
      console.error('Auth error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sprout className="w-12 h-12 text-green-600" />
            <h1 className="text-green-800">AgriVote Nexus</h1>
          </div>
          <p className="text-green-700">
            Multi-Expert Agricultural Decision System
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Role Selection & Info */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-gray-900 mb-6">Select Your Role</h2>

            <div className="space-y-3 mb-8">
              <button
                onClick={() => setRole('farmer')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  role === 'farmer'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sprout className={`w-6 h-6 ${role === 'farmer' ? 'text-green-600' : 'text-gray-600'}`} />
                  <div>
                    <p className="text-gray-900">Farmer</p>
                    <p className="text-gray-600 text-sm">Submit questions and get expert advice</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRole('expert')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  role === 'expert'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className={`w-6 h-6 ${role === 'expert' ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div>
                    <p className="text-gray-900">Expert</p>
                    <p className="text-gray-600 text-sm">Answer questions and review peer responses</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRole('moderator')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  role === 'moderator'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className={`w-6 h-6 ${role === 'moderator' ? 'text-purple-600' : 'text-gray-600'}`} />
                  <div>
                    <p className="text-gray-900">Moderator</p>
                    <p className="text-gray-600 text-sm">Review and finalize expert answers</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRole('admin')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  role === 'admin'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className={`w-6 h-6 ${role === 'admin' ? 'text-orange-600' : 'text-gray-600'}`} />
                  <div>
                    <p className="text-gray-900">Admin</p>
                    <p className="text-gray-600 text-sm">View analytics and system metrics</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-900 text-sm mb-2">Demo Credentials:</p>
              <div className="space-y-2 text-xs text-gray-600">
                <p><span className="font-medium">Farmer:</span> farmer@demo.com / password</p>
                <p><span className="font-medium">Expert:</span> expert-1@demo.com / password</p>
                <p><span className="font-medium">Moderator:</span> moderator@demo.com / password</p>
                <p><span className="font-medium">Admin:</span> admin@demo.com / password</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Signup Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-md transition-all ${
                  mode === 'login'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-md transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className={`flex items-center gap-3 mb-6 p-4 rounded-lg bg-${roleColor}-50 border-2 border-${roleColor}-200`}>
              <RoleIcon className={`w-6 h-6 text-${roleColor}-600`} />
              <div>
                <p className={`text-${roleColor}-900`}>
                  {mode === 'login' ? 'Login' : 'Sign Up'} as {role.charAt(0).toUpperCase() + role.slice(1)}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (Signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:border-green-500 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:border-green-500 focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:border-green-500 focus:outline-none"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Expert ID (Signup for expert only) */}
              {mode === 'signup' && role === 'expert' && (
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Expert ID (Optional)</label>
                  <input
                    type="text"
                    value={expertId}
                    onChange={(e) => setExpertId(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none"
                    placeholder="e.g., expert-6 (auto-generated if empty)"
                  />
                </div>
              )}

              {/* Specialization (Signup for expert only) */}
              {mode === 'signup' && role === 'expert' && (
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">
                    Specialization (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {domains.map(domain => (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => toggleSpecialization(domain)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                          specialization.includes(domain)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-800 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-${roleColor}-600 text-white py-3 rounded-lg hover:bg-${roleColor}-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <RoleIcon className="w-5 h-5" />
                    {mode === 'login' ? 'Login' : 'Sign Up'} as {role.charAt(0).toUpperCase() + role.slice(1)}
                  </>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <p className="text-gray-600 text-xs text-center mt-6">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className={`text-${roleColor}-600 hover:underline`}
              >
                {mode === 'login' ? 'Sign up here' : 'Login here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>)
};

export default AuthPage;
