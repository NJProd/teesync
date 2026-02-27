'use client';

import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatTime12 } from '@teesync/utils';
import type { Bay, Booking, Tab } from '@teesync/types';
import {
  Monitor,
  Clock,
  Users,
  Pause,
  AlertTriangle,
  Wrench,
  Wifi,
  Timer,
  ChevronRight,
} from 'lucide-react';

interface FloorViewProps {
  bays: Bay[];
  bookings: Booking[];
  tabs: Tab[];
  selectedBayId: string | null;
  onSelectBay: (bayId: string) => void;
}

type BayLiveStatus = 'available' | 'occupied' | 'upcoming' | 'reserved' | 'ending-soon';

function getSessionTimeRemaining(booking: Booking): number {
  const now = new Date();
  const [h, m] = booking.endTime.split(':').map(Number);
  const end = new Date();
  end.setHours(h!, m!, 0, 0);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 60000));
}

function getBayLiveStatus(bayBookings: Booking[]): BayLiveStatus {
  const now = new Date();
  const currentHH = now.getHours().toString().padStart(2, '0');
  const currentMM = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHH}:${currentMM}`;

  const checkedIn = bayBookings.find((b) => b.status === 'checked_in');
  if (checkedIn) {
    const remaining = getSessionTimeRemaining(checkedIn);
    return remaining <= 15 ? 'ending-soon' : 'occupied';
  }

  // Upcoming within the next 30 minutes
  const upcoming = bayBookings.find((b) => {
    if (b.status !== 'confirmed') return false;
    const [h, m] = b.startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(h!, m!, 0, 0);
    const diff = (start.getTime() - now.getTime()) / 60000;
    return diff > 0 && diff <= 30;
  });
  if (upcoming) return 'upcoming';

  const reserved = bayBookings.find(
    (b) => b.status === 'confirmed' && b.startTime > currentTime
  );
  if (reserved) return 'reserved';

  return 'available';
}

const STATUS_CONFIG: Record<
  BayLiveStatus,
  { bg: string; border: string; dot: string; label: string; textColor: string }
> = {
  available: {
    bg: 'bg-zinc-900/80',
    border: 'border-zinc-700/50',
    dot: 'bg-emerald-500',
    label: 'Available',
    textColor: 'text-emerald-400',
  },
  occupied: {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
    label: 'In Use',
    textColor: 'text-emerald-400',
  },
  upcoming: {
    bg: 'bg-blue-950/30',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
    label: 'Upcoming',
    textColor: 'text-blue-400',
  },
  reserved: {
    bg: 'bg-zinc-900/80',
    border: 'border-zinc-600/50',
    dot: 'bg-zinc-400',
    label: 'Reserved',
    textColor: 'text-zinc-400',
  },
  'ending-soon': {
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500 animate-pulse',
    label: 'Ending Soon',
    textColor: 'text-amber-400',
  },
};

export function FloorView({
  bays,
  bookings,
  tabs,
  selectedBayId,
  onSelectBay,
}: FloorViewProps) {
  const [now, setNow] = useState(new Date());

  // Tick every 30s for timer updates
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const bayData = useMemo(() => {
    return bays.map((bay) => {
      const bayBookings = bookings.filter(
        (b) => b.bayId === bay.id && b.date === now.toISOString().split('T')[0]
      );
      const currentBooking = bayBookings.find((b) => b.status === 'checked_in');
      const nextBooking = bayBookings
        .filter((b) => b.status === 'confirmed')
        .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
      const bayTab = tabs.find(
        (t) => t.bayId === bay.id && t.status === 'open'
      );
      const liveStatus = getBayLiveStatus(bayBookings);
      const remaining = currentBooking
        ? getSessionTimeRemaining(currentBooking)
        : null;

      return {
        bay,
        liveStatus,
        currentBooking,
        nextBooking,
        bayTab,
        remaining,
        bookingCount: bayBookings.filter(
          (b) => b.status !== 'cancelled' && b.status !== 'completed'
        ).length,
      };
    });
  }, [bays, bookings, tabs, now]);

  // Summary bar
  const summary = useMemo(() => {
    const counts = { available: 0, occupied: 0, upcoming: 0, reserved: 0, 'ending-soon': 0 };
    for (const d of bayData) counts[d.liveStatus]++;
    return counts;
  }, [bayData]);

  return (
    <div className="flex flex-col h-full">
      {/* Summary Strip */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-zinc-800 bg-zinc-900/60">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mr-2">
          Floor
        </h2>
        <SummaryPill color="emerald" count={summary.occupied + summary['ending-soon']} label="In Use" />
        <SummaryPill color="blue" count={summary.upcoming} label="Upcoming" />
        <SummaryPill color="zinc" count={summary.available} label="Open" />
      </div>

      {/* Bay Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {bayData.map(({ bay, liveStatus, currentBooking, nextBooking, bayTab, remaining, bookingCount }) => {
            const cfg = STATUS_CONFIG[liveStatus];
            const isSelected = bay.id === selectedBayId;

            return (
              <button
                key={bay.id}
                onClick={() => onSelectBay(bay.id)}
                className={cn(
                  'relative rounded-xl border-2 p-4 text-left transition-all',
                  'hover:scale-[1.02] active:scale-[0.98]',
                  cfg.bg,
                  isSelected ? 'border-emerald-500 ring-1 ring-emerald-500/30' : cfg.border,
                )}
              >
                {/* Bay Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Monitor className={cn('w-5 h-5', cfg.textColor)} />
                    <span className="text-base font-bold text-white">
                      {bay.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                    <span className={cn('text-xs font-medium', cfg.textColor)}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Simulator Tag */}
                {bay.simulator && (
                  <div className="flex items-center gap-1 mb-2">
                    <Wifi className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      {bay.simulator}
                    </span>
                  </div>
                )}

                {/* Current Session */}
                {currentBooking && (
                  <div className="rounded-lg bg-black/30 px-3 py-2 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white truncate mr-2">
                        {currentBooking.customerName}
                      </span>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs text-zinc-400">
                          {currentBooking.partySize}
                        </span>
                      </div>
                    </div>
                    {/* Timer */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <Timer
                        className={cn(
                          'w-3.5 h-3.5',
                          remaining !== null && remaining <= 15
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        )}
                      />
                      <span
                        className={cn(
                          'text-lg font-mono font-bold tabular-nums',
                          remaining !== null && remaining <= 15
                            ? 'text-amber-400'
                            : 'text-emerald-300'
                        )}
                      >
                        {remaining !== null
                          ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
                          : '--:--'}
                      </span>
                      <span className="text-[10px] text-zinc-500 ml-1">remaining</span>
                    </div>
                    {/* Time Range */}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-500">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime12(currentBooking.startTime)} – {formatTime12(currentBooking.endTime)}
                    </div>
                    {/* Tab total */}
                    {bayTab && (
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-700/50">
                        <span className="text-[10px] uppercase text-zinc-500">Tab</span>
                        <span className="text-sm font-semibold text-emerald-400 font-mono tabular-nums">
                          {formatCurrency(bayTab.total)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Next Up (when not occupied) */}
                {!currentBooking && nextBooking && (
                  <div className="rounded-lg bg-black/20 px-3 py-2">
                    <div className="text-[10px] uppercase text-zinc-500 mb-1">Next Up</div>
                    <div className="text-sm text-white font-medium truncate">
                      {nextBooking.customerName}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {formatTime12(nextBooking.startTime)}
                      <span className="text-zinc-600 mx-0.5">·</span>
                      <Users className="w-3 h-3" />
                      {nextBooking.partySize}
                    </div>
                  </div>
                )}

                {/* Empty bay CTA */}
                {!currentBooking && !nextBooking && (
                  <div className="text-center py-2">
                    <span className="text-xs text-zinc-600">
                      Tap to open walk-in or view schedule
                    </span>
                  </div>
                )}

                {/* Bay Features strip */}
                {(bay.features.length > 0 || bookingCount > 1) && (
                  <div className="flex items-center gap-2 mt-2">
                    {bay.features.map((f) => (
                      <span
                        key={f}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500"
                      >
                        {f}
                      </span>
                    ))}
                    {bookingCount > 1 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {bookingCount} bookings today
                      </span>
                    )}
                  </div>
                )}

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <ChevronRight className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryPill({ color, count, label }: { color: string; count: number; label: string }) {
  const classes: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    zinc: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
        classes[color]
      )}
    >
      <span className="font-bold tabular-nums">{count}</span>
      <span>{label}</span>
    </div>
  );
}
