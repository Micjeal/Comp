import React from 'react';
import { SearchX, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.FC<{ className?: string }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'Try adjusting your search filters or check back later.',
  actionText,
  onAction,
  icon: Icon = SearchX,
}) => {
  return (
    <div className="py-12 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center space-y-3 flex flex-col items-center">
      <div className="w-14 h-14 bg-blue-100/60 text-blue-600 rounded-2xl flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>

      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{description}</p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
