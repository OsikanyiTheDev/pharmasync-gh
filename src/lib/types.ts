export type BranchId = 'ACCRA_MAIN' | 'OSU_BRANCH' | 'SPINTEX_BRANCH';

export type UserRole = 'OWNER' | 'BRANCH_MANAGER' | 'CASHIER';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  pinCode: string;
  role: UserRole;
  branchId: BranchId;
  isActive: boolean;
}

export interface Branch {
  id: BranchId;
  name: string;
  code: string;
  location: string;
  phone: string;
  manager: string;
  isMainDepot?: boolean;
}

export type MedicineCategory = 
  | 'Anti-Malarial'
  | 'Antibiotic'
  | 'Analgesics & Pain'
  | 'Cardiovascular & Chronic'
  | 'Syrups & Rehydration'
  | 'OTC & General Wellness';

export type DosageForm = 
  | 'Tablets'
  | 'Capsules'
  | 'Syrup'
  | 'Oral Suspension'
  | 'Gel / Ointment'
  | 'Injection'
  | 'Sachet / Powder';

export interface Product {
  id: string;
  brandName: string;
  genericName: string;
  category: MedicineCategory;
  dosageForm: DosageForm;
  strength: string;
  packSize: string;
  retailPrice: number; // In GH₵
  costPrice: number;   // In GH₵
  reorderLevel: number; // Aggregate threshold across branches
  requiresPrescription: boolean;
  nafdacOrFdaNo?: string; // Ghana FDA registration reference
}

export interface Batch {
  id: string;
  productId: string;
  branchId: BranchId;
  batchNumber: string;
  quantity: number;
  expiryDate: string; // ISO date string YYYY-MM-DD
  mfgDate: string;    // ISO date string YYYY-MM-DD
  supplier: string;
  locationShelf?: string; // e.g. "Shelf A-04", "Cold Chain Fridge"
}

export interface BatchWithProduct extends Batch {
  product: Product;
  daysToExpiry: number;
  expiryStatus: 'HEALTHY' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface ProductWithStock extends Product {
  totalStockInBranch: number;
  allBranchesStock: Record<BranchId, number>;
  batches: Batch[];
  nextExpiringBatch?: Batch;
}

export interface CartItem {
  product: Product;
  selectedBatch: Batch;
  quantity: number;
  unitPrice: number; // In GH₵
  discount: number;  // In GH₵
  lineTotal: number; // In GH₵
  isManualBatchOverride?: boolean;
}

export type PaymentMethod = 'CASH' | 'MOMO_MTN' | 'MOMO_TELECEL' | 'MOMO_AT' | 'SPLIT';

export interface PaymentDetails {
  method: PaymentMethod;
  cashPaid?: number;
  cashChange?: number;
  momoAmount?: number;
  momoProvider?: 'MTN Mobile Money' | 'Telecel Cash' | 'AT Money';
  momoRef?: string;
  customerPhone?: string;
  customerName?: string;
  prescribingDoctor?: string;
  rxNumber?: string;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  branchId: BranchId;
  timestamp: string; // ISO string
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  payment: PaymentDetails;
  attendantName: string;
  synced: boolean;
}

export interface HeldBill {
  id: string;
  billNumber: string;
  createdAt: string;
  branchId: BranchId;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  patientName?: string;
  patientPhone?: string;
  prescribingDoctor?: string;
}

export type TransferStatus = 'PENDING' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';

export interface TransferItem {
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
}

export interface InterBranchTransfer {
  id: string;
  transferNo: string;
  sourceBranchId: BranchId;
  destinationBranchId: BranchId;
  items: TransferItem[];
  status: TransferStatus;
  notes?: string;
  requestedBy: string;
  dispatchedAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export type AdjustmentReason = 'DAMAGE' | 'EXPIRY' | 'AUDIT_CORRECTION' | 'SHRINKAGE' | 'RESTOCK_INTAKE';

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  branchId: BranchId;
  quantityDelta: number;
  reason: AdjustmentReason;
  notes?: string;
  performedBy: string;
  timestamp: string;
}

export interface MarketRestockItem {
  product: Product;
  aggregateStock: number;
  branchBreakdown: Record<BranchId, number>;
  recommendedQty: number;
  estimatedWholesaleCost: number; // GH₵ per pack
  totalEstimatedCost: number;     // GH₵
  velocity30Days: number;
  isBought?: boolean;
}

export interface SyncQueueItem {
  id: string;
  action: 'CREATE_SALE' | 'STOCK_TRANSFER' | 'STOCK_ADJUSTMENT' | 'MARKET_RESTOCK';
  payload: any;
  createdAt: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
}
