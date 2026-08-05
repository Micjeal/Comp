import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp, ScreenView } from './context/AppContext';
import { TopHeader } from './components/layout/TopHeader';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { ShareSheet } from './components/common/ShareSheet';
import { ReportModal } from './components/common/ReportModal';
import { SuccessModal, ConfirmationModal } from './components/common/SuccessModal';
import { ApiGatewayInspector } from './components/ApiGatewayInspector';

import { SplashView } from './views/SplashView';
import { OnboardingView } from './views/OnboardingView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { CampaignDetailView } from './views/CampaignDetailView';
import { GroupDetailView } from './views/GroupDetailView';
import { EventDetailView } from './views/EventDetailView';
import { CreateWizardView } from './views/CreateWizardView';
import { NotificationsView } from './views/NotificationsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { ResourcesView } from './views/ResourcesView';
import { AdminView } from './views/AdminView';

const MainRouter: React.FC = () => {
  const { currentView, showDeviceFrame, theme } = useApp();
  const isLight = theme === 'light';

  const renderView = () => {
    switch (currentView) {
      case 'splash':
        return <SplashView />;
      case 'onboarding':
        return <OnboardingView />;
      case 'login':
        return <LoginView />;
      case 'register':
        return <RegisterView />;
      case 'forgot-password':
        return <ForgotPasswordView />;
      case 'home':
        return <HomeView />;
      case 'explore':
      case 'search':
        return <ExploreView />;
      case 'campaign-detail':
        return <CampaignDetailView />;
      case 'group-detail':
        return <GroupDetailView />;
      case 'event-detail':
        return <EventDetailView />;
      case 'create-wizard':
        return <CreateWizardView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'resources':
        return <ResourcesView />;
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  const isFullscreenView =
    currentView === 'splash' || currentView === 'onboarding' || currentView === 'login' || currentView === 'register';

  const mainNavViews: ScreenView[] = ['home', 'explore', 'profile', 'create-wizard'];
  const showBack = !mainNavViews.includes(currentView);

  return (
    <div className={`min-h-screen font-sans flex items-center justify-center p-0 sm:p-4 selection:bg-blue-600 selection:text-white transition-colors ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0A0C10] text-slate-300'
    }`}>
      <ApiGatewayInspector />

      {/* Main Container - Mobile device frame mode or full view */}
      <div
        className={`w-full transition-all duration-300 overflow-hidden relative flex flex-col ${
          isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0C10] text-slate-300'
        } ${
          showDeviceFrame && !isFullscreenView
            ? `max-w-[430px] h-[880px] max-h-[92vh] sm:rounded-[40px] sm:border-[8px] ${
                isLight
                  ? 'sm:border-slate-300 sm:shadow-2xl sm:shadow-slate-400/30'
                  : 'sm:border-slate-800/90 sm:shadow-2xl sm:shadow-blue-950/20'
              }`
            : 'max-w-md min-h-screen'
        }`}
      >
        {!isFullscreenView && <TopHeader showBack={showBack} />}

        <main className="w-full flex-1 overflow-y-auto">{renderView()}</main>

        <BottomNavigation />

        {/* Global Modals */}
        <ShareSheet />
        <ReportModal />
        <SuccessModal />
        <ConfirmationModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainRouter />
      </AppProvider>
    </AuthProvider>
  );
}
