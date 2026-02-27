'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTime12 } from '@teesync/utils';
import type { Booking } from '@teesync/types';
import {
  X,
  ClipboardCheck,
  Clock,
  Users,
  Monitor,
  CreditCard,
  AlertCircle,
  Search,
} from 'lucide-react';

interface CheckInDialogProps {
  bookings: Booking[]; // all today's confirmed + pending bookings (across all bays)
  bayNames: Record<string, string>;
  onClose: () => void;
  onCheckIn: (bookingId: string) => void;
}

export function CheckInDialog({
  bookings,
  bayNames,
  onClose,
  onCheckIn,
}: CheckInDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredBookings = bookings.filter(
    (b) =>
      (b.status === 'confirmed' || b.status === 'pending') &&
      (search.trim() === '' ||
        b.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (b.customerEmail ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const selected = filteredBookings.find((b) => b.id === selectedId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Check In</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-zinc-800/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              autoFocus
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Booking List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredBookings.length === 0 ? (
            <div className="px-6 py-8 text-center text-zinc-600">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No bookings to check in</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {filteredBookings.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => setSelectedId(booking.id)}
                  className={cn(
                    'w-full text-left px-6 py-3 transition-colors',
                    selectedId === booking.id
                      ? 'bg-emerald-950/30'
                      : 'hover:bg-zinc-800/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {booking.customerName}
                        </span>
                        <Badge
                          variant={booking.status === 'pending' ? 'warning' : 'info'}
                          className="text-[9px]"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Monitor className="w-3 h-3" />
                          {bayNames[booking.bayId] ?? booking.bayId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime12(booking.startTime)} – {formatTime12(booking.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {booking.partySize}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <span className="text-sm font-medium text-zinc-300 font-mono tabular-nums">
                        {formatCurrency(booking.price)}
                      </span>
                      {booking.depositPaid > 0 && (
                        <div className="text-[10px] text-emerald-500 mt-0.5">
                          <CreditCard className="w-2.5 h-2.5 inline mr-0.5" />
                          {formatCurrency(booking.depositPaid)} deposit
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action */}
        <div className="px-6 py-4 border-t border-zinc-800">
          <Button
            onClick={() => selectedId && onCheckIn(selectedId)}
            disabled={!selectedId}
            className="w-full h-12 text-base font-bold"
          >
            <ClipboardCheck className="w-5 h-5 mr-2" />
            {selected
              ? `Check In — ${selected.customerName}`
              : 'Select a booking'}
          </Button>
        </div>
      </div>
    </div>
  );
}
