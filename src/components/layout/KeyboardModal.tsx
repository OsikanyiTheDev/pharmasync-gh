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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#222327] border border-slate-100/60 dark:border-white/5 rounded-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-4">
          <div className="bg-[#4E60FF] p-2.5 rounded-xl text-white shadow-sm">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ultra-fast checkout hotkeys for pharmacy attendants</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F3F4F7] dark:bg-[#161719] rounded-xl border border-slate-100 dark:border-white/5">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.description}</span>
              <kbd className="px-2.5 py-1 bg-white dark:bg-[#222327] border border-slate-100 dark:border-white/10 text-[#4E60FF] rounded-lg font-mono text-xs font-bold shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white font-bold text-sm rounded-xl transition-all shadow-sm"
          >
            Got it, continue
          </button>
        </div>
      </div>
    </div>
  );
};
