'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Pill, 
  Building2, 
  Wifi, 
  WifiOff, 
  Keyboard, 
  Package, 
  Truck, 
  BarChart3, 
  RefreshCw,
  MapPin
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useOffline } from '../../context/OfflineContext';

interface HeaderProps {
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShortcuts }) => {
  const pathname = usePathname();
  const { branches, activeBranchId, setActiveBranchId, activeBranch, heldBills } = usePharmacy();
  const { isOnline, syncQueue, toggleOfflineSimulation } = useOffline();

  const navItems = [
    { href: '/', label: 'POS Cockpit', icon: Pill },
    { href: '/inventory', label: 'Inventory & FEFO', icon: Package },
    { href: '/restock', label: 'Market Restock', icon: Truck },
    { href: '/analytics', label: 'Sales & Profit', icon: BarChart3 },
    { href: '/transfers', label: 'Transfers', icon: RefreshCw },
  ];

  return (
    <header className="bg-white dark:bg-[#121315] border-b border-slate-100 dark:border-white/5 text-slate-900 dark:text-white sticky top-0 z-40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="bg-[#FBBF24] p-2.5 rounded-xl text-slate-950 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">PharmaSync</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#4E60FF]/10 text-[#4E60FF]">
                    GH
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Clinical Pharmacy Management</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1 ml-6 pl-6 border-l border-slate-100 dark:border-white/5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#4E60FF] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="flex items-center space-x-2 bg-[#F3F4F7] dark:bg-[#222327] border border-slate-100 dark:border-white/5 px-3 py-1.5 rounded-xl">
                <MapPin className="w-4 h-4 text-[#4E60FF] flex-shrink-0" />
                <select
                  value={activeBranchId}
                  onChange={(e) => setActiveBranchId(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-white dark:bg-[#121315] text-slate-900 dark:text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={toggleOfflineSimulation}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline ({syncQueue.length})</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenShortcuts}
              className="p-2 bg-[#F3F4F7] dark:bg-[#222327] border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
              title="Keyboard Shortcuts [?]"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
