// ============================================================================
// Tee Sync — Core Domain Types
// Single source of truth for all entities in the system
// ============================================================================

// ── Base Types ──────────────────────────────────────────────────────────────

/** Firestore document with auto-generated fields */
export interface BaseDocument {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** All entities are scoped to a tenant */
export interface TenantScoped {
  tenantId: string;
}

/** Monetary values stored as cents (integer) to avoid floating point */
export type Cents = number;

/** Time in 24h format "HH:MM" */
export type Time24 = string;

/** Date in ISO format "YYYY-MM-DD" */
export type ISODate = string;

// ── Tenant ──────────────────────────────────────────────────────────────────

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'suspended';
export type VenueType = 'simulator' | 'course' | 'multisport';

export interface Tenant extends BaseDocument {
  slug: string; // URL-safe identifier, e.g. "golf-cove"
  name: string;
  venueType: VenueType;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  timezone: string; // e.g. "America/New_York"
  currency: string; // e.g. "usd"
  logo?: string;
  subscription: TenantSubscription;
  stripe: TenantStripe;
  settings: TenantSettings;
  onboardingComplete: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface TenantSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  trialEnd?: string;
}

export interface TenantStripe {
  connectedAccountId?: string; // Stripe Connect account
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export interface TenantSettings {
  operatingHours: OperatingHours;
  taxRate: number; // e.g. 0.0635 for 6.35%
  tipEnabled: boolean;
  tipPresets: number[]; // e.g. [15, 18, 20, 25]
  peakPricing: PeakPricingConfig;
  bookingBufferMinutes: number; // cleanup time between bookings
  slotDurationMinutes: number; // 30 or 60 typically
  requireDeposit: boolean;
  depositAmount: Cents; // flat deposit in cents
  autoOpenTabOnCheckIn: boolean;
  receiptConfig: ReceiptConfig;
  branding: BrandingConfig;
}

export interface OperatingHours {
  [day: string]: { open: Time24; close: Time24; closed?: boolean };
  // "monday" through "sunday"
}

export interface PeakPricingConfig {
  enabled: boolean;
  multiplier: number; // e.g. 1.25
  windows: PeakWindow[];
}

export interface PeakWindow {
  days: number[]; // 0=Sunday, 1=Monday, etc.
  startTime: Time24;
  endTime: Time24;
}

export interface ReceiptConfig {
  headerText: string;
  footerText: string;
  showLogo: boolean;
  showTipLine: boolean;
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily?: string;
  darkMode: boolean;
}

// ── Bay / Simulator ─────────────────────────────────────────────────────────

export type BayType = 'simulator' | 'putting' | 'lounge' | 'table' | 'other';
export type BayStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

export interface Bay extends BaseDocument, TenantScoped {
  name: string; // "Bay 1", "TrackMan Suite", etc.
  type: BayType;
  sortOrder: number;
  hourlyRate: Cents;
  peakHourlyRate: Cents;
  maxOccupancy: number;
  simulator?: string; // "TrackMan", "Full Swing", "Golfzon", etc.
  features: string[]; // "Lounge Seating", "Private Room", etc.
  active: boolean;
}

// ── Booking ─────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'      // created, awaiting payment/confirmation
  | 'confirmed'    // payment received or manually confirmed
  | 'checked_in'   // customer arrived, tab opened
  | 'completed'    // session finished
  | 'cancelled'    // cancelled by customer or staff
  | 'no_show';     // customer didn't show up

export type BookingSource = 'online' | 'pos' | 'phone' | 'walk_in';

export interface Booking extends BaseDocument, TenantScoped {
  bayId: string;
  customerId?: string;
  tabId?: string; // linked when checked in
  date: ISODate;
  startTime: Time24;
  endTime: Time24;
  durationMinutes: number;
  status: BookingStatus;
  source: BookingSource;
  price: Cents;
  depositPaid: Cents;
  isPeakRate: boolean;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  partySize: number;
  notes?: string;
  stripePaymentIntentId?: string;
  checkedInAt?: string;
  checkedInBy?: string; // employeeId
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

// ── Tab ─────────────────────────────────────────────────────────────────────

export type TabStatus = 'open' | 'closed' | 'voided';

export interface Tab extends BaseDocument, TenantScoped {
  bayId?: string;
  bookingId?: string;
  customerId?: string;
  customerName: string;
  employeeId: string; // who opened it
  status: TabStatus;
  items: TabItem[];
  subtotal: Cents;
  discountTotal: Cents;
  taxTotal: Cents;
  tipAmount: Cents;
  total: Cents;
  membershipDiscountApplied?: {
    tier: string;
    percentage: number;
  };
  notes?: string;
  openedAt: string;
  closedAt?: string;
  closedBy?: string;
}

export interface TabItem {
  id: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  unitPrice: Cents;
  modifiers: TabItemModifier[];
  modifierTotal: Cents;
  discountAmount: Cents;
  taxAmount: Cents;
  total: Cents; // (unitPrice + modifierTotal) * quantity - discountAmount + taxAmount
  category: string;
  notes?: string;
  orderId?: string;
  addedAt: string;
  addedBy: string; // employeeId
}

export interface TabItemModifier {
  name: string;
  price: Cents;
}

// ── Order (Kitchen/Bar) ────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PrepStation = 'kitchen' | 'bar' | 'none';

export interface Order extends BaseDocument, TenantScoped {
  tabId: string;
  bayId?: string;
  items: OrderItem[];
  status: OrderStatus;
  prepStation: PrepStation;
  employeeId: string; // who placed the order
  notes?: string;
  estimatedMinutes?: number;
  preparedAt?: string;
  deliveredAt?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  modifiers: TabItemModifier[];
  notes?: string;
}

// ── Transaction / Payment ──────────────────────────────────────────────────

export type PaymentMethod = 'card' | 'cash' | 'gift_card' | 'house_account' | 'split';
export type TransactionStatus = 'completed' | 'refunded' | 'partial_refund' | 'voided';
export type TransactionType = 'sale' | 'refund' | 'void';

export interface Transaction extends BaseDocument, TenantScoped {
  tabId: string;
  customerId?: string;
  employeeId: string;
  type: TransactionType;
  status: TransactionStatus;
  payments: Payment[];
  subtotal: Cents;
  discountTotal: Cents;
  taxTotal: Cents;
  tipAmount: Cents;
  total: Cents;
  refundedAmount: Cents;
  stripePaymentIntentId?: string;
  receiptNumber: string;
  shiftId: string;
}

export interface Payment {
  method: PaymentMethod;
  amount: Cents;
  stripePaymentIntentId?: string;
  giftCardId?: string;
  cashTendered?: Cents;
  changeGiven?: Cents;
  reference?: string;
}

// ── Customer ────────────────────────────────────────────────────────────────

export type MembershipTier = string; // tenant-defined, e.g. "basic", "premium", "vip"

export interface Customer extends BaseDocument, TenantScoped {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: Address;
  stripeCustomerId?: string;
  membership?: CustomerMembership;
  stats: CustomerStats;
  tags: string[];
  notes?: string;
  marketingOptIn: boolean;
  dateOfBirth?: ISODate;
  houseAccountBalance: Cents; // positive = they owe you
  giftCardIds: string[];
}

export interface CustomerMembership {
  membershipId: string;
  tier: MembershipTier;
  status: 'active' | 'expired' | 'cancelled' | 'paused';
  startDate: ISODate;
  renewalDate: ISODate;
  stripeSubscriptionId?: string;
}

export interface CustomerStats {
  totalVisits: number;
  totalSpend: Cents;
  averageSpend: Cents;
  lastVisitDate?: ISODate;
  firstVisitDate?: ISODate;
  loyaltyPoints: number;
}

// ── Membership ──────────────────────────────────────────────────────────────

export interface MembershipTierConfig extends BaseDocument, TenantScoped {
  name: string; // "Basic", "Premium", "VIP"
  slug: string; // "basic", "premium", "vip"
  monthlyPrice: Cents;
  annualPrice: Cents;
  benefits: MembershipBenefits;
  sortOrder: number;
  active: boolean;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
}

export interface MembershipBenefits {
  bayDiscountPercent: number;    // 0-100
  fnbDiscountPercent: number;    // 0-100 (food & beverage)
  retailDiscountPercent: number; // 0-100
  priorityBooking: boolean;
  guestPasses: number;          // per month
  unlimitedPlay: boolean;
  freeHoursPerMonth: number;
}

// ── Menu ────────────────────────────────────────────────────────────────────

export type MenuCategoryType = 'food' | 'drink' | 'retail' | 'service';

export interface MenuCategory extends BaseDocument, TenantScoped {
  name: string;
  type: MenuCategoryType;
  icon?: string;
  sortOrder: number;
  active: boolean;
}

export interface MenuItem extends BaseDocument, TenantScoped {
  categoryId: string;
  name: string;
  description?: string;
  price: Cents;
  taxRate?: number; // override tenant default if set
  image?: string;
  modifiers: MenuModifier[];
  prepStation: PrepStation;
  available: boolean; // false = "86'd"
  sku?: string;
  inventoryItemId?: string; // link to inventory for stock tracking
  sortOrder: number;
  happyHourPrice?: Cents;
}

export interface MenuModifier {
  id: string;
  name: string;
  price: Cents;
}

// ── Inventory ───────────────────────────────────────────────────────────────

export interface InventoryItem extends BaseDocument, TenantScoped {
  menuItemId?: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  costPerUnit: Cents;
  supplier?: string;
  category: string;
  unit: string; // "each", "case", "keg", "bottle", etc.
  lastRestockedAt?: string;
}

export interface PurchaseOrder extends BaseDocument, TenantScoped {
  supplier: string;
  items: PurchaseOrderItem[];
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  totalCost: Cents;
  orderedAt?: string;
  receivedAt?: string;
  receivedBy?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
  costPerUnit: Cents;
}

// ── Gift Card ───────────────────────────────────────────────────────────────

export interface GiftCard extends BaseDocument, TenantScoped {
  code: string; // unique, uppercase alphanumeric
  originalAmount: Cents;
  balance: Cents;
  purchasedBy?: string; // customerId
  recipientEmail?: string;
  recipientName?: string;
  active: boolean;
  expiresAt?: string;
  transactions: GiftCardTransaction[];
}

export interface GiftCardTransaction {
  date: string;
  type: 'purchase' | 'redemption' | 'refund';
  amount: Cents;
  transactionId?: string;
  employeeId?: string;
}

// ── Employee ────────────────────────────────────────────────────────────────

export type EmployeeRole = 'owner' | 'manager' | 'bartender' | 'server' | 'staff';

export interface Employee extends BaseDocument, TenantScoped {
  firebaseUid?: string; // linked Firebase Auth user
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  pin: string; // 4-digit PIN (hashed in production)
  permissions: EmployeePermission[];
  active: boolean;
  hireDate: ISODate;
  hourlyRate?: Cents;
}

export type EmployeePermission =
  | 'pos:ring_sale'
  | 'pos:apply_discount'
  | 'pos:void_item'
  | 'pos:void_transaction'
  | 'pos:open_drawer'
  | 'pos:refund'
  | 'pos:manage_tabs'
  | 'booking:create'
  | 'booking:cancel'
  | 'booking:check_in'
  | 'customer:view'
  | 'customer:edit'
  | 'customer:create'
  | 'menu:edit'
  | 'inventory:manage'
  | 'reports:view'
  | 'reports:export'
  | 'employees:manage'
  | 'settings:manage'
  | 'billing:manage';

// ── Shift / Cash Drawer ────────────────────────────────────────────────────

export type ShiftStatus = 'open' | 'closed';

export interface Shift extends BaseDocument, TenantScoped {
  employeeId: string;
  status: ShiftStatus;
  startedAt: string;
  endedAt?: string;
  startingCash: Cents;
  closingCash?: Cents;
  expectedCash: Cents; // calculated from cash transactions
  variance?: Cents; // closingCash - expectedCash
  cashIn: Cents; // manual cash added (tips, etc.)
  cashOut: Cents; // manual cash removed (paid-outs)
  transactionIds: string[];
  salesTotal: Cents;
  transactionCount: number;
  notes?: string;
}

// ── League ──────────────────────────────────────────────────────────────────

export interface League extends BaseDocument, TenantScoped {
  name: string;
  description?: string;
  startDate: ISODate;
  endDate: ISODate;
  schedule: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number; // 0-6
  startTime: Time24;
  maxTeams: number;
  entryFee: Cents;
  teams: LeagueTeam[];
  status: 'registration' | 'active' | 'completed';
}

export interface LeagueTeam {
  id: string;
  name: string;
  players: LeaguePlayer[];
  wins: number;
  losses: number;
  ties: number;
  points: number;
}

export interface LeaguePlayer {
  customerId: string;
  name: string;
  handicap?: number;
}

// ── Event ───────────────────────────────────────────────────────────────────

export type EventType = 'tournament' | 'private_party' | 'corporate' | 'lesson' | 'other';

export interface VenueEvent extends BaseDocument, TenantScoped {
  name: string;
  type: EventType;
  date: ISODate;
  startTime: Time24;
  endTime: Time24;
  bayIds: string[]; // which bays are reserved
  maxParticipants: number;
  currentParticipants: number;
  deposit: Cents;
  totalPrice: Cents;
  description?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  status: 'inquiry' | 'confirmed' | 'deposit_paid' | 'completed' | 'cancelled';
  stripePaymentIntentId?: string;
  notes?: string;
}

// ── Audit Log ───────────────────────────────────────────────────────────────

export type AuditAction =
  | 'booking:create' | 'booking:cancel' | 'booking:check_in'
  | 'tab:open' | 'tab:close' | 'tab:void' | 'tab:add_item' | 'tab:remove_item'
  | 'order:create' | 'order:status_change'
  | 'transaction:complete' | 'transaction:refund' | 'transaction:void'
  | 'customer:create' | 'customer:update' | 'customer:merge'
  | 'membership:create' | 'membership:cancel' | 'membership:renew'
  | 'shift:open' | 'shift:close'
  | 'inventory:adjust' | 'inventory:restock'
  | 'gift_card:create' | 'gift_card:redeem'
  | 'menu:update' | 'settings:update'
  | 'employee:login' | 'employee:pin_auth';

export interface AuditLogEntry extends BaseDocument, TenantScoped {
  action: AuditAction;
  employeeId?: string;
  employeeName?: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}

// ── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

// ── Dashboard / Aggregation Types ───────────────────────────────────────────

export interface DailySummary {
  date: ISODate;
  totalRevenue: Cents;
  transactionCount: number;
  averageTicket: Cents;
  bayUtilization: number; // 0-1
  customerCount: number;
  newCustomers: number;
  topItems: { name: string; quantity: number; revenue: Cents }[];
  revenueByCategory: { category: string; revenue: Cents }[];
}

export interface BayAvailability {
  bayId: string;
  bayName: string;
  date: ISODate;
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: Time24;
  endTime: Time24;
  available: boolean;
  bookingId?: string;
  price: Cents;
  isPeak: boolean;
}

// ── Feature Flags (SaaS tier gating) ────────────────────────────────────────

export type Feature =
  | 'booking'
  | 'pos'
  | 'customers'
  | 'memberships'
  | 'gift_cards'
  | 'inventory'
  | 'leagues'
  | 'events'
  | 'qr_ordering'
  | 'kitchen_display'
  | 'advanced_reports'
  | 'api_access'
  | 'white_label'
  | 'multi_location';

export const TIER_FEATURES: Record<SubscriptionTier, Feature[]> = {
  starter: ['booking', 'pos', 'customers'],
  professional: [
    'booking', 'pos', 'customers',
    'memberships', 'gift_cards', 'inventory',
    'leagues', 'events', 'kitchen_display',
    'advanced_reports', 'api_access',
  ],
  enterprise: [
    'booking', 'pos', 'customers',
    'memberships', 'gift_cards', 'inventory',
    'leagues', 'events', 'kitchen_display',
    'advanced_reports', 'api_access',
    'qr_ordering', 'white_label', 'multi_location',
  ],
};

export const TIER_LIMITS: Record<SubscriptionTier, { maxBays: number; maxTerminals: number; maxEmployees: number }> = {
  starter: { maxBays: 4, maxTerminals: 1, maxEmployees: 10 },
  professional: { maxBays: 50, maxTerminals: 3, maxEmployees: 50 },
  enterprise: { maxBays: 999, maxTerminals: 999, maxEmployees: 999 },
};
