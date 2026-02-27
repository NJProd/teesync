'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Lock, Delete } from 'lucide-react';

interface PinLockScreenProps {
  venueName: string;
  onUnlock: (pin: string) => void;
  error?: string;
}

export function PinLockScreen({ venueName, onUnlock, error }: PinLockScreenProps) {
  const [pin, setPin] = useState('');

  const handleDigit = useCallback((digit: string) => {
    setPin((prev) => {
      const next = prev + digit;
      if (next.length === 4) {
        setTimeout(() => onUnlock(next), 100);
      }
      return next.length <= 4 ? next : prev;
    });
  }, [onUnlock]);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
  }, []);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center">
      {/* Venue name */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600/20 mb-4">
          <Lock className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">{venueName}</h1>
        <p className="text-sm text-zinc-500 mt-1">Enter your PIN to unlock</p>
      </div>

      {/* PIN dots */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'w-4 h-4 rounded-full transition-all duration-150',
              i < pin.length
                ? 'bg-emerald-400 scale-110'
                : 'bg-zinc-700'
            )}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-sm mb-4 animate-pulse">{error}</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {digits.map((digit, i) => {
          if (digit === '') {
            return <div key={i} />;
          }

          if (digit === 'del') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                onDoubleClick={handleClear}
                className="h-16 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center transition-colors touch-target"
              >
                <Delete className="w-6 h-6 text-zinc-400" />
              </button>
            );
          }

          return (
            <button
              key={i}
              onClick={() => handleDigit(digit)}
              className="h-16 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-2xl font-semibold text-white transition-colors touch-target"
            >
              {digit}
            </button>
          );
        })}
      </div>

      {/* Demo hint */}
      <p className="text-xs text-zinc-700 mt-8">Demo: try 1234</p>
    </div>
  );
}
