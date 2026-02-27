'use client';

import { useState, useMemo, useCallback } from 'react';
import { FloorView } from '@/components/pos/floor-view';
import { BayDetailPanel } from '@/components/pos/bay-detail-panel';
import { ActiveTab } from '@/components/pos/active-tab';
import { MenuGrid } from '@/components/pos/menu-grid';
import { POSTopBar } from '@/components/pos/pos-top-bar';
import { OpenTabs } from '@/components/pos/open-tabs';
import { PinLockScreen } from '@/components/pos/pin-lock-screen';
import { CheckoutDialog } from '@/components/pos/checkout-dialog';
import { WalkInDialog } from '@/components/pos/walk-in-dialog';
import { CheckInDialog } from '@/components/pos/check-in-dialog';
import { QuickSaleDialog } from '@/components/pos/quick-sale-dialog';
import { TeeSheet } from '@/components/booking/tee-sheet';
import { cn } from '@/lib/utils';
import type {
  Bay,
  Booking,
  Tab,
  TabItem,
  MenuItem as MenuItemType,
  Employee,
  MenuCategory as CategoryType,
} from '@teesync/types';
import { shortId } from '@teesync/utils';
import {
  LayoutGrid,
  UtensilsCrossed,
  CalendarDays,
  UserPlus,
  ClipboardCheck,
  ShoppingBag,
} from 'lucide-react';

type POSView = 'floor' | 'order' | 'schedule';

// ── Demo Data ──────────────────────────────────────────────────────────────

const DEMO_BAYS: Bay[] = [
  { id: 'bay-1', tenantId: 'demo', name: 'Bay 1', type: 'simulator', sortOrder: 1, hourlyRate: 5000, peakHourlyRate: 6500, maxOccupancy: 6, simulator: 'TrackMan', features: ['Lounge Seating'], active: true, createdAt: '', updatedAt: '' },
  { id: 'bay-2', tenantId: 'demo', name: 'Bay 2', type: 'simulator', sortOrder: 2, hourlyRate: 5000, peakHourlyRate: 6500, maxOccupancy: 6, simulator: 'TrackMan', features: [], active: true, createdAt: '', updatedAt: '' },
  { id: 'bay-3', tenantId: 'demo', name: 'Bay 3', type: 'simulator', sortOrder: 3, hourlyRate: 4500, peakHourlyRate: 6000, maxOccupancy: 4, simulator: 'Full Swing', features: [], active: true, createdAt: '', updatedAt: '' },
  { id: 'bay-4', tenantId: 'demo', name: 'Bay 4', type: 'simulator', sortOrder: 4, hourlyRate: 4500, peakHourlyRate: 6000, maxOccupancy: 4, simulator: 'Full Swing', features: ['Private Room'], active: true, createdAt: '', updatedAt: '' },
  { id: 'bay-5', tenantId: 'demo', name: 'Bay 5', type: 'simulator', sortOrder: 5, hourlyRate: 4000, peakHourlyRate: 5500, maxOccupancy: 6, simulator: 'Golfzon', features: [], active: true, createdAt: '', updatedAt: '' },
  { id: 'bay-6', tenantId: 'demo', name: 'Bay 6', type: 'simulator', sortOrder: 6, hourlyRate: 4000, peakHourlyRate: 5500, maxOccupancy: 8, simulator: 'Golfzon', features: ['Party Room'], active: true, createdAt: '', updatedAt: '' },
];

const todayStr = new Date().toISOString().split('T')[0]!;

const DEMO_BOOKINGS: Booking[] = [
  { id: 'bk-1', tenantId: 'demo', bayId: 'bay-1', date: todayStr, startTime: '10:00', endTime: '12:00', durationMinutes: 120, status: 'checked_in', source: 'online', price: 10000, depositPaid: 2500, isPeakRate: false, customerName: 'Mike Johnson', customerEmail: 'mike@email.com', partySize: 4, createdAt: '', updatedAt: '', tabId: 'tab-1' },
  { id: 'bk-2', tenantId: 'demo', bayId: 'bay-2', date: todayStr, startTime: '11:00', endTime: '13:00', durationMinutes: 120, status: 'confirmed', source: 'phone', price: 10000, depositPaid: 2500, isPeakRate: false, customerName: 'Sarah Williams', customerEmail: 'sarah@email.com', partySize: 2, createdAt: '', updatedAt: '' },
  { id: 'bk-3', tenantId: 'demo', bayId: 'bay-3', date: todayStr, startTime: '14:00', endTime: '16:00', durationMinutes: 120, status: 'confirmed', source: 'online', price: 9000, depositPaid: 2500, isPeakRate: false, customerName: 'Tom Davis', partySize: 3, createdAt: '', updatedAt: '' },
  { id: 'bk-4', tenantId: 'demo', bayId: 'bay-4', date: todayStr, startTime: '10:00', endTime: '11:00', durationMinutes: 60, status: 'checked_in', source: 'walk_in', price: 4500, depositPaid: 0, isPeakRate: false, customerName: 'Lisa Chen', partySize: 2, createdAt: '', updatedAt: '', tabId: 'tab-2' },
  { id: 'bk-5', tenantId: 'demo', bayId: 'bay-1', date: todayStr, startTime: '13:00', endTime: '15:00', durationMinutes: 120, status: 'pending', source: 'online', price: 10000, depositPaid: 2500, isPeakRate: false, customerName: 'James Brown', partySize: 5, createdAt: '', updatedAt: '' },
  { id: 'bk-6', tenantId: 'demo', bayId: 'bay-5', date: todayStr, startTime: '17:00', endTime: '19:00', durationMinutes: 120, status: 'confirmed', source: 'online', price: 11000, depositPaid: 2500, isPeakRate: true, customerName: 'Corporate Event - Acme Co', partySize: 8, createdAt: '', updatedAt: '' },
  { id: 'bk-7', tenantId: 'demo', bayId: 'bay-6', date: todayStr, startTime: '15:00', endTime: '17:00', durationMinutes: 120, status: 'confirmed', source: 'phone', price: 8000, depositPaid: 2500, isPeakRate: false, customerName: 'Dave Miller', partySize: 4, createdAt: '', updatedAt: '' },
  { id: 'bk-8', tenantId: 'demo', bayId: 'bay-2', date: todayStr, startTime: '15:00', endTime: '17:00', durationMinutes: 120, status: 'confirmed', source: 'online', price: 10000, depositPaid: 2500, isPeakRate: false, customerName: 'Emily Clark', partySize: 3, createdAt: '', updatedAt: '' },
];

const DEMO_CATEGORIES: CategoryType[] = [
  { id: 'cat-1', tenantId: 'demo', name: 'Appetizers', type: 'food', icon: '🍟', sortOrder: 1, active: true, createdAt: '', updatedAt: '' },
  { id: 'cat-2', tenantId: 'demo', name: 'Mains', type: 'food', icon: '🍔', sortOrder: 2, active: true, createdAt: '', updatedAt: '' },
  { id: 'cat-3', tenantId: 'demo', name: 'Craft Beer', type: 'drink', icon: '🍺', sortOrder: 3, active: true, createdAt: '', updatedAt: '' },
  { id: 'cat-4', tenantId: 'demo', name: 'Cocktails', type: 'drink', icon: '🍸', sortOrder: 4, active: true, createdAt: '', updatedAt: '' },
  { id: 'cat-5', tenantId: 'demo', name: 'Wine', type: 'drink', icon: '🍷', sortOrder: 5, active: true, createdAt: '', updatedAt: '' },
  { id: 'cat-6', tenantId: 'demo', name: 'Soft Drinks', type: 'drink', icon: '🥤', sortOrder: 6, active: true, createdAt: '', updatedAt: '' },
  { id: 'cat-7', tenantId: 'demo', name: 'Retail', type: 'retail', icon: '🏌️', sortOrder: 7, active: true, createdAt: '', updatedAt: '' },
];

const DEMO_MENU_ITEMS: MenuItemType[] = [
  { id: 'mi-1', tenantId: 'demo', categoryId: 'cat-1', name: 'Loaded Nachos', price: 1400, modifiers: [{ id: 'm1', name: 'Add Guac', price: 250 }], prepStation: 'kitchen', available: true, sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: 'mi-2', tenantId: 'demo', categoryId: 'cat-1', name: 'Wings (12pc)', price: 1600, modifiers: [{ id: 'm2', name: 'Extra Ranch', price: 100 }], prepStation: 'kitchen', available: true, sortOrder: 2, createdAt: '', updatedAt: '' },
  { id: 'mi-3', tenantId: 'demo', categoryId: 'cat-1', name: 'Pretzel Bites', price: 1100, modifiers: [{ id: 'm3', name: 'Beer Cheese', price: 200 }], prepStation: 'kitchen', available: true, sortOrder: 3, createdAt: '', updatedAt: '' },
  { id: 'mi-4', tenantId: 'demo', categoryId: 'cat-1', name: 'Mozzarella Sticks', price: 1200, modifiers: [], prepStation: 'kitchen', available: true, sortOrder: 4, createdAt: '', updatedAt: '' },
  { id: 'mi-5', tenantId: 'demo', categoryId: 'cat-2', name: 'Classic Burger', price: 1500, modifiers: [{ id: 'm4', name: 'Add Bacon', price: 200 }, { id: 'm5', name: 'Add Cheese', price: 100 }], prepStation: 'kitchen', available: true, sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: 'mi-6', tenantId: 'demo', categoryId: 'cat-2', name: 'Chicken Sandwich', price: 1400, modifiers: [], prepStation: 'kitchen', available: true, sortOrder: 2, createdAt: '', updatedAt: '' },
  { id: 'mi-7', tenantId: 'demo', categoryId: 'cat-2', name: 'Fish & Chips', price: 1700, modifiers: [], prepStation: 'kitchen', available: true, sortOrder: 3, createdAt: '', updatedAt: '' },
  { id: 'mi-8', tenantId: 'demo', categoryId: 'cat-2', name: 'Caesar Wrap', price: 1200, modifiers: [{ id: 'm6', name: 'Grilled Chicken', price: 300 }], prepStation: 'kitchen', available: true, sortOrder: 4, createdAt: '', updatedAt: '' },
  { id: 'mi-9', tenantId: 'demo', categoryId: 'cat-3', name: 'IPA Pint', price: 800, modifiers: [], prepStation: 'bar', available: true, sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: 'mi-10', tenantId: 'demo', categoryId: 'cat-3', name: 'Lager Pint', price: 700, modifiers: [], prepStation: 'bar', available: true, sortOrder: 2, createdAt: '', updatedAt: '' },
  { id: 'mi-11', tenantId: 'demo', categoryId: 'cat-3', name: 'Stout Pint', price: 850, modifiers: [], prepStation: 'bar', available: true, sortOrder: 3, createdAt: '', updatedAt: '' },
  { id: 'mi-12', tenantId: 'demo', categoryId: 'cat-3', name: 'Wheat Beer', price: 750, modifiers: [], prepStation: 'bar', available: true, sortOrder: 4, createdAt: '', updatedAt: '' },
  { id: 'mi-13', tenantId: 'demo', categoryId: 'cat-4', name: 'Old Fashioned', price: 1400, modifiers: [{ id: 'm7', name: 'Top Shelf', price: 400 }], prepStation: 'bar', available: true, sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: 'mi-14', tenantId: 'demo', categoryId: 'cat-4', name: 'Margarita', price: 1200, modifiers: [], prepStation: 'bar', available: true, sortOrder: 2, createdAt: '', updatedAt: '' },
  { id: 'mi-15', tenantId: 'demo', categoryId: 'cat-4', name: 'Moscow Mule', price: 1300, modifiers: [], prepStation: 'bar', available: true, sortOrder: 3, createdAt: '', updatedAt: '' },
  { id: 'mi-16', tenantId: 'demo', categoryId: 'cat-4', name: 'Espresso Martini', price: 1500, modifiers: [], prepStation: 'bar', available: true, sortOrder: 4, createdAt: '', updatedAt: '' },
  { id: 'mi-17', tenantId: 'demo', categoryId: 'cat-5', name: 'House Red', price: 1000, modifiers: [], prepStation: 'bar', available: true, sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: 'mi-18', tenantId: 'demo', categoryId: 'cat-5', name: 'House White', price: 1000, modifiers: [], prepStation: 'bar', available: true, sortOrder: 2, createdAt: '', updatedAt: '' },
  { id: 'mi-19', tenantId: 'demo', categoryId: 'cat-5', name: 'Pinot Noir', price: 1400, modifiers: [], prepStation: 'bar', available: true, sortOrder: 3, createdAt: '', updatedAt: '' },
  { id: 'mi-20', tenantId: 'demo', categoryId: 'cat-6', name: 'Coke', price: 350, modifiers: [], prepStation: 'bar', available: true, sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: 'mi-21', tenantId: 'demo', categoryId: 'cat-6', name: 'Water', price: 0, modifiers: [], prepStation: 'bar', available: true, sortOrder: 2, createdAt: '', updatedAt: '' },
  { id: 'mi-22', tenantId: 'demo', categoryId: 'cat-6', name: 'Red Bull', price: 500, modifiers: [], prepStation: 'bar', available: true, sortOrder: 3, createdAt: '', updatedAt: '' },
  { id: 'mi-23', tenantId: 'demo', categoryId: 'cat-7', name: 'Golf Glove', price: 2500, modifiers: [], prepStation: 'none', available: true, sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: 'mi-24', tenantId: 'demo', categoryId: 'cat-7', name: 'Golf Balls (Sleeve)', price: 1200, modifiers: [], prepStation: 'none', available: true, sortOrder: 2, createdAt: '', updatedAt: '' },
  { id: 'mi-25', tenantId: 'demo', categoryId: 'cat-7', name: 'Logo Hat', price: 3000, modifiers: [], prepStation: 'none', available: true, sortOrder: 3, createdAt: '', updatedAt: '' },
];

const DEMO_EMPLOYEE: Employee = {
  id: 'emp-1', tenantId: 'demo', firstName: 'Alex', lastName: 'Demo',
  email: 'alex@demo.com', role: 'manager', pin: '1234', permissions: [],
  active: true, hireDate: '2025-01-01', createdAt: '', updatedAt: '',
};

const DEMO_TABS: Tab[] = [
  {
    id: 'tab-1', tenantId: 'demo', bayId: 'bay-1', bookingId: 'bk-1', customerId: 'cust-1',
    customerName: 'Mike Johnson', employeeId: 'emp-1', status: 'open',
    items: [
      { id: 'ti-1', menuItemId: 'mi-9', name: 'IPA Pint', quantity: 2, unitPrice: 800, modifiers: [], modifierTotal: 0, discountAmount: 0, taxAmount: 102, total: 1702, category: 'Craft Beer', addedAt: '', addedBy: 'emp-1' },
      { id: 'ti-2', menuItemId: 'mi-1', name: 'Loaded Nachos', quantity: 1, unitPrice: 1400, modifiers: [{ name: 'Add Guac', price: 250 }], modifierTotal: 250, discountAmount: 0, taxAmount: 105, total: 1755, category: 'Appetizers', addedAt: '', addedBy: 'emp-1' },
      { id: 'ti-5', menuItemId: 'mi-5', name: 'Classic Burger', quantity: 2, unitPrice: 1500, modifiers: [{ name: 'Add Bacon', price: 200 }], modifierTotal: 200, discountAmount: 0, taxAmount: 216, total: 3616, category: 'Mains', addedAt: '', addedBy: 'emp-1' },
    ],
    subtotal: 6650, discountTotal: 0, taxTotal: 423, tipAmount: 0, total: 7073,
    openedAt: new Date().toISOString(), createdAt: '', updatedAt: '',
  },
  {
    id: 'tab-2', tenantId: 'demo', bayId: 'bay-4', bookingId: 'bk-4', customerId: 'cust-2',
    customerName: 'Lisa Chen', employeeId: 'emp-1', status: 'open',
    items: [
      { id: 'ti-3', menuItemId: 'mi-13', name: 'Old Fashioned', quantity: 1, unitPrice: 1400, modifiers: [{ name: 'Top Shelf', price: 400 }], modifierTotal: 400, discountAmount: 0, taxAmount: 114, total: 1914, category: 'Cocktails', addedAt: '', addedBy: 'emp-1' },
      { id: 'ti-4', menuItemId: 'mi-3', name: 'Pretzel Bites', quantity: 1, unitPrice: 1100, modifiers: [], modifierTotal: 0, discountAmount: 0, taxAmount: 70, total: 1170, category: 'Appetizers', addedAt: '', addedBy: 'emp-1' },
    ],
    subtotal: 2900, discountTotal: 0, taxTotal: 184, tipAmount: 0, total: 3084,
    openedAt: new Date().toISOString(), createdAt: '', updatedAt: '',
  },
];

// ── POS Command Center ──────────────────────────────────────────────────────

export default function POSDashboardPage() {
  const [currentEmployee] = useState<Employee>(DEMO_EMPLOYEE);
  const [isLocked, setIsLocked] = useState(false);
  const [view, setView] = useState<POSView>('floor');
  const [selectedBayId, setSelectedBayId] = useState<string | null>('bay-1');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-1');
  const [tabs, setTabs] = useState<Tab[]>(DEMO_TABS);
  const [bookings, setBookings] = useState<Booking[]>(DEMO_BOOKINGS);

  const [showCheckout, setShowCheckout] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);

  const selectedBay = DEMO_BAYS.find((b) => b.id === selectedBayId) ?? null;

  const activeTab = useMemo(() => {
    if (!selectedBayId) return null;
    return tabs.find((t) => t.bayId === selectedBayId && t.status === 'open') ?? null;
  }, [selectedBayId, tabs]);

  const filteredMenuItems = useMemo(() => {
    return DEMO_MENU_ITEMS.filter((item) => item.categoryId === selectedCategoryId && item.available);
  }, [selectedCategoryId]);

  const bayNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const b of DEMO_BAYS) map[b.id] = b.name;
    return map;
  }, []);

  // ── Tab item management ───────────────────────────────────────────────

  const addItemToTab = useCallback(
    (menuItem: MenuItemType) => {
      if (!activeTab) return;
      const taxRate = 0.0635;
      const newItem: TabItem = {
        id: shortId(), menuItemId: menuItem.id, name: menuItem.name,
        quantity: 1, unitPrice: menuItem.price, modifiers: [], modifierTotal: 0,
        discountAmount: 0, taxAmount: Math.round(menuItem.price * taxRate),
        total: menuItem.price + Math.round(menuItem.price * taxRate),
        category: DEMO_CATEGORIES.find((c) => c.id === menuItem.categoryId)?.name ?? '',
        addedAt: new Date().toISOString(), addedBy: currentEmployee.id,
      };
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== activeTab.id) return tab;
          const existingIdx = tab.items.findIndex((i) => i.menuItemId === menuItem.id && i.modifiers.length === 0);
          let newItems: TabItem[];
          if (existingIdx >= 0) {
            newItems = tab.items.map((item, idx) => {
              if (idx !== existingIdx) return item;
              const qty = item.quantity + 1;
              const total = (item.unitPrice + item.modifierTotal) * qty;
              const tax = Math.round(total * taxRate);
              return { ...item, quantity: qty, taxAmount: tax, total: total + tax - item.discountAmount * qty };
            });
          } else {
            newItems = [...tab.items, newItem];
          }
          let subtotal = 0, discountTotal = 0, taxTotal = 0;
          for (const item of newItems) {
            subtotal += (item.unitPrice + item.modifierTotal) * item.quantity;
            discountTotal += item.discountAmount;
            taxTotal += item.taxAmount;
          }
          return { ...tab, items: newItems, subtotal, discountTotal, taxTotal, total: subtotal - discountTotal + taxTotal };
        })
      );
    },
    [activeTab, currentEmployee.id]
  );

  const removeItemFromTab = useCallback(
    (itemId: string) => {
      if (!activeTab) return;
      const taxRate = 0.0635;
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== activeTab.id) return tab;
          const newItems = tab.items.filter((i) => i.id !== itemId);
          let subtotal = 0, discountTotal = 0, taxTotal = 0;
          for (const item of newItems) {
            subtotal += (item.unitPrice + item.modifierTotal) * item.quantity;
            discountTotal += item.discountAmount;
            taxTotal += Math.round(((item.unitPrice + item.modifierTotal) * item.quantity - item.discountAmount) * taxRate);
          }
          return { ...tab, items: newItems, subtotal, discountTotal, taxTotal, total: subtotal - discountTotal + taxTotal };
        })
      );
    },
    [activeTab]
  );

  // ── Booking actions ───────────────────────────────────────────────────

  const handleCheckIn = useCallback(
    (bookingId: string) => {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          const newTabId = shortId();
          const newTab: Tab = {
            id: newTabId, tenantId: 'demo', bayId: b.bayId, bookingId: b.id,
            customerName: b.customerName, employeeId: currentEmployee.id, status: 'open',
            items: [], subtotal: 0, discountTotal: 0, taxTotal: 0, tipAmount: 0, total: 0,
            openedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          };
          setTabs((t) => [...t, newTab]);
          return { ...b, status: 'checked_in' as const, tabId: newTabId, checkedInAt: new Date().toISOString() };
        })
      );
      setShowCheckIn(false);
    },
    [currentEmployee.id]
  );

  const handleWalkIn = useCallback(
    (booking: Booking) => {
      const newTabId = shortId();
      const newTab: Tab = {
        id: newTabId, tenantId: 'demo', bayId: booking.bayId, bookingId: booking.id,
        customerName: booking.customerName, employeeId: currentEmployee.id, status: 'open',
        items: [], subtotal: 0, discountTotal: 0, taxTotal: 0, tipAmount: 0, total: 0,
        openedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      setBookings((prev) => [...prev, { ...booking, tabId: newTabId }]);
      setTabs((prev) => [...prev, newTab]);
      setSelectedBayId(booking.bayId);
      setShowWalkIn(false);
    },
    [currentEmployee.id]
  );

  const handleEndSession = useCallback((booking: Booking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: 'completed' as const } : b))
    );
  }, []);

  const handleExtendTime = useCallback((booking: Booking) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== booking.id) return b;
        const [h, m] = b.endTime.split(':').map(Number);
        const end = new Date();
        end.setHours(h!, m! + 30, 0, 0);
        const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
        return { ...b, endTime, durationMinutes: b.durationMinutes + 30 };
      })
    );
  }, []);

  // ── Lock screen ─────────────────────────────────────────────────────────

  if (isLocked) {
    return <PinLockScreen onUnlock={() => setIsLocked(false)} venueName="Tee Sync Demo" />;
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden select-none">
      {/* Top Bar */}
      <POSTopBar employee={currentEmployee} venueName="Tee Sync Demo" onLock={() => setIsLocked(true)} />

      {/* Navigation + Quick Actions */}
      <div className="h-12 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-1">
          <ViewTab icon={<LayoutGrid className="w-4 h-4" />} label="Floor" active={view === 'floor'} onClick={() => setView('floor')} />
          <ViewTab icon={<UtensilsCrossed className="w-4 h-4" />} label="Order" active={view === 'order'} onClick={() => setView('order')} />
          <ViewTab icon={<CalendarDays className="w-4 h-4" />} label="Schedule" active={view === 'schedule'} onClick={() => setView('schedule')} />
        </div>
        <div className="flex items-center gap-2">
          <ActionButton icon={<UserPlus className="w-3.5 h-3.5" />} label="Walk-In" onClick={() => setShowWalkIn(true)} accent />
          <ActionButton icon={<ClipboardCheck className="w-3.5 h-3.5" />} label="Check In" onClick={() => setShowCheckIn(true)} />
          <ActionButton icon={<ShoppingBag className="w-3.5 h-3.5" />} label="Quick Sale" onClick={() => setShowQuickSale(true)} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {view === 'floor' && (
          <>
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <FloorView bays={DEMO_BAYS} bookings={bookings} tabs={tabs} selectedBayId={selectedBayId} onSelectBay={setSelectedBayId} />
            </div>
            <div className="w-[420px] border-l border-zinc-800 flex flex-col overflow-hidden bg-zinc-950">
              {selectedBay ? (
                <BayDetailPanel
                  bay={selectedBay} bookings={bookings} tab={activeTab}
                  onCheckIn={(booking) => handleCheckIn(booking.id)}
                  onStartWalkIn={() => setShowWalkIn(true)}
                  onEndSession={handleEndSession}
                  onExtendTime={handleExtendTime}
                  onOpenTab={() => {
                    if (activeTab) return;
                    const newTab: Tab = {
                      id: shortId(), tenantId: 'demo', bayId: selectedBayId!,
                      customerName: 'Guest', employeeId: currentEmployee.id, status: 'open',
                      items: [], subtotal: 0, discountTotal: 0, taxTotal: 0, tipAmount: 0, total: 0,
                      openedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
                    };
                    setTabs((prev) => [...prev, newTab]);
                  }}
                  onTransferBay={() => {}}
                  onViewTab={() => setView('order')}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600">
                  <p className="text-sm">Select a bay to view details</p>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'order' && (
          <>
            <div className="w-64 border-r border-zinc-800 flex flex-col overflow-hidden">
              <TeeSheet bays={DEMO_BAYS} bookings={bookings} selectedBayId={selectedBayId} onSelectBay={setSelectedBayId} />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <ActiveTab tab={activeTab} bayName={selectedBay?.name ?? ''} onRemoveItem={removeItemFromTab} onCheckout={() => setShowCheckout(true)} />
            </div>
            <div className="w-96 border-l border-zinc-800 flex flex-col overflow-hidden">
              <MenuGrid categories={DEMO_CATEGORIES} items={filteredMenuItems} selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} onAddItem={addItemToTab} disabled={!activeTab} />
            </div>
          </>
        )}

        {view === 'schedule' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScheduleGrid bays={DEMO_BAYS} bookings={bookings} />
          </div>
        )}
      </div>

      {/* Bottom: Open Tabs */}
      <OpenTabs
        tabs={tabs} bays={DEMO_BAYS} selectedTabId={activeTab?.id ?? null}
        onSelectTab={(tabId) => {
          const tab = tabs.find((t) => t.id === tabId);
          if (tab?.bayId) { setSelectedBayId(tab.bayId); if (view === 'floor') setView('order'); }
        }}
      />

      {/* Dialogs */}
      {showCheckout && activeTab && (
        <CheckoutDialog tab={activeTab} items={activeTab.items} taxRate={0.0635}
          onClose={() => setShowCheckout(false)}
          onComplete={() => {
            setShowCheckout(false);
            setTabs((prev) => prev.map((t) => t.id === activeTab.id ? { ...t, status: 'closed' as const, closedAt: new Date().toISOString() } : t));
          }}
        />
      )}
      {showWalkIn && <WalkInDialog bays={DEMO_BAYS} selectedBayId={selectedBayId} onClose={() => setShowWalkIn(false)} onConfirm={handleWalkIn} />}
      {showCheckIn && <CheckInDialog bookings={bookings} bayNames={bayNames} onClose={() => setShowCheckIn(false)} onCheckIn={handleCheckIn} />}
      {showQuickSale && <QuickSaleDialog categories={DEMO_CATEGORIES} menuItems={DEMO_MENU_ITEMS} taxRate={0.0635} onClose={() => setShowQuickSale(false)} onComplete={() => setShowQuickSale(false)} />}
    </div>
  );
}

// ── Inline sub-components ─────────────────────────────────────────────────────

function ViewTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      active ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border border-transparent'
    )}>
      {icon}<span>{label}</span>
    </button>
  );
}

function ActionButton({ icon, label, onClick, accent }: { icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button onClick={onClick} className={cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
      accent ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
    )}>
      {icon}<span>{label}</span>
    </button>
  );
}

// ── Schedule Grid ─────────────────────────────────────────────────────────────

function ScheduleGrid({ bays, bookings }: { bays: Bay[]; bookings: Booking[] }) {
  const today = new Date().toISOString().split('T')[0]!;
  const hours = Array.from({ length: 15 }, (_, i) => i + 9);
  const todayBookings = bookings.filter((b) => b.date === today);

  function getBookingAt(bayId: string, hour: number): Booking | null {
    return todayBookings.find((b) => {
      if (b.bayId !== bayId) return false;
      const startH = parseInt(b.startTime.split(':')[0]!);
      const endH = parseInt(b.endTime.split(':')[0]!);
      return hour >= startH && hour < endH;
    }) ?? null;
  }

  function isBookingStart(bayId: string, hour: number): boolean {
    const booking = getBookingAt(bayId, hour);
    if (!booking) return false;
    return hour === parseInt(booking.startTime.split(':')[0]!);
  }

  function getBookingSpan(booking: Booking): number {
    return parseInt(booking.endTime.split(':')[0]!) - parseInt(booking.startTime.split(':')[0]!);
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    confirmed: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    checked_in: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    completed: 'bg-zinc-700/30 border-zinc-600/30 text-zinc-500',
    cancelled: 'bg-red-500/10 border-red-500/20 text-red-400/50',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Today&apos;s Schedule</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <div className="flex sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800">
            <div className="w-20 shrink-0 px-3 py-2 text-xs text-zinc-600 font-medium">Time</div>
            {bays.map((bay) => (
              <div key={bay.id} className="flex-1 px-3 py-2 text-xs text-zinc-400 font-medium text-center border-l border-zinc-800/50">
                {bay.name}
                {bay.simulator && <span className="block text-[9px] text-zinc-600">{bay.simulator}</span>}
              </div>
            ))}
          </div>
          {hours.map((hour) => {
            const isPast = hour < new Date().getHours();
            const isCurrent = hour === new Date().getHours();
            return (
              <div key={hour} className={cn('flex border-b border-zinc-800/30', isCurrent && 'bg-zinc-800/20', isPast && 'opacity-60')}>
                <div className="w-20 shrink-0 px-3 py-3 text-xs text-zinc-600 font-mono tabular-nums">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  {isCurrent && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 animate-pulse" />}
                </div>
                {bays.map((bay) => {
                  const booking = getBookingAt(bay.id, hour);
                  const isStart = booking && isBookingStart(bay.id, hour);
                  return (
                    <div key={bay.id} className="flex-1 px-1 py-1 border-l border-zinc-800/30 relative min-h-[48px]">
                      {isStart && booking && (
                        <div
                          className={cn('absolute inset-x-1 rounded-lg border px-2 py-1.5 z-10 overflow-hidden', STATUS_COLORS[booking.status] ?? 'bg-zinc-800 border-zinc-700')}
                          style={{ height: `${getBookingSpan(booking) * 48 - 4}px` }}
                        >
                          <div className="text-xs font-medium truncate">{booking.customerName}</div>
                          <div className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
                            <span>{booking.partySize} guests</span><span>·</span><span>{booking.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
