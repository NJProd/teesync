'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@teesync/utils';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Filter,
  Clock,
  User,
} from 'lucide-react';

const DEMO_BOOKINGS = [
  { id: '1', customer: 'Mike Johnson', bay: 'Bay 1', date: '2025-01-20', startTime: '09:00', endTime: '11:00', status: 'checked_in', amount: 12000, phone: '555-0101' },
  { id: '2', customer: 'Sarah Williams', bay: 'Bay 2', date: '2025-01-20', startTime: '10:00', endTime: '11:30', status: 'confirmed', amount: 9000, phone: '555-0102' },
  { id: '3', customer: 'Tom Davis', bay: 'Bay 3', date: '2025-01-20', startTime: '12:00', endTime: '14:00', status: 'confirmed', amount: 10000, phone: '555-0103' },
  { id: '4', customer: 'Emily Brown', bay: 'Bay 1', date: '2025-01-20', startTime: '13:00', endTime: '15:00', status: 'pending', amount: 12000, phone: '555-0104' },
  { id: '5', customer: 'Jake Miller', bay: 'Bay 5', date: '2025-01-20', startTime: '14:00', endTime: '16:00', status: 'confirmed', amount: 9000, phone: '555-0105' },
  { id: '6', customer: 'Lisa Chen', bay: 'Bay 4', date: '2025-01-20', startTime: '16:00', endTime: '18:00', status: 'pending', amount: 10000, phone: '555-0106' },
  { id: '7', customer: 'Ryan Park', bay: 'Bay 6', date: '2025-01-20', startTime: '17:00', endTime: '19:00', status: 'cancelled', amount: 9000, phone: '555-0107' },
];

const statusColors: Record<string, 'success' | 'info' | 'warning' | 'destructive' | 'secondary'> = {
  confirmed: 'info',
  checked_in: 'success',
  pending: 'warning',
  cancelled: 'destructive',
  completed: 'secondary',
  no_show: 'destructive',
};

export function BookingsManager() {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = DEMO_BOOKINGS.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.customer.toLowerCase().includes(q) || b.bay.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Bookings</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage bay reservations</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> New Booking
        </Button>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedDate((d) => new Date(d.getTime() - 86400000))}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <button
          onClick={() => setSelectedDate((d) => new Date(d.getTime() + 86400000))}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSelectedDate(new Date())}
          className="text-xs text-emerald-400 hover:text-emerald-300 ml-2"
        >
          Today
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'pending', 'confirmed', 'checked_in', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-emerald-600/15 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Customer</th>
                  <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Bay</th>
                  <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Time</th>
                  <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Status</th>
                  <th className="text-right text-xs text-zinc-500 font-medium px-4 py-3">Amount</th>
                  <th className="text-right text-xs text-zinc-500 font-medium px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-zinc-600" />
                        <div>
                          <p className="text-white font-medium">{b.customer}</p>
                          <p className="text-xs text-zinc-600">{b.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{b.bay}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        {b.startTime} – {b.endTime}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[b.status] ?? 'secondary'}>
                        {b.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300">
                      {formatCurrency(b.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-zinc-600">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
