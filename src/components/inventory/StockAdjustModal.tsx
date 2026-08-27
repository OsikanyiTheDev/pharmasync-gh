'use client';

import React, { useState } from 'react';
import { X, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Product, Batch, AdjustmentReason } from '../../lib/types';

interface StockAdjustModalProps {
  isOpen: boolean;
  product: Product | null;
  batch: Batch | null;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ isOpen, product, batch, onClose }) => {
  const { adjustBatchQuantity, activeBranchId } = usePharmacy();
  const [adjustType, setAdjustType] = useState<'ADD' | 'REMOVE' | 'SET'>('ADD');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Damaged / Expired stock write-off');
  const [reasonCode, setReasonCode] = useState<AdjustmentReason>('DAMAGE');

  if (!isOpen || !product || !batch) return null;

  const handleConfirm = () => {
    let delta = 0;
    if (adjustType === 'ADD') delta = quantity;
    if (adjustType === 'REMOVE') delta = -quantity;
    if (adjustType === 'SET') delta = quantity - batch.quantity;
    adjustBatchQuantity(product.id, batch.id, activeBranchId, delta, reasonCode, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#222327] border border-slate-100/60 dark:border-white/5 rounded-2xl max-w-md w-full p-6 text-slate-900 dark:text-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
          <div className="p-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-xl border border-[#F59E0B]/20">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Stock Adjustment</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Adjust batch quantity with audit reason</p>
          </div>
        </div>

        <div className="bg-[#F3F4F7] dark:bg-[#161719] p-3 rounded-xl border border-slate-100 dark:border-white/5 space-y-1 mb-4">
          <p className="font-bold text-sm text-slate-900 dark:text-white">{product.brandName}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{product.genericName} • Batch: <span className="font-mono font-bold text-[#4E60FF]">{batch.batchNumber}</span> • Current: <b className="font-mono">{batch.quantity}</b></p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(['ADD', 'REMOVE', 'SET'] as const).map(t => (
              <button key={t} onClick={() => setAdjustType(t)} className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${adjustType === t ? 'bg-[#4E60FF] text-white border-[#4E60FF] shadow-sm' : 'bg-[#F3F4F7] dark:bg-[#161719] border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}>{t === 'ADD' ? '+ Add Stock' : t === 'REMOVE' ? '- Remove' : '= Set Exact'}</button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantity</label>
            <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} className="w-full p-2.5 bg-[#F3F4F7] dark:bg-[#161719] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason Code</label>
            <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value as AdjustmentReason)} className="w-full p-2.5 bg-[#F3F4F7] dark:bg-[#161719] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]">
              <option value="DAMAGE">DAMAGE - Damaged / Expired</option>
              <option value="EXPIRY">EXPIRY - Expired write-off</option>
              <option value="AUDIT_CORRECTION">AUDIT_CORRECTION - Stock count correction</option>
              <option value="RESTOCK_INTAKE">RESTOCK_INTAKE - Supplier adjustment</option>
              <option value="SHRINKAGE">SHRINKAGE - Shrinkage / Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Audit Note</label>
            <input type="text" placeholder="Additional notes (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#222327] border border-slate-100 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
          </div>

          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-start space-x-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <span className="text-amber-800 dark:text-amber-300">This adjustment will be logged in the audit trail and sync to Supabase.</span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-[#F3F4F7] dark:bg-[#161719] border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all">Cancel</button>
          <button onClick={handleConfirm} className="flex items-center space-x-1.5 px-5 py-2 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white font-bold text-xs rounded-xl shadow-sm transition-all">
            <span>Confirm Adjustment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
