import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Mail, QrCode, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShareSheet: React.FC = () => {
  const { shareModalData, closeShareModal } = useApp();
  const [copied, setCopied] = useState(false);

  if (!shareModalData || !shareModalData.open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareModalData.url || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-emerald-500 text-white',
      onClick: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareModalData.title + ' ' + shareModalData.url)}`, '_blank');
      },
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-blue-500 text-white',
      onClick: () => {
        window.open(`mailto:?subject=${encodeURIComponent(shareModalData.title)}&body=${encodeURIComponent(shareModalData.url)}`, '_blank');
      },
    },
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      color: 'bg-slate-800 text-white',
      onClick: handleCopy,
    },
    {
      name: 'QR Code',
      icon: QrCode,
      color: 'bg-purple-600 text-white',
      onClick: () => {
        alert('QR Code generated! Scan to open campaign details on mobile device.');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Share Initiative</h3>
          </div>
          <button onClick={closeShareModal} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 font-medium line-clamp-2">{shareModalData.title}</p>

        <div className="grid grid-cols-4 gap-3 py-2">
          {shareOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.name}
                onClick={opt.onClick}
                className="flex flex-col items-center gap-2 group focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-2xl ${opt.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-all`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-slate-700">{opt.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-600 truncate flex-1 font-mono">{shareModalData.url || window.location.href}</span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shrink-0"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
