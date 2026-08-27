import { Branch, Product, Batch, Sale, InterBranchTransfer, StockAdjustment, SyncQueueItem } from './types';
import { INITIAL_BRANCHES, INITIAL_PRODUCTS, INITIAL_BATCHES, INITIAL_TRANSFERS, INITIAL_SALES } from './seed-data';

const STORAGE_KEYS = {
  BRANCHES: 'pharmasync_gh_branches',
  PRODUCTS: 'pharmasync_gh_products',
  BATCHES: 'pharmasync_gh_batches',
  TRANSFERS: 'pharmasync_gh_transfers',
  SALES: 'pharmasync_gh_sales',
  ADJUSTMENTS: 'pharmasync_gh_adjustments',
  SYNC_QUEUE: 'pharmasync_gh_sync_queue',
  ACTIVE_BRANCH: 'pharmasync_gh_active_branch',
  HELD_BILLS: 'pharmasync_gh_held_bills',
};

// Helper for safe client-side localStorage access
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}

export const StorageEngine = {
  // Load initial or stored branches
  getBranches(): Branch[] {
    const cached = getItem<Branch[]>(STORAGE_KEYS.BRANCHES, []);
    if (!cached || cached.length === 0) {
      setItem(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
      return INITIAL_BRANCHES;
    }
    return cached;
  },

  // Load active branch
  getActiveBranchId(): 'ACCRA_MAIN' | 'OSU_BRANCH' | 'SPINTEX_BRANCH' {
    return getItem<'ACCRA_MAIN' | 'OSU_BRANCH' | 'SPINTEX_BRANCH'>(STORAGE_KEYS.ACTIVE_BRANCH, 'ACCRA_MAIN');
  },

  setActiveBranchId(branchId: 'ACCRA_MAIN' | 'OSU_BRANCH' | 'SPINTEX_BRANCH'): void {
    setItem(STORAGE_KEYS.ACTIVE_BRANCH, branchId);
  },

  // Load products
  getProducts(): Product[] {
    const cached = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    if (!cached || cached.length === 0) {
      setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return cached;
  },

  saveProducts(products: Product[]): void {
    setItem(STORAGE_KEYS.PRODUCTS, products);
  },

  // Load batches
  getBatches(): Batch[] {
    const cached = getItem<Batch[]>(STORAGE_KEYS.BATCHES, []);
    if (!cached || cached.length === 0) {
      setItem(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
      return INITIAL_BATCHES;
    }
    return cached;
  },

  saveBatches(batches: Batch[]): void {
    setItem(STORAGE_KEYS.BATCHES, batches);
  },

  // Load sales
  getSales(): Sale[] {
    const cached = getItem<Sale[]>(STORAGE_KEYS.SALES, []);
    if (!cached || cached.length === 0) {
      setItem(STORAGE_KEYS.SALES, INITIAL_SALES);
      return INITIAL_SALES;
    }
    return cached;
  },

  saveSales(sales: Sale[]): void {
    setItem(STORAGE_KEYS.SALES, sales);
  },

  // Load transfers
  getTransfers(): InterBranchTransfer[] {
    const cached = getItem<InterBranchTransfer[]>(STORAGE_KEYS.TRANSFERS, []);
    if (!cached || cached.length === 0) {
      setItem(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS);
      return INITIAL_TRANSFERS;
    }
    return cached;
  },

  saveTransfers(transfers: InterBranchTransfer[]): void {
    setItem(STORAGE_KEYS.TRANSFERS, transfers);
  },

  // Load stock adjustments
  getAdjustments(): StockAdjustment[] {
    return getItem<StockAdjustment[]>(STORAGE_KEYS.ADJUSTMENTS, []);
  },

  saveAdjustments(adjustments: StockAdjustment[]): void {
    setItem(STORAGE_KEYS.ADJUSTMENTS, adjustments);
  },

  // Offline Sync Queue
  getSyncQueue(): SyncQueueItem[] {
    return getItem<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE, []);
  },

  saveSyncQueue(queue: SyncQueueItem[]): void {
    setItem(STORAGE_KEYS.SYNC_QUEUE, queue);
  },

  // Held Bills
  getHeldBills(): any[] {
    return getItem<any[]>(STORAGE_KEYS.HELD_BILLS, []);
  },

  saveHeldBills(heldBills: any[]): void {
    setItem(STORAGE_KEYS.HELD_BILLS, heldBills);
  },

  addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'status'>): SyncQueueItem {
    const queue = this.getSyncQueue();
    const newItem: SyncQueueItem = {
      ...item,
      id: `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    };
    queue.push(newItem);
    this.saveSyncQueue(queue);
    return newItem;
  },

  clearSyncQueue(): void {
    setItem(STORAGE_KEYS.SYNC_QUEUE, []);
  },

  // Reset demo data to initial defaults
  resetToDefaultSeed(): void {
    setItem(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
    setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setItem(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    setItem(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS);
    setItem(STORAGE_KEYS.SALES, INITIAL_SALES);
    setItem(STORAGE_KEYS.ADJUSTMENTS, []);
    setItem(STORAGE_KEYS.SYNC_QUEUE, []);
  },
};
