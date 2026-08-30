'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePharmacy } from '../../context/PharmacyContext';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, ArrowRight, CheckCircle2, Building2, Plus, Package } from 'lucide-react';
import { StockTransferModal } from '../../components/inventory/StockTransferModal';

export default function TransfersPage() {
  const { transfers, branches, receiveTransfer, activeUser } = usePharmacy();
  const { showToast } = useToast();
  const router = useRouter();

  // Route Guard: CASHIER cannot access Stock Transfers
  useEffect(() => {
    if (activeUser?.role === 'CASHIER') {
      showToast('Access Denied: Manager Authorization Required', 'error', 'Inter-branch stock transfers require Manager or Owner privileges.');
      router.replace('/');
    }
  }, [activeUser, router, showToast]);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  if (activeUser?.role === 'CASHIER') {
    return null;
  }

  return (
    <div className="space-y-6 text-slate-900 pb-20 md:pb-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100/60 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center space-x-3">
          <div className="bg-[#4E60FF] p-3 rounded-xl text-white shadow-sm">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Inter-Branch Stock Transfer Audit Log</h1>
            <p className="text-xs text-slate-500 font-medium">Track dispatched & received shipments between branches</p>
          </div>
        </div>
        <button onClick={() => setIsTransferModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white font-bold text-xs rounded-xl shadow-sm transition-all">
          <Plus className="w-4 h-4" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      <div className="space-y-3">
        {transfers.length === 0 ? (
          <div className="bg-white border border-slate-100/60 rounded-2xl p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="bg-[#F3F4F7] border border-slate-100 p-4 rounded-full w-fit mx-auto mb-3">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No inter-branch transfers recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Use the button above to initiate a transfer</p>
          </div>
        ) : (
          transfers.map(trf => {
            const sourceName = branches.find(b => b.id === trf.sourceBranchId)?.name || trf.sourceBranchId;
            const destName = branches.find(b => b.id === trf.destinationBranchId)?.name || trf.destinationBranchId;

            return (
              <div key={trf.id} className="bg-white border border-slate-100/60 rounded-2xl p-5 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#4E60FF]/30 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-[#4E60FF] text-sm">{trf.transferNo}</span>
                    <span className="text-xs text-slate-500 ml-2">Created: {new Date(trf.createdAt).toLocaleString('en-GH')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      trf.status === 'RECEIVED' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : trf.status === 'DISPATCHED' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>{trf.status}</span>
                    {trf.status === 'DISPATCHED' && (
                      <button onClick={() => receiveTransfer(trf.id)} className="flex items-center space-x-1 px-3 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Receipt</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs bg-[#F3F4F7] p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-1 text-slate-800 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-[#4E60FF]" />
                    <span>{sourceName}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#4E60FF] flex-shrink-0" />
                  <div className="flex items-center space-x-1 text-slate-800 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{destName}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Transferred Items:</p>
                  {trf.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-[#F3F4F7] rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-900">{item.productName} (Batch: <span className="font-mono text-[#4E60FF]">{item.batchNumber}</span>)</span>
                      <span className="font-bold text-[#4E60FF] tabular-nums">{item.quantity} units</span>
                    </div>
                  ))}
                </div>

                {trf.notes && <p className="text-xs text-slate-500 italic bg-[#F3F4F7] p-2 rounded-lg border border-slate-100">Note: {trf.notes}</p>}
              </div>
            );
          })
        )}
      </div>

      <StockTransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} />
    </div>
  );
}
