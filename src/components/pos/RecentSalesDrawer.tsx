'use client';

import React from 'react';
import { History, FileText, ArrowRight, Banknote, Smartphone, Clock } from 'lucide-react';
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
    <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-slate-900 dark:text-white shadow-xs">
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Recent Branch Receipts</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Click to view printable receipt or share via WhatsApp</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
        {branchSales.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No completed sales recorded for this branch yet</p>
        ) : (
          branchSales.slice(0, 5).map((sale) => (
            <div
              key={sale.id}
              onClick={() => onSelectSale(sale)}
              className="p-2.5 bg-slate-50 dark:bg-[#0b0f19] hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-teal-800 dark:text-emerald-400">{sale.receiptNumber}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center">
                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                    {formatReceiptDate(sale.timestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  {sale.items.length} item(s) • <span className="font-bold text-slate-900 dark:text-white">{formatGHSCurrency(sale.total)}</span>
                </p>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-400 bg-slate-200 dark:bg-[#131b2e] px-2 py-0.5 rounded border border-slate-300 dark:border-slate-800">
                  {sale.payment.method}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 dark:group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
