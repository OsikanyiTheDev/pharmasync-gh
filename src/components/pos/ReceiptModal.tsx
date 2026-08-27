'use client';

import React, { useState } from 'react';
import { X, Printer, Share2, Copy, ExternalLink, FileText, Check, MessageSquare } from 'lucide-react';
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
    showToast('WhatsApp receipt text copied to clipboard!', 'success');
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-6 text-slate-900 dark:text-white shadow-2xl relative flex flex-col max-h-[92vh]">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Official Dispensing Receipt</h3>
              <p className="text-xs text-slate-400">Invoice Ref: <span className="font-mono text-teal-400 font-bold">{sale.receiptNumber}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Panel Body: Left Printable Receipt + Right WhatsApp Chat Bubble Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1 pr-1">
          
          {/* Left Column: Printable Invoice Layout (8 cols) */}
          <div className="lg:col-span-7 bg-white text-slate-900 p-6 rounded-xl shadow-inner border border-slate-300 font-sans print:p-0 print:border-none print:shadow-none print:bg-white" id="printable-receipt">
            
            {/* Pharmacy Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
              <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
                {activeBranch.name}
              </h1>
              <p className="text-xs text-slate-700 font-medium">{activeBranch.location}</p>
              <p className="text-xs text-slate-700">Tel: <b>{activeBranch.phone}</b> | Pharm Reg: <b>{activeBranch.code}</b></p>
              <p className="text-[10px] text-slate-500 mt-1">TIN: 1009827361-GH | Pharmacy Council Licensed</p>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 text-xs mb-4 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <p className="text-slate-500">Invoice Reference:</p>
                <p className="font-extrabold font-mono text-slate-900 text-sm">{sale.receiptNumber}</p>
              </div>
              <div>
                <p className="text-slate-500">Date & Time:</p>
                <p className="font-semibold text-slate-900">{formatReceiptDate(sale.timestamp)}</p>
              </div>
              <div>
                <p className="text-slate-500">Dispenser / Attendant:</p>
                <p className="font-semibold text-slate-900">{sale.attendantName}</p>
              </div>
              <div>
                <p className="text-slate-500">Customer Name:</p>
                <p className="font-bold text-slate-900">{sale.payment.customerName || 'Walk-in Client'}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs mb-4 border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-800 font-bold bg-slate-100">
                  <th className="py-2 px-2">Item & FEFO Batch</th>
                  <th className="py-2 px-1 text-center">Qty</th>
                  <th className="py-2 px-1 text-right">Price</th>
                  <th className="py-2 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="text-slate-800">
                    <td className="py-2 px-2">
                      <p className="font-bold text-slate-900">{item.product.brandName}</p>
                      <p className="text-[10px] text-slate-600 font-mono">
                        {item.product.dosageForm} • Batch: {item.selectedBatch.batchNumber} (Exp: {item.selectedBatch.expiryDate})
                      </p>
                    </td>
                    <td className="py-2 px-1 text-center font-bold">{item.quantity}</td>
                    <td className="py-2 px-1 text-right">GH₵ {item.unitPrice.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-extrabold">GH₵ {item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pricing Totals */}
            <div className="border-t-2 border-slate-900 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatGHSCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Discount Applied:</span>
                  <span>-{formatGHSCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                <span>NET TOTAL PAID:</span>
                <span className="text-base text-teal-800">{formatGHSCurrency(sale.total)}</span>
              </div>

              {/* Payment Method Details */}
              <div className="mt-3 p-2 bg-slate-100 rounded text-[11px] text-slate-700">
                <span className="font-bold">Payment Method: </span>
                {sale.payment.method === 'CASH' && (
                  <span>Cash Paid: {formatGHSCurrency(sale.payment.cashPaid || sale.total)} (Change: {formatGHSCurrency(sale.payment.cashChange || 0)})</span>
                )}
                {sale.payment.method === 'SPLIT' && (
                  <span>Cash: {formatGHSCurrency(sale.payment.cashPaid || 0)} + {sale.payment.momoProvider}: {formatGHSCurrency(sale.payment.momoAmount || 0)} (Ref: {sale.payment.momoRef})</span>
                )}
                {sale.payment.method.startsWith('MOMO') && sale.payment.method !== 'SPLIT' && (
                  <span>{sale.payment.momoProvider} (Ref: {sale.payment.momoRef})</span>
                )}
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-4 italic">
                Thank you for trusting {activeBranch.name}. Keep medicines out of reach of children.
              </div>
            </div>

          </div>

          {/* Right Column: Visual WhatsApp Chat Bubble Preview Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-3 no-print">
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-300">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Customer Share Preview</span>
            </div>

            {/* Simulated WhatsApp Chat Bubble */}
            <div className="bg-[#0b141a] p-4 rounded-2xl border border-slate-800 shadow-xl flex-1 flex flex-col justify-between font-sans">
              <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-md border border-emerald-600/30 overflow-y-auto max-h-[360px]">
                {whatsappText}
              </div>

              <div className="mt-3 text-[10px] text-slate-400 text-center">
                Phone Target: <b className="text-emerald-400 font-mono">{sale.payment.customerPhone || 'Not specified (Walk-in)'}</b>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => showToast('Opening WhatsApp Web...', 'info')}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>1-Click Send via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleCopyWhatsAppText}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedWhatsApp ? 'Copied Message!' : 'Copy Text Message'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Action Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between no-print">
          <button
            onClick={handlePrintReceipt}
            className="flex items-center space-x-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice (A4 / A5)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
          >
            Next Sale
          </button>
        </div>

      </div>
    </div>
  );
};
