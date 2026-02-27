import Link from 'next/link';
import {
  Monitor,
  Utensils,
  Users,
  CreditCard,
  BarChart3,
  Shield,
  ChevronRight,
  Check,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Tee Sync</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/venue/demo/login" className="hover:text-white transition-colors">Demo</Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Now accepting early access venues
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">
            Run your entire venue.
            <br />
            <span className="text-emerald-400">One system.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Tee Sync is the all-in-one platform for indoor golf simulator venues.
            Booking, POS, food &amp; drink, memberships, customers — everything your
            staff needs on one screen.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              Start Free Trial
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/venue/demo/pos"
              className="px-8 py-4 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-800 transition-colors font-medium text-lg"
            >
              View Live Demo
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Placeholder */}
        <div className="mt-20 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl">
          <div className="rounded-xl bg-zinc-950 overflow-hidden aspect-[16/9] flex items-center justify-center">
            <div className="text-center text-zinc-600">
              <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Dashboard Preview</p>
              <p className="text-sm mt-1">Navigate to /venue/demo/pos to see the live POS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-800">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Everything your venue needs
        </h2>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-16">
          From the moment a customer books a bay, to ordering drinks at their sim,
          to checking out — Tee Sync handles it all.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Monitor,
              title: 'Bay Booking & Tee Sheet',
              desc: 'Visual tee sheet with real-time availability. Online booking with deposits. Peak pricing, waitlist, automated reminders.',
            },
            {
              icon: Utensils,
              title: 'Full POS & F&B',
              desc: 'Menu management, tabs per bay, kitchen/bar order routing, Stripe Terminal payments, cash drawer management.',
            },
            {
              icon: Users,
              title: 'Customer Database',
              desc: 'Rich profiles with visit history, spend tracking, membership status. Auto-create on first booking.',
            },
            {
              icon: CreditCard,
              title: 'Memberships & Gift Cards',
              desc: 'Configurable tiers with auto-discounts at POS. Gift card sales and redemption. Recurring billing via Stripe.',
            },
            {
              icon: BarChart3,
              title: 'Reporting & Analytics',
              desc: 'Daily sales, bay utilization, top items, employee performance, customer insights. Export to CSV.',
            },
            {
              icon: Shield,
              title: 'Multi-Tenant SaaS',
              desc: 'Each venue gets their own isolated instance. White-label branding. Role-based access. Audit logging.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-800">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-16">
          14-day free trial on all plans. No setup fees. Cancel anytime.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: 'Starter',
              price: 49,
              desc: 'For small venues getting started',
              features: [
                'Bay booking & tee sheet',
                'Full POS system',
                'Customer database',
                'Up to 4 bays',
                '1 payment terminal',
                'Basic reporting',
                'Email support',
              ],
              cta: 'Start Free Trial',
              popular: false,
            },
            {
              name: 'Professional',
              price: 149,
              desc: 'For established venues ready to grow',
              features: [
                'Everything in Starter',
                'Memberships & subscriptions',
                'Gift cards',
                'Inventory management',
                'Leagues & tournaments',
                'Kitchen display system',
                'Advanced reporting',
                'Unlimited bays',
                'Up to 3 terminals',
                'Priority support',
              ],
              cta: 'Start Free Trial',
              popular: true,
            },
            {
              name: 'Enterprise',
              price: 399,
              desc: 'Multi-location & franchises',
              features: [
                'Everything in Professional',
                'QR code ordering',
                'White-label branding',
                'Multi-location support',
                'Custom integrations',
                'Unlimited terminals',
                'Dedicated onboarding',
                'Phone support',
              ],
              cta: 'Contact Sales',
              popular: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 flex flex-col ${
                plan.popular
                  ? 'border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/20'
                  : 'border-zinc-800 bg-zinc-900'
              }`}
            >
              {plan.popular && (
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-sm text-zinc-400 mt-1">{plan.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-8 block text-center py-3 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Tee Sync</span>
          </div>
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Tee Sync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
