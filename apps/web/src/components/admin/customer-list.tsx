'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@teesync/utils';
import {
  Search,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Star,
  ChevronRight,
} from 'lucide-react';

const DEMO_CUSTOMERS = [
  { id: '1', name: 'Mike Johnson', email: 'mike@email.com', phone: '555-0101', visits: 24, totalSpent: 345000, lastVisit: '2025-01-18', membership: 'VIP' },
  { id: '2', name: 'Sarah Williams', email: 'sarah@email.com', phone: '555-0102', visits: 18, totalSpent: 234000, lastVisit: '2025-01-19', membership: 'Premium' },
  { id: '3', name: 'Tom Davis', email: 'tom@email.com', phone: '555-0103', visits: 12, totalSpent: 156000, lastVisit: '2025-01-17', membership: 'Basic' },
  { id: '4', name: 'Emily Brown', email: 'emily@email.com', phone: '555-0104', visits: 31, totalSpent: 489000, lastVisit: '2025-01-20', membership: 'VIP' },
  { id: '5', name: 'Jake Miller', email: 'jake@email.com', phone: '555-0105', visits: 8, totalSpent: 98000, lastVisit: '2025-01-15', membership: null },
  { id: '6', name: 'Lisa Chen', email: 'lisa@email.com', phone: '555-0106', visits: 15, totalSpent: 187000, lastVisit: '2025-01-16', membership: 'Premium' },
  { id: '7', name: 'Ryan Park', email: 'ryan@email.com', phone: '555-0107', visits: 5, totalSpent: 67000, lastVisit: '2025-01-10', membership: null },
  { id: '8', name: 'Anna Kim', email: 'anna@email.com', phone: '555-0108', visits: 22, totalSpent: 298000, lastVisit: '2025-01-19', membership: 'VIP' },
];

const membershipColors: Record<string, 'success' | 'info' | 'warning'> = {
  VIP: 'success',
  Premium: 'info',
  Basic: 'warning',
};

export function CustomerList() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const filtered = DEMO_CUSTOMERS.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const detail = DEMO_CUSTOMERS.find((c) => c.id === selectedCustomer);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Customers</h2>
          <p className="text-sm text-zinc-500 mt-1">{DEMO_CUSTOMERS.length} total customers</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Customer list */}
        <div className="flex-1 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((customer) => (
              <button
                key={customer.id}
                onClick={() => setSelectedCustomer(customer.id)}
                className={`w-full p-4 rounded-xl text-left transition-colors border ${
                  selectedCustomer === customer.id
                    ? 'bg-emerald-600/10 border-emerald-500/30'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white">
                      {customer.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{customer.name}</p>
                        {customer.membership && (
                          <Badge variant={membershipColors[customer.membership] ?? 'secondary'} className="text-[10px] px-1.5">
                            {customer.membership}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-emerald-400">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-xs text-zinc-600">{customer.visits} visits</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Customer detail panel */}
        {detail && (
          <div className="hidden lg:block w-80 shrink-0">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-white mx-auto">
                    {detail.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-3">{detail.name}</h3>
                  {detail.membership && (
                    <Badge variant={membershipColors[detail.membership] ?? 'secondary'} className="mt-1">
                      <Star className="w-3 h-3 mr-1" /> {detail.membership} Member
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-zinc-600" />
                    <span className="text-zinc-300">{detail.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-zinc-600" />
                    <span className="text-zinc-300">{detail.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-zinc-600" />
                    <span className="text-zinc-300">Last visit: {detail.lastVisit}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-white">{detail.visits}</p>
                    <p className="text-xs text-zinc-500">Total Visits</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(detail.totalSpent)}</p>
                    <p className="text-xs text-zinc-500">Total Spent</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" size="sm">Edit</Button>
                  <Button variant="outline" className="flex-1" size="sm">Book</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
