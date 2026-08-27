'use client';

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { BranchId, Product, Batch } from '../../lib/types';
import { getBatchExpiryStatus } from '../../lib/fefo';
import { StockTransferModal } from '../../components/inventory/StockTransferModal';
import { StockAdjustModal } from '../../components/inventory/StockAdjustModal';
import Link from 'next/link';
import { 
  Package, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  SlidersHorizontal, 
  Search, 
  Layers, 
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Tag,
  FileSpreadsheet
} from 'lucide-react';

export default function InventoryPage() {
  const { branches, activeBranchId, products, batches } = usePharmacy();

  const [selectedBranchFilter, setSelectedBranchFilter] = useState<BranchId | 'ALL'>(activeBranchId);
  const [selectedExpiryFilter, setSelectedExpiryFilter] = useState<'ALL' | 'HEALTHY' | 'EXPIRING_SOON' | 'EXPIRED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetProduct, setAdjustTargetProduct] = useState<Product | null>(null);
  const [adjustTargetBatch, setAdjustTargetBatch] = useState<Batch | null>(null);

  // Branch Stock Comparison Counts
  const branchStockCounts = branches.map(b => {
    const branchBatches = batches.filter(batch => batch.branchId === b.id);
    const totalQty = branchBatches.reduce((acc, batch) => acc + batch.quantity, 0);
    const lowStockCount = products.filter(p => {
      const pBatches = branchBatches.filter(bt => bt.productId === p.id);
      const sum = pBatches.reduce((a, bt) => a + bt.quantity, 0);
      return sum <= 15;
    }).length;

    return { branch: b, totalQty, lowStockCount };
  });

  // Filter products
  const filteredProducts = products.filter(product => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      product.brandName.toLowerCase().includes(q) ||
      product.genericName.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q);

    // Get batches for this product matching branch filter
    const productBatches = batches.filter(
      b => b.productId === product.id && (selectedBranchFilter === 'ALL' || b.branchId === selectedBranchFilter)
    );

    const hasMatchingExpiry = productBatches.some(b => {
      const status = getBatchExpiryStatus(b.expiryDate).status;
      return selectedExpiryFilter === 'ALL' || status === selectedExpiryFilter;
    });

    return matchesSearch && (productBatches.length > 0 || selectedExpiryFilter === 'ALL') && hasMatchingExpiry;
  });

  const toggleExpand = (productId: string) => {
    setExpandedProductId(prev => (prev === productId ? null : productId));
  };

  const handleOpenAdjustModal = (product: Product, batch: Batch) => {
    setAdjustTargetProduct(product);
    setAdjustTargetBatch(batch);
    setIsAdjustModalOpen(true);
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-xl border border-teal-200 dark:border-teal-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Multi-Branch Inventory & Medical Ledger</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track stock levels, location shelves, and FEFO expiry status across branches</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/inventory/import"
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>Bulk Import CSV</span>
          </Link>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Inter-Branch Transfer</span>
          </button>
        </div>
      </div>

      {/* Branch Comparison Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branchStockCounts.map(({ branch, totalQty, lowStockCount }) => (
          <div
            key={branch.id}
            onClick={() => setSelectedBranchFilter(branch.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
              selectedBranchFilter === branch.id
                ? 'bg-teal-50 border-teal-600 text-teal-900 dark:bg-teal-950/60 dark:text-teal-100 dark:border-teal-500 shadow-sm ring-2 ring-teal-600/30'
                : 'bg-white text-slate-900 border-slate-200 hover:border-teal-500 dark:bg-[#131b2e] dark:text-slate-100 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${selectedBranchFilter === branch.id ? 'text-teal-800 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {branch.name}
              </span>
              <Building2 className={`w-4 h-4 ${selectedBranchFilter === branch.id ? 'text-teal-700 dark:text-teal-300' : 'text-teal-600 dark:text-teal-400'}`} />
            </div>

            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black tabular-nums">
                {totalQty.toLocaleString()} <span className="text-xs font-normal opacity-80">packs</span>
              </p>

              {lowStockCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedBranchFilter === branch.id
                    ? 'bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-400 dark:text-slate-950'
                    : 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                }`}>
                  {lowStockCount} Low Stock
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Branch Switcher Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-teal-600 dark:text-teal-400" /> Filter Branch:
            </span>

            <button
              onClick={() => setSelectedBranchFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedBranchFilter === 'ALL'
                  ? 'bg-teal-700 text-white shadow-xs dark:bg-teal-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              All 3 Branches
            </button>

            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBranchFilter(b.id as BranchId)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedBranchFilter === b.id
                    ? 'bg-teal-700 text-white shadow-xs dark:bg-teal-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {b.name.split(' ')[0]} {b.name.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search product or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

        </div>

        {/* Expiry Health Tabs */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400 mr-1">Expiry Health:</span>

          <button
            onClick={() => setSelectedExpiryFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              selectedExpiryFilter === 'ALL' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Statuses
          </button>

          <button
            onClick={() => setSelectedExpiryFilter('HEALTHY')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 ${
              selectedExpiryFilter === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Healthy (&gt;90d)</span>
          </button>

          <button
            onClick={() => setSelectedExpiryFilter('EXPIRING_SOON')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 ${
              selectedExpiryFilter === 'EXPIRING_SOON' ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Expiring Soon (&le;90d)</span>
          </button>

          <button
            onClick={() => setSelectedExpiryFilter('EXPIRED')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 ${
              selectedExpiryFilter === 'EXPIRED' ? 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Expired</span>
          </button>
        </div>
      </div>

      {/* Interactive Medical Data Table */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 dark:bg-[#0b0f19] dark:text-slate-300 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4"></th>
                <th className="py-3.5 px-3">Medicine & Dosage</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 text-center">Total Stock</th>
                <th className="py-3.5 px-3 text-right">Unit Cost (GH₵)</th>
                <th className="py-3.5 px-3 text-right">Unit Sell (GH₵)</th>
                <th className="py-3.5 px-3 text-right">Margin %</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No medicines found matching the active filter selections.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const productBatches = batches.filter(
                    b => b.productId === product.id && (selectedBranchFilter === 'ALL' || b.branchId === selectedBranchFilter)
                  );
                  const totalUnits = productBatches.reduce((acc, b) => acc + b.quantity, 0);
                  const marginPercent = ((product.retailPrice - product.costPrice) / product.retailPrice) * 100;
                  const isExpanded = expandedProductId === product.id;

                  return (
                    <React.Fragment key={product.id}>
                      
                      {/* Main Product Row */}
                      <tr 
                        onClick={() => toggleExpand(product.id)}
                        className={`hover:bg-teal-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${isExpanded ? 'bg-teal-50/70 dark:bg-slate-800/70 font-semibold' : ''}`}
                      >
                        <td className="py-3 px-4 text-slate-400">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-teal-700 dark:text-teal-400" /> : <ChevronRight className="w-4 h-4" />}
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{product.brandName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{product.genericName} • {product.strength} ({product.dosageForm})</p>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-[11px]">
                            {product.category}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-black text-xs tabular-nums ${
                            totalUnits === 0
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                              : totalUnits <= 15
                              ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          }`}>
                            {totalUnits} packs
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                          GH₵ {product.costPrice.toFixed(2)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                          GH₵ {product.retailPrice.toFixed(2)}
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-teal-800 dark:text-teal-400 tabular-nums">
                          {marginPercent.toFixed(1)}%
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(product.id);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold"
                          >
                            {isExpanded ? 'Hide Batches' : `View Batches (${productBatches.length})`}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Batches Sub-Table Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50 border-b border-slate-200 dark:bg-[#0b0f19] dark:border-slate-800">
                          <td colSpan={8} className="p-4">
                            <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-inner space-y-2">
                              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 flex items-center">
                                  <Layers className="w-4 h-4 text-teal-700 dark:text-teal-400 mr-1.5" />
                                  Active FEFO Batches for {product.brandName}
                                </h4>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{productBatches.length} batch(es) listed</span>
                              </div>

                              <div className="space-y-1.5">
                                {productBatches.length === 0 ? (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 py-2">No active batches recorded for this medicine in active selection.</p>
                                ) : (
                                  productBatches.map(b => {
                                    const expInfo = getBatchExpiryStatus(b.expiryDate);
                                    const branchName = branches.find(br => br.id === b.branchId)?.name || b.branchId;

                                    return (
                                      <div
                                        key={b.id}
                                        className="p-2.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <span className="font-mono font-bold text-teal-800 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                                            {b.batchNumber}
                                          </span>
                                          <span className="font-semibold text-slate-700 dark:text-slate-300">{branchName}</span>
                                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center">
                                            <MapPin className="w-3 h-3 text-slate-400 mr-0.5" />
                                            {b.locationShelf || 'Main Shelf'}
                                          </span>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                          <span className="text-slate-600 dark:text-slate-400 font-semibold">Qty: <b className="text-slate-900 dark:text-slate-100 font-mono">{b.quantity}</b></span>
                                          <span className="text-slate-600 dark:text-slate-400 font-mono">Exp: {b.expiryDate}</span>

                                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            expInfo.status === 'EXPIRED'
                                              ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
                                              : expInfo.status === 'EXPIRING_SOON'
                                              ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                                          }`}>
                                            {expInfo.label}
                                          </span>

                                          <button
                                            onClick={() => handleOpenAdjustModal(product, b)}
                                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-bold text-[11px] flex items-center space-x-1"
                                          >
                                            <SlidersHorizontal className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                            <span>Adjust</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Transfer Modal */}
      <StockTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        product={adjustTargetProduct}
        batch={adjustTargetBatch}
        onClose={() => setIsAdjustModalOpen(false)}
      />

    </div>
  );
}
