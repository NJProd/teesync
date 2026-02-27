// /api/customers/[id] — GET / PATCH / DELETE a customer
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

// GET /api/customers/[id]?tenantId=xxx
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tenantId = new URL(req.url).searchParams.get('tenantId');
    if (!tenantId) return badRequest('tenantId required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    const snap = await tenantCollection(tenantId, 'customers').doc(id).get();
    if (!snap.exists) return notFound('Customer not found');

    return success({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error('GET /api/customers/[id] error:', err);
    return serverError();
  }
}

// PATCH /api/customers/[id] — Update customer details
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tenantId, ...updates } = body;

    if (!tenantId) return badRequest('tenantId required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    const ref = tenantCollection(tenantId, 'customers').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound('Customer not found');

    const allowed = [
      'name', 'email', 'phone', 'notes', 'tags',
      'membershipTier', 'membershipExpiry',
    ];
    const filtered: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in updates) {
        filtered[key] = updates[key];
        if (key === 'name') filtered.nameLower = (updates.name as string).toLowerCase();
      }
    }
    filtered.updatedAt = FieldValue.serverTimestamp();

    await ref.update(filtered);

    return success({ id, ...filtered });
  } catch (err) {
    console.error('PATCH /api/customers/[id] error:', err);
    return serverError();
  }
}

// DELETE /api/customers/[id] — Soft-delete (or hard-delete) a customer
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tenantId = new URL(req.url).searchParams.get('tenantId');
    if (!tenantId) return badRequest('tenantId required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    // Only managers+ can delete customers
    if (!['manager', 'owner', 'admin'].includes(user.role)) {
      return unauthorized('Insufficient permissions');
    }

    const ref = tenantCollection(tenantId, 'customers').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound('Customer not found');

    await ref.delete();

    return success({ id, deleted: true });
  } catch (err) {
    console.error('DELETE /api/customers/[id] error:', err);
    return serverError();
  }
}
