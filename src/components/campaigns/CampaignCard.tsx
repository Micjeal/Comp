import React from 'react';
import { Bookmark, MapPin, Users, CheckCircle, Share2 } from 'lucide-react';
import { Campaign } from '../../types';
import { CampaignProgress } from './CampaignProgress';
import { useApp } from '../../context/AppContext';

interface CampaignCardProps {
  campaign: Campaign;
  featured?: boolean;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, featured = false }) => {
  const { setActiveCampaignId, setCurrentView, joinCampaign, toggleBookmarkCampaign, openShareModal } = useApp();

  const handleCardClick = () => {
    setActiveCampaignId(campaign.id);
    setCurrentView('campaign-detail');
  };

  return (
    <div className="bg-[#0F1219] rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all overflow-hidden flex flex-col group">
      {/* Cover Image & Chips */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={handleCardClick}>
        <img
          src={campaign.coverUrl}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1219] via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-blue-500/20 backdrop-blur-md text-blue-400 border border-blue-500/30 uppercase tracking-wider">
            {campaign.category}
          </span>
          {campaign.isOnline && (
            <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              Online
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmarkCampaign(campaign.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
            campaign.isBookmarked ? 'bg-blue-600 text-white' : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
          }`}
          aria-label="Bookmark campaign"
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>

        <div className="absolute bottom-3 left-3 right-3 text-slate-300">
          <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            {campaign.location}
          </p>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="cursor-pointer" onClick={handleCardClick}>
          <div className="flex items-center gap-2 mb-2">
            <img
              src={campaign.ownerAvatar}
              alt={campaign.ownerName}
              className="w-5 h-5 rounded-lg object-cover ring-1 ring-slate-700"
            />
            <span className="text-xs font-medium text-slate-400 truncate">{campaign.ownerName}</span>
            {campaign.ownerVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-500/20 shrink-0" />}
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug">
            {campaign.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{campaign.summary}</p>
        </div>

        <div>
          <div className="mb-3">
            <CampaignProgress
              goalType={campaign.goalType}
              goalValue={campaign.goalValue}
              currentValue={campaign.currentValue}
              unitLabel={campaign.unitLabel}
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              {campaign.participantsCount} supporters
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openShareModal(campaign.title, window.location.href);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  joinCampaign(campaign.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  campaign.isJoined
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-900/30'
                }`}
              >
                {campaign.isJoined ? 'Joined' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
