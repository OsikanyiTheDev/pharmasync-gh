'use client';

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Building2, 
  Award, 
  Flame, 
  Turtle, 
  BarChart3, 
  PieChart, 
  Calendar,
  Layers,
  Banknote,
  Percent,
  Receipt
} from 'lucide-react';
import { BranchId } from '../../lib/types';

export default function AnalyticsPage() {
  const { sales, products, branches } = usePharmacy();
  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');

  // Filter sales by time
  const now = new Date().getTime();
  const filteredSales = sales.filter(s => {
    const saleTime = new Date(s.timestamp).getTime();
    const diffHours = (now - saleTime) / (1000 * 3600);

    if (timeFilter === 'TODAY') return diffHours <= 24;
    if (timeFilter === 'WEEK') return diffHours <= 168;
    if (timeFilter === 'MONTH') return diffHours <= 720;
    return true;
  });

  // Calculate Key Metrics
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);

  // Calculate COGS
  const totalCOGS = filteredSales.reduce((acc, s) => {
    return acc + s.items.reduce((itemAcc, item) => itemAcc + (item.product.costPrice * item.quantity), 0);
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;
  const marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const avgBasketValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  // Payment breakdown
  let cashRevenue = 0;
  let momoMTNRevenue = 0;
  let momoTelecelRevenue = 0;

  filteredSales.forEach(s => {
    if (s.payment.method === 'CASH') {
      cashRevenue += s.total;
    } else if (s.payment.method === 'SPLIT') {
      cashRevenue += (s.payment.cashPaid || 0);
      if (s.payment.momoProvider === 'Telecel Cash') {
        momoTelecelRevenue += (s.payment.momoAmount || 0);
      } else {
        momoMTNRevenue += (s.payment.momoAmount || 0);
      }
    } else if (s.payment.momoProvider === 'Telecel Cash') {
      momoTelecelRevenue += s.total;
    } else {
      momoMTNRevenue += s.total;
    }
  });

  // Branch Revenue breakdown
  const branchRevenue: Record<BranchId, number> = {
    ACCRA_MAIN: 0,
    OSU_BRANCH: 0,
    SPINTEX_BRANCH: 0,
  };

  filteredSales.forEach(s => {
    if (branchRevenue[s.branchId] !== undefined) {
      branchRevenue[s.branchId] += s.total;
    }
  });

  // Product Velocity Analysis (Fast vs Slow Moving)
  const productStatsMap: Record<string, { product: typeof products[0]; totalQty: number; totalRevenue: number }> = {};

  products.forEach(p => {
    productStatsMap[p.id] = { product: p, totalQty: 0, totalRevenue: 0 };
  });

  filteredSales.forEach(s => {
    s.items.forEach(item => {
      if (productStatsMap[item.product.id]) {
        productStatsMap[item.product.id].totalQty += item.quantity;
        productStatsMap[item.product.id].totalRevenue += item.lineTotal;
      }
    });
  });

  const rankedProducts = Object.values(productStatsMap).sort((a, b) => b.totalQty - a.totalQty);
  const fastMoving = rankedProducts.slice(0, 5);
  const slowMoving = rankedProducts.slice(-4).reverse();

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 pb-12">
      
      {/* Analytics Header & Time Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-xl border border-teal-200 dark:border-teal-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Executive Sales & Financial Dashboard</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gross profit margins, payment channel breakdowns, and inventory turn velocity</p>
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-[#0b0f19] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeFilter === tf
                  ? 'bg-teal-700 text-white shadow-xs dark:bg-teal-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              {tf === 'TODAY' ? '24h' : tf === 'WEEK' ? '7 Days' : tf === 'MONTH' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">GH₵ {totalRevenue.toFixed(2)}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{filteredSales.length} total receipts issued</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Cost of Goods Sold (COGS)</span>
            <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-300 tabular-nums">GH₵ {totalCOGS.toFixed(2)}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-slate-400 dark:bg-slate-500 h-full rounded-full" style={{ width: '60%' }} />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Wholesale medicine cost</p>
        </div>

        <div className="p-4 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-teal-800 dark:text-teal-300 text-xs font-bold">
            <span>Gross Profit & Margin %</span>
            <Percent className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <p className="text-2xl font-black text-teal-950 dark:text-teal-100 tabular-nums">GH₵ {grossProfit.toFixed(2)}</p>
          <div className="w-full bg-teal-200 dark:bg-teal-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-700 dark:bg-teal-400 h-full rounded-full" style={{ width: `${marginPercent}%` }} />
          </div>
          <p className="text-[11px] text-teal-800 dark:text-teal-300 font-extrabold">{marginPercent.toFixed(1)}% Profit Margin</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Average Order Basket Value</span>
            <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-900 dark:text-indigo-300 tabular-nums">GH₵ {avgBasketValue.toFixed(2)}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '70%' }} />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Per patient sale</p>
        </div>

      </div>

      {/* Grid: Payment Method Breakdown + Branch Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Payment Channels (Cash vs MTN MoMo vs Telecel MoMo) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CreditCard className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Payment Channel Breakdown</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center">
                  <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Cash Transactions
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">GH₵ {cashRevenue.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${totalRevenue > 0 ? (cashRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" /> MTN Mobile Money (MoMo)
                </span>
                <span className="text-amber-800 dark:text-amber-300 tabular-nums">GH₵ {momoMTNRevenue.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${totalRevenue > 0 ? (momoMTNRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" /> Telecel Cash / AT Money
                </span>
                <span className="text-indigo-800 dark:text-indigo-300 tabular-nums">GH₵ {momoTelecelRevenue.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" 
                  style={{ width: `${totalRevenue > 0 ? (momoTelecelRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branch Revenue Comparison */}
        <div className="lg:col-span-6 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building2 className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Branch Revenue Distribution</h3>
          </div>

          <div className="space-y-4">
            {branches.map(branch => {
              const rev = branchRevenue[branch.id] || 0;
              const percent = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
              return (
                <div key={branch.id} className="p-3 bg-slate-50 dark:bg-[#0b0f19] rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-900 dark:text-slate-100">{branch.name}</span>
                    <span className="text-teal-800 dark:text-teal-300 tabular-nums">GH₵ {rev.toFixed(2)} ({percent.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-teal-700 dark:bg-teal-500 h-full rounded-full" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Fast-Moving vs Slow-Moving Medicine Velocity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Top Fast-Moving Medicines */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-amber-800 dark:text-amber-400 font-extrabold">
            <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>High-Velocity Medicines (Fast-Turn)</span>
          </div>

          <div className="space-y-2">
            {fastMoving.map((item, idx) => (
              <div key={item.product.id} className="p-3 bg-slate-50 dark:bg-[#0b0f19] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black text-xs flex items-center justify-center border border-amber-300 dark:border-amber-800">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100">{item.product.brandName}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-700 dark:text-emerald-400 block tabular-nums">{item.totalQty} packs sold</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">GH₵ {item.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow-Moving Medicines */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-700 dark:text-slate-300 font-extrabold">
            <Turtle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <span>Slow-Moving Medicines (Capital Tied Stock)</span>
          </div>

          <div className="space-y-2">
            {slowMoving.map((item, idx) => (
              <div key={item.product.id} className="p-3 bg-slate-50 dark:bg-[#0b0f19] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100">{item.product.brandName}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.product.category} • Cost: GH₵ {item.product.costPrice}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-600 dark:text-slate-300 block tabular-nums">{item.totalQty} packs sold</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Consider promotional discount</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
