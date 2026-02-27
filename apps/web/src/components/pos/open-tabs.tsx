'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@teesync/utils';
import type { Tab, Bay } from '@teesync/types';
import { Receipt } from 'lucide-react';

interface OpenTabsProps {
  tabs: Tab[];
  bays: Bay[];
  selectedTabId: string | null;
  onSelectTab: (tabId: string) => void;
}

export function OpenTabs({ tabs, bays, selectedTabId, onSelectTab }: OpenTabsProps) {
  const openTabs = tabs.filter((t) => t.status === 'open');

  if (openTabs.length === 0) {
    return (
      <div className="h-10 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center text-xs text-zinc-600">
        No open tabs
      </div>
    );
  }

  return (
    <div className="h-12 bg-zinc-900 border-t border-zinc-800 flex items-center px-3 gap-2 overflow-x-auto shrink-0">
      <Receipt className="w-4 h-4 text-zinc-600 shrink-0" />
      {openTabs.map((tab) => {
        const bay = bays.find((b) => b.id === tab.bayId);
        const isSelected = tab.id === selectedTabId;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors',
              isSelected
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-transparent'
            )}
          >
            <span>{bay?.name ?? 'Tab'}</span>
            <span className="text-zinc-500">·</span>
            <span className="truncate max-w-[80px]">{tab.customerName}</span>
            <span className={cn(
              'font-mono tabular-nums',
              isSelected ? 'text-emerald-300' : 'text-zinc-300'
            )}>
              {formatCurrency(tab.total)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
