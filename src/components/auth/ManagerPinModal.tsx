'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, KeyRound, AlertTriangle } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

interface ManagerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const ManagerPinModal: React.FC<ManagerPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Manager Authorization Required',
  description = 'Enter a Branch Manager or Owner PIN to grant access to restricted financial data.',
}) => {
  const { verifyManagerPin } = usePharmacy();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    const isValid = verifyManagerPin(pin);
    if (isValid) {
      onSuccess();
      onClose();
    } else {
      setError('Invalid Manager/Owner PIN. (Try 5555 or 9999)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-2xl max-w-sm w-full p-6 text-slate-900 shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">{description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              4-Digit Manager PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setError('');
                  setPin(e.target.value.replace(/\D/g, ''));
                }}
                placeholder="Enter 4-digit PIN (e.g. 5555 or 9999)"
                className="w-full pl-9 pr-4 py-2.5 bg-[#F3F4F7] border border-slate-200 rounded-xl text-center font-mono text-lg tracking-widest font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Authorize Access
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          Demo PINs: Manager (<span className="font-bold text-slate-700">5555</span>) | Owner (<span className="font-bold text-slate-700">9999</span>)
        </div>
      </div>
    </div>
  );
};
