import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportPayload } from '../../types';

export const ReportModal: React.FC = () => {
  const { reportModalData, closeReportModal, submitReport } = useApp();
  const [selectedReason, setSelectedReason] = useState<ReportPayload['reason']>('Harassment or bullying');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!reportModalData || !reportModalData.open) return null;

  const reasons: ReportPayload['reason'][] = [
    'Harassment or bullying',
    'Hate or discriminatory content',
    'Threats or violence',
    'False or misleading information',
    'Spam',
    'Privacy violation',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitReport({
      resourceType: reportModalData.resourceType,
      resourceId: reportModalData.resourceId,
      reason: selectedReason,
      details,
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      closeReportModal();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Report Submitted</h3>
            <p className="text-xs text-slate-600">
              Thank you for keeping our community safe. Our moderation team will review this according to Community Standards.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Report Content</h3>
              </div>
              <button
                type="button"
                onClick={closeReportModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Please select why you are reporting this content. CommunityConnect strictly prohibits discrimination, hate speech, and harassment.
            </p>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer text-xs font-semibold transition-all ${
                    selectedReason === r
                      ? 'border-red-500 bg-red-50/50 text-red-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  {r}
                </label>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Additional Details (Optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide context for moderators..."
                rows={3}
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeReportModal}
                className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
