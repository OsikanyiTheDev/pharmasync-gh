'use client';

import React from 'react';
import { History, ArrowRight, Clock } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Sale } from '../../lib/types';
import { formatReceiptDate, formatGHSCurrency } from '../../lib/whatsapp';

interface RecentSalesDrawerProps {
  onSelectSale: (sale: Sale) => void;
}

export const RecentSalesDrawer: React.FC<RecentSalesDrawerProps> = ({ onSelectSale }) => {
  const { sales, activeBranchId } = usePharmacy();

  // Filter sales for active branch
  const branchSales = sales.filter(s => s.branchId === activeBranchId);

  return (
    <div className="bg-white dark:bg-[#222327] rounded-2xl border border-slate-100/80 dark:border-white/5 p-5 text-slate-900 dark:text-white shadow-sm space-y-3">
      <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-white/5 pb-3">
        <div className="p-2 bg-[#4E60FF]/10 text-[#4E60FF] rounded-xl border border-[#4E60FF]/20">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Branch Receipts</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Click to view printable receipt or share via WhatsApp</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
        {branchSales.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No completed sales recorded for this branch yet</p>
        ) : (
          branchSales.slice(0, 5).map((sale) => (
            <div
              key={sale.id}
              onClick={() => onSelectSale(sale)}
              className="p-3 bg-slate-50 dark:bg-[#161719] hover:bg-slate-100/80 dark:hover:bg-white/5 border border-slate-100/80 dark:border-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-[#4E60FF]">{sale.receiptNumber}</span>
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                    {formatReceiptDate(sale.timestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  {sale.items.length} item(s) • <span className="font-bold text-slate-900 dark:text-white">{formatGHSCurrency(sale.total)}</span>
                </p>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-white/5 px-2 py-0.5 rounded">
                  {sale.payment.method}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#4E60FF] transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
