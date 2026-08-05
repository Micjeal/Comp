import React from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Share2, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EventDetailView: React.FC = () => {
  const { activeEventId, events, goBack, registerEvent, openShareModal, openSuccessModal } = useApp();

  const event = events.find((e) => e.id === activeEventId) || events[0];
  if (!event) return null;

  const eventDate = new Date(event.startTime);
  const monthName = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const dayNum = eventDate.getDate();
  const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleRegisterClick = () => {
    registerEvent(event.id);
    if (!event.isRegistered) {
      openSuccessModal(
        'Registration Confirmed!',
        `You have successfully registered for "${event.title}". Event details and reminders have been added to your notification schedule.`,
        'View My Schedule',
        () => goBack()
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 pb-28 max-w-md mx-auto">
      {/* Cover Image */}
      <div className="relative h-60 bg-slate-900">
        <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={goBack}
            className="p-2.5 rounded-xl bg-[#0F1219]/80 backdrop-blur-md text-white border border-slate-700/60 hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => openShareModal(event.title, window.location.href)}
            className="p-2.5 rounded-xl bg-[#0F1219]/80 backdrop-blur-md text-white border border-slate-700/60 hover:bg-slate-800 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Event Card Overlapping */}
      <div className="bg-[#0F1219] p-5 rounded-3xl border border-slate-800 shadow-2xl -mt-8 relative z-10 mx-4 space-y-4">
        <div className="flex gap-4 items-start">
          <div className="w-16 h-20 bg-teal-500/10 border border-teal-500/30 rounded-2xl flex flex-col items-center justify-center text-center shrink-0">
            <span className="text-[10px] font-mono font-bold text-teal-400 tracking-wider">{monthName}</span>
            <span className="text-2xl font-mono font-bold text-teal-300 leading-tight">{dayNum}</span>
          </div>

          <div className="space-y-1 flex-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
              {event.category}
            </span>
            <h1 className="text-base font-bold text-white leading-snug">{event.title}</h1>
            <p className="text-xs font-mono text-slate-400">Hosted by {event.organizerName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 bg-[#0A0C10] p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{timeStr}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.isOnline ? <Globe className="w-4 h-4 text-teal-400 shrink-0" /> : <MapPin className="w-4 h-4 text-teal-400 shrink-0" />}
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity & RSVP state */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-400" /> {event.registeredCount} / {event.capacity || 200} Registered
          </span>
          {event.isRegistered && (
            <span className="text-teal-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> You're Going
            </span>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
          <h3 className="font-bold text-white text-sm">About Event</h3>
          <p>{event.description}</p>
        </div>

        {/* Agenda Timeline if present */}
        {event.agenda && event.agenda.length > 0 && (
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <h3 className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Event Schedule</h3>
            <div className="space-y-2">
              {event.agenda.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-[#0A0C10] rounded-xl text-xs border border-slate-800">
                  <span className="font-mono font-bold text-teal-400 w-16 shrink-0">{item.time}</span>
                  <span className="text-slate-300">{item.activity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Preview Mockup */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <h3 className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Location Map</h3>
          <div className="h-32 rounded-2xl bg-[#0A0C10] relative overflow-hidden flex items-center justify-center text-center p-4 border border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 bg-[#0F1219]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 shadow">
              <p className="text-xs font-mono font-bold text-white flex items-center gap-1">
                <MapPin className="w-4 h-4 text-teal-400" /> {event.venue}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom RSVP Button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0F1219] border-t border-slate-800 p-3 shadow-2xl max-w-md mx-auto">
        <button
          onClick={handleRegisterClick}
          className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 ${
            event.isRegistered
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'bg-teal-600 text-white hover:bg-teal-500 shadow-teal-900/40'
          }`}
        >
          {event.isRegistered ? 'Registered (Click to Cancel)' : 'Register for Event'}
        </button>
      </div>
    </div>
  );
};
