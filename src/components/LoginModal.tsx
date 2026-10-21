import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Store, 
  KeyRound, 
  AlertCircle, 
  ArrowRight,
  UtensilsCrossed,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { BranchId } from '../types/restaurant';
import { RESTAURANT_NAME } from '../data/mockData';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, canDismiss = false }) => {
  const { branches, loginAsAdmin, loginAsManager } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'admin' | 'manager'>('admin');

  // Admin form
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Manager form
  const [selectedBranch, setSelectedBranch] = useState<BranchId>('kundalahalli');
  const [managerPassword, setManagerPassword] = useState('');
  const [showManagerPass, setShowManagerPass] = useState(false);

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = loginAsAdmin(adminPassword);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      if (onClose) onClose();
    }
  };

  const handleManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = loginAsManager(selectedBranch, managerPassword);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Brand Header */}
        <div className="p-6 bg-stone-900 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 mx-auto flex items-center justify-center shadow-lg mb-3">
            <UtensilsCrossed className="w-6 h-6 text-stone-950" />
          </div>
          <h3 className="font-black text-lg tracking-tight">{RESTAURANT_NAME}</h3>
          <p className="text-xs text-stone-400 mt-1">Bangalore 6 Branches Operations Portal</p>

          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          )}
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-2 bg-stone-100 border-b border-stone-200 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('admin');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Admin / Owner</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manager');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'manager'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Store className="w-4 h-4 text-amber-700" />
            <span>Branch Manager</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed text-[11px]">
                <strong>👑 Admin Privileges:</strong> Full access to Chain Overview, All Branches Stock Matrix, Date-Wise CSV Exports, Password Resets, and Historical Editing Override.
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Enter Admin Password:
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-3 pr-10 py-2.5 border border-stone-300 rounded-xl font-bold bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!adminPassword}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Login as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleManagerSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed text-[11px]">
                <strong>🔒 Manager Access:</strong> You can only access and update your own branch. Other branches and chain overview reports are restricted.
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Select Your Branch:
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value as BranchId)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl font-bold bg-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.area})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Enter Branch Password:
                </label>
                <div className="relative">
                  <input
                    type={showManagerPass ? 'text' : 'password'}
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    placeholder="Enter branch password..."
                    className="w-full pl-3 pr-10 py-2.5 border border-stone-300 rounded-xl font-bold bg-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowManagerPass(!showManagerPass)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showManagerPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!managerPassword}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Login to Branch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-400">
          Protected by M.M.A. Multi-Branch Security System
        </div>
      </div>
    </div>
  );
};
