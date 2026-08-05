import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowLeft, Filter, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Campaign, Group, Event, EducationalResource, CampaignCategory } from '../types';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { GroupCard } from '../components/groups/GroupCard';
import { EventCard } from '../components/events/EventCard';
import { EmptyState } from '../components/common/EmptyState';
import { PullToRefresh } from '../components/common/PullToRefresh';

export const ExploreView: React.FC = () => {
  const {
    campaigns,
    groups,
    events,
    resources,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    exploreTab: activeTab,
    setExploreTab: setActiveTab,
    setCurrentView,
    refreshData,
  } = useApp();

  const categories: (CampaignCategory | 'All')[] = [
    'All',
    'Education',
    'Environment',
    'Health',
    'Youth',
    'Community support',
    'Culture',
    'Volunteering',
    'Human Rights',
  ];

  // Filter logic
  const filterBySearchAndCat = <T extends { category: CampaignCategory; title?: string; name?: string; description?: string; summary?: string }>(
    items: T[]
  ): T[] => {
    return items.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const text = `${item.title || item.name || ''} ${item.description || ''} ${item.summary || ''}`.toLowerCase();
      const matchSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  };

  const filteredCampaigns = filterBySearchAndCat<Campaign>(campaigns);
  const filteredGroups = filterBySearchAndCat<Group>(groups);
  const filteredEvents = filterBySearchAndCat<Event>(events);
  const filteredResources = filterBySearchAndCat<EducationalResource>(resources);

  return (
    <PullToRefresh onRefresh={refreshData} className="min-h-full">
      <div className="p-4 sm:p-6 space-y-5 pb-24 max-w-md mx-auto">
      {/* Search Input */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns, groups or events..."
            className="w-full pl-10 pr-4 py-3 bg-[#0F1219] text-xs font-medium text-white placeholder-slate-500 rounded-2xl border border-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Horizontal Scrolling Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all focus:outline-none ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 border border-blue-400/30'
                : 'bg-[#0F1219] text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content Segmented Tabs */}
      <div className="bg-[#0F1219] p-1 rounded-2xl border border-slate-800 flex items-center gap-1 text-xs font-mono font-bold text-slate-400">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'campaigns' ? 'bg-[#0A0C10] text-blue-400 border border-slate-800 shadow-sm' : 'hover:text-white'
          }`}
        >
          Campaigns ({filteredCampaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'groups' ? 'bg-[#0A0C10] text-purple-400 border border-slate-800 shadow-sm' : 'hover:text-white'
          }`}
        >
          Groups ({filteredGroups.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'events' ? 'bg-[#0A0C10] text-teal-400 border border-slate-800 shadow-sm' : 'hover:text-white'
          }`}
        >
          Events ({filteredEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'resources' ? 'bg-[#0A0C10] text-amber-400 border border-slate-800 shadow-sm' : 'hover:text-white'
          }`}
        >
          Guides ({filteredResources.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#0A0C10] p-3 rounded-2xl border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Civic Campaigns</p>
              <p className="text-[11px] text-slate-400">Launch a campaign to petition or gather supporters.</p>
            </div>
            <button
              onClick={() => setCurrentView('create-wizard')}
              className="px-3 py-1.5 bg-blue-600 text-white font-mono font-bold text-xs rounded-xl hover:bg-blue-500 shadow-md flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Start Campaign
            </button>
          </div>

          {filteredCampaigns.length === 0 ? (
            <EmptyState
              title="No campaigns found"
              description="Try selecting a different category or clearing your search term."
              actionText="Reset Filters"
              onAction={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            />
          ) : (
            filteredCampaigns.map((camp) => <CampaignCard key={camp.id} campaign={camp} />)
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#0A0C10] p-3 rounded-2xl border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Community Groups</p>
              <p className="text-[11px] text-slate-400">Build an active civic group for discussions & action.</p>
            </div>
            <button
              onClick={() => setCurrentView('create-wizard')}
              className="px-3 py-1.5 bg-purple-600 text-white font-mono font-bold text-xs rounded-xl hover:bg-purple-500 shadow-md flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Create Group
            </button>
          </div>

          {filteredGroups.length === 0 ? (
            <EmptyState
              title="No community groups found"
              description="No community hubs match your current filters."
              actionText="Reset Filters"
              onAction={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            />
          ) : (
            filteredGroups.map((grp) => <GroupCard key={grp.id} group={grp} />)
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#0A0C10] p-3 rounded-2xl border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Community Events</p>
              <p className="text-[11px] text-slate-400">Host cleanups, townhalls, or civic workshops.</p>
            </div>
            <button
              onClick={() => setCurrentView('create-wizard')}
              className="px-3 py-1.5 bg-teal-600 text-white font-mono font-bold text-xs rounded-xl hover:bg-teal-500 shadow-md flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Create Event
            </button>
          </div>

          {filteredEvents.length === 0 ? (
            <EmptyState
              title="No events scheduled"
              description="There are currently no events matching this criteria."
              actionText="Reset Filters"
              onAction={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            />
          ) : (
            filteredEvents.map((evt) => <EventCard key={evt.id} event={evt} />)
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-3">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              onClick={() => setCurrentView('resources')}
              className="p-4 bg-[#0F1219] rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all cursor-pointer space-y-2 group"
            >
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                {res.category} • {res.readTimeMinutes} min read
              </span>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{res.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{res.summary}</p>
              <p className="text-[11px] text-slate-500 font-mono">By {res.author}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
};
