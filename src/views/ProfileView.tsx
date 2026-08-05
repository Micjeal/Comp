import React, { useState } from 'react';
import { Settings, MapPin, CheckCircle, Edit3, Share2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { CampaignCard } from '../components/campaigns/CampaignCard';

export const ProfileView: React.FC = () => {
  const { user, logout } = useAuth();
  const { campaigns, setCurrentView, openShareModal } = useApp();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'saved'>('campaigns');

  if (!user) return null;

  const stats = user.stats || {
    campaignsCount: 0,
    groupsCount: 0,
    eventsCount: 0,
    followersCount: 0,
  };

  const myCampaigns = campaigns.filter((c) => c.ownerId === user.id || c.isJoined);
  const savedCampaigns = campaigns.filter((c) => c.isBookmarked);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 pb-24 max-w-md mx-auto">
      {/* Cover Header */}
      <div className="relative h-44 bg-[#0F1219]">
        <img src={user.coverUrl} alt={user.fullName} className="w-full h-full object-cover opacity-75" />
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setCurrentView('settings')}
            className="p-2.5 rounded-xl bg-[#0F1219]/80 backdrop-blur-md text-white border border-slate-700/60 hover:bg-slate-800 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Info Container */}
      <div className="bg-[#0F1219] p-5 rounded-b-3xl border-b border-slate-800 space-y-4 shadow-xl -mt-8 relative z-10 mx-4 rounded-t-3xl border-t">
        <div className="flex items-end justify-between -mt-12">
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-800 shadow-xl bg-[#0A0C10]"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => openShareModal(user.fullName, window.location.href)}
              className="p-2.5 bg-[#0A0C10] border border-slate-800 rounded-xl text-slate-400 hover:text-white"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentView('admin')}
              className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-mono font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-1"
            >
              Admin
            </button>

            <button
              onClick={() => setCurrentView('settings')}
              className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-mono font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold text-white">{user.fullName}</h1>
            {user.verified && <CheckCircle className="w-4 h-4 text-blue-400 fill-blue-500/20" />}
          </div>
          <p className="text-xs font-mono text-slate-400">@{user.username}</p>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{user.bio}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5 font-mono">
            <MapPin className="w-3.5 h-3.5 text-blue-400" /> {user.location}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center">
          <div className="p-2 bg-[#0A0C10] rounded-xl border border-slate-800/60">
            <p className="text-base font-mono font-bold text-white">{stats.campaignsCount}</p>
            <p className="text-[10px] text-slate-400 font-mono">Campaigns</p>
          </div>
          <div className="p-2 bg-[#0A0C10] rounded-xl border border-slate-800/60">
            <p className="text-base font-mono font-bold text-white">{stats.groupsCount}</p>
            <p className="text-[10px] text-slate-400 font-mono">Groups</p>
          </div>
          <div className="p-2 bg-[#0A0C10] rounded-xl border border-slate-800/60">
            <p className="text-base font-mono font-bold text-white">{stats.eventsCount}</p>
            <p className="text-[10px] text-slate-400 font-mono">Events</p>
          </div>
          <div className="p-2 bg-[#0A0C10] rounded-xl border border-slate-800/60">
            <p className="text-base font-mono font-bold text-white">{stats.followersCount}</p>
            <p className="text-[10px] text-slate-400 font-mono">Followers</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-t border-slate-800 pt-3 text-xs font-mono font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-2 ${activeTab === 'campaigns' ? 'text-blue-400 border-b-2 border-blue-400' : 'hover:text-white'}`}
          >
            My Joined Initiatives ({myCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-2 ${activeTab === 'saved' ? 'text-blue-400 border-b-2 border-blue-400' : 'hover:text-white'}`}
          >
            Bookmarked ({savedCampaigns.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            {myCampaigns.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 text-center py-8">You have not joined any active campaigns yet.</p>
            ) : (
              myCampaigns.map((camp) => <CampaignCard key={camp.id} campaign={camp} />)
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedCampaigns.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 text-center py-8">No bookmarked campaigns saved.</p>
            ) : (
              savedCampaigns.map((camp) => <CampaignCard key={camp.id} campaign={camp} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
};
