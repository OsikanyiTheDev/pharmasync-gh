'use client';

import React, { useState } from 'react';
import { X, Truck, Plus } from 'lucide-react';
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
    recordMarketIntake(product.id, targetBranch, batchNumber, quantity, '2024-06-01', expiryDate, wholesaleCost);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100/60 rounded-2xl max-w-md w-full p-5 text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative animate-in fade-in zoom-in-95">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-50">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3 mb-3">
          <div className="p-2 bg-[#FBBF24]/20 text-[#F59E0B] rounded-xl border border-[#FBBF24]/30">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Okaishie Market Stock Intake</h3>
            <p className="text-xs text-slate-500 font-medium">Record Wholesale Purchase directly to Branch</p>
          </div>
        </div>

        <div className="bg-[#F3F4F7] p-3 rounded-xl border border-slate-100 mb-3 space-y-1">
          <p className="font-bold text-sm text-slate-900">{product.brandName}</p>
          <p className="text-xs text-slate-600">{product.genericName} • {product.strength}</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Assign Purchased Stock to Branch</label>
            <select value={targetBranch} onChange={(e) => setTargetBranch(e.target.value as BranchId)} className="w-full p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl text-xs font-bold text-[#4E60FF] focus:outline-none focus:ring-2 focus:ring-[#4E60FF]">
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Quantity Bought</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-full p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Unit Cost (GH₵)</label>
              <input type="number" value={wholesaleCost} onChange={(e) => setWholesaleCost(parseFloat(e.target.value) || 0)} className="w-full p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl text-sm font-bold text-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Batch Number</label>
              <input type="text" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="w-full p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl text-xs font-mono font-bold text-[#4E60FF] focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
            </div>
          </div>

          <div className="p-2.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-700">Total Purchase Cost:</span>
            <span className="font-bold text-[#10B981] text-sm tabular-nums">GH₵ {(quantity * wholesaleCost).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-[#F3F4F7] border border-slate-100 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all">Cancel</button>
          <button onClick={handleRecordIntake} className="flex items-center space-x-1.5 px-5 py-2 bg-[#F59E0B] hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
            <Plus className="w-4 h-4" />
            <span>Confirm Market Intake</span>
          </button>
        </div>
      </div>
    </div>
  );
};
