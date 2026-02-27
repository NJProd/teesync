'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@teesync/utils';
import type { Bay, Booking } from '@teesync/types';
import { shortId } from '@teesync/utils';
import {
  X,
  Users,
  Clock,
  Monitor,
  UserPlus,
  CalendarCheck,
  Minus,
  Plus,
} from 'lucide-react';

interface WalkInDialogProps {
  bays: Bay[];
  selectedBayId?: string | null;
  onClose: () => void;
  onConfirm: (booking: Booking) => void;
}

const DURATION_OPTIONS = [30, 60, 90, 120, 180];

export function WalkInDialog({
  bays,
  selectedBayId,
  onClose,
  onConfirm,
}: WalkInDialogProps) {
  const availableBays = bays.filter((b) => b.active);
  const [bayId, setBayId] = useState(selectedBayId ?? availableBays[0]?.id ?? '');
  const [customerName, setCustomerName] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [duration, setDuration] = useState(60);

  const selectedBay = bays.find((b) => b.id === bayId);
  const price = selectedBay
    ? Math.round((selectedBay.hourlyRate * duration) / 60)
    : 0;

  const now = new Date();
  const startH = now.getHours().toString().padStart(2, '0');
  const startM = (Math.ceil(now.getMinutes() / 15) * 15 % 60)
    .toString()
    .padStart(2, '0');
  const startTime = `${startH}:${startM}`;
  const endDate = new Date(now.getTime() + duration * 60000);
  const endH = endDate.getHours().toString().padStart(2, '0');
  const endM = endDate.getMinutes().toString().padStart(2, '0');
  const endTime = `${endH}:${endM}`;

  function handleConfirm() {
    if (!customerName.trim() || !bayId) return;
    const booking: Booking = {
      id: shortId(),
      tenantId: 'demo',
      bayId,
      date: now.toISOString().split('T')[0]!,
      startTime,
      endTime,
      durationMinutes: duration,
      status: 'checked_in',
      source: 'walk_in',
      price,
      depositPaid: 0,
      isPeakRate: false,
      customerName: customerName.trim(),
      partySize,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    onConfirm(booking);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Walk-In</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer Name */}
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter name..."
              autoFocus
              className="w-full h-11 px-4 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Bay Selection */}
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">
              Bay
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableBays.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBayId(b.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors text-xs',
                    bayId === b.id
                      ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                  )}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="font-medium">{b.name}</span>
                  {b.simulator && (
                    <span className="text-[9px] text-zinc-500">{b.simulator}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Party Size */}
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">
              Party Size
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-zinc-500" />
                <span className="text-xl font-bold text-white tabular-nums w-8 text-center">
                  {partySize}
                </span>
              </div>
              <button
                onClick={() =>
                  setPartySize(
                    Math.min(selectedBay?.maxOccupancy ?? 8, partySize + 1)
                  )
                }
                className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
              >
                <Plus className="w-4 h-4" />
              </button>
              {selectedBay && (
                <span className="text-xs text-zinc-600 ml-2">
                  Max {selectedBay.maxOccupancy}
                </span>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">
              Duration
            </label>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    duration === d
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 border border-transparent'
                  )}
                >
                  {d >= 60 ? `${d / 60}h` : `${d}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Bay Rate</span>
              <span className="text-zinc-300">
                {selectedBay ? formatCurrency(selectedBay.hourlyRate) + '/hr' : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-zinc-400">Duration</span>
              <span className="text-zinc-300">{duration} min</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-zinc-400">Time</span>
              <span className="text-zinc-300 font-mono tabular-nums">
                {startTime} – {endTime}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-700/50">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                {formatCurrency(price)}
              </span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="px-6 py-4 border-t border-zinc-800">
          <Button
            onClick={handleConfirm}
            disabled={!customerName.trim() || !bayId}
            className="w-full h-12 text-base font-bold"
          >
            <CalendarCheck className="w-5 h-5 mr-2" />
            Start Session — {formatCurrency(price)}
          </Button>
        </div>
      </div>
    </div>
  );
}
