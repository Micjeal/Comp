import React from 'react';
import { ArrowLeft, Bell, Smartphone, Monitor, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ title, showBack = false, rightAction }) => {
  const { currentView, goBack, setCurrentView, notifications, showDeviceFrame, setShowDeviceFrame, theme, toggleTheme } = useApp();
  const { user } = useAuth();

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  // Hide header on splash or onboarding
  if (currentView === 'splash' || currentView === 'onboarding') return null;

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between transition-colors ${
      isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-[#0F1219]/95 border-slate-800 text-slate-300'
    }`}>
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            onClick={goBack}
            className={`p-2 rounded-xl active:scale-95 transition-all focus:outline-none border ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/50'
            }`}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : user ? (
          <button
            onClick={() => setCurrentView('profile')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className={`w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all border ${
                isLight ? 'border-slate-200' : 'border-slate-800'
              }`}
            />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Welcome back</p>
              <p className={`text-xs font-bold leading-tight mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.fullName.split(' ')[0]}</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/30 shrink-0">
              <div className="w-3.5 h-3.5 border-2 border-white rotate-45"></div>
            </div>
            <div>
              <span className={`font-bold text-sm tracking-tight block leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>CommunityConnect</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Civic Platform</span>
            </div>
          </div>
        )}

        {title && <h1 className={`text-sm font-bold ml-2 truncate max-w-[180px] ${isLight ? 'text-slate-900' : 'text-white'}`}>{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        {rightAction}

        <button
          onClick={toggleTheme}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className={`p-2 rounded-xl transition-colors border ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-200'
              : 'bg-slate-800/60 hover:bg-slate-800 text-amber-400 border-slate-700/50'
          }`}
          aria-label="Toggle Theme"
        >
          {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          onClick={() => setCurrentView('notifications')}
          className={`relative p-2 rounded-xl focus:outline-none transition-colors border ${
            isLight
              ? 'hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800'
          }`}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className={`absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ${isLight ? 'ring-white' : 'ring-[#0F1219]'} animate-pulse`} />
          )}
        </button>

        <button
          onClick={() => setShowDeviceFrame(!showDeviceFrame)}
          title={showDeviceFrame ? 'Switch to Full-Screen View' : 'Switch to Mobile Frame'}
          className={`p-2 rounded-xl transition-colors hidden sm:flex items-center justify-center ${
            isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {showDeviceFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4 text-blue-500" />}
        </button>
      </div>
    </header>
  );
};
