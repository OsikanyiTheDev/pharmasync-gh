'use client';

import React, { useState } from 'react';
import { X, Truck, Plus, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Product, BranchId } from '../../lib/types';

interface QuickIntakeModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
}

export const QuickIntakeModal: React.FC<QuickIntakeModalProps> = ({ isOpen, product, onClose }) => {
  const { branches, recordMarketIntake } = usePharmacy();

  const [targetBranch, setTargetBranch] = useState<BranchId>('ACCRA_MAIN');
  const [batchNumber, setBatchNumber] = useState<string>(`MKT-${Math.floor(100 + Math.random() * 900)}`);
  const [quantity, setQuantity] = useState<number>(50);
  const [expiryDate, setExpiryDate] = useState<string>('2028-06-30');
  const [wholesaleCost, setWholesaleCost] = useState<number>(product?.costPrice || 25);

  if (!isOpen || !product) return null;

  const handleRecordIntake = () => {
    recordMarketIntake(
      product.id,
      targetBranch,
      batchNumber,
      quantity,
      '2024-06-01',
      expiryDate,
      wholesaleCost
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-900 dark:text-white shadow-2xl relative animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-500/20">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Okaishie Market Stock Intake</h3>
            <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">Record Wholesale Purchase directly to Branch</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-3 space-y-1">
          <p className="font-extrabold text-sm text-slate-900 dark:text-white">{product.brandName}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{product.genericName} • {product.strength}</p>
        </div>

        <div className="space-y-3">
          
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Assign Purchased Stock to Branch</label>
            <select
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value as BranchId)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-teal-800 dark:text-emerald-300"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantity Bought</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit Cost (GH₵)</label>
              <input
                type="number"
                value={wholesaleCost}
                onChange={(e) => setWholesaleCost(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-amber-800 dark:text-amber-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Batch Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-indigo-800 dark:text-indigo-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-700 dark:text-slate-300">Total Purchase Cost:</span>
            <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">GH₵ {(quantity * wholesaleCost).toFixed(2)}</span>
          </div>

        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleRecordIntake}
            className="flex items-center space-x-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Confirm Market Intake</span>
          </button>
        </div>

      </div>
    </div>
  );
};
