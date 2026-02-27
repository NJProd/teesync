'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatTime12 } from '@teesync/utils';
import type { Bay, Booking } from '@teesync/types';
import { Monitor, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface TeeSheetProps {
  bays: Bay[];
  bookings: Booking[];
  selectedBayId: string | null;
  onSelectBay: (bayId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
  confirmed: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
  checked_in: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  completed: 'bg-zinc-700/50 border-zinc-600 text-zinc-400',
  cancelled: 'bg-red-500/10 border-red-500/30 text-red-400',
  no_show: 'bg-red-500/10 border-red-500/30 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  completed: 'Done',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export function TeeSheet({ bays, bookings, selectedBayId, onSelectBay }: TeeSheetProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]!);

  // Group bookings by bay
  const bookingsByBay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const bay of bays) {
      map.set(bay.id, []);
    }
    for (const booking of bookings) {
      if (booking.date === selectedDate) {
        const bayBookings = map.get(booking.bayId);
        if (bayBookings) bayBookings.push(booking);
      }
    }
    return map;
  }, [bays, bookings, selectedDate]);

  // Navigate date
  function changeDate(delta: number) {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]!);
  }

  const dateDisplay = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col h-full">
      {/* Date Header */}
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Tee Sheet</h2>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-400" />
          </button>
          <span className="text-sm font-medium text-white">{dateDisplay}</span>
          <button
            onClick={() => changeDate(1)}
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Bay List */}
      <div className="flex-1 overflow-y-auto">
        {bays.map((bay) => {
          const bayBookings = bookingsByBay.get(bay.id) ?? [];
          const isSelected = bay.id === selectedBayId;
          const hasCheckedIn = bayBookings.some((b) => b.status === 'checked_in');

          return (
            <button
              key={bay.id}
              onClick={() => onSelectBay(bay.id)}
              className={cn(
                'w-full text-left p-3 border-b border-zinc-800/50 transition-colors',
                isSelected
                  ? 'bg-emerald-950/30 border-l-2 border-l-emerald-500'
                  : 'hover:bg-zinc-900/50 border-l-2 border-l-transparent'
              )}
            >
              {/* Bay Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Monitor className={cn('w-4 h-4', hasCheckedIn ? 'text-emerald-400' : 'text-zinc-500')} />
                  <span className="font-medium text-sm text-white">{bay.name}</span>
                </div>
                {bay.simulator && (
                  <span className="text-[10px] text-zinc-500 font-mono">{bay.simulator}</span>
                )}
              </div>

              {/* Bookings for this bay */}
              {bayBookings.length === 0 ? (
                <div className="text-xs text-zinc-600 italic">No bookings</div>
              ) : (
                <div className="space-y-1.5">
                  {bayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={cn(
                        'rounded-md border px-2 py-1.5 text-xs',
                        STATUS_COLORS[booking.status] ?? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate max-w-[120px]">
                          {booking.customerName}
                        </span>
                        <Badge
                          variant={
                            booking.status === 'checked_in'
                              ? 'success'
                              : booking.status === 'confirmed'
                                ? 'info'
                                : booking.status === 'pending'
                                  ? 'warning'
                                  : 'secondary'
                          }
                          className="text-[9px] px-1.5 py-0"
                        >
                          {STATUS_LABELS[booking.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatTime12(booking.startTime)} – {formatTime12(booking.endTime)}
                        </span>
                        <Users className="w-3 h-3 ml-1" />
                        <span>{booking.partySize}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
