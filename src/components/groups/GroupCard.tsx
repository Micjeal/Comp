import React from 'react';
import { Users, MapPin, ShieldCheck } from 'lucide-react';
import { Group } from '../../types';
import { useApp } from '../../context/AppContext';

interface GroupCardProps {
  group: Group;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const { setActiveGroupId, setCurrentView, joinGroup } = useApp();

  const handleClick = () => {
    setActiveGroupId(group.id);
    setCurrentView('group-detail');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[#0F1219] rounded-2xl border border-slate-800 p-4 shadow-lg hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3 group"
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <img
          src={group.logoUrl}
          alt={group.name}
          className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-700 shrink-0 group-hover:scale-105 transition-transform"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              {group.category}
            </span>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{group.visibility}</span>
          </div>

          <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate mt-1">
            {group.name}
          </h3>

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {group.memberCount} members
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {group.location}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          joinGroup(group.id);
        }}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
          group.isMember
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            : 'bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-900/30'
        }`}
      >
        {group.isMember ? 'Joined' : 'Join'}
      </button>
    </div>
  );
};
