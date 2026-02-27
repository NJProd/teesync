'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@teesync/utils';
import {
  DollarSign,
  TrendingUp,
  Users,
  CalendarDays,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Demo data for the dashboard overview
const STATS = [
  {
    label: 'Today\'s Revenue',
    value: 285000, // $2,850.00
    change: 12.5,
    icon: DollarSign,
    format: 'currency' as const,
  },
  {
    label: 'Bookings Today',
    value: 18,
    change: 5.2,
    icon: CalendarDays,
    format: 'number' as const,
  },
  {
    label: 'Active Customers',
    value: 342,
    change: 8.1,
    icon: Users,
    format: 'number' as const,
  },
  {
    label: 'Avg Session',
    value: 72,
    change: -2.3,
    icon: Clock,
    format: 'minutes' as const,
  },
];

const RECENT_TRANSACTIONS = [
  { id: '1', customer: 'Mike Johnson', amount: 14500, type: 'Bay + F&B', time: '2:34 PM' },
  { id: '2', customer: 'Sarah Williams', amount: 8900, type: 'Bay Booking', time: '1:15 PM' },
  { id: '3', customer: 'Tom Davis', amount: 22300, type: 'Bay + F&B', time: '12:45 PM' },
  { id: '4', customer: 'Emily Brown', amount: 6500, type: 'Walk-in Food', time: '12:10 PM' },
  { id: '5', customer: 'Jake Miller', amount: 18000, type: 'Bay + Drinks', time: '11:30 AM' },
];

const UPCOMING_BOOKINGS = [
  { id: '1', customer: 'Chris Lee', bay: 'Bay 1', time: '3:00 PM', duration: '2hr', status: 'confirmed' },
  { id: '2', customer: 'Anna Park', bay: 'Bay 3', time: '4:00 PM', duration: '1hr', status: 'confirmed' },
  { id: '3', customer: 'David Kim', bay: 'Bay 5', time: '4:30 PM', duration: '1.5hr', status: 'pending' },
  { id: '4', customer: 'Lisa Chen', bay: 'Bay 2', time: '5:00 PM', duration: '2hr', status: 'confirmed' },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-sm text-zinc-500 mt-1">Overview of today&apos;s performance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {stat.format === 'currency'
                        ? formatCurrency(stat.value)
                        : stat.format === 'minutes'
                          ? `${stat.value}m`
                          : stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-800">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {isPositive ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-xs text-zinc-600">vs last week</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{tx.customer}</p>
                  <p className="text-xs text-zinc-500">{tx.type} · {tx.time}</p>
                </div>
                <span className="text-sm font-mono text-emerald-400">{formatCurrency(tx.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {UPCOMING_BOOKINGS.map((bk) => (
              <div key={bk.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{bk.customer}</p>
                  <p className="text-xs text-zinc-500">{bk.bay} · {bk.time} · {bk.duration}</p>
                </div>
                <Badge variant={bk.status === 'confirmed' ? 'success' : 'warning'}>
                  {bk.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-white">6</p>
            <p className="text-xs text-zinc-500">Open Tabs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-white">4/6</p>
            <p className="text-xs text-zinc-500">Bays Occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(47200)}</p>
            <p className="text-xs text-zinc-500">Outstanding Tabs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-xs text-zinc-500">Staff On Duty</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
