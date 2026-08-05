import React, { useEffect } from 'react';
import { Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SplashView: React.FC = () => {
  const { setCurrentView } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentView('onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [setCurrentView]);

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-between p-8 text-white relative overflow-hidden select-none">
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center z-10">
        {/* Logo Container 300x300 in specs */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
          <Users className="w-20 h-20 text-blue-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">CommunityConnect</h1>
          <p className="text-sm sm:text-base text-blue-100 font-medium max-w-xs mx-auto leading-relaxed">
            Connect. Participate. Strengthen communities.
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs flex flex-col items-center space-y-3 z-10 pb-6">
        <div className="w-48 h-1.5 bg-blue-400/40 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-[pulse_1s_infinite]" style={{ width: '60%' }} />
        </div>
        <p className="text-xs text-blue-200 font-mono">Uganda & Global Civic Network</p>
      </div>
    </div>
  );
};
