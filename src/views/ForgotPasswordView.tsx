import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const ForgotPasswordView: React.FC = () => {
  const { forgotPassword } = useAuth();
  const { setCurrentView, theme, toggleTheme } = useApp();
  const isLight = theme === 'light';

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await forgotPassword(email);
    setIsSubmitting(false);
    setSubmittedMessage(res.message || 'Password reset link sent.');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 max-w-md mx-auto transition-colors ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0C10] text-slate-300'
    }`}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentView('login')}
            className={`flex items-center gap-1 text-xs font-semibold ${
              isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </button>

          <button
            onClick={toggleTheme}
            type="button"
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className={`p-2 rounded-xl transition-all border ${
              isLight
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm'
                : 'bg-slate-800/80 text-amber-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        <div className="space-y-2 mb-6">
          <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Forgot Password</h2>
          <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Enter your registered email address and we will send you instructions to reset your password.
          </p>
        </div>

        {submittedMessage ? (
          <div className={`p-4 rounded-2xl text-center space-y-3 border ${
            isLight
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
          }`}>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold">{submittedMessage}</p>
            <p className={`text-[11px] ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Check your email inbox and spam folder.</p>
            <button
              onClick={() => setCurrentView('login')}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : (
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
                  placeholder="name@example.org"
                  className={`w-full pl-10 pr-4 py-3 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                    isLight
                      ? 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                      : 'bg-[#0F1219] text-white border-slate-800 placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending instructions...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>

      <div className="text-center pt-6">
        <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Need help? Contact <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>support@civicconnect.org</span>
        </p>
      </div>
    </div>
  );
};
