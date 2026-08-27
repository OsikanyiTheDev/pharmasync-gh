'use client';

import React, { useState } from 'react';
import { X, RefreshCw, ArrowRight } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Product, BranchId, Batch } from '../../lib/types';
import { getBatchExpiryStatus } from '../../lib/fefo';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({ isOpen, onClose }) => {
  const { products, batches, branches, activeBranchId, createTransfer } = usePharmacy();

  const [fromBranch, setFromBranch] = useState<BranchId>(activeBranchId);
  const [toBranch, setToBranch] = useState<BranchId>('OSU_BRANCH');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const availableProducts = products.filter(p => batches.some(b => b.productId === p.id && b.branchId === fromBranch && b.quantity > 0));
  const availableBatches = batches.filter(b => b.productId === selectedProductId && b.branchId === fromBranch && b.quantity > 0);

  const handleConfirmTransfer = async () => {
    if (!selectedProductId || !selectedBatchId) return;
    await createTransfer(fromBranch, toBranch, [{ productId: selectedProductId, batchId: selectedBatchId, quantity }], notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100/60 rounded-2xl max-w-lg w-full p-6 text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3 mb-4">
          <div className="p-2 bg-[#4E60FF]/10 text-[#4E60FF] rounded-xl border border-[#4E60FF]/20">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Inter-Branch Stock Transfer</h3>
            <p className="text-xs text-slate-500">Move FEFO batches between branches</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">From Branch</label>
              <select value={fromBranch} onChange={(e) => setFromBranch(e.target.value as BranchId)} className="w-full p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#4E60FF]">
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">To Branch</label>
              <select value={toBranch} onChange={(e) => setToBranch(e.target.value as BranchId)} className="w-full p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#4E60FF]">
                {branches.map(b => <option key={b.id} value={b.id} disabled={b.id === fromBranch}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Medicine</label>
            <select value={selectedProductId} onChange={(e) => { setSelectedProductId(e.target.value); setSelectedBatchId(''); }} className="w-full p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#4E60FF]">
              <option value="">Choose medicine...</option>
              {availableProducts.map(p => <option key={p.id} value={p.id}>{p.brandName} - {p.genericName}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select FEFO Batch</label>
            <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)} className="w-full p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#4E60FF]">
              <option value="">Choose batch...</option>
              {availableBatches.map(b => {
                const exp = getBatchExpiryStatus(b.expiryDate);
                return <option key={b.id} value={b.id}>{b.batchNumber} - Exp: {b.expiryDate} - Qty: {b.quantity} ({exp.label})</option>;
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Transfer Quantity</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Current Available</label>
              <div className="p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl font-bold text-slate-900 text-xs">
                {selectedBatchId ? batches.find(b => b.id === selectedBatchId)?.quantity || 0 : 0} packs
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Transfer Notes</label>
            <input type="text" placeholder="Reason for transfer..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2.5 bg-[#F3F4F7] border border-slate-100 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-[#F3F4F7] border border-slate-100 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all">Cancel</button>
          <button onClick={handleConfirmTransfer} disabled={!selectedProductId || !selectedBatchId} className="flex items-center space-x-1.5 px-5 py-2 bg-[#4E60FF] hover:bg-[#3D4FE6] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
            <span>Initiate Transfer</span><ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
