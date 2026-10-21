/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/Navbar';
import { ChainOverview } from './components/ChainOverview';
import { MasterInventoryTracker } from './components/MasterInventoryTracker';
import { BranchDailyLedger } from './components/BranchDailyLedger';
import { DatabaseBackupModal } from './components/DatabaseBackupModal';
import { ChainDailyReportModal } from './components/ChainDailyReportModal';
import { PasswordManagementModal } from './components/PasswordManagementModal';
import { LoginModal } from './components/LoginModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BranchId } from './types/restaurant';

function MainContent() {
  const { authSession, activeBranchId, setActiveBranchId } = useRestaurant();
  const [currentTab, setCurrentTab] = useState<'overview' | 'stock' | 'branch'>('overview');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isChainReportOpen, setIsChainReportOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAndroidInstallOpen, setIsAndroidInstallOpen] = useState(false);

  // Role Access Enforcement:
  // If logged in as Manager, strictly restrict to branch view of their own branch only!
  useEffect(() => {
    if (authSession?.role === 'manager' && authSession.branchId) {
      setCurrentTab('branch');
      if (activeBranchId !== authSession.branchId) {
        setActiveBranchId(authSession.branchId);
      }
    }
  }, [authSession, activeBranchId, setActiveBranchId]);

  const handleSelectBranchFromDashboard = (branchId: BranchId) => {
    setActiveBranchId(branchId);
    setCurrentTab('branch');
  };

  const isAdmin = authSession?.role === 'admin';
  const isManager = authSession?.role === 'manager';

  // Determine active branch for BranchDailyLedger
  const effectiveBranchId: BranchId = (isManager && authSession?.branchId)
    ? authSession.branchId
    : (activeBranchId !== 'all' ? activeBranchId : 'kundalahalli');

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 selection:bg-emerald-200">
      {/* Top Header & Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenChainReport={() => setIsChainReportOpen(true)}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Only Admin can view Chain Overview */}
        {currentTab === 'overview' && isAdmin && (
          <ChainOverview
            onSelectBranch={handleSelectBranchFromDashboard}
            onOpenBackup={() => setIsBackupOpen(true)}
            onOpenChainReport={() => setIsChainReportOpen(true)}
            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
            onOpenMobileInstall={() => setIsAndroidInstallOpen(true)}
          />
        )}

        {/* Only Admin can view All Branches Stock Matrix */}
        {currentTab === 'stock' && isAdmin && (
          <MasterInventoryTracker />
        )}

        {/* Branch Daily Ledger (Manager views only their branch; Admin can view any) */}
        {(currentTab === 'branch' || isManager) && (
          <BranchDailyLedger
            branchId={effectiveBranchId}
            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
          />
        )}
      </main>

      {/* Database Backup & Crash Recovery Modal */}
      <DatabaseBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />

      {/* Consolidated 6-Branch WhatsApp Daily Report Modal (Admin only) */}
      <ChainDailyReportModal
        isOpen={isChainReportOpen}
        onClose={() => setIsChainReportOpen(false)}
      />

      {/* Password Management Modal */}
      <PasswordManagementModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Android App Installation & Mobile Setup Modal */}
      <AndroidInstallModal
        isOpen={isAndroidInstallOpen}
        onClose={() => setIsAndroidInstallOpen(false)}
      />

      {/* Mandatory Login Modal if not logged in */}
      <LoginModal
        isOpen={!authSession || isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        canDismiss={!!authSession}
      />

      {/* Offline Connectivity Notification */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <MainContent />
    </RestaurantProvider>
  );
}
