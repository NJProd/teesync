'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTime12 } from '@teesync/utils';
import type { Bay, Booking, Tab } from '@teesync/types';
import {
  Monitor,
  Clock,
  Users,
  Timer,
  Play,
  Square,
  PlusCircle,
  ArrowRightLeft,
  CalendarPlus,
  CreditCard,
  ClipboardCheck,
  UserPlus,
  AlertCircle,
  ChevronRight,
  MapPin,
  Wifi,
} from 'lucide-react';

interface BayDetailPanelProps {
  bay: Bay;
  bookings: Booking[];
  tab: Tab | null;
  onCheckIn: (booking: Booking) => void;
  onStartWalkIn: () => void;
  onEndSession: (booking: Booking) => void;
  onExtendTime: (booking: Booking) => void;
  onOpenTab: () => void;
  onTransferBay: (booking: Booking) => void;
  onViewTab: () => void;
}

export function BayDetailPanel({
  bay,
  bookings,
  tab,
  onCheckIn,
  onStartWalkIn,
  onEndSession,
  onExtendTime,
  onOpenTab,
  onTransferBay,
  onViewTab,
}: BayDetailPanelProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = now.toISOString().split('T')[0];
  const todayBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.bayId === bay.id && b.date === todayStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookings, bay.id, todayStr]
  );

  const activeBooking = todayBookings.find((b) => b.status === 'checked_in');
  const upcomingBookings = todayBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!activeBooking) return null;
    const [h, m] = activeBooking.endTime.split(':').map(Number);
    const end = new Date();
    end.setHours(h!, m!, 0, 0);
    const mins = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
    const hours = Math.floor(mins / 3600);
    const minutes = Math.floor((mins % 3600) / 60);
    const seconds = mins % 60;
    return { hours, minutes, seconds, totalMinutes: Math.floor(mins / 60) };
  }, [activeBooking, now]);

  return (
    <div className="flex flex-col h-full">
      {/* Bay Header */}
      <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                activeBooking
                  ? 'bg-emerald-600/20'
                  : 'bg-zinc-800'
              )}
            >
              <Monitor
                className={cn(
                  'w-5 h-5',
                  activeBooking ? 'text-emerald-400' : 'text-zinc-500'
                )}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{bay.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {bay.simulator && (
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Wifi className="w-3 h-3" /> {bay.simulator}
                  </span>
                )}
                <span className="text-xs text-zinc-600">·</span>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Users className="w-3 h-3" /> Max {bay.maxOccupancy}
                </span>
                <span className="text-xs text-zinc-600">·</span>
                <span className="text-xs text-zinc-500">
                  {formatCurrency(bay.hourlyRate)}/hr
                </span>
              </div>
            </div>
          </div>
          {bay.features.length > 0 && (
            <div className="flex gap-1">
              {bay.features.map((f) => (
                <Badge key={f} variant="secondary" className="text-[10px]">
                  {f}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ─── Active Session Card ───────────────────────────── */}
        {activeBooking && (
          <div className="mx-5 mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 overflow-hidden">
            <div className="px-4 py-3 border-b border-emerald-500/20 bg-emerald-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">
                    Active Session
                  </span>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Checked In
                </Badge>
              </div>
            </div>

            <div className="p-4">
              {/* Customer & Party */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeBooking.customerName}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {activeBooking.partySize} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{' '}
                      {activeBooking.source === 'walk_in'
                        ? 'Walk-in'
                        : activeBooking.source === 'online'
                          ? 'Online'
                          : 'Phone'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="rounded-xl bg-black/40 p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase text-zinc-500 tracking-wider mb-1">
                      Time Remaining
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={cn(
                          'text-4xl font-mono font-black tabular-nums tracking-tight',
                          timeRemaining && timeRemaining.totalMinutes <= 15
                            ? 'text-amber-400'
                            : 'text-emerald-300'
                        )}
                      >
                        {timeRemaining
                          ? `${timeRemaining.hours}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`
                          : '--:--:--'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">
                      {formatTime12(activeBooking.startTime)} – {formatTime12(activeBooking.endTime)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {activeBooking.durationMinutes} min session
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {timeRemaining && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-1000',
                          timeRemaining.totalMinutes <= 15
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        )}
                        style={{
                          width: `${Math.max(
                            2,
                            100 -
                              (timeRemaining.totalMinutes /
                                activeBooking.durationMinutes) *
                                100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tab Summary */}
              {tab && (
                <div
                  onClick={onViewTab}
                  className="rounded-lg bg-zinc-800/60 px-4 py-3 mb-3 cursor-pointer hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 tracking-wider">
                        Open Tab
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg font-bold text-white font-mono tabular-nums">
                          {formatCurrency(tab.total)}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {tab.items.length} items
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>
              )}

              {/* Session Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExtendTime(activeBooking)}
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  Extend Time
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTransferBay(activeBooking)}
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-950/30"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
                  Transfer Bay
                </Button>
                {!tab && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenTab}
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  >
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                    Open Tab
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEndSession(activeBooking)}
                  className="border-red-500/30 text-red-400 hover:bg-red-950/30"
                >
                  <Square className="w-3.5 h-3.5 mr-1.5" />
                  End Session
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── No Active Session — Bay Actions ───────────────── */}
        {!activeBooking && (
          <div className="mx-5 mt-4 rounded-xl border border-zinc-700/50 bg-zinc-900/60 p-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-2">
                <Monitor className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-400">Bay is available</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onStartWalkIn}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Walk-In
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenTab}
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                Quick Tab
              </Button>
            </div>
          </div>
        )}

        {/* ─── Upcoming Bookings ─────────────────────────────── */}
        {upcomingBookings.length > 0 && (
          <div className="mx-5 mt-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Upcoming Today
            </h3>
            <div className="space-y-2">
              {upcomingBookings.map((booking) => {
                const [h, m] = booking.startTime.split(':').map(Number);
                const start = new Date();
                start.setHours(h!, m!, 0, 0);
                const minsUntil = Math.max(
                  0,
                  Math.floor((start.getTime() - now.getTime()) / 60000)
                );
                const isPending = booking.status === 'pending';

                return (
                  <div
                    key={booking.id}
                    className={cn(
                      'rounded-lg border p-3',
                      isPending
                        ? 'border-amber-500/20 bg-amber-950/10'
                        : 'border-zinc-700/50 bg-zinc-900/80'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">
                            {booking.customerName}
                          </span>
                          {isPending && (
                            <Badge variant="warning" className="text-[9px]">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {formatTime12(booking.startTime)} – {formatTime12(booking.endTime)}
                          <span className="text-zinc-600">·</span>
                          <Users className="w-3 h-3" />
                          {booking.partySize}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {minsUntil <= 30 && (
                          <span className="text-xs text-amber-400 font-mono tabular-nums">
                            {minsUntil}m
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCheckIn(booking)}
                          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30 text-xs h-7"
                        >
                          <ClipboardCheck className="w-3 h-3 mr-1" />
                          Check In
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Today's Schedule Timeline ─────────────────────── */}
        <div className="mx-5 mt-4 mb-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Full Schedule
          </h3>
          {todayBookings.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">No bookings today</p>
          ) : (
            <div className="space-y-1">
              {todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs',
                    booking.status === 'checked_in'
                      ? 'bg-emerald-950/20 text-emerald-300'
                      : booking.status === 'completed'
                        ? 'bg-zinc-800/30 text-zinc-500 line-through'
                        : booking.status === 'cancelled'
                          ? 'bg-red-950/10 text-red-400/50 line-through'
                          : 'bg-zinc-800/50 text-zinc-400'
                  )}
                >
                  <span className="font-mono tabular-nums w-24 shrink-0">
                    {formatTime12(booking.startTime)} – {formatTime12(booking.endTime)}
                  </span>
                  <span className="truncate flex-1">{booking.customerName}</span>
                  <span className="text-[10px] uppercase">
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
