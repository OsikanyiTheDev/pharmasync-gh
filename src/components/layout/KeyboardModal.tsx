'use client';

import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

export const KeyboardModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', description: 'Focus Medicine Search Input' },
    { key: 'F2', description: 'Go to Fast Counter POS Screen' },
    { key: 'F3', description: 'Go to Multi-Branch Inventory' },
    { key: 'F4', description: 'Quick Cash Checkout' },
    { key: 'F8', description: 'Mobile Money (MoMo) / Split Checkout' },
    { key: 'Esc', description: 'Close Modals / Clear Search' },
    { key: 'Tab', description: 'Navigate Medicine Search Results' },
    { key: '?', description: 'Toggle Hotkeys Help Window' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div className="p-2.5 bg-teal-50 dark:bg-emerald-500/10 text-teal-700 dark:text-emerald-400 rounded-xl border border-teal-200 dark:border-emerald-500/20">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Keyboard Shortcuts (Zero-Barcode POS)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ultra-fast checkout hotkeys for Ghanaian retail pharmacy attendants</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#0b0f19] rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.description}</span>
              <kbd className="px-2.5 py-1 bg-white dark:bg-slate-800 text-teal-800 dark:text-emerald-400 border border-slate-300 dark:border-slate-700 rounded-md font-mono text-xs font-bold shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-md"
          >
            Got it, continue
          </button>
        </div>
      </div>
    </div>
  );
};
