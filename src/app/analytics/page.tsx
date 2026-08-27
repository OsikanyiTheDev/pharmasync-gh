'use client';

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { 
  TrendingUp, 
  CreditCard, 
  Building2, 
  Flame, 
  Turtle, 
  BarChart3, 
  Layers,
  Banknote,
  Percent,
  Receipt,
  DollarSign
} from 'lucide-react';
import { BranchId } from '../../lib/types';

// Helper for safe number conversion
const safeNum = (val: any) => (isNaN(Number(val)) || val === null || val === undefined ? 0 : Number(val));

export default function AnalyticsPage() {
  const { sales, products, branches, isLoading } = usePharmacy();
  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');

  // Skeleton Loading State (Zero Flicker)
  if (isLoading) {
    return (
      <div className="space-y-6 text-slate-900 pb-12">
        {/* Skeleton Header */}
        <div className="h-20 bg-white rounded-2xl animate-pulse" />

        {/* Skeleton Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>

        {/* Skeleton Breakdown Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 h-64 bg-white rounded-2xl animate-pulse" />
          <div className="lg:col-span-6 h-64 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

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

  // Calculate Key Metrics with safeNum
  const totalRevenue = filteredSales.reduce((acc, s) => acc + safeNum(s.total), 0);

  // Calculate COGS using fallback resolution
  const totalCOGS = filteredSales.reduce((acc, s) => {
    return (
      acc +
      (s.items || []).reduce((itemAcc, item) => {
        const catalogProd = products.find(p => p.id === item.product?.id);
        const costPrice = safeNum(item.product?.costPrice ?? catalogProd?.costPrice);
        const qty = safeNum(item.quantity);
        return itemAcc + costPrice * qty;
      }, 0)
    );
  }, 0);

  const grossProfit = Math.max(0, totalRevenue - totalCOGS);
  const marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const avgBasketValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  // Payment breakdown
  let cashRevenue = 0;
  let momoMTNRevenue = 0;
  let momoTelecelRevenue = 0;

  filteredSales.forEach(s => {
    const saleTot = safeNum(s.total);
    if (s.payment.method === 'CASH') {
      cashRevenue += saleTot;
    } else if (s.payment.method === 'SPLIT') {
      cashRevenue += safeNum(s.payment.cashPaid);
      if (s.payment.momoProvider === 'Telecel Cash') {
        momoTelecelRevenue += safeNum(s.payment.momoAmount);
      } else {
        momoMTNRevenue += safeNum(s.payment.momoAmount);
      }
    } else if (s.payment.momoProvider === 'Telecel Cash' || s.payment.method === 'MOMO_TELECEL') {
      momoTelecelRevenue += saleTot;
    } else {
      momoMTNRevenue += saleTot;
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
      branchRevenue[s.branchId] += safeNum(s.total);
    }
  });

  // Product Velocity Analysis (Fast vs Slow Moving)
  const productStatsMap: Record<string, { product: typeof products[0]; totalQty: number; totalRevenue: number }> = {};

  products.forEach(p => {
    productStatsMap[p.id] = { product: p, totalQty: 0, totalRevenue: 0 };
  });

  filteredSales.forEach(s => {
    (s.items || []).forEach(item => {
      const pId = item.product?.id;
      if (pId && productStatsMap[pId]) {
        productStatsMap[pId].totalQty += safeNum(item.quantity);
        productStatsMap[pId].totalRevenue += safeNum(item.lineTotal);
      }
    });
  });

  const rankedProducts = Object.values(productStatsMap).sort((a, b) => b.totalQty - a.totalQty);
  const fastMoving = rankedProducts.slice(0, 5);
  const slowMoving = rankedProducts.slice(-4).reverse();

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      
      {/* Analytics Header & Time Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100/60 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center space-x-3">
          <div className="bg-[#4E60FF] p-3 rounded-xl text-white shadow-xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Executive Sales & Financial Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium">Gross profit margins, payment channel breakdowns, and inventory velocity</p>
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs">
          {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                timeFilter === tf
                  ? 'bg-[#4E60FF] text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tf === 'TODAY' ? '24h' : tf === 'WEEK' ? '7 Days' : tf === 'MONTH' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Executive Metric Cards (Reference Circular Icon Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue - Green Icon Pill */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center space-x-4">
          <div className="bg-[#10B981] text-white p-3.5 rounded-full flex-shrink-0 shadow-sm">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Gross Revenue</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">GH₵ {totalRevenue.toFixed(2)}</p>
            <span className="text-[#10B981] text-xs font-semibold">{filteredSales.length} receipts issued</span>
          </div>
        </div>

        {/* COGS - Blue Icon Pill */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center space-x-4">
          <div className="bg-[#4E60FF] text-white p-3.5 rounded-full flex-shrink-0 shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Cost of Goods (COGS)</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">GH₵ {totalCOGS.toFixed(2)}</p>
            <span className="text-slate-500 text-xs font-medium">Wholesale medicine cost</span>
          </div>
        </div>

        {/* Gross Profit - Amber Icon Pill */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center space-x-4">
          <div className="bg-[#F59E0B] text-white p-3.5 rounded-full flex-shrink-0 shadow-sm">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Gross Profit & Margin</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">GH₵ {grossProfit.toFixed(2)}</p>
            <span className="text-[#10B981] text-xs font-semibold">{marginPercent.toFixed(1)}% Profit Margin</span>
          </div>
        </div>

        {/* Avg Basket Value - Blue Icon Pill */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center space-x-4">
          <div className="bg-[#4E60FF] text-white p-3.5 rounded-full flex-shrink-0 shadow-sm">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Avg Order Basket Value</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">GH₵ {avgBasketValue.toFixed(2)}</p>
            <span className="text-slate-500 text-xs font-medium">Per patient sale</span>
          </div>
        </div>

      </div>

      {/* Grid: Payment Method Breakdown + Branch Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Payment Channels (Cash vs MTN MoMo vs Telecel MoMo) */}
        <div className="lg:col-span-6 bg-white border border-slate-100/60 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#4E60FF]" />
              <h3 className="font-bold text-base text-slate-900">Payment Channel Breakdown</h3>
            </div>
            <span className="text-[#4E60FF] text-xs font-semibold hover:underline cursor-pointer">See All &gt;</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center">
                  <Banknote className="w-3.5 h-3.5 mr-1.5 text-[#10B981]" /> Cash Transactions
                </span>
                <span className="text-[#10B981] tabular-nums font-bold">GH₵ {cashRevenue.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-[#10B981] h-full rounded-full" 
                  style={{ width: `${totalRevenue > 0 ? (cashRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5 text-[#F59E0B]" /> MTN Mobile Money (MoMo)
                </span>
                <span className="text-[#F59E0B] tabular-nums font-bold">GH₵ {momoMTNRevenue.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-[#F59E0B] h-full rounded-full" 
                  style={{ width: `${totalRevenue > 0 ? (momoMTNRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5 text-[#4E60FF]" /> Telecel Cash / AT Money
                </span>
                <span className="text-[#4E60FF] tabular-nums font-bold">GH₵ {momoTelecelRevenue.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-[#4E60FF] h-full rounded-full" 
                  style={{ width: `${totalRevenue > 0 ? (momoTelecelRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branch Revenue Comparison */}
        <div className="lg:col-span-6 bg-white border border-slate-100/60 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#4E60FF]" />
              <h3 className="font-bold text-base text-slate-900">Branch Revenue Distribution</h3>
            </div>
            <span className="text-[#4E60FF] text-xs font-semibold hover:underline cursor-pointer">See All &gt;</span>
          </div>

          <div className="space-y-4">
            {branches.map(branch => {
              const rev = branchRevenue[branch.id] || 0;
              const percent = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
              return (
                <div key={branch.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100/60">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-900">{branch.name}</span>
                    <span className="text-[#4E60FF] tabular-nums">GH₵ {rev.toFixed(2)} ({percent.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#4E60FF] h-full rounded-full" 
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
        <div className="bg-white border border-slate-100/60 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-[#F59E0B] font-bold">
              <Flame className="w-5 h-5 text-[#F59E0B]" />
              <span>High-Velocity Medicines (Fast-Turn)</span>
            </div>
            <span className="text-[#4E60FF] text-xs font-semibold hover:underline cursor-pointer">See All &gt;</span>
          </div>

          <div className="space-y-2">
            {fastMoving.map((item, idx) => (
              <div key={item.product.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] font-bold text-xs flex items-center justify-center border border-[#F59E0B]/20">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.product.brandName}</h4>
                    <p className="text-[10px] text-slate-400">{item.product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#10B981] block tabular-nums">{item.totalQty} packs sold</span>
                  <span className="text-[10px] text-slate-400 font-mono">GH₵ {item.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow-Moving Medicines */}
        <div className="bg-white border border-slate-100/60 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-slate-700 font-bold">
              <Turtle className="w-5 h-5 text-slate-400" />
              <span>Slow-Moving Medicines (Capital Tied Stock)</span>
            </div>
            <span className="text-[#4E60FF] text-xs font-semibold hover:underline cursor-pointer">See All &gt;</span>
          </div>

          <div className="space-y-2">
            {slowMoving.map((item, idx) => (
              <div key={item.product.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100/60 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{item.product.brandName}</h4>
                  <p className="text-[10px] text-slate-400">{item.product.category} • Cost: GH₵ {item.product.costPrice}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-600 block tabular-nums">{item.totalQty} packs sold</span>
                  <span className="text-[10px] text-slate-400">Consider promotional discount</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
