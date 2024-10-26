import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../stripe/config';
import { Readable } from 'stream';

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = getFirestore();

// Remove the deprecated config export and use the new route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const buf = await buffer(req.body as unknown as Readable);
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        // We'll keep this event for any non-subscription related checkout completions
        console.log('Checkout session completed');
        break;
      case 'customer.subscription.created':
        const newSubscription = event.data.object;
        const newSubscriptionUserId = newSubscription.metadata?.userId;
        if (newSubscriptionUserId) {
          const userDoc = adminDb.collection('users').doc(newSubscriptionUserId);
          await userDoc.set({
            role: newSubscription.metadata?.role,
            stripeId: newSubscription.customer,
            subscriptionId: newSubscription.id,
            subscriptionStatus: newSubscription.status,
            subscriptionExpires: newSubscription.current_period_end,
          }, { merge: true });
        } else {
          console.error("User ID is undefined in new subscription event");
        }
        break;
      case 'customer.subscription.updated':
        const updatedSub = event.data.object;
        const previousAttributes = event.data.previous_attributes;
        
        if (previousAttributes?.status === 'trialing' && updatedSub.status === 'active') {
          // Trial successfully converted to paid subscription
          await adminDb.collection('users').doc(updatedSub.metadata?.userId).set({
            subscriptionStatus: 'active',
            trialConverted: true,
            paidSubscriptionStart: new Date(updatedSub.current_period_start * 1000),
          }, { merge: true });
        }
        break;
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        const subscriptionUserId = subscription.metadata?.userId;
        if (subscriptionUserId) {
          const userDoc = adminDb.collection('users').doc(subscriptionUserId);
          await userDoc.set({
            subscriptionStatus: subscription.status,
            subscriptionExpires: subscription.current_period_end,
          }, { merge: true });
        } else {
          console.error("User ID is undefined in subscription event");
        }
        break;
      case 'customer.subscription.trial_will_end':
        const trialEndingSub = event.data.object;
        const trialEndingUserId = trialEndingSub.metadata?.userId;
        
        if (trialEndingUserId) {
          // Send notification that trial is ending soon
          await adminDb.collection('notifications').add({
            userId: trialEndingUserId,
            type: 'trial_ending',
            message: 'Your trial period will end in 3 days',
            createdAt: new Date(),
          });
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An error occurred' },
      { status: 400 }
    );
  }
}
