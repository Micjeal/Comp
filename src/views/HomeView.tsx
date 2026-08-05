import React from 'react';
import { Search, SlidersHorizontal, PlusCircle, Users, Calendar, HeartHandshake, ArrowRight, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { PullToRefresh } from '../components/common/PullToRefresh';

export const HomeView: React.FC = () => {
  const { campaigns, setCurrentView, setSearchQuery, setActiveCampaignId, refreshData } = useApp();

  const featuredCampaign = campaigns[0];
  const trendingCampaigns = campaigns.slice(1, 4);

  const quickActions = [
    {
      title: 'Start Campaign',
      desc: 'Organize lawful civic action',
      icon: PlusCircle,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      action: () => setCurrentView('create-wizard'),
    },
    {
      title: 'Create Group',
      desc: 'Build community hubs',
      icon: Users,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      action: () => setCurrentView('create-wizard'),
    },
    {
      title: 'Browse Events',
      desc: 'Workshops & cleanups',
      icon: Calendar,
      color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      action: () => setCurrentView('explore'),
    },
    {
      title: 'Civic Guides',
      desc: 'Lawful advocacy & safety',
      icon: BookOpen,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      action: () => setCurrentView('resources'),
    },
  ];

  return (
    <PullToRefresh onRefresh={refreshData} className="min-h-full">
      <div className="p-4 sm:p-6 space-y-6 pb-24 max-w-md mx-auto">
      {/* Search Bar */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search campaigns, groups or events"
            onFocus={() => setCurrentView('explore')}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0F1219] text-xs font-medium text-white placeholder-slate-500 rounded-2xl border border-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          />
        </div>
        <button
          onClick={() => setCurrentView('explore')}
          className="p-3 bg-[#0F1219] border border-slate-800 text-slate-400 hover:text-white rounded-2xl shadow-sm hover:bg-slate-800 transition-colors"
          aria-label="Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Featured Campaign Banner */}
      {featuredCampaign && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Featured Initiative
            </h2>
            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">SPOTLIGHT</span>
          </div>

          <div
            onClick={() => {
              setActiveCampaignId(featuredCampaign.id);
              setCurrentView('campaign-detail');
            }}
            className="relative h-64 rounded-2xl overflow-hidden shadow-xl border border-slate-800 cursor-pointer group bg-[#0F1219]"
          >
            <img
              src={featuredCampaign.coverUrl}
              alt={featuredCampaign.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 to-transparent p-5 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-blue-600 text-white shadow-md shadow-blue-900/40">
                  {featuredCampaign.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-slate-900/80 text-slate-300 border border-slate-700/50 backdrop-blur-md">
                  {featuredCampaign.location}
                </span>
              </div>

              <div className="space-y-2 text-white">
                <h3 className="text-base font-bold leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                  {featuredCampaign.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{featuredCampaign.summary}</p>
                <div className="flex items-center justify-between pt-1 text-xs font-mono text-blue-400">
                  <span>{featuredCampaign.participantsCount} Supporters</span>
                  <span className="flex items-center gap-1 text-white hover:text-blue-300">
                    View Initiative <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Take Action</h2>

        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                onClick={act.action}
                className="p-3.5 bg-[#0F1219] border border-slate-800 rounded-2xl shadow-sm hover:border-slate-700 transition-all text-left flex flex-col justify-between space-y-3 group focus:outline-none"
              >
                <div className={`w-10 h-10 rounded-xl ${act.color} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">{act.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Campaigns */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Trending Campaigns</h2>
          <button
            onClick={() => setCurrentView('explore')}
            className="text-xs font-mono font-bold text-blue-400 hover:underline flex items-center gap-1"
          >
            See all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-4">
          {trendingCampaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} />
          ))}
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
};
