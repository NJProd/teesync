'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  User,
  Shield,
  ShieldCheck,
  Crown,
  ToggleLeft,
  ToggleRight,
  Pencil,
} from 'lucide-react';

const DEMO_EMPLOYEES = [
  { id: '1', name: 'Alex Rivera', role: 'owner', pin: '1234', email: 'alex@venue.com', isActive: true, clockedIn: true },
  { id: '2', name: 'Jordan Chang', role: 'manager', pin: '5678', email: 'jordan@venue.com', isActive: true, clockedIn: true },
  { id: '3', name: 'Casey Brooks', role: 'bartender', pin: '1111', email: 'casey@venue.com', isActive: true, clockedIn: true },
  { id: '4', name: 'Morgan Lee', role: 'server', pin: '2222', email: 'morgan@venue.com', isActive: true, clockedIn: false },
  { id: '5', name: 'Taylor Kim', role: 'server', pin: '3333', email: 'taylor@venue.com', isActive: true, clockedIn: false },
  { id: '6', name: 'Sam Patel', role: 'kitchen', pin: '4444', email: 'sam@venue.com', isActive: false, clockedIn: false },
];

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown className="w-4 h-4 text-amber-400" />,
  admin: <ShieldCheck className="w-4 h-4 text-red-400" />,
  manager: <ShieldCheck className="w-4 h-4 text-blue-400" />,
  bartender: <Shield className="w-4 h-4 text-purple-400" />,
  server: <Shield className="w-4 h-4 text-emerald-400" />,
  kitchen: <Shield className="w-4 h-4 text-orange-400" />,
};

const roleColors: Record<string, 'warning' | 'destructive' | 'info' | 'secondary' | 'success'> = {
  owner: 'warning',
  admin: 'destructive',
  manager: 'info',
  bartender: 'secondary',
  server: 'success',
  kitchen: 'warning',
};

export function EmployeeManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Management</h2>
          <p className="text-sm text-zinc-500 mt-1">{DEMO_EMPLOYEES.length} team members</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      {/* Quick stats */}
      <div className="flex gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
          <span className="text-emerald-400 font-bold">{DEMO_EMPLOYEES.filter((e) => e.clockedIn).length}</span>
          <span className="text-zinc-500 text-sm ml-2">Clocked In</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
          <span className="text-white font-bold">{DEMO_EMPLOYEES.filter((e) => e.isActive).length}</span>
          <span className="text-zinc-500 text-sm ml-2">Active</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
          <span className="text-zinc-500 font-bold">{DEMO_EMPLOYEES.filter((e) => !e.isActive).length}</span>
          <span className="text-zinc-500 text-sm ml-2">Inactive</span>
        </div>
      </div>

      {/* Employee cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_EMPLOYEES.map((emp) => (
          <Card key={emp.id} className={!emp.isActive ? 'opacity-50' : ''}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white">
                    {emp.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{emp.name}</h3>
                      {emp.clockedIn && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {roleIcons[emp.role]}
                      <Badge variant={roleColors[emp.role] ?? 'secondary'} className="text-[10px] capitalize">
                        {emp.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-zinc-500">
                <p>{emp.email}</p>
                <p>PIN: {emp.pin}</p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-600">
                  {emp.clockedIn ? 'Currently working' : 'Off duty'}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  {emp.isActive ? (
                    <ToggleRight className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-zinc-600" />
                  )}
                  <span className={emp.isActive ? 'text-emerald-400' : 'text-zinc-600'}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
