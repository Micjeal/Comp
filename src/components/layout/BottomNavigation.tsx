import React from 'react';
import { Home, Compass, Plus, Users, User } from 'lucide-react';
import { useApp, ScreenView } from '../../context/AppContext';

export const BottomNavigation: React.FC = () => {
  const { currentView, setCurrentView, exploreTab, setExploreTab, theme } = useApp();

  const tabs: { key: string; label: string; icon: React.FC<{ className?: string }>; onClick: () => void }[] = [
    {
      key: 'home',
      label: 'Home',
      icon: Home,
      onClick: () => setCurrentView('home'),
    },
    {
      key: 'explore',
      label: 'Explore',
      icon: Compass,
      onClick: () => {
        setExploreTab('campaigns');
        setCurrentView('explore');
      },
    },
    {
      key: 'create-wizard',
      label: 'Create',
      icon: Plus,
      onClick: () => setCurrentView('create-wizard'),
    },
    {
      key: 'groups',
      label: 'Groups',
      icon: Users,
      onClick: () => {
        setExploreTab('groups');
        setCurrentView('explore');
      },
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: User,
      onClick: () => setCurrentView('profile'),
    },
  ];

  // Hide bottom nav on splash, onboarding, login, register, forgot-password
  const hiddenViews: ScreenView[] = ['splash', 'onboarding', 'login', 'register', 'forgot-password'];
  if (hiddenViews.includes(currentView)) {
    return null;
  }

  const isLight = theme === 'light';

  return (
    <div className={`shrink-0 z-40 border-t px-3 py-2 flex items-center justify-around shadow-2xl transition-colors ${
      isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#0F1219] border-slate-800 text-slate-300'
    }`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isCreate = tab.key === 'create-wizard';

        let isActive = false;
        if (tab.key === 'home') {
          isActive = currentView === 'home';
        } else if (tab.key === 'explore') {
          isActive = currentView === 'explore' && exploreTab !== 'groups';
        } else if (tab.key === 'create-wizard') {
          isActive = currentView === 'create-wizard';
        } else if (tab.key === 'groups') {
          isActive = (currentView === 'explore' && exploreTab === 'groups') || currentView === 'group-detail';
        } else if (tab.key === 'profile') {
          isActive = currentView === 'profile' || currentView === 'settings';
        }

        if (isCreate) {
          return (
            <button
              key={tab.key}
              onClick={tab.onClick}
              className="-mt-5 flex flex-col items-center group focus:outline-none"
              aria-label="Create Campaign or Event"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/40 border border-blue-400/20 group-hover:bg-blue-500 active:scale-95 transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Create</span>
            </button>
          );
        }

        return (
          <button
            key={tab.key}
            onClick={tab.onClick}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all focus:outline-none ${
              isActive
                ? 'text-blue-600 font-bold'
                : isLight
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
