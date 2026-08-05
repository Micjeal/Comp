import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SuccessModal: React.FC = () => {
  const { successModalData, closeSuccessModal } = useApp();

  if (!successModalData || !successModalData.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">{successModalData.title}</h3>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">{successModalData.message}</p>

        <button
          onClick={() => {
            if (successModalData.onAction) successModalData.onAction();
            closeSuccessModal();
          }}
          className="w-full py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95"
        >
          {successModalData.actionText || 'Done'}
        </button>
      </div>
    </div>
  );
};

export const ConfirmationModal: React.FC = () => {
  const { confirmationModalData, closeConfirmationModal } = useApp();

  if (!confirmationModalData || !confirmationModalData.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">{confirmationModalData.title}</h3>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">{confirmationModalData.message}</p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={closeConfirmationModal}
            className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              confirmationModalData.onConfirm();
              closeConfirmationModal();
            }}
            className="flex-1 py-2.5 rounded-2xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md transition-colors"
          >
            {confirmationModalData.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
