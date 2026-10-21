import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Coins, 
  Receipt, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  Utensils,
  Milk,
  Carrot,
  Package,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { BranchId, InventoryItemRow } from '../types/restaurant';
import { COMMON_EXPENSE_PRESETS } from '../data/mockData';
import { BranchSalesTrendChart } from './BranchSalesTrendChart';
import { calculateCategoryTotals } from '../utils/inventoryAnalytics';

interface Props {
  branchId: BranchId;
  onOpenPasswordModal?: () => void;
}

export const BranchDailyLedger: React.FC<Props> = ({ branchId, onOpenPasswordModal }) => {
  const { 
    branches, 
    selectedDate, 
    setSelectedDate,
    records,
    getRecord, 
    updateItemRow, 
    addItemRow, 
    deleteItemRow, 
    updateSales, 
    addExpense, 
    updateExpense, 
    deleteExpense,
    updateRecord,
    calculateBranchProfit,
    authSession,
    isCurrentRecordEditable,
    seedDemoHistory
  } = useRestaurant();

  const currentBranch = branches.find(b => b.id === branchId) || branches[0];
  const record = getRecord(branchId, selectedDate);
  const profitCalc = calculateBranchProfit(record);

  // Live category totals for purchased and stock KG
  const meatTotals = calculateCategoryTotals(record.meatItems, 'meat');
  const groceryTotals = calculateCategoryTotals(record.groceryItems, 'grocery');
  const dairyTotals = calculateCategoryTotals(record.dairyItems, 'dairy');
  const vegetableTotals = calculateCategoryTotals(record.vegetableItems, 'vegetable');

  const { canEdit, reason: lockReason } = isCurrentRecordEditable(selectedDate);
  const isAdmin = authSession?.role === 'admin';

  // States for adding custom item rows
  const [newMeatName, setNewMeatName] = useState('');
  const [newMeatUnit, setNewMeatUnit] = useState('kg');
  const [showAddMeat, setShowAddMeat] = useState(false);

  const [newGroceryName, setNewGroceryName] = useState('');
  const [newGroceryUnit, setNewGroceryUnit] = useState('bags');
  const [showAddGrocery, setShowAddGrocery] = useState(false);

  const [newDairyName, setNewDairyName] = useState('');
  const [newDairyUnit, setNewDairyUnit] = useState('litres');
  const [showAddDairy, setShowAddDairy] = useState(false);

  const [newVegName, setNewVegName] = useState('');
  const [newVegUnit, setNewVegUnit] = useState('kg');
  const [showAddVeg, setShowAddVeg] = useState(false);

  // State for adding expense row
  const [expParticular, setExpParticular] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<'staff' | 'groceries' | 'utilities' | 'miscellaneous' | 'meat' | 'vegetables'>('miscellaneous');
  const [expNote, setExpNote] = useState('');

  // WhatsApp copied status
  const [copied, setCopied] = useState(false);

  // Handlers for adding custom rows
  const handleAddMeatRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeatName.trim()) return;
    addItemRow(branchId, 'meatItems', {
      name: newMeatName.trim(),
      purchased: 0,
      stock: 0,
      unit: newMeatUnit,
    });
    setNewMeatName('');
    setShowAddMeat(false);
  };

  const handleAddGroceryRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryName.trim()) return;
    addItemRow(branchId, 'groceryItems', {
      name: newGroceryName.trim(),
      purchased: 0,
      stock: 0,
      unit: newGroceryUnit,
    });
    setNewGroceryName('');
    setShowAddGrocery(false);
  };

  const handleAddDairyRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDairyName.trim()) return;
    addItemRow(branchId, 'dairyItems', {
      name: newDairyName.trim(),
      purchased: 0,
      stock: 0,
      unit: newDairyUnit,
    });
    setNewDairyName('');
    setShowAddDairy(false);
  };

  const handleAddVegRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVegName.trim()) return;
    addItemRow(branchId, 'vegetableItems', {
      name: newVegName.trim(),
      purchased: 0,
      stock: 0,
      unit: newVegUnit,
    });
    setNewVegName('');
    setShowAddVeg(false);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expParticular.trim() || !expAmount) return;
    addExpense(branchId, {
      particular: expParticular.trim().toUpperCase(),
      amount: Number(expAmount) || 0,
      category: expCategory,
      note: expNote.trim() || undefined,
    });
    setExpParticular('');
    setExpAmount('');
    setExpNote('');
  };

  // WhatsApp formatted report
  const generateWhatsAppReport = () => {
    return `*🍗 M.M.A. KABABS ROLLS & BIRYANI CENTER*
*📍 BRANCH: ${currentBranch.name.toUpperCase()}*
*📅 DATE: ${record.date}*
*👤 MANAGER: ${record.enteredBy || currentBranch.managerName}*
━━━━━━━━━━━━━━━━━━━━
*💰 DAILY SALES COLLECTION:*
• 🛵 Delivery (Swiggy/Zomato): ₹${(record.sales.delivery || 0).toLocaleString('en-IN')}
• 📱 PhonePe / UPI: ₹${(record.sales.phonePe || 0).toLocaleString('en-IN')}
• 💳 Card Machine: ₹${(record.sales.cardMachine || 0).toLocaleString('en-IN')}
• 💵 Counter Cash: ₹${(record.sales.cash || 0).toLocaleString('en-IN')}
${record.sales.otherSales ? `• Direct/Other: ₹${record.sales.otherSales.toLocaleString('en-IN')}\n` : ''}*👉 TOTAL SALES: ₹${profitCalc.totalSales.toLocaleString('en-IN')}*
━━━━━━━━━━━━━━━━━━━━
*💸 DAILY EXPENSES (KHARCHA):*
${record.expenses.length > 0 ? record.expenses.map(e => `• ${e.particular}: ₹${e.amount.toLocaleString('en-IN')} ${e.note ? `(${e.note})` : ''}`).join('\n') : '• No expenses recorded'}
*👉 TOTAL KHARCHA: ₹${profitCalc.totalExpenses.toLocaleString('en-IN')}*
━━━━━━━━━━━━━━━━━━━━
*📊 PROFIT / LOSS CALCULATION:*
*👉 NET ${profitCalc.isProfit ? 'PROFIT' : 'LOSS'}: ₹${profitCalc.netProfit.toLocaleString('en-IN')}* (${profitCalc.profitMarginPercent.toFixed(1)}% margin)
*💵 CLOSING DRAWER CASH: ₹${profitCalc.drawerCashBalance.toLocaleString('en-IN')}*
━━━━━━━━━━━━━━━━━━━━
*🍗 STOCK HIGHLIGHTS:*
${record.meatItems.slice(0, 4).map(m => `• ${m.name}: Bought ${m.purchased}${m.unit} | Stock ${m.stock}${m.unit}`).join('\n')}
• Biryani Rice: Bought ${record.groceryItems.find(g => g.name.includes('Biryani'))?.purchased || 0} bags | Stock ${record.groceryItems.find(g => g.name.includes('Biryani'))?.stock || 0} bags
• Curd: Stock ${record.dairyItems.find(d => d.name.includes('Curd'))?.stock || 0} L
• Onions: Stock ${record.vegetableItems.find(v => v.name.includes('Onion'))?.stock || 0} kg
━━━━━━━━━━━━━━━━━━━━
_${record.notes || 'Daily manual branch entry verified by manager.'}_`;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppReport();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Branch Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {currentBranch.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                {currentBranch.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Daily Manual Entry Sheet
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              📍 {currentBranch.address}
            </p>
          </div>
        </div>

        {/* Manager Input & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-stone-500 font-medium">Manager:</span>
            <input
              type="text"
              value={record.enteredBy}
              onChange={(e) => updateRecord({ ...record, enteredBy: e.target.value })}
              className="bg-transparent font-bold text-stone-900 focus:outline-none w-32 border-b border-stone-300"
              placeholder="Manager Name"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyWhatsApp}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-800 hover:bg-stone-900 text-white'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(generateWhatsAppReport())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
              title="Open directly in WhatsApp Web or WhatsApp mobile app"
            >
              <span>📲 Share on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Security & Time-Lock Alert Banner */}
      {!canEdit && (
        <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-sm animate-fade-in">
          <div className="p-2 bg-amber-200/70 text-amber-900 rounded-xl shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-sm text-amber-900">🔒 Historical Date Locked (Read-Only)</div>
            <p className="mt-1 text-amber-800 leading-relaxed">
              As per restaurant management policy, daily stock and expense entries can only be modified until <strong>6:00 AM the next morning</strong>. This day's records ({selectedDate}) are now securely stored. Only the Admin can make changes if needed.
            </p>
          </div>
        </div>
      )}

      {canEdit && isAdmin && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-950 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-bold">👑 Admin Historical Override Active:</span>
            <span>You have full administrative privileges to edit any date's data.</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
            Unlocked
          </span>
        </div>
      )}

      {/* Real-time Profit & Loss and Cash Balance Calculator Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Sales */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Total Sales Collection
          </span>
          <div className="text-2xl font-black text-stone-900 mt-1 font-mono">
            ₹{profitCalc.totalSales.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Delivery + UPI + Card + Cash
          </span>
        </div>

        {/* Total Expenses / Kharcha */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Total Kharcha (Expenses)
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
            ₹{profitCalc.totalExpenses.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {record.expenses.length} expense items entered
          </span>
        </div>

        {/* Calculated Net Profit / Loss */}
        <div className={`p-4 rounded-xl border shadow-sm ${profitCalc.isProfit ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50/70 border-rose-300'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${profitCalc.isProfit ? 'text-emerald-800' : 'text-rose-800'}`}>
              Net Daily {profitCalc.isProfit ? 'Profit' : 'Loss'}
            </span>
            {profitCalc.isProfit ? (
              <span className="p-1 bg-emerald-200 text-emerald-800 rounded">
                <TrendingUp className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1 bg-rose-200 text-rose-800 rounded">
                <TrendingDown className="w-4 h-4" />
              </span>
            )}
          </div>
          <div className={`text-2xl font-black mt-1 font-mono ${profitCalc.isProfit ? 'text-emerald-800' : 'text-rose-800'}`}>
            ₹{profitCalc.netProfit.toLocaleString('en-IN')}
          </div>
          <span className={`text-[11px] font-semibold mt-1 block ${profitCalc.isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
            {profitCalc.profitMarginPercent.toFixed(1)}% profit margin
          </span>
        </div>

        {/* Drawer Cash in Hand (BAL) */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Drawer Cash (BAL)
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
              Cash - Kharcha
            </span>
          </div>
          <div className={`text-2xl font-black mt-1 font-mono ${profitCalc.drawerCashBalance >= 0 ? 'text-stone-900' : 'text-rose-700'}`}>
            ₹{profitCalc.drawerCashBalance.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Counter Cash: ₹{profitCalc.cashCollected.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Branch Sales Performance Graph (Default: Last 7 Days, Customizable: Weekly/Monthly/Yearly) */}
      <BranchSalesTrendChart
        branchId={branchId}
        branchName={currentBranch.name}
        selectedDate={selectedDate}
        records={records}
        getRecord={getRecord}
        calculateBranchProfit={calculateBranchProfit}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
      />

      {/* SECTION 1: DAILY SALES INFLOW */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">1. Daily Sales Entry (By Payment Channel)</h3>
              <p className="text-xs text-stone-500">Managers can type actual collections directly below:</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-500 block">Total Calculated</span>
            <span className="text-lg font-black text-emerald-800 font-mono">₹{profitCalc.totalSales.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Delivery */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <label className="text-xs font-bold text-stone-700 block">🛵 Delivery (Swiggy / Zomato)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">₹</span>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={record.sales.delivery || ''}
                placeholder="00"
                onChange={(e) => updateSales(branchId, { delivery: Number(e.target.value) || 0 })}
                className="w-full pl-6 pr-2 py-1.5 text-right font-black text-stone-900 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* PhonePe / UPI */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <label className="text-xs font-bold text-stone-700 block">📱 PhonePe / UPI (P PAY)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">₹</span>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={record.sales.phonePe || ''}
                placeholder="00"
                onChange={(e) => updateSales(branchId, { phonePe: Number(e.target.value) || 0 })}
                className="w-full pl-6 pr-2 py-1.5 text-right font-black text-stone-900 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Card Machine POS */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <label className="text-xs font-bold text-stone-700 block">💳 POS Machine (MACHIN-)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">₹</span>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={record.sales.cardMachine || ''}
                placeholder="00"
                onChange={(e) => updateSales(branchId, { cardMachine: Number(e.target.value) || 0 })}
                className="w-full pl-6 pr-2 py-1.5 text-right font-black text-stone-900 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Cash Counter */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-300 space-y-1">
            <label className="text-xs font-bold text-emerald-950 block">💵 Counter Cash (CASH)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-emerald-600 font-bold text-xs">₹</span>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={record.sales.cash || ''}
                placeholder="00"
                onChange={(e) => updateSales(branchId, { cash: Number(e.target.value) || 0 })}
                className="w-full pl-6 pr-2 py-1.5 text-right font-black text-emerald-950 bg-white border border-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Other / Direct */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <label className="text-xs font-bold text-stone-700 block">📦 Catering / Other Sales</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">₹</span>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={record.sales.otherSales || ''}
                placeholder="00"
                onChange={(e) => updateSales(branchId, { otherSales: Number(e.target.value) || 0 })}
                className="w-full pl-6 pr-2 py-1.5 text-right font-black text-stone-900 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: 4 DEDICATED INVENTORY COLUMNS WITH MANUAL ROW ADDITION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-700" />
              <span>2. Daily Purchases & Stock Register (Custom Rows Allowed)</span>
            </h3>
            <p className="text-xs text-stone-500">
              Enter how many items were purchased today, how many are in stock tonight, and freely add/remove custom rows:
            </p>
          </div>
        </div>

        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          
          {/* COLUMN 1: CHICKEN & MEAT ITEMS */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="font-bold text-sm text-stone-900">🍗 Chicken & Meat</h4>
              </div>
              {canEdit && (
                <button
                  onClick={() => setShowAddMeat(!showAddMeat)}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Row</span>
                </button>
              )}
            </div>

            {/* Quick Add Form */}
            {canEdit && showAddMeat && (
              <form onSubmit={handleAddMeatRow} className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs">
                <div className="font-bold text-amber-950">Add Custom Meat Item:</div>
                <input
                  type="text"
                  placeholder="Item Name (e.g. Mutton Curry Cut)"
                  value={newMeatName}
                  onChange={(e) => setNewMeatName(e.target.value)}
                  className="w-full p-1.5 border border-amber-300 rounded bg-white text-xs"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newMeatUnit}
                    onChange={(e) => setNewMeatUnit(e.target.value)}
                    className="p-1 border border-amber-300 rounded bg-white text-xs font-semibold"
                  >
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="birds">birds</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs ml-auto cursor-pointer"
                  >
                    Save Row
                  </button>
                </div>
              </form>
            )}

            {/* Meat Rows */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-center">Purchased</div>
                <div className="col-span-3 text-center">In Stock</div>
              </div>

              {record.meatItems.map((item) => (
                <div key={item.id} className="p-2 rounded-xl border border-stone-100 bg-stone-50/70 hover:bg-amber-50/40 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-800">{item.name}</span>
                    {canEdit && (
                      <button
                        onClick={() => deleteItemRow(branchId, 'meatItems', item.id)}
                        className="text-stone-300 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Delete row"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Bought ({item.unit})</span>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEdit}
                        value={item.purchased || ''}
                        placeholder="00"
                        onChange={(e) => updateItemRow(branchId, 'meatItems', item.id, 'purchased', Number(e.target.value) || 0)}
                        className="w-full p-1 border border-stone-300 rounded bg-white font-bold text-right text-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Stock ({item.unit})</span>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEdit}
                        value={item.stock || ''}
                        placeholder="00"
                        onChange={(e) => updateItemRow(branchId, 'meatItems', item.id, 'stock', Number(e.target.value) || 0)}
                        className="w-full p-1 border border-stone-300 rounded bg-white font-bold text-right text-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Meat KG Footer */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs bg-amber-50/70 p-2 rounded-xl">
              <span className="font-bold text-amber-950 text-[11px]">Total Chicken / Meat:</span>
              <div className="font-mono text-xs font-bold text-right flex items-center gap-1">
                <span className="text-emerald-800 font-black bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300/60" title="Purchased Today">
                  {meatTotals.purchasedDisplay}
                </span>
                <span className="text-stone-300">|</span>
                <span className="text-amber-900 font-black bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/60" title="Stock Tonight">
                  {meatTotals.stockDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: GROCERY & STAPLES */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-sm text-stone-900">🌾 Grocery & Rice</h4>
              </div>
              {canEdit && (
                <button
                  onClick={() => setShowAddGrocery(!showAddGrocery)}
                  className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Row</span>
                </button>
              )}
            </div>

            {/* Quick Add Form */}
            {canEdit && showAddGrocery && (
              <form onSubmit={handleAddGroceryRow} className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs">
                <div className="font-bold text-emerald-950">Add Custom Grocery:</div>
                <input
                  type="text"
                  placeholder="Item Name (e.g. Basmati Rice 25kg)"
                  value={newGroceryName}
                  onChange={(e) => setNewGroceryName(e.target.value)}
                  className="w-full p-1.5 border border-emerald-300 rounded bg-white text-xs"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newGroceryUnit}
                    onChange={(e) => setNewGroceryUnit(e.target.value)}
                    className="p-1 border border-emerald-300 rounded bg-white text-xs font-semibold"
                  >
                    <option value="bags">bags</option>
                    <option value="kg">kg</option>
                    <option value="tins">tins</option>
                    <option value="pkts">pkts</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs ml-auto cursor-pointer"
                  >
                    Save Row
                  </button>
                </div>
              </form>
            )}

            {/* Grocery Rows */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-center">Purchased</div>
                <div className="col-span-3 text-center">In Stock</div>
              </div>

              {record.groceryItems.map((item) => (
                <div key={item.id} className="p-2 rounded-xl border border-stone-100 bg-stone-50/70 hover:bg-emerald-50/40 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-800">{item.name}</span>
                    {canEdit && (
                      <button
                        onClick={() => deleteItemRow(branchId, 'groceryItems', item.id)}
                        className="text-stone-300 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Delete row"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Bought ({item.unit})</span>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEdit}
                        value={item.purchased || ''}
                        placeholder="00"
                        onChange={(e) => updateItemRow(branchId, 'groceryItems', item.id, 'purchased', Number(e.target.value) || 0)}
                        className="w-full p-1 border border-stone-300 rounded bg-white font-bold text-right text-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Stock ({item.unit})</span>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEdit}
                        value={item.stock || ''}
                        placeholder="00"
                        onChange={(e) => updateItemRow(branchId, 'groceryItems', item.id, 'stock', Number(e.target.value) || 0)}
                        className="w-full p-1 border border-stone-300 rounded bg-white font-bold text-right text-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Grocery KG Footer */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs bg-emerald-50/70 p-2 rounded-xl">
              <span className="font-bold text-emerald-950 text-[11px]">Total Groceries:</span>
              <div className="font-mono text-xs font-bold text-right flex items-center gap-1">
                <span className="text-emerald-800 font-black bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300/60" title="Purchased Today">
                  {groceryTotals.purchasedDisplay}
                </span>
                <span className="text-stone-300">|</span>
                <span className="text-amber-900 font-black bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/60" title="Stock Tonight">
                  {groceryTotals.stockDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: DAIRY ITEMS (RENAMED FROM DAHI PANEER) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h4 className="font-bold text-sm text-stone-900">🥛 Dairy Items</h4>
              </div>
              {canEdit && (
                <button
                  onClick={() => setShowAddDairy(!showAddDairy)}
                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Row</span>
                </button>
              )}
            </div>

            {/* Quick Add Form */}
            {canEdit && showAddDairy && (
              <form onSubmit={handleAddDairyRow} className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 space-y-2 text-xs">
                <div className="font-bold text-blue-950">Add Custom Dairy:</div>
                <input
                  type="text"
                  placeholder="Item Name (e.g. Cheese Slices)"
                  value={newDairyName}
                  onChange={(e) => setNewDairyName(e.target.value)}
                  className="w-full p-1.5 border border-blue-300 rounded bg-white text-xs"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newDairyUnit}
                    onChange={(e) => setNewDairyUnit(e.target.value)}
                    className="p-1 border border-blue-300 rounded bg-white text-xs font-semibold"
                  >
                    <option value="litres">litres</option>
                    <option value="kg">kg</option>
                    <option value="pkts">pkts</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs ml-auto cursor-pointer"
                  >
                    Save Row
                  </button>
                </div>
              </form>
            )}

            {/* Dairy Rows */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-center">Purchased</div>
                <div className="col-span-3 text-center">In Stock</div>
              </div>

              {record.dairyItems.map((item) => (
                <div key={item.id} className="p-2 rounded-xl border border-stone-100 bg-stone-50/70 hover:bg-blue-50/40 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-800">{item.name}</span>
                    {canEdit && (
                      <button
                        onClick={() => deleteItemRow(branchId, 'dairyItems', item.id)}
                        className="text-stone-300 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Delete row"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Bought ({item.unit})</span>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEdit}
                        value={item.purchased || ''}
                        placeholder="00"
                        onChange={(e) => updateItemRow(branchId, 'dairyItems', item.id, 'purchased', Number(e.target.value) || 0)}
                        className="w-full p-1 border border-stone-300 rounded bg-white font-bold text-right text-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Stock ({item.unit})</span>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEdit}
                        value={item.stock || ''}
                        placeholder="00"
                        onChange={(e) => updateItemRow(branchId, 'dairyItems', item.id, 'stock', Number(e.target.value) || 0)}
                        className="w-full p-1 border border-stone-300 rounded bg-white font-bold text-right text-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Dairy KG/L Footer */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs bg-blue-50/70 p-2 rounded-xl">
              <span className="font-bold text-blue-950 text-[11px]">Total Dairy Items:</span>
              <div className="font-mono text-xs font-bold text-right flex items-center gap-1">
                <span className="text-emerald-800 font-black bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300/60" title="Purchased Today">
                  {dairyTotals.purchasedDisplay}
                </span>
                <span className="text-stone-300">|</span>
                <span className="text-amber-900 font-black bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/60" title="Stock Tonight">
                  {dairyTotals.stockDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 4: VEGETABLES (NEW DEDICATED SEPARATE COLUMN!) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h4 className="font-bold text-sm text-stone-900">🥕 Vegetables</h4>
              </div>
              {canEdit && (
                <button
                  onClick={() => setShowAddVeg(!showAddVeg)}
                  className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Row</span>
                </button>
              )}
            </div>

            {/* Quick Add Form */}
            {canEdit && showAddVeg && (
              <form onSubmit={handleAddVegRow} className="p-2.5 bg-orange-50 rounded-xl border border-orange-200 space-y-2 text-xs">
                <div className="font-bold text-orange-950">Add Custom Vegetable:</div>
                <input
                  type="text"
                  placeholder="Vegetable Name (e.g. Capsicum)"
                  value={newVegName}
                  onChange={(e) => setNewVegName(e.target.value)}
                  className="w-full p-1.5 border border-orange-300 rounded bg-white text-xs"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newVegUnit}
                    onChange={(e) => setNewVegUnit(e.target.value)}
                    className="p-1 border border-orange-300 rounded bg-white text-xs font-semibold"
                  >
                    <option value="kg">kg</option>
                    <option value="bunches">bunches</option>
                    <option value="pcs">pcs</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded text-xs ml-auto cursor-pointer"
                  >
                    Save Row
                  </button>
                </div>
              </form>
            )}

            {/* Vegetable Rows */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-center">Purchased</div>
                <div className="col-span-3 text-center">In Stock</div>
              </div>

              {record.vegetableItems.map((item) => (
                <div key={item.id} className="p-2 rounded-xl border border-stone-100 bg-stone-50/70 hover:bg-orange-50/40 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-800">{item.name}</span>
                    {canEdit && (
                      <button
                        onClick={() => deleteItemRow(branchId, 'vegetableItems', item.id)}
                        className="text-stone-300 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Delete row"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Bought ({item.unit})</span>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEdit}
                        value={item.purchased || ''}
                        placeholder="00"
                        onChange={(e) => updateItemRow(branchId, 'vegetableItems', item.id, 'purchased', Number(e.target.value) || 0)}
                        className="w-full p-1 border border-stone-300 rounded bg-white font-bold text-right text-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Stock ({item.unit})</span>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEdit}
                        value={item.stock || ''}
                        placeholder="00"
                        onChange={(e) => updateItemRow(branchId, 'vegetableItems', item.id, 'stock', Number(e.target.value) || 0)}
                        className="w-full p-1 border border-stone-300 rounded bg-white font-bold text-right text-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Vegetables KG Footer */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs bg-orange-50/70 p-2 rounded-xl">
              <span className="font-bold text-orange-950 text-[11px]">Total Vegetables:</span>
              <div className="font-mono text-xs font-bold text-right flex items-center gap-1">
                <span className="text-emerald-800 font-black bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300/60" title="Purchased Today">
                  {vegetableTotals.purchasedDisplay}
                </span>
                <span className="text-stone-300">|</span>
                <span className="text-amber-900 font-black bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/60" title="Stock Tonight">
                  {vegetableTotals.stockDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DAILY EXPENSES (KHARCHA) & PROFIT CALCULATION */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-800 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">3. Daily Expenses Ledger (Kharcha)</h3>
              <p className="text-xs text-stone-500">Record all staff payouts, vendor bills, electricity, water, packaging, etc.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-500 block">Total Kharcha (TOTEL)</span>
            <span className="text-xl font-black text-rose-700 font-mono">₹{profitCalc.totalExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Expense Rows List */}
        <div className="space-y-2">
          {record.expenses.map((exp) => (
            <div key={exp.id} className="flex flex-wrap items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <input
                  type="text"
                  disabled={!canEdit}
                  value={exp.particular}
                  onChange={(e) => updateExpense(branchId, exp.id, { particular: e.target.value.toUpperCase() })}
                  className="font-bold bg-white px-2 py-1 border border-stone-300 rounded text-stone-900 uppercase w-48 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <input
                  type="text"
                  disabled={!canEdit}
                  placeholder="Note / detail (optional)"
                  value={exp.note || ''}
                  onChange={(e) => updateExpense(branchId, exp.id, { note: e.target.value })}
                  className="bg-transparent px-2 py-1 text-stone-500 text-xs flex-1 border-b border-dashed border-stone-300 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-rose-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    disabled={!canEdit}
                    value={exp.amount || ''}
                    placeholder="00"
                    onChange={(e) => updateExpense(branchId, exp.id, { amount: Number(e.target.value) || 0 })}
                    className="w-28 pl-6 pr-2 py-1 text-right font-black text-rose-700 border border-stone-300 rounded bg-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                {canEdit && (
                  <button
                    onClick={() => deleteExpense(branchId, exp.id)}
                    className="text-stone-300 hover:text-rose-600 p-1 rounded cursor-pointer"
                    title="Remove expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Expense Form */}
        {canEdit && (
          <form onSubmit={handleAddExpenseSubmit} className="pt-2 p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Particular (e.g. PEMANT, WATER, GAS)"
              value={expParticular}
              onChange={(e) => setExpParticular(e.target.value)}
              className="flex-1 min-w-[160px] p-2 text-xs uppercase font-bold border border-stone-300 rounded-lg bg-white"
            />
            <div className="relative w-32">
              <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">₹</span>
              <input
                type="number"
                placeholder="00"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                className="w-full pl-6 pr-2 py-2 text-right text-xs font-bold border border-stone-300 rounded-lg bg-white"
              />
            </div>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={expNote}
              onChange={(e) => setExpNote(e.target.value)}
              className="flex-1 min-w-[160px] p-2 text-xs border border-stone-300 rounded-lg bg-white"
            />
            <button
              type="submit"
              disabled={!expParticular.trim() || !expAmount}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Kharcha Row</span>
            </button>
          </form>
        )}

        {/* Quick Presets for common expenses */}
        {canEdit && (
          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
            <span className="font-semibold text-stone-700">Quick Presets:</span>
            {COMMON_EXPENSE_PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setExpParticular(preset.split(' ')[0])}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-medium transition-colors cursor-pointer"
              >
                +{preset.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: MANAGER NOTES */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
        <label className="text-xs font-bold text-stone-700 block">
          Manager End of Day Remarks / Handover Notes:
        </label>
        <textarea
          disabled={!canEdit}
          value={record.notes || ''}
          onChange={(e) => updateRecord({ ...record, notes: e.target.value })}
          placeholder="e.g. Biryani demand was heavy; ordered 5 extra chicken packets for tomorrow morning..."
          className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-stone-50/50 disabled:opacity-60 disabled:cursor-not-allowed"
          rows={2}
        />
      </div>
    </div>
  );
};
