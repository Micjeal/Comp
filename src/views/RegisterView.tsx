import React, { useState } from 'react';
import { User, Mail, Lock, Phone, CheckCircle, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const RegisterView: React.FC = () => {
  const { register } = useAuth();
  const { setCurrentView, theme, toggleTheme } = useApp();
  const isLight = theme === 'light';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccessMsg, setRegisteredSuccessMsg] = useState<string | null>(null);

  // Password rules validation
  const hasEightChars = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('You must agree to the Community Standards and Terms of Use.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-type and confirm your password.');
      return;
    }
    if (!hasEightChars || !hasNumber || !hasUpper) {
      setError('Password does not meet safety requirements.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const res = await register({ fullName, email, password, phone });
    setIsSubmitting(false);

    if (res.success) {
      setRegisteredSuccessMsg(res.message || 'Account created & confirmed with Supabase Auth!');
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  if (registeredSuccessMsg) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center p-6 max-w-md mx-auto text-center transition-colors ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0C10] text-slate-100'
      }`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm border ${
          isLight ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/80'
        }`}>
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Account Confirmed!</h2>
        <p className={`text-sm font-medium mb-6 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          {registeredSuccessMsg}
          <br />
          Your account for <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{email}</span> is registered and ready to log in.
        </p>
        <div className="w-full space-y-3">
          <button
            onClick={() => setCurrentView('home')}
            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
          >
            Go to Platform Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentView('login')}
            className={`w-full py-3 rounded-2xl font-bold text-sm border transition-all ${
              isLight
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 max-w-md mx-auto transition-colors ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0C10] text-slate-300'
    }`}>
      <div>
        <div className="pt-2 pb-4 flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Create Account</h2>
            <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Join citizens organizing positive community change.
            </p>
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
          <div className={`mb-4 p-3 rounded-2xl border text-xs font-medium ${
            isLight
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Grace Akello"
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                  isLight
                    ? 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                    : 'bg-[#0F1219] text-white border-slate-800 placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="grace.akello@example.org"
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                  isLight
                    ? 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                    : 'bg-[#0F1219] text-white border-slate-800 placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 770 000000"
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                  isLight
                    ? 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                    : 'bg-[#0F1219] text-white border-slate-800 placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                  isLight
                    ? 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                    : 'bg-[#0F1219] text-white border-slate-800 placeholder-slate-500'
                }`}
              />
            </div>

            {/* Password strength checklist */}
            <div className={`p-2.5 rounded-xl space-y-1 text-[11px] font-medium border ${
              isLight
                ? 'bg-slate-100/80 border-slate-200 text-slate-600'
                : 'bg-[#0F1219] border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-1.5">
                <CheckCircle className={`w-3.5 h-3.5 ${hasEightChars ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>At least one number</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className={`w-3.5 h-3.5 ${hasUpper ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>At least one uppercase letter</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border focus:outline-none focus:ring-2 ${
                  isLight
                    ? 'bg-white text-slate-900 placeholder-slate-400'
                    : 'bg-[#0F1219] text-white placeholder-slate-500'
                } ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-emerald-500 focus:ring-emerald-500/20'
                      : 'border-red-500 focus:ring-red-500/20'
                    : isLight
                    ? 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                    : 'border-slate-800 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-[11px] font-medium ${passwordsMatch ? 'text-emerald-500' : 'text-red-500'}`}>
                {passwordsMatch ? '✓ Passwords match!' : '✗ Passwords do not match yet'}
              </p>
            )}
          </div>

          <label className="flex items-start gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-xs leading-tight font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              I agree to the <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>Terms of Use</span> and{' '}
              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>Community Safety Standards</span>.
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className={`pt-4 border-t text-center ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Already have an account?{' '}
          <button onClick={() => setCurrentView('login')} className="text-blue-600 font-bold hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
