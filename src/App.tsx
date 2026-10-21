/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/Navbar';
import { ChainOverview } from './components/ChainOverview';
import { MasterInventoryTracker } from './components/MasterInventoryTracker';
import { BranchDailyLedger } from './components/BranchDailyLedger';
import { BranchId } from './types/restaurant';

function MainContent() {
  const { activeBranchId, setActiveBranchId } = useRestaurant();
  const [currentTab, setCurrentTab] = useState<'overview' | 'stock' | 'branch'>('overview');

  const handleSelectBranchFromDashboard = (branchId: BranchId) => {
    setActiveBranchId(branchId);
    setCurrentTab('branch');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 selection:bg-emerald-200">
      {/* Top Header & Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <ChainOverview
            onSelectBranch={handleSelectBranchFromDashboard}
          />
        )}

        {currentTab === 'stock' && (
          <MasterInventoryTracker />
        )}

        {currentTab === 'branch' && (
          <BranchDailyLedger
            branchId={activeBranchId !== 'all' ? activeBranchId : 'kundalahalli'}
          />
        )}
      </main>
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
