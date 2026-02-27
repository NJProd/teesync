'use client';

import { useState } from 'react';
import { useTenant } from '@/lib/tenant-context';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UtensilsCrossed,
  Beer,
  Clock,
  Check,
  Bell,
  Timer,
  ChefHat,
} from 'lucide-react';

type OrderStatus = 'new' | 'preparing' | 'ready';
type Station = 'kitchen' | 'bar' | 'all';

interface KDSOrder {
  id: string;
  tabId: string;
  bayName: string;
  customerName: string;
  items: { name: string; quantity: number; modifiers: string[]; notes?: string }[];
  station: 'kitchen' | 'bar';
  status: OrderStatus;
  createdAt: string;
  elapsedMinutes: number;
}

const DEMO_ORDERS: KDSOrder[] = [
  {
    id: 'ord1', tabId: 'tab1', bayName: 'Bay 1', customerName: 'Mike J.',
    items: [
      { name: 'Wings (12pc)', quantity: 1, modifiers: ['Extra Hot'] },
      { name: 'Nachos', quantity: 1, modifiers: ['No Jalapeños'] },
    ],
    station: 'kitchen', status: 'new', createdAt: '2:34 PM', elapsedMinutes: 3,
  },
  {
    id: 'ord2', tabId: 'tab1', bayName: 'Bay 1', customerName: 'Mike J.',
    items: [
      { name: 'IPA Draft', quantity: 2, modifiers: [] },
      { name: 'Old Fashioned', quantity: 1, modifiers: ['Extra Cherry'] },
    ],
    station: 'bar', status: 'preparing', createdAt: '2:34 PM', elapsedMinutes: 3,
  },
  {
    id: 'ord3', tabId: 'tab2', bayName: 'Bay 3', customerName: 'Sarah W.',
    items: [
      { name: 'Classic Burger', quantity: 2, modifiers: ['Medium Rare', 'No Onion'] },
      { name: 'Truffle Fries', quantity: 1, modifiers: [] },
    ],
    station: 'kitchen', status: 'preparing', createdAt: '2:28 PM', elapsedMinutes: 9,
  },
  {
    id: 'ord4', tabId: 'tab3', bayName: 'Bay 5', customerName: 'Tom D.',
    items: [
      { name: 'Margarita', quantity: 3, modifiers: ['Salt Rim'] },
    ],
    station: 'bar', status: 'new', createdAt: '2:36 PM', elapsedMinutes: 1,
  },
  {
    id: 'ord5', tabId: 'tab2', bayName: 'Bay 3', customerName: 'Sarah W.',
    items: [
      { name: 'Lager Draft', quantity: 2, modifiers: [] },
      { name: 'Soda', quantity: 1, modifiers: ['Coke'] },
    ],
    station: 'bar', status: 'ready', createdAt: '2:25 PM', elapsedMinutes: 12,
  },
  {
    id: 'ord6', tabId: 'tab4', bayName: 'Bay 2', customerName: 'Emily B.',
    items: [
      { name: 'Sliders (3)', quantity: 1, modifiers: [] },
      { name: 'Caesar Salad', quantity: 1, modifiers: ['Dressing on Side'] },
    ],
    station: 'kitchen', status: 'new', createdAt: '2:37 PM', elapsedMinutes: 0,
  },
];

const statusColors: Record<OrderStatus, string> = {
  new: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  preparing: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  ready: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
};

const statusLabels: Record<OrderStatus, string> = {
  new: 'NEW',
  preparing: 'PREPARING',
  ready: 'READY',
};

function getTimeColor(minutes: number) {
  if (minutes >= 15) return 'text-red-400';
  if (minutes >= 10) return 'text-amber-400';
  return 'text-zinc-400';
}

export default function KitchenDisplayPage() {
  const { tenant } = useTenant();
  const [station, setStation] = useState<Station>('all');
  const [orders, setOrders] = useState(DEMO_ORDERS);

  const filteredOrders = orders.filter((o) => {
    if (station === 'all') return true;
    return o.station === station;
  });

  const newOrders = filteredOrders.filter((o) => o.status === 'new');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'preparing');
  const readyOrders = filteredOrders.filter((o) => o.status === 'ready');

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const bumpOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-lg font-bold text-white">Kitchen Display</h1>
            <p className="text-xs text-zinc-500">{tenant?.name ?? 'Venue'}</p>
          </div>
        </div>

        {/* Station filter */}
        <div className="flex gap-2">
          {[
            { id: 'all' as Station, label: 'All', icon: null },
            { id: 'kitchen' as Station, label: 'Kitchen', icon: UtensilsCrossed },
            { id: 'bar' as Station, label: 'Bar', icon: Beer },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStation(s.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                station === s.id
                  ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {s.icon && <s.icon className="w-4 h-4" />}
              {s.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="flex gap-4 text-sm">
          <span className="text-amber-400">{newOrders.length} new</span>
          <span className="text-blue-400">{preparingOrders.length} preparing</span>
          <span className="text-emerald-400">{readyOrders.length} ready</span>
        </div>
      </header>

      {/* Order columns */}
      <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
        {/* New */}
        <div className="flex-1 min-w-[300px] space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">New ({newOrders.length})</h2>
          </div>
          {newOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAction={() => updateStatus(order.id, 'preparing')}
              actionLabel="Start Making"
            />
          ))}
        </div>

        {/* Preparing */}
        <div className="flex-1 min-w-[300px] space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Preparing ({preparingOrders.length})</h2>
          </div>
          {preparingOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAction={() => updateStatus(order.id, 'ready')}
              actionLabel="Mark Ready"
            />
          ))}
        </div>

        {/* Ready */}
        <div className="flex-1 min-w-[300px] space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Ready ({readyOrders.length})</h2>
          </div>
          {readyOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAction={() => bumpOrder(order.id)}
              actionLabel="Bump / Served"
              actionVariant="success"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onAction,
  actionLabel,
  actionVariant = 'default',
}: {
  order: KDSOrder;
  onAction: () => void;
  actionLabel: string;
  actionVariant?: 'default' | 'success';
}) {
  return (
    <Card className="border-l-4" style={{
      borderLeftColor: order.status === 'new' ? '#f59e0b' : order.status === 'preparing' ? '#3b82f6' : '#10b981',
    }}>
      <CardContent className="pt-3 pb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{order.bayName}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-sm text-zinc-400">{order.customerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={order.station === 'kitchen' ? 'warning' : 'info'} className="text-[10px]">
              {order.station === 'kitchen' ? <UtensilsCrossed className="w-3 h-3 mr-1" /> : <Beer className="w-3 h-3 mr-1" />}
              {order.station}
            </Badge>
            <span className={`text-xs font-mono flex items-center gap-1 ${getTimeColor(order.elapsedMinutes)}`}>
              <Clock className="w-3 h-3" />
              {order.elapsedMinutes}m
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1.5 mb-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-white font-bold text-base w-6">{item.quantity}×</span>
              <div>
                <span className="text-white font-medium">{item.name}</span>
                {item.modifiers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {item.modifiers.map((mod) => (
                      <span key={mod} className="text-xs text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        {mod}
                      </span>
                    ))}
                  </div>
                )}
                {item.notes && (
                  <p className="text-xs text-zinc-500 mt-0.5">Note: {item.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <Button
          onClick={onAction}
          variant={actionVariant}
          size="sm"
          className="w-full"
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
