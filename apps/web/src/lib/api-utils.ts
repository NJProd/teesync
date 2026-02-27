// ============================================================================
// Shared API route helpers — auth verification, error handling, tenant scoping
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from './firebase-admin';

export interface AuthenticatedUser {
  uid: string;
  tenantId: string;
  employeeId: string;
  role: string;
}

/**
 * Verify Firebase ID token from Authorization header and resolve tenant + employee.
 * Returns null if auth fails (caller should return 401).
 */
export async function verifyRequest(
  req: NextRequest,
  requiredTenantId?: string
): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;

    // Look up user → tenant mapping
    const db = getAdminDb();
    const mapSnap = await db.collection('userTenantMap').doc(uid).get();
    if (!mapSnap.exists) return null;

    const mapData = mapSnap.data()!;
    const tenantId = mapData.tenantId as string;
    const employeeId = mapData.employeeId as string;

    // If a specific tenant is required, enforce it
    if (requiredTenantId && tenantId !== requiredTenantId) return null;

    // Fetch employee role
    const empSnap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('employees')
      .doc(employeeId)
      .get();

    const role = empSnap.exists ? (empSnap.data()!.role as string) : 'staff';

    return { uid, tenantId, employeeId, role };
  } catch {
    return null;
  }
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Get tenant-scoped collection reference.
 */
export function tenantCollection(tenantId: string, collectionName: string) {
  return getAdminDb().collection('tenants').doc(tenantId).collection(collectionName);
}
