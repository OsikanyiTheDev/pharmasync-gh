'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Pill, Building2, Wifi, WifiOff, Keyboard, Package, Truck, BarChart3, RefreshCw, Menu, X, FileSpreadsheet, MapPin, Users, Lock } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useOffline } from '../../context/OfflineContext';

interface SidebarProps { onOpenShortcuts: () => void; }

export const Sidebar: React.FC<SidebarProps> = ({ onOpenShortcuts }) => {
  const pathname = usePathname();
  const { branches, activeBranchId, setActiveBranchId, activeBranch, activeUser, lockStation } = usePharmacy();
  const { isOnline, syncQueue, toggleOfflineSimulation } = useOffline();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userRole = activeUser?.role || 'CASHIER';

  let navItems: { href: string; label: string; icon: any; badge: string | null }[] = [];
  if (userRole === 'CASHIER') {
    navItems = [
      { href: '/', label: 'POS Dispensing', icon: Pill, badge: null },
      { href: '/inventory', label: 'Branch Inventory', icon: Package, badge: 'FEFO' },
      { href: '/analytics', label: 'Daily Sales', icon: BarChart3, badge: 'KPI' },
    ];
  } else if (userRole === 'BRANCH_MANAGER') {
    navItems = [
      { href: '/', label: 'POS Dispensing', icon: Pill, badge: null },
      { href: '/inventory', label: 'Branch Inventory', icon: Package, badge: 'FEFO' },
      { href: '/transfers', label: 'Stock Transfers', icon: RefreshCw, badge: null },
      { href: '/analytics', label: 'Branch Sales & Trends', icon: BarChart3, badge: 'KPI' },
    ];
  } else {
    navItems = [
      { href: '/', label: 'POS Dispensing', icon: Pill, badge: null },
      { href: '/inventory', label: 'Multi-Branch Inventory', icon: Package, badge: 'FEFO' },
      { href: '/inventory/import', label: 'Bulk Stock Importer', icon: FileSpreadsheet, badge: 'CSV' },
      { href: '/restock', label: 'Wholesale Restock', icon: Truck, badge: 'Market' },
      { href: '/transfers', label: 'Stock Transfers', icon: RefreshCw, badge: null },
      { href: '/analytics', label: 'Sales & Profit', icon: BarChart3, badge: 'KPI' },
      { href: '/users', label: 'Staff & PIN Management', icon: Users, badge: 'Staff' },
    ];
  }

  const roleColor = activeUser?.role === 'OWNER' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : activeUser?.role === 'BRANCH_MANAGER' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <>
      {/* FIX: Mobile Top Bar - w-full, fixed width, not affected by flex row. Uses pl-0 on mobile content */}
      <div className="md:hidden fixed top-0 left-0 right-0 w-full z-40 bg-white text-slate-900 border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="bg-[#FBBF24] p-2.5 rounded-xl text-slate-950 shadow-xs flex items-center justify-center"><Pill className="w-5 h-5" /></div>
          <span className="font-bold text-base tracking-tight text-slate-900">PharmaSync <span className="text-[#4E60FF]">GH</span></span>
        </Link>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 bg-[#F3F4F7] border border-slate-100 text-slate-700 rounded-xl">{isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>

      {/* Spacer for fixed mobile header - only on mobile */}
      <div className="md:hidden h-[60px] w-full flex-shrink-0" />

      {isMobileOpen && <div onClick={() => setIsMobileOpen(false)} className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30" />}

      <aside className={`fixed top-0 md:top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-100 flex flex-col justify-between z-30 transition-all duration-200 ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'} ${isMobileOpen ? 'pt-0' : 'pt-[60px] md:pt-0'}`}>
        <div className="p-5 border-b border-slate-100 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-[#FBBF24] p-2.5 rounded-xl text-slate-950 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform"><Pill className="w-6 h-6" /></div>
              <div><div className="flex items-center space-x-1"><span className="font-bold text-lg tracking-tight text-slate-900">PharmaSync</span><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#4E60FF]/10 text-[#4E60FF]">GH</span></div><p className="text-[10px] text-slate-500 font-medium">Retail & Multi-Branch</p></div>
            </Link>
            <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="bg-[#F3F4F7] border border-slate-100 p-2.5 rounded-xl space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Branch Location</span>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#4E60FF] flex-shrink-0" />
              {userRole === 'OWNER' ? (
                <select value={activeBranchId} onChange={(e) => setActiveBranchId(e.target.value as any)} className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer">
                  {branches.map((b) => <option key={b.id} value={b.id} className="bg-white text-slate-900">{b.name}</option>)}
                </select>
              ) : (
                <span className="text-xs font-bold text-slate-900 truncate">{activeBranch?.name || activeBranchId}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto bg-white">
          <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)} className={`px-4 py-3 rounded-xl text-xs flex items-center justify-between transition-all ${isActive ? 'bg-[#4E60FF] text-white font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <div className="flex items-center space-x-3"><Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} /><span>{item.label}</span></div>
                {item.badge && <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{item.badge}</span>}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white space-y-3">
          <div className="flex items-center justify-between text-xs">
            <button onClick={toggleOfflineSimulation} className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-800 border-amber-100'}`}>
              {isOnline ? <><Wifi className="w-3 h-3" /><span>Online</span></> : <><WifiOff className="w-3 h-3" /><span>Offline ({syncQueue.length})</span></>}
            </button>
            <div className="flex items-center space-x-1">
              <button onClick={onOpenShortcuts} className="p-1.5 bg-[#F3F4F7] border border-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-all" title="Hotkeys [?]"><Keyboard className="w-3.5 h-3.5" /></button>
              <button onClick={lockStation} className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-all" title="Fast Lock Station [F10]"><Lock className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#4E60FF]/10 text-[#4E60FF] flex items-center justify-center font-black text-xs border border-[#4E60FF]/20 flex-shrink-0">{activeUser?.fullName?.[0] || 'U'}</div>
              <div className="min-w-0"><p className="font-bold text-slate-900 text-xs leading-tight truncate">{activeUser?.fullName || activeBranch?.manager}</p><span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-tight border ${roleColor}`}>{activeUser?.role || 'PHARMACIST'}</span></div>
            </div>
            <button onClick={lockStation} className="text-slate-400 hover:text-red-500 p-1 rounded-lg" title="Lock counter [F10]"><Lock className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </aside>
    </>
  );
};
