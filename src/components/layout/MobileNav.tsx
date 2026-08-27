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
    { href: '/restock', label: 'Restock', icon: Truck, isPrimary: true },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/transfers', label: 'Transfers', icon: RefreshCw },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#121315] border-t border-slate-100 dark:border-white/5 z-40 px-2 py-2 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
                item.isPrimary
                  ? 'bg-[#FBBF24] text-slate-950 font-bold shadow-xs'
                  : isActive
                  ? 'bg-[#4E60FF] text-white font-semibold shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
