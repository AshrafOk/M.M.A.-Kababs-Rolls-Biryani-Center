import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BranchDailyRecord, 
  BranchId, 
  BranchInfo, 
  SalesChannelBreakdown, 
  ExpenseItem, 
  InventoryItemRow,
  DailyProfitCalculation,
  AuthSession,
  PasswordStore
} from '../types/restaurant';
import { 
  BANGALORE_BRANCHES, 
  createFreshZeroRecord, 
  getTodayDateString,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_BRANCH_PASSWORDS,
  isDateLockedForManager 
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

  // Database Backup & Restore
  exportDatabaseFile: () => void;
  restoreDatabaseFromFile: (jsonString: string) => { success: boolean; message: string; recordCount?: number };
  exportChainDailyCSV: (date: string) => void;
  exportDataJSON: () => string;

  // Authentication & Security
  authSession: AuthSession | null;
  passwords: PasswordStore;
  loginAsAdmin: (password: string) => { success: boolean; message: string };
  loginAsManager: (branchId: BranchId, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateAdminPassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  resetBranchPasswordByAdmin: (branchId: BranchId, newPassword: string) => { success: boolean; message: string };
  updateBranchPasswordByManager: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  isCurrentRecordEditable: (recordDate: string) => { canEdit: boolean; reason?: string };
}

const STORAGE_KEY = 'mma_kababs_records_fresh_v2';
const AUTH_SESSION_KEY = 'mma_auth_session_v2';
const PASSWORDS_KEY = 'mma_passwords_v2';

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [activeBranchId, setActiveBranchId] = useState<BranchId | 'all'>('all');

  // Authentication State
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Passwords State
  const [passwords, setPasswords] = useState<PasswordStore>(() => {
    try {
      const stored = localStorage.getItem(PASSWORDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.admin && parsed.branches) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {
      admin: DEFAULT_ADMIN_PASSWORD,
      branches: { ...DEFAULT_BRANCH_PASSWORDS },
    };
  });

  // Save passwords whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
    } catch {
      // ignore
    }
  }, [passwords]);

  // Save auth session whenever updated
  useEffect(() => {
    try {
      if (authSession) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession));
      } else {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch {
      // ignore
    }
  }, [authSession]);

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

  // Login as Admin
  const loginAsAdmin = (password: string) => {
    if (password === passwords.admin) {
      const session: AuthSession = {
        role: 'admin',
        branchId: null,
        displayName: 'Owner / Chain Admin',
        loginTime: new Date().toISOString(),
      };
      setAuthSession(session);
      setActiveBranchId('all');
      return { success: true, message: 'Welcome back, Admin!' };
    }
    return { success: false, message: 'Incorrect Admin password. Please try again.' };
  };

  // Login as Branch Manager
  const loginAsManager = (branchId: BranchId, password: string) => {
    const branch = BANGALORE_BRANCHES.find(b => b.id === branchId);
    if (!branch) return { success: false, message: 'Branch not found' };

    const expectedPassword = passwords.branches[branchId] || DEFAULT_BRANCH_PASSWORDS[branchId];
    if (password === expectedPassword) {
      const session: AuthSession = {
        role: 'manager',
        branchId,
        displayName: `${branch.name} (Manager)`,
        loginTime: new Date().toISOString(),
      };
      setAuthSession(session);
      setActiveBranchId(branchId);
      return { success: true, message: `Logged in to ${branch.name}` };
    }
    return { success: false, message: `Incorrect password for ${branch.name}. Contact Admin to reset.` };
  };

  // Logout
  const logout = () => {
    setAuthSession(null);
  };

  // Admin updates their own password
  const updateAdminPassword = (oldPassword: string, newPassword: string) => {
    if (oldPassword !== passwords.admin) {
      return { success: false, message: 'Current Admin password is incorrect.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }
    setPasswords(prev => ({
      ...prev,
      admin: newPassword,
    }));
    return { success: true, message: 'Admin password updated successfully!' };
  };

  // Admin resets any branch manager's password
  const resetBranchPasswordByAdmin = (branchId: BranchId, newPassword: string) => {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Branch password must be at least 4 characters.' };
    }
    const branch = BANGALORE_BRANCHES.find(b => b.id === branchId);
    setPasswords(prev => ({
      ...prev,
      branches: {
        ...prev.branches,
        [branchId]: newPassword,
      },
    }));
    return { success: true, message: `Password for ${branch?.name} updated successfully!` };
  };

  // Manager updates their own branch password
  const updateBranchPasswordByManager = (oldPassword: string, newPassword: string) => {
    if (!authSession || authSession.role !== 'manager' || !authSession.branchId) {
      return { success: false, message: 'Only logged-in branch managers can update branch password.' };
    }
    const branchId = authSession.branchId;
    const currentPass = passwords.branches[branchId];
    if (oldPassword !== currentPass) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }
    setPasswords(prev => ({
      ...prev,
      branches: {
        ...prev.branches,
        [branchId]: newPassword,
      },
    }));
    return { success: true, message: 'Your branch password has been updated!' };
  };

  // Time-lock check:
  // Manager can only modify entries of date D until next day (D + 1) at 06:00:00 AM.
  // After that, data is locked and stored. Admin can edit any date anytime!
  const isCurrentRecordEditable = (recordDate: string) => {
    if (!authSession) {
      return { canEdit: false, reason: 'Please log in to edit records.' };
    }
    if (authSession.role === 'admin') {
      return { canEdit: true }; // Admin override: can edit any date anytime!
    }
    // For manager: check 6:00 AM cutoff
    const isLocked = isDateLockedForManager(recordDate);
    if (isLocked) {
      return { 
        canEdit: false, 
        reason: '🔒 Time Lock Active: Entries can only be modified until 6:00 AM the next morning. This date is now locked & stored. Only Admin can modify historical records.' 
      };
    }
    return { canEdit: true };
  };

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

  // Download entire database JSON backup file
  const exportDatabaseFile = () => {
    const backupPayload = {
      app: 'M.M.A. Kababs Rolls & Biryani Center',
      version: 2,
      backupDate: new Date().toISOString(),
      branchesCount: BANGALORE_BRANCHES.length,
      recordsCount: Object.keys(records).length,
      records,
    };
    const json = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mma_kababs_database_backup_${getTodayDateString()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Restore database from uploaded/pasted JSON backup file
  const restoreDatabaseFromFile = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      let targetRecords: Record<string, BranchDailyRecord> | null = null;

      if (parsed && typeof parsed === 'object') {
        if (parsed.records && typeof parsed.records === 'object') {
          targetRecords = parsed.records;
        } else {
          // Direct records map format
          targetRecords = parsed;
        }
      }

      if (!targetRecords || typeof targetRecords !== 'object' || Object.keys(targetRecords).length === 0) {
        return { success: false, message: 'Invalid backup file format: No branch records detected.' };
      }

      setRecords(targetRecords);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(targetRecords));
      } catch {
        // storage quota
      }

      const count = Object.keys(targetRecords).length;
      return { 
        success: true, 
        message: `Database successfully restored! Loaded ${count} branch day records.`,
        recordCount: count 
      };
    } catch {
      return { success: false, message: 'Failed to parse JSON file. Please ensure it is a valid backup file.' };
    }
  };

  // Date-wise All Branches Daily CSV Export
  const exportChainDailyCSV = (date: string) => {
    const headers = [
      'Date',
      'Branch Name',
      'Area',
      'Manager',
      'Total Sales (INR)',
      'Delivery Sales (INR)',
      'PhonePe UPI Sales (INR)',
      'Card POS Sales (INR)',
      'Counter Cash (INR)',
      'Other Sales (INR)',
      'Total Kharcha / Expenses (INR)',
      'Net Profit / Loss (INR)',
      'Profit Margin (%)',
      'Drawer Cash in Hand BAL (INR)',
      'Raw Chicken Bought',
      'Raw Chicken Stock',
      'Tandoori Stock (pcs)',
      'Biryani Rice Stock (bags)',
      'Curd Stock (L)',
      'Onions Stock (kg)',
      'Manager Remarks',
    ];

    const rows = BANGALORE_BRANCHES.map(b => {
      const rec = getRecord(b.id, date);
      const calc = calculateBranchProfit(rec);
      const chickenItem = rec.meatItems.find(m => m.name.toLowerCase().includes('raw') || m.name.toLowerCase().includes('chicken'));
      const tandooriItem = rec.meatItems.find(m => m.name.toLowerCase().includes('tandoori'));
      const riceItem = rec.groceryItems.find(g => g.name.toLowerCase().includes('biryani'));
      const curdItem = rec.dairyItems.find(d => d.name.toLowerCase().includes('curd'));
      const onionItem = rec.vegetableItems.find(v => v.name.toLowerCase().includes('onion'));

      return [
        `"${date}"`,
        `"${b.name}"`,
        `"${b.area}"`,
        `"${rec.enteredBy || b.managerName}"`,
        calc.totalSales,
        rec.sales.delivery || 0,
        rec.sales.phonePe || 0,
        rec.sales.cardMachine || 0,
        rec.sales.cash || 0,
        rec.sales.otherSales || 0,
        calc.totalExpenses,
        calc.netProfit,
        `"${calc.profitMarginPercent.toFixed(1)}%"`,
        calc.drawerCashBalance,
        chickenItem ? `${chickenItem.purchased} ${chickenItem.unit}` : '0 kg',
        chickenItem ? `${chickenItem.stock} ${chickenItem.unit}` : '0 kg',
        tandooriItem ? `${tandooriItem.stock} pcs` : '0 pcs',
        riceItem ? `${riceItem.stock} bags` : '0 bags',
        curdItem ? `${curdItem.stock} L` : '0 L',
        onionItem ? `${onionItem.stock} kg` : '0 kg',
        `"${(rec.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // Add Chain Grand Totals Row
    const chain = calculateChainTotals(date);
    const totalsRow = [
      `"${date} TOTALS"`,
      `"ALL 6 BRANCHES BANGALORE"`,
      `"Chain Summary"`,
      `"Consolidated"`,
      chain.totalSales,
      chain.totalDelivery,
      chain.totalPhonePe,
      chain.totalCard,
      chain.totalCounterCash,
      0,
      chain.totalExpenses,
      chain.totalProfit,
      chain.totalSales > 0 ? `"${((chain.totalProfit / chain.totalSales) * 100).toFixed(1)}%"` : '"0%"',
      chain.totalCashBalance,
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      `"Total Bangalore Operations for ${date}"`,
    ].join(',');

    const csvContent = [headers.join(','), ...rows, totalsRow].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MMA_Kababs_All_Branches_Daily_Report_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        exportDatabaseFile,
        restoreDatabaseFromFile,
        exportChainDailyCSV,
        exportDataJSON,
        authSession,
        passwords,
        loginAsAdmin,
        loginAsManager,
        logout,
        updateAdminPassword,
        resetBranchPasswordByAdmin,
        updateBranchPasswordByManager,
        isCurrentRecordEditable,
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
