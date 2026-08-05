import React, { useState } from 'react';
import { ArrowLeft, Bookmark, Share2, MapPin, Calendar, CheckCircle, ShieldAlert, Users, Plus, Flag, Send, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CampaignProgress } from '../components/campaigns/CampaignProgress';
import { campaignsApi } from '../api/campaignsApi';
import { CampaignUpdate } from '../types';

export const CampaignDetailView: React.FC = () => {
  const {
    activeCampaignId,
    campaigns,
    goBack,
    joinCampaign,
    toggleBookmarkCampaign,
    openShareModal,
    openReportModal,
    events,
  } = useApp();

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'updates' | 'goals'>('about');
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [showAddUpdate, setShowAddUpdate] = useState(false);

  const campaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];
  if (!campaign) return null;

  const updatesList: CampaignUpdate[] = campaign.updates || [];

  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateContent.trim()) return;

    const authorName = user?.fullName || campaign.organizerName || campaign.ownerName || 'Organizer';
    const authorAvatar = user?.avatarUrl || campaign.organizerAvatar || campaign.ownerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';

    const newUpd: CampaignUpdate = {
      id: `upd_${Date.now()}`,
      campaignId: campaign.id,
      title: newUpdateTitle.trim() || 'Supporter Update',
      content: newUpdateContent.trim(),
      createdAt: new Date().toISOString(),
      authorName,
      authorAvatar,
    };

    if (!campaign.updates) campaign.updates = [];
    campaign.updates.unshift(newUpd);

    setNewUpdateTitle('');
    setNewUpdateContent('');
    setShowAddUpdate(false);

    try {
      await campaignsApi.addUpdate(campaign.id, newUpd.title, newUpd.content);
    } catch (err) {
      console.warn('API campaign update error:', err);
    }
  };

  const relatedEvents = events.filter((e) => e.campaignId === campaign.id);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 pb-28 max-w-md mx-auto relative">
      {/* Hero Image */}
      <div className="relative h-64 sm:h-72 w-full bg-slate-900">
        <img src={campaign.coverUrl} alt={campaign.title} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/40 to-transparent" />

        {/* Overlay Navigation Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={goBack}
            className="p-2.5 rounded-xl bg-[#0F1219]/80 backdrop-blur-md text-white border border-slate-700/60 hover:bg-slate-800 transition-all focus:outline-none"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openShareModal(campaign.title, window.location.href)}
              className="p-2.5 rounded-xl bg-[#0F1219]/80 backdrop-blur-md text-white border border-slate-700/60 hover:bg-slate-800 transition-all focus:outline-none"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => toggleBookmarkCampaign(campaign.id)}
              className={`p-2.5 rounded-xl backdrop-blur-md transition-all focus:outline-none ${
                campaign.isBookmarked
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0F1219]/80 text-white border border-slate-700/60 hover:bg-slate-800'
              }`}
              aria-label="Bookmark"
            >
              <Bookmark className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-blue-600 text-white shadow-md shadow-blue-900/40">
            {campaign.category}
          </span>
        </div>
      </div>

      {/* Main Content Overlapping Panel */}
      <div className="bg-[#0F1219] rounded-t-3xl -mt-6 relative z-10 p-5 space-y-5 shadow-2xl border-t border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white leading-snug">{campaign.title}</h1>

          {/* Organizer info */}
          <div className="flex items-center justify-between pt-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <img
                src={campaign.ownerAvatar}
                alt={campaign.ownerName}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
              />
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-white">{campaign.ownerName}</p>
                  {campaign.ownerVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-500/20" />}
                </div>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Organizer • Verified Initiative</p>
              </div>
            </div>

            <button
              onClick={() => openReportModal('campaign', campaign.id)}
              className="p-2 text-slate-500 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-colors"
              title="Report content"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location & Date metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 bg-[#0A0C10] p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">{campaign.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">{new Date(campaign.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="p-4 bg-[#0A0C10] rounded-xl border border-slate-800 space-y-2">
          <CampaignProgress
            goalType={campaign.goalType}
            goalValue={campaign.goalValue}
            currentValue={campaign.currentValue}
            unitLabel={campaign.unitLabel}
          />
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            {campaign.participantsCount} citizens joined this initiative
          </p>
        </div>

        {/* Tabs: About, Goals, Updates */}
        <div className="border-b border-slate-800 flex items-center gap-6 text-xs font-mono font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2 transition-all ${
              activeTab === 'about' ? 'text-blue-400 border-b-2 border-blue-400' : 'hover:text-white'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`pb-2 transition-all ${
              activeTab === 'goals' ? 'text-blue-400 border-b-2 border-blue-400' : 'hover:text-white'
            }`}
          >
            Key Goals
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`pb-2 transition-all ${
              activeTab === 'updates' ? 'text-blue-400 border-b-2 border-blue-400' : 'hover:text-white'
            }`}
          >
            Updates ({campaign.updates?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            <p>{campaign.description}</p>

            {/* Related Events if any */}
            {relatedEvents.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <h4 className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Associated Events</h4>
                {relatedEvents.map((evt) => (
                  <div key={evt.id} className="p-3 bg-[#0A0C10] rounded-xl border border-slate-800">
                    <p className="font-bold text-white">{evt.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{evt.venue} • {new Date(evt.startTime).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-3 text-xs">
            {campaign.goalsList && campaign.goalsList.length > 0 ? (
              campaign.goalsList.map((g, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-[#0A0C10] rounded-xl border border-slate-800">
                  <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-300">{g}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 font-mono">Lawful advocacy and civic participation goals.</p>
            )}
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-4">
            {/* Post update/discussion form */}
            <div className="p-3 bg-[#0A0C10] rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Campaign Discussion & Updates
                </span>
                {!showAddUpdate && (
                  <button
                    onClick={() => setShowAddUpdate(true)}
                    className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Post Comment / Update
                  </button>
                )}
              </div>

              {showAddUpdate && (
                <form onSubmit={handlePublishUpdate} className="space-y-2.5 pt-1">
                  <input
                    type="text"
                    value={newUpdateTitle}
                    onChange={(e) => setNewUpdateTitle(e.target.value)}
                    placeholder="Update Title / Topic (optional)..."
                    className="w-full p-2.5 bg-[#0F1219] text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                  <textarea
                    required
                    rows={3}
                    value={newUpdateContent}
                    onChange={(e) => setNewUpdateContent(e.target.value)}
                    placeholder="Share a campaign update, comment, or start a discussion..."
                    className="w-full p-2.5 bg-[#0F1219] text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUpdate(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 flex items-center gap-1.5 shadow-md shadow-blue-900/40"
                    >
                      <Send className="w-3 h-3" /> Post
                    </button>
                  </div>
                </form>
              )}
            </div>

            {campaign.updates && campaign.updates.length > 0 ? (
              campaign.updates.map((upd) => (
                <div key={upd.id} className="p-4 bg-[#0A0C10] rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={upd.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={upd.authorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-bold text-xs text-white">{upd.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(upd.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-7">{upd.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs font-mono text-slate-500 py-4 text-center">No campaign discussions or updates posted yet. Click above to post the first update!</p>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0F1219] border-t border-slate-800 p-3 flex items-center justify-between gap-3 shadow-2xl max-w-md mx-auto">
        <button
          onClick={() => openShareModal(campaign.title, window.location.href)}
          className="p-3 bg-[#0A0C10] text-slate-300 rounded-xl border border-slate-800 font-bold hover:bg-slate-800 transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>

        <button
          onClick={() => joinCampaign(campaign.id)}
          className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 ${
            campaign.isJoined
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/40'
          }`}
        >
          {campaign.isJoined ? 'Joined Initiative' : 'Join Campaign'}
        </button>
      </div>
    </div>
  );
};
