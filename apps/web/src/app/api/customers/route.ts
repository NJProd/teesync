// /api/customers — CRUD for customer database (tenant-scoped)
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

// GET /api/customers?tenantId=xxx&search=john&limit=20
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    if (!tenantId) return badRequest('tenantId required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    let query: FirebaseFirestore.Query = tenantCollection(tenantId, 'customers');

    // Firestore doesn't support full-text search, so we use a prefix match on name
    if (search) {
      const searchLower = search.toLowerCase();
      query = query
        .where('nameLower', '>=', searchLower)
        .where('nameLower', '<=', searchLower + '\uf8ff');
    }

    query = query.orderBy(search ? 'nameLower' : 'lastVisit', search ? 'asc' : 'desc').limit(limit);

    const snap = await query.get();
    const customers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return success({ customers });
  } catch (err) {
    console.error('GET /api/customers error:', err);
    return serverError();
  }
}

// POST /api/customers — Create a new customer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, name, email, phone } = body;

    if (!tenantId || !name) return badRequest('tenantId and name required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    // Check for duplicate email within the tenant
    if (email) {
      const dup = await tenantCollection(tenantId, 'customers')
        .where('email', '==', email)
        .limit(1)
        .get();
      if (!dup.empty) return badRequest('Customer with this email already exists');
    }

    const customerData = {
      tenantId,
      name,
      nameLower: name.toLowerCase(),
      email: email ?? null,
      phone: phone ?? null,
      notes: body.notes ?? '',
      tags: body.tags ?? [],
      totalSpent: 0,
      visitCount: 0,
      lastVisit: null,
      membershipTier: null,
      membershipExpiry: null,
      giftCardBalance: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const ref = await tenantCollection(tenantId, 'customers').add(customerData);

    return success({ id: ref.id, ...customerData }, 201);
  } catch (err) {
    console.error('POST /api/customers error:', err);
    return serverError();
  }
}
