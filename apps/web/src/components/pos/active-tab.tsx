'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@teesync/utils';
import type { Tab, TabItem } from '@teesync/types';
import {
  Receipt,
  Trash2,
  ShoppingCart,
  CreditCard,
  User,
  Clock,
} from 'lucide-react';

interface ActiveTabProps {
  tab: Tab | null;
  bayName: string;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export function ActiveTab({ tab, bayName, onRemoveItem, onCheckout }: ActiveTabProps) {
  if (!tab) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No Active Tab</p>
          <p className="text-sm mt-1">
            Select a bay with a checked-in booking to view their tab,
            <br />
            or check in a customer to auto-open a tab.
          </p>
        </div>
      </div>
    );
  }

  const timeOpen = tab.openedAt
    ? Math.round((Date.now() - new Date(tab.openedAt).getTime()) / 60000)
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Tab Header */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{bayName}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Tab Open
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {tab.customerName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeOpen}m open
              </span>
              <span className="flex items-center gap-1">
                <Receipt className="w-3 h-3" />
                {tab.items.length} items
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {tab.items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-600">
            <div className="text-center">
              <p className="text-sm">Tab is empty</p>
              <p className="text-xs mt-1">Add items from the menu on the right</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {tab.items.map((item) => (
              <TabItemRow
                key={item.id}
                item={item}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tab Totals & Checkout */}
      <div className="border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Subtotal</span>
            <span>{formatCurrency(tab.subtotal)}</span>
          </div>
          {tab.discountTotal > 0 && (
            <div className="flex justify-between text-sm text-emerald-400">
              <span>Discounts</span>
              <span>-{formatCurrency(tab.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Tax</span>
            <span>{formatCurrency(tab.taxTotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-white pt-1 border-t border-zinc-700">
            <span>Total</span>
            <span>{formatCurrency(tab.total)}</span>
          </div>
        </div>
        <div className="px-4 pb-3">
          <Button
            onClick={onCheckout}
            className="w-full"
            size="lg"
            disabled={tab.items.length === 0}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Close Tab — {formatCurrency(tab.total)}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TabItemRow({ item, onRemove }: { item: TabItem; onRemove: () => void }) {
  return (
    <div className="px-4 py-3 group hover:bg-zinc-900/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{item.name}</span>
            {item.quantity > 1 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                x{item.quantity}
              </span>
            )}
          </div>
          {item.modifiers.length > 0 && (
            <div className="text-xs text-zinc-500 mt-0.5">
              {item.modifiers.map((m) => m.name).join(', ')}
            </div>
          )}
          <div className="text-xs text-zinc-600 mt-0.5">{item.category}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white tabular-nums">
            {formatCurrency(item.total)}
          </span>
          <button
            onClick={onRemove}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
