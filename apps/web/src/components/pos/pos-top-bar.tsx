'use client';

import type { Employee } from '@teesync/types';
import {
  Monitor,
  Lock,
  Maximize2,
  User,
  Clock,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface POSTopBarProps {
  employee: Employee;
  venueName: string;
  onLock: () => void;
}

export function POSTopBar({ employee, venueName, onLock }: POSTopBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  return (
    <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
      {/* Left: Venue Name */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
          <Monitor className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-white text-sm">{venueName}</span>
      </div>

      {/* Center: Date & Time */}
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-zinc-400">{formattedDate}</span>
        <span className="text-white font-mono tabular-nums">{formattedTime}</span>
      </div>

      {/* Right: Employee + Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-300">
            {employee.firstName} {employee.lastName}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 uppercase">
            {employee.role}
          </span>
        </div>
        <div className="w-px h-5 bg-zinc-800" />
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={onLock}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Lock Screen"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
