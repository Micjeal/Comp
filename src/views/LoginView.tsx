import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Users, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { setCurrentView, theme, toggleTheme } = useApp();
  const isLight = theme === 'light';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      setCurrentView('home');
    } else {
      setError(res.error || 'Failed to sign in. Please verify your details.');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 max-w-md mx-auto transition-colors ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0C10] text-slate-300'
    }`}>
      <div>
        {/* Top Header with Theme Toggle */}
        <div className="pt-4 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              CC
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Welcome back</h2>
              <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Sign in to participate in your community.
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            type="button"
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className={`p-2.5 rounded-2xl transition-all border ${
              isLight
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm'
                : 'bg-slate-800/80 text-amber-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {isLight ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-3 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                  isLight
                    ? 'bg-white text-slate-900 border-slate-200'
                    : 'bg-[#0F1219] text-white border-slate-800'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Password</label>
              <button
                type="button"
                onClick={() => setCurrentView('forgot-password')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-10 py-3 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                  isLight
                    ? 'bg-white text-slate-900 border-slate-200'
                    : 'bg-[#0F1219] text-white border-slate-800'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className={`pt-6 border-t text-center space-y-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          New to CommunityConnect?{' '}
          <button onClick={() => setCurrentView('register')} className="text-blue-600 font-bold hover:underline">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};
