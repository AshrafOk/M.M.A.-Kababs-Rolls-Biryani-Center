import React from 'react';
import { 
  Building2, 
  Calendar, 
  Boxes, 
  LayoutDashboard, 
  UtensilsCrossed,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { BranchId } from '../types/restaurant';
import { RESTAURANT_NAME, getTodayDateString } from '../data/mockData';

interface Props {
  currentTab: 'overview' | 'stock' | 'branch';
  setCurrentTab: (tab: 'overview' | 'stock' | 'branch') => void;
}

export const Navbar: React.FC<Props> = ({ 
  currentTab, 
  setCurrentTab, 
}) => {
  const { 
    branches, 
    activeBranchId, 
    setActiveBranchId, 
    selectedDate, 
    setSelectedDate,
    resetToZero
  } = useRestaurant();

  const handleBranchSelect = (id: BranchId | 'all') => {
    setActiveBranchId(id);
    if (id === 'all') {
      if (currentTab === 'branch') {
        setCurrentTab('overview');
      }
    } else {
      setCurrentTab('branch');
    }
  };

  const isToday = selectedDate === getTodayDateString();

  return (
    <header className="bg-stone-900 border-b border-stone-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
              <UtensilsCrossed className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-white leading-none">
                  {RESTAURANT_NAME}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Bangalore Chain
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Daily Sales • Kharcha & Profit Calculator • Stock & Purchases Entry (6 Branches)
              </p>
            </div>
          </div>

          {/* Right Controls: Date picker & Reset */}
          <div className="flex items-center gap-2">
            {/* Date Selector */}
            <div className="flex items-center bg-stone-800 border border-stone-700 rounded-xl p-1 text-xs">
              <Calendar className="w-4 h-4 text-emerald-400 ml-2 mr-1 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-xs font-mono font-medium focus:outline-none cursor-pointer pr-2"
              />
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(getTodayDateString())}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer mr-0.5"
                >
                  Today
                </button>
              )}
            </div>

            {/* Fresh Start / Reset to 00 */}
            <button
              onClick={() => {
                if (confirm('Start fresh and reset all branch data to 00?')) {
                  resetToZero();
                }
              }}
              className="px-3 py-1.5 bg-stone-800 hover:bg-rose-900/40 border border-stone-700 hover:border-rose-700/60 rounded-xl text-xs font-semibold text-stone-300 hover:text-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset all branch numbers to 00"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden md:inline">Reset to 00</span>
            </button>
          </div>
        </div>
      </div>

      {/* Branch Navigation Strip */}
      <div className="bg-stone-950/80 border-t border-stone-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2 no-scrollbar gap-2">
            {/* Left: View Tabs */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  setActiveBranchId('all');
                  setCurrentTab('overview');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeBranchId === 'all' && currentTab === 'overview'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Chain Overview</span>
              </button>

              <button
                onClick={() => {
                  setActiveBranchId('all');
                  setCurrentTab('stock');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeBranchId === 'all' && currentTab === 'stock'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>All Branches Stock Matrix</span>
              </button>
            </div>

            <div className="h-5 w-px bg-stone-800 shrink-0" />

            {/* Right: Dedicated Branch Selectors */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] uppercase font-bold text-stone-500 mr-1 hidden lg:inline">
                Branches:
              </span>
              {branches.map((b) => {
                const isActive = activeBranchId === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleBranchSelect(b.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                        : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-stone-950' : 'bg-emerald-500'}`} />
                    <span>{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
