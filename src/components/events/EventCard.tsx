import React from 'react';
import { Calendar, MapPin, Users, Globe } from 'lucide-react';
import { Event } from '../../types';
import { useApp } from '../../context/AppContext';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { setActiveEventId, setCurrentView, registerEvent } = useApp();

  const handleClick = () => {
    setActiveEventId(event.id);
    setCurrentView('event-detail');
  };

  const eventDate = new Date(event.startTime);
  const monthName = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const dayNum = eventDate.getDate();
  const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      onClick={handleClick}
      className="bg-[#0F1219] rounded-2xl border border-slate-800 p-4 shadow-lg hover:border-slate-700 transition-all cursor-pointer flex gap-3.5 group"
    >
      {/* Date Tile */}
      <div className="w-16 h-20 bg-[#0A0C10] border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center shrink-0 group-hover:border-blue-500/40 transition-colors">
        <span className="text-[10px] font-mono font-bold text-blue-400 tracking-wider uppercase">{monthName}</span>
        <span className="text-xl font-light text-white mt-0.5">{dayNum}</span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
              {event.category}
            </span>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              {timeStr}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
            {event.isOnline ? <Globe className="w-3.5 h-3.5 text-teal-400" /> : <MapPin className="w-3.5 h-3.5 text-slate-500" />}
            {event.venue}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            {event.registeredCount} attending
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              registerEvent(event.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              event.isRegistered
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'bg-teal-600 text-white hover:bg-teal-500 shadow-md shadow-teal-900/30'
            }`}
          >
            {event.isRegistered ? 'Registered' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
};
