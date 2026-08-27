'use client';

import React, { useState } from 'react';
import { X, Printer, Share2, Copy, ExternalLink, FileText, MessageSquare } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Sale } from '../../lib/types';
import { generateWhatsAppReceiptText, getWhatsAppShareUrl, formatGHSCurrency, formatReceiptDate } from '../../lib/whatsapp';
import { useToast } from '../../context/ToastContext';

interface ReceiptModalProps {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, sale, onClose }) => {
  const { activeBranch } = usePharmacy();
  const { showToast } = useToast();
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  if (!isOpen || !sale) return null;

  const whatsappText = generateWhatsAppReceiptText(sale, activeBranch);
  const whatsappUrl = getWhatsAppShareUrl(sale.payment.customerPhone, whatsappText);

  const handleCopyWhatsAppText = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopiedWhatsApp(true);
    showToast('WhatsApp receipt text copied!', 'success');
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-100/60 rounded-2xl max-w-4xl w-full p-6 text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative flex flex-col max-h-[92vh]">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#4E60FF]/10 text-[#4E60FF] rounded-xl border border-[#4E60FF]/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Official Dispensing Receipt</h3>
              <p className="text-xs text-slate-500">Invoice Ref: <span className="font-mono text-[#4E60FF] font-bold">{sale.receiptNumber}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1 pr-1">
          
          <div className="lg:col-span-7 bg-white text-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 font-sans" id="printable-receipt">
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
              <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">{activeBranch.name}</h1>
              <p className="text-xs text-slate-700 font-medium">{activeBranch.location}</p>
              <p className="text-xs text-slate-700">Tel: <b>{activeBranch.phone}</b> | Pharm Reg: <b>{activeBranch.code}</b></p>
              <p className="text-[10px] text-slate-500 mt-1">TIN: 1009827361-GH | Pharmacy Council Licensed</p>
            </div>

            <div className="grid grid-cols-2 text-xs mb-4 gap-2 bg-[#F3F4F7] p-2.5 rounded-xl border border-slate-100">
              <div><p className="text-slate-500">Invoice Reference:</p><p className="font-bold font-mono text-slate-900 text-sm">{sale.receiptNumber}</p></div>
              <div><p className="text-slate-500">Date & Time:</p><p className="font-semibold text-slate-900">{formatReceiptDate(sale.timestamp)}</p></div>
              <div><p className="text-slate-500">Dispenser:</p><p className="font-semibold text-slate-900">{sale.attendantName}</p></div>
              <div><p className="text-slate-500">Customer Name:</p><p className="font-bold text-slate-900">{sale.payment.customerName || 'Walk-in Client'}</p></div>
            </div>

            <table className="w-full text-left text-xs mb-4 border-collapse">
              <thead><tr className="border-b-2 border-slate-800 text-slate-800 font-bold bg-[#F3F4F7]"><th className="py-2 px-2 rounded-l-lg">Item & FEFO Batch</th><th className="py-2 px-1 text-center">Qty</th><th className="py-2 px-1 text-right">Price</th><th className="py-2 px-2 text-right rounded-r-lg">Total</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="text-slate-800"><td className="py-2 px-2"><p className="font-bold text-slate-900">{item.product.brandName}</p><p className="text-[10px] text-slate-600 font-mono">{item.product.dosageForm} • Batch: {item.selectedBatch.batchNumber} (Exp: {item.selectedBatch.expiryDate})</p></td><td className="py-2 px-1 text-center font-bold">{item.quantity}</td><td className="py-2 px-1 text-right">GH₵ {item.unitPrice.toFixed(2)}</td><td className="py-2 px-2 text-right font-bold">GH₵ {item.lineTotal.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-slate-900 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-700"><span>Subtotal:</span><span className="font-semibold">{formatGHSCurrency(sale.subtotal)}</span></div>
              {sale.discount > 0 && <div className="flex justify-between text-[#EF4444] font-medium"><span>Discount Applied:</span><span>-{formatGHSCurrency(sale.discount)}</span></div>}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200"><span>NET TOTAL PAID:</span><span className="text-base text-[#4E60FF]">{formatGHSCurrency(sale.total)}</span></div>
              <div className="mt-3 p-2 bg-[#F3F4F7] rounded-xl text-[11px] text-slate-700 border border-slate-100"><span className="font-bold">Payment Method: </span>{sale.payment.method === 'CASH' && <span>Cash Paid: {formatGHSCurrency(sale.payment.cashPaid || sale.total)} (Change: {formatGHSCurrency(sale.payment.cashChange || 0)})</span>}{sale.payment.method === 'SPLIT' && <span>Cash: {formatGHSCurrency(sale.payment.cashPaid || 0)} + {sale.payment.momoProvider}: {formatGHSCurrency(sale.payment.momoAmount || 0)} (Ref: {sale.payment.momoRef})</span>}{sale.payment.method.startsWith('MOMO') && sale.payment.method !== 'SPLIT' && <span>{sale.payment.momoProvider} (Ref: {sale.payment.momoRef})</span>}</div>
              <div className="text-center text-[10px] text-slate-500 pt-4 italic">Thank you for trusting {activeBranch.name}. Keep medicines out of reach of children.</div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col space-y-3 no-print">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#4E60FF]">
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Customer Share Preview</span>
            </div>
            <div className="bg-[#F3F4F7] p-4 rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col justify-between font-sans">
              <div className="bg-white border border-slate-100 text-slate-900 p-3.5 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-sm overflow-y-auto max-h-[360px]">{whatsappText}</div>
              <div className="mt-3 text-[10px] text-slate-500 text-center">Phone Target: <b className="text-[#4E60FF] font-mono">{sale.payment.customerPhone || 'Not specified (Walk-in)'}</b></div>
            </div>
            <div className="space-y-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => showToast('Opening WhatsApp Web...', 'info')} className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"><Share2 className="w-4 h-4" /><span>1-Click Send via WhatsApp</span><ExternalLink className="w-3.5 h-3.5" /></a>
              <button onClick={handleCopyWhatsAppText} className="w-full py-2 bg-[#F3F4F7] border border-slate-100 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"><Copy className="w-3.5 h-3.5" /><span>{copiedWhatsApp ? 'Copied Message!' : 'Copy Text Message'}</span></button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between no-print">
          <button onClick={handlePrintReceipt} className="flex items-center space-x-2 px-5 py-2.5 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white rounded-xl text-xs font-bold transition-all shadow-sm"><Printer className="w-4 h-4" /><span>Print Invoice (A4 / A5)</span></button>
          <button onClick={onClose} className="px-5 py-2.5 bg-[#F3F4F7] border border-slate-100 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all">Next Sale</button>
        </div>
      </div>
    </div>
  );
};
