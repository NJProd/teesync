'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SAAS_PRICING } from '@teesync/config';
import { formatCurrency } from '@teesync/utils';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Store,
  User,
  CreditCard,
  Zap,
  Shield,
  Star,
} from 'lucide-react';

type OnboardingStep = 'plan' | 'venue' | 'account' | 'setup' | 'done';

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('plan');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [venueData, setVenueData] = useState({
    name: '',
    slug: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    bayCount: '4',
  });
  const [accountData, setAccountData] = useState({
    ownerName: '',
    email: '',
    password: '',
  });
  const [creating, setCreating] = useState(false);

  const handleSlugify = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setVenueData((p) => ({ ...p, name, slug }));
  };

  const handleCreate = async () => {
    setCreating(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2500));
    setCreating(false);
    setStep('done');
  };

  const plans = [
    { id: 'starter' as const, ...SAAS_PRICING.starter, icon: Zap, popular: false },
    { id: 'professional' as const, ...SAAS_PRICING.professional, icon: Star, popular: true },
    { id: 'enterprise' as const, ...SAAS_PRICING.enterprise, icon: Shield, popular: false },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="text-white font-bold">Tee Sync</span>
          </div>
          <p className="text-sm text-zinc-500">
            Step {['plan', 'venue', 'account', 'setup', 'done'].indexOf(step) + 1} of 5
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{
            width: `${((['plan', 'venue', 'account', 'setup', 'done'].indexOf(step) + 1) / 5) * 100}%`,
          }}
        />
      </div>

      <main className="flex-1 flex items-start justify-center p-4 pt-8">
        <div className="w-full max-w-3xl">
          {/* Step 1: Plan selection */}
          {step === 'plan' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white">Choose Your Plan</h1>
                <p className="text-zinc-500 mt-2">Start with a 14-day free trial. No credit card required.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-6 rounded-2xl border text-left transition-all ${
                        selectedPlan === plan.id
                          ? 'bg-emerald-600/10 border-emerald-500/40 ring-1 ring-emerald-500/20'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {plan.popular && (
                        <Badge variant="success" className="mb-3">Most Popular</Badge>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${selectedPlan === plan.id ? 'text-emerald-400' : 'text-zinc-500'}`} />
                        <h3 className="text-white font-bold capitalize">{plan.id}</h3>
                      </div>
                      <p className="text-3xl font-bold text-white">
                        {formatCurrency(plan.monthlyPrice)}
                        <span className="text-sm text-zinc-500 font-normal">/mo</span>
                      </p>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="text-sm text-zinc-400 flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Button onClick={() => setStep('venue')} className="px-8 h-12">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Venue details */}
          {step === 'venue' && (
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Tell Us About Your Venue</h1>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500">Venue Name *</label>
                    <Input
                      value={venueData.name}
                      onChange={(e) => handleSlugify(e.target.value)}
                      placeholder="Top Golf Lounge"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500">URL Slug</label>
                    <div className="flex items-center gap-0 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                      <span className="text-xs text-zinc-500 px-3 whitespace-nowrap">teesync.app/venue/</span>
                      <input
                        value={venueData.slug}
                        onChange={(e) => setVenueData((p) => ({ ...p, slug: e.target.value }))}
                        className="flex-1 bg-transparent text-white text-sm px-1 py-2 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500">Address</label>
                    <Input
                      value={venueData.address}
                      onChange={(e) => setVenueData((p) => ({ ...p, address: e.target.value }))}
                      placeholder="123 Golf Lane"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-500">City</label>
                      <Input value={venueData.city} onChange={(e) => setVenueData((p) => ({ ...p, city: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-500">State</label>
                      <Input value={venueData.state} onChange={(e) => setVenueData((p) => ({ ...p, state: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-500">ZIP</label>
                      <Input value={venueData.zip} onChange={(e) => setVenueData((p) => ({ ...p, zip: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-500">Phone</label>
                      <Input value={venueData.phone} onChange={(e) => setVenueData((p) => ({ ...p, phone: e.target.value }))} placeholder="(555) 123-4567" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-500">Number of Bays/Sims</label>
                      <Input type="number" min="1" max="20" value={venueData.bayCount} onChange={(e) => setVenueData((p) => ({ ...p, bayCount: e.target.value }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep('plan')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={() => setStep('account')} disabled={!venueData.name}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Account creation */}
          {step === 'account' && (
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500">Your Name *</label>
                    <Input
                      value={accountData.ownerName}
                      onChange={(e) => setAccountData((p) => ({ ...p, ownerName: e.target.value }))}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500">Email *</label>
                    <Input
                      type="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="john@venue.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500">Password *</label>
                    <Input
                      type="password"
                      value={accountData.password}
                      onChange={(e) => setAccountData((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Min 8 characters"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep('venue')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={() => setStep('setup')}
                  disabled={!accountData.ownerName || !accountData.email || accountData.password.length < 8}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Create */}
          {step === 'setup' && (
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Review & Launch</h1>
                <p className="text-sm text-zinc-500 mt-1">14-day free trial, cancel anytime</p>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Plan</span>
                    <span className="text-white capitalize font-medium">{selectedPlan} – {formatCurrency(SAAS_PRICING[selectedPlan].monthlyPrice)}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Venue</span>
                    <span className="text-white">{venueData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">URL</span>
                    <span className="text-emerald-400">teesync.app/venue/{venueData.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Bays</span>
                    <span className="text-white">{venueData.bayCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Owner</span>
                    <span className="text-white">{accountData.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Email</span>
                    <span className="text-white">{accountData.email}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep('account')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleCreate} disabled={creating} variant="success" className="px-8">
                  {creating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating venue…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Launch Venue
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="text-center space-y-6 max-w-lg mx-auto py-12">
              <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">You&apos;re All Set!</h1>
              <p className="text-zinc-400">
                {venueData.name} is live. Your 14-day free trial has started. 
                Explore the POS, set up your menu, and start booking.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={`/venue/${venueData.slug}/pos`}>
                  <Button variant="success" className="px-8 h-12 w-full">Open POS Dashboard</Button>
                </a>
                <a href={`/venue/${venueData.slug}/admin`}>
                  <Button variant="outline" className="px-8 h-12 w-full">Go to Admin Panel</Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
