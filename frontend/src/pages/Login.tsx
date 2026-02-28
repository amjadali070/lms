import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@simplelms.com' },
    { role: 'Instructor', email: 'jane@health.com' },
    { role: 'Student', email: 'john@edu.com' }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden flex w-full max-w-4xl">
        <div className="w-1/2 bg-primary p-12 text-white flex flex-col justify-center hidden md:flex relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary opacity-20 transform -skew-y-12 origin-top-left z-0"></div>
          <div className="z-10 relative">
            <img src="/lms-logo.svg" alt="LMS" className="h-16 object-contain mb-6" />
            <p className="text-lg text-accent leading-relaxed">
              Enterprise-grade Learning Management System with modular architecture, strict role-based access control, and complete sector isolation.
            </p>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-primary mb-2">Welcome Back</h2>
          <p className="text-secondary mb-8">Sign in to access your modules</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-secondary focus:border-secondary transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-secondary focus:border-secondary transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-secondary hover:bg-primary text-white font-medium py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-primary mb-3">Demo Accounts (password: password123)</p>
            <div className="flex flex-wrap gap-2">
              {demoAccounts.map(acc => (
                <button 
                  key={acc.email} 
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword('password123'); }}
                  className="text-xs bg-background hover:bg-accent text-primary px-3 py-2 rounded font-medium transition-colors"
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
