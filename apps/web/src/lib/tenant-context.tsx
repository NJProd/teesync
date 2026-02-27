// ============================================================================
// Tenant Context — resolves and provides tenant data throughout the app
// Falls back to a demo tenant when Firebase is not configured.
// ============================================================================

'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { isDemoMode, getFirebaseDb } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { Tenant } from '@teesync/types';

// ---------------------------------------------------------------------------
// Demo tenant used when no Firebase credentials are present
// ---------------------------------------------------------------------------
const DEMO_TENANT: Tenant = {
  id: 'demo-tenant',
  name: 'TeeSync Demo Venue',
  slug: 'demo',
  ownerUid: 'demo-owner',
  plan: 'professional',
  status: 'active',
  settings: {
    bayCount: 6,
    openTime: '09:00',
    closeTime: '23:00',
    slotDuration: 60,
    currency: 'USD',
    taxRate: 6.35,
    requireDeposit: true,
    depositAmount: 2500,
    autoConfirmBookings: true,
    timezone: 'America/New_York',
  },
  contact: {
    email: 'demo@teesync.app',
    phone: '(555) 123-4567',
    address: '100 Fairway Drive, Golf City, FL 33101',
  },
  branding: {
    primaryColor: '#10b981',
    logoUrl: '',
  },
  createdAt: new Date().toISOString() as unknown as import('firebase/firestore').Timestamp,
  updatedAt: new Date().toISOString() as unknown as import('firebase/firestore').Timestamp,
};

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
});

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}

export function TenantProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ---- Demo mode: skip Firestore entirely ----
    if (isDemoMode) {
      setTenant({ ...DEMO_TENANT, slug });
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    async function loadTenant() {
      try {
        const db = getFirebaseDb();

        // First, look up tenant ID from slug
        const slugDoc = await getDoc(doc(db, 'tenantSlugs', slug));
        if (!slugDoc.exists()) {
          setError('Venue not found');
          setLoading(false);
          return;
        }

        const tenantId = slugDoc.data().tenantId as string;

        // Subscribe to realtime tenant updates
        unsubscribe = onSnapshot(
          doc(db, 'tenants', tenantId),
          (snapshot) => {
            if (snapshot.exists()) {
              setTenant({ id: snapshot.id, ...snapshot.data() } as Tenant);
              setError(null);
            } else {
              setError('Venue not found');
            }
            setLoading(false);
          },
          (err) => {
            console.error('Tenant subscription error:', err);
            setError('Failed to load venue');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Failed to load tenant:', err);
        setError('Failed to load venue');
        setLoading(false);
      }
    }

    loadTenant();
    return () => unsubscribe?.();
  }, [slug]);

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}
