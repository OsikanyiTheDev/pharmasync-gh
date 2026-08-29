'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  UserProfile,
  UserRole,
} from '../lib/types';
import {
  INITIAL_BRANCHES,
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_TRANSFERS,
  INITIAL_USER_PROFILES,
} from '../lib/seed-data';
import { autoSelectFEFOBatch } from '../lib/fefo';
import { StorageEngine } from '../lib/db';
import { supabase } from '../lib/supabase';

const BRANCH_CODE_TO_UUID: Record<string, string> = {
  ACCRA_MAIN: 'a1b2c3d4-0001-4000-8000-000000000001',
  OSU_BRANCH: 'a1b2c3d4-0002-4000-8000-000000000002',
  SPINTEX_BRANCH: 'a1b2c3d4-0003-4000-8000-000000000003',
};

const UUID_TO_BRANCH_CODE: Record<string, BranchId> = {
  'a1b2c3d4-0001-4000-8000-000000000001': 'ACCRA_MAIN',
  'a1b2c3d4-0002-4000-8000-000000000002': 'OSU_BRANCH',
  'a1b2c3d4-0003-4000-8000-000000000003': 'SPINTEX_BRANCH',
};

interface PharmacyContextType {
  // Auth & Counter User Management
  userProfiles: UserProfile[];
  activeUser: UserProfile;
  isLocked: boolean;
  lockStation: () => void;
  unlockStation: (pin: string, userId?: string) => boolean;
  switchUserByProfileId: (id: string) => void;
  addUserProfile: (profile: Omit<UserProfile, 'id'>) => Promise<UserProfile>;
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  verifyManagerPin: (pin: string) => boolean;

  // Loading State
  isLoading: boolean;

  // Branches
  branches: Branch[];
  activeBranchId: BranchId;
  setActiveBranchId: (id: BranchId) => void;
  activeBranch: Branch;

  // Inventory & Products
  products: Product[];
  batches: Batch[];
  refreshLiveData: () => Promise<void>;
  
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
  processCheckout: (payment: PaymentDetails) => Promise<Sale | null>;

  // Inter-branch transfers
  transfers: InterBranchTransfer[];
  createTransfer: (sourceBranch: BranchId, destBranch: BranchId, items: { productId: string; batchId: string; quantity: number }[], notes?: string) => Promise<InterBranchTransfer>;
  dispatchTransfer: (transferId: string) => Promise<void>;
  receiveTransfer: (transferId: string) => Promise<void>;

  // Stock Adjustments
  adjustments: StockAdjustment[];
  adjustBatchQuantity: (productId: string, batchId: string, branchId: BranchId, deltaQty: number, reason: AdjustmentReason, notes?: string) => Promise<void>;

  // Market Restock Intakes
  recordMarketIntake: (productId: string, targetBranch: BranchId, batchNumber: string, quantity: number, mfgDate: string, expiryDate: string, costPrice: number) => Promise<void>;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeBranchId, setActiveBranchId] = useState<BranchId>('ACCRA_MAIN');

  // User Profiles & Auth PIN Lock State
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(INITIAL_USER_PROFILES);
  const [activeUser, setActiveUser] = useState<UserProfile>(INITIAL_USER_PROFILES[0]);
  const [isLocked, setIsLocked] = useState<boolean>(true);

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [patientDetails, setPatientDetails] = useState({ name: '', phone: '', doctor: '', rxNumber: '' });

  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  const [transfers, setTransfers] = useState<InterBranchTransfer[]>(INITIAL_TRANSFERS);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

  // Auth & Counter User helper functions
  const lockStation = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockStation = useCallback((pin: string, userId?: string): boolean => {
    const target = userId ? userProfiles.find(u => u.id === userId) : activeUser;
    if (target && target.pinCode === pin && target.isActive) {
      setActiveUser(target);
      if (target.branchId) {
        setActiveBranchId(target.branchId);
      }
      setIsLocked(false);
      return true;
    }
    const matched = userProfiles.find(u => u.pinCode === pin && u.isActive);
    if (matched) {
      setActiveUser(matched);
      if (matched.branchId) {
        setActiveBranchId(matched.branchId);
      }
      setIsLocked(false);
      return true;
    }
    return false;
  }, [userProfiles, activeUser]);

  const switchUserByProfileId = useCallback((id: string) => {
    const found = userProfiles.find(u => u.id === id);
    if (found) {
      setActiveUser(found);
      if (found.branchId) {
        setActiveBranchId(found.branchId);
      }
    }
  }, [userProfiles]);

  const verifyManagerPin = useCallback((pin: string): boolean => {
    return userProfiles.some(
      u => u.isActive && (u.role === 'OWNER' || u.role === 'BRANCH_MANAGER') && u.pinCode === pin
    );
  }, [userProfiles]);

  const addUserProfile = async (profileData: Omit<UserProfile, 'id'>): Promise<UserProfile> => {
    const branchUuid = BRANCH_CODE_TO_UUID[profileData.branchId] || BRANCH_CODE_TO_UUID.ACCRA_MAIN;
    const { data } = await supabase
      .from('user_profiles')
      .insert({
        full_name: profileData.fullName,
        email: profileData.email,
        pin_code: profileData.pinCode,
        role: profileData.role,
        branch_id: branchUuid,
        is_active: profileData.isActive,
      })
      .select()
      .single();

    const newUser: UserProfile = {
      id: data?.id || `u-${Date.now()}`,
      fullName: profileData.fullName,
      email: profileData.email,
      pinCode: profileData.pinCode,
      role: profileData.role,
      branchId: profileData.branchId,
      isActive: profileData.isActive,
    };

    setUserProfiles(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUserProfile = async (id: string, updates: Partial<UserProfile>) => {
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.pinCode !== undefined) dbUpdates.pin_code = updates.pinCode;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.branchId !== undefined) {
      dbUpdates.branch_id = BRANCH_CODE_TO_UUID[updates.branchId] || BRANCH_CODE_TO_UUID.ACCRA_MAIN;
    }

    await supabase.from('user_profiles').update(dbUpdates).eq('id', id);

    setUserProfiles(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updates } : u))
    );
    if (activeUser?.id === id) {
      setActiveUser(prev => ({ ...prev, ...updates }));
    }
  };

  // Global [F10] Key Lock Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        setIsLocked(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Function to load live data directly from Supabase
  const refreshLiveData = useCallback(async () => {
    try {
      // 0. Fetch User Profiles
      const { data: uData } = await supabase.from('user_profiles').select('*');
      if (uData && uData.length > 0) {
        const mappedUsers: UserProfile[] = uData.map(u => ({
          id: u.id,
          fullName: u.full_name,
          email: u.email,
          pinCode: u.pin_code || '1234',
          role: u.role || 'CASHIER',
          branchId: (UUID_TO_BRANCH_CODE[u.branch_id] || 'ACCRA_MAIN') as BranchId,
          isActive: u.is_active ?? true,
        }));
        setUserProfiles(mappedUsers);
        setActiveUser(prev => mappedUsers.find(mu => mu.id === prev?.id) || mappedUsers[0]);
      }

      // 1. Fetch Branches
      const { data: bData } = await supabase.from('branches').select('*');
      if (bData && bData.length > 0) {
        const mappedBranches: Branch[] = bData.map(b => ({
          id: (UUID_TO_BRANCH_CODE[b.id] || b.code) as BranchId,
          name: b.name,
          code: b.code,
          location: b.location,
          phone: b.phone,
          manager: b.manager,
          isMainDepot: b.is_main,
        }));
        setBranches(mappedBranches);
      }

      // 2. Fetch Medicines catalog
      const { data: medsData } = await supabase.from('medicines').select('*');
      let currentProducts = products;
      if (medsData && medsData.length > 0) {
        currentProducts = medsData.map(m => ({
          id: m.id,
          brandName: m.brand_name,
          genericName: m.generic_name,
          category: m.category,
          dosageForm: m.dosage_form,
          strength: m.strength,
          packSize: m.pack_size || '1 Unit',
          retailPrice: Number(m.retail_price),
          costPrice: Number(m.cost_price),
          reorderLevel: m.reorder_level || 15,
          requiresPrescription: !!m.requires_prescription,
          nafdacOrFdaNo: m.nafdac_fda_no,
        }));
        setProducts(currentProducts);
      }

      // 3. Fetch Branch Stock
      const { data: stockData } = await supabase.from('branch_stock').select('*');
      if (stockData && stockData.length > 0) {
        const mappedBatches: Batch[] = stockData.map(s => {
          const bCode = UUID_TO_BRANCH_CODE[s.branch_id] || 'ACCRA_MAIN';
          return {
            id: s.id,
            productId: s.medicine_id,
            branchId: bCode,
            batchNumber: s.batch_number,
            quantity: s.quantity,
            expiryDate: s.expiry_date,
            mfgDate: s.mfg_date || '2025-01-01',
            supplier: s.supplier || 'Wholesale Depot',
            locationShelf: s.shelf_location || 'Main Shelf',
          };
        });
        setBatches(mappedBatches);
      }

      // 4. Fetch Sales Ledger (with cost price fallback resolution)
      const { data: salesData } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .order('created_at', { ascending: false });

      if (salesData && salesData.length > 0) {
        const mappedSales: Sale[] = salesData.map(s => {
          const bCode = UUID_TO_BRANCH_CODE[s.branch_id] || 'ACCRA_MAIN';
          return {
            id: s.id,
            receiptNumber: s.invoice_number || `INV-${s.id}`,
            branchId: bCode,
            timestamp: s.created_at,
            items: (s.sale_items || []).map((si: any) => {
              const catalogProd = currentProducts.find(p => p.id === si.medicine_id);
              const costPrice = Number(si.unit_cost_price ?? catalogProd?.costPrice ?? 0);
              const retailPrice = Number(si.unit_price ?? catalogProd?.retailPrice ?? 0);
              const brandName = catalogProd?.brandName || 'Medicine Item';

              return {
                product: {
                  id: si.medicine_id,
                  brandName,
                  genericName: catalogProd?.genericName || '',
                  category: catalogProd?.category || 'OTC & General Wellness',
                  dosageForm: catalogProd?.dosageForm || 'Tablets',
                  strength: catalogProd?.strength || '',
                  packSize: catalogProd?.packSize || '1 Unit',
                  retailPrice,
                  costPrice,
                  reorderLevel: catalogProd?.reorderLevel || 10,
                  requiresPrescription: catalogProd?.requiresPrescription || false,
                },
                selectedBatch: { id: si.branch_stock_id || 'batch-id', batchNumber: 'BATCH' } as any,
                quantity: Number(si.quantity || 0),
                unitPrice: retailPrice,
                discount: Number(si.discount || 0),
                lineTotal: Number(si.subtotal || (retailPrice * (si.quantity || 0))),
              };
            }),
            subtotal: Number(s.subtotal || s.total_amount),
            discount: Number(s.discount || 0),
            tax: Number(s.tax || 0),
            total: Number(s.total_amount),
            payment: {
              method: (s.payment_method || 'CASH') as any,
              customerName: s.customer_name || 'Walk-in Client',
              customerPhone: s.customer_phone,
              prescribingDoctor: s.doctor_name,
              rxNumber: s.rx_number,
              momoProvider: s.payment_method?.includes('TELECEL') ? 'Telecel Cash' : 'MTN Mobile Money',
            },
            attendantName: s.attendant_name || 'Pharmacist',
            synced: true,
          };
        });
        setSales(mappedSales);
        if (mappedSales.length > 0) setLastCompletedSale(mappedSales[0]);
      } else {
        setSales([]);
      }

      // 5. Fetch Transfers
      const { data: trfData } = await supabase.from('transfers').select('*').order('created_at', { ascending: false });
      if (trfData && trfData.length > 0) {
        const mappedTransfers: InterBranchTransfer[] = trfData.map(t => ({
          id: t.id,
          transferNo: t.transfer_no,
          sourceBranchId: UUID_TO_BRANCH_CODE[t.source_branch_id] || 'ACCRA_MAIN',
          destinationBranchId: UUID_TO_BRANCH_CODE[t.dest_branch_id] || 'OSU_BRANCH',
          items: [
            {
              productId: t.medicine_id || '',
              productName: 'Transferred Medicine',
              batchId: t.batch_number,
              batchNumber: t.batch_number,
              quantity: t.quantity,
              expiryDate: '2027-12-31',
            },
          ],
          status: t.status,
          notes: t.notes,
          requestedBy: t.requested_by || 'Branch Pharmacist',
          dispatchedAt: t.dispatched_at,
          receivedAt: t.received_at,
          createdAt: t.created_at,
        }));
        setTransfers(mappedTransfers);
      }
    } catch (err) {
      console.error('Error syncing live Supabase data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    refreshLiveData();

    const loadedHeld = StorageEngine.getHeldBills();
    if (loadedHeld && loadedHeld.length > 0) setHeldBills(loadedHeld);
  }, [refreshLiveData]);

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

  // Process Sale Checkout (Connected directly to Live Supabase)
  const processCheckout = async (payment: PaymentDetails): Promise<Sale | null> => {
    if (cart.length === 0) return null;

    const branchUuid = BRANCH_CODE_TO_UUID[activeBranchId] || 'a1b2c3d4-0001-4000-8000-000000000001';
    const invoiceNumber = `INV-GH-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Post to atomic POS Checkout API endpoint
      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: branchUuid,
          customerName: payment.customerName || patientDetails.name || 'Walk-in Patient',
          customerPhone: payment.customerPhone || patientDetails.phone,
          doctorName: payment.prescribingDoctor || patientDetails.doctor,
          paymentMethod: payment.method || 'CASH',
          totalAmount: cartTotal,
          items: cart.map(ci => ({
            branch_stock_id: ci.selectedBatch.id,
            medicine_id: ci.product.id,
            quantity: ci.quantity,
            unit_price: ci.unitPrice,
            unit_cost_price: ci.product.costPrice,
            discount: ci.discount || 0,
          })),
        }),
      });

      const result = await res.json();

      // If API route or RPC returned error, execute direct client table write
      if (!res.ok || result.error) {
        console.warn('API route fallback: inserting directly into Supabase sales table...');
        
        // Direct Insert to Sales
        const { data: saleData, error: saleErr } = await supabase
          .from('sales')
          .insert({
            branch_id: branchUuid,
            invoice_number: invoiceNumber,
            customer_name: payment.customerName || patientDetails.name || 'Walk-in Patient',
            customer_phone: payment.customerPhone || patientDetails.phone,
            doctor_name: payment.prescribingDoctor || patientDetails.doctor,
            payment_method: payment.method || 'CASH',
            subtotal: cartSubtotal,
            discount: cartDiscount,
            total_amount: cartTotal,
            attendant_name: activeUser?.fullName || activeBranch.manager,
          })
          .select()
          .single();

        if (!saleErr && saleData) {
          // Direct Insert Line Items
          const lineItems = cart.map(ci => ({
            sale_id: saleData.id,
            branch_stock_id: ci.selectedBatch.id,
            medicine_id: ci.product.id,
            quantity: ci.quantity,
            unit_price: ci.unitPrice,
            unit_cost_price: ci.product.costPrice,
            discount: ci.discount || 0,
            subtotal: ci.lineTotal,
          }));

          await supabase.from('sale_items').insert(lineItems);

          // Decrement branch_stock for each item
          for (const ci of cart) {
            const curBatch = batches.find(b => b.id === ci.selectedBatch.id);
            if (curBatch) {
              const newQty = Math.max(0, curBatch.quantity - ci.quantity);
              await supabase.from('branch_stock').update({ quantity: newQty }).eq('id', ci.selectedBatch.id);
            }
          }
        }
      }

      // 2. Build local Completed Sale object
      const newSale: Sale = {
        id: result.sale_id || `SALE-${Date.now()}`,
        receiptNumber: result.invoice_number || invoiceNumber,
        branchId: activeBranchId,
        timestamp: new Date().toISOString(),
        items: [...cart],
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
        attendantName: activeUser?.fullName || activeBranch.manager,
        synced: true,
      };

      setLastCompletedSale(newSale);
      clearCart();

      // 3. Immediately refresh live data from Supabase to sync updated stock counts
      await refreshLiveData();

      return newSale;
    } catch (err) {
      console.error('Process checkout exception:', err);
      // Fallback local operation
      const newSale: Sale = {
        id: `SALE-${Date.now()}`,
        receiptNumber: invoiceNumber,
        branchId: activeBranchId,
        timestamp: new Date().toISOString(),
        items: [...cart],
        subtotal: cartSubtotal,
        discount: cartDiscount,
        tax: 0,
        total: cartTotal,
        payment,
        attendantName: activeUser?.fullName || activeBranch.manager,
        synced: true,
      };
      setLastCompletedSale(newSale);
      clearCart();
      return newSale;
    }
  };

  // Inter-branch transfers (Connected to Supabase)
  const createTransfer = async (
    sourceBranch: BranchId,
    destBranch: BranchId,
    itemsToTransfer: { productId: string; batchId: string; quantity: number }[],
    notes?: string
  ): Promise<InterBranchTransfer> => {
    const transferNo = `TRF-GH-${Math.floor(1000 + Math.random() * 9000)}`;

    const sourceUuid = BRANCH_CODE_TO_UUID[sourceBranch] || BRANCH_CODE_TO_UUID.ACCRA_MAIN;
    const destUuid = BRANCH_CODE_TO_UUID[destBranch] || BRANCH_CODE_TO_UUID.OSU_BRANCH;

    const firstItem = itemsToTransfer[0];
    const targetBatch = batches.find(b => b.id === firstItem?.batchId);

    // Insert to Supabase transfers table
    await supabase.from('transfers').insert({
      transfer_no: transferNo,
      source_branch_id: sourceUuid,
      dest_branch_id: destUuid,
      medicine_id: firstItem?.productId,
      batch_number: targetBatch?.batchNumber || 'BATCH-TRF',
      quantity: firstItem?.quantity || 1,
      status: 'DISPATCHED',
      notes: notes || 'Inter-branch stock transfer',
      requested_by: activeUser?.fullName || activeBranch.manager,
    });

    await refreshLiveData();

    const transferItems = itemsToTransfer.map(item => {
      const p = products.find(prod => prod.id === item.productId)!;
      const b = batches.find(btch => btch.id === item.batchId)!;
      return {
        productId: item.productId,
        productName: p?.brandName || 'Medicine',
        batchId: item.batchId,
        batchNumber: b?.batchNumber || 'BATCH',
        quantity: item.quantity,
        expiryDate: b?.expiryDate || '2027-12-31',
      };
    });

    const newTransfer: InterBranchTransfer = {
      id: `TRF-${Date.now()}`,
      transferNo,
      sourceBranchId: sourceBranch,
      destinationBranchId: destBranch,
      items: transferItems,
      status: 'DISPATCHED',
      notes,
      requestedBy: activeUser?.fullName || activeBranch.manager,
      createdAt: new Date().toISOString(),
    };

    return newTransfer;
  };

  const dispatchTransfer = async (transferId: string) => {
    await supabase.from('transfers').update({ status: 'DISPATCHED', dispatched_at: new Date().toISOString() }).eq('id', transferId);
    await refreshLiveData();
  };

  const receiveTransfer = async (transferId: string) => {
    await supabase.from('transfers').update({ status: 'RECEIVED', received_at: new Date().toISOString() }).eq('id', transferId);
    await refreshLiveData();
  };

  // Stock adjustment
  const adjustBatchQuantity = async (
    productId: string,
    batchId: string,
    branchId: BranchId,
    deltaQty: number,
    reason: AdjustmentReason,
    notes?: string
  ) => {
    const curBatch = batches.find(b => b.id === batchId);
    if (curBatch) {
      const newQty = Math.max(0, curBatch.quantity + deltaQty);
      await supabase.from('branch_stock').update({ quantity: newQty, updated_at: new Date().toISOString() }).eq('id', batchId);
      await refreshLiveData();
    }
  };

  // Market Intake
  const recordMarketIntake = async (
    productId: string,
    targetBranch: BranchId,
    batchNumber: string,
    quantity: number,
    mfgDate: string,
    expiryDate: string,
    costPrice: number
  ) => {
    const targetBranchUuid = BRANCH_CODE_TO_UUID[targetBranch] || BRANCH_CODE_TO_UUID.ACCRA_MAIN;
    const p = products.find(prod => prod.id === productId);

    await supabase.from('branch_stock').upsert(
      {
        branch_id: targetBranchUuid,
        medicine_id: productId,
        batch_number: batchNumber,
        expiry_date: expiryDate,
        mfg_date: mfgDate,
        quantity,
        unit_cost_price: costPrice,
        unit_selling_price: p?.retailPrice || costPrice * 1.5,
        supplier: 'Wholesale Market Intake',
        shelf_location: 'Restock Bay',
      },
      { onConflict: 'branch_id,medicine_id,batch_number' }
    );

    await refreshLiveData();
  };

  return (
    <PharmacyContext.Provider
      value={{
        userProfiles,
        activeUser,
        isLocked,
        lockStation,
        unlockStation,
        switchUserByProfileId,
        addUserProfile,
        updateUserProfile,
        verifyManagerPin,
        isLoading,
        branches,
        activeBranchId,
        setActiveBranchId,
        activeBranch,
        products,
        batches,
        refreshLiveData,
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
