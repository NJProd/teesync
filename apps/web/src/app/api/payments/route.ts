// /api/payments — Payment processing (Stripe integration)
import { NextRequest } from 'next/server';
import {
  verifyRequest,
  unauthorized,
  badRequest,
  success,
  serverError,
} from '@/lib/api-utils';
import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebase-admin';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

// POST /api/payments — Create a payment intent for a tab
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, tabId, amount, tipAmount = 0 } = body;

    if (!tenantId || !tabId || !amount) {
      return badRequest('tenantId, tabId, and amount required');
    }

    const user = await verifyRequest(req, tenantId);
    if (!user) return unauthorized();

    // Get tenant's Stripe connect account
    const db = getAdminDb();
    const tenantSnap = await db.collection('tenants').doc(tenantId).get();
    if (!tenantSnap.exists) return badRequest('Tenant not found');

    const tenant = tenantSnap.data()!;
    const stripeAccountId = tenant.stripeAccountId;

    const stripe = getStripe();
    const totalAmount = amount + tipAmount;

    // Platform fee: 2.5% of the pre-tip amount
    const platformFee = Math.round(amount * 0.025);

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        tenantId,
        tabId,
        tipAmount: tipAmount.toString(),
      },
    };

    // If venue has connected Stripe account, use Connect
    if (stripeAccountId) {
      paymentIntentParams.application_fee_amount = platformFee;
      paymentIntentParams.transfer_data = {
        destination: stripeAccountId,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return success({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      platformFee,
    });
  } catch (err) {
    console.error('POST /api/payments error:', err);
    return serverError();
  }
}
