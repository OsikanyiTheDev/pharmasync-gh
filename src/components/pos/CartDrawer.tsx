'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  PauseCircle, 
  PlayCircle, 
  UserPlus, 
  FileText,
  Clock,
  CheckCircle2,
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
    showToast('Bill parked on hold', 'success', 'You can recall it anytime from the Held Bills list');
  };

  const handleRecallBill = (id: string, billNo: string) => {
    recallHeldBill(id);
    setShowHeldBillsDrawer(false);
    showToast(`Recalled held bill ${billNo}`, 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-slate-900 flex flex-col justify-between space-y-4">
      
      {/* Top Header: Dispensing Slip Title & Hold Actions */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900">Active Dispensing Ledger</h2>
              <p className="text-[11px] text-slate-500">{cart.length} item(s) in active slip</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {heldBills.length > 0 && (
              <button
                onClick={() => setShowHeldBillsDrawer(!showHeldBillsDrawer)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
              >
                <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Held ({heldBills.length})</span>
              </button>
            )}

            {cart.length > 0 && (
              <button
                onClick={handleHoldBill}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                title="Hold Bill [F8]"
              >
                Hold [F8]
              </button>
            )}

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                title="Clear Cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Held Bills Drawer */}
        {showHeldBillsDrawer && heldBills.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
              <span>Parked Customer Bills ({heldBills.length})</span>
              <button onClick={() => setShowHeldBillsDrawer(false)} className="text-amber-700 hover:text-amber-900 text-[10px]">Close</button>
            </div>
            
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {heldBills.map(h => (
                <div key={h.id} className="p-2 bg-white border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-amber-800">{h.billNumber}</span>
                    <p className="text-[11px] text-slate-600">{h.patientName} • {h.items.length} items • <b className="text-slate-900">GH₵ {h.total.toFixed(2)}</b></p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleRecallBill(h.id, h.billNumber)}
                      className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold"
                    >
                      Recall
                    </button>
                    <button
                      onClick={() => deleteHeldBill(h.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible Patient / Prescribing Doctor Input */}
        <div className="mt-3">
          <button
            onClick={() => setShowPatientDetailsInput(!showPatientDetailsInput)}
            className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center space-x-1"
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-600" />
            <span>{patientDetails.name ? `Client: ${patientDetails.name}` : '+ Add Patient / Doctor Rx Details [F4]'}</span>
            {showPatientDetailsInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showPatientDetailsInput && (
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Patient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ama Serwaa"
                    value={patientDetails.name}
                    onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">WhatsApp Phone</label>
                  <input
                    type="text"
                    placeholder="024XXXXXXX"
                    value={patientDetails.phone}
                    onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Prescribing Doctor (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. K. Osei (Korle Bu)"
                  value={patientDetails.doctor}
                  onChange={(e) => setPatientDetails({ ...patientDetails, doctor: e.target.value })}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 space-y-2.5 max-h-[340px] overflow-y-auto pr-1 my-2">
        {cart.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No medicines added to dispensing slip yet</p>
            <p className="text-[11px] text-slate-400">Click any drug on the left panel or press <kbd className="px-1 bg-slate-100 rounded border border-slate-300 font-mono text-teal-700 font-bold">/</kbd> to search</p>
          </div>
        ) : (
          cart.map((item) => {
            // Get available batches for manual override selection
            const availableBatches = batches.filter(
              b => b.productId === item.product.id && b.branchId === activeBranchId && b.quantity > 0
            );

            return (
              <div
                key={`${item.product.id}-${item.selectedBatch.id}`}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-2xs"
              >
                {/* Title & Price */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{item.product.brandName}</h4>
                    <p className="text-[10px] text-slate-500">{item.product.strength} ({item.product.dosageForm})</p>
                  </div>
                  <span className="font-black text-xs text-slate-900 tabular-nums">
                    GH₵ {item.lineTotal.toFixed(2)}
                  </span>
                </div>

                {/* Batch Selection Dropdown (Manual FEFO Override) */}
                <div className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold flex items-center">
                    <Clock className="w-3 h-3 text-teal-600 mr-1" /> Batch:
                  </span>

                  <select
                    value={item.selectedBatch.id}
                    onChange={(e) => updateCartItemBatch(item.product.id, e.target.value)}
                    className="bg-transparent text-[11px] font-mono font-bold text-teal-800 focus:outline-none cursor-pointer max-w-[200px] truncate"
                  >
                    {availableBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} (Exp: {b.expiryDate}) [{b.quantity} left]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Steppers & Line Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)}
                      className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-black text-xs text-slate-900 tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                      className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-xs text-slate-400 hover:text-red-600 p-1"
                  >
                    Remove
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Footer Totals & Quick Pay Grid */}
      <div className="border-t border-slate-200 pt-3 space-y-3">
        
        {/* Subtotal & Discount */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold tabular-nums">GH₵ {cartSubtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Discount (GH₵):</span>
            <input
              type="number"
              min="0"
              value={cartDiscount || ''}
              onChange={(e) => setCartDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-20 p-1 bg-slate-50 border border-slate-300 rounded text-right text-xs font-bold text-slate-900"
            />
          </div>

          <div className="flex justify-between items-center text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
            <span>NET TOTAL DUE:</span>
            <span className="text-xl text-teal-800 tabular-nums font-black">GH₵ {cartTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Quick Pay Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            disabled={cart.length === 0}
            onClick={onOpenCashModal}
            className="flex items-center justify-center space-x-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
            title="Exact Cash Pay [F4]"
          >
            <Banknote className="w-4 h-4" />
            <span>Exact Cash [F4]</span>
          </button>

          <button
            disabled={cart.length === 0}
            onClick={onOpenMoMoModal}
            className="flex items-center justify-center space-x-1.5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
            title="MoMo / Split Pay [F9]"
          >
            <CreditCard className="w-4 h-4" />
            <span>MoMo / Split [F9]</span>
          </button>
        </div>

      </div>

    </div>
  );
};
