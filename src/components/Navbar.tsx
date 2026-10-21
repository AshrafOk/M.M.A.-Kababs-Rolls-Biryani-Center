import React from 'react';
import { 
  Building2, 
  Calendar, 
  Boxes, 
  LayoutDashboard, 
  UtensilsCrossed,
  KeyRound,
  LogOut,
  ShieldCheck,
  Store,
  LogIn,
  Database
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { BranchId } from '../types/restaurant';
import { RESTAURANT_NAME, getTodayDateString } from '../data/mockData';

interface Props {
  currentTab: 'overview' | 'stock' | 'branch';
  setCurrentTab: (tab: 'overview' | 'stock' | 'branch') => void;
  onOpenBackup: () => void;
  onOpenChainReport: () => void;
  onOpenPasswordModal: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<Props> = ({ 
  currentTab, 
  setCurrentTab,
  onOpenBackup,
  onOpenChainReport,
  onOpenPasswordModal,
  onOpenLoginModal,
}) => {
  const { 
    branches, 
    activeBranchId, 
    setActiveBranchId, 
    selectedDate, 
    setSelectedDate,
    authSession,
    logout
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
  const isAdmin = authSession?.role === 'admin';
  const isManager = authSession?.role === 'manager';

  // For manager: filter branches to only show their assigned branch
  const visibleBranches = isManager && authSession.branchId
    ? branches.filter(b => b.id === authSession.branchId)
    : branches;

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
                Daily Sales • Kharcha & Profit Calculator • Multi-Branch Operations
              </p>
            </div>
          </div>

          {/* Right Controls: Date picker, Backup, Auth Badges */}
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

            {/* Database Backup & Restore - strictly Admin only (hidden for all branch managers) */}
            {isAdmin && (
              <button
                onClick={onOpenBackup}
                className="px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/40 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Download backup database file or restore if app crashes"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DB Backup</span>
              </button>
            )}

            {/* Security / Password Management - strictly Admin only (hidden for all branch managers) */}
            {isAdmin && (
              <button
                onClick={onOpenPasswordModal}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-bold text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Change or reset passwords"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Passwords</span>
              </button>
            )}

            {/* User Session & Logout */}
            {authSession ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-stone-800">
                <div className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  isAdmin ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                  <span className="max-w-[120px] truncate">{authSession.displayName}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 bg-stone-800 hover:bg-rose-900/40 text-stone-400 hover:text-rose-300 border border-stone-700 rounded-xl transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Branch & View Navigation Strip (Protected by User Role) */}
      <div className="bg-stone-950/80 border-t border-stone-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2 no-scrollbar gap-2">
            {/* Left: View Tabs (Only Admin can view Chain Overview & All Branches Stock Matrix!) */}
            {isAdmin ? (
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
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold shrink-0">
                <Store className="w-4 h-4 text-amber-400" />
                <span>My Branch Daily Ledger</span>
              </div>
            )}

            {isAdmin && <div className="h-5 w-px bg-stone-800 shrink-0" />}

            {/* Right: Branch Selectors (Admin sees all 6; Manager sees ONLY their own branch!) */}
            <div className="flex items-center gap-1 shrink-0">
              {isAdmin && (
                <span className="text-[10px] uppercase font-bold text-stone-500 mr-1 hidden lg:inline">
                  Branches:
                </span>
              )}
              {visibleBranches.map((b) => {
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
