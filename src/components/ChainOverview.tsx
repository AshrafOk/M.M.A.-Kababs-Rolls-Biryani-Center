import React from 'react';
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
  UtensilsCrossed
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { BranchId } from '../types/restaurant';

interface Props {
  onSelectBranch: (id: BranchId) => void;
}

export const ChainOverview: React.FC<Props> = ({ onSelectBranch }) => {
  const { branches, selectedDate, getRecord, calculateBranchProfit, calculateChainTotals, resetToZero } = useRestaurant();

  const chainTotals = calculateChainTotals(selectedDate);
  const totalSales = chainTotals.totalSales;
  const totalExpenses = chainTotals.totalExpenses;
  const netProfit = chainTotals.totalProfit;
  const isChainProfit = netProfit >= 0;
  const marginPercent = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

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
            <div className="flex items-center gap-2">
              <div className="text-xs text-stone-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                Date: <span className="font-bold text-white font-mono">{selectedDate}</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Reset all branch records to 00 for a completely fresh start?')) {
                    resetToZero();
                  }
                }}
                className="px-3 py-1 bg-white/10 hover:bg-rose-500/30 border border-white/20 text-stone-300 hover:text-white rounded-full text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer flex items-center gap-1.5"
                title="Wipe and start from 00"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 00</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                M.M.A. Kababs Rolls & Biryani Center
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Daily branch sales, manual purchases, stock tally, and live profit/kharcha calculation across Bangalore.
              </p>
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

                  {/* Stock Counts Preview */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-stone-600">
                      <span>🍗 Meat Items Entered:</span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {rec.meatItems.length} rows
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>🌾 Grocery Items:</span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {rec.groceryItems.length} rows
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>🥛 Dairy Items:</span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {rec.dairyItems.length} rows
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>🥕 Vegetables:</span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {rec.vegetableItems.length} rows
                      </span>
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
