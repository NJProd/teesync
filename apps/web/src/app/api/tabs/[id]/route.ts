// /api/tabs/[id] — GET / PATCH a single tab (add items, close, etc.)
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

// GET /api/tabs/[id]?tenantId=xxx
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tenantId = new URL(req.url).searchParams.get('tenantId');
    if (!tenantId) return badRequest('tenantId required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    const snap = await tenantCollection(tenantId, 'tabs').doc(id).get();
    if (!snap.exists) return notFound('Tab not found');

    return success({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error('GET /api/tabs/[id] error:', err);
    return serverError();
  }
}

// PATCH /api/tabs/[id] — Update tab (add/remove items, close tab, apply discount)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tenantId, action, ...payload } = body;

    if (!tenantId) return badRequest('tenantId required');

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    const ref = tenantCollection(tenantId, 'tabs').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound('Tab not found');

    const tab = snap.data()!;

    switch (action) {
      case 'addItem': {
        const { menuItemId, name, unitPrice, quantity, category, modifiers = [], notes } = payload;
        if (!name || unitPrice == null) return badRequest('name and unitPrice required');

        const modifierTotal = modifiers.reduce(
          (sum: number, m: { price: number }) => sum + m.price,
          0
        );
        const itemTotal = (unitPrice + modifierTotal) * (quantity ?? 1);

        const newItem = {
          id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          menuItemId: menuItemId ?? null,
          name,
          quantity: quantity ?? 1,
          unitPrice,
          modifiers,
          modifierTotal,
          discountAmount: 0,
          taxAmount: 0,
          total: itemTotal,
          category: category ?? 'general',
          notes: notes ?? '',
          addedAt: new Date().toISOString(),
          addedBy: user.employeeId,
        };

        const updatedItems = [...tab.items, newItem];
        const subtotal = updatedItems.reduce(
          (sum: number, i: { total: number }) => sum + i.total,
          0
        );

        await ref.update({
          items: updatedItems,
          subtotal,
          total: subtotal - (tab.discountTotal ?? 0) + (tab.taxTotal ?? 0),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return success({ item: newItem, subtotal });
      }

      case 'removeItem': {
        const { itemId } = payload;
        if (!itemId) return badRequest('itemId required');

        const updatedItems = tab.items.filter(
          (i: { id: string }) => i.id !== itemId
        );
        const subtotal = updatedItems.reduce(
          (sum: number, i: { total: number }) => sum + i.total,
          0
        );

        await ref.update({
          items: updatedItems,
          subtotal,
          total: subtotal - (tab.discountTotal ?? 0) + (tab.taxTotal ?? 0),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return success({ subtotal });
      }

      case 'close': {
        const { tipAmount = 0, paymentMethod = 'card' } = payload;

        await ref.update({
          status: 'closed',
          tipAmount,
          total: tab.subtotal - (tab.discountTotal ?? 0) + (tab.taxTotal ?? 0) + tipAmount,
          closedAt: new Date().toISOString(),
          closedBy: user.employeeId,
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Create a transaction record
        await tenantCollection(tenantId, 'transactions').add({
          tenantId,
          tabId: id,
          bayId: tab.bayId ?? null,
          customerId: tab.customerId ?? null,
          employeeId: user.employeeId,
          type: 'sale',
          status: 'completed',
          subtotal: tab.subtotal,
          discountTotal: tab.discountTotal ?? 0,
          taxTotal: tab.taxTotal ?? 0,
          tipAmount,
          total: tab.subtotal - (tab.discountTotal ?? 0) + (tab.taxTotal ?? 0) + tipAmount,
          payments: [{
            method: paymentMethod,
            amount: tab.subtotal - (tab.discountTotal ?? 0) + (tab.taxTotal ?? 0) + tipAmount,
            processedAt: new Date().toISOString(),
          }],
          items: tab.items,
          createdAt: FieldValue.serverTimestamp(),
        });

        return success({ status: 'closed' });
      }

      case 'applyDiscount': {
        const { discountTotal } = payload;
        if (discountTotal == null) return badRequest('discountTotal required');

        await ref.update({
          discountTotal,
          total: (tab.subtotal ?? 0) - discountTotal + (tab.taxTotal ?? 0),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return success({ discountTotal });
      }

      default:
        return badRequest(`Unknown action: ${action}`);
    }
  } catch (err) {
    console.error('PATCH /api/tabs/[id] error:', err);
    return serverError();
  }
}
