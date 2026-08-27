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
  Search,
  UserPlus,
  PauseCircle,
  CreditCard,
  CheckSquare,
  ShieldCheck
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
    <header className="bg-white dark:bg-[#0b0f19] border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 z-40 shadow-xs">
      {/* Primary Navigation & Branch Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-emerald-600 to-teal-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">PharmaSync</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30">
                    GH
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Clinical Pharmacy Management System</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 ml-6 pl-6 border-l border-slate-200 dark:border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs dark:bg-teal-600/20 dark:text-teal-300 dark:border-teal-500/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions: Branch Switcher & Offline Status */}
          <div className="flex items-center space-x-3">
            
            {/* Branch Selector Dropdown */}
            <div className="relative">
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                <Building2 className="w-4 h-4 text-teal-700 dark:text-teal-400 flex-shrink-0" />
                <select
                  value={activeBranchId}
                  onChange={(e) => setActiveBranchId(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Online / Offline Sync Badge */}
            <button
              onClick={toggleOfflineSimulation}
              title="Click to toggle simulated network state"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Offline ({syncQueue.length})</span>
                </>
              )}
            </button>

            {/* Keyboard Shortcuts Toggle Button */}
            <button
              onClick={onOpenShortcuts}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
              title="Keyboard Shortcuts [?]"
            >
              <Keyboard className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>

      {/* Secondary Command & Hotkeys Bar */}
      <div className="bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800/80 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 overflow-x-auto gap-4">
          
          {/* Hotkey Shortcuts Strip */}
          <div className="flex items-center space-x-3 whitespace-nowrap">
            <span className="font-bold text-slate-800 dark:text-slate-300 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 mr-1" /> Quick Commands:
            </span>

            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 rounded font-mono font-bold border border-slate-300 dark:border-slate-700">F2 / /</kbd>
              <span className="text-slate-700 dark:text-slate-300">Search Drugs</span>
            </span>

            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 rounded font-mono font-bold border border-slate-300 dark:border-slate-700">F4</kbd>
              <span className="text-slate-700 dark:text-slate-300">Exact Cash Pay</span>
            </span>

            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 rounded font-mono font-bold border border-slate-300 dark:border-slate-700">F8</kbd>
              <span className="text-slate-700 dark:text-slate-300">Hold Bill</span>
            </span>

            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 rounded font-mono font-bold border border-slate-300 dark:border-slate-700">F9</kbd>
              <span className="text-slate-700 dark:text-slate-300">MoMo / Split Pay</span>
            </span>
          </div>

          {/* Active Cashier & Branch Metadata */}
          <div className="flex items-center space-x-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
            {heldBills.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-500/30 flex items-center">
                <PauseCircle className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />
                {heldBills.length} Held Bill(s)
              </span>
            )}
            <span>Dispenser: <b className="text-slate-800 dark:text-slate-200">{activeBranch.manager}</b></span>
          </div>

        </div>
      </div>

    </header>
  );
};
