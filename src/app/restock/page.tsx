'use client';

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { getMarketRestockList } from '../../lib/fefo';
import { Product } from '../../lib/types';
import { QuickIntakeModal } from '../../components/restock/QuickIntakeModal';
import { 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Plus, 
  ShoppingBag, 
  CheckSquare,
  Square,
  Smartphone,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function RestockPage() {
  const { products, batches } = usePharmacy();
  const { showToast } = useToast();

  const [selectedProductForIntake, setSelectedProductForIntake] = useState<Product | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [checkedItemsMap, setCheckedItemsMap] = useState<Record<string, boolean>>({});

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
    <div className="max-w-2xl mx-auto space-y-4 text-slate-900 dark:text-slate-100 pb-24">
      
      {/* Executive Mobile Market Banner */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 border border-teal-600/30 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/40">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold text-white">Wholesale Market Restock Assistant</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                Mobile Checklist
              </span>
            </div>
            <p className="text-xs text-teal-200/90 flex items-center mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-teal-300" />
              Okaishie / Drug Lane Market Run (Accra)
            </p>
          </div>
        </div>

        <p className="text-xs text-teal-100/90 mt-2 leading-relaxed">
          Aggregated low-stock medicines across all 3 branches. Tap checkboxes as you purchase items at wholesale stalls.
        </p>

        {/* Sticky Outlay & Progress Summary Bar */}
        <div className="mt-4 p-3 bg-teal-950/80 rounded-xl border border-teal-500/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">Est. Capital Required</p>
            <p className="text-xl font-black text-emerald-400 tabular-nums">GH₵ {totalMarketOutlay.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white font-bold">{restockItems.length} Items to Buy</p>
            <p className="text-[11px] text-amber-300 font-semibold">{itemsBoughtCount} / {restockItems.length} Bought</p>
          </div>
        </div>
      </div>

      {/* Restock Interactive Checklist */}
      <div className="space-y-3">
        {restockItems.length === 0 ? (
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">All Branches Fully Stocked!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">No items are currently below reorder thresholds.</p>
          </div>
        ) : (
          restockItems.map((item) => {
            const p = item.product;
            const isChecked = !!checkedItemsMap[p.id];

            return (
              <div
                key={p.id}
                onClick={() => toggleCheckItem(p.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex flex-col space-y-3 ${
                  isChecked
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 opacity-70'
                    : 'bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 hover:border-teal-500'
                }`}
              >
                
                {/* Checkbox Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <button className="mt-0.5 text-teal-700 dark:text-teal-400">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <h3 className={`font-extrabold text-sm ${isChecked ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {p.brandName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{p.genericName} • {p.strength} ({p.dosageForm})</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] rounded-lg flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Agg: {item.aggregateStock}</span>
                  </span>
                </div>

                {/* 3-Branch Stock Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-[#0b0f19] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs">
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Accra Central</p>
                    <p className={`font-bold ${item.branchBreakdown.ACCRA_MAIN <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.branchBreakdown.ACCRA_MAIN} pk
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Osu Branch</p>
                    <p className={`font-bold ${item.branchBreakdown.OSU_BRANCH <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.branchBreakdown.OSU_BRANCH} pk
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Spintex Road</p>
                    <p className={`font-bold ${item.branchBreakdown.SPINTEX_BRANCH <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.branchBreakdown.SPINTEX_BRANCH} pk
                    </p>
                  </div>
                </div>

                {/* Buy Recommendation & Intake trigger */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Buy Rec: <b className="text-teal-800 dark:text-teal-400 font-black">{item.recommendedQty} packs</b></p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Est Cost: <b className="text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">GH₵ {item.totalEstimatedCost.toFixed(2)}</b></p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenIntake(p);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
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

      {/* Quick Intake Modal */}
      <QuickIntakeModal
        isOpen={isIntakeModalOpen}
        product={selectedProductForIntake}
        onClose={() => setIsIntakeModalOpen(false)}
      />

    </div>
  );
}
