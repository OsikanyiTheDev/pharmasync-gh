'use client';

import React, { useState } from 'react';
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
  Sun,
  Moon,
  Menu,
  X,
  PauseCircle,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useOffline } from '../../context/OfflineContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  onOpenShortcuts: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenShortcuts }) => {
  const pathname = usePathname();
  const { branches, activeBranchId, setActiveBranchId, activeBranch, heldBills } = usePharmacy();
  const { isOnline, syncQueue, toggleOfflineSimulation } = useOffline();
  const { theme, toggleTheme } = useTheme();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'POS Dispensing', icon: Pill, badge: null },
    { href: '/inventory', label: 'Multi-Branch Inventory', icon: Package, badge: 'FEFO' },
    { href: '/inventory/import', label: 'Bulk Stock Importer', icon: FileSpreadsheet, badge: 'CSV' },
    { href: '/restock', label: 'Wholesale Restock', icon: Truck, badge: 'Market' },
    { href: '/analytics', label: 'Sales & Profit', icon: BarChart3, badge: 'KPI' },
    { href: '/transfers', label: 'Stock Transfers', icon: RefreshCw, badge: null },
  ];

  return (
    <>
      {/* Mobile Top Header (Visible only on < md screens) */}
      <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-[#121315] text-slate-900 dark:text-slate-100 border-b border-slate-200/80 dark:border-white/5 px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="bg-[#FBBF24] p-2 rounded-xl text-slate-950 shadow-xs flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            PharmaSync <span className="text-[#4E60FF]">GH</span>
          </span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-100 dark:bg-[#222327] border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4E60FF]" />}
          </button>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 bg-slate-100 dark:bg-[#222327] text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Backdrop Drawer */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs z-40"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-[#121315] border-r border-slate-200/80 dark:border-white/5 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-all duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        
        {/* Top Header & Brand Area */}
        <div className="p-5 border-b border-slate-200/80 dark:border-white/5 space-y-4 bg-white dark:bg-[#121315]">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-[#FBBF24] p-2.5 rounded-xl text-slate-950 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">PharmaSync</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#4E60FF]/10 text-[#4E60FF]">
                    GH
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Pharmacy System</p>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Branch Switcher Dropdown */}
          <div className="bg-slate-50 dark:bg-[#161719] border border-slate-200/80 dark:border-white/5 p-2.5 rounded-xl space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Active Branch</span>
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#4E60FF] flex-shrink-0" />
              <select
                value={activeBranchId}
                onChange={(e) => setActiveBranchId(e.target.value as any)}
                className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-[#121315] text-slate-900 dark:text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Middle Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto bg-white dark:bg-[#121315]">
          <p className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#4E60FF] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-[#222327] dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Parked Held Bills Indicator */}
          {heldBills.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-500/20 rounded-xl text-xs flex items-center justify-between text-amber-900 dark:text-amber-300">
              <div className="flex items-center space-x-2">
                <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold">{heldBills.length} Held Bill(s)</span>
              </div>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">Parked</span>
            </div>
          )}
        </div>

        {/* Bottom Profile, Theme Toggle & Keyboard Shortcut Area */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#121315] space-y-3">
          
          {/* Status & Shortcuts Row */}
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={toggleOfflineSimulation}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg border text-[11px] font-bold ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Sync ({syncQueue.length})</span>
                </>
              )}
            </button>

            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 dark:bg-[#222327] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-200/80 dark:border-white/5 shadow-2xs"
              title="Toggle Light / Dark Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#4E60FF]" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenShortcuts}
              className="p-1.5 bg-slate-100 dark:bg-[#222327] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/80 dark:border-white/5 shadow-2xs"
              title="Shortcuts [?]"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Cashier Profile */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#4E60FF]/10 text-[#4E60FF] dark:bg-[#4E60FF]/20 dark:text-[#4E60FF] flex items-center justify-center font-bold text-xs">
                {activeBranch.manager[0]}
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 font-bold text-[11px] leading-tight">{activeBranch.manager}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">Pharmacist</p>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>

        </div>

      </aside>
    </>
  );
};
