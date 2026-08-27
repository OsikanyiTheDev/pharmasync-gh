'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Clock, CheckCircle2, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Product, MedicineCategory, DosageForm } from '../../lib/types';
import { autoSelectFEFOBatch, getBatchExpiryStatus } from '../../lib/fefo';
import { useToast } from '../../context/ToastContext';

export const ProductSearch: React.FC = () => {
  const { products, batches, activeBranchId, addToCart } = usePharmacy();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MedicineCategory | 'ALL'>('ALL');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global hotkey listener for "/" or F2 focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || e.key === 'F2') && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories: (MedicineCategory | 'ALL')[] = [
    'ALL',
    'Anti-Malarial',
    'Antibiotic',
    'Analgesics & Pain',
    'Cardiovascular & Chronic',
    'Syrups & Rehydration',
    'OTC & General Wellness',
  ];

  // Filter products by category and search query
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      q === '' ||
      p.brandName.toLowerCase().includes(q) ||
      p.genericName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.dosageForm.toLowerCase().includes(q);

    return matchesCategory && matchesQuery;
  });

  const handleAddProduct = (product: Product) => {
    const fefoBatch = autoSelectFEFOBatch(batches, product.id, activeBranchId);
    if (!fefoBatch) {
      showToast(`No stock available for ${product.brandName}`, 'error');
      return;
    }
    addToCart(product, fefoBatch, 1);
    showToast(`Added ${product.brandName} to bill`, 'success', `FEFO Batch: ${fefoBatch.batchNumber}`);
  };

  return (
    <div className="bg-white dark:bg-[#222327] rounded-2xl border border-slate-100/60 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-lg p-5 text-slate-900 dark:text-white flex flex-col space-y-4">
      
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search drug brand, generic name, or dosage form... (Press / or F2)"
          className="block w-full pl-11 pr-24 py-3 bg-slate-50 dark:bg-[#161719] border border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4E60FF] focus:border-transparent transition-all"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-200 text-slate-700 rounded border border-slate-300">
            Press /
          </kbd>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#4E60FF] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {cat === 'ALL' ? 'All Medicines' : cat}
          </button>
        ))}
      </div>

      {/* High-Density Medicine Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold">No medicines found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-500 mt-1">Try searching by generic name or changing category filter</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            // Find active branch stock and FEFO batch
            const branchBatches = batches.filter(b => b.productId === product.id && b.branchId === activeBranchId && b.quantity > 0);
            const totalStock = branchBatches.reduce((acc, b) => acc + b.quantity, 0);
            const fefoBatch = autoSelectFEFOBatch(batches, product.id, activeBranchId);
            const expiryStatus = fefoBatch ? getBatchExpiryStatus(fefoBatch.expiryDate) : null;

            return (
              <div
                key={product.id}
                onClick={() => handleAddProduct(product)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group hover:border-teal-500 hover:shadow-md ${
                  totalStock === 0
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:bg-teal-50/40'
                }`}
              >
                <div>
                  {/* Top line: Dosage Badge & Stock Tag */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {product.dosageForm} • {product.strength}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                      totalStock === 0
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : totalStock <= 10
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {totalStock > 0 ? `${totalStock} in stock` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Product Title & Generic Subtitle */}
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-teal-800 transition-colors">
                    {product.brandName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{product.genericName}</p>
                </div>

                {/* Bottom line: FEFO Batch Expiry & Price */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {fefoBatch ? (
                      <span className={`text-[10px] font-medium flex items-center space-x-1 ${
                        expiryStatus?.status === 'EXPIRED'
                          ? 'text-red-600'
                          : expiryStatus?.status === 'EXPIRING_SOON'
                          ? 'text-amber-600 font-bold'
                          : 'text-slate-500'
                      }`}>
                        <Clock className="w-3 h-3 text-slate-400 mr-0.5" />
                        <span>FEFO: {fefoBatch.batchNumber} (Exp: {fefoBatch.expiryDate})</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-500 font-semibold">No active batch</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-teal-800 tabular-nums">
                      GH₵ {product.retailPrice.toFixed(2)}
                    </span>
                    
                    <button
                      disabled={totalStock === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddProduct(product);
                      }}
                      className="p-1.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white rounded-lg transition-all shadow-sm group-hover:scale-105"
                      title="Add to Bill"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
