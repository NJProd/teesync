'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@teesync/utils';
import type { MenuItem, MenuCategory } from '@teesync/types';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';

interface MenuGridProps {
  categories: MenuCategory[];
  items: MenuItem[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onAddItem: (item: MenuItem) => void;
  disabled: boolean;
}

export function MenuGrid({
  categories,
  items,
  selectedCategoryId,
  onSelectCategory,
  onAddItem,
  disabled,
}: MenuGridProps) {
  const [search, setSearch] = useState('');

  // When searching, show all items matching query
  const displayItems = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-zinc-800">
        <div className="flex overflow-x-auto gap-1 p-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setSearch('');
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                cat.id === selectedCategoryId
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Item Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {disabled && (
          <div className="text-center text-zinc-600 py-8">
            <p className="text-sm">Select a bay with an open tab</p>
            <p className="text-xs mt-1">to start adding items</p>
          </div>
        )}
        {!disabled && displayItems.length === 0 && (
          <div className="text-center text-zinc-600 py-8">
            <p className="text-sm">No items found</p>
          </div>
        )}
        {!disabled && (
          <div className="grid grid-cols-2 gap-2">
            {displayItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onAddItem(item)}
                disabled={disabled}
                className={cn(
                  'relative rounded-xl border bg-zinc-900 p-3 text-left transition-all touch-target',
                  'hover:border-emerald-500/50 hover:bg-emerald-950/20 active:scale-[0.97]',
                  'border-zinc-800',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-white leading-tight pr-2">
                    {item.name}
                  </span>
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600/20 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-400">
                    {item.price === 0 ? 'Free' : formatCurrency(item.price)}
                  </span>
                  {item.modifiers.length > 0 && (
                    <span className="text-[10px] text-zinc-500">
                      +{item.modifiers.length} mods
                    </span>
                  )}
                </div>
                {item.prepStation !== 'none' && (
                  <div className="mt-1">
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full',
                      item.prepStation === 'kitchen'
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'bg-blue-500/10 text-blue-400'
                    )}>
                      {item.prepStation}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
