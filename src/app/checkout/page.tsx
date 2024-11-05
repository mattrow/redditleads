'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Pricing from '@/components/Pricing';
import { Navbar } from '@/components/Navbar';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId,
          metadata: {
            userId: user.uid,
            email: user.email,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      const sessionId = data.sessionId;

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      } else {
        console.error('Stripe.js failed to load.');
      }
    } catch (error) {
      console.error('Error during subscription:', error);
      alert('An error occurred during subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#396afc] to-[#2948ff]">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full">
          <Pricing
            userId={user?.uid || ''}
            userEmail={user?.email || ''}
            onSubscribe={handleSubscribe}
          />
        </div>
      </div>
    </div>
  );
} 