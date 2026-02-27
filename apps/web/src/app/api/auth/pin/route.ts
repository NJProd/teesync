// POST /api/auth/pin — Authenticate via PIN (for POS terminals)
import { NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { success, unauthorized, badRequest, serverError } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const { tenantId, pin } = await req.json();
    if (!tenantId || !pin) return badRequest('tenantId and pin required');

    const db = getAdminDb();
    const empQuery = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('employees')
      .where('pin', '==', pin)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (empQuery.empty) return unauthorized('Invalid PIN');

    const empDoc = empQuery.docs[0]!;
    const employee = empDoc.data();

    return success({
      employeeId: empDoc.id,
      employee: { id: empDoc.id, ...employee },
    });
  } catch {
    return serverError('PIN auth failed');
  }
}
