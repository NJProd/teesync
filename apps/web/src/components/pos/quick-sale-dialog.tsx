'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@teesync/utils';
import type { MenuItem, MenuCategory } from '@teesync/types';
import { shortId } from '@teesync/utils';
import {
  X,
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
} from 'lucide-react';

interface QuickSaleDialogProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  taxRate: number;
  onClose: () => void;
  onComplete: (items: { menuItem: MenuItem; qty: number }[], payMethod: 'card' | 'cash') => void;
}

export function QuickSaleDialog({
  categories,
  menuItems,
  taxRate,
  onClose,
  onComplete,
}: QuickSaleDialogProps) {
  const [cart, setCart] = useState<Map<string, { menuItem: MenuItem; qty: number }>>(new Map());
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id ?? '');
  const [search, setSearch] = useState('');

  const displayItems = useMemo(() => {
    if (search.trim()) {
      return menuItems.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) && i.available
      );
    }
    return menuItems.filter((i) => i.categoryId === selectedCatId && i.available);
  }, [menuItems, selectedCatId, search]);

  const cartItems = Array.from(cart.values());
  const subtotal = cartItems.reduce((s, c) => s + c.menuItem.price * c.qty, 0);
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  function addItem(item: MenuItem) {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      if (existing) {
        next.set(item.id, { ...existing, qty: existing.qty + 1 });
      } else {
        next.set(item.id, { menuItem: item, qty: 1 });
      }
      return next;
    });
  }

  function updateQty(itemId: string, delta: number) {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(itemId);
      if (!existing) return next;
      const newQty = existing.qty + delta;
      if (newQty <= 0) {
        next.delete(itemId);
      } else {
        next.set(itemId, { ...existing, qty: newQty });
      }
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Quick Sale</h2>
            <span className="text-xs text-zinc-500">No bay / walk-up counter</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left: Menu */}
          <div className="flex-1 flex flex-col border-r border-zinc-800 min-w-0">
            {/* Search */}
            <div className="p-3 border-b border-zinc-800/50">
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

            {/* Categories */}
            {!search.trim() && (
              <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-zinc-800/50 shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                      cat.id === selectedCatId
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-2">
                {displayItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-left hover:border-emerald-500/50 hover:bg-emerald-950/20 active:scale-[0.97] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-white leading-tight pr-2">
                        {item.name}
                      </span>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600/20 flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400 mt-1 block">
                      {item.price === 0 ? 'Free' : formatCurrency(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Cart */}
          <div className="w-64 flex flex-col">
            <div className="px-4 py-3 border-b border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                Cart ({cartItems.reduce((s, c) => s + c.qty, 0)})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                  Add items from the menu
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {cartItems.map(({ menuItem, qty }) => (
                    <div key={menuItem.id} className="px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white truncate mr-2">
                          {menuItem.name}
                        </span>
                        <span className="text-sm text-zinc-300 font-mono tabular-nums shrink-0">
                          {formatCurrency(menuItem.price * qty)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQty(menuItem.id, -1)}
                          className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
                        >
                          {qty === 1 ? (
                            <Trash2 className="w-3 h-3 text-red-400" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                        </button>
                        <span className="text-xs text-white font-mono tabular-nums w-5 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQty(menuItem.id, 1)}
                          className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-zinc-800 px-4 py-3 space-y-1 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Tax</span>
                <span className="font-mono tabular-nums">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-zinc-700">
                <span>Total</span>
                <span className="font-mono tabular-nums">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Pay Buttons */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <Button
                onClick={() => onComplete(cartItems, 'card')}
                disabled={cartItems.length === 0}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CreditCard className="w-3.5 h-3.5 mr-1" />
                Card
              </Button>
              <Button
                onClick={() => onComplete(cartItems, 'cash')}
                disabled={cartItems.length === 0}
                size="sm"
                variant="outline"
                className="border-zinc-600 text-zinc-300"
              >
                <Banknote className="w-3.5 h-3.5 mr-1" />
                Cash
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
