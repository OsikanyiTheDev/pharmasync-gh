'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePharmacy } from '../../context/PharmacyContext';
import { getMarketRestockList } from '../../lib/fefo';
import { Product } from '../../lib/types';
import { QuickIntakeModal } from '../../components/restock/QuickIntakeModal';
import { 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Plus, 
  CheckSquare,
  Square,
  Smartphone,
  CheckCircle2,
  DollarSign,
  Package,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function RestockPage() {
  const { products, batches, activeUser } = usePharmacy();
  const { showToast } = useToast();
  const router = useRouter();

  // Route Guard: Only OWNER can access wholesale restock
  useEffect(() => {
    if (activeUser?.role !== 'OWNER') {
      showToast('Access Denied: Owner Authorization Required', 'error', 'Wholesale market restock is restricted to system owners.');
      router.replace('/');
    }
  }, [activeUser, router, showToast]);

  const [selectedProductForIntake, setSelectedProductForIntake] = useState<Product | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [checkedItemsMap, setCheckedItemsMap] = useState<Record<string, boolean>>({});

  if (activeUser?.role !== 'OWNER') {
    return null;
  }

  const restockItems = getMarketRestockList(products, batches);
  
  const totalMarketOutlay = restockItems.reduce((acc, item) => acc + item.totalEstimatedCost, 0);
  const itemsBoughtCount = Object.values(checkedItemsMap).filter(Boolean).length;

  const toggleCheckItem = (productId: string) => {
    const nextState = !checkedItemsMap[productId];
    setCheckedItemsMap(prev => ({ ...prev, [productId]: nextState }));
    if (nextState) {
      showToast('Item marked as purchased at market', 'info');
    }
  };

  const handleOpenIntake = (product: Product) => {
    setSelectedProductForIntake(product);
    setIsIntakeModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-900 pb-24">
      
      {/* Clinical Market Banner - Floating White Card with Brand Accent */}
      <div className="bg-white border border-slate-100/60 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-[#4E60FF] p-3 rounded-xl text-white shadow-sm">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900">Wholesale Market Restock Assistant</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBBF24] text-slate-950 uppercase tracking-wider">
                Mobile Checklist
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#4E60FF]" />
              Okaishie / Drug Lane Market Run (Accra)
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Aggregated low-stock medicines across all 3 branches. Tap checkboxes as you purchase items at wholesale stalls. Budget estimator helps manage market capital.
        </p>

        {/* Budget Estimator - Clinical Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-[#F3F4F7] rounded-xl border border-slate-100 flex items-center space-x-3">
            <div className="bg-[#10B981] text-white p-3 rounded-full shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Est. Capital Required</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">GH₵ {totalMarketOutlay.toFixed(2)}</p>
            </div>
          </div>
          <div className="p-4 bg-[#F3F4F7] rounded-xl border border-slate-100 flex items-center space-x-3">
            <div className="bg-[#F59E0B] text-white p-3 rounded-full shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Progress</p>
              <p className="text-sm font-bold text-slate-900">{itemsBoughtCount} / {restockItems.length} Bought</p>
              <p className="text-xs text-slate-500">{restockItems.length} Items to Buy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Restock Interactive Checklist - Clinical Cards */}
      <div className="space-y-3">
        {restockItems.length === 0 ? (
          <div className="bg-white border border-slate-100/60 rounded-2xl p-8 text-center space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="bg-[#10B981] text-white p-3.5 rounded-full w-fit mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">All Branches Fully Stocked!</h3>
            <p className="text-xs text-slate-500">No items are currently below reorder thresholds.</p>
          </div>
        ) : (
          restockItems.map((item) => {
            const p = item.product;
            const isChecked = !!checkedItemsMap[p.id];

            return (
              <div
                key={p.id}
                onClick={() => toggleCheckItem(p.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col space-y-3 ${
                  isChecked
                    ? 'bg-[#10B981]/5 border-[#10B981]/30 opacity-70'
                    : 'bg-white border-slate-100/60 hover:border-[#4E60FF]/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <button className="mt-0.5">
                      {isChecked ? <CheckSquare className="w-5 h-5 text-[#10B981]" /> : <Square className="w-5 h-5 text-slate-400" />}
                    </button>
                    <div>
                      <h3 className={`font-bold text-sm ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {p.brandName}
                      </h3>
                      <p className="text-xs text-slate-500">{p.genericName} • {p.strength} ({p.dosageForm})</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] font-bold text-[11px] rounded-full flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Agg: {item.aggregateStock}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#F3F4F7] p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold">Accra Central</p>
                    <p className={`font-bold tabular-nums ${item.branchBreakdown.ACCRA_MAIN <= 5 ? 'text-[#EF4444]' : 'text-slate-800'}`}>
                      {item.branchBreakdown.ACCRA_MAIN} pk
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold">Osu Branch</p>
                    <p className={`font-bold tabular-nums ${item.branchBreakdown.OSU_BRANCH <= 5 ? 'text-[#EF4444]' : 'text-slate-800'}`}>
                      {item.branchBreakdown.OSU_BRANCH} pk
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold">Spintex Road</p>
                    <p className={`font-bold tabular-nums ${item.branchBreakdown.SPINTEX_BRANCH <= 5 ? 'text-[#EF4444]' : 'text-slate-800'}`}>
                      {item.branchBreakdown.SPINTEX_BRANCH} pk
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-600">Buy Rec: <b className="text-[#4E60FF] font-bold tabular-nums">{item.recommendedQty} packs</b></p>
                    <p className="text-xs text-slate-600">Est Cost: <b className="text-[#10B981] font-bold tabular-nums">GH₵ {item.totalEstimatedCost.toFixed(2)}</b></p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenIntake(p); }}
                    className="flex items-center space-x-1 px-3.5 py-2 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Intake</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <QuickIntakeModal isOpen={isIntakeModalOpen} product={selectedProductForIntake} onClose={() => setIsIntakeModalOpen(false)} />
    </div>
  );
}
