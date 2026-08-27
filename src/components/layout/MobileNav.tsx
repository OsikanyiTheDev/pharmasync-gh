'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package, Truck, TrendingUp, RefreshCw } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'POS', icon: ShoppingCart },
    { href: '/inventory', label: 'Inventory', icon: Package },
    { href: '/restock', label: 'Restock Mode', icon: Truck, isPrimary: true },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/transfers', label: 'Transfers', icon: RefreshCw },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                item.isPrimary
                  ? 'text-amber-800 dark:text-amber-400 font-bold'
                  : isActive
                  ? 'text-teal-800 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${item.isPrimary ? 'bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30' : isActive ? 'bg-teal-50 dark:bg-emerald-500/10' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
