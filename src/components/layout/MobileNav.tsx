'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package, Truck, TrendingUp, RefreshCw, Users } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { activeUser } = usePharmacy();

  const userRole = activeUser?.role || 'CASHIER';

  let navItems: { href: string; label: string; icon: any; isPrimary?: boolean }[] = [];

  if (userRole === 'CASHIER') {
    navItems = [
      { href: '/', label: 'POS', icon: ShoppingCart },
      { href: '/inventory', label: 'Inventory', icon: Package },
      { href: '/analytics', label: 'Daily Sales', icon: TrendingUp },
    ];
  } else if (userRole === 'BRANCH_MANAGER') {
    navItems = [
      { href: '/', label: 'POS', icon: ShoppingCart },
      { href: '/inventory', label: 'Inventory', icon: Package },
      { href: '/transfers', label: 'Transfers', icon: RefreshCw },
      { href: '/analytics', label: 'Sales', icon: TrendingUp },
    ];
  } else {
    navItems = [
      { href: '/', label: 'POS', icon: ShoppingCart },
      { href: '/inventory', label: 'Inventory', icon: Package },
      { href: '/restock', label: 'Restock', icon: Truck, isPrimary: true },
      { href: '/transfers', label: 'Transfers', icon: RefreshCw },
      { href: '/analytics', label: 'Sales', icon: TrendingUp },
      { href: '/users', label: 'Users', icon: Users },
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 px-1 py-2 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1.5 px-2 sm:px-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#4E60FF] text-white font-semibold shadow-sm'
                  : item.isPrimary
                  ? 'bg-[#FBBF24] text-slate-950 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium truncate max-w-[55px] text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

