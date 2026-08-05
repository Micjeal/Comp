import React from 'react';
import { GoalType } from '../../types';

interface CampaignProgressProps {
  goalType: GoalType;
  goalValue: number;
  currentValue: number;
  unitLabel?: string;
  compact?: boolean;
}

export const CampaignProgress: React.FC<CampaignProgressProps> = ({
  goalType,
  goalValue,
  currentValue,
  unitLabel,
  compact = false,
}) => {
  const percentage = Math.min(100, Math.round((currentValue / goalValue) * 100));

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-UG').format(num);
  };

  const getLabel = () => {
    if (goalType === 'fundraising') {
      return `${unitLabel || 'UGX'} ${formatNumber(currentValue)} raised of ${formatNumber(goalValue)}`;
    }
    return `${formatNumber(currentValue)} of ${formatNumber(goalValue)} ${unitLabel || goalType}`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
        <span className="truncate text-slate-400">{getLabel()}</span>
        <span className="text-blue-400 font-mono font-bold ml-2">{percentage}%</span>
      </div>

      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500 shadow-sm shadow-blue-500/50"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
