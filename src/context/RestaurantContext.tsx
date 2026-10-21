import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BranchDailyRecord, 
  BranchId, 
  BranchInfo, 
  SalesChannelBreakdown, 
  ExpenseItem, 
  InventoryItemRow,
  DailyProfitCalculation 
} from '../types/restaurant';
import { 
  BANGALORE_BRANCHES, 
  createFreshZeroRecord, 
  getTodayDateString 
} from '../data/mockData';

type InventoryCategory = 'meatItems' | 'groceryItems' | 'dairyItems' | 'vegetableItems';

interface RestaurantContextType {
  branches: BranchInfo[];
  activeBranchId: BranchId | 'all';
  setActiveBranchId: (id: BranchId | 'all') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  records: Record<string, BranchDailyRecord>;
  getRecord: (branchId: BranchId, date?: string) => BranchDailyRecord;
  updateRecord: (updatedRecord: BranchDailyRecord) => void;
  
  // Dynamic Item Row Management (Meat, Grocery, Dairy Items, Vegetables)
  updateItemRow: (branchId: BranchId, category: InventoryCategory, itemId: string, field: 'name' | 'purchased' | 'stock' | 'unit', value: string | number) => void;
  addItemRow: (branchId: BranchId, category: InventoryCategory, item: Omit<InventoryItemRow, 'id'>) => void;
  deleteItemRow: (branchId: BranchId, category: InventoryCategory, itemId: string) => void;

  // Sales & Expenses
  updateSales: (branchId: BranchId, salesPartial: Partial<SalesChannelBreakdown>) => void;
  addExpense: (branchId: BranchId, expense: Omit<ExpenseItem, 'id'>) => void;
  updateExpense: (branchId: BranchId, expenseId: string, updated: Partial<ExpenseItem>) => void;
  deleteExpense: (branchId: BranchId, expenseId: string) => void;

  // Calculations
  calculateBranchProfit: (record: BranchDailyRecord) => DailyProfitCalculation;
  calculateChainTotals: (date: string) => {
    totalSales: number;
    totalExpenses: number;
    totalProfit: number;
    totalCashBalance: number;
    totalDelivery: number;
    totalPhonePe: number;
    totalCard: number;
    totalCounterCash: number;
  };

  // Reset to 00
  resetToZero: () => void;
  exportDataJSON: () => string;
}

const STORAGE_KEY = 'mma_kababs_records_fresh_v2';

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [activeBranchId, setActiveBranchId] = useState<BranchId | 'all'>('all');

  const [records, setRecords] = useState<Record<string, BranchDailyRecord>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // Fresh start from 00 for all 6 branches
    const initial: Record<string, BranchDailyRecord> = {};
    const today = getTodayDateString();
    BANGALORE_BRANCHES.forEach(b => {
      const rec = createFreshZeroRecord(b.id, today);
      initial[rec.id] = rec;
    });
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // storage quota or error
    }
  }, [records]);

  const getRecord = (branchId: BranchId, date: string = selectedDate): BranchDailyRecord => {
    const key = `${branchId}-${date}`;
    if (records[key]) {
      return records[key];
    }
    const newRec = createFreshZeroRecord(branchId, date);
    return newRec;
  };

  const updateRecord = (updatedRecord: BranchDailyRecord) => {
    const key = `${updatedRecord.branchId}-${updatedRecord.date}`;
    setRecords(prev => ({
      ...prev,
      [key]: {
        ...updatedRecord,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // Update specific item row in any category
  const updateItemRow = (
    branchId: BranchId,
    category: InventoryCategory,
    itemId: string,
    field: 'name' | 'purchased' | 'stock' | 'unit',
    value: string | number
  ) => {
    const current = getRecord(branchId, selectedDate);
    const updatedList = current[category].map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          [field]: field === 'purchased' || field === 'stock' ? Math.max(0, Number(value) || 0) : value,
        };
      }
      return item;
    });

    updateRecord({
      ...current,
      [category]: updatedList,
    });
  };

  // Allow manager to add custom manual row in any category
  const addItemRow = (
    branchId: BranchId,
    category: InventoryCategory,
    item: Omit<InventoryItemRow, 'id'>
  ) => {
    const current = getRecord(branchId, selectedDate);
    const newRow: InventoryItemRow = {
      ...item,
      id: `${category[0]}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    updateRecord({
      ...current,
      [category]: [...current[category], newRow],
    });
  };

  // Delete row from any category
  const deleteItemRow = (
    branchId: BranchId,
    category: InventoryCategory,
    itemId: string
  ) => {
    const current = getRecord(branchId, selectedDate);
    updateRecord({
      ...current,
      [category]: current[category].filter(i => i.id !== itemId),
    });
  };

  // Update Sales
  const updateSales = (branchId: BranchId, salesPartial: Partial<SalesChannelBreakdown>) => {
    const current = getRecord(branchId, selectedDate);
    updateRecord({
      ...current,
      sales: {
        ...current.sales,
        ...salesPartial,
      },
    });
  };

  // Add Expense
  const addExpense = (branchId: BranchId, expense: Omit<ExpenseItem, 'id'>) => {
    const current = getRecord(branchId, selectedDate);
    const newExpense: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    updateRecord({
      ...current,
      expenses: [...current.expenses, newExpense],
    });
  };

  // Update Expense
  const updateExpense = (branchId: BranchId, expenseId: string, updated: Partial<ExpenseItem>) => {
    const current = getRecord(branchId, selectedDate);
    updateRecord({
      ...current,
      expenses: current.expenses.map(e => e.id === expenseId ? { ...e, ...updated } : e),
    });
  };

  // Delete Expense
  const deleteExpense = (branchId: BranchId, expenseId: string) => {
    const current = getRecord(branchId, selectedDate);
    updateRecord({
      ...current,
      expenses: current.expenses.filter(e => e.id !== expenseId),
    });
  };

  // Calculate profit and drawer cash balance
  const calculateBranchProfit = (record: BranchDailyRecord): DailyProfitCalculation => {
    const totalSales = 
      (record.sales.delivery || 0) +
      (record.sales.phonePe || 0) +
      (record.sales.cardMachine || 0) +
      (record.sales.cash || 0) +
      (record.sales.otherSales || 0);

    const totalExpenses = record.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const netProfit = totalSales - totalExpenses;
    const isProfit = netProfit >= 0;
    const profitMarginPercent = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
    const cashCollected = record.sales.cash || 0;
    const drawerCashBalance = cashCollected - totalExpenses;

    return {
      totalSales,
      totalExpenses,
      netProfit,
      isProfit,
      profitMarginPercent,
      cashCollected,
      cashExpenses: totalExpenses,
      drawerCashBalance,
    };
  };

  // Chain totals
  const calculateChainTotals = (date: string) => {
    let totalSales = 0;
    let totalExpenses = 0;
    let totalDelivery = 0;
    let totalPhonePe = 0;
    let totalCard = 0;
    let totalCounterCash = 0;

    BANGALORE_BRANCHES.forEach(b => {
      const rec = getRecord(b.id, date);
      const calc = calculateBranchProfit(rec);
      totalSales += calc.totalSales;
      totalExpenses += calc.totalExpenses;
      totalDelivery += rec.sales.delivery || 0;
      totalPhonePe += rec.sales.phonePe || 0;
      totalCard += rec.sales.cardMachine || 0;
      totalCounterCash += rec.sales.cash || 0;
    });

    return {
      totalSales,
      totalExpenses,
      totalProfit: totalSales - totalExpenses,
      totalCashBalance: totalCounterCash - totalExpenses,
      totalDelivery,
      totalPhonePe,
      totalCard,
      totalCounterCash,
    };
  };

  const resetToZero = () => {
    localStorage.removeItem(STORAGE_KEY);
    const initial: Record<string, BranchDailyRecord> = {};
    const today = getTodayDateString();
    BANGALORE_BRANCHES.forEach(b => {
      const rec = createFreshZeroRecord(b.id, today);
      initial[rec.id] = rec;
    });
    setRecords(initial);
  };

  const exportDataJSON = () => {
    return JSON.stringify(records, null, 2);
  };

  return (
    <RestaurantContext.Provider
      value={{
        branches: BANGALORE_BRANCHES,
        activeBranchId,
        setActiveBranchId,
        selectedDate,
        setSelectedDate,
        records,
        getRecord,
        updateRecord,
        updateItemRow,
        addItemRow,
        deleteItemRow,
        updateSales,
        addExpense,
        updateExpense,
        deleteExpense,
        calculateBranchProfit,
        calculateChainTotals,
        resetToZero,
        exportDataJSON,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
