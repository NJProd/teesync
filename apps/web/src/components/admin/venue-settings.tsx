'use client';

import { useState } from 'react';
import { useTenant } from '@/lib/tenant-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Store,
  Clock,
  DollarSign,
  Palette,
  Bell,
  CreditCard,
  Globe,
  Save,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

export function VenueSettings() {
  const { tenant } = useTenant();

  const [venueInfo, setVenueInfo] = useState({
    name: tenant?.name ?? 'My Venue',
    slug: tenant?.slug ?? 'my-venue',
    address: '123 Golf Lane, Suite 100',
    city: 'Hartford',
    state: 'CT',
    zip: '06103',
    phone: '(860) 555-0100',
    email: 'info@myvenue.com',
    website: 'https://myvenue.com',
  });

  const [hours, setHours] = useState({
    monFri: { open: '09:00', close: '22:00' },
    sat: { open: '08:00', close: '23:00' },
    sun: { open: '10:00', close: '20:00' },
  });

  const [pricing, setPricing] = useState({
    taxRate: '6.35',
    defaultHourlyRate: '50.00',
    peakMultiplier: '1.25',
    peakStart: '17:00',
    peakEnd: '21:00',
    bufferMinutes: '15',
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Venue Settings</h2>
        <p className="text-sm text-zinc-500 mt-1">Configure your venue details and preferences</p>
      </div>

      {/* Venue info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            Venue Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Venue Name</label>
              <Input
                value={venueInfo.name}
                onChange={(e) => setVenueInfo((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">URL Slug</label>
              <Input
                value={venueInfo.slug}
                onChange={(e) => setVenueInfo((p) => ({ ...p, slug: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</label>
            <Input
              value={venueInfo.address}
              onChange={(e) => setVenueInfo((p) => ({ ...p, address: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">City</label>
              <Input value={venueInfo.city} onChange={(e) => setVenueInfo((p) => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">State</label>
              <Input value={venueInfo.state} onChange={(e) => setVenueInfo((p) => ({ ...p, state: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">ZIP</label>
              <Input value={venueInfo.zip} onChange={(e) => setVenueInfo((p) => ({ ...p, zip: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</label>
              <Input value={venueInfo.phone} onChange={(e) => setVenueInfo((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
              <Input value={venueInfo.email} onChange={(e) => setVenueInfo((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500 flex items-center gap-1"><Globe className="w-3 h-3" /> Website</label>
              <Input value={venueInfo.website} onChange={(e) => setVenueInfo((p) => ({ ...p, website: e.target.value }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Mon–Fri', key: 'monFri' as const },
            { label: 'Saturday', key: 'sat' as const },
            { label: 'Sunday', key: 'sun' as const },
          ].map((day) => (
            <div key={day.key} className="flex items-center gap-3">
              <span className="text-sm text-zinc-400 w-20">{day.label}</span>
              <Input
                type="time"
                value={hours[day.key].open}
                onChange={(e) => setHours((p) => ({ ...p, [day.key]: { ...p[day.key], open: e.target.value } }))}
                className="w-32"
              />
              <span className="text-zinc-600">to</span>
              <Input
                type="time"
                value={hours[day.key].close}
                onChange={(e) => setHours((p) => ({ ...p, [day.key]: { ...p[day.key], close: e.target.value } }))}
                className="w-32"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Pricing & Tax
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Tax Rate (%)</label>
              <Input
                value={pricing.taxRate}
                onChange={(e) => setPricing((p) => ({ ...p, taxRate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Default Hourly Rate ($)</label>
              <Input
                value={pricing.defaultHourlyRate}
                onChange={(e) => setPricing((p) => ({ ...p, defaultHourlyRate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Peak Multiplier</label>
              <Input
                value={pricing.peakMultiplier}
                onChange={(e) => setPricing((p) => ({ ...p, peakMultiplier: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Peak Start</label>
              <Input
                type="time"
                value={pricing.peakStart}
                onChange={(e) => setPricing((p) => ({ ...p, peakStart: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Peak End</label>
              <Input
                type="time"
                value={pricing.peakEnd}
                onChange={(e) => setPricing((p) => ({ ...p, peakEnd: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Buffer (min)</label>
              <Input
                value={pricing.bufferMinutes}
                onChange={(e) => setPricing((p) => ({ ...p, bufferMinutes: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">Pro Plan</span>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-sm text-zinc-500 mt-1">$149/month · Renews Feb 1, 2025</p>
            </div>
            <Button variant="outline" size="sm">Manage Plan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button className="px-8">
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
