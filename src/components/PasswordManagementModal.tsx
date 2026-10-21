import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  Store, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { BranchId } from '../types/restaurant';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordManagementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    branches, 
    authSession, 
    passwords, 
    updateAdminPassword, 
    resetBranchPasswordByAdmin, 
    updateBranchPasswordByManager 
  } = useRestaurant();

  // Admin password reset state
  const [oldAdminPass, setOldAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [adminStatus, setAdminStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Branch password resets by admin
  const [branchNewPasswords, setBranchNewPasswords] = useState<Record<BranchId, string>>({
    kundalahalli: '',
    banaswadi: '',
    indiranagar: '',
    'kr-puram': '',
    balagere: '',
    varthur: '',
  });
  const [branchStatus, setBranchStatus] = useState<Record<string, string>>({});

  // Manager password update state
  const [oldManagerPass, setOldManagerPass] = useState('');
  const [newManagerPass, setNewManagerPass] = useState('');
  const [managerStatus, setManagerStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const isAdmin = authSession?.role === 'admin';

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPass !== confirmAdminPass) {
      setAdminStatus({ success: false, message: 'New passwords do not match.' });
      return;
    }
    const res = updateAdminPassword(oldAdminPass, newAdminPass);
    setAdminStatus(res);
    if (res.success) {
      setOldAdminPass('');
      setNewAdminPass('');
      setConfirmAdminPass('');
      setTimeout(() => setAdminStatus(null), 3000);
    }
  };

  const handleBranchResetSubmit = (branchId: BranchId) => {
    const newPass = branchNewPasswords[branchId];
    if (!newPass || newPass.length < 4) {
      setBranchStatus(prev => ({ ...prev, [branchId]: 'Password must be at least 4 characters.' }));
      return;
    }
    const res = resetBranchPasswordByAdmin(branchId, newPass);
    setBranchStatus(prev => ({ ...prev, [branchId]: res.message }));
    setBranchNewPasswords(prev => ({ ...prev, [branchId]: '' }));
    setTimeout(() => {
      setBranchStatus(prev => {
        const copy = { ...prev };
        delete copy[branchId];
        return copy;
      });
    }, 3000);
  };

  const handleManagerPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateBranchPasswordByManager(oldManagerPass, newManagerPass);
    setManagerStatus(res);
    if (res.success) {
      setOldManagerPass('');
      setNewManagerPass('');
      setTimeout(() => setManagerStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/30 rounded-xl text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Security & Password Management</h3>
              <p className="text-xs text-stone-400">
                {isAdmin ? 'Reset admin password or configure passwords for all 6 branch managers' : 'Update your branch manager password'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          
          {/* SECTION 1: ADMIN PASSWORD RESET (For Admin) */}
          {isAdmin && (
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-stone-900 text-sm">1. Reset Admin Password</h4>
              </div>

              <form onSubmit={handleAdminPasswordSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Current Admin Password:</label>
                    <input
                      type="password"
                      value={oldAdminPass}
                      onChange={(e) => setOldAdminPass(e.target.value)}
                      placeholder="Current..."
                      className="w-full p-2 border border-stone-300 rounded-xl bg-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">New Password:</label>
                    <input
                      type="password"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      placeholder="New password..."
                      className="w-full p-2 border border-stone-300 rounded-xl bg-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Confirm New Password:</label>
                    <input
                      type="password"
                      value={confirmAdminPass}
                      onChange={(e) => setConfirmAdminPass(e.target.value)}
                      placeholder="Confirm..."
                      className="w-full p-2 border border-stone-300 rounded-xl bg-white text-xs font-semibold"
                    />
                  </div>
                </div>

                {adminStatus && (
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-semibold ${adminStatus.success ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'}`}>
                    {adminStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{adminStatus.message}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!oldAdminPass || !newAdminPass || !confirmAdminPass}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Update Admin Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECTION 2: ALL 6 BRANCHES PASSWORDS (Admin can view & reset any branch) */}
          {isAdmin && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-700" />
                  <h4 className="font-bold text-stone-900 text-sm">2. Branch Manager Passwords (Reset Access)</h4>
                </div>
                <span className="text-stone-400 text-[11px]">Only Admin can modify these</span>
              </div>

              <div className="space-y-3">
                {branches.map((b) => {
                  const currentPass = passwords.branches[b.id] || 'Not set';
                  const feedback = branchStatus[b.id];

                  return (
                    <div key={b.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
                          <span>{b.name}</span>
                          <span className="text-[10px] text-stone-500 font-normal">({b.area})</span>
                        </div>
                        <div className="text-[11px] text-stone-600 mt-0.5">
                          Current Active Password: <code className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-900 font-bold">{currentPass}</code>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type new password..."
                          value={branchNewPasswords[b.id]}
                          onChange={(e) => setBranchNewPasswords(prev => ({ ...prev, [b.id]: e.target.value }))}
                          className="px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-xs w-44 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => handleBranchResetSubmit(b.id)}
                          disabled={!branchNewPasswords[b.id]}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shrink-0"
                        >
                          Reset
                        </button>
                      </div>

                      {feedback && (
                        <div className="w-full text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-semibold">
                          {feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: MANAGER CHANGE OWN PASSWORD (For Manager) */}
          {!isAdmin && (
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-700" />
                <h4 className="font-bold text-stone-900 text-sm">Change Your Branch Password</h4>
              </div>

              <form onSubmit={handleManagerPasswordSubmit} className="space-y-3">
                <div>
                  <label className="font-bold text-stone-600 block mb-1">Current Password:</label>
                  <input
                    type="password"
                    value={oldManagerPass}
                    onChange={(e) => setOldManagerPass(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-600 block mb-1">New Password:</label>
                  <input
                    type="password"
                    value={newManagerPass}
                    onChange={(e) => setNewManagerPass(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white text-xs font-semibold"
                  />
                </div>

                {managerStatus && (
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-semibold ${managerStatus.success ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'}`}>
                    {managerStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{managerStatus.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!oldManagerPass || !newManagerPass}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Update Branch Password
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Security Protocol Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
