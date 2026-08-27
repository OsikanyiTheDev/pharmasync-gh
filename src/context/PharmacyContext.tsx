'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Branch,
  BranchId,
  Product,
  Batch,
  CartItem,
  Sale,
  PaymentDetails,
  InterBranchTransfer,
  StockAdjustment,
  AdjustmentReason,
  HeldBill,
} from '../lib/types';
import {
  INITIAL_BRANCHES,
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_TRANSFERS,
  INITIAL_SALES,
} from '../lib/seed-data';
import { getFEFOSortedBatches, autoSelectFEFOBatch } from '../lib/fefo';
import { StorageEngine } from '../lib/db';

interface PharmacyContextType {
  // Branches
  branches: Branch[];
  activeBranchId: BranchId;
  setActiveBranchId: (id: BranchId) => void;
  activeBranch: Branch;

  // Inventory & Products
  products: Product[];
  batches: Batch[];
  
  // POS Cart State
  cart: CartItem[];
  addToCart: (product: Product, overrideBatch?: Batch, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQty: (productId: string, qty: number) => void;
  updateCartItemBatch: (productId: string, batchId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  setCartDiscount: (discount: number) => void;

  // Customer / Patient Metadata for Cart
  patientDetails: { name: string; phone: string; doctor: string; rxNumber: string };
  setPatientDetails: React.Dispatch<React.SetStateAction<{ name: string; phone: string; doctor: string; rxNumber: string }>>;

  // Held Bills System
  heldBills: HeldBill[];
  holdCurrentBill: (label?: string) => void;
  recallHeldBill: (heldBillId: string) => void;
  deleteHeldBill: (heldBillId: string) => void;

  // Transactions & Sales
  sales: Sale[];
  lastCompletedSale: Sale | null;
  processCheckout: (payment: PaymentDetails) => Sale | null;

  // Inter-branch transfers
  transfers: InterBranchTransfer[];
  createTransfer: (sourceBranch: BranchId, destBranch: BranchId, items: { productId: string; batchId: string; quantity: number }[], notes?: string) => InterBranchTransfer;
  dispatchTransfer: (transferId: string) => void;
  receiveTransfer: (transferId: string) => void;

  // Stock Adjustments
  adjustments: StockAdjustment[];
  adjustBatchQuantity: (productId: string, batchId: string, branchId: BranchId, deltaQty: number, reason: AdjustmentReason, notes?: string) => void;

  // Market Restock Intakes
  recordMarketIntake: (productId: string, targetBranch: BranchId, batchNumber: string, quantity: number, mfgDate: string, expiryDate: string, costPrice: number) => void;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeBranchId, setActiveBranchId] = useState<BranchId>('ACCRA_MAIN');

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [patientDetails, setPatientDetails] = useState({ name: '', phone: '', doctor: '', rxNumber: '' });

  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(INITIAL_SALES[0] || null);

  const [transfers, setTransfers] = useState<InterBranchTransfer[]>(INITIAL_TRANSFERS);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

  // Load from local persistence on mount
  useEffect(() => {
    const loadedSales = StorageEngine.getSales();
    if (loadedSales && loadedSales.length > 0) setSales(loadedSales);

    const loadedBatches = StorageEngine.getBatches();
    if (loadedBatches && loadedBatches.length > 0) setBatches(loadedBatches);

    const loadedTransfers = StorageEngine.getTransfers();
    if (loadedTransfers && loadedTransfers.length > 0) setTransfers(loadedTransfers);

    const loadedHeld = StorageEngine.getHeldBills();
    if (loadedHeld && loadedHeld.length > 0) setHeldBills(loadedHeld);
  }, []);

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0];

  // Cart operations
  const addToCart = (product: Product, overrideBatch?: Batch, qty: number = 1) => {
    let targetBatch = overrideBatch;
    if (!targetBatch) {
      const selected = autoSelectFEFOBatch(batches, product.id, activeBranchId);
      if (!selected) {
        alert(`No available active stock batch for ${product.brandName} at ${activeBranch.name}`);
        return;
      }
      targetBatch = selected;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.selectedBatch.id === targetBatch!.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        const lineTotal = newQty * product.retailPrice;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          lineTotal,
        };
        return updated;
      }

      const lineTotal = qty * product.retailPrice;
      return [
        ...prev,
        {
          product,
          selectedBatch: targetBatch!,
          quantity: qty,
          unitPrice: product.retailPrice,
          discount: 0,
          lineTotal,
          isManualBatchOverride: !!overrideBatch,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartItemQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const lineTotal = qty * item.unitPrice;
          return { ...item, quantity: qty, lineTotal };
        }
        return item;
      })
    );
  };

  const updateCartItemBatch = (productId: string, batchId: string) => {
    const targetBatch = batches.find(b => b.id === batchId);
    if (!targetBatch) return;

    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          return {
            ...item,
            selectedBatch: targetBatch,
            isManualBatchOverride: true,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscount(0);
    setPatientDetails({ name: '', phone: '', doctor: '', rxNumber: '' });
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.lineTotal, 0);
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Hold & Recall Bills
  const holdCurrentBill = (label?: string) => {
    if (cart.length === 0) return;

    const newHeldBill: HeldBill = {
      id: `HELD-${Date.now()}`,
      billNumber: `HOLD-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      branchId: activeBranchId,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      total: cartTotal,
      patientName: patientDetails.name || label || 'Walk-in Client',
      patientPhone: patientDetails.phone,
      prescribingDoctor: patientDetails.doctor,
    };

    const updated = [newHeldBill, ...heldBills];
    setHeldBills(updated);
    StorageEngine.saveHeldBills(updated);
    clearCart();
  };

  const recallHeldBill = (heldBillId: string) => {
    const held = heldBills.find(h => h.id === heldBillId);
    if (!held) return;

    setCart(held.items);
    setCartDiscount(held.discount);
    setPatientDetails({
      name: held.patientName || '',
      phone: held.patientPhone || '',
      doctor: held.prescribingDoctor || '',
      rxNumber: '',
    });

    deleteHeldBill(heldBillId);
  };

  const deleteHeldBill = (heldBillId: string) => {
    const updated = heldBills.filter(h => h.id !== heldBillId);
    setHeldBills(updated);
    StorageEngine.saveHeldBills(updated);
  };

  // Process Sale Checkout
  const processCheckout = (payment: PaymentDetails): Sale | null => {
    if (cart.length === 0) return null;

    // 1. Verify stock availability
    for (const item of cart) {
      const b = batches.find(batch => batch.id === item.selectedBatch.id);
      if (!b || b.quantity < item.quantity) {
        alert(`Insufficient stock in Batch ${item.selectedBatch.batchNumber} for ${item.product.brandName}`);
        return null;
      }
    }

    // 2. Deduct quantities from batches
    const updatedBatches = batches.map(batch => {
      const cartItem = cart.find(ci => ci.selectedBatch.id === batch.id);
      if (cartItem) {
        return {
          ...batch,
          quantity: Math.max(0, batch.quantity - cartItem.quantity),
        };
      }
      return batch;
    });

    setBatches(updatedBatches);
    StorageEngine.saveBatches(updatedBatches);

    // 3. Create Sale record
    const receiptNumber = `INV-GH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSale: Sale = {
      id: `SALE-${Date.now()}`,
      receiptNumber,
      branchId: activeBranchId,
      timestamp: new Date().toISOString(),
      items: cart,
      subtotal: cartSubtotal,
      discount: cartDiscount,
      tax: 0,
      total: cartTotal,
      payment: {
        ...payment,
        customerName: payment.customerName || patientDetails.name,
        customerPhone: payment.customerPhone || patientDetails.phone,
        prescribingDoctor: payment.prescribingDoctor || patientDetails.doctor,
        rxNumber: payment.rxNumber || patientDetails.rxNumber,
      },
      attendantName: activeBranch.manager,
      synced: true,
    };

    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    setLastCompletedSale(newSale);
    StorageEngine.saveSales(updatedSales);

    // Queue for sync
    StorageEngine.addToSyncQueue({
      action: 'CREATE_SALE',
      payload: newSale,
    });

    clearCart();
    return newSale;
  };

  // Inter-branch transfers
  const createTransfer = (
    sourceBranch: BranchId,
    destBranch: BranchId,
    itemsToTransfer: { productId: string; batchId: string; quantity: number }[],
    notes?: string
  ): InterBranchTransfer => {
    const transferNo = `TRF-GH-${Math.floor(1000 + Math.random() * 9000)}`;

    const transferItems = itemsToTransfer.map(item => {
      const p = products.find(prod => prod.id === item.productId)!;
      const b = batches.find(btch => btch.id === item.batchId)!;
      return {
        productId: item.productId,
        productName: p.brandName,
        batchId: item.batchId,
        batchNumber: b.batchNumber,
        quantity: item.quantity,
        expiryDate: b.expiryDate,
      };
    });

    const newTransfer: InterBranchTransfer = {
      id: `TRF-${Date.now()}`,
      transferNo,
      sourceBranchId: sourceBranch,
      destinationBranchId: destBranch,
      items: transferItems,
      status: 'PENDING',
      notes,
      requestedBy: activeBranch.manager,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTransfer, ...transfers];
    setTransfers(updated);
    StorageEngine.saveTransfers(updated);
    return newTransfer;
  };

  const dispatchTransfer = (transferId: string) => {
    const trf = transfers.find(t => t.id === transferId);
    if (!trf) return;

    // Deduct stock from source branch
    const updatedBatches = batches.map(batch => {
      const item = trf.items.find(i => i.batchId === batch.id);
      if (item) {
        return {
          ...batch,
          quantity: Math.max(0, batch.quantity - item.quantity),
        };
      }
      return batch;
    });

    setBatches(updatedBatches);
    StorageEngine.saveBatches(updatedBatches);

    const updatedTransfers = transfers.map(t =>
      t.id === transferId ? { ...t, status: 'DISPATCHED' as const, dispatchedAt: new Date().toISOString() } : t
    );
    setTransfers(updatedTransfers);
    StorageEngine.saveTransfers(updatedTransfers);
  };

  const receiveTransfer = (transferId: string) => {
    const trf = transfers.find(t => t.id === transferId);
    if (!trf) return;

    // Add stock to destination branch
    const updatedBatches = [...batches];
    trf.items.forEach(item => {
      const sourceBatch = batches.find(b => b.id === item.batchId);
      if (sourceBatch) {
        // Create new batch at destination branch
        const newDestBatch: Batch = {
          id: `BATCH-${item.productId}-${trf.destinationBranchId}-${Date.now()}`,
          productId: item.productId,
          branchId: trf.destinationBranchId,
          batchNumber: sourceBatch.batchNumber,
          quantity: item.quantity,
          expiryDate: sourceBatch.expiryDate,
          mfgDate: sourceBatch.mfgDate,
          supplier: `Transfer from ${trf.sourceBranchId}`,
          locationShelf: 'Transferred Stock Storage',
        };
        updatedBatches.push(newDestBatch);
      }
    });

    setBatches(updatedBatches);
    StorageEngine.saveBatches(updatedBatches);

    const updatedTransfers = transfers.map(t =>
      t.id === transferId ? { ...t, status: 'RECEIVED' as const, receivedAt: new Date().toISOString() } : t
    );
    setTransfers(updatedTransfers);
    StorageEngine.saveTransfers(updatedTransfers);
  };

  // Stock adjustment
  const adjustBatchQuantity = (
    productId: string,
    batchId: string,
    branchId: BranchId,
    deltaQty: number,
    reason: AdjustmentReason,
    notes?: string
  ) => {
    const p = products.find(prod => prod.id === productId);
    const b = batches.find(btch => btch.id === batchId);
    if (!p || !b) return;

    const updatedBatches = batches.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          quantity: Math.max(0, batch.quantity + deltaQty),
        };
      }
      return batch;
    });

    setBatches(updatedBatches);
    StorageEngine.saveBatches(updatedBatches);

    const adj: StockAdjustment = {
      id: `ADJ-${Date.now()}`,
      productId,
      productName: p.brandName,
      batchId,
      batchNumber: b.batchNumber,
      branchId,
      quantityDelta: deltaQty,
      reason,
      notes,
      performedBy: activeBranch.manager,
      timestamp: new Date().toISOString(),
    };

    setAdjustments(prev => [adj, ...prev]);
  };

  // Market Intake
  const recordMarketIntake = (
    productId: string,
    targetBranch: BranchId,
    batchNumber: string,
    quantity: number,
    mfgDate: string,
    expiryDate: string,
    costPrice: number
  ) => {
    const newBatch: Batch = {
      id: `BATCH-${productId}-${targetBranch}-${Date.now()}`,
      productId,
      branchId: targetBranch,
      batchNumber,
      quantity,
      expiryDate,
      mfgDate,
      supplier: 'Wholesale Drug Market Intake',
      locationShelf: 'Main Restock Bay',
    };

    const updatedBatches = [newBatch, ...batches];
    setBatches(updatedBatches);
    StorageEngine.saveBatches(updatedBatches);
  };

  return (
    <PharmacyContext.Provider
      value={{
        branches,
        activeBranchId,
        setActiveBranchId,
        activeBranch,
        products,
        batches,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        updateCartItemBatch,
        clearCart,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        setCartDiscount,
        patientDetails,
        setPatientDetails,
        heldBills,
        holdCurrentBill,
        recallHeldBill,
        deleteHeldBill,
        sales,
        lastCompletedSale,
        processCheckout,
        transfers,
        createTransfer,
        dispatchTransfer,
        receiveTransfer,
        adjustments,
        adjustBatchQuantity,
        recordMarketIntake,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
