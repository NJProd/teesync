'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@teesync/utils';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  ShoppingCart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

type ReportPeriod = 'today' | 'week' | 'month' | 'year';

const PERIOD_DATA: Record<ReportPeriod, { revenue: number; transactions: number; avgTicket: number; customers: number; bookings: number; topItems: { name: string; quantity: number; revenue: number }[] }> = {
  today: {
    revenue: 285000,
    transactions: 38,
    avgTicket: 7500,
    customers: 24,
    bookings: 18,
    topItems: [
      { name: 'Bay Rental (1hr)', quantity: 18, revenue: 108000 },
      { name: 'IPA Draft', quantity: 42, revenue: 33600 },
      { name: 'Wings (12pc)', quantity: 15, revenue: 24000 },
      { name: 'Old Fashioned', quantity: 12, revenue: 16800 },
      { name: 'Classic Burger', quantity: 10, revenue: 16000 },
    ],
  },
  week: {
    revenue: 1856000,
    transactions: 245,
    avgTicket: 7575,
    customers: 132,
    bookings: 98,
    topItems: [
      { name: 'Bay Rental (1hr)', quantity: 98, revenue: 588000 },
      { name: 'IPA Draft', quantity: 287, revenue: 229600 },
      { name: 'Wings (12pc)', quantity: 89, revenue: 142400 },
      { name: 'Margarita', quantity: 76, revenue: 98800 },
      { name: 'Classic Burger', quantity: 65, revenue: 104000 },
    ],
  },
  month: {
    revenue: 7845000,
    transactions: 1024,
    avgTicket: 7660,
    customers: 342,
    bookings: 412,
    topItems: [
      { name: 'Bay Rental (1hr)', quantity: 412, revenue: 2472000 },
      { name: 'IPA Draft', quantity: 1156, revenue: 924800 },
      { name: 'Wings (12pc)', quantity: 389, revenue: 622400 },
      { name: 'Margarita', quantity: 312, revenue: 405600 },
      { name: 'Classic Burger', quantity: 278, revenue: 444800 },
    ],
  },
  year: {
    revenue: 89450000,
    transactions: 11876,
    avgTicket: 7531,
    customers: 2156,
    bookings: 4890,
    topItems: [
      { name: 'Bay Rental (1hr)', quantity: 4890, revenue: 29340000 },
      { name: 'IPA Draft', quantity: 13245, revenue: 10596000 },
      { name: 'Wings (12pc)', quantity: 4567, revenue: 7307200 },
      { name: 'Margarita', quantity: 3890, revenue: 5057000 },
      { name: 'Classic Burger', quantity: 3234, revenue: 5174400 },
    ],
  },
};

const HOURLY_BREAKDOWN = [
  { hour: '9 AM', revenue: 12000 },
  { hour: '10 AM', revenue: 18000 },
  { hour: '11 AM', revenue: 22000 },
  { hour: '12 PM', revenue: 35000 },
  { hour: '1 PM', revenue: 32000 },
  { hour: '2 PM', revenue: 28000 },
  { hour: '3 PM', revenue: 25000 },
  { hour: '4 PM', revenue: 30000 },
  { hour: '5 PM', revenue: 38000 },
  { hour: '6 PM', revenue: 42000 },
  { hour: '7 PM', revenue: 45000 },
  { hour: '8 PM', revenue: 40000 },
  { hour: '9 PM', revenue: 28000 },
];

export function ReportsView() {
  const [period, setPeriod] = useState<ReportPeriod>('today');
  const data = PERIOD_DATA[period];
  const maxRevenue = Math.max(...HOURLY_BREAKDOWN.map((h) => h.revenue));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports</h2>
          <p className="text-sm text-zinc-500 mt-1">Revenue and performance analytics</p>
        </div>
        <div className="flex gap-1.5 bg-zinc-800 rounded-xl p-1">
          {(['today', 'week', 'month', 'year'] as ReportPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                period === p
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Revenue</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(data.revenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Transactions</p>
            <p className="text-xl font-bold text-white mt-1">{data.transactions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Avg Ticket</p>
            <p className="text-xl font-bold text-white mt-1">{formatCurrency(data.avgTicket)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Customers</p>
            <p className="text-xl font-bold text-white mt-1">{data.customers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Bookings</p>
            <p className="text-xl font-bold text-white mt-1">{data.bookings}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly revenue chart (simple bar) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hourly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-40">
              {HOURLY_BREAKDOWN.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-emerald-600/30 rounded-sm hover:bg-emerald-600/50 transition-colors"
                    style={{ height: `${(h.revenue / maxRevenue) * 100}%` }}
                    title={`${h.hour}: ${formatCurrency(h.revenue)}`}
                  />
                  <span className="text-[9px] text-zinc-600 -rotate-45 origin-top-left whitespace-nowrap">
                    {h.hour}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top selling items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{item.name}</p>
                  <p className="text-xs text-zinc-600">{item.quantity} sold</p>
                </div>
                <span className="text-sm font-mono text-emerald-400">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
