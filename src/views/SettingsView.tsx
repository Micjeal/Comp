import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  Download,
  Trash2,
  LogOut,
  ChevronRight,
  X,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Smartphone,
  Mail,
  ChevronDown,
  ChevronUp,
  Save,
  UserX,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { goBack, openConfirmationModal, openSuccessModal, setCurrentView, campaigns, groups, events, theme, toggleTheme } = useApp();

  const [activeModal, setActiveModal] = useState<
    'edit-profile' | 'change-password' | 'notifications' | 'privacy' | 'help' | 'guidelines' | 'export' | null
  >(null);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
    coverUrl: user?.coverUrl || '',
  });

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState('');

  // Notification Preferences State
  const [notifSettings, setNotifSettings] = useState(() => {
    const saved = localStorage.getItem('cc_notif_prefs');
    return saved
      ? JSON.parse(saved)
      : {
          pushCampaigns: true,
          pushGroups: true,
          pushEvents: true,
          pushMentions: true,
          emailDigest: true,
          emailMessages: false,
          emailSafety: true,
        };
  });

  // Privacy Preferences State
  const [privacySettings, setPrivacySettings] = useState(() => {
    const saved = localStorage.getItem('cc_privacy_prefs');
    return saved
      ? JSON.parse(saved)
      : {
          profileVisibility: 'Public',
          directMessaging: 'Everyone',
          showLocation: true,
          showJoinedCampaigns: true,
          blockedUsers: ['spam_bot_99', 'civic_troll_04'],
        };
  });

  // Help Centre State
  const [helpSearch, setHelpSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [supportTicket, setSupportTicket] = useState({ category: 'General Inquiry', subject: '', message: '' });

  // Community Guidelines Acknowledged State
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(true);

  // Export Data State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleDeleteAccount = () => {
    openConfirmationModal(
      'Delete Account & Data?',
      'This action is irreversible. All your profile data, campaign ownership, and saved history will be permanently deleted.',
      'Delete Permanently',
      () => {
        logout();
        setCurrentView('login');
      }
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileForm);
    setActiveModal(null);
    openSuccessModal('Profile Saved', 'Your profile details and bio have been updated successfully.');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordError('');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setActiveModal(null);
    openSuccessModal('Password Updated', 'Your security password has been changed successfully.');
  };

  const handleSaveNotifSettings = () => {
    localStorage.setItem('cc_notif_prefs', JSON.stringify(notifSettings));
    setActiveModal(null);
    openSuccessModal('Notifications Saved', 'Your notification preferences have been saved.');
  };

  const handleSavePrivacySettings = () => {
    localStorage.setItem('cc_privacy_prefs', JSON.stringify(privacySettings));
    setActiveModal(null);
    openSuccessModal('Privacy Settings Saved', 'Your privacy and safety controls have been updated.');
  };

  const handleUnblockUser = (username: string) => {
    setPrivacySettings((prev: any) => ({
      ...prev,
      blockedUsers: prev.blockedUsers.filter((u: string) => u !== username),
    }));
  };

  const handleSubmitSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportTicket.subject || !supportTicket.message) return;
    setSupportTicket({ category: 'General Inquiry', subject: '', message: '' });
    setActiveModal(null);
    openSuccessModal(
      'Support Ticket Submitted',
      'Thank you! Our community support team will review your inquiry within 24 hours.'
    );
  };

  const handleTriggerExport = () => {
    setIsExporting(true);
    setExportProgress(10);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);

          // Generate JSON blob and trigger download
          const exportData = {
            exportDate: new Date().toISOString(),
            user,
            campaigns: campaigns.filter((c) => c.ownerId === user?.id || c.isJoined),
            groups: groups.filter((g) => g.isMember),
            events: events.filter((e) => e.isRegistered),
            notificationPreferences: notifSettings,
            privacyPreferences: privacySettings,
          };

          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute('href', dataStr);
          downloadAnchor.setAttribute('download', `community_connect_data_${user?.username || 'user'}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();

          setActiveModal(null);
          openSuccessModal('Data Package Exported', 'Your account data has been compiled and downloaded as a JSON file.');
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const settingsGroups = [
    {
      section: 'Account Settings',
      items: [
        { label: 'Edit Profile & Bio', icon: User, action: () => setActiveModal('edit-profile') },
        { label: 'Change Password', icon: Lock, action: () => setActiveModal('change-password') },
      ],
    },
    {
      section: 'Preferences & Notifications',
      items: [
        {
          label: theme === 'dark' ? 'Appearance: Dark Mode (Switch to Light)' : 'Appearance: Light Mode (Switch to Dark)',
          icon: theme === 'dark' ? Moon : Sun,
          action: toggleTheme,
        },
        { label: 'Push & Email Notifications', icon: Bell, action: () => setActiveModal('notifications') },
        { label: 'Privacy & Safety Controls', icon: Shield, action: () => setActiveModal('privacy') },
      ],
    },
    {
      section: 'Support & Community Standards',
      items: [
        { label: 'Help Centre & FAQ', icon: HelpCircle, action: () => setActiveModal('help') },
        { label: 'Community Safety Guidelines', icon: FileText, action: () => setActiveModal('guidelines') },
      ],
    },
    {
      section: 'Data & Account Management',
      items: [
        { label: 'Download My Data', icon: Download, action: () => setActiveModal('export') },
      ],
    },
  ];

  const faqs = [
    {
      q: 'How do I launch a verified civic campaign?',
      a: 'Navigate to the Create wizard, select "Campaign", and fill out your initiative details. Verified accounts get a blue checkmark badge once campaign identity validation is completed by group admins.',
    },
    {
      q: 'What are Community Safety Standards?',
      a: 'Community Connect is committed to non-violent, constructive civic engagement. Discrimination, hate speech, harassment, and misinformation are strictly prohibited.',
    },
    {
      q: 'How is petition signature and goal data audited?',
      a: 'All actions are tied to authenticated user profiles or encrypted signatures to prevent bot duplicate submissions.',
    },
    {
      q: 'How to report harassment or policy violations?',
      a: 'Use the Report button on any campaign, event, or group detail page to submit a flagged report directly to moderation review.',
    },
    {
      q: 'Can I host online-only community events?',
      a: 'Yes! When creating an event, toggle "Online Event" and provide your video call or live stream link.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(helpSearch.toLowerCase()) || f.a.toLowerCase().includes(helpSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-28 max-w-md mx-auto text-slate-300">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button onClick={goBack} className="p-2 rounded-xl bg-[#0F1219] text-slate-400 hover:text-white border border-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-white">Settings</h1>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {settingsGroups.map((grp) => (
          <div key={grp.section} className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-1">{grp.section}</h3>
            <div className="bg-[#0F1219] rounded-2xl border border-slate-800 divide-y divide-slate-800/80 shadow-xl overflow-hidden">
              {grp.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-[#0A0C10] transition-colors text-xs font-medium text-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Destructive actions */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider px-1">Danger Zone</h3>
          <div className="bg-[#0F1219] rounded-2xl border border-red-500/30 divide-y divide-red-500/20 shadow-xl overflow-hidden">
            <button
              onClick={() => {
                logout();
                setCurrentView('login');
              }}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-red-500/10 transition-colors text-xs font-bold text-red-400"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sign Out</span>
              </div>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-red-500/10 transition-colors text-xs font-bold text-red-400"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Delete Account</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* MODALS / SUB-PANELS */}

      {/* 1. EDIT PROFILE MODAL */}
      {activeModal === 'edit-profile' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0F1219] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" /> Edit Profile & Bio
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#0A0C10] border border-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Username</label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Location</label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Bio & Statement</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Avatar URL</label>
                <input
                  type="url"
                  value={profileForm.avatarUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CHANGE PASSWORD MODAL */}
      {activeModal === 'change-password' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0F1219] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" /> Change Security Password
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#0A0C10] border border-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-5 space-y-4 text-xs font-mono">
              {passwordError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. NOTIFICATIONS MODAL */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0F1219] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" /> Notification Preferences
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#0A0C10] border border-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <div className="space-y-3">
                <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" /> Mobile Push Notifications
                </h3>

                {[
                  { key: 'pushCampaigns', label: 'Campaign Goal & Milestone Updates' },
                  { key: 'pushGroups', label: 'Group Posts & Community Discussion' },
                  { key: 'pushEvents', label: 'Upcoming Event Reminders & RSVPs' },
                  { key: 'pushMentions', label: 'Direct Mentions & Comment Replies' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-[#0A0C10] rounded-xl border border-slate-800">
                    <span className="text-slate-200 font-medium">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => setNotifSettings({ ...notifSettings, [item.key]: !(notifSettings as any)[item.key] })}
                      className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                        (notifSettings as any)[item.key] ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          (notifSettings as any)[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Notifications
                </h3>

                {[
                  { key: 'emailDigest', label: 'Weekly Civic Action Digest' },
                  { key: 'emailMessages', label: 'Direct Message Notifications' },
                  { key: 'emailSafety', label: 'Critical Security & Safety Notices' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-[#0A0C10] rounded-xl border border-slate-800">
                    <span className="text-slate-200 font-medium">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => setNotifSettings({ ...notifSettings, [item.key]: !(notifSettings as any)[item.key] })}
                      className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                        (notifSettings as any)[item.key] ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          (notifSettings as any)[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotifSettings}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRIVACY & SAFETY CONTROLS MODAL */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0F1219] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" /> Privacy & Safety Controls
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#0A0C10] border border-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Profile Visibility</label>
                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                  className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Public">Public (Anyone can view profile)</option>
                  <option value="Members Only">Community Members Only</option>
                  <option value="Private">Private (Invited connections only)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Who Can Message Me</label>
                <select
                  value={privacySettings.directMessaging}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, directMessaging: e.target.value })}
                  className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Everyone">Everyone on Community Connect</option>
                  <option value="Group Members">Shared Group Members Only</option>
                  <option value="Verified Accounts Only">Verified Accounts Only</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-[#0A0C10] rounded-xl border border-slate-800">
                  <span className="text-slate-200 font-medium">Show Location on Public Profile</span>
                  <button
                    type="button"
                    onClick={() => setPrivacySettings({ ...privacySettings, showLocation: !privacySettings.showLocation })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                      privacySettings.showLocation ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        privacySettings.showLocation ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0A0C10] rounded-xl border border-slate-800">
                  <span className="text-slate-200 font-medium">Show Joined Initiatives Publicly</span>
                  <button
                    type="button"
                    onClick={() => setPrivacySettings({ ...privacySettings, showJoinedCampaigns: !privacySettings.showJoinedCampaigns })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                      privacySettings.showJoinedCampaigns ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        privacySettings.showJoinedCampaigns ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Blocked Accounts Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h3 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Blocked Accounts ({privacySettings.blockedUsers.length})</h3>
                {privacySettings.blockedUsers.length === 0 ? (
                  <p className="text-slate-500 text-[11px] italic">No accounts blocked.</p>
                ) : (
                  <div className="space-y-2">
                    {privacySettings.blockedUsers.map((un: string) => (
                      <div key={un} className="flex items-center justify-between p-2.5 bg-[#0A0C10] rounded-xl border border-slate-800">
                        <span className="text-slate-300 font-mono">@{un}</span>
                        <button
                          type="button"
                          onClick={() => handleUnblockUser(un)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3 text-red-400" /> Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePrivacySettings}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40"
                >
                  Save Privacy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. HELP CENTRE & FAQ MODAL */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0F1219] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" /> Help Centre & Support
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#0A0C10] border border-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* FAQ Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={helpSearch}
                  onChange={(e) => setHelpSearch(e.target.value)}
                  placeholder="Search help topics & questions..."
                  className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Accordion FAQ list */}
              <div className="space-y-2">
                <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">Frequently Asked Questions</h3>
                {filteredFaqs.length === 0 ? (
                  <p className="text-slate-500 italic py-4">No matching help articles found.</p>
                ) : (
                  filteredFaqs.map((faq, i) => {
                    const isOpen = openFaqIndex === i;
                    return (
                      <div key={i} className="border border-slate-800 rounded-xl overflow-hidden bg-[#0A0C10]">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                          className="w-full p-3 text-left font-bold text-slate-200 flex items-center justify-between hover:text-white transition-colors"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                        </button>
                        {isOpen && <div className="p-3 pt-0 text-slate-400 leading-relaxed border-t border-slate-800/60 bg-[#0F1219]">{faq.a}</div>}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Submit Support Inquiry Form */}
              <form onSubmit={handleSubmitSupportTicket} className="space-y-3 pt-3 border-t border-slate-800">
                <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Contact Support Team
                </h3>

                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Category</label>
                  <select
                    value={supportTicket.category}
                    onChange={(e) => setSupportTicket({ ...supportTicket, category: e.target.value })}
                    className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Account & Login">Account & Login</option>
                    <option value="Campaign Verification">Campaign Verification</option>
                    <option value="Report Bug">Report Technical Bug</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Subject</label>
                  <input
                    type="text"
                    value={supportTicket.subject}
                    onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                    placeholder="Brief issue title"
                    className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Message Details</label>
                  <textarea
                    rows={3}
                    value={supportTicket.message}
                    onChange={(e) => setSupportTicket({ ...supportTicket, message: e.target.value })}
                    placeholder="Describe how we can assist you..."
                    className="w-full bg-[#0A0C10] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 font-mono"
                >
                  <Send className="w-4 h-4" /> Submit Support Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. COMMUNITY GUIDELINES MODAL */}
      {activeModal === 'guidelines' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0F1219] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Community Safety Guidelines
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#0A0C10] border border-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <p className="font-mono text-slate-400 text-[11px]">
                Community Connect is built on constructive civic participation. By using this platform, all members pledge to uphold the following 4 core principles:
              </p>

              <div className="space-y-3 font-sans">
                <div className="p-3 bg-[#0A0C10] rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" /> 1. Inclusive & Non-Discriminatory Dialogue
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Respect diverse backgrounds and viewpoints. Discrimination based on ethnicity, gender, religion, or background is forbidden.
                  </p>
                </div>

                <div className="p-3 bg-[#0A0C10] rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" /> 2. Lawful & Peaceful Advocacy
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    All petitioning, events, and community action must strictly adhere to peaceful non-violent engagement.
                  </p>
                </div>

                <div className="p-3 bg-[#0A0C10] rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" /> 3. Protection Against Doxxing & Harassment
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Sharing private personal information of others without permission results in immediate account suspension.
                  </p>
                </div>

                <div className="p-3 bg-[#0A0C10] rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" /> 4. Verified Campaign Transparency
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Campaign organizers must provide truthful goal milestones and accurate reporting of community progress.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-mono text-[11px]">
                  <input
                    type="checkbox"
                    checked={guidelinesAccepted}
                    onChange={(e) => setGuidelinesAccepted(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span>I acknowledge and agree to uphold these standards</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    openSuccessModal('Standards Confirmed', 'Thank you for upholding Community Safety Guidelines.');
                  }}
                  disabled={!guidelinesAccepted}
                  className="w-full py-3 rounded-xl bg-blue-600 disabled:opacity-50 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40 font-mono"
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DOWNLOAD MY DATA MODAL */}
      {activeModal === 'export' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0F1219] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" /> Export Account Data
              </h2>
              <button
                disabled={isExporting}
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#0A0C10] border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono">
              <p className="text-slate-400 leading-relaxed">
                Download a complete JSON archive of your personal account data, created campaigns, group memberships, event RSVPs, and settings.
              </p>

              <div className="p-3 bg-[#0A0C10] rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Profile Metadata</span>
                  <span className="text-teal-400 font-bold">Included</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Joined Initiatives</span>
                  <span className="text-teal-400 font-bold">{campaigns.filter((c) => c.isJoined).length} Items</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Group Memberships</span>
                  <span className="text-teal-400 font-bold">{groups.filter((g) => g.isMember).length} Groups</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Event RSVPs</span>
                  <span className="text-teal-400 font-bold">{events.filter((e) => e.isRegistered).length} Events</span>
                </div>
              </div>

              {isExporting && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Compiling JSON Archive...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-[#0A0C10] h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleTriggerExport}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> {isExporting ? 'Exporting...' : 'Download JSON Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
