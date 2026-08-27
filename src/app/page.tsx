'use client';

import React, { useState } from 'react';
import { ProductSearch } from '../components/pos/ProductSearch';
import { CartDrawer } from '../components/pos/CartDrawer';
import { PaymentModal } from '../components/pos/PaymentModal';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { RecentSalesDrawer } from '../components/pos/RecentSalesDrawer';
import { PaymentMethod, Sale } from '../lib/types';
import { usePharmacy } from '../context/PharmacyContext';
import { Keyboard, Zap, ShieldCheck } from 'lucide-react';

export default function POSPage() {
  const { lastCompletedSale, activeBranch } = usePharmacy();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDefaultMethod, setPaymentDefaultMethod] = useState<PaymentMethod>('CASH');
  
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null);

  const handleOpenCashModal = () => {
    setPaymentDefaultMethod('CASH');
    setIsPaymentModalOpen(true);
  };

  const handleOpenMoMoModal = () => {
    setPaymentDefaultMethod('MOMO_MTN');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (sale: Sale) => {
    setIsPaymentModalOpen(false);
    setSelectedReceiptSale(sale);
    setIsReceiptModalOpen(true);
  };

  const handleSelectRecentSale = (sale: Sale) => {
    setSelectedReceiptSale(sale);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner Notice */}
      <div className="bg-white dark:bg-[#222327] rounded-2xl p-4 shadow-sm border border-slate-100/80 dark:border-white/5 flex flex-wrap items-center justify-between text-slate-900 dark:text-slate-100 gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#4E60FF]/10 text-[#4E60FF] rounded-xl border border-[#4E60FF]/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base text-slate-900 dark:text-slate-100">Fast Counter POS (Zero-Barcode Engine)</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4E60FF]/10 text-[#4E60FF] border border-[#4E60FF]/20">
                FEFO Batch Auto-Select
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operating Context: <b className="text-slate-900 dark:text-white">{activeBranch.name}</b> • Press <kbd className="px-1 bg-slate-100 dark:bg-slate-800 text-[#4E60FF] rounded text-[11px] border border-slate-200 dark:border-slate-700">/</kbd> search, <kbd className="px-1 bg-slate-100 dark:bg-slate-800 text-[#4E60FF] rounded text-[11px] border border-slate-200 dark:border-slate-700">F4</kbd> Cash, <kbd className="px-1 bg-slate-100 dark:bg-slate-800 text-[#4E60FF] rounded text-[11px] border border-slate-200 dark:border-slate-700">F8</kbd> MoMo
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-[#161719] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/5">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>Local Cache Ready</span>
        </div>
      </div>

      {/* Main Grid: Left Search (7 cols) + Right Cart (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Product Search & FEFO Grid */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <ProductSearch />
        </div>

        {/* Right Column: Sales Cart & Recent Receipts */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <CartDrawer
            onOpenCashModal={handleOpenCashModal}
            onOpenMoMoModal={handleOpenMoMoModal}
          />

          <RecentSalesDrawer onSelectSale={handleSelectRecentSale} />
        </div>

      </div>

      {/* Checkout Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        defaultMethod={paymentDefaultMethod}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccessSale={handlePaymentSuccess}
      />

      {/* Receipt & WhatsApp Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        sale={selectedReceiptSale || lastCompletedSale}
        onClose={() => setIsReceiptModalOpen(false)}
      />

    </div>
  );
}
