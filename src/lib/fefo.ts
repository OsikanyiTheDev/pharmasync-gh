import { Batch, Product, ProductWithStock, BranchId, MarketRestockItem, BatchWithProduct } from './types';

/**
 * Get FEFO (First-Expiring, First-Out) sorted active batches for a given product & branch.
 */
export function getFEFOSortedBatches(batches: Batch[], productId: string, branchId: BranchId): Batch[] {
  return batches
    .filter(b => b.productId === productId && b.branchId === branchId && b.quantity > 0)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
}

/**
 * Pick the recommended FEFO batch for counter checkout.
 */
export function getRecommendedFEFOBatch(batches: Batch[], productId: string, branchId: BranchId): Batch | undefined {
  const sorted = getFEFOSortedBatches(batches, productId, branchId);
  return sorted[0];
}

export const autoSelectFEFOBatch = getRecommendedFEFOBatch;

/**
 * Calculate expiry status and days remaining for a batch
 */
export function getBatchExpiryStatus(expiryDateStr: string): {
  daysRemaining: number;
  status: 'HEALTHY' | 'EXPIRING_SOON' | 'EXPIRED';
  label: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expiryDateStr);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      daysRemaining,
      status: 'EXPIRED',
      label: `EXPIRED (${Math.abs(daysRemaining)} days ago)`,
    };
  } else if (daysRemaining <= 90) {
    return {
      daysRemaining,
      status: 'EXPIRING_SOON',
      label: `Expiring in ${daysRemaining} days`,
    };
  }

  return {
    daysRemaining,
    status: 'HEALTHY',
    label: `Healthy (${daysRemaining} days remaining)`,
  };
}

/**
 * Enriched product data with stock totals across branches and current active branch FEFO batch
 */
export function enrichProductsWithStock(
  products: Product[],
  batches: Batch[],
  activeBranchId: BranchId
): ProductWithStock[] {
  return products.map(product => {
    const productBatches = batches.filter(b => b.productId === product.id);
    
    // Branch breakdown
    const allBranchesStock: Record<BranchId, number> = {
      ACCRA_MAIN: 0,
      OSU_BRANCH: 0,
      SPINTEX_BRANCH: 0,
    };

    productBatches.forEach(b => {
      if (allBranchesStock[b.branchId] !== undefined) {
        allBranchesStock[b.branchId] += b.quantity;
      }
    });

    const activeBranchBatches = getFEFOSortedBatches(batches, product.id, activeBranchId);
    const totalStockInBranch = allBranchesStock[activeBranchId] || 0;
    const nextExpiringBatch = activeBranchBatches[0];

    return {
      ...product,
      totalStockInBranch,
      allBranchesStock,
      batches: productBatches,
      nextExpiringBatch,
    };
  });
}

/**
 * Aggregate low stock products for Owner Wholesale Market Restock Mode (Mobile View)
 */
export function getMarketRestockList(
  products: Product[],
  batches: Batch[],
  salesVelocityMap: Record<string, number> = {}
): MarketRestockItem[] {
  const items: MarketRestockItem[] = [];

  products.forEach(product => {
    const productBatches = batches.filter(b => b.productId === product.id);
    
    const branchBreakdown: Record<BranchId, number> = {
      ACCRA_MAIN: 0,
      OSU_BRANCH: 0,
      SPINTEX_BRANCH: 0,
    };

    let aggregateStock = 0;
    productBatches.forEach(b => {
      branchBreakdown[b.branchId] += b.quantity;
      aggregateStock += b.quantity;
    });

    // Check if aggregate stock is below threshold or if any branch is completely out of stock
    const isLow = aggregateStock <= product.reorderLevel || 
                  branchBreakdown.ACCRA_MAIN < 10 || 
                  branchBreakdown.OSU_BRANCH < 10 || 
                  branchBreakdown.SPINTEX_BRANCH < 10;

    if (isLow) {
      const velocity = salesVelocityMap[product.id] || 15;
      const targetStockLevel = product.reorderLevel * 2;
      const recommendedQty = Math.max(30, targetStockLevel - aggregateStock);
      const estimatedWholesaleCost = product.costPrice;
      const totalEstimatedCost = recommendedQty * estimatedWholesaleCost;

      items.push({
        product,
        aggregateStock,
        branchBreakdown,
        recommendedQty,
        estimatedWholesaleCost,
        totalEstimatedCost,
        velocity30Days: velocity,
      });
    }
  });

  return items.sort((a, b) => a.aggregateStock - b.aggregateStock);
}
