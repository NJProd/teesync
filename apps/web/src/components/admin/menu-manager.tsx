'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@teesync/utils';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  GripVertical,
  UtensilsCrossed,
  Beer,
  ShoppingBag,
} from 'lucide-react';

const DEMO_CATEGORIES = [
  { id: 'cat1', name: 'Draft Beer', icon: '🍺', itemCount: 8 },
  { id: 'cat2', name: 'Cocktails', icon: '🍸', itemCount: 6 },
  { id: 'cat3', name: 'Wine', icon: '🍷', itemCount: 5 },
  { id: 'cat4', name: 'Non-Alcoholic', icon: '🥤', itemCount: 4 },
  { id: 'cat5', name: 'Appetizers', icon: '🍗', itemCount: 6 },
  { id: 'cat6', name: 'Entrees', icon: '🍔', itemCount: 5 },
  { id: 'cat7', name: 'Retail', icon: '🛍️', itemCount: 3 },
];

const DEMO_ITEMS = [
  { id: '1', name: 'IPA Draft', category: 'Draft Beer', price: 800, available: true, station: 'bar' },
  { id: '2', name: 'Lager Draft', category: 'Draft Beer', price: 700, available: true, station: 'bar' },
  { id: '3', name: 'Stout Draft', category: 'Draft Beer', price: 850, available: true, station: 'bar' },
  { id: '4', name: 'Old Fashioned', category: 'Cocktails', price: 1400, available: true, station: 'bar' },
  { id: '5', name: 'Margarita', category: 'Cocktails', price: 1300, available: true, station: 'bar' },
  { id: '6', name: 'Moscow Mule', category: 'Cocktails', price: 1200, available: false, station: 'bar' },
  { id: '7', name: 'Wings (12pc)', category: 'Appetizers', price: 1600, available: true, station: 'kitchen' },
  { id: '8', name: 'Nachos', category: 'Appetizers', price: 1400, available: true, station: 'kitchen' },
  { id: '9', name: 'Sliders (3)', category: 'Entrees', price: 1500, available: true, station: 'kitchen' },
  { id: '10', name: 'Classic Burger', category: 'Entrees', price: 1600, available: true, station: 'kitchen' },
  { id: '11', name: 'Golf Glove', category: 'Retail', price: 2500, available: true, station: 'none' },
  { id: '12', name: 'Logo Hat', category: 'Retail', price: 3000, available: true, station: 'none' },
];

export function MenuManager() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = DEMO_ITEMS.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (search) return item.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Menu & Items</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage food, drinks, and retail items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Category
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Menu Item
          </Button>
        </div>
      </div>

      {/* Categories overview */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          All ({DEMO_ITEMS.length})
        </button>
        {DEMO_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === cat.name
                ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.name}
            <span className="text-zinc-600">({cat.itemCount})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items…"
          className="pl-9"
        />
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => (
          <Card key={item.id} className={!item.available ? 'opacity-50' : ''}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    {!item.available && <Badge variant="destructive">86&apos;d</Badge>}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {formatCurrency(item.price)}
                    </span>
                    <Badge variant={
                      item.station === 'kitchen' ? 'warning' :
                      item.station === 'bar' ? 'info' : 'secondary'
                    }>
                      {item.station}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-600">
          No items found matching your search
        </div>
      )}
    </div>
  );
}
