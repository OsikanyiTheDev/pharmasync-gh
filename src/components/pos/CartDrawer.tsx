'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Clock,
  PauseCircle,
  UserPlus,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useToast } from '../../context/ToastContext';

interface CartDrawerProps {
  onOpenCashModal: () => void;
  onOpenMoMoModal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onOpenCashModal,
  onOpenMoMoModal,
}) => {
  const {
    cart,
    batches,
    activeBranchId,
    removeFromCart,
    updateCartItemQty,
    updateCartItemBatch,
    clearCart,
    cartSubtotal,
    cartDiscount,
    setCartDiscount,
    cartTotal,
    patientDetails,
    setPatientDetails,
    heldBills,
    holdCurrentBill,
    recallHeldBill,
    deleteHeldBill,
  } = usePharmacy();

  const { showToast } = useToast();
  const [showHeldBillsDrawer, setShowHeldBillsDrawer] = useState(false);
  const [showPatientDetailsInput, setShowPatientDetailsInput] = useState(false);

  const handleHoldBill = () => {
    if (cart.length === 0) {
      showToast('Cart is empty. Add medicines first.', 'info');
      return;
    }
    holdCurrentBill();
    showToast('Bill parked on hold', 'success', 'You can recall it anytime');
  };

  const handleRecallBill = (id: string, billNo: string) => {
    recallHeldBill(id);
    setShowHeldBillsDrawer(false);
    showToast(`Recalled held bill ${billNo}`, 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 text-slate-900 flex flex-col justify-between space-y-4">
      
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#4E60FF]/10 text-[#4E60FF] rounded-xl border border-[#4E60FF]/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Active Dispensing Slip</h2>
              <p className="text-[11px] text-slate-500">{cart.length} item(s) in active slip</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {heldBills.length > 0 && (
              <button onClick={() => setShowHeldBillsDrawer(!showHeldBillsDrawer)} className="px-2.5 py-1 bg-[#FBBF24]/20 border border-[#FBBF24]/30 text-[#F59E0B] rounded-lg text-xs font-bold transition-all flex items-center space-x-1">
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Held ({heldBills.length})</span>
              </button>
            )}
            {cart.length > 0 && (
              <button onClick={handleHoldBill} className="px-2.5 py-1 bg-[#F3F4F7] border border-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all">
                Hold [F8]
              </button>
            )}
            {cart.length > 0 && (
              <button onClick={clearCart} className="p-1.5 text-slate-400 hover:text-[#EF4444] rounded-lg hover:bg-[#EF4444]/10 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {showHeldBillsDrawer && heldBills.length > 0 && (
          <div className="mt-3 p-3 bg-[#FBBF24]/10 border border-[#FBBF24]/20 rounded-xl space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-[#F59E0B]">
              <span>Parked Bills ({heldBills.length})</span>
              <button onClick={() => setShowHeldBillsDrawer(false)} className="text-[#F59E0B] hover:text-amber-800 text-[10px]">Close</button>
            </div>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {heldBills.map(h => (
                <div key={h.id} className="p-2 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs shadow-sm">
                  <div>
                    <span className="font-mono font-bold text-[#4E60FF]">{h.billNumber}</span>
                    <p className="text-[11px] text-slate-600">{h.patientName} • {h.items.length} items • <b className="text-slate-900 tabular-nums">GH₵ {h.total.toFixed(2)}</b></p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleRecallBill(h.id, h.billNumber)} className="px-2 py-1 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white rounded-lg text-[11px] font-bold">Recall</button>
                    <button onClick={() => deleteHeldBill(h.id)} className="p-1 text-slate-400 hover:text-[#EF4444]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3">
          <button onClick={() => setShowPatientDetailsInput(!showPatientDetailsInput)} className="text-xs font-bold text-[#4E60FF] hover:text-[#3D4FE6] flex items-center space-x-1">
            <UserPlus className="w-3.5 h-3.5" />
            <span>{patientDetails.name ? `Client: ${patientDetails.name}` : '+ Add Patient / Doctor Rx Details'}</span>
            {showPatientDetailsInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showPatientDetailsInput && (
            <div className="mt-2 p-3 bg-[#F3F4F7] border border-slate-100 rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Patient Name</label>
                  <input type="text" placeholder="e.g. Ama Serwaa" value={patientDetails.name} onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })} className="w-full p-2 bg-white border border-slate-100 rounded-xl text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">WhatsApp Phone</label>
                  <input type="text" placeholder="024XXXXXXX" value={patientDetails.phone} onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })} className="w-full p-2 bg-white border border-slate-100 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Prescribing Doctor (Optional)</label>
                <input type="text" placeholder="e.g. Dr. K. Osei (Korle Bu)" value={patientDetails.doctor} onChange={(e) => setPatientDetails({ ...patientDetails, doctor: e.target.value })} className="w-full p-2 bg-white border border-slate-100 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2.5 max-h-[340px] overflow-y-auto pr-1 my-2">
        {cart.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No medicines added to dispensing slip yet</p>
            <p className="text-[11px] text-slate-400">Click any drug on the left panel or press <kbd className="px-1.5 py-0.5 bg-white border border-slate-100 text-[#4E60FF] rounded font-mono font-bold text-[10px]">/</kbd> to search</p>
          </div>
        ) : (
          cart.map((item) => {
            const availableBatches = batches.filter(b => b.productId === item.product.id && b.branchId === activeBranchId && b.quantity > 0);
            return (
              <div key={`${item.product.id}-${item.selectedBatch.id}`} className="p-3 bg-[#F3F4F7] border border-slate-100/60 rounded-xl space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.product.brandName}</h4>
                    <p className="text-[10px] text-slate-500">{item.product.strength} ({item.product.dosageForm})</p>
                  </div>
                  <span className="font-bold text-xs text-slate-900 tabular-nums">GH₵ {item.lineTotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-semibold flex items-center"><Clock className="w-3 h-3 text-[#4E60FF] mr-1" /> Batch:</span>
                  <select value={item.selectedBatch.id} onChange={(e) => updateCartItemBatch(item.product.id, e.target.value)} className="bg-transparent text-[11px] font-mono font-bold text-[#4E60FF] focus:outline-none cursor-pointer max-w-[200px] truncate">
                    {availableBatches.map(b => <option key={b.id} value={b.id}>{b.batchNumber} (Exp: {b.expiryDate}) [{b.quantity} left]</option>)}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1.5 bg-white border border-slate-100 rounded-lg p-0.5">
                    <button onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)} className="p-1 text-slate-600 hover:bg-[#F3F4F7] rounded"><Minus className="w-3 h-3" /></button>
                    <span className="px-2 font-bold text-xs text-slate-900 tabular-nums">{item.quantity}</span>
                    <button onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)} className="p-1 text-slate-600 hover:bg-[#F3F4F7] rounded"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-xs text-slate-400 hover:text-[#EF4444] p-1">Remove</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-3">
        <div className="bg-[#F3F4F7] border border-slate-100/60 p-3 rounded-xl space-y-1.5 text-xs text-slate-900">
          <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span className="font-semibold tabular-nums text-slate-900">GH₵ {cartSubtotal.toFixed(2)}</span></div>
          <div className="flex justify-between items-center text-slate-600"><span>Discount (GH₵):</span><input type="number" min="0" value={cartDiscount || ''} onChange={(e) => setCartDiscount(parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-20 p-1.5 bg-white border border-slate-100 rounded-lg text-right text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]" /></div>
          <div className="flex justify-between items-center text-base font-bold text-slate-900 pt-1.5 border-t border-slate-200"><span>NET TOTAL DUE:</span><span className="text-xl text-[#4E60FF] tabular-nums font-bold">GH₵ {cartTotal.toFixed(2)}</span></div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button disabled={cart.length === 0} onClick={onOpenCashModal} className="flex items-center justify-center space-x-1.5 py-3 bg-[#10B981] hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all">Cash Pay</button>
          <button disabled={cart.length === 0} onClick={onOpenMoMoModal} className="flex items-center justify-center space-x-1.5 py-3 bg-[#4E60FF] hover:bg-[#3D4FE6] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all">MoMo / Split</button>
        </div>
      </div>
    </div>
  );
};
