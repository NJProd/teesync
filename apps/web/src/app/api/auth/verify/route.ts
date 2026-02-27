// POST /api/auth/verify — Verify Firebase ID token and return user + tenant info
import { NextRequest } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { success, unauthorized, serverError } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return unauthorized('No token');

    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const db = getAdminDb();
    const mapSnap = await db.collection('userTenantMap').doc(uid).get();
    if (!mapSnap.exists) return unauthorized('User not linked to a tenant');

    const mapData = mapSnap.data()!;
    const tenantId = mapData.tenantId as string;
    const employeeId = mapData.employeeId as string;

    // Fetch employee profile
    const empSnap = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('employees')
      .doc(employeeId)
      .get();

    if (!empSnap.exists) return unauthorized('Employee not found');

    const employee = empSnap.data()!;
    
    // Fetch tenant info
    const tenantSnap = await db.collection('tenants').doc(tenantId).get();
    const tenant = tenantSnap.exists ? tenantSnap.data() : null;

    return success({
      uid,
      tenantId,
      employeeId,
      employee: { id: employeeId, ...employee },
      tenant: tenant ? { id: tenantId, ...tenant } : null,
    });
  } catch {
    return serverError('Token verification failed');
  }
}
