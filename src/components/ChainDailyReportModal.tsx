import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  MessageSquare,
  Building2,
  TrendingUp,
  Coins,
  Receipt
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChainDailyReportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { branches, selectedDate, getRecord, calculateBranchProfit, calculateChainTotals, exportChainDailyCSV } = useRestaurant();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const chain = calculateChainTotals(selectedDate);
  const isProfit = chain.totalProfit >= 0;

  // Format All-Branches Master WhatsApp message
  const generateChainWhatsAppReport = () => {
    const branchSummaries = branches.map(b => {
      const rec = getRecord(b.id, selectedDate);
      const calc = calculateBranchProfit(rec);
      return `📍 *${b.name.toUpperCase()}*
  • Sales: ₹${calc.totalSales.toLocaleString('en-IN')} (Cash: ₹${(rec.sales.cash || 0).toLocaleString('en-IN')} | UPI: ₹${(rec.sales.phonePe || 0).toLocaleString('en-IN')})
  • Kharcha: ₹${calc.totalExpenses.toLocaleString('en-IN')}
  • Net: ₹${calc.netProfit.toLocaleString('en-IN')} | BAL: ₹${calc.drawerCashBalance.toLocaleString('en-IN')}`;
    }).join('\n\n');

    return `*👑 M.M.A. KABABS ROLLS & BIRYANI CENTER*
*🔥 ALL 6 BRANCHES BANGALORE DAILY CONSOLIDATED REPORT*
*📅 DATE: ${selectedDate}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*💰 MASTER FINANCIAL TOTALS:*
• 📈 Total Chain Sales: ₹${chain.totalSales.toLocaleString('en-IN')}
• 💸 Total Chain Kharcha: ₹${chain.totalExpenses.toLocaleString('en-IN')}
• 💵 Total Drawer Cash (BAL): ₹${chain.totalCashBalance.toLocaleString('en-IN')}
*👉 NET CHAIN ${isProfit ? 'PROFIT' : 'LOSS'}: ₹${chain.totalProfit.toLocaleString('en-IN')}* (${chain.totalSales > 0 ? ((chain.totalProfit / chain.totalSales) * 100).toFixed(1) : 0}% margin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*📊 BRANCH-BY-BRANCH BREAKDOWN:*
${branchSummaries}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Report generated from M.M.A. Restaurant Management System._`;
  };

  const reportText = generateChainWhatsAppReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/40 rounded-xl text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">6-Branch Daily Report & WhatsApp Share</h3>
              <p className="text-xs text-stone-400">Bangalore Consolidated Daily Summary for {selectedDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Highlights */}
        <div className="p-6 bg-stone-50 border-b border-stone-200 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Chain Sales</span>
            <span className="text-lg font-black text-stone-900 font-mono">₹{chain.totalSales.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Chain Kharcha</span>
            <span className="text-lg font-black text-rose-600 font-mono">₹{chain.totalExpenses.toLocaleString('en-IN')}</span>
          </div>
          <div className={`p-3 rounded-xl border shadow-sm ${isProfit ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'}`}>
            <span className={`text-[10px] uppercase font-bold block ${isProfit ? 'text-emerald-800' : 'text-rose-800'}`}>
              Net {isProfit ? 'Profit' : 'Loss'}
            </span>
            <span className={`text-lg font-black font-mono ${isProfit ? 'text-emerald-800' : 'text-rose-800'}`}>
              ₹{chain.totalProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* WhatsApp Message Preview */}
        <div className="p-6 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Formatted WhatsApp Message (All 6 Branches):
            </span>
            <span className="text-[11px] text-stone-400">Click share or copy below</span>
          </div>

          <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner max-h-72 overflow-y-auto selection:bg-emerald-500 selection:text-black">
            {reportText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          {/* CSV Download & Print */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportChainDailyCSV(selectedDate)}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-300"
              title="Download CSV for Excel"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Export CSV (Excel)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Sheet</span>
            </button>
          </div>

          {/* Copy & WhatsApp Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-800 hover:bg-stone-900 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(reportText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
