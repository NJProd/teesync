// /api/menu — CRUD for menu items (tenant-scoped)
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

// GET /api/menu?tenantId=xxx — Public: fetch menu
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    if (!tenantId) return badRequest('tenantId required');

    const [itemsSnap, categoriesSnap] = await Promise.all([
      tenantCollection(tenantId, 'menuItems')
        .where('isAvailable', '==', true)
        .orderBy('sortOrder', 'asc')
        .get(),
      tenantCollection(tenantId, 'menuCategories')
        .orderBy('sortOrder', 'asc')
        .get(),
    ]);

    const items = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const categories = categoriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return success({ items, categories });
  } catch (err) {
    console.error('GET /api/menu error:', err);
    return serverError();
  }
}

// POST /api/menu — Create a menu item (manager+)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, name, price, categoryId, description } = body;

    if (!tenantId || !name || price == null || !categoryId) {
      return badRequest('tenantId, name, price, categoryId required');
    }

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();
    if (!['manager', 'owner', 'admin'].includes(user.role)) {
      return unauthorized('Manager+ required');
    }

    const itemData = {
      tenantId,
      name,
      description: description ?? '',
      price,
      categoryId,
      prepStation: body.prepStation ?? 'none',
      modifierGroups: body.modifierGroups ?? [],
      isAvailable: body.isAvailable ?? true,
      sortOrder: body.sortOrder ?? 0,
      tags: body.tags ?? [],
      imageUrl: body.imageUrl ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const ref = await tenantCollection(tenantId, 'menuItems').add(itemData);

    return success({ id: ref.id, ...itemData }, 201);
  } catch (err) {
    console.error('POST /api/menu error:', err);
    return serverError();
  }
}
