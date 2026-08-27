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
  ShieldCheck,
  UserCheck,
  ChevronRight,
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
      <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md">
            <Pill className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
            PharmaSync <span className="text-teal-600 dark:text-teal-400">GH</span>
          </span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-100 dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-all"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 bg-slate-100 dark:bg-[#131b2e] text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Backdrop Drawer */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs z-40"
        />
      )}

      {/* Main Sidebar Container (Desktop fixed left `w-64`, Mobile slide-over) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex flex-col justify-between transition-all duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        
        {/* Top Header & Brand Area */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
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
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Clinical Pharmacy System</p>
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
          <div className="bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Active Branch</span>
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-teal-700 dark:text-teal-400 flex-shrink-0" />
              <select
                value={activeBranchId}
                onChange={(e) => setActiveBranchId(e.target.value as any)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Middle Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Main Navigation</p>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border-l-4 border-teal-600 shadow-xs dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700 dark:text-teal-300' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold ${
                    isActive
                      ? 'bg-teal-200 text-teal-900 dark:bg-teal-900 dark:text-teal-200'
                      : 'bg-slate-100 text-slate-600 dark:bg-[#131b2e] dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Parked Held Bills Indicator */}
          {heldBills.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs flex items-center justify-between text-amber-900 dark:text-amber-300">
              <div className="flex items-center space-x-2">
                <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold">{heldBills.length} Held Bill(s)</span>
              </div>
              <span className="text-[10px] bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">Parked</span>
            </div>
          )}
        </div>

        {/* Bottom Profile, Theme Toggle & Keyboard Shortcut Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#090d16] space-y-3">
          
          {/* Status & Shortcuts Row */}
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={toggleOfflineSimulation}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg border text-[11px] font-bold ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400'
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
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-white dark:bg-[#131b2e] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-800 shadow-2xs"
              title="Toggle Light / Dark Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenShortcuts}
              className="p-1.5 bg-white dark:bg-[#131b2e] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs"
              title="Shortcuts [?]"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Cashier Profile */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-white border border-teal-300 dark:border-teal-500 flex items-center justify-center font-bold text-xs">
                {activeBranch.manager[0]}
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-200 font-extrabold text-[11px] leading-tight">{activeBranch.manager}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">Dispensing Pharmacist</p>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>

        </div>

      </aside>
    </>
  );
};
