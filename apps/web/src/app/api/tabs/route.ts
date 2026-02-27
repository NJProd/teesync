// /api/tabs — CRUD for tabs (tenant-scoped)
import { NextRequest } from 'next/server';
import {
  verifyRequest,
  unauthorized,
  badRequest,
  success,
  serverError,
  tenantCollection,
} from '@/lib/api-utils';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/tabs?tenantId=xxx&status=open
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    if (!tenantId) return badRequest('tenantId required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    let query: FirebaseFirestore.Query = tenantCollection(tenantId, 'tabs');

    if (status) query = query.where('status', '==', status);
    query = query.orderBy('openedAt', 'desc');

    const snap = await query.get();
    const tabs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return success({ tabs });
  } catch (err) {
    console.error('GET /api/tabs error:', err);
    return serverError();
  }
}

// POST /api/tabs — Open a new tab
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, bayId, bookingId, customerId, customerName } = body;

    if (!tenantId || !customerName) return badRequest('tenantId and customerName required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    const tabData = {
      tenantId,
      bayId: bayId ?? null,
      bookingId: bookingId ?? null,
      customerId: customerId ?? null,
      customerName,
      employeeId: user.employeeId,
      status: 'open',
      items: [],
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      tipAmount: 0,
      total: 0,
      notes: body.notes ?? '',
      openedAt: new Date().toISOString(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const ref = await tenantCollection(tenantId, 'tabs').add(tabData);

    return success({ id: ref.id, ...tabData }, 201);
  } catch (err) {
    console.error('POST /api/tabs error:', err);
    return serverError();
  }
}
