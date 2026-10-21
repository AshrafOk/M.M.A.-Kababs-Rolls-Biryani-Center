import { BranchId, BranchDailyRecord } from '../types/restaurant';
import { BANGALORE_BRANCHES, createFreshZeroRecord } from '../data/mockData';

/**
 * Deterministically generates realistic past sales data for testing and previewing
 * weekly, monthly, and yearly charts across all 6 Bangalore branches.
 */
export const generateDemoHistoricalRecords = (
  baseDateStr: string,
  daysBack: number = 35
): Record<string, BranchDailyRecord> => {
  const generated: Record<string, BranchDailyRecord> = {};
  const baseDate = new Date(baseDateStr);
  const validBase = isNaN(baseDate.getTime()) ? new Date() : baseDate;

  // Branch base profiles
  const branchProfiles: Record<BranchId, { baseSales: number; variance: number }> = {
    kundalahalli: { baseSales: 42000, variance: 7000 },
    indiranagar: { baseSales: 48000, variance: 8500 },
    banaswadi: { baseSales: 32000, variance: 5000 },
    'kr-puram': { baseSales: 29000, variance: 4500 },
    balagere: { baseSales: 26000, variance: 4000 },
    varthur: { baseSales: 28000, variance: 4500 },
  };

  for (let i = daysBack; i >= 0; i--) {
    const d = new Date(validBase);
    d.setDate(validBase.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFriday = dayOfWeek === 5;

    // Pseudo-random deterministic factor based on day of month + i
    const seedFactor = Math.sin((d.getDate() * 13) + (i * 7));

    BANGALORE_BRANCHES.forEach(b => {
      const profile = branchProfiles[b.id] || { baseSales: 30000, variance: 5000 };
      
      // Calculate realistic total sales
      let multiplier = 1.0 + (seedFactor * 0.15);
      if (isWeekend) multiplier *= 1.35; // 35% weekend jump
      if (isFriday) multiplier *= 1.15;  // Friday biryani jump

      const totalSales = Math.round(profile.baseSales * multiplier);

      // Split across channels
      const delivery = Math.round(totalSales * 0.40);
      const phonePe = Math.round(totalSales * 0.38);
      const cash = Math.round(totalSales * 0.18);
      const cardMachine = totalSales - (delivery + phonePe + cash);

      // Realistic kharcha / expenses
      const expenseRatio = 0.42 + (Math.abs(seedFactor) * 0.08); // 42% - 50%
      const totalExp = Math.round(totalSales * expenseRatio);

      const staffExp = Math.round(totalExp * 0.40);
      const meatVendor = Math.round(totalExp * 0.30);
      const groceryExp = Math.round(totalExp * 0.15);
      const miscExp = totalExp - (staffExp + meatVendor + groceryExp);

      const rec = createFreshZeroRecord(b.id, dateStr);
      rec.sales = {
        delivery,
        phonePe,
        cardMachine: Math.max(0, cardMachine),
        cash,
        otherSales: 0,
      };

      rec.expenses = [
        { id: `exp-seed-1-${dateStr}`, particular: 'PEMANT (Staff Wages & Advance)', amount: staffExp, category: 'staff' },
        { id: `exp-seed-2-${dateStr}`, particular: 'CHICKEN & MEAT VENDOR', amount: meatVendor, category: 'meat' },
        { id: `exp-seed-3-${dateStr}`, particular: 'OIL, MASALA & MAIDA', amount: groceryExp, category: 'groceries' },
        { id: `exp-seed-4-${dateStr}`, particular: 'COAL & PETTY PACKAGING', amount: miscExp, category: 'miscellaneous' },
      ];

      generated[rec.id] = rec;
    });
  }

  return generated;
};
