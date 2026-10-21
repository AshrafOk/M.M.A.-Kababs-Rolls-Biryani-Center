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
  Calendar, 
  Zap, 
  DollarSign, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  BarChart3,
  Percent
} from 'lucide-react';
import { BranchId, BranchDailyRecord, DailyProfitCalculation } from '../types/restaurant';
import { 
  TimeframeMode, 
  ViewMode, 
  DataPoint, 
  formatINR, 
  getBranchTrendData, 
  BRANCH_CHART_COLORS 
} from '../utils/salesAnalytics';

interface Props {
  branchId: BranchId;
  branchName: string;
  selectedDate: string;
  records: Record<string, BranchDailyRecord>;
  getRecord: (branchId: BranchId, date: string) => BranchDailyRecord;
  calculateBranchProfit: (record: BranchDailyRecord) => DailyProfitCalculation;
  onSelectDate: (date: string) => void;
  onSeedDemoData?: () => void;
}

export const BranchSalesTrendChart: React.FC<Props> = ({
  branchId,
  branchName,
  selectedDate,
  records,
  getRecord,
  calculateBranchProfit,
  onSelectDate,
  onSeedDemoData,
}) => {
  // Customizable timeframe: weekly (7 days, default), monthly (30 days), yearly (12 months)
  const [timeframe, setTimeframe] = useState<TimeframeMode>('weekly');
  const [viewMode, setViewMode] = useState<ViewMode>('total');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Compute trend data for this branch
  const trendData = useMemo(() => {
    return getBranchTrendData(
      branchId,
      timeframe,
      selectedDate,
      records,
      getRecord,
      calculateBranchProfit
    );
  }, [branchId, timeframe, selectedDate, records, getRecord, calculateBranchProfit]);

  // Aggregated KPIs for the active timeframe
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

    const hasData = totalSales > 0;

    return {
      totalSales,
      totalExpenses,
      netProfit,
      avgSales,
      margin,
      peak,
      hasData,
    };
  }, [trendData]);

  const branchTheme = BRANCH_CHART_COLORS[branchId] || {
    stroke: '#059669',
    fill: '#10b981',
    name: branchName,
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as DataPoint;
      return (
        <div className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-stone-700/60 text-xs min-w-[220px] space-y-2.5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <div>
              <span className="font-bold text-amber-400 block">{dataPoint.fullLabel || label}</span>
              <span className="text-[10px] text-stone-400">{branchName}</span>
            </div>
            {dataPoint.isCurrent && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                Active Date
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <span 
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                    style={{ backgroundColor: entry.color }} 
                  />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-mono font-bold text-white">
                  ₹{Number(entry.value).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Quick breakdown footer */}
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
            <span>Net {dataPoint.netProfit >= 0 ? 'Profit' : 'Loss'}:</span>
            <span className={`font-mono font-bold ${dataPoint.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{dataPoint.netProfit.toLocaleString('en-IN')}
            </span>
          </div>

          {timeframe !== 'yearly' && (
            <div className="text-[10px] text-stone-400 text-center pt-1 border-t border-stone-800/60 italic">
              Click point to load entry sheet for this day
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
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 space-y-4 transition-all">
      {/* Top Header: Title, Timeframe Buttons, and View Modes */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm shrink-0"
            style={{ backgroundColor: branchTheme.stroke }}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-stone-900 text-base sm:text-lg tracking-tight">
                {branchName} • Sales Graph
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                {timeframeLabels[timeframe]}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {timeframe === 'weekly' && `Last 7 consecutive days ending on ${selectedDate} (Default)`}
              {timeframe === 'monthly' && `Last 30 days daily sales trend ending on ${selectedDate}`}
              {timeframe === 'yearly' && `Past 12 months sales trajectory for ${branchName}`}
            </p>
          </div>
        </div>

        {/* Controls Toolbar: Timeframe Selector & Mode Selector */}
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

          {/* View Mode Switcher */}
          <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('total')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'total'
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Show Total Sales Line"
            >
              Total Sales
            </button>
            <button
              onClick={() => setViewMode('profit_vs_expense')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'profit_vs_expense'
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Compare Sales with Kharcha (Expenses)"
            >
              Sales vs Kharcha
            </button>
            <button
              onClick={() => setViewMode('channels')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'channels'
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Show PhonePe, Cash & Delivery lines"
            >
              Channels
            </button>
          </div>

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sales Graph' : 'Collapse Sales Graph'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* 4 Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Period Total Sales */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  {timeframe === 'weekly' ? '7-Day Total' : timeframe === 'monthly' ? '30-Day Total' : '12-Month Total'}
                </span>
                <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-700">
                  <DollarSign className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-black text-stone-900 font-mono mt-1">
                {metrics.totalSales > 0 ? `₹${metrics.totalSales.toLocaleString('en-IN')}` : '₹00'}
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Total collection for {branchName}
              </span>
            </div>

            {/* Daily or Monthly Average */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  {timeframe === 'yearly' ? 'Monthly Average' : 'Daily Average'}
                </span>
                <span className="p-1 rounded-lg bg-amber-500/10 text-amber-700">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-black text-stone-900 font-mono mt-1">
                {metrics.totalSales > 0 ? `₹${metrics.avgSales.toLocaleString('en-IN')}` : '₹00'}
                <span className="text-[10px] font-normal text-stone-500 ml-1">
                  /{timeframe === 'yearly' ? 'mo' : 'day'}
                </span>
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Average sales pace
              </span>
            </div>

            {/* Peak Record */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Peak Sales {timeframe === 'yearly' ? 'Month' : 'Day'}
                </span>
                <span className="p-1 rounded-lg bg-purple-500/10 text-purple-700">
                  <Zap className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-black text-emerald-700 font-mono mt-1">
                {metrics.totalSales > 0 ? `₹${metrics.peak.totalSales.toLocaleString('en-IN')}` : '₹00'}
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block truncate">
                {metrics.totalSales > 0 ? `${metrics.peak.label} (${metrics.peak.fullLabel})` : 'Awaiting data'}
              </span>
            </div>

            {/* Net Margin % */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Period Net Margin
                </span>
                <span className="p-1 rounded-lg bg-blue-500/10 text-blue-700">
                  <Percent className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className={`text-xl font-black font-mono mt-1 ${metrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {metrics.totalSales > 0 ? `${metrics.margin.toFixed(1)}%` : '0.0%'}
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Net Profit: {metrics.totalSales > 0 ? `₹${metrics.netProfit.toLocaleString('en-IN')}` : '₹00'}
              </span>
            </div>
          </div>

          {/* Zero Data Notification Banner: Clean 00 indicator */}
          {!metrics.hasData && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 flex items-center gap-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>
                <strong>Live Ready (Count: ₹00):</strong> As you feed daily sales & expenses below for {branchName}, real-time performance trends will automatically plot on this graph.
              </span>
            </div>
          )}

          {/* Recharts Line Chart */}
          <div className="w-full h-72 sm:h-80 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 15, right: 15, left: 10, bottom: 5 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length && onSelectDate) {
                    const point = state.activePayload[0].payload as DataPoint;
                    if (point.date) {
                      onSelectDate(point.date);
                    }
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                  tick={{ fill: '#78716c', fontSize: 11, fontWeight: 600 }}
                  interval={timeframe === 'monthly' ? 4 : 0}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                  tick={{ fill: '#78716c', fontSize: 11 }}
                  tickFormatter={formatINR}
                  domain={[0, metrics.totalSales > 0 ? 'auto' : 50000]}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 12, fontWeight: 600 }}
                />

                {/* View 1: Total Sales */}
                {viewMode === 'total' && (
                  <Line
                    type="monotone"
                    dataKey="totalSales"
                    name={`${branchName} Sales`}
                    stroke={branchTheme.stroke}
                    strokeWidth={3.5}
                    dot={{ r: timeframe === 'monthly' ? 2.5 : 4, fill: branchTheme.stroke, stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: branchTheme.stroke, stroke: '#ecfdf5', strokeWidth: 3 }}
                  />
                )}

                {/* View 2: Sales vs Kharcha (Expenses) */}
                {viewMode === 'profit_vs_expense' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="totalSales"
                      name="Total Sales"
                      stroke={branchTheme.stroke}
                      strokeWidth={3}
                      dot={{ r: 3.5, fill: branchTheme.stroke, stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalExpenses"
                      name="Total Kharcha"
                      stroke="#e11d48"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 3.5, fill: '#e11d48', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="netProfit"
                      name="Net Profit"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}

                {/* View 3: Payment Channels */}
                {viewMode === 'channels' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="upiSales"
                      name="UPI / PhonePe"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cashSales"
                      name="Counter Cash"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="deliverySales"
                      name="Swiggy / Zomato"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer note */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              <span>
                {branchName} • Switch between <strong>Weekly</strong>, <strong>Monthly</strong>, or <strong>Yearly</strong> above
              </span>
            </span>
            <span className="text-stone-400">
              💡 Tip: Click any day point on graph to jump to that day's entry sheet
            </span>
          </div>
        </>
      )}
    </div>
  );
};
