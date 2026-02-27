'use client';

import { useState } from 'react';
import { useTenant } from '@/lib/tenant-context';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UtensilsCrossed,
  Package,
  BarChart3,
  Settings,
  CreditCard,
  Trophy,
  Gift,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

// Sub-page components
import { DashboardOverview } from '@/components/admin/dashboard-overview';
import { BookingsManager } from '@/components/admin/bookings-manager';
import { MenuManager } from '@/components/admin/menu-manager';
import { CustomerList } from '@/components/admin/customer-list';
import { EmployeeManager } from '@/components/admin/employee-manager';
import { ReportsView } from '@/components/admin/reports-view';
import { VenueSettings } from '@/components/admin/venue-settings';

type AdminTab =
  | 'dashboard'
  | 'bookings'
  | 'menu'
  | 'customers'
  | 'employees'
  | 'reports'
  | 'settings';

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'bookings', label: 'Bookings', icon: <CalendarDays className="w-5 h-5" /> },
  { id: 'menu', label: 'Menu & Items', icon: <UtensilsCrossed className="w-5 h-5" /> },
  { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
  { id: 'employees', label: 'Staff', icon: <Users className="w-5 h-5" /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export default function AdminPage() {
  const { tenant } = useTenant();
  const { employee, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-zinc-900 border-r border-zinc-800 shrink-0">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-lg font-bold text-white">{tenant?.name ?? 'Venue'}</h1>
          <p className="text-xs text-zinc-500">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600/15 text-emerald-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
              {employee?.firstName?.[0] ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{employee?.firstName ?? 'Admin'} {employee?.lastName ?? ''}</p>
              <p className="text-xs text-zinc-500 capitalize">{employee?.role ?? 'owner'}</p>
            </div>
            <button onClick={signOut} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h1 className="text-lg font-bold text-white">{tenant?.name ?? 'Venue'}</h1>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-zinc-800">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-emerald-600/15 text-emerald-400'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded hover:bg-zinc-800">
            <Menu className="w-5 h-5 text-zinc-400" />
          </button>
          <h2 className="font-bold text-white text-sm">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'bookings' && <BookingsManager />}
          {activeTab === 'menu' && <MenuManager />}
          {activeTab === 'customers' && <CustomerList />}
          {activeTab === 'employees' && <EmployeeManager />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <VenueSettings />}
        </div>
      </main>
    </div>
  );
}
