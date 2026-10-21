import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  UtensilsCrossed, 
  Milk, 
  Carrot, 
  Wheat, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { BranchId } from '../types/restaurant';

export const MasterInventoryTracker: React.FC = () => {
  const { branches, selectedDate, getRecord, setActiveBranchId } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'meat' | 'grocery' | 'dairy' | 'vegetable'>('meat');
  const [searchTerm, setSearchTerm] = useState('');

  // Collect unique item names across all branches for selected category
  const getCategoryItems = () => {
    const categoryKey = activeTab === 'meat' ? 'meatItems' :
                        activeTab === 'grocery' ? 'groceryItems' :
                        activeTab === 'dairy' ? 'dairyItems' : 'vegetableItems';

    const itemMap = new Map<string, string>(); // name -> unit
    branches.forEach(b => {
      const rec = getRecord(b.id, selectedDate);
      rec[categoryKey].forEach(item => {
        if (!itemMap.has(item.name)) {
          itemMap.set(item.name, item.unit);
        }
      });
    });

    const list = Array.from(itemMap.entries()).map(([name, unit]) => ({ name, unit }));
    if (searchTerm.trim()) {
      return list.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return list;
  };

  const categoryItems = getCategoryItems();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Boxes className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              All Branches Stock & Daily Purchases Matrix
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Compare daily purchased vs in-stock numbers side-by-side across all 6 Bangalore branches for {selectedDate}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 4 Category Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('meat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'meat'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>🍗 Chicken & Meat Items</span>
        </button>

        <button
          onClick={() => setActiveTab('grocery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'grocery'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>🌾 Grocery & Staples</span>
        </button>

        <button
          onClick={() => setActiveTab('dairy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dairy'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Milk className="w-4 h-4" />
          <span>🥛 Dairy Items</span>
        </button>

        <button
          onClick={() => setActiveTab('vegetable')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vegetable'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Carrot className="w-4 h-4" />
          <span>🥕 Vegetables</span>
        </button>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-900 text-white font-semibold">
                <th className="py-3 px-4 sticky left-0 bg-stone-900 z-10 min-w-[200px]">Item Name</th>
                <th className="py-3 px-3 text-center min-w-[60px]">Unit</th>
                {branches.map(b => (
                  <th key={b.id} className="py-3 px-3 text-center min-w-[130px] border-l border-stone-700">
                    <div className="font-bold text-stone-100">{b.name}</div>
                    <div className="text-[10px] text-stone-400 font-normal">Bought | Stock</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {categoryItems.length === 0 ? (
                <tr>
                  <td colSpan={2 + branches.length} className="py-8 text-center text-stone-400">
                    No items found. Open any branch ledger to add items!
                  </td>
                </tr>
              ) : (
                categoryItems.map((item) => (
                  <tr key={item.name} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 sticky left-0 bg-white font-bold text-stone-900 border-r border-stone-100 shadow-sm">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 text-center text-stone-500 font-mono">
                      {item.unit}
                    </td>
                    {branches.map(b => {
                      const rec = getRecord(b.id, selectedDate);
                      const categoryKey = activeTab === 'meat' ? 'meatItems' :
                                          activeTab === 'grocery' ? 'groceryItems' :
                                          activeTab === 'dairy' ? 'dairyItems' : 'vegetableItems';

                      const match = rec[categoryKey].find(i => i.name === item.name);
                      const bought = match ? match.purchased : 0;
                      const stock = match ? match.stock : 0;

                      return (
                        <td key={b.id} className="py-3 px-3 text-center border-l border-stone-100 font-mono">
                          <span className="text-stone-700 font-bold">{bought}</span>
                          <span className="text-stone-300 mx-1.5">|</span>
                          <span className="text-emerald-800 font-black">{stock}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
