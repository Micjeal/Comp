import React, { useState } from 'react';
import { ArrowLeft, Bell, CheckCheck, Megaphone, Calendar, Users, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PullToRefresh } from '../components/common/PullToRefresh';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationsRead, goBack, setCurrentView, setActiveCampaignId, setActiveEventId, setActiveGroupId, refreshData } = useApp();
  const [filter, setFilter] = useState<'all' | 'campaign' | 'group' | 'event'>('all');

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'campaign':
        return Megaphone;
      case 'event':
        return Calendar;
      case 'group':
        return Users;
      default:
        return Bell;
    }
  };

  const handleNotificationClick = (item: any) => {
    if (item.resourceType === 'campaign' && item.resourceId) {
      setActiveCampaignId(item.resourceId);
      setCurrentView('campaign-detail');
    } else if (item.resourceType === 'event' && item.resourceId) {
      setActiveEventId(item.resourceId);
      setCurrentView('event-detail');
    } else if (item.resourceType === 'group' && item.resourceId) {
      setActiveGroupId(item.resourceId);
      setCurrentView('group-detail');
    }
  };

  return (
    <PullToRefresh onRefresh={refreshData} className="min-h-full">
      <div className="p-4 sm:p-6 space-y-4 pb-24 max-w-md mx-auto text-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="p-2 rounded-xl bg-[#0F1219] text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-white">Notifications</h1>
        </div>

        <button
          onClick={markNotificationsRead}
          className="text-xs font-mono font-bold text-blue-400 hover:underline flex items-center gap-1"
        >
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['all', 'campaign', 'group', 'event'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold capitalize whitespace-nowrap transition-all ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 border border-blue-500'
                : 'bg-[#0F1219] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 py-12 text-center">No notifications found.</p>
        ) : (
          filtered.map((item) => {
            const Icon = getIcon(item.type);
            const isUnread = !item.readAt;

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isUnread
                    ? 'bg-blue-500/10 border-blue-500/40 shadow-xl'
                    : 'bg-[#0F1219] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${isUnread ? 'bg-blue-600 text-white' : 'bg-[#0A0C10] text-slate-400 border border-slate-800'}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    {isUnread && <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 animate-pulse" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.message}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </PullToRefresh>
  );
};
