'use client';

import React, { useState } from 'react';
import { X, RefreshCw, ArrowRight, Building2, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { BranchId } from '../../lib/types';
import { getFEFOSortedBatches } from '../../lib/fefo';
import { useToast } from '../../context/ToastContext';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({ isOpen, onClose }) => {
  const { branches, activeBranchId, products, batches, createTransfer, dispatchTransfer } = usePharmacy();
  const { showToast } = useToast();

  const [sourceBranch, setSourceBranch] = useState<BranchId>(activeBranchId);
  const [destinationBranch, setDestinationBranch] = useState<BranchId>(
    activeBranchId === 'ACCRA_MAIN' ? 'OSU_BRANCH' : 'ACCRA_MAIN'
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');
  const [successTransferNo, setSuccessTransferNo] = useState<string | null>(null);

  if (!isOpen) return null;

  const sourceBatches = getFEFOSortedBatches(batches, selectedProductId, sourceBranch);
  const activeSelectedBatch = sourceBatches.find(b => b.id === selectedBatchId) || sourceBatches[0];

  const sourceBranchName = branches.find(b => b.id === sourceBranch)?.name || sourceBranch;
  const destBranchName = branches.find(b => b.id === destinationBranch)?.name || destinationBranch;

  const handleCreateTransfer = () => {
    if (!activeSelectedBatch || quantity <= 0) return;

    const newTransfer = createTransfer(
      sourceBranch,
      destinationBranch,
      [
        {
          productId: selectedProductId,
          batchId: activeSelectedBatch.id,
          quantity,
        },
      ],
      notes || 'Inter-branch stock re-balancing'
    );

    dispatchTransfer(newTransfer.id);
    setSuccessTransferNo(newTransfer.transferNo);
    showToast(`Stock transfer dispatched to ${destBranchName}`, 'success', `Ref: ${newTransfer.transferNo}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-900 dark:text-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-xl border border-teal-200 dark:border-teal-500/20">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Inter-Branch Stock Transfer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Re-allocate medicine stock between physical branches</p>
          </div>
        </div>

        {/* Visual Source to Destination Flow Diagram */}
        <div className="bg-teal-50/70 dark:bg-teal-950/40 p-3.5 rounded-xl border border-teal-200 dark:border-teal-800 mb-4 flex items-center justify-between text-xs">
          <div className="text-center flex-1">
            <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase block">Source Branch</span>
            <p className="font-extrabold text-slate-900 dark:text-slate-100">{sourceBranchName.split(' ')[0]} Depot</p>
          </div>

          <div className="flex flex-col items-center px-3">
            <Truck className="w-5 h-5 text-teal-700 dark:text-teal-400 animate-pulse" />
            <ArrowRight className="w-4 h-4 text-teal-600 dark:text-teal-400 my-0.5" />
            <span className="text-[9px] font-mono font-bold text-teal-800 dark:text-teal-300">{quantity} units</span>
          </div>

          <div className="text-center flex-1">
            <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase block">Target Branch</span>
            <p className="font-extrabold text-slate-900 dark:text-slate-100">{destBranchName.split(' ')[0]} Branch</p>
          </div>
        </div>

        {successTransferNo ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Stock Transfer Dispatched!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Transfer Reference: <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{successTransferNo}</span>
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  setSuccessTransferNo(null);
                  onClose();
                }}
                className="px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 text-xs">
            
            {/* Branch Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">From Source Branch</label>
                <select
                  value={sourceBranch}
                  onChange={(e) => setSourceBranch(e.target.value as BranchId)}
                  className="w-full p-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">To Target Branch</label>
                <select
                  value={destinationBranch}
                  onChange={(e) => setDestinationBranch(e.target.value as BranchId)}
                  className="w-full p-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {branches.filter(b => b.id !== sourceBranch).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Medicine Selector */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Medicine</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setSelectedBatchId('');
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.brandName} ({p.strength})
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Selector */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Source Batch (FEFO Sorted)</label>
              {sourceBatches.length === 0 ? (
                <div className="p-2.5 bg-red-50 dark:bg-rose-950/60 border border-red-200 dark:border-rose-800 text-red-700 dark:text-rose-300 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>No active stock at source branch</span>
                </div>
              ) : (
                <select
                  value={activeSelectedBatch?.id || ''}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-slate-100"
                >
                  {sourceBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      Batch: {b.batchNumber} | Avail: {b.quantity} pk | Exp: {b.expiryDate}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={activeSelectedBatch?.quantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full p-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dispatch Note</label>
                <input
                  type="text"
                  placeholder="e.g. Stock re-balancing"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={!activeSelectedBatch || activeSelectedBatch.quantity <= 0}
                onClick={handleCreateTransfer}
                className="flex items-center space-x-1.5 px-5 py-2 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch Shipment</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
