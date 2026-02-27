// /api/bookings — CRUD for bookings (tenant-scoped)
import { NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import {
  verifyRequest,
  unauthorized,
  badRequest,
  success,
  serverError,
  tenantCollection,
} from '@/lib/api-utils';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/bookings?tenantId=xxx&date=2025-01-15&bayId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const date = searchParams.get('date');
    const bayId = searchParams.get('bayId');
    const status = searchParams.get('status');

    if (!tenantId) return badRequest('tenantId required');

    let query: FirebaseFirestore.Query = tenantCollection(tenantId, 'bookings');

    if (date) query = query.where('date', '==', date);
    if (bayId) query = query.where('bayId', '==', bayId);
    if (status) query = query.where('status', '==', status);

    query = query.orderBy('startTime', 'asc');

    const snap = await query.get();
    const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return success({ bookings });
  } catch (err) {
    console.error('GET /api/bookings error:', err);
    return serverError();
  }
}

// POST /api/bookings — Create a new booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId,
      bayId,
      date,
      startTime,
      endTime,
      customerName,
      customerEmail,
      customerPhone,
      partySize,
      source = 'walk_in',
    } = body;

    if (!tenantId || !bayId || !date || !startTime || !endTime || !customerName) {
      return badRequest('Missing required fields');
    }

    // For staff-created bookings, verify auth. Public bookings skip auth check.
    if (source !== 'online') {
      const user = await verifyRequest(req, tenantId);
      if (!user) return unauthorized();
    }

    const db = getAdminDb();
    const col = tenantCollection(tenantId, 'bookings');

    // Check for overlapping bookings on the same bay/date
    const existing = await col
      .where('bayId', '==', bayId)
      .where('date', '==', date)
      .where('status', 'in', ['pending', 'confirmed', 'checked_in'])
      .get();

    const overlap = existing.docs.some((d) => {
      const b = d.data();
      return b.startTime < endTime && b.endTime > startTime;
    });

    if (overlap) {
      return badRequest('Bay is already booked for this time slot');
    }

    // Fetch bay for pricing
    const baySnap = await tenantCollection(tenantId, 'bays').doc(bayId).get();
    const bay = baySnap.data();
    const hourlyRate = bay?.hourlyRate ?? 5000; // default $50/hr

    const bookingData = {
      tenantId,
      bayId,
      date,
      startTime,
      endTime,
      customerName,
      customerEmail: customerEmail ?? null,
      customerPhone: customerPhone ?? null,
      partySize: partySize ?? 1,
      status: source === 'online' ? 'pending' : 'confirmed',
      source,
      hourlyRate,
      totalPrice: 0, // calculated by cloud function or here
      depositAmount: 0,
      depositPaid: false,
      notes: body.notes ?? '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await col.add(bookingData);

    return success({ id: docRef.id, ...bookingData }, 201);
  } catch (err) {
    console.error('POST /api/bookings error:', err);
    return serverError();
  }
}
