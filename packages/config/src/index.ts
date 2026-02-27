// ============================================================================
// Tee Sync — Tenant Configuration & Feature Gating
// ============================================================================

import type {
  TenantSettings,
  SubscriptionTier,
  Feature,
  TIER_FEATURES,
  TIER_LIMITS,
  OperatingHours,
  PeakPricingConfig,
  BrandingConfig,
} from '@teesync/types';

export { TIER_FEATURES, TIER_LIMITS } from '@teesync/types';

// ── Default Tenant Settings ────────────────────────────────────────────────

export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday:    { open: '10:00', close: '22:00' },
  tuesday:   { open: '10:00', close: '22:00' },
  wednesday: { open: '10:00', close: '22:00' },
  thursday:  { open: '10:00', close: '23:00' },
  friday:    { open: '10:00', close: '00:00' },
  saturday:  { open: '09:00', close: '00:00' },
  sunday:    { open: '09:00', close: '21:00' },
};

export const DEFAULT_PEAK_PRICING: PeakPricingConfig = {
  enabled: true,
  multiplier: 1.25,
  windows: [
    { days: [1, 2, 3, 4], startTime: '17:00', endTime: '22:00' }, // Mon–Thu 5pm–10pm
    { days: [5], startTime: '17:00', endTime: '00:00' },           // Fri 5pm–midnight
    { days: [0, 6], startTime: '09:00', endTime: '00:00' },        // Sat–Sun all day
  ],
};

export const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#059669',   // emerald-600
  secondaryColor: '#064e3b', // emerald-900
  accentColor: '#10b981',    // emerald-500
  darkMode: true,
  fontFamily: undefined,
};

export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  operatingHours: DEFAULT_OPERATING_HOURS,
  taxRate: 0.0635, // 6.35% (CT default)
  tipEnabled: true,
  tipPresets: [15, 18, 20, 25],
  peakPricing: DEFAULT_PEAK_PRICING,
  bookingBufferMinutes: 15,
  slotDurationMinutes: 60,
  requireDeposit: true,
  depositAmount: 2500, // $25.00
  autoOpenTabOnCheckIn: true,
  receiptConfig: {
    headerText: '',
    footerText: 'Thank you for visiting!',
    showLogo: true,
    showTipLine: true,
  },
  branding: DEFAULT_BRANDING,
};

// ── SaaS Pricing ───────────────────────────────────────────────────────────

export const SAAS_PRICING = {
  starter: {
    name: 'Starter',
    monthlyPrice: 4900,  // $49/mo
    annualPrice: 47000,  // $470/yr (save ~20%)
    description: 'Perfect for small venues getting started',
    features: [
      'Bay booking & tee sheet',
      'Full POS system',
      'Customer database',
      'Up to 4 bays',
      '1 payment terminal',
      'Basic reporting',
      'Email support',
    ],
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 14900, // $149/mo
    annualPrice: 143000, // $1,430/yr
    description: 'For established venues ready to grow',
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
      'API access',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 39900, // $399/mo
    annualPrice: 383000, // $3,830/yr
    description: 'Multi-location venues & franchises',
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
  },
} as const;

// ── Feature Gating Helpers ─────────────────────────────────────────────────

import { TIER_FEATURES as TF } from '@teesync/types';

/** Check if a tier includes a specific feature */
export function hasFeature(tier: SubscriptionTier, feature: Feature): boolean {
  return TF[tier].includes(feature);
}

/** Get all features for a tier */
export function getTierFeatures(tier: SubscriptionTier): Feature[] {
  return [...TF[tier]];
}

/** Check if a tier is at or above a minimum tier */
export function isAtLeastTier(
  current: SubscriptionTier,
  minimum: SubscriptionTier
): boolean {
  const order: SubscriptionTier[] = ['starter', 'professional', 'enterprise'];
  return order.indexOf(current) >= order.indexOf(minimum);
}

// ── Default Menu Categories (seeded on tenant creation) ────────────────────

export const DEFAULT_MENU_CATEGORIES = [
  { name: 'Appetizers', type: 'food' as const, icon: '🍟', sortOrder: 1 },
  { name: 'Mains', type: 'food' as const, icon: '🍔', sortOrder: 2 },
  { name: 'Sides', type: 'food' as const, icon: '🥗', sortOrder: 3 },
  { name: 'Desserts', type: 'food' as const, icon: '🍰', sortOrder: 4 },
  { name: 'Craft Beer', type: 'drink' as const, icon: '🍺', sortOrder: 5 },
  { name: 'Cocktails', type: 'drink' as const, icon: '🍸', sortOrder: 6 },
  { name: 'Wine', type: 'drink' as const, icon: '🍷', sortOrder: 7 },
  { name: 'Soft Drinks', type: 'drink' as const, icon: '🥤', sortOrder: 8 },
  { name: 'Retail', type: 'retail' as const, icon: '🏌️', sortOrder: 9 },
  { name: 'Sim Time', type: 'service' as const, icon: '⏱️', sortOrder: 10 },
];

// ── Default Membership Tiers (template for new tenants) ────────────────────

export const DEFAULT_MEMBERSHIP_TIERS = [
  {
    name: 'Basic',
    slug: 'basic',
    monthlyPrice: 4900,  // $49/mo
    annualPrice: 47000,
    benefits: {
      bayDiscountPercent: 10,
      fnbDiscountPercent: 10,
      retailDiscountPercent: 5,
      priorityBooking: false,
      guestPasses: 0,
      unlimitedPlay: false,
      freeHoursPerMonth: 0,
    },
    sortOrder: 1,
  },
  {
    name: 'Premium',
    slug: 'premium',
    monthlyPrice: 9900,  // $99/mo
    annualPrice: 95000,
    benefits: {
      bayDiscountPercent: 20,
      fnbDiscountPercent: 15,
      retailDiscountPercent: 10,
      priorityBooking: true,
      guestPasses: 2,
      unlimitedPlay: false,
      freeHoursPerMonth: 4,
    },
    sortOrder: 2,
  },
  {
    name: 'VIP',
    slug: 'vip',
    monthlyPrice: 19900,  // $199/mo
    annualPrice: 191000,
    benefits: {
      bayDiscountPercent: 100,
      fnbDiscountPercent: 20,
      retailDiscountPercent: 15,
      priorityBooking: true,
      guestPasses: 4,
      unlimitedPlay: true,
      freeHoursPerMonth: 999,
    },
    sortOrder: 3,
  },
];
