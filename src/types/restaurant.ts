export type BranchId = 
  | 'kundalahalli'
  | 'banaswadi'
  | 'indiranagar'
  | 'kr-puram'
  | 'balagere'
  | 'varthur';

export interface BranchInfo {
  id: BranchId;
  name: string;
  area: string;
  address: string;
  managerName: string;
  phone: string;
  color: string;
}

export interface InventoryItemRow {
  id: string;
  name: string;       // e.g. "Chicken (CK)", "Curd", "Onions"
  purchased: number;  // Purchased today (starts at 0)
  stock: number;      // Closing stock today (starts at 0)
  unit: string;       // kg, pcs, bags, tins, litres, bunches
}

export interface SalesChannelBreakdown {
  delivery: number;    // Swiggy / Zomato / Online (0)
  phonePe: number;     // PhonePe / UPI (0)
  cardMachine: number; // Card POS Machine (0)
  cash: number;        // Counter Cash (0)
  otherSales: number;  // Catering / Other direct sales (0)
}

export interface ExpenseItem {
  id: string;
  particular: string; // e.g. "Staff Payment (Pemant)", "Masala", "Current Bill", "Water", "Gas"
  amount: number;
  category: 'staff' | 'groceries' | 'utilities' | 'miscellaneous' | 'meat' | 'vegetables';
  note?: string;
}

export interface BranchDailyRecord {
  id: string;
  branchId: BranchId;
  date: string; // YYYY-MM-DD
  
  // 1. Meat & Poultry Items (Custom rows allowed)
  meatItems: InventoryItemRow[];

  // 2. Grocery & Staples (Custom rows allowed)
  groceryItems: InventoryItemRow[];

  // 3. Dairy Items (Renamed from Dahi Paneer, Custom rows allowed)
  dairyItems: InventoryItemRow[];

  // 4. Vegetables (Separate column/category, Custom rows allowed)
  vegetableItems: InventoryItemRow[];

  // 5. Daily Sales Inflow
  sales: SalesChannelBreakdown;

  // 6. Daily Expenses (Kharcha)
  expenses: ExpenseItem[];

  // Manager details & status
  enteredBy: string;
  notes?: string;
  isClosed: boolean;
  updatedAt: string;
}

export interface DailyProfitCalculation {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;       // totalSales - totalExpenses
  isProfit: boolean;
  profitMarginPercent: number;
  cashCollected: number;
  cashExpenses: number;
  drawerCashBalance: number; // cashCollected - totalExpenses
}
