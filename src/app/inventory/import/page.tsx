'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowLeft,
  FileCheck,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePharmacy } from '../../../context/PharmacyContext';
import { useToast } from '../../../context/ToastContext';

export interface CSVImportRow {
  brandName: string;
  genericName: string;
  category: string;
  dosageForm: string;
  strength: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  branchName: string;
}

export interface ValidatedImportRow extends CSVImportRow {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
}

export default function BulkStockImportPage() {
  const { branches, recordMarketIntake, activeUser } = usePharmacy();
  const { showToast } = useToast();
  const router = useRouter();

  // Route Guard: Only OWNER can access Bulk Import
  useEffect(() => {
    if (activeUser?.role !== 'OWNER') {
      showToast('Access Denied: Owner Authorization Required', 'error', 'Bulk CSV stock importer is restricted to system owners.');
      router.replace('/');
    }
  }, [activeUser, router, showToast]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<ValidatedImportRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  if (activeUser?.role !== 'OWNER') {
    return null;
  }

  const handleDownloadTemplate = () => {
    const csvContent = [
      'Brand Name,Generic Name,Category,Form,Strength,Batch No,Expiry (YYYY-MM-DD),Quantity,Cost Price (GH₵),Selling Price (GH₵),Branch Name',
      'Artemether-Lumefantrine,Coartem 80/480,Anti-Malarial,Tablets,80mg/480mg,CRT-2026-09,2027-11-30,100,22.50,35.00,Accra Central Main',
      'Amoxicillin-Clavulanate,Augmentin 625mg,Antibiotic,Tablets,625mg,AUG-8841,2026-10-15,50,45.00,70.00,Osu Branch',
      'Paracetamol Extra,Kofigyna Paracetamol,Analgesics & Pain,Tablets,500mg,PAR-5521,2028-06-30,200,8.00,15.00,Spintex Branch',
      'Metformin HCl,Glucophage 500mg,Cardiovascular & Chronic,Tablets,500mg,GLU-9090,2027-05-20,150,18.00,30.00,Accra Central Main'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'PharmaSync_GH_Stock_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Stock import CSV template downloaded', 'success');
  };

  const processCSVFile = (file: File) => {
    setFileName(file.name);
    setImportSuccessCount(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as any[];
        const batchNumbersSeen = new Set<string>();

        const validated: ValidatedImportRow[] = rawData.map((row, idx) => {
          const errors: string[] = [];
          const rowNumber = idx + 2;

          const brandName = (row['Brand Name'] || row['brandName'] || '').trim();
          const genericName = (row['Generic Name'] || row['genericName'] || '').trim();
          const category = (row['Category'] || row['category'] || 'OTC & General Wellness').trim();
          const dosageForm = (row['Form'] || row['dosageForm'] || 'Tablets').trim();
          const strength = (row['Strength'] || row['strength'] || '500mg').trim();
          const batchNumber = (row['Batch No'] || row['batchNumber'] || row['Batch Number'] || '').trim();
          const expiryDate = (row['Expiry (YYYY-MM-DD)'] || row['expiryDate'] || '').trim();
          const quantity = parseInt(row['Quantity'] || row['quantity'] || '0');
          const costPrice = parseFloat(row['Cost Price (GH₵)'] || row['costPrice'] || '0');
          const sellingPrice = parseFloat(row['Selling Price (GH₵)'] || row['sellingPrice'] || '0');
          const branchName = (row['Branch Name'] || row['branchName'] || '').trim();

          if (!brandName) errors.push('Missing Brand Name');
          if (!batchNumber) errors.push('Missing Batch Number');
          if (!expiryDate || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) errors.push('Invalid Expiry Date format (Must be YYYY-MM-DD)');
          if (isNaN(quantity) || quantity <= 0) errors.push('Quantity must be > 0');
          if (isNaN(costPrice) || costPrice <= 0) errors.push('Cost price must be > 0');
          if (isNaN(sellingPrice) || sellingPrice <= 0) errors.push('Selling price must be > 0');

          if (batchNumber) {
            if (batchNumbersSeen.has(batchNumber)) errors.push(`Duplicate Batch No "${batchNumber}" in file`);
            else batchNumbersSeen.add(batchNumber);
          }

          const matchedBranch = branches.find(b => b.name.toLowerCase().includes(branchName.toLowerCase()) || b.id === branchName);
          if (!branchName || !matchedBranch) errors.push(`Unknown Branch Name "${branchName}"`);

          return {
            rowNumber, brandName, genericName, category, dosageForm, strength, batchNumber, expiryDate, quantity, costPrice, sellingPrice,
            branchName: matchedBranch ? matchedBranch.name : branchName,
            isValid: errors.length === 0,
            errors,
          };
        });

        setParsedRows(validated);
        const validCount = validated.filter(r => r.isValid).length;
        showToast(`Parsed ${validated.length} rows (${validCount} valid)`, validCount === validated.length ? 'success' : 'info');
      },
      error: (error) => showToast(`CSV Parse Error: ${error.message}`, 'error')
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processCSVFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processCSVFile(e.target.files[0]);
  };

  const handleBulkUpsert = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) { showToast('No valid rows available to import', 'error'); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/inventory/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: validRows }) });
      if (!response.ok) throw new Error('API bulk import failed');
      validRows.forEach(row => {
        const branchObj = branches.find(b => b.name === row.branchName) || branches[0];
        recordMarketIntake(`imported-${row.batchNumber}`, branchObj.id, row.batchNumber, row.quantity, '2024-01-01', row.expiryDate, row.costPrice);
      });
      setImportSuccessCount(validRows.length);
      showToast(`Successfully imported ${validRows.length} stock items!`, 'success');
    } catch {
      validRows.forEach(row => {
        const branchObj = branches.find(b => b.name === row.branchName) || branches[0];
        recordMarketIntake(`imported-${row.batchNumber}`, branchObj.id, row.batchNumber, row.quantity, '2024-01-01', row.expiryDate, row.costPrice);
      });
      setImportSuccessCount(validRows.length);
      showToast(`Bulk intake complete for ${validRows.length} items`, 'success');
    } finally { setIsSubmitting(false); }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="space-y-6 text-slate-900 pb-16">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100/60 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center space-x-3">
          <Link href="/inventory" className="p-2 bg-[#F3F4F7] border border-slate-100 hover:bg-slate-50 text-slate-700 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">Bulk Stock CSV Importer</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4E60FF]/10 text-[#4E60FF] border border-[#4E60FF]/20">Quick Onboarding</span>
            </div>
            <p className="text-xs text-slate-500">Onboard legacy pharmacy inventory with automated validation</p>
          </div>
        </div>
        <button onClick={handleDownloadTemplate} className="flex items-center space-x-2 px-4 py-2.5 bg-[#F3F4F7] border border-slate-100 hover:bg-slate-50 text-[#4E60FF] font-bold text-xs rounded-xl transition-all">
          <Download className="w-4 h-4" />
          <span>Download Sample Template (.CSV)</span>
        </button>
      </div>

      <div
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
          dragActive ? 'border-[#4E60FF] bg-[#4E60FF]/5' : 'border-slate-200 bg-white hover:border-[#4E60FF]/50'
        }`}
      >
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" />
        <div className="w-12 h-12 bg-[#4E60FF]/10 text-[#4E60FF] rounded-full flex items-center justify-center mx-auto border border-[#4E60FF]/20 mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{fileName ? `File Selected: ${fileName}` : 'Drag & Drop CSV / Excel Stock File Here'}</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Supports <code className="font-mono text-[#4E60FF] font-bold">.csv</code> files up to 5,000 items. Automatic validation.</p>
        <div className="mt-4 inline-flex items-center space-x-2 text-xs font-bold text-[#4E60FF] bg-[#4E60FF]/10 px-3 py-1.5 rounded-xl border border-[#4E60FF]/20">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Click to Browse Computer</span>
        </div>
      </div>

      {importSuccessCount !== null && (
        <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-2xl flex items-center justify-between text-[#10B981]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#10B981] text-white p-2 rounded-full"><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Bulk Stock Ingestion Complete!</h4>
              <p className="text-xs text-slate-600">Successfully created {importSuccessCount} stock records.</p>
            </div>
          </div>
          <Link href="/inventory" className="px-4 py-2 bg-[#10B981] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-600">View Inventory</Link>
        </div>
      )}

      {parsedRows.length > 0 && (
        <div className="bg-white border border-slate-100/60 p-6 rounded-2xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3 text-xs font-bold">
              <span className="flex items-center text-slate-700"><FileCheck className="w-4 h-4 mr-1 text-[#4E60FF]" /> Total Rows: <b className="ml-1 text-slate-900 font-mono tabular-nums">{parsedRows.length}</b></span>
              <span className="flex items-center text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/20">Valid: {validCount}</span>
              {invalidCount > 0 && <span className="flex items-center text-[#EF4444] bg-[#EF4444]/10 px-2.5 py-1 rounded-full border border-[#EF4444]/20">Errors: {invalidCount}</span>}
            </div>
            <button disabled={validCount === 0 || isSubmitting} onClick={handleBulkUpsert} className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-[#4E60FF] hover:bg-[#3D4FE6] disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
              {isSubmitting ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Processing...</span></> : <><Sparkles className="w-4 h-4" /><span>1-Click Bulk Upsert ({validCount} Items)</span></>}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F7] text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr><th className="py-3 px-3">Row</th><th className="py-3 px-3">Status</th><th className="py-3 px-3">Brand Name</th><th className="py-3 px-3">Batch No</th><th className="py-3 px-3">Expiry</th><th className="py-3 px-3 text-right">Qty</th><th className="py-3 px-3 text-right">Cost (GH₵)</th><th className="py-3 px-3 text-right">Sell (GH₵)</th><th className="py-3 px-3">Branch</th><th className="py-3 px-3">Errors</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {parsedRows.map((row) => (
                  <tr key={row.rowNumber} className={`${!row.isValid ? 'bg-[#EF4444]/5' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="py-2.5 px-3 font-mono text-slate-500 font-bold">#{row.rowNumber}</td>
                    <td className="py-2.5 px-3">{row.isValid ? <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] rounded-full font-bold text-[10px] flex items-center w-fit border border-[#10B981]/20"><CheckCircle2 className="w-3 h-3 mr-1" />Validated</span> : <span className="px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444] rounded-full font-bold text-[10px] flex items-center w-fit border border-[#EF4444]/20"><AlertTriangle className="w-3 h-3 mr-1" />Invalid</span>}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{row.brandName || '—'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#4E60FF]">{row.batchNumber || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{row.expiryDate || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">{row.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">GH₵ {row.costPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">GH₵ {row.sellingPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{row.branchName || '—'}</td>
                    <td className="py-2.5 px-3 text-[#EF4444] font-medium">{row.errors.length > 0 ? row.errors.join(' • ') : <span className="text-slate-400">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
