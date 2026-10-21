import { BranchId, BranchInfo, BranchDailyRecord, DailyProfitCalculation } from '../types/restaurant';

export type TimeframeMode = 'weekly' | 'monthly' | 'yearly';
export type ViewMode = 'total' | 'profit_vs_expense' | 'channels' | 'compare_branches';

export interface DataPoint {
  key: string;            // 'YYYY-MM-DD' or 'YYYY-MM'
  date?: string;          // Specific date if applicable
  label: string;          // Short label for X-Axis
  fullLabel: string;      // Full label for Tooltip
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  cashSales: number;
  upiSales: number;
  deliverySales: number;
  cardSales: number;
  branchSales: Record<string, number>;
  isCurrent: boolean;
}

/**
 * Format currency into Indian format (e.g. ₹45k, ₹1.5L)
 */
export const formatINR = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}k`;
  }
  return `₹${Math.round(value)}`;
};

/**
 * Build trend data points for a single branch
 */
export const getBranchTrendData = (
  branchId: BranchId,
  timeframe: TimeframeMode,
  selectedDate: string,
  records: Record<string, BranchDailyRecord>,
  getRecord: (branchId: BranchId, date: string) => BranchDailyRecord,
  calculateBranchProfit: (record: BranchDailyRecord) => DailyProfitCalculation
): DataPoint[] => {
  const baseDate = new Date(selectedDate);
  const validBase = isNaN(baseDate.getTime()) ? new Date() : baseDate;
  const list: DataPoint[] = [];

  if (timeframe === 'weekly') {
    // 7 consecutive days ending on selectedDate
    for (let i = 6; i >= 0; i--) {
      const d = new Date(validBase);
      d.setDate(validBase.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumMonth = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      const rec = getRecord(branchId, dateStr);
      const calc = calculateBranchProfit(rec);

      list.push({
        key: dateStr,
        date: dateStr,
        label: `${dayNumMonth} (${dayName})`,
        fullLabel: `${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`,
        totalSales: calc.totalSales,
        totalExpenses: calc.totalExpenses,
        netProfit: calc.netProfit,
        cashSales: rec.sales.cash || 0,
        upiSales: rec.sales.phonePe || 0,
        deliverySales: rec.sales.delivery || 0,
        cardSales: rec.sales.cardMachine || 0,
        branchSales: { [branchId]: calc.totalSales },
        isCurrent: dateStr === selectedDate,
      });
    }
  } else if (timeframe === 'monthly') {
    // 30 consecutive days ending on selectedDate
    for (let i = 29; i >= 0; i--) {
      const d = new Date(validBase);
      d.setDate(validBase.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNumMonth = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      const rec = getRecord(branchId, dateStr);
      const calc = calculateBranchProfit(rec);

      list.push({
        key: dateStr,
        date: dateStr,
        label: dayNumMonth,
        fullLabel: `${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`,
        totalSales: calc.totalSales,
        totalExpenses: calc.totalExpenses,
        netProfit: calc.netProfit,
        cashSales: rec.sales.cash || 0,
        upiSales: rec.sales.phonePe || 0,
        deliverySales: rec.sales.delivery || 0,
        cardSales: rec.sales.cardMachine || 0,
        branchSales: { [branchId]: calc.totalSales },
        isCurrent: dateStr === selectedDate,
      });
    }
  } else if (timeframe === 'yearly') {
    // 12 months ending in the month of selectedDate
    const currentYear = validBase.getFullYear();
    const currentMonth = validBase.getMonth(); // 0 to 11

    for (let m = 11; m >= 0; m--) {
      const d = new Date(currentYear, currentMonth - m, 1);
      const year = d.getFullYear();
      const monthNumber = String(d.getMonth() + 1).padStart(2, '0');
      const yearMonthKey = `${year}-${monthNumber}`;
      const monthShort = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthFull = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Aggregate all records in memory for this branch matching YYYY-MM
      let mSales = 0;
      let mExpenses = 0;
      let mCash = 0;
      let mUpi = 0;
      let mDelivery = 0;
      let mCard = 0;

      // Scan all records in memory
      Object.entries(records).forEach(([key, rec]) => {
        if (rec.branchId === branchId && rec.date.startsWith(yearMonthKey)) {
          const calc = calculateBranchProfit(rec);
          mSales += calc.totalSales;
          mExpenses += calc.totalExpenses;
          mCash += rec.sales.cash || 0;
          mUpi += rec.sales.phonePe || 0;
          mDelivery += rec.sales.delivery || 0;
          mCard += rec.sales.cardMachine || 0;
        }
      });

      // If no recorded days in records for this month, check if current month has selectedDate record
      if (mSales === 0 && selectedDate.startsWith(yearMonthKey)) {
        const rec = getRecord(branchId, selectedDate);
        const calc = calculateBranchProfit(rec);
        mSales = calc.totalSales;
        mExpenses = calc.totalExpenses;
        mCash = rec.sales.cash || 0;
        mUpi = rec.sales.phonePe || 0;
        mDelivery = rec.sales.delivery || 0;
        mCard = rec.sales.cardMachine || 0;
      }

      list.push({
        key: yearMonthKey,
        date: `${yearMonthKey}-01`,
        label: monthShort,
        fullLabel: monthFull,
        totalSales: mSales,
        totalExpenses: mExpenses,
        netProfit: mSales - mExpenses,
        cashSales: mCash,
        upiSales: mUpi,
        deliverySales: mDelivery,
        cardSales: mCard,
        branchSales: { [branchId]: mSales },
        isCurrent: selectedDate.startsWith(yearMonthKey),
      });
    }
  }

  return list;
};

/**
 * Build trend data points for the entire 6-branch chain
 */
export const getChainTrendData = (
  timeframe: TimeframeMode,
  selectedDate: string,
  branches: BranchInfo[],
  records: Record<string, BranchDailyRecord>,
  calculateChainTotals: (date: string) => {
    totalSales: number;
    totalExpenses: number;
    totalProfit: number;
    totalCashBalance: number;
    totalDelivery: number;
    totalPhonePe: number;
    totalCard: number;
    totalCounterCash: number;
  },
  getRecord: (branchId: BranchId, date: string) => BranchDailyRecord,
  calculateBranchProfit: (record: BranchDailyRecord) => DailyProfitCalculation
): DataPoint[] => {
  const baseDate = new Date(selectedDate);
  const validBase = isNaN(baseDate.getTime()) ? new Date() : baseDate;
  const list: DataPoint[] = [];

  if (timeframe === 'weekly') {
    // 7 consecutive days ending on selectedDate
    for (let i = 6; i >= 0; i--) {
      const d = new Date(validBase);
      d.setDate(validBase.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumMonth = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      const chainTotals = calculateChainTotals(dateStr);
      const branchSalesMap: Record<string, number> = {};

      branches.forEach(b => {
        const rec = getRecord(b.id, dateStr);
        const calc = calculateBranchProfit(rec);
        branchSalesMap[b.id] = calc.totalSales;
      });

      list.push({
        key: dateStr,
        date: dateStr,
        label: `${dayNumMonth} (${dayName})`,
        fullLabel: `${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`,
        totalSales: chainTotals.totalSales,
        totalExpenses: chainTotals.totalExpenses,
        netProfit: chainTotals.totalProfit,
        cashSales: chainTotals.totalCounterCash,
        upiSales: chainTotals.totalPhonePe,
        deliverySales: chainTotals.totalDelivery,
        cardSales: chainTotals.totalCard,
        branchSales: branchSalesMap,
        isCurrent: dateStr === selectedDate,
      });
    }
  } else if (timeframe === 'monthly') {
    // 30 consecutive days ending on selectedDate
    for (let i = 29; i >= 0; i--) {
      const d = new Date(validBase);
      d.setDate(validBase.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNumMonth = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      const chainTotals = calculateChainTotals(dateStr);
      const branchSalesMap: Record<string, number> = {};

      branches.forEach(b => {
        const rec = getRecord(b.id, dateStr);
        const calc = calculateBranchProfit(rec);
        branchSalesMap[b.id] = calc.totalSales;
      });

      list.push({
        key: dateStr,
        date: dateStr,
        label: dayNumMonth,
        fullLabel: `${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`,
        totalSales: chainTotals.totalSales,
        totalExpenses: chainTotals.totalExpenses,
        netProfit: chainTotals.totalProfit,
        cashSales: chainTotals.totalCounterCash,
        upiSales: chainTotals.totalPhonePe,
        deliverySales: chainTotals.totalDelivery,
        cardSales: chainTotals.totalCard,
        branchSales: branchSalesMap,
        isCurrent: dateStr === selectedDate,
      });
    }
  } else if (timeframe === 'yearly') {
    // 12 months ending in the month of selectedDate
    const currentYear = validBase.getFullYear();
    const currentMonth = validBase.getMonth();

    for (let m = 11; m >= 0; m--) {
      const d = new Date(currentYear, currentMonth - m, 1);
      const year = d.getFullYear();
      const monthNumber = String(d.getMonth() + 1).padStart(2, '0');
      const yearMonthKey = `${year}-${monthNumber}`;
      const monthShort = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthFull = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      let mSales = 0;
      let mExpenses = 0;
      let mCash = 0;
      let mUpi = 0;
      let mDelivery = 0;
      let mCard = 0;
      const branchSalesMap: Record<string, number> = {};
      branches.forEach(b => {
        branchSalesMap[b.id] = 0;
      });

      // Aggregate all records in memory across all branches for this month
      Object.entries(records).forEach(([_, rec]) => {
        if (rec.date.startsWith(yearMonthKey)) {
          const calc = calculateBranchProfit(rec);
          mSales += calc.totalSales;
          mExpenses += calc.totalExpenses;
          mCash += rec.sales.cash || 0;
          mUpi += rec.sales.phonePe || 0;
          mDelivery += rec.sales.delivery || 0;
          mCard += rec.sales.cardMachine || 0;

          if (branchSalesMap[rec.branchId] !== undefined) {
            branchSalesMap[rec.branchId] += calc.totalSales;
          }
        }
      });

      list.push({
        key: yearMonthKey,
        date: `${yearMonthKey}-01`,
        label: monthShort,
        fullLabel: monthFull,
        totalSales: mSales,
        totalExpenses: mExpenses,
        netProfit: mSales - mExpenses,
        cashSales: mCash,
        upiSales: mUpi,
        deliverySales: mDelivery,
        cardSales: mCard,
        branchSales: branchSalesMap,
        isCurrent: selectedDate.startsWith(yearMonthKey),
      });
    }
  }

  return list;
};

/**
 * Branch accent colors for the 6 branches in Recharts
 */
export const BRANCH_CHART_COLORS: Record<BranchId, { stroke: string; fill: string; name: string }> = {
  kundalahalli: { stroke: '#059669', fill: '#10b981', name: 'Kundalahalli Gate' },
  banaswadi: { stroke: '#d97706', fill: '#f59e0b', name: 'Banaswadi' },
  indiranagar: { stroke: '#6366f1', fill: '#818cf8', name: 'Indiranagar' },
  'kr-puram': { stroke: '#e11d48', fill: '#f43f5e', name: 'KR Puram' },
  balagere: { stroke: '#0891b2', fill: '#06b6d4', name: 'Balagere Road' },
  varthur: { stroke: '#ea580c', fill: '#f97316', name: 'Varthur' },
};
