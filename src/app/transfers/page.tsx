'use client';

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { RefreshCw, ArrowRight, Truck, CheckCircle2, Building2, Clock, Plus } from 'lucide-react';
import { StockTransferModal } from '../../components/inventory/StockTransferModal';

export default function TransfersPage() {
  const { transfers, branches, receiveTransfer } = usePharmacy();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  return (
    <div className="space-y-6 text-slate-900 dark:text-white pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-xl border border-teal-200 dark:border-teal-500/20">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Inter-Branch Stock Transfer Audit Log</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track dispatched & received stock shipments between physical branches</p>
          </div>
        </div>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      {/* Transfers List */}
      <div className="space-y-3">
        {transfers.length === 0 ? (
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400">
            No inter-branch transfers recorded yet.
          </div>
        ) : (
          transfers.map(trf => {
            const sourceName = branches.find(b => b.id === trf.sourceBranchId)?.name || trf.sourceBranchId;
            const destName = branches.find(b => b.id === trf.destinationBranchId)?.name || trf.destinationBranchId;

            return (
              <div
                key={trf.id}
                className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs hover:border-teal-500 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <span className="font-mono font-bold text-teal-800 dark:text-emerald-400 text-sm">{trf.transferNo}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                      Created: {new Date(trf.createdAt).toLocaleString('en-GH')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      trf.status === 'RECEIVED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-500/40 dark:text-emerald-300'
                        : trf.status === 'DISPATCHED'
                        ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/80 dark:border-amber-500/40 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    }`}>
                      {trf.status}
                    </span>

                    {trf.status === 'DISPATCHED' && (
                      <button
                        onClick={() => receiveTransfer(trf.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-teal-700 hover:bg-teal-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Receipt</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Source -> Destination */}
                <div className="flex items-center space-x-3 text-xs bg-slate-50 dark:bg-[#0b0f19] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-1 text-slate-800 dark:text-slate-300 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-teal-700 dark:text-emerald-400" />
                    <span>{sourceName}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-teal-600 dark:text-emerald-400 flex-shrink-0" />

                  <div className="flex items-center space-x-1 text-slate-800 dark:text-slate-300 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{destName}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Transferred Items:</p>
                  {trf.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-[#0b0f19] rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white">{item.productName} (Batch: {item.batchNumber})</span>
                      <span className="font-extrabold text-teal-800 dark:text-emerald-400">{item.quantity} units</span>
                    </div>
                  ))}
                </div>

                {trf.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">Note: {trf.notes}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      <StockTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

    </div>
  );
}
