// ============================================================================
// Auth Context — manages Firebase Auth state + employee/role info
// Falls back to a demo employee when Firebase is not configured.
// ============================================================================

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { isDemoMode, getFirebaseAuth, getFirebaseDb } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import type { Employee, EmployeeRole } from '@teesync/types';

// ---------------------------------------------------------------------------
// Demo employee returned when no Firebase credentials are present
// ---------------------------------------------------------------------------
const DEMO_EMPLOYEE: Employee = {
  id: 'demo-emp-1',
  tenantId: 'demo-tenant',
  firstName: 'Demo',
  lastName: 'Manager',
  email: 'demo@teesync.app',
  role: 'owner',
  pin: '1234',
  active: true,
  permissions: [],
  createdAt: new Date().toISOString() as never,
};

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  pinAuth: (pin: string, tenantId: string) => Promise<Employee | null>;
  hasPermission: (permission: string) => boolean;
  isRole: (...roles: EmployeeRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(
    isDemoMode ? DEMO_EMPLOYEE : null
  );
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    // In demo mode we already have a mock employee — nothing to subscribe to
    if (isDemoMode) return;

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const db = getFirebaseDb();
          const userDoc = await getDoc(
            doc(db, 'userTenantMap', firebaseUser.uid)
          );
          if (userDoc.exists()) {
            const { tenantId, employeeId } = userDoc.data() as {
              tenantId: string;
              employeeId: string;
            };
            const empDoc = await getDoc(
              doc(db, 'tenants', tenantId, 'employees', employeeId)
            );
            if (empDoc.exists()) {
              setEmployee({ id: empDoc.id, ...empDoc.data() } as Employee);
            }
          }
        } catch (err) {
          console.error('Failed to load employee:', err);
        }
      } else {
        setEmployee(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemoMode) {
      setEmployee(DEMO_EMPLOYEE);
      return;
    }
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      setEmployee(null);
      return;
    }
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    setEmployee(null);
  }, []);

  // PIN-based auth for POS terminals (device already authenticated)
  const pinAuth = useCallback(
    async (pin: string, tenantId: string): Promise<Employee | null> => {
      // Demo mode: accept PIN "1234"
      if (isDemoMode) {
        if (pin === '1234') {
          setEmployee(DEMO_EMPLOYEE);
          return DEMO_EMPLOYEE;
        }
        return null;
      }
      try {
        const db = getFirebaseDb();
        const q = query(
          collection(db, 'tenants', tenantId, 'employees'),
          where('pin', '==', pin),
          where('active', '==', true)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const empDoc = snapshot.docs[0]!;
        const emp = { id: empDoc.id, ...empDoc.data() } as Employee;
        setEmployee(emp);
        return emp;
      } catch (err) {
        console.error('PIN auth failed:', err);
        return null;
      }
    },
    []
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!employee) return false;
      if (employee.role === 'owner') return true; // owners have all permissions
      return employee.permissions.includes(permission as never);
    },
    [employee]
  );

  const isRole = useCallback(
    (...roles: EmployeeRole[]): boolean => {
      if (!employee) return false;
      return roles.includes(employee.role);
    },
    [employee]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        loading,
        signIn,
        signOut,
        pinAuth,
        hasPermission,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
