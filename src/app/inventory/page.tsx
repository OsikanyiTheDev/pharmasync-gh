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
  ChevronDown,
  ChevronRight,
  MapPin,
  FileSpreadsheet,
  AlertCircle
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

  // Summary Metrics Calculation
  const activeBatches = batches.filter(
    b => selectedBranchFilter === 'ALL' || b.branchId === selectedBranchFilter
  );

  const totalStockPacks = activeBatches.reduce((acc, b) => acc + b.quantity, 0);

  const healthyCount = activeBatches.filter(b => getBatchExpiryStatus(b.expiryDate).status === 'HEALTHY').length;
  const expiringSoonCount = activeBatches.filter(b => getBatchExpiryStatus(b.expiryDate).status === 'EXPIRING_SOON').length;
  const expiredCount = activeBatches.filter(b => getBatchExpiryStatus(b.expiryDate).status === 'EXPIRED').length;

  const lowStockCount = products.filter(p => {
    const pBatches = activeBatches.filter(bt => bt.productId === p.id);
    const sum = pBatches.reduce((a, bt) => a + bt.quantity, 0);
    return sum <= (p.reorderLevel || 15);
  }).length;

  // Filter products
  const filteredProducts = products.filter(product => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      product.brandName.toLowerCase().includes(q) ||
      product.genericName.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q);

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
    <div className="space-y-6 text-slate-900 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100/60 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center space-x-3">
          <div className="bg-[#4E60FF] p-3 rounded-xl text-white shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Multi-Branch Inventory Ledger</h1>
            <p className="text-xs text-slate-500 font-medium">Track stock levels, FEFO expiry batches, and location shelves across branches</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/inventory/import"
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#4E60FF]" />
            <span>Bulk Import CSV</span>
          </Link>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Inter-Branch Transfer</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Metric Cards Row (Circular Icon Design Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stock Packs - Blue Circle */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center space-x-4">
          <div className="bg-[#4E60FF] text-white p-3.5 rounded-full flex-shrink-0 shadow-sm">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Stock Quantity</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{totalStockPacks.toLocaleString()} <span className="text-xs font-normal">packs</span></p>
            <span className="text-slate-500 text-xs font-medium">{products.length} catalog items</span>
          </div>
        </div>

        {/* Healthy FEFO Batches - Emerald Circle */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center space-x-4">
          <div className="bg-[#10B981] text-white p-3.5 rounded-full flex-shrink-0 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Healthy Stock (&gt;90 Days)</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{healthyCount} <span className="text-xs font-normal">batches</span></p>
            <span className="text-[#10B981] text-xs font-semibold">Safe Shelf Life</span>
          </div>
        </div>

        {/* Expiring Soon - Amber Circle */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center space-x-4">
          <div className="bg-[#F59E0B] text-white p-3.5 rounded-full flex-shrink-0 shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Expiring Soon (&le;90 Days)</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{expiringSoonCount} <span className="text-xs font-normal">batches</span></p>
            <span className="text-[#F59E0B] text-xs font-semibold">Prioritize FEFO Dispensing</span>
          </div>
        </div>

        {/* Low / Out of Stock - Rose Circle */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center space-x-4">
          <div className="bg-[#EF4444] text-white p-3.5 rounded-full flex-shrink-0 shadow-sm">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Low / Reorder Alert</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{lowStockCount} <span className="text-xs font-normal">medicines</span></p>
            <span className="text-[#EF4444] text-xs font-semibold">Requires Restock Intake</span>
          </div>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-100/60 p-5 rounded-2xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Branch Switcher Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-500 mr-1 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-[#4E60FF]" /> Branch:
            </span>

            <button
              onClick={() => setSelectedBranchFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                selectedBranchFilter === 'ALL'
                  ? 'bg-[#4E60FF] text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All 3 Branches
            </button>

            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBranchFilter(b.id as BranchId)}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  selectedBranchFilter === b.id
                    ? 'bg-[#4E60FF] text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {b.name}
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
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
            />
          </div>

        </div>

        {/* Expiry Health Tabs */}
        <div className="flex items-center space-x-2 pt-3 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500 mr-1">Expiry Health:</span>

          <button
            onClick={() => setSelectedExpiryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              selectedExpiryFilter === 'ALL' ? 'bg-[#4E60FF]/10 text-[#4E60FF] font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Statuses
          </button>

          <button
            onClick={() => setSelectedExpiryFilter('HEALTHY')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 cursor-pointer ${
              selectedExpiryFilter === 'HEALTHY' ? 'bg-[#10B981]/10 text-[#10B981] font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Healthy (&gt;90d)</span>
          </button>

          <button
            onClick={() => setSelectedExpiryFilter('EXPIRING_SOON')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 cursor-pointer ${
              selectedExpiryFilter === 'EXPIRING_SOON' ? 'bg-[#F59E0B]/10 text-[#F59E0B] font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Expiring Soon (&le;90d)</span>
          </button>

          <button
            onClick={() => setSelectedExpiryFilter('EXPIRED')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 cursor-pointer ${
              selectedExpiryFilter === 'EXPIRED' ? 'bg-[#EF4444]/10 text-[#EF4444] font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Expired</span>
          </button>
        </div>
      </div>

      {/* Interactive Medical Data Table Container */}
      <div className="bg-white border border-slate-100/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        
        {/* Header Title with "See All >" link */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-[#4E60FF]" />
            <h3 className="font-bold text-base text-slate-900">Active Medicine Stock Inventory</h3>
          </div>
          <span className="text-[#4E60FF] text-xs font-semibold hover:underline cursor-pointer">See All &gt;</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="text-slate-400 font-medium uppercase tracking-wider py-3 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4"></th>
                <th className="py-3 px-3">Medicine & Dosage</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">Total Stock</th>
                <th className="py-3 px-3 text-right">Unit Cost (GH₵)</th>
                <th className="py-3 px-3 text-right">Unit Sell (GH₵)</th>
                <th className="py-3 px-3 text-right">Margin %</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
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
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50 font-semibold' : ''}`}
                      >
                        <td className="py-3.5 px-4 text-slate-400">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-[#4E60FF]" /> : <ChevronRight className="w-4 h-4" />}
                        </td>

                        <td className="py-3.5 px-3">
                          <p className="font-bold text-slate-900 text-sm">{product.brandName}</p>
                          <p className="text-[11px] text-slate-400">{product.genericName} • {product.strength} ({product.dosageForm})</p>
                        </td>

                        <td className="py-3.5 px-3 font-medium text-slate-700">
                          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px]">
                            {product.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-xs tabular-nums ${
                            totalUnits === 0
                              ? 'bg-[#EF4444]/10 text-[#EF4444]'
                              : totalUnits <= 15
                              ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                              : 'bg-[#10B981]/10 text-[#10B981]'
                          }`}>
                            {totalUnits} packs
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-500">
                          GH₵ {product.costPrice.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                          GH₵ {product.retailPrice.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold text-[#10B981] tabular-nums">
                          {marginPercent.toFixed(1)}%
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(product.id);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                          >
                            {isExpanded ? 'Hide Batches' : `View Batches (${productBatches.length})`}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Batches Sub-Table Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={8} className="p-4">
                            <div className="bg-white border border-slate-100/60 rounded-xl p-4 space-y-2">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                                <h4 className="font-bold text-xs text-slate-900 flex items-center">
                                  <Layers className="w-4 h-4 text-[#4E60FF] mr-1.5" />
                                  Active FEFO Batches for {product.brandName}
                                </h4>
                                <span className="text-[11px] text-slate-400">{productBatches.length} batch(es) listed</span>
                              </div>

                              <div className="space-y-2">
                                {productBatches.length === 0 ? (
                                  <p className="text-xs text-slate-400 py-2">No active batches recorded for this medicine in active selection.</p>
                                ) : (
                                  productBatches.map(b => {
                                    const expInfo = getBatchExpiryStatus(b.expiryDate);
                                    const branchName = branches.find(br => br.id === b.branchId)?.name || b.branchId;

                                    return (
                                      <div
                                        key={b.id}
                                        className="p-3 bg-slate-50 border border-slate-100/60 rounded-xl flex items-center justify-between text-xs"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <span className="font-mono font-bold text-[#4E60FF] bg-[#4E60FF]/10 px-2 py-0.5 rounded">
                                            {b.batchNumber}
                                          </span>
                                          <span className="font-semibold text-slate-700">{branchName}</span>
                                          <span className="text-[11px] text-slate-400 flex items-center">
                                            <MapPin className="w-3 h-3 text-slate-400 mr-0.5" />
                                            {b.locationShelf || 'Main Shelf'}
                                          </span>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                          <span className="text-slate-500 font-medium">Qty: <b className="text-slate-900 font-mono">{b.quantity}</b></span>
                                          <span className="text-slate-500 font-mono">Exp: {b.expiryDate}</span>

                                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            expInfo.status === 'EXPIRED'
                                              ? 'bg-[#EF4444]/10 text-[#EF4444]'
                                              : expInfo.status === 'EXPIRING_SOON'
                                              ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                                              : 'bg-[#10B981]/10 text-[#10B981]'
                                          }`}>
                                            {expInfo.label}
                                          </span>

                                          <button
                                            onClick={() => handleOpenAdjustModal(product, b)}
                                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium text-[11px] flex items-center space-x-1 cursor-pointer"
                                          >
                                            <SlidersHorizontal className="w-3 h-3 text-[#F59E0B]" />
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
