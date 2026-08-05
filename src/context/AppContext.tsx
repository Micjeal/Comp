import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Campaign,
  Group,
  Event,
  EducationalResource,
  NotificationItem,
  CampaignCategory,
  ReportPayload,
} from '../types';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_GROUPS,
  INITIAL_EVENTS,
  INITIAL_RESOURCES,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { campaignsApi } from '../api/campaignsApi';
import { groupsApi } from '../api/groupsApi';
import { eventsApi } from '../api/eventsApi';
import { reportsApi } from '../api/reportsApi';
import { notificationsApi } from '../api/notificationsApi';

export type ScreenView =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'home'
  | 'explore'
  | 'search'
  | 'campaign-detail'
  | 'group-detail'
  | 'event-detail'
  | 'create-wizard'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'resources'
  | 'admin';

interface AppContextType {
  currentView: ScreenView;
  setCurrentView: (view: ScreenView) => void;
  navigationHistory: ScreenView[];
  goBack: () => void;
  
  // Active selected IDs
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
  activeEventId: string | null;
  setActiveEventId: (id: string | null) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: CampaignCategory | 'All';
  setSelectedCategory: (cat: CampaignCategory | 'All') => void;
  exploreTab: 'campaigns' | 'groups' | 'events' | 'resources';
  setExploreTab: (tab: 'campaigns' | 'groups' | 'events' | 'resources') => void;

  // State collections
  campaigns: Campaign[];
  groups: Group[];
  events: Event[];
  resources: EducationalResource[];
  notifications: NotificationItem[];

  // Actions
  joinCampaign: (id: string) => Promise<void>;
  toggleBookmarkCampaign: (id: string) => Promise<void>;
  createCampaign: (data: Partial<Campaign>) => Promise<Campaign>;
  
  joinGroup: (id: string) => Promise<void>;
  createGroup: (data: Partial<Group>) => Promise<Group>;

  registerEvent: (id: string) => Promise<void>;
  createEvent: (data: Partial<Event>) => Promise<Event>;

  markNotificationsRead: () => void;
  refreshData: () => Promise<void>;
  submitReport: (report: ReportPayload) => Promise<{ success: boolean; message: string }>;

  // Modals & Sheets
  shareModalData: { open: boolean; title: string; url: string } | null;
  openShareModal: (title: string, url: string) => void;
  closeShareModal: () => void;

  reportModalData: { open: boolean; resourceType: ReportPayload['resourceType']; resourceId: string } | null;
  openReportModal: (type: ReportPayload['resourceType'], id: string) => void;
  closeReportModal: () => void;

  successModalData: { open: boolean; title: string; message: string; actionText?: string; onAction?: () => void } | null;
  openSuccessModal: (title: string, message: string, actionText?: string, onAction?: () => void) => void;
  closeSuccessModal: () => void;

  confirmationModalData: {
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  } | null;
  openConfirmationModal: (title: string, message: string, confirmText: string, onConfirm: () => void) => void;
  closeConfirmationModal: () => void;

  // Mobile device container frame toggle
  showDeviceFrame: boolean;
  setShowDeviceFrame: (val: boolean) => void;

  // Theme mode
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentViewInternal] = useState<ScreenView>('splash');
  const [navigationHistory, setNavigationHistory] = useState<ScreenView[]>(['splash']);

  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CampaignCategory | 'All'>('All');
  const [exploreTab, setExploreTab] = useState<'campaigns' | 'groups' | 'events' | 'resources'>('campaigns');

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('cc_theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('cc_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-slate-50', 'text-slate-900');
      document.body.classList.remove('bg-[#0A0C10]', 'text-slate-300');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('bg-[#0A0C10]', 'text-slate-300');
      document.body.classList.remove('bg-slate-50', 'text-slate-900');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Persistence with localStorage - fallback to initial seeds if none saved
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('cc_campaigns');
    if (!saved) return INITIAL_CAMPAIGNS;
    try {
      const parsed: Campaign[] = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('cc_groups');
    if (!saved) return INITIAL_GROUPS;
    try {
      const parsed: Group[] = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('cc_events');
    if (!saved) return INITIAL_EVENTS;
    try {
      const parsed: Event[] = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [resources] = useState<EducationalResource[]>(INITIAL_RESOURCES);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('cc_notifications');
    if (!saved) return INITIAL_NOTIFICATIONS;
    try {
      const parsed: NotificationItem[] = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [showDeviceFrame, setShowDeviceFrame] = useState(true);

  // Modals state
  const [shareModalData, setShareModalData] = useState<{ open: boolean; title: string; url: string } | null>(null);
  const [reportModalData, setReportModalData] = useState<{ open: boolean; resourceType: ReportPayload['resourceType']; resourceId: string } | null>(null);
  const [successModalData, setSuccessModalData] = useState<{ open: boolean; title: string; message: string; actionText?: string; onAction?: () => void } | null>(null);
  const [confirmationModalData, setConfirmationModalData] = useState<{ open: boolean; title: string; message: string; confirmText: string; onConfirm: () => void } | null>(null);

  // Sync state with backend API store on mount
  useEffect(() => {
    const syncBackendData = async () => {
      try {
        const [campRes, grpRes, evtRes] = await Promise.all([
          campaignsApi.getAll(),
          groupsApi.getAll(),
          eventsApi.getAll(),
        ]);

        if (campRes.success && Array.isArray(campRes.data) && campRes.data.length > 0) {
          setCampaigns(campRes.data);
        }
        if (grpRes.success && Array.isArray(grpRes.data) && grpRes.data.length > 0) {
          setGroups(grpRes.data);
        }
        if (evtRes.success && Array.isArray(evtRes.data) && evtRes.data.length > 0) {
          setEvents(evtRes.data);
        }
      } catch (err) {
        console.warn('API Gateway Sync Note:', err);
      }
    };

    syncBackendData();
  }, []);

  useEffect(() => {
    localStorage.setItem('cc_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('cc_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('cc_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('cc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const setCurrentView = (view: ScreenView) => {
    setNavigationHistory((prev) => [...prev, view]);
    setCurrentViewInternal(view);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const nextHist = [...navigationHistory];
      nextHist.pop();
      const prevView = nextHist[nextHist.length - 1] || 'home';
      setNavigationHistory(nextHist);
      setCurrentViewInternal(prevView);
    } else {
      setCurrentViewInternal('home');
    }
  };

  const joinCampaign = async (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isJoined = !c.isJoined;
          const delta = isJoined ? 1 : -1;
          return {
            ...c,
            isJoined,
            currentValue: Math.max(0, c.currentValue + delta),
            participantsCount: Math.max(0, c.participantsCount + delta),
          };
        }
        return c;
      })
    );
    try {
      await campaignsApi.join(id);
    } catch (_) {}
  };

  const toggleBookmarkCampaign = async (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isBookmarked: !c.isBookmarked } : c))
    );
    try {
      await campaignsApi.bookmark(id);
    } catch (_) {}
  };

  const createCampaign = async (data: Partial<Campaign>): Promise<Campaign> => {
    const ownerName = data.ownerName || data.organizerName || 'Community Member';
    const ownerAvatar = data.ownerAvatar || data.organizerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
    const ownerId = data.ownerId || `usr_${Date.now()}`;

    const newCamp: Campaign = {
      id: `cmp_${Date.now()}`,
      ownerId,
      ownerName,
      ownerAvatar,
      ownerVerified: true,
      title: data.title || 'Community Initiative',
      slug: (data.title || 'campaign').toLowerCase().replace(/\s+/g, '-'),
      summary: data.summary || '',
      description: data.description || '',
      category: data.category || 'Environment',
      coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
      location: data.location || 'Kampala, Uganda',
      isOnline: Boolean(data.isOnline),
      goalType: data.goalType || 'signatures',
      goalValue: Number(data.goalValue) || 100,
      currentValue: 1,
      unitLabel: data.unitLabel || 'signatures',
      organizerName: ownerName,
      organizerAvatar: ownerAvatar,
      organizerVerified: true,
      status: 'published',
      participantsCount: 1,
      publishedAt: new Date().toISOString(),
      isJoined: true,
      goalsList: data.goalsList || [],
    };

    setCampaigns((prev) => [newCamp, ...prev]);

    try {
      await campaignsApi.create(data as any);
    } catch (_) {}

    return newCamp;
  };

  const joinGroup = async (id: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const isMember = !g.isMember;
          return {
            ...g,
            isMember,
            membershipStatus: isMember ? 'approved' : 'none',
            memberCount: isMember ? g.memberCount + 1 : Math.max(0, g.memberCount - 1),
          };
        }
        return g;
      })
    );
    try {
      await groupsApi.join(id);
    } catch (_) {}
  };

  const createGroup = async (data: Partial<Group>): Promise<Group> => {
    const adminName = data.adminName || 'Community Leader';
    const ownerId = data.ownerId || `usr_${Date.now()}`;

    const newGroup: Group = {
      id: `grp_${Date.now()}`,
      ownerId,
      name: data.name || 'New Community Group',
      description: data.description || '',
      category: data.category || 'Youth',
      coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1000',
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      visibility: data.visibility || 'public',
      location: data.location || 'Uganda',
      memberCount: 1,
      isMember: true,
      membershipStatus: 'approved',
      createdAt: new Date().toISOString(),
      adminName,
    };

    setGroups((prev) => [newGroup, ...prev]);
    try {
      await groupsApi.create(data as any);
    } catch (_) {}
    return newGroup;
  };

  const registerEvent = async (id: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const isRegistered = !e.isRegistered;
          return {
            ...e,
            isRegistered,
            registeredCount: isRegistered ? e.registeredCount + 1 : Math.max(0, e.registeredCount - 1),
          };
        }
        return e;
      })
    );
    try {
      await eventsApi.register(id);
    } catch (_) {}
  };

  const createEvent = async (data: Partial<Event>): Promise<Event> => {
    const organizerName = data.organizerName || 'Community Organizer';
    const organizerAvatar = data.organizerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
    const organizerId = data.organizerId || `usr_${Date.now()}`;

    const newEvt: Event = {
      id: `evt_${Date.now()}`,
      organizerId,
      organizerName,
      organizerAvatar,
      title: data.title || 'Community Gathering',
      description: data.description || '',
      category: data.category || 'Environment',
      coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=1000',
      venue: data.venue || 'Community Grounds',
      isOnline: Boolean(data.isOnline),
      startTime: data.startTime || new Date().toISOString(),
      endTime: data.endTime || new Date().toISOString(),
      capacity: data.capacity || 100,
      registeredCount: 1,
      isRegistered: true,
    };
    setEvents((prev) => [newEvt, ...prev]);
    try {
      await eventsApi.create(data as any);
    } catch (_) {}
    return newEvt;
  };

  const markNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    );
    try {
      notificationsApi.markAllRead();
    } catch (_) {}
  };

  const refreshData = async () => {
    // Simulate real network synchronization delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update notifications with a fresh live update if not already present
    setNotifications((prev) => {
      const refreshedId = `notif_refresh_${Date.now()}`;
      const newNotif: NotificationItem = {
        id: refreshedId,
        userId: 'usr_001',
        type: 'campaign',
        title: 'Community Feed Updated',
        message: 'Fresh supporter activity and campaign statistics have been retrieved.',
        createdAt: new Date().toISOString(),
        readAt: null,
        resourceType: 'campaign',
        resourceId: 'cmp_001',
      };
      return [newNotif, ...prev];
    });

    // Touch campaigns to trigger component re-eval
    setCampaigns((prev) => [...prev]);
  };

  const submitReport = async (report: ReportPayload) => {
    try {
      await reportsApi.submit(report);
      return {
        success: true,
        message: 'Thank you. Your report has been submitted for review according to Community Standards.',
      };
    } catch (_) {
      return {
        success: true,
        message: 'Report logged for moderation review.',
      };
    }
  };

  // Modals helpers
  const openShareModal = (title: string, url: string) => setShareModalData({ open: true, title, url });
  const closeShareModal = () => setShareModalData(null);

  const openReportModal = (resourceType: ReportPayload['resourceType'], resourceId: string) =>
    setReportModalData({ open: true, resourceType, resourceId });
  const closeReportModal = () => setReportModalData(null);

  const openSuccessModal = (title: string, message: string, actionText?: string, onAction?: () => void) =>
    setSuccessModalData({ open: true, title, message, actionText, onAction });
  const closeSuccessModal = () => setSuccessModalData(null);

  const openConfirmationModal = (title: string, message: string, confirmText: string, onConfirm: () => void) =>
    setConfirmationModalData({ open: true, title, message, confirmText, onConfirm });
  const closeConfirmationModal = () => setConfirmationModalData(null);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        navigationHistory,
        goBack,
        activeCampaignId,
        setActiveCampaignId,
        activeGroupId,
        setActiveGroupId,
        activeEventId,
        setActiveEventId,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        exploreTab,
        setExploreTab,
        campaigns,
        groups,
        events,
        resources,
        notifications,
        joinCampaign,
        toggleBookmarkCampaign,
        createCampaign,
        joinGroup,
        createGroup,
        registerEvent,
        createEvent,
        markNotificationsRead,
        refreshData,
        submitReport,
        shareModalData,
        openShareModal,
        closeShareModal,
        reportModalData,
        openReportModal,
        closeReportModal,
        successModalData,
        openSuccessModal,
        closeSuccessModal,
        confirmationModalData,
        openConfirmationModal,
        closeConfirmationModal,
        showDeviceFrame,
        setShowDeviceFrame,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
