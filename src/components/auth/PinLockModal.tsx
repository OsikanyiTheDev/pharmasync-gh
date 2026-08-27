'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, UserCheck, Building2, Delete } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

export const PinLockModal: React.FC = () => {
  const { isLocked, unlockStation, activeUser, userProfiles, switchUserByProfileId } = usePharmacy();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Set selected user to active user on lock
  useEffect(() => {
    if (isLocked) {
      setPin('');
      setErrorMsg('');
      if (activeUser) {
        setSelectedUserId(activeUser.id);
      } else if (userProfiles.length > 0) {
        setSelectedUserId(userProfiles[0].id);
      }
    }
  }, [isLocked, activeUser, userProfiles]);

  const targetUser = userProfiles.find(u => u.id === selectedUserId) || activeUser || userProfiles[0];

  const handleUnlockAttempt = useCallback((pinToTest: string) => {
    if (pinToTest.length !== 4) return;

    const success = unlockStation(pinToTest, targetUser?.id);
    if (success) {
      setPin('');
      setErrorMsg('');
    } else {
      setIsShaking(true);
      setErrorMsg('Incorrect 4-digit PIN code. Please try again.');
      setTimeout(() => setIsShaking(false), 500);
      setPin('');
    }
  }, [unlockStation, targetUser]);

  const handleKeyPress = useCallback((num: string) => {
    setErrorMsg('');
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => handleUnlockAttempt(newPin), 50);
      }
    }
  }, [pin, handleUnlockAttempt]);

  const handleDelete = useCallback(() => {
    setErrorMsg('');
    setPin(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setErrorMsg('');
    setPin('');
  }, []);

  // Keyboard navigation for PIN entry
  useEffect(() => {
    if (!isLocked) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLocked, handleKeyPress, handleDelete, handleClear]);

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-white border border-slate-100 rounded-3xl max-w-md w-full p-7 text-slate-900 shadow-2xl relative overflow-hidden transition-all transform ${
          isShaking ? 'animate-bounce border-red-500 ring-4 ring-red-500/20' : ''
        }`}
      >
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4E60FF] via-[#FBBF24] to-[#10B981]" />

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6 pt-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#4E60FF]/10 text-[#4E60FF] flex items-center justify-center border border-[#4E60FF]/20 shadow-xs mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Station Locked — Quick PIN Unlock
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Enter 4-digit PIN to authorize counter dispensing session
          </p>
        </div>

        {/* User Selection Pills */}
        <div className="mb-6 bg-[#F3F4F7] p-1.5 rounded-2xl border border-slate-100">
          <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block px-2.5 pt-1 mb-1">
            Select Attendant / User Profile
          </label>
          <div className="grid grid-cols-3 gap-1">
            {userProfiles.map((u) => {
              const isSelected = targetUser?.id === u.id;
              const roleBadgeColor = 
                u.role === 'OWNER' ? 'text-indigo-600' :
                u.role === 'BRANCH_MANAGER' ? 'text-amber-600' : 'text-emerald-600';

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setPin('');
                    setErrorMsg('');
                  }}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white shadow-xs border border-slate-200 ring-2 ring-[#4E60FF]/30' 
                      : 'hover:bg-slate-200/60 text-slate-600'
                  }`}
                >
                  <p className="text-xs font-bold truncate text-slate-900">{u.fullName.split(' ')[0]}</p>
                  <p className={`text-[9px] font-extrabold tracking-tight ${roleBadgeColor}`}>
                    {u.role === 'BRANCH_MANAGER' ? 'MANAGER' : u.role}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Target User Card */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#4E60FF] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {targetUser?.fullName?.[0] || 'U'}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">{targetUser?.fullName}</p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#4E60FF]" /> {targetUser?.branchId.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
            targetUser?.role === 'OWNER' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
            targetUser?.role === 'BRANCH_MANAGER' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {targetUser?.role}
          </span>
        </div>

        {/* 4-Digit PIN Indicator Dots */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-[#4E60FF] ring-4 ring-[#4E60FF]/25 scale-110 shadow-sm'
                    : 'bg-white border-2 border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Error Feedback Message */}
        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-center flex items-center justify-center space-x-1.5 text-xs text-red-700 font-bold animate-in fade-in">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numeric Keypad (3x4 Grid) */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="py-3 bg-[#F3F4F7] hover:bg-slate-200 active:scale-95 text-slate-900 text-lg font-black rounded-2xl border border-slate-200/70 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs rounded-2xl border border-slate-200 transition-all cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3 bg-[#F3F4F7] hover:bg-slate-200 active:scale-95 text-slate-900 text-lg font-black rounded-2xl border border-slate-200/70 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center rounded-2xl border border-slate-200 transition-all cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast PIN Hints */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider text-center mb-2">
            Demo Station PINs (1-Click Test):
          </p>
          <div className="flex items-center justify-center gap-2">
            {userProfiles.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUserId(u.id);
                  handleUnlockAttempt(u.pinCode);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-[#4E60FF]/10 hover:text-[#4E60FF] hover:border-[#4E60FF]/30 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all cursor-pointer"
              >
                {u.fullName.split(' ')[0]}: <span className="font-mono font-black text-[#4E60FF]">{u.pinCode}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-mono text-center mt-4">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-bold">F10</kbd> anytime to lock station
        </p>
      </div>
    </div>
  );
};
