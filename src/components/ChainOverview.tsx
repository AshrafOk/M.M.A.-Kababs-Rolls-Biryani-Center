import React, { useMemo } from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Receipt, 
  Package, 
  Coins, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  Layers,
  UtensilsCrossed,
  Boxes
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { BranchId } from '../types/restaurant';
import { ChainSalesTrendChart } from './ChainSalesTrendChart';
import { calculateCategoryTotals, calculateChainInventoryTotals } from '../utils/inventoryAnalytics';

interface Props {
  onSelectBranch: (id: BranchId) => void;
  onOpenBackup: () => void;
  onOpenChainReport: () => void;
  onOpenPasswordModal: () => void;
  onOpenMobileInstall?: () => void;
}

export const ChainOverview: React.FC<Props> = ({ 
  onSelectBranch, 
  onOpenBackup, 
  onOpenChainReport, 
  onOpenPasswordModal,
  onOpenMobileInstall,
}) => {
  const { 
    branches, 
    selectedDate, 
    setSelectedDate,
    records,
    getRecord, 
    calculateBranchProfit, 
    calculateChainTotals, 
    exportChainDailyCSV,
    seedDemoHistory
  } = useRestaurant();

  const chainTotals = calculateChainTotals(selectedDate);
  const totalSales = chainTotals.totalSales;
  const totalExpenses = chainTotals.totalExpenses;
  const netProfit = chainTotals.totalProfit;
  const isChainProfit = netProfit >= 0;
  const marginPercent = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

  // Aggregate stock & purchases across all 6 branches
  const chainInventory = useMemo(() => {
    return calculateChainInventoryTotals(branches, selectedDate, getRecord);
  }, [branches, selectedDate, getRecord, records]);

  return (
    <div className="space-y-6">
      {/* Chain Master Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bangalore 6 Branches Network</span>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <div className="text-xs text-stone-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                Date: <span className="font-bold text-white font-mono">{selectedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
            <div className="flex items-start sm:items-center gap-4">
              <img 
                src="/logo.png" 
                alt="MMA Kababs Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl bg-black border-2 border-amber-500/40 p-1 shadow-2xl shrink-0" 
              />
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  M.M.A. Kababs Rolls & Biryani Center
                </h1>
                <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl">
                  Daily branch sales, manual purchases, stock tally, and live profit/kharcha calculation across Bangalore.
                </p>
              </div>
            </div>

            {/* Quick Export & WhatsApp Share Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => exportChainDailyCSV(selectedDate)}
                className="px-4 py-2 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                title="Export complete daily report for all 6 branches in CSV format"
              >
                <span>📊 Export Daily Report (CSV)</span>
              </button>

              <button
                onClick={onOpenChainReport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                title="Generate all-branches summary for WhatsApp"
              >
                <span>📲 Share Chain Report (WhatsApp)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Chain Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Chain Sales */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total 6-Branch Sales
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 mt-2 font-mono">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-600 flex justify-between">
            <span>Cash: ₹{chainTotals.totalCounterCash.toLocaleString('en-IN')}</span>
            <span>UPI: ₹{chainTotals.totalPhonePe.toLocaleString('en-IN')}</span>
            <span>Delivery: ₹{chainTotals.totalDelivery.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total Chain Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Chain Kharcha
            </span>
            <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2 font-mono">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-600">
            Wages, groceries, utilities & raw materials
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className={`rounded-2xl p-5 border shadow-sm ${isChainProfit ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50/70 border-rose-300'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isChainProfit ? 'text-emerald-800' : 'text-rose-800'}`}>
              Chain Net {isChainProfit ? 'Profit' : 'Loss'}
            </span>
            <div className={`p-2 rounded-xl ${isChainProfit ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
              {isChainProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <div className={`text-3xl font-black mt-2 font-mono ${isChainProfit ? 'text-emerald-900' : 'text-rose-900'}`}>
            ₹{netProfit.toLocaleString('en-IN')}
          </div>
          <div className={`mt-3 pt-3 border-t text-[11px] font-semibold ${isChainProfit ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-800'}`}>
            {totalSales > 0 ? `${marginPercent.toFixed(1)}% net operating margin` : 'Awaiting daily sales entries'}
          </div>
        </div>

        {/* Total Drawer Cash */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Drawer Cash (BAL)
            </span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 mt-2 font-mono">
            ₹{chainTotals.totalCashBalance.toLocaleString('en-IN')}
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-600">
            Counter Cash minus cash expenses across registers
          </div>
        </div>
      </div>

      {/* Chain-Wide Stock & Purchases Aggregates Across All 6 Branches */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-900 rounded-2xl border border-amber-500/30 shrink-0">
              <Boxes className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-stone-900 tracking-tight">
                  All 6 Branches Combined Stock &amp; Purchases Total
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  {selectedDate}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Consolidated daily intake (purchased) and closing stock in KG across all Bangalore outlets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 flex items-center gap-1.5 shadow-xs">
              <span>🍗 Total Chicken Bought:</span>
              <span className="font-mono text-sm font-black text-emerald-900">{chainInventory.meat.totalKgPurchased} kg</span>
            </span>
          </div>
        </div>

        {/* 4 Aggregated Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Chicken & Meat Total */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍗</span>
                  <span className="font-black text-xs uppercase tracking-wider text-amber-950">Chicken &amp; Meat</span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  6 Branches
                </span>
              </div>
              <div className="mt-2 space-y-1.5 font-mono">
                <div className="flex items-center justify-between bg-white/95 p-2 rounded-xl border border-amber-200/60 shadow-2xs">
                  <span className="text-[11px] font-sans font-bold text-stone-600">Total Bought:</span>
                  <span className="text-sm font-black text-emerald-700">
                    {chainInventory.meat.purchasedDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/95 p-2 rounded-xl border border-amber-200/60 shadow-2xs">
                  <span className="text-[11px] font-sans font-bold text-stone-600">Total Stock Left:</span>
                  <span className="text-sm font-black text-amber-800">
                    {chainInventory.meat.stockDisplay}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-stone-500 mt-2 block">
              Raw CK, Boneless, Mix, TC, GC
            </span>
          </div>

          {/* Grocery & Staples Total */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌾</span>
                  <span className="font-black text-xs uppercase tracking-wider text-emerald-950">Grocery &amp; Staples</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  6 Branches
                </span>
              </div>
              <div className="mt-2 space-y-1.5 font-mono">
                <div className="flex items-center justify-between bg-white/95 p-2 rounded-xl border border-emerald-200/60 shadow-2xs">
                  <span className="text-[11px] font-sans font-bold text-stone-600">Total Bought:</span>
                  <span className="text-sm font-black text-emerald-700">
                    {chainInventory.grocery.purchasedDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/95 p-2 rounded-xl border border-emerald-200/60 shadow-2xs">
                  <span className="text-[11px] font-sans font-bold text-stone-600">Total Stock Left:</span>
                  <span className="text-sm font-black text-amber-800">
                    {chainInventory.grocery.stockDisplay}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-stone-500 mt-2 block">
              Maida, rice bags, cooking oil, spices
            </span>
          </div>

          {/* Dairy Total */}
          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 hover:border-sky-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥛</span>
                  <span className="font-black text-xs uppercase tracking-wider text-sky-950">Dairy Products</span>
                </div>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                  6 Branches
                </span>
              </div>
              <div className="mt-2 space-y-1.5 font-mono">
                <div className="flex items-center justify-between bg-white/95 p-2 rounded-xl border border-sky-200/60 shadow-2xs">
                  <span className="text-[11px] font-sans font-bold text-stone-600">Total Bought:</span>
                  <span className="text-sm font-black text-emerald-700">
                    {chainInventory.dairy.purchasedDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/95 p-2 rounded-xl border border-sky-200/60 shadow-2xs">
                  <span className="text-[11px] font-sans font-bold text-stone-600">Total Stock Left:</span>
                  <span className="text-sm font-black text-amber-800">
                    {chainInventory.dairy.stockDisplay}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-stone-500 mt-2 block">
              Curd, fresh paneer, milk &amp; butter
            </span>
          </div>

          {/* Vegetables Total */}
          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/80 hover:border-orange-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥕</span>
                  <span className="font-black text-xs uppercase tracking-wider text-orange-950">Fresh Vegetables</span>
                </div>
                <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                  6 Branches
                </span>
              </div>
              <div className="mt-2 space-y-1.5 font-mono">
                <div className="flex items-center justify-between bg-white/95 p-2 rounded-xl border border-orange-200/60 shadow-2xs">
                  <span className="text-[11px] font-sans font-bold text-stone-600">Total Bought:</span>
                  <span className="text-sm font-black text-emerald-700">
                    {chainInventory.vegetable.purchasedDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/95 p-2 rounded-xl border border-orange-200/60 shadow-2xs">
                  <span className="text-[11px] font-sans font-bold text-stone-600">Total Stock Left:</span>
                  <span className="text-sm font-black text-amber-800">
                    {chainInventory.vegetable.stockDisplay}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-stone-500 mt-2 block">
              Pyaaz (onions), tomatoes, chillies, mint
            </span>
          </div>
        </div>
      </div>

      {/* Aggregate Sales Trend Graph with Weekly/Monthly/Yearly and 6-Branch Comparison */}
      <ChainSalesTrendChart
        selectedDate={selectedDate}
        calculateChainTotals={calculateChainTotals}
        getRecord={getRecord}
        calculateBranchProfit={calculateBranchProfit}
        branches={branches}
        records={records}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
      />

      {/* 6 Bangalore Branches Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <span>Bangalore Branches • Daily P&L & Stock Entries</span>
          </h2>
          <p className="text-xs text-stone-500">
            Click on any branch below to directly type sales, kharcha, meat, groceries, dairy items, and vegetables:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch, index) => {
            const rec = getRecord(branch.id, selectedDate);
            const calc = calculateBranchProfit(rec);
            const meatTotals = calculateCategoryTotals(rec.meatItems, 'meat');
            const groceryTotals = calculateCategoryTotals(rec.groceryItems, 'grocery');
            const dairyTotals = calculateCategoryTotals(rec.dairyItems, 'dairy');
            const vegetableTotals = calculateCategoryTotals(rec.vegetableItems, 'vegetable');

            return (
              <div
                key={branch.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-sm">
                        0{index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 text-base">
                          {branch.name}
                        </h3>
                        <p className="text-[11px] text-stone-500">{branch.area}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial numbers */}
                  <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-stone-500 block font-sans">Sales</span>
                      <span className="text-sm font-bold text-stone-900">
                        ₹{calc.totalSales.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block font-sans">Kharcha</span>
                      <span className="text-sm font-bold text-rose-600">
                        ₹{calc.totalExpenses.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block font-sans">Profit/Loss</span>
                      <span className={`text-sm font-black ${calc.isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                        ₹{calc.netProfit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Stock & Purchases Total KG Calculation (Replacing row count) */}
                  <div className="mt-3.5 pt-3 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      <span>Daily Purchases &amp; Stock</span>
                      <span className="text-[10px] lowercase text-stone-400 font-mono">
                        <span className="text-emerald-700 font-bold">bought</span> | <span className="text-amber-800 font-bold">stock</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {/* 🍗 Chicken & Meat */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50/80 border border-stone-200/70 hover:bg-stone-100/80 transition-colors">
                        <div className="flex items-center gap-1.5 font-bold text-stone-800">
                          <span>🍗</span>
                          <span className="text-xs">Chicken / Meat:</span>
                        </div>
                        <div className="text-right font-mono text-xs flex items-center gap-1">
                          <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/60" title="Purchased Today">
                            {meatTotals.purchasedDisplay}
                          </span>
                          <span className="text-stone-300">|</span>
                          <span className="font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60" title="Closing Stock">
                            {meatTotals.stockDisplay}
                          </span>
                        </div>
                      </div>

                      {/* 🌾 Grocery */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50/80 border border-stone-200/70 hover:bg-stone-100/80 transition-colors">
                        <div className="flex items-center gap-1.5 font-bold text-stone-800">
                          <span>🌾</span>
                          <span className="text-xs">Grocery Items:</span>
                        </div>
                        <div className="text-right font-mono text-xs flex items-center gap-1">
                          <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/60" title="Purchased Today">
                            {groceryTotals.purchasedDisplay}
                          </span>
                          <span className="text-stone-300">|</span>
                          <span className="font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60" title="Closing Stock">
                            {groceryTotals.stockDisplay}
                          </span>
                        </div>
                      </div>

                      {/* 🥛 Dairy */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50/80 border border-stone-200/70 hover:bg-stone-100/70 transition-colors">
                        <div className="flex items-center gap-1.5 font-bold text-stone-800">
                          <span>🥛</span>
                          <span className="text-xs">Dairy Items:</span>
                        </div>
                        <div className="text-right font-mono text-xs flex items-center gap-1">
                          <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/60" title="Purchased Today">
                            {dairyTotals.purchasedDisplay}
                          </span>
                          <span className="text-stone-300">|</span>
                          <span className="font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60" title="Closing Stock">
                            {dairyTotals.stockDisplay}
                          </span>
                        </div>
                      </div>

                      {/* 🥕 Vegetables */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50/80 border border-stone-200/70 hover:bg-stone-100/70 transition-colors">
                        <div className="flex items-center gap-1.5 font-bold text-stone-800">
                          <span>🥕</span>
                          <span className="text-xs">Vegetables:</span>
                        </div>
                        <div className="text-right font-mono text-xs flex items-center gap-1">
                          <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/60" title="Purchased Today">
                            {vegetableTotals.purchasedDisplay}
                          </span>
                          <span className="text-stone-300">|</span>
                          <span className="font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60" title="Closing Stock">
                            {vegetableTotals.stockDisplay}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manager & Action */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[11px] text-stone-500">
                    Manager: <span className="font-medium text-stone-700">{rec.enteredBy || branch.managerName}</span>
                  </div>
                  <button
                    onClick={() => onSelectBranch(branch.id)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Open Daily Entry</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
