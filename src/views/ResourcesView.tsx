import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Clock, Tag, Download, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ResourcesView: React.FC = () => {
  const { resources, goBack, openShareModal } = useApp();
  const [selectedResourceId, setSelectedResourceId] = useState<string>(resources[0]?.id || 'res_001');

  const selected = resources.find((r) => r.id === selectedResourceId) || resources[0];

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="p-4 bg-[#0F1219] border-b border-slate-800 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="p-2 rounded-xl bg-[#0A0C10] text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-white">Civic Learning Guides</h1>
        </div>

        <button
          onClick={() => openShareModal(selected.title, window.location.href)}
          className="p-2 rounded-xl bg-[#0A0C10] text-slate-400 hover:text-white border border-slate-800"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Resource selector pills */}
      <div className="p-4 flex items-center gap-2 overflow-x-auto no-scrollbar bg-[#0A0C10] border-b border-slate-800">
        {resources.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedResourceId(r.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
              r.id === selectedResourceId
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40 border border-amber-500'
                : 'bg-[#0F1219] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {r.category}
          </button>
        ))}
      </div>

      {/* Selected Resource Document View */}
      {selected && (
        <div className="p-5 space-y-4">
          <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
            <img src={selected.imageUrl} alt={selected.title} className="w-full h-full object-cover opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-transparent p-4 flex items-end">
              <span className="px-3 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-600 text-white shadow">
                {selected.category}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {selected.readTimeMinutes} min read
              </span>
              <span>•</span>
              <span>By {selected.author}</span>
            </div>

            <h2 className="text-lg font-bold text-white leading-snug">{selected.title}</h2>
            <p className="text-xs text-amber-200/90 font-mono p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              {selected.summary}
            </p>
          </div>

          <div className="bg-[#0F1219] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-line">
            {selected.content}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {selected.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-lg bg-[#0F1219] border border-slate-800 text-slate-400 font-mono text-[10px] font-bold flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-500" /> {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
