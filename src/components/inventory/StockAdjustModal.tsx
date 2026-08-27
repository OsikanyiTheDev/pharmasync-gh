'use client';

import React, { useState } from 'react';
import { X, SlidersHorizontal, Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Batch, Product, AdjustmentReason } from '../../lib/types';

interface StockAdjustModalProps {
  isOpen: boolean;
  product: Product | null;
  batch: Batch | null;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  product,
  batch,
  onClose,
}) => {
  const { adjustBatchQuantity } = usePharmacy();

  const [deltaType, setDeltaType] = useState<'ADD' | 'REMOVE'>('REMOVE');
  const [amount, setAmount] = useState<number>(5);
  const [reason, setReason] = useState<AdjustmentReason>('EXPIRY');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !product || !batch) return null;

  const handleAdjust = () => {
    const finalDelta = deltaType === 'ADD' ? amount : -amount;
    adjustBatchQuantity(product.id, batch.id, batch.branchId, finalDelta, reason, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-500/20">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Adjust Batch Quantity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manual stock adjustment audit record</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 mb-4">
          <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{product.brandName}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Batch: <span className="font-mono text-teal-800 dark:text-emerald-400 font-bold">{batch.batchNumber}</span> • Branch: {batch.branchId}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Current Stock: <b className="text-slate-900 dark:text-white">{batch.quantity}</b> units</p>
        </div>

        <div className="space-y-4">
          
          {/* Action type */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDeltaType('ADD')}
              className={`flex items-center justify-center space-x-1.5 p-2 rounded-xl border text-xs font-bold transition-all ${
                deltaType === 'ADD'
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Increase Stock (+)</span>
            </button>

            <button
              onClick={() => setDeltaType('REMOVE')}
              className={`flex items-center justify-center space-x-1.5 p-2 rounded-xl border text-xs font-bold transition-all ${
                deltaType === 'REMOVE'
                  ? 'bg-rose-50 dark:bg-red-500/20 border-rose-300 dark:border-red-500 text-rose-800 dark:text-red-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Minus className="w-4 h-4" />
              <span>Deduct Stock (-)</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Adjustment Quantity</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason for Adjustment</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as AdjustmentReason)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="EXPIRY">Expired Medicine Removal</option>
              <option value="DAMAGE">Damaged / Broken Blister Pack</option>
              <option value="AUDIT_CORRECTION">Physical Audit Correction</option>
              <option value="SHRINKAGE">Shrinkage / Loss</option>
              <option value="RESTOCK_INTAKE">Direct Supplier Restock</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Audit Note</label>
            <input
              type="text"
              placeholder="e.g. Expired batch discarded per FDA guidelines"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

        </div>

        <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleAdjust}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Save Stock Adjustment
          </button>
        </div>

      </div>
    </div>
  );
};
