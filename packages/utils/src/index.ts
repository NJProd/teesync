// ============================================================================
// Tee Sync — Shared Utilities
// ============================================================================

import type { Cents, Time24, ISODate, PeakPricingConfig } from '@teesync/types';

// ── Currency Formatting ────────────────────────────────────────────────────

/** Format cents to display string: 1500 → "$15.00" */
export function formatCurrency(cents: Cents, currency = 'usd'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

/** Parse a dollar string to cents: "$15.00" → 1500, "15" → 1500 */
export function parseCurrency(value: string | number): Cents {
  if (typeof value === 'number') return Math.round(value * 100);
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return Math.round(parseFloat(cleaned) * 100);
}

/** Safely add cents without floating point issues */
export function addCents(...values: Cents[]): Cents {
  return values.reduce((sum, v) => sum + v, 0);
}

// ── Time Utilities ─────────────────────────────────────────────────────────

/** Parse "HH:MM" or "h:MM AM/PM" to minutes since midnight */
export function parseTimeToMinutes(time: string): number {
  // Handle 24h format "HH:MM"
  const match24 = time.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return parseInt(match24[1]!, 10) * 60 + parseInt(match24[2]!, 10);
  }

  // Handle 12h format "h:MM AM/PM"
  const match12 = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1]!, 10);
    const minutes = parseInt(match12[2]!, 10);
    const period = match12[3]!.toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  throw new Error(`Invalid time format: "${time}". Expected "HH:MM" or "h:MM AM/PM"`);
}

/** Convert minutes since midnight to "HH:MM" (24h) */
export function minutesToTime24(minutes: number): Time24 {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** Convert "HH:MM" to display format "h:MM AM/PM" */
export function formatTime12(time: Time24): string {
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr!, 10);
  const m = mStr!;
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

/** Generate time slots between start and end with given interval */
export function generateTimeSlots(
  startTime: Time24,
  endTime: Time24,
  intervalMinutes: number
): Time24[] {
  const slots: Time24[] = [];
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  for (let min = startMin; min < endMin; min += intervalMinutes) {
    slots.push(minutesToTime24(min));
  }
  return slots;
}

/** Check if two time ranges overlap */
export function timesOverlap(
  start1: Time24, end1: Time24,
  start2: Time24, end2: Time24
): boolean {
  const s1 = parseTimeToMinutes(start1);
  const e1 = parseTimeToMinutes(end1);
  const s2 = parseTimeToMinutes(start2);
  const e2 = parseTimeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

/** Calculate duration in minutes between two times */
export function durationMinutes(startTime: Time24, endTime: Time24): number {
  return parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
}

// ── Date Utilities ─────────────────────────────────────────────────────────

/** Get today in ISO format */
export function today(): ISODate {
  return new Date().toISOString().split('T')[0]!;
}

/** Format ISO date to display: "2026-02-27" → "Feb 27, 2026" */
export function formatDate(date: ISODate): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format ISO date to day of week: "2026-02-27" → "Friday" */
export function formatDayOfWeek(date: ISODate): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
}

/** Get day of week number (0=Sunday) from ISO date */
export function getDayOfWeek(date: ISODate): number {
  return new Date(date + 'T00:00:00').getDay();
}

/** Add days to a date */
export function addDays(date: ISODate, days: number): ISODate {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]!;
}

// ── Pricing ────────────────────────────────────────────────────────────────

/** Check if a given date/time falls in a peak pricing window */
export function isPeakTime(
  date: ISODate,
  time: Time24,
  config: PeakPricingConfig
): boolean {
  if (!config.enabled) return false;

  const dayOfWeek = getDayOfWeek(date);
  const timeMinutes = parseTimeToMinutes(time);

  return config.windows.some(window => {
    if (!window.days.includes(dayOfWeek)) return false;
    const windowStart = parseTimeToMinutes(window.startTime);
    const windowEnd = parseTimeToMinutes(window.endTime);
    return timeMinutes >= windowStart && timeMinutes < windowEnd;
  });
}

/** Calculate booking price */
export function calculateBookingPrice(
  hourlyRate: Cents,
  peakHourlyRate: Cents,
  durationMinutes: number,
  isPeak: boolean
): Cents {
  const rate = isPeak ? peakHourlyRate : hourlyRate;
  return Math.round((rate * durationMinutes) / 60);
}

/** Apply membership discount */
export function applyDiscount(
  amount: Cents,
  discountPercent: number
): { discounted: Cents; savings: Cents } {
  const savings = Math.round(amount * (discountPercent / 100));
  return {
    discounted: amount - savings,
    savings,
  };
}

/** Calculate tax */
export function calculateTax(amount: Cents, taxRate: number): Cents {
  return Math.round(amount * taxRate);
}

/** Calculate tab totals from items */
export function calculateTabTotals(
  items: { unitPrice: Cents; modifierTotal: Cents; quantity: number; discountAmount: Cents }[],
  taxRate: number
): { subtotal: Cents; discountTotal: Cents; taxTotal: Cents; total: Cents } {
  let subtotal = 0;
  let discountTotal = 0;

  for (const item of items) {
    subtotal += (item.unitPrice + item.modifierTotal) * item.quantity;
    discountTotal += item.discountAmount;
  }

  const taxableAmount = subtotal - discountTotal;
  const taxTotal = calculateTax(taxableAmount, taxRate);
  const total = taxableAmount + taxTotal;

  return { subtotal, discountTotal, taxTotal, total };
}

// ── Validation ─────────────────────────────────────────────────────────────

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate phone (US format, flexible) */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

/** Format phone for display: "2035551234" → "(203) 555-1234" */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const d = digits.length === 11 ? digits.slice(1) : digits;
  if (d.length !== 10) return phone;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Validate 4-digit PIN */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** Sanitize string input (prevent XSS) */
export function sanitize(input: string): string {
  return input
    .replace(/[<>]/g, '') // strip angle brackets
    .replace(/javascript:/gi, '') // strip JS protocol
    .replace(/on\w+=/gi, '') // strip event handlers
    .trim()
    .slice(0, 1000); // length limit
}

// ── ID Generation ──────────────────────────────────────────────────────────

/** Generate a URL-safe slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Generate a gift card code: "XXXX-XXXX-XXXX" */
export function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1 for readability
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment()}-${segment()}-${segment()}`;
}

/** Generate a receipt number: "TS-20260227-001" format */
export function generateReceiptNumber(date: ISODate, sequence: number): string {
  const dateStr = date.replace(/-/g, '');
  return `TS-${dateStr}-${sequence.toString().padStart(3, '0')}`;
}

/** Generate a short unique ID (for tab items, modifiers, etc.) */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}
