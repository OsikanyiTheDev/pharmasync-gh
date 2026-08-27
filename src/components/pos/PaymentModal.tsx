'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Banknote, CreditCard, Smartphone, Split, ArrowRight, User } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { PaymentMethod, PaymentDetails, Sale } from '../../lib/types';
import confetti from 'canvas-confetti';
import { useToast } from '../../context/ToastContext';

interface PaymentModalProps {
  isOpen: boolean;
  defaultMethod?: PaymentMethod;
  onClose: () => void;
  onSuccessSale: (sale: Sale) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  defaultMethod = 'CASH',
  onClose,
  onSuccessSale,
}) => {
  const { cartTotal, processCheckout, patientDetails } = usePharmacy();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(defaultMethod);
  const [cashTendered, setCashTendered] = useState<number>(cartTotal);
  const [momoProvider, setMomoProvider] = useState<'MTN Mobile Money' | 'Telecel Cash' | 'AT Money'>('MTN Mobile Money');
  const [momoAmount, setMomoAmount] = useState<number>(cartTotal);
  const [momoRef, setMomoRef] = useState<string>(`MOMO-${Math.floor(100000 + Math.random() * 900000)}`);
  
  const [customerName, setCustomerName] = useState<string>(patientDetails.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(patientDetails.phone || '');
  const [doctorName, setDoctorName] = useState<string>(patientDetails.doctor || '');

  // Global hotkeys for checkout modal
  useEffect(() => {
    setPaymentMethod(defaultMethod);
    setCashTendered(cartTotal);
    setMomoAmount(cartTotal);
  }, [defaultMethod, cartTotal, isOpen]);

  if (!isOpen) return null;

  const cashChange = Math.max(0, cashTendered - cartTotal);

  const handleConfirmCheckout = () => {
    const paymentData: PaymentDetails = {
      method: paymentMethod,
      customerName,
      customerPhone,
      prescribingDoctor: doctorName,
    };

    if (paymentMethod === 'CASH') {
      paymentData.cashPaid = cashTendered;
      paymentData.cashChange = cashChange;
    } else if (paymentMethod === 'SPLIT') {
      paymentData.cashPaid = cashTendered;
      paymentData.momoAmount = momoAmount;
      paymentData.momoProvider = momoProvider;
      paymentData.momoRef = momoRef;
    } else {
      paymentData.momoAmount = cartTotal;
      paymentData.momoProvider = momoProvider;
      paymentData.momoRef = momoRef;
    }

    const sale = processCheckout(paymentData);
    if (sale) {
      // Trigger celebrate confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore fallback
      }

      showToast('Sale transaction completed!', 'success', `Invoice: ${sale.receiptNumber}`);
      onSuccessSale(sale);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl relative animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Complete Dispensing Payment</h3>
            <p className="text-xs text-slate-500">Select payment channel & enter customer details</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Banner */}
        <div className="p-4 bg-teal-700 text-white rounded-xl mb-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-teal-100 uppercase font-bold tracking-wider">Total Amount Due</p>
            <p className="text-3xl font-black tabular-nums">GH₵ {cartTotal.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 bg-teal-800 rounded-lg text-xs font-bold text-teal-100 border border-teal-600">
              {paymentMethod}
            </span>
          </div>
        </div>

        {/* Payment Method Selector Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => setPaymentMethod('CASH')}
            className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center transition-all ${
              paymentMethod === 'CASH'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
            <span>Cash</span>
          </button>

          <button
            onClick={() => {
              setPaymentMethod('MOMO_MTN');
              setMomoProvider('MTN Mobile Money');
            }}
            className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center transition-all ${
              paymentMethod === 'MOMO_MTN'
                ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-5 h-5 mb-1 text-amber-600" />
            <span>MTN MoMo</span>
          </button>

          <button
            onClick={() => {
              setPaymentMethod('MOMO_TELECEL');
              setMomoProvider('Telecel Cash');
            }}
            className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center transition-all ${
              paymentMethod === 'MOMO_TELECEL'
                ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-1 text-indigo-600" />
            <span>Telecel Cash</span>
          </button>

          <button
            onClick={() => setPaymentMethod('SPLIT')}
            className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center transition-all ${
              paymentMethod === 'SPLIT'
                ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Split className="w-5 h-5 mb-1 text-teal-600" />
            <span>Split Pay</span>
          </button>
        </div>

        {/* Dynamic Payment Specific Fields */}
        <div className="space-y-3 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          
          {/* CASH PAYMENT */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cash Tendered (GH₵)</label>
                <input
                  type="number"
                  step="1"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-base font-black text-slate-900 tabular-nums"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center space-x-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 mr-1">Quick Tender:</span>
                {[cartTotal, 50, 100, 200].map((amt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCashTendered(amt)}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold rounded-lg text-xs"
                  >
                    GH₵ {amt}
                  </button>
                ))}
              </div>

              {/* Change Calculator Display */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <span className="text-emerald-900 font-bold">Change Due to Customer:</span>
                <span className="text-xl font-black text-emerald-700 tabular-nums">GH₵ {cashChange.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* MOBILE MONEY */}
          {paymentMethod !== 'CASH' && paymentMethod !== 'SPLIT' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Money Provider</label>
                  <select
                    value={momoProvider}
                    onChange={(e) => setMomoProvider(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-xs"
                  >
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Telecel Cash">Telecel Cash</option>
                    <option value="AT Money">AT Money</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Transaction Ref / ID</label>
                  <input
                    type="text"
                    value={momoRef}
                    onChange={(e) => setMomoRef(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SPLIT PAYMENT */}
          {paymentMethod === 'SPLIT' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cash Portion (GH₵)</label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setCashTendered(val);
                      setMomoAmount(Math.max(0, cartTotal - val));
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">MoMo Portion (GH₵)</label>
                  <input
                    type="number"
                    value={momoAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setMomoAmount(val);
                      setCashTendered(Math.max(0, cartTotal - val));
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">MoMo Reference</label>
                <input
                  type="text"
                  value={momoRef}
                  onChange={(e) => setMomoRef(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                />
              </div>
            </div>
          )}

        </div>

        {/* Customer / Patient Metadata Input */}
        <div className="space-y-2 border-t border-slate-200 pt-3 text-xs mb-4">
          <p className="font-bold text-slate-800 flex items-center">
            <User className="w-3.5 h-3.5 mr-1 text-teal-700" /> Patient Receipt Details
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
            />
            <input
              type="text"
              placeholder="Phone (WhatsApp Receipt)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Action Confirm Button */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmCheckout}
            className="flex items-center space-x-2 px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-xl shadow-lg transition-all"
          >
            <span>Confirm & Issue Receipt</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
