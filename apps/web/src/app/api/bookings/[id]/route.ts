// /api/bookings/[id] — GET / PATCH / DELETE a single booking
import { NextRequest } from 'next/server';
import {
  verifyRequest,
  unauthorized,
  badRequest,
  notFound,
  success,
  serverError,
  tenantCollection,
} from '@/lib/api-utils';
import { FieldValue } from 'firebase-admin/firestore';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/bookings/[id]?tenantId=xxx
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tenantId = new URL(req.url).searchParams.get('tenantId');
    if (!tenantId) return badRequest('tenantId required');

    const snap = await tenantCollection(tenantId, 'bookings').doc(id).get();
    if (!snap.exists) return notFound('Booking not found');

    return success({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error('GET /api/bookings/[id] error:', err);
    return serverError();
  }
}

// PATCH /api/bookings/[id] — Update booking (status, notes, times, etc.)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tenantId, ...updates } = body;

    if (!tenantId) return badRequest('tenantId required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    const ref = tenantCollection(tenantId, 'bookings').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound('Booking not found');

    // Whitelist updatable fields
    const allowed = [
      'status', 'startTime', 'endTime', 'customerName', 'customerEmail',
      'customerPhone', 'partySize', 'notes', 'depositPaid',
    ];
    const filtered: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in updates) filtered[key] = updates[key];
    }
    filtered.updatedAt = FieldValue.serverTimestamp();

    await ref.update(filtered);

    return success({ id, ...filtered });
  } catch (err) {
    console.error('PATCH /api/bookings/[id] error:', err);
    return serverError();
  }
}

// DELETE /api/bookings/[id] — Cancel/delete booking
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tenantId = new URL(req.url).searchParams.get('tenantId');
    if (!tenantId) return badRequest('tenantId required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    const ref = tenantCollection(tenantId, 'bookings').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound('Booking not found');

    // Soft-delete: set status to cancelled
    await ref.update({
      status: 'cancelled',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return success({ id, status: 'cancelled' });
  } catch (err) {
    console.error('DELETE /api/bookings/[id] error:', err);
    return serverError();
  }
}
