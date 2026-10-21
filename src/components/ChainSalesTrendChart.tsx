import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Zap, 
  DollarSign, 
  Layers, 
  Award,
  Sparkles,
  GitCompare
} from 'lucide-react';
import { BranchInfo, BranchId, BranchDailyRecord, DailyProfitCalculation } from '../types/restaurant';
import { 
  TimeframeMode, 
  ViewMode, 
  DataPoint, 
  formatINR, 
  getChainTrendData, 
  BRANCH_CHART_COLORS 
} from '../utils/salesAnalytics';

interface Props {
  selectedDate: string;
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
  getRecord: (branchId: BranchId, date: string) => BranchDailyRecord;
  calculateBranchProfit: (record: BranchDailyRecord) => DailyProfitCalculation;
  branches: BranchInfo[];
  records?: Record<string, BranchDailyRecord>;
  onSelectDate?: (date: string) => void;
  onSeedDemoData?: () => void;
}

export const ChainSalesTrendChart: React.FC<Props> = ({
  selectedDate,
  calculateChainTotals,
  getRecord,
  calculateBranchProfit,
  branches,
  records = {},
  onSelectDate,
  onSeedDemoData,
}) => {
  // Customizable timeframe: weekly (7 days, default), monthly (30 days), yearly (12 months)
  const [timeframe, setTimeframe] = useState<TimeframeMode>('weekly');
  const [viewMode, setViewMode] = useState<ViewMode>('total');

  // Filter which branches are visible in "Compare 6 Branches" mode
  const [visibleBranches, setVisibleBranches] = useState<Record<BranchId, boolean>>(() => {
    const init: Record<string, boolean> = {};
    branches.forEach(b => {
      init[b.id] = true;
    });
    return init as Record<BranchId, boolean>;
  });

  const toggleBranchVisibility = (branchId: BranchId) => {
    setVisibleBranches(prev => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  // Generate trend data points
  const trendData = useMemo(() => {
    return getChainTrendData(
      timeframe,
      selectedDate,
      branches,
      records,
      calculateChainTotals,
      getRecord,
      calculateBranchProfit
    );
  }, [timeframe, selectedDate, branches, records, calculateChainTotals, getRecord, calculateBranchProfit]);

  // Compute key period aggregations
  const metrics = useMemo(() => {
    const totalSales = trendData.reduce((sum, d) => sum + d.totalSales, 0);
    const totalExpenses = trendData.reduce((sum, d) => sum + d.totalExpenses, 0);
    const netProfit = totalSales - totalExpenses;
    const count = trendData.length || 1;
    const avgSales = Math.round(totalSales / count);
    const margin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    const peak = trendData.reduce(
      (max, d) => (d.totalSales > max.totalSales ? d : max),
      trendData[0] || { totalSales: 0, label: '-', fullLabel: '-' }
    );

    // Compute top performing branch for the timeframe
    const branchTotals: Record<string, number> = {};
    branches.forEach(b => {
      branchTotals[b.id] = 0;
    });

    trendData.forEach(d => {
      Object.entries(d.branchSales).forEach(([bId, amt]) => {
        branchTotals[bId] = (branchTotals[bId] || 0) + (amt || 0);
      });
    });

    let topBranchId = branches[0]?.id || 'kundalahalli';
    let topBranchAmount = 0;
    Object.entries(branchTotals).forEach(([bId, amt]) => {
      if (amt > topBranchAmount) {
        topBranchAmount = amt;
        topBranchId = bId as BranchId;
      }
    });

    const topBranchObj = branches.find(b => b.id === topBranchId);
    const topBranchShare = totalSales > 0 ? ((topBranchAmount / totalSales) * 100).toFixed(1) : '0';

    return {
      totalSales,
      totalExpenses,
      netProfit,
      avgSales,
      margin,
      peak,
      topBranch: {
        name: topBranchObj?.name || 'Kundalahalli Gate',
        amount: topBranchAmount,
        share: topBranchShare,
        id: topBranchId,
      },
      hasData: totalSales > 0,
    };
  }, [trendData, branches]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as DataPoint;
      return (
        <div className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-stone-700/60 text-xs min-w-[230px] space-y-2">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <div>
              <span className="font-bold text-amber-400 block">{dataPoint.fullLabel || label}</span>
              <span className="text-[10px] text-stone-400">All 6 Branches Bangalore</span>
            </div>
            {dataPoint.isCurrent && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                Selected
              </span>
            )}
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <span 
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                    style={{ backgroundColor: entry.color }} 
                  />
                  <span className="truncate max-w-[130px]">{entry.name}:</span>
                </span>
                <span className="font-mono font-bold text-white shrink-0">
                  {Number(entry.value) === 0 ? '₹00' : `₹${Number(entry.value).toLocaleString('en-IN')}`}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-1.5 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
            <span>Net Chain Profit:</span>
            <span className={`font-mono font-bold ${dataPoint.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{dataPoint.netProfit.toLocaleString('en-IN')}
            </span>
          </div>

          {timeframe !== 'yearly' && (
            <div className="text-[10px] text-stone-400 text-center pt-1 border-t border-stone-800/60 italic">
              Click point to set global selected date
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const timeframeLabels: Record<TimeframeMode, string> = {
    weekly: 'Weekly (Last 7 Days)',
    monthly: 'Monthly (Last 30 Days)',
    yearly: 'Yearly (12 Months)',
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-5">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-800 text-white rounded-2xl shadow-md shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                Chain Sales Analytics & Trends
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {timeframeLabels[timeframe]}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {timeframe === 'weekly' && `Aggregate & individual sales across all 6 Bangalore branches for the last 7 days (ending ${selectedDate})`}
              {timeframe === 'monthly' && `30-day continuous sales performance across all 6 Bangalore branches (ending ${selectedDate})`}
              {timeframe === 'yearly' && `12-month consolidated revenue and branch performance trajectory`}
            </p>
          </div>
        </div>

        {/* Controls: Timeframe Selector (Weekly / Monthly / Yearly) & View Mode Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Switcher (Weekly / Monthly / Yearly) */}
          <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'weekly'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Weekly (7D)
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'monthly'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Monthly (30D)
            </button>
            <button
              onClick={() => setTimeframe('yearly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'yearly'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Yearly (12M)
            </button>
          </div>

          {/* View Mode Switcher including All 6 Branches Comparison */}
          <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('total')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'total'
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Consolidated Chain Total"
            >
              Chain Total
            </button>
            <button
              onClick={() => setViewMode('compare_branches')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'compare_branches'
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Show All 6 Branches Lines on Graph"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare 6 Branches</span>
            </button>
            <button
              onClick={() => setViewMode('profit_vs_expense')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'profit_vs_expense'
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Total Sales vs Kharcha"
            >
              Sales vs Kharcha
            </button>
            <button
              onClick={() => setViewMode('channels')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'channels'
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Payment Channels Breakdown"
            >
              Channels
            </button>
          </div>
        </div>
      </div>

      {/* 4 Dynamic Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Chain Total */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              {timeframe === 'weekly' ? '7-Day Chain Total' : timeframe === 'monthly' ? '30-Day Chain Total' : '12-Month Total'}
            </div>
            <div className="text-xl font-black text-stone-900 font-mono mt-0.5">
              {metrics.totalSales > 0 ? `₹${metrics.totalSales.toLocaleString('en-IN')}` : '₹00'}
            </div>
            <span className="text-[10px] text-stone-500">All 6 branches combined</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* Daily / Monthly Average */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              {timeframe === 'yearly' ? 'Monthly Average' : 'Daily Average'}
            </div>
            <div className="text-xl font-black text-stone-900 font-mono mt-0.5">
              {metrics.totalSales > 0 ? `₹${metrics.avgSales.toLocaleString('en-IN')}` : '₹00'}
              <span className="text-xs text-stone-400 font-normal ml-1">
                /{timeframe === 'yearly' ? 'mo' : 'day'}
              </span>
            </div>
            <span className="text-[10px] text-stone-500">Chain daily sales pace</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Peak Sales Record */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Peak {timeframe === 'yearly' ? 'Month' : 'Sales Day'}
            </div>
            <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
              {metrics.totalSales > 0 ? `₹${metrics.peak.totalSales.toLocaleString('en-IN')}` : '₹00'}
            </div>
            <span className="text-[10px] text-stone-500 truncate block max-w-[130px]">
              {metrics.totalSales > 0 ? metrics.peak.label : 'Awaiting data'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        {/* Top Performing Branch */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Top Branch {metrics.totalSales > 0 ? `(${metrics.topBranch.share}%)` : ''}
            </div>
            <div className="text-base font-black text-stone-900 truncate max-w-[140px] mt-0.5">
              {metrics.totalSales > 0 ? metrics.topBranch.name : 'All Branches (00)'}
            </div>
            <span className="text-[10px] text-emerald-700 font-bold font-mono">
              {metrics.totalSales > 0 ? `₹${metrics.topBranch.amount.toLocaleString('en-IN')}` : '₹00'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Branch Filter Chips (Active when in "Compare 6 Branches" mode) */}
      {viewMode === 'compare_branches' && (
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>Toggle Individual Branch Lines on Graph:</span>
            </span>
            <span className="text-[11px] text-stone-500">
              Click branch pill to show/hide
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {branches.map(b => {
              const theme = BRANCH_CHART_COLORS[b.id];
              const isVisible = visibleBranches[b.id] !== false;
              return (
                <button
                  key={b.id}
                  onClick={() => toggleBranchVisibility(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                    isVisible
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'bg-stone-200/60 text-stone-400 border-dashed border-stone-300 opacity-60'
                  }`}
                  style={{
                    borderColor: isVisible ? theme.stroke : undefined,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: isVisible ? theme.stroke : '#a8a29e' }}
                  />
                  <span>{b.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Zero Data Notification Banner: Clean 00 indicator */}
      {!metrics.hasData && (
        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-stone-600 flex items-center gap-2.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>
            <strong>Chain Ready (Count: ₹00):</strong> All 6 Bangalore branches start at ₹00. As daily sales and expenses are fed into any branch, aggregate and comparative lines will immediately plot here.
          </span>
        </div>
      )}

      {/* Main Recharts Line Chart Container */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length && onSelectDate) {
                const point = state.activePayload[0].payload as DataPoint;
                if (point.date) {
                  onSelectDate(point.date);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
            <XAxis 
              dataKey="label" 
              tickLine={false}
              axisLine={{ stroke: '#d6d3d1' }}
              tick={{ fill: '#78716c', fontSize: 11, fontWeight: 600 }}
              interval={timeframe === 'monthly' ? 4 : 0}
              dy={8}
            />
            <YAxis 
              tickLine={false}
              axisLine={{ stroke: '#d6d3d1' }}
              tick={{ fill: '#78716c', fontSize: 11 }}
              tickFormatter={formatINR}
              domain={[0, metrics.totalSales > 0 ? 'auto' : 1000]}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 600 }}
            />

            {/* View Mode 1: Aggregate Chain Total */}
            {viewMode === 'total' && (
              <Line
                type="monotone"
                dataKey="totalSales"
                name="Aggregate Chain Sales"
                stroke="#059669" // Emerald 600
                strokeWidth={3.5}
                dot={{ r: timeframe === 'monthly' ? 2.5 : 4.5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 8, fill: '#047857', stroke: '#a7f3d0', strokeWidth: 3 }}
              />
            )}

            {/* View Mode 2: All 6 Branches Comparison */}
            {viewMode === 'compare_branches' && (
              <>
                {branches.map(b => {
                  const theme = BRANCH_CHART_COLORS[b.id];
                  if (visibleBranches[b.id] === false) return null;
                  return (
                    <Line
                      key={b.id}
                      type="monotone"
                      dataKey={`branchSales.${b.id}`}
                      name={b.name}
                      stroke={theme.stroke}
                      strokeWidth={2.8}
                      dot={{ r: timeframe === 'monthly' ? 2 : 3.5, fill: theme.stroke, stroke: '#ffffff', strokeWidth: 1.5 }}
                      activeDot={{ r: 6 }}
                    />
                  );
                })}
              </>
            )}

            {/* View Mode 3: Sales vs Kharcha View */}
            {viewMode === 'profit_vs_expense' && (
              <>
                <Line
                  type="monotone"
                  dataKey="totalSales"
                  name="Total Chain Sales"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="totalExpenses"
                  name="Total Chain Kharcha"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#e11d48', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  name="Net Chain Profit"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </>
            )}

            {/* View Mode 4: Payment Channels View */}
            {viewMode === 'channels' && (
              <>
                <Line
                  type="monotone"
                  dataKey="upiSales"
                  name="UPI / PhonePe"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 3.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="cashSales"
                  name="Counter Cash"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="deliverySales"
                  name="Delivery (Swiggy/Zomato)"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 3.5 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-400 pt-1 border-t border-stone-100">
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-stone-400" />
          <span>
            {timeframeLabels[timeframe]} across Kundalahalli, Banaswadi, Indiranagar, KR Puram, Balagere & Varthur
          </span>
        </span>
        <span className="text-stone-400">
          💡 Click any point to select that date in the ledger
        </span>
      </div>
    </div>
  );
};
