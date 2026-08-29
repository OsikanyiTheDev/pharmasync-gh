'use client';

import React, { useState, useMemo } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { PaymentModal } from '../components/pos/PaymentModal';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { RecentSalesDrawer } from '../components/pos/RecentSalesDrawer';
import { PaymentMethod, Sale, Product } from '../lib/types';
import { autoSelectFEFOBatch, getBatchExpiryStatus } from '../lib/fefo';
import { useToast } from '../context/ToastContext';
import { 
  Users, 
  DollarSign, 
  Percent, 
  AlertCircle, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote,
  ShoppingCart,
  CheckCircle2,
  ChevronRight,
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function POSPage() {
  const { 
    products, 
    batches, 
    activeBranchId, 
    cart, 
    addToCart, 
    updateCartItemQty, 
    removeFromCart, 
    clearCart,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    setCartDiscount,
    sales,
    lastCompletedSale 
  } = usePharmacy();

  const { showToast } = useToast();

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Payment Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDefaultMethod, setPaymentDefaultMethod] = useState<PaymentMethod>('CASH');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null);

  // Compute Live Metrics
  const activeSales = sales.filter(s => s.branchId === activeBranchId);
  const totalRevenue = activeSales.reduce((sum, s) => sum + s.total, 0);

  // Live unique customer count (fallback to unique receipt count if no name provided)
  const uniqueCustomersCount = new Set(
    sales.map(s => s.customerPhone || s.customerName || s.payment?.customerPhone || s.payment?.customerName).filter(Boolean)
  ).size || (sales.length > 0 ? sales.length : 0);

  // Estimate Profit
  const totalCost = activeSales.reduce((sum, s) => {
    return sum + (s.items || []).reduce((iSum, item) => {
      const catalogProd = products.find(p => p.id === item.product?.id);
      const cPrice = item.product?.costPrice ?? catalogProd?.costPrice ?? 0;
      return iSum + cPrice * (item.quantity || 0);
    }, 0);
  }, 0);

  const grossProfit = Math.max(0, totalRevenue - totalCost);

  // Low stock count
  const lowStockCount = products.filter(p => {
    const pBatches = batches.filter(b => b.productId === p.id && b.branchId === activeBranchId);
    const sum = pBatches.reduce((a, b) => a + b.quantity, 0);
    return sum <= (p.reorderLevel || 15);
  }).length;

  // Filtered Products
  const categories = ['ALL', 'Anti-Malarial', 'Antibiotic', 'Pain/Analgesics', 'Cardiovascular', 'Syrups'];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        product.brandName.toLowerCase().includes(q) ||
        product.genericName.toLowerCase().includes(q) ||
        product.dosageForm.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddProduct = (product: Product) => {
    const fefoBatch = autoSelectFEFOBatch(batches, product.id, activeBranchId);
    if (!fefoBatch || fefoBatch.quantity <= 0) {
      showToast(`Stock error for ${product.brandName}`, 'error', 'No active batch available');
      return;
    }
    addToCart(product, fefoBatch, 1);
    showToast(`Added ${product.brandName} to bill`, 'success', `FEFO Batch: ${fefoBatch.batchNumber}`);
  };

  const handleOpenPayment = (method: PaymentMethod) => {
    if (cart.length === 0) return;
    setPaymentDefaultMethod(method);
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
    <div className="space-y-6 text-slate-900 pb-20 md:pb-6">
      
      {/* 1. Top Dashboard Row (4 Metric Stat Cards with Circular Badges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Blue circle - Total Customers */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-[#4E60FF] text-white p-3.5 rounded-full shadow-sm flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{uniqueCustomersCount}</p>
              <Link href="/analytics" className="text-[#4E60FF] text-xs font-semibold hover:underline flex items-center mt-0.5">
                Show Details &gt;
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Green circle - Total Sales */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-[#10B981] text-white p-3.5 rounded-full shadow-sm flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Sales in GH₵</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">GH₵ {totalRevenue.toFixed(2)}</p>
              <Link href="/analytics" className="text-[#10B981] text-xs font-semibold hover:underline flex items-center mt-0.5">
                Show Details &gt;
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Amber circle - Gross Profit */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-[#F59E0B] text-white p-3.5 rounded-full shadow-sm flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Gross Profit</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">GH₵ {grossProfit.toFixed(2)}</p>
              <Link href="/analytics" className="text-[#F59E0B] text-xs font-semibold hover:underline flex items-center mt-0.5">
                Show Details &gt;
              </Link>
            </div>
          </div>
        </div>

        {/* Card 4: Red circle - Low / Out of Stock */}
        <div className="p-5 bg-white border border-slate-100/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-[#EF4444] text-white p-3.5 rounded-full shadow-sm flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Low / Out of Stock</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{lowStockCount} items</p>
              <Link href="/inventory" className="text-[#EF4444] text-xs font-semibold hover:underline flex items-center mt-0.5">
                Show Details &gt;
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Main Panel Grid: 70% Left (Medicine Catalog) + 30% Right (Dispensing Slip) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (70% - 8 cols on lg screen) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 space-y-5">
            
            {/* Table Header & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Medicine Catalog</h2>
                <p className="text-xs text-slate-500">Search and click medicines to add to dispensing slip</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search medicine brand or generic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#4E60FF] text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Medicines' : cat}
                </button>
              ))}
            </div>

            {/* Clean Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Medicine Name</th>
                    <th className="py-3 px-3">Dosage Form</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3">Batch Expiry</th>
                    <th className="py-3 px-3 text-right">Price (GH₵)</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        No medicines match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => {
                      const branchBatches = batches.filter(b => b.productId === product.id && b.branchId === activeBranchId && b.quantity > 0);
                      const totalStock = branchBatches.reduce((a, b) => a + b.quantity, 0);
                      const fefoBatch = autoSelectFEFOBatch(batches, product.id, activeBranchId);
                      const expInfo = fefoBatch ? getBatchExpiryStatus(fefoBatch.expiryDate) : null;

                      return (
                        <tr 
                          key={product.id}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                          onClick={() => handleAddProduct(product)}
                        >
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{product.brandName}</p>
                            <p className="text-[10px] text-slate-400">{product.genericName} ({product.strength})</p>
                          </td>

                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {product.dosageForm}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              totalStock === 0
                                ? 'bg-red-100 text-red-700'
                                : totalStock <= 15
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {totalStock === 0 ? 'Out of Stock' : `${totalStock} In Stock`}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                            {fefoBatch ? (
                              <span className={expInfo?.status === 'EXPIRING_SOON' ? 'text-amber-600 font-bold' : ''}>
                                {fefoBatch.expiryDate}
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                            GH₵ {product.retailPrice.toFixed(2)}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddProduct(product);
                              }}
                              className="px-3 py-1.5 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center space-x-1 mx-auto cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Column (30% - 4 cols on lg screen - Dispensing Slip) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex flex-col justify-between space-y-4 min-h-[500px]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-[#4E60FF]" />
                <h3 className="font-bold text-base text-slate-900">Dispensing Slip</h3>
              </div>
              
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Line Items */}
            <div className="flex-1 overflow-y-auto max-h-[320px] space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Package className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Dispensing slip is empty</p>
                  <p className="text-[10px] text-slate-400">Click medicines from catalog to add</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-slate-50 border border-slate-100/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{item.product.brandName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        GH₵ {item.unitPrice.toFixed(2)} x {item.quantity} = <b className="text-slate-900">GH₵ {item.lineTotal.toFixed(2)}</b>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)}
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 font-bold font-mono text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals & Checkout Button */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5 text-xs border border-slate-100/80">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold tabular-nums text-slate-900">GH₵ {cartSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Discount (GH₵):</span>
                  <input
                    type="number"
                    min="0"
                    value={cartDiscount || ''}
                    onChange={(e) => setCartDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-20 p-1 bg-white border border-slate-200 rounded text-right text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="flex justify-between items-center text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>NET TOTAL DUE:</span>
                  <span className="text-xl text-[#4E60FF] tabular-nums font-bold">GH₵ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={cart.length === 0}
                  onClick={() => handleOpenPayment('CASH')}
                  className="flex items-center justify-center space-x-1.5 py-3 bg-[#10B981] hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Cash Pay</span>
                </button>

                <button
                  disabled={cart.length === 0}
                  onClick={() => handleOpenPayment('MOMO_MTN')}
                  className="flex items-center justify-center space-x-1.5 py-3 bg-[#4E60FF] hover:bg-[#3D4FE6] disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>MoMo Pay</span>
                </button>
              </div>

            </div>

          </div>

          {/* Recent Receipts Drawer */}
          <RecentSalesDrawer onSelectSale={handleSelectRecentSale} />
        </div>

      </div>

      {/* Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        defaultMethod={paymentDefaultMethod}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccessSale={handlePaymentSuccess}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        sale={selectedReceiptSale || lastCompletedSale}
        onClose={() => setIsReceiptModalOpen(false)}
      />

    </div>
  );
}
