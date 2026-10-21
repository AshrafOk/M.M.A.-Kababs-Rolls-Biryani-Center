import { InventoryItemRow, BranchInfo, BranchId, BranchDailyRecord } from '../types/restaurant';

export interface CategorySummary {
  totalKgPurchased: number;
  totalKgStock: number;
  totalPcsPurchased: number;
  totalPcsStock: number;
  totalLitresPurchased: number;
  totalLitresStock: number;
  totalBagsPurchased: number;
  totalBagsStock: number;
  totalTinsPurchased: number;
  totalTinsStock: number;
  totalBunchesPurchased: number;
  totalBunchesStock: number;
  allPurchasedQty: number;
  allStockQty: number;
  hasPurchased: boolean;
  hasStock: boolean;
  hasEntries: boolean;
  purchasedDisplay: string;
  stockDisplay: string;
}

/**
 * Calculates total quantities (specifically KG and secondary units) for any inventory item list.
 */
export const calculateCategoryTotals = (
  items: InventoryItemRow[] = [],
  categoryType: 'meat' | 'grocery' | 'dairy' | 'vegetable' = 'meat'
): CategorySummary => {
  let totalKgPurchased = 0;
  let totalKgStock = 0;
  let totalPcsPurchased = 0;
  let totalPcsStock = 0;
  let totalLitresPurchased = 0;
  let totalLitresStock = 0;
  let totalBagsPurchased = 0;
  let totalBagsStock = 0;
  let totalTinsPurchased = 0;
  let totalTinsStock = 0;
  let totalBunchesPurchased = 0;
  let totalBunchesStock = 0;
  let allPurchasedQty = 0;
  let allStockQty = 0;

  items.forEach(item => {
    const p = Number(item.purchased) || 0;
    const s = Number(item.stock) || 0;
    allPurchasedQty += p;
    allStockQty += s;

    const unit = (item.unit || '').trim().toLowerCase();

    if (unit === 'kg' || unit === 'kgs' || unit === 'kilogram' || unit === 'kilograms') {
      totalKgPurchased += p;
      totalKgStock += s;
    } else if (unit === 'pcs' || unit === 'piece' || unit === 'pieces') {
      totalPcsPurchased += p;
      totalPcsStock += s;
    } else if (unit === 'litres' || unit === 'litre' || unit === 'liters' || unit === 'liter' || unit === 'l') {
      totalLitresPurchased += p;
      totalLitresStock += s;
    } else if (unit === 'bags' || unit === 'bag') {
      totalBagsPurchased += p;
      totalBagsStock += s;
    } else if (unit === 'tins' || unit === 'tin') {
      totalTinsPurchased += p;
      totalTinsStock += s;
    } else if (unit === 'bunches' || unit === 'bunch') {
      totalBunchesPurchased += p;
      totalBunchesStock += s;
    } else {
      // Default fallback: if unit unspecified or unrecognized, count towards kg if category is meat or vegetables
      if (categoryType === 'meat' || categoryType === 'vegetable' || categoryType === 'grocery') {
        totalKgPurchased += p;
        totalKgStock += s;
      }
    }
  });

  // Round numbers to 1 decimal place if fractional
  const roundVal = (v: number) => (Number.isInteger(v) ? v : Math.round(v * 10) / 10);

  totalKgPurchased = roundVal(totalKgPurchased);
  totalKgStock = roundVal(totalKgStock);

  const hasPurchased = allPurchasedQty > 0;
  const hasStock = allStockQty > 0;
  const hasEntries = hasPurchased || hasStock;

  // Format clean display strings based on category
  let purchasedDisplay = '0 kg';
  let stockDisplay = '0 kg';

  if (categoryType === 'meat') {
    // Chicken & Meat: Highlight KG, with PCS in secondary if present
    const buyParts: string[] = [];
    if (totalKgPurchased > 0 || (totalPcsPurchased === 0 && totalKgPurchased === 0)) {
      buyParts.push(`${totalKgPurchased} kg`);
    }
    if (totalPcsPurchased > 0) {
      buyParts.push(`${totalPcsPurchased} pcs`);
    }
    purchasedDisplay = buyParts.join(' + ') || `${totalKgPurchased} kg`;

    const stockParts: string[] = [];
    if (totalKgStock > 0 || (totalPcsStock === 0 && totalKgStock === 0)) {
      stockParts.push(`${totalKgStock} kg`);
    }
    if (totalPcsStock > 0) {
      stockParts.push(`${totalPcsStock} pcs`);
    }
    stockDisplay = stockParts.join(' + ') || `${totalKgStock} kg`;

  } else if (categoryType === 'dairy') {
    // Dairy: Curd & Milk (litres) + Paneer & Butter (kg)
    const dairyBuyKgL = roundVal(totalKgPurchased + totalLitresPurchased);
    const dairyStockKgL = roundVal(totalKgStock + totalLitresStock);
    purchasedDisplay = `${dairyBuyKgL} kg/L`;
    stockDisplay = `${dairyStockKgL} kg/L`;

  } else if (categoryType === 'grocery') {
    // Grocery: Flour, Spices (kg) + Rice, Coal (bags) + Oil (tins)
    const buyParts: string[] = [];
    buyParts.push(`${totalKgPurchased} kg`);
    if (totalBagsPurchased > 0) buyParts.push(`${totalBagsPurchased} bags`);
    if (totalTinsPurchased > 0) buyParts.push(`${totalTinsPurchased} tins`);
    purchasedDisplay = buyParts.join(' + ');

    const stockParts: string[] = [];
    stockParts.push(`${totalKgStock} kg`);
    if (totalBagsStock > 0) stockParts.push(`${totalBagsStock} bags`);
    if (totalTinsStock > 0) stockParts.push(`${totalTinsStock} tins`);
    stockDisplay = stockParts.join(' + ');

  } else if (categoryType === 'vegetable') {
    // Vegetables: Onions, Tomatoes, Chillies (kg) + Mint/Coriander (bunches) + Lemons (pcs)
    const buyParts: string[] = [`${totalKgPurchased} kg`];
    if (totalBunchesPurchased > 0) buyParts.push(`${totalBunchesPurchased} bunches`);
    if (totalPcsPurchased > 0) buyParts.push(`${totalPcsPurchased} pcs`);
    purchasedDisplay = buyParts.join(' + ');

    const stockParts: string[] = [`${totalKgStock} kg`];
    if (totalBunchesStock > 0) stockParts.push(`${totalBunchesStock} bunches`);
    if (totalPcsStock > 0) stockParts.push(`${totalPcsStock} pcs`);
    stockDisplay = stockParts.join(' + ');
  }

  return {
    totalKgPurchased,
    totalKgStock,
    totalPcsPurchased,
    totalPcsStock,
    totalLitresPurchased,
    totalLitresStock,
    totalBagsPurchased,
    totalBagsStock,
    totalTinsPurchased,
    totalTinsStock,
    totalBunchesPurchased,
    totalBunchesStock,
    allPurchasedQty,
    allStockQty,
    hasPurchased,
    hasStock,
    hasEntries,
    purchasedDisplay,
    stockDisplay,
  };
};

export interface ChainInventoryAggregate {
  meat: CategorySummary;
  grocery: CategorySummary;
  dairy: CategorySummary;
  vegetable: CategorySummary;
  totalChickenPurchasedKg: number;
  totalChickenStockKg: number;
  totalAllCategoriesPurchasedKg: number;
  totalAllCategoriesStockKg: number;
}

/**
 * Calculates aggregate totals across all 6 Bangalore branches for a specific date
 */
export const calculateChainInventoryTotals = (
  branches: BranchInfo[],
  date: string,
  getRecord: (branchId: BranchId, date: string) => BranchDailyRecord
): ChainInventoryAggregate => {
  const allMeat: InventoryItemRow[] = [];
  const allGrocery: InventoryItemRow[] = [];
  const allDairy: InventoryItemRow[] = [];
  const allVegetable: InventoryItemRow[] = [];

  branches.forEach(b => {
    const rec = getRecord(b.id, date);
    if (rec.meatItems) allMeat.push(...rec.meatItems);
    if (rec.groceryItems) allGrocery.push(...rec.groceryItems);
    if (rec.dairyItems) allDairy.push(...rec.dairyItems);
    if (rec.vegetableItems) allVegetable.push(...rec.vegetableItems);
  });

  const meat = calculateCategoryTotals(allMeat, 'meat');
  const grocery = calculateCategoryTotals(allGrocery, 'grocery');
  const dairy = calculateCategoryTotals(allDairy, 'dairy');
  const vegetable = calculateCategoryTotals(allVegetable, 'vegetable');

  const totalAllCategoriesPurchasedKg = Math.round(
    meat.totalKgPurchased + grocery.totalKgPurchased + dairy.totalKgPurchased + vegetable.totalKgPurchased
  );
  const totalAllCategoriesStockKg = Math.round(
    meat.totalKgStock + grocery.totalKgStock + dairy.totalKgStock + vegetable.totalKgStock
  );

  return {
    meat,
    grocery,
    dairy,
    vegetable,
    totalChickenPurchasedKg: meat.totalKgPurchased,
    totalChickenStockKg: meat.totalKgStock,
    totalAllCategoriesPurchasedKg,
    totalAllCategoriesStockKg,
  };
};
