// /api/payments/webhook — Stripe webhook handler
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new Response('Missing signature or secret', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const db = getAdminDb();

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { tenantId, tabId, tipAmount } = pi.metadata;

      if (tenantId && tabId) {
        const tabRef = db
          .collection('tenants')
          .doc(tenantId)
          .collection('tabs')
          .doc(tabId);

        await tabRef.update({
          status: 'closed',
          tipAmount: parseInt(tipAmount ?? '0', 10),
          closedAt: new Date().toISOString(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Create transaction record
        const tabSnap = await tabRef.get();
        const tab = tabSnap.data();
        if (tab) {
          await db
            .collection('tenants')
            .doc(tenantId)
            .collection('transactions')
            .add({
              tenantId,
              tabId,
              bayId: tab.bayId ?? null,
              customerId: tab.customerId ?? null,
              employeeId: tab.employeeId,
              type: 'sale',
              status: 'completed',
              subtotal: tab.subtotal,
              discountTotal: tab.discountTotal ?? 0,
              taxTotal: tab.taxTotal ?? 0,
              tipAmount: parseInt(tipAmount ?? '0', 10),
              total: pi.amount,
              payments: [{
                method: 'card',
                amount: pi.amount,
                stripePaymentIntentId: pi.id,
                processedAt: new Date().toISOString(),
              }],
              items: tab.items ?? [],
              stripePaymentIntentId: pi.id,
              createdAt: FieldValue.serverTimestamp(),
            });
        }

        // Update customer visit stats
        if (tab?.customerId) {
          const custRef = db
            .collection('tenants')
            .doc(tenantId)
            .collection('customers')
            .doc(tab.customerId);
          
          await custRef.update({
            totalSpent: FieldValue.increment(pi.amount),
            visitCount: FieldValue.increment(1),
            lastVisit: new Date().toISOString(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.warn('Payment failed:', pi.id, pi.last_payment_error?.message);
      break;
    }

    case 'account.updated': {
      // Stripe Connect: venue account status updated
      const account = event.data.object as Stripe.Account;
      const tenantsQuery = await db
        .collection('tenants')
        .where('stripeAccountId', '==', account.id)
        .limit(1)
        .get();

      if (!tenantsQuery.empty) {
        const tenantDoc = tenantsQuery.docs[0]!;
        await tenantDoc.ref.update({
          stripeOnboarded: account.charges_enabled && account.payouts_enabled,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return new Response('ok', { status: 200 });
}
