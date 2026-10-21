import { BranchInfo, BranchDailyRecord, BranchId, InventoryItemRow } from '../types/restaurant';

export const RESTAURANT_NAME = "M.M.A. Kababs Rolls & Biryani Center";

export const BANGALORE_BRANCHES: BranchInfo[] = [
  {
    id: 'kundalahalli',
    name: 'Kundalahalli Gate',
    area: 'Kundalahalli Gate, ITPL Main Road',
    address: 'Near Kundalahalli Signal, Brookefield, Bengaluru 560037',
    managerName: 'Mohammad Farooq',
    phone: '+91 98450 12341',
    color: 'emerald',
  },
  {
    id: 'banaswadi',
    name: 'Banaswadi',
    area: 'HRBR Layout 2nd Block / Banaswadi Main Rd',
    address: 'Subramanya Temple St, Banaswadi, Bengaluru 560043',
    managerName: 'Syed Tanveer',
    phone: '+91 98450 12342',
    color: 'amber',
  },
  {
    id: 'indiranagar',
    name: 'Indiranagar',
    area: '100ft Road / 12th Main',
    address: 'Near CMH Hospital Road, Indiranagar, Bengaluru 560038',
    managerName: 'Arshad Khan',
    phone: '+91 98450 12343',
    color: 'indigo',
  },
  {
    id: 'kr-puram',
    name: 'KR Puram',
    area: 'Old Madras Road',
    address: 'Near KR Puram Hanging Bridge & Railway Station, Bengaluru 560036',
    managerName: 'Imran Pasha',
    phone: '+91 98450 12344',
    color: 'rose',
  },
  {
    id: 'balagere',
    name: 'Balagere Road',
    area: 'Balagere Rd, Varthur-Panathur Link',
    address: 'Balagere Main Road, Near Sobha Dream Acres, Bengaluru 560087',
    managerName: 'Nasiruddin',
    phone: '+91 98450 12345',
    color: 'cyan',
  },
  {
    id: 'varthur',
    name: 'Varthur',
    area: 'Varthur Kodi / Gunjur Road',
    address: 'Varthur Main Road, Opp Government High School, Bengaluru 560087',
    managerName: 'Rashid Ali',
    phone: '+91 98450 12346',
    color: 'orange',
  },
];

// Helper to get formatted today date
export const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// Default initial meat items - all starting at 00
export const getDefaultMeatItems = (): InventoryItemRow[] => [
  { id: 'm-1', name: 'Raw Chicken (CK)', purchased: 0, stock: 0, unit: 'kg' },
  { id: 'm-2', name: 'Chicken Pieces (CK PIC)', purchased: 0, stock: 0, unit: 'pcs' },
  { id: 'm-3', name: 'Boneless Chicken (BL)', purchased: 0, stock: 0, unit: 'kg' },
  { id: 'm-4', name: 'Tandoori Chicken (TC)', purchased: 0, stock: 0, unit: 'pcs' },
  { id: 'm-5', name: 'Grill Chicken (GC)', purchased: 0, stock: 0, unit: 'pcs' },
  { id: 'm-6', name: 'Biryani Kabab Mix (BK)', purchased: 0, stock: 0, unit: 'kg' },
];

// Default initial grocery items - all starting at 00
export const getDefaultGroceryItems = (): InventoryItemRow[] => [
  { id: 'g-1', name: 'Maida (MADA)', purchased: 0, stock: 0, unit: 'kg' },
  { id: 'g-2', name: 'Biryani Rice (B RICE)', purchased: 0, stock: 0, unit: 'bags' },
  { id: 'g-3', name: 'Fried Rice (F RICE)', purchased: 0, stock: 0, unit: 'bags' },
  { id: 'g-4', name: 'Cooking Oil (OIL)', purchased: 0, stock: 0, unit: 'tins' },
  { id: 'g-5', name: 'Bhatti Coal / Charcoal', purchased: 0, stock: 0, unit: 'bags' },
  { id: 'g-6', name: 'Biryani Spices / Masala', purchased: 0, stock: 0, unit: 'kg' },
];

// Default initial dairy items (Renamed from Dahi Paneer) - all starting at 00
export const getDefaultDairyItems = (): InventoryItemRow[] => [
  { id: 'd-1', name: 'Curd / Dahi (CURD)', purchased: 0, stock: 0, unit: 'litres' },
  { id: 'd-2', name: 'Fresh Paneer', purchased: 0, stock: 0, unit: 'kg' },
  { id: 'd-3', name: 'Milk', purchased: 0, stock: 0, unit: 'litres' },
  { id: 'd-4', name: 'Butter / Ghee', purchased: 0, stock: 0, unit: 'kg' },
];

// Default initial vegetables (New separate column!) - all starting at 00
export const getDefaultVegetableItems = (): InventoryItemRow[] => [
  { id: 'v-1', name: 'Onions (Pyaaz)', purchased: 0, stock: 0, unit: 'kg' },
  { id: 'v-2', name: 'Tomatoes', purchased: 0, stock: 0, unit: 'kg' },
  { id: 'v-3', name: 'Mint / Pudina', purchased: 0, stock: 0, unit: 'bunches' },
  { id: 'v-4', name: 'Coriander / Kothmir', purchased: 0, stock: 0, unit: 'bunches' },
  { id: 'v-5', name: 'Green Chillies', purchased: 0, stock: 0, unit: 'kg' },
  { id: 'v-6', name: 'Lemons', purchased: 0, stock: 0, unit: 'pcs' },
  { id: 'v-7', name: 'Ginger & Garlic', purchased: 0, stock: 0, unit: 'kg' },
];

// Create completely fresh zero record for any branch
export const createFreshZeroRecord = (branchId: BranchId, date: string): BranchDailyRecord => {
  const branch = BANGALORE_BRANCHES.find(b => b.id === branchId);
  return {
    id: `${branchId}-${date}`,
    branchId,
    date,
    meatItems: getDefaultMeatItems(),
    groceryItems: getDefaultGroceryItems(),
    dairyItems: getDefaultDairyItems(),
    vegetableItems: getDefaultVegetableItems(),
    sales: {
      delivery: 0,
      phonePe: 0,
      cardMachine: 0,
      cash: 0,
      otherSales: 0,
    },
    expenses: [
      { id: 'exp-1', particular: 'PEMANT (Staff Wages)', amount: 0, category: 'staff', note: '' },
      { id: 'exp-2', particular: 'XTRA (Petty Expenses)', amount: 0, category: 'miscellaneous', note: '' },
      { id: 'exp-3', particular: 'MASALA', amount: 0, category: 'groceries', note: '' },
      { id: 'exp-4', particular: 'KARANT (Electricity/Diesel)', amount: 0, category: 'utilities', note: '' },
      { id: 'exp-5', particular: 'WATER', amount: 0, category: 'utilities', note: '' },
    ],
    enteredBy: branch ? branch.managerName : 'Branch Manager',
    notes: '',
    isClosed: false,
    updatedAt: new Date().toISOString(),
  };
};

export const COMMON_EXPENSE_PRESETS = [
  'PEMANT (Staff Wage/Advance)',
  'XTRA (Petty Cash/Packaging)',
  'MASALA (Spices Top-up)',
  'CHORI / COAL (Charcoal)',
  'KARANT (Electricity/Power)',
  'WATER (Drinking Water Cans)',
  'GAS (Commercial Cylinder)',
  'VEGGIE MARKET BILL',
  'CHICKEN VENDOR PAYMENT',
  'GROCERY VENDOR PAYMENT',
  'MAIDA / FLOUR PAYMENT',
  'CLEANING & SANITATION',
];
